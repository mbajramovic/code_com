const express = require('express');
const router = express.Router();
const Sequelize = require('sequelize');
const htmlencode = require('htmlencode').htmlEncode;
const sequelize = require('../../client/src/base/baza.js');
const multer = require('multer');
var upload = multer({ dest: 'uploads/' });
const fs = require('fs');
var parse = require('csv-parse');
var brisanjeUcesnika = require('./BrisanjeUcesnika.js');
const Odgovori = require('../ServerOdgovori.js');
const Sesija = require('../PomocneRute/Sesija.js');
const {Ucesnici, UcesniciTakmicarskeGrupe, Lokacija, Korisnici} = sequelize.import('../../client/src/base/models/Models.js');

router.post('/', upload.single('file'), function(req, res) {
    var korisnik = {korisnickoIme : req.body.korisnickoIme, token : req.body.token};
    if(req.session.rola == 'admin_takmicenja' && Sesija.isOK(korisnik)) {
        var takmicarskeGrupeId = req.body.takmicarskaGrupaId;
        let i = 0, j = 0;
        brisanjeUcesnika.brisiPoTakmicarskojGrupi(takmicarskeGrupeId)
        .then(obrisano => {
            fs.createReadStream('uploads/' + req.file.filename)
            .pipe(parse({delimiter : ','}))
            .on('data', function(ucesnik) {
    
                var lokacija = {'drzava' : '', 'kanton' : '', 'opcina' : '', 'grad' : '', 'skola' : ucesnik[4]};
                Lokacija.dodajNovuLokaciju(lokacija, htmlencode, function(s, d)  {
                    if (s) {

                            let korIme = ucesnik[0];// broj > 8 ? 'ucesnik' + (broj + i++ + 1) : 'ucesnik0' + (broj +i++ + 1);
                            let lozinka = ucesnik[1];// Math.random().toString(36).slice(2) + broj + 1;
                            i++;
                            Korisnici.dodajNovogKorisnika(korIme, lozinka, function(success, data) {
                                if (success) {
                                    var _ucesnik = {'ime' : ucesnik[2], 'prezime' : ucesnik[3], 'maticniBroj' : ''};
                                    Ucesnici.dodajNovogUcesnika(_ucesnik, d.id, data.id, htmlencode, function(_success, _data) {
                                        if(!_success) {
                                            console.log(_data);
                                            res.end(JSON.stringify(Odgovori.SERVER_ERROR));
                                        }
                                        else { 
                                            UcesniciTakmicarskeGrupe.novaVeza(_data.id, takmicarskeGrupeId, function(__success, __data) {
                                                if (!__success) {
                                                    console.log(__data);
                                                    res.end(JSON.stringify(Odgovori.SERVER_ERROR));
                                                }
                                                else {
                                                    j++;
                                                }
                                                if (i == j)
                                                    res.end(JSON.stringify({
                                                        'success' : 'yes'
                                                    }));
                                            });
                                        }
                                    });
                                }
                                else  {
                                    console.log(data);
                                    res.end(JSON.stringify(Odgovori.SERVER_ERROR));
                                }
                            });
                    }
                })
            })
            .on('error', function(error) {
                res.end(JSON.stringify(Odgovori.CSV_ERROR));
            })
            .on('end', function() {
            
            });
        });
        /*loginPodaci(takmicarskeGrupeId)
        .then(broj => {
            fs.createReadStream('uploads/' + req.file.filename)
            .pipe(parse({delimiter : ','}))
            .on('data', function(ucesnik) {
    
                var lokacija = {'drzava' : '', 'kanton' : '', 'opcina' : '', 'grad' : '', 'skola' : ucesnik[2]};
                Lokacija.dodajNovuLokaciju(lokacija, htmlencode, function(s, d)  {
                    if (s) {

                            let korIme = broj > 8 ? 'ucesnik' + (broj + i++ + 1) : 'ucesnik0' + (broj +i++ + 1);
                            let lozinka = Math.random().toString(36).slice(2) + broj + 1;
                            Korisnici.dodajNovogKorisnika(korIme, lozinka, function(success, data) {
                                if (success) {
                                    var _ucesnik = {'ime' : ucesnik[0], 'prezime' : ucesnik[1], 'maticniBroj' : ''};
                                    Ucesnici.dodajNovogUcesnika(_ucesnik, d.id, data.id, htmlencode, function(_success, _data) {
                                        if(!_success) {
                                            console.log(_data);
                                            res.end(JSON.stringify(Odgovori.SERVER_ERROR));
                                        }
                                        else { 
                                            UcesniciTakmicarskeGrupe.novaVeza(_data.id, takmicarskeGrupeId, function(__success, __data) {
                                                if (!__success) {
                                                    console.log(__data);
                                                    res.end(JSON.stringify(Odgovori.SERVER_ERROR));
                                                }
                                                else {
                                                    j++;
                                                }
                                                if (i == j)
                                                    res.end(JSON.stringify({
                                                        'success' : 'yes'
                                                    }));
                                            });
                                        }
                                    });
                                }
                                else  {
                                    console.log(data);
                                    res.end(JSON.stringify(Odgovori.SERVER_ERROR));
                                }
                            });
                    }
                })
            })
            .on('error', function(error) {
                res.end(JSON.stringify(Odgovori.CSV_ERROR));
            })
            .on('end', function() {
            
            });
        })*/
       
    }
    else
        res.end(JSON.stringify(Odgovori.UNAUTHORIZED));
});


function loginPodaci(takGrupa) {
    return new Promise(function(resolve, reject) {
        setTimeout(() => {
            UcesniciTakmicarskeGrupe.findAll({
                where : {
                    takmicarskeGrupeId : takGrupa
                }
            })
            .then(ucesnici => {
                resolve(ucesnici.length);
            });
        }, 1000);
    })
}

module.exports = router;
