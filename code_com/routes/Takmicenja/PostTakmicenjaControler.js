const Sequelize = require('sequelize');
const sequelize = require('../../client/src/base/baza.js');

const Odgovori = require('../ServerOdgovori.js');
const Sesija = require('../PomocneRute/Sesija.js');
const { Takmicenja, TakmicarskeGrupe, AdminiTakmicenja } = sequelize.import('../../client/src/base/models/Models.js');

module.exports = {
    novoTakmicenje : function(req, res) {
        var takmicenje = req.body.takmicenje;
        var korisnik = {korisnickoIme : req.body.korisnickoIme, token : req.body.token};
        if (req.session.rola == 'administrator' && Sesija.isOK(korisnik))  { // takmicenja moze dodavati samo administrator
            Takmicenja.create({
                naziv : takmicenje.naziv,
                pocetak : takmicenje.datumPocetka,
                kraj : takmicenje.datumZavrsetka,
                opis : takmicenje.opis,
                aktivno : false,
                trajanje : null,
                programskiJezik : takmicenje.programskiJezik,
                tipDatoteke : takmicenje.tipDatoteke
            })
            .then(function(dodanoTakmicenje) {
                for (let i = 0; i < takmicenje.takmicarskeGrupe.length; i++) {
                    TakmicarskeGrupe.create({
                        naziv : (takmicenje.takmicarskeGrupe[i].naziv),
                        brojTakmicara : takmicenje.takmicarskeGrupe[i].brojTakmicara,
                        brojZadataka : takmicenje.takmicarskeGrupe[i].brojZadataka,
                        takmicenjaId : dodanoTakmicenje.id
                    })
                    .catch(function(error) {
                        console.log(error);
                        res.end(JSON.stringify(Odgovori.SERVER_ERROR));
                    });

                    if (i == takmicenje.takmicarskeGrupe.length - 1) {
                        if (takmicenje.clanoviKomisije.length == 0)
                            res.end(JSON.stringify({
                                'success' : 'yes'
                            }));
                        for (let j = 0; j < takmicenje.clanoviKomisije.length; j++) {
                            AdminiTakmicenja.create({
                                takmicenjaId : dodanoTakmicenje.id,
                                adminiZaTakmicenjaId : takmicenje.clanoviKomisije[j]
                            })
                            .catch(function(error) {
                                console.log(error);
                                res.end(JSON.stringify(Odgovori.SERVER_ERROR));
                            });
        
                            if ( j == takmicenje.clanoviKomisije.length - 1) {
                                res.end(JSON.stringify({
                                    'success' : 'yes'
                                }));
                            }
                        }
        
                    }
                }

            })
            .catch(function(error) {
                console.log(error);
                res.end(JSON.stringify(Odgovori.SERVER_ERROR));
            });
        }
    
        else {
            res.end(JSON.stringify(Odgovori.UNAUTHORIZED));
        }
    },
 
    updateTakmicenje : function(req, res) {
        var takmicenje = req.body.takmicenje;
        var grupe = req.body.grupe;
        var admini = req.body.admini;
        var korisnik = {korisnickoIme : req.body.korisnickoIme, token : req.body.token};
        if(req.session.rola == 'administrator' && Sesija.isOK(korisnik)) {
            Takmicenja.update(
                {
                    pocetak : takmicenje.pocetak,
                    kraj : takmicenje.kraj,
                    naziv : takmicenje.naziv,
                    opis : takmicenje.opis,
                    programskiJezik : takmicenje.programskiJezik,
                    tipDatoteke : takmicenje.tipDatoteke
                },
                {
                    where : {
                        id : takmicenje.id
                    }
                }
            )
            .then(updated => {
                for (let j = 0; j < admini.length; j++) {
                    AdminiTakmicenja.findOne({
                        where : {
                            takmicenjaId : takmicenje.id,
                            adminiZaTakmicenjaId : admini[j]
                        }
                    })
                    .then(adminTakmicenje => {
                        if (adminTakmicenje == null) {
                            AdminiTakmicenja.create({
                                takmicenjaId : takmicenje.id,
                                adminiZaTakmicenjaId : admini[j]
                            })
                            .then(created => {
                                if (j == admini.length - 1) {
                                    AdminiTakmicenja.findAll({
                                        where : {
                                            takmicenjaId : takmicenje.id
                                        },
                                        attributes : ['adminiZaTakmicenjaId']
                                    })
                                    .then(adminiZaTakmicenja => {
                                        //if (adminiZaTakmicenja.length > admini.length) 
                                            let adminiZaTakmicenje = [];
                                            for (var ii = 0; ii < adminiZaTakmicenja.length; ii++)
                                                adminiZaTakmicenje.push(adminiZaTakmicenja[ii].adminiZaTakmicenjaId);
                                            for (let ii = 0; ii < adminiZaTakmicenje.length; ii++) {
                                                if (!admini.includes(adminiZaTakmicenje[ii])) {
                                                    AdminiTakmicenja.destroy({
                                                        where : {
                                                            takmicenjaId : takmicenje.id,
                                                            adminiZaTakmicenjaId : adminiZaTakmicenje[ii]
                                                        }
                                                    });
                                                }
                                                if (ii == adminiZaTakmicenje.length - 1) {
                                                    for (let i = 0; i < grupe.length; i++) {
                                                        if (grupe[i].id == null) {
                                                            TakmicarskeGrupe.create({
                                                                naziv : grupe[i].naziv,
                                                                brojTakmicara : grupe[i].brojTakmicara,
                                                                brojZadataka : grupe[i].brojZadataka,
                                                                takmicenjaId : takmicenje.id
                                                            })
                                                            .then(grupa => {
                                                                if (i == grupe.length - 1)
                                                                    res.end(JSON.stringify({
                                                                        'success' : 'yes'
                                                                    }));
                                                            })
                                                            .catch(error => {
                                                                console.log(error);
                                                                res.end(JSON.stringify(Odgovori.SERVER_ERROR));
                                                            });
                                                        }
                                                        else {
                                                            TakmicarskeGrupe.update(
                                                                {
                                                                    naziv : grupe[i].naziv,
                                                                    brojTakmicara : grupe[i].brojTakmicara,
                                                                    brojZadataka : grupe[i].brojZadataka
                                                                },
                                                                {
                                                                    where : {
                                                                        id : grupe[i].id
                                                                    }
                                                                }
                                                            )
                                                            .then(updatedGroup => {
                                                                if (i == grupe.length - 1)
                                                                    res.end(JSON.stringify({
                                                                        'success' : 'yes'
                                                                    }));
                                                            })
                                                            .catch(error => {
                                                                console.log(error);
                                                                res.end(JSON.stringify(Odgovori.SERVER_ERROR));
                                                            });
                                                        }
                                                    }
                                                }
                                            }
        
                                        
                                    })
                                }
                            })
                            .catch(error => {
                                console.log(error);
                                res.end(JSON.stringify(Odgovori.SERVER_ERROR));
                            })
                        }
       
                    })
                }
               
            });
        }
        else
            res.end(JSON.stringify(Odgovori.UNAUTHORIZED));
    }
}