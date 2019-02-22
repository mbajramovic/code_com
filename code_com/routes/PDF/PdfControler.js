const PDFDocument = require('pdfkit');
const fs = require('fs');
const Sequelize = require('sequelize');
const sequelize = require('../../client/src/base/baza.js');

const Odgovori = require('../ServerOdgovori.js');
const Sesija = require('../PomocneRute/Sesija.js');
const {Zadaci, TakmicarskeGrupe, Takmicenja, Ucesnici, UcesniciTakmicarskeGrupe, Korisnici} = sequelize.import('../../client/src/base/models/Models');

//var content = '';

module.exports = { 
    zadaci : function(req, res) {
        var korisnik = {korisnickoIme : req.body.korisnickoIme, token : req.body.token};
        if(req.session.rola == 'admin_takmicenja' && Sesija.isOK(korisnik)) {
            const doc = new PDFDocument();
            var takmGrupaId = req.body.takmicarskaGrupaId;
            var content = '';
            Zadaci.findAll({
                where : {
                    takmicarskeGrupeId : takmGrupaId
                },

                order : [
                    ['redniBroj', 'ASC']
                ]
            })
            .then(zadaci => {
                TakmicarskeGrupe.findOne({
                    include : [
                        {model : Takmicenja, as : 'takmicenja', attributes : ['pocetak', 'naziv']}
                    ],
                    where : {
                        id : takmGrupaId
                    }
                })
                .then(rezultat => {
                    var takmicenje = rezultat.takmicenja.dataValues;
                    content += takmicenje.pocetak + "\n" + takmicenje.naziv + "\n\n\n";
                    let i = 0;
                    zadaci.forEach(zadatak => {
                        //jos urediti 
                        content += "Zadatak "  + zadatak.redniBroj + ".\nNaslov: " + zadatak.naslov + '\nTekst: ' + zadatak.tekst + '\n\nUlaz: ' + zadatak.ulaz + '\nOcekivani izlaz: ' + zadatak.izlaz + '\n\n\n\n'; 
                        if (zadatak.redniBroj == zadaci.length) {
                            var filename = 'Zadaci.pdf';
                            doc.pipe(fs.createWriteStream(filename));
                            res.setHeader('Content-disposition', 'inline; filename="' + filename + '"');
                            res.setHeader('Content-type', 'application/pdf');
                            doc.y = 300;
                            doc.text(content, 50, 50);
                            doc.pipe(res);
                            doc.end();
                        }
                    }); 
                })
            })
            .catch(error => {
                doc.end();
            });
        }
        else
            res.end(JSON.stringify(Odgovori.UNAUTHORIZED));
    },

    ucesnici : function(req, res) {
        var korisnik = {korisnickoIme : req.body.korisnickoIme, token : req.body.token};
        if(req.session.rola == 'admin_takmicenja' && Sesija.isOK(korisnik)) {
            const doc = new PDFDocument();
            var takmGrupaId = req.body.takmicarskaGrupaId;
            var content = '';
            UcesniciTakmicarskeGrupe.findAll({
                where : {
                    takmicarskeGrupeId : takmGrupaId
                }
            })
            .then(ucesnici => {
                var ucesniciIDs = [];
                for (let i = 0; i < ucesnici.length; i++)
                    ucesniciIDs.push(ucesnici[i].ucesniciId);
                Ucesnici.findAll({
                    include : [
                        {model : Korisnici, as : 'korisnici', attributes : ['korisnickoIme', 'lozinka']}
                    ],
                    where : {
                        id : ucesniciIDs
                    }
                })
                .then(_ucesnici => {
                    for (let i = 0; i < _ucesnici.length; i++) {
                        let ucesnik = _ucesnici[i];
                        content += 'Korisnicko ime: ' + ucesnik.korisnici.korisnickoIme + "     Lozinka: " + ucesnik.korisnici.lozinka + "\n\n";
                        if (i == ucesnici.length - 1) {
                            var filename = "Ucesnici.pdf";
                            doc.pipe(fs.createWriteStream(filename));
                            res.setHeader('Content-disposition', 'inline; filename="' + filename + '"');
                            res.setHeader('Content-type', 'application/pdf');
                            doc.y = 300;
                            doc.text(content, 50, 50);
                            doc.pipe(res);
                            doc.end();
                        }
                    }
                })
                .catch(error => {
                    res.end(JSON.stringify(Odgovori.SERVER_ERROR));
                });
            })
            .catch(error => {
                res.end(JSON.stringify(Odgovori.SERVER_ERROR));
            });
        }
        else
            res.end(JSON.stringify(Odgovori.UNAUTHORIZED));
    }
}