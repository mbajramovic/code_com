const express = require('express');
const router = express.Router();
const Sequelize = require('sequelize');
const htmlencode = require('htmlencode').htmlEncode;
const sequelize = require('../../client/src/base/baza.js');

const Odgovori = require('../ServerOdgovori.js');
const brisanjeUcesnika = require('./BrisanjeUcesnika.js');
const Sesija = require('../PomocneRute/Sesija.js');
const {Ucesnici, UcesniciTakmicarskeGrupe, Lokacija, Korisnici} = sequelize.import('../../client/src/base/models/Models.js');

module.exports = {
    noviUcesnik : function(req, res) {
        var korisnik = {korisnickoIme : req.body.korisnickoIme, token : req.body.token};
        if(req.session.rola == 'admin_takmicenja' && Sesija.isOK(korisnik)) {
            var ucesnik = req.body.ucesnik;
            var takmId = req.body.takmicarskaGrupaId;
            Lokacija.dodajNovuLokaciju(ucesnik, htmlencode, function(success, data) {
                if (success) {
                    Korisnici.dodajNovogKorisnika(ucesnik.korisnickoIme, ucesnik.lozinka, function(s, d) {
                        if (s) {
                            Ucesnici.dodajNovogUcesnika(ucesnik, data.id, d.id, htmlencode, function(_success, _data) {
                                if (_success) {
                                    UcesniciTakmicarskeGrupe.novaVeza(_data.id, takmId, function(__success, __data) {
                                        res.end(JSON.stringify({
                                            'success' : __success,
                                            'data' : __data
                                        }));
                                    
                                    });
                                }
                                else {
                                    console.log(__data);
                                res.end(JSON.stringify(Odgovori.SERVER_ERROR));
                                }
                            });
                        }
                        else {
                            console.log(_data);
                            res.end(JSON.stringify(Odgovori.SERVER_ERROR));
                        }
                    });
                }
                else {
                    console.log(data);
                    res.end(JSON.stringify(Odgovori.SERVER_ERROR));
                }
            });
        }
        else
            res.end(JSON.stringify(Odgovori.UNAUTHORIZED));
    },

    masovniUnosPoBrojuUcesnika : function(req, res) {
        var korisnik = {korisnickoIme : req.body.korisnickoIme, token : req.body.token};
        if(req.session.rola == 'admin_takmicenja' && Sesija.isOK(korisnik)) {
            var takmicarskeGrupeId = req.body.takmicarskaGrupaId,
            ucesnici = req.body.ucesnici;
            let j = 0;
            brisanjeUcesnika.brisiPoTakmicarskojGrupi(takmicarskeGrupeId)
            .then(function(result) {
                for (let i = 0; i < ucesnici.length; i++) {
                    let ucesnik = ucesnici[i];

                    let lokacija = {'drzava' : '', 'kanton' : '', 'opcina' : '', 'grad' : '', 'skola' : ''};
                    Lokacija.dodajNovuLokaciju(lokacija, htmlencode, function(s, d) {
                        if (s) {
                            Korisnici.dodajNovogKorisnika(ucesnik.korisnickoIme, ucesnik.lozinka, function(success, data) {
                                if (success) {
                                    let ucesnik = {'ime' : '', 'prezime' : '', 'maticniBroj' : ''};
                                    Ucesnici.dodajNovogUcesnika(ucesnik, d.id, data.id, htmlencode, function(_success, _data) {
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
                                                else
                                                    j++;
                                                if (i == ucesnici.length - 1)
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
                    });
                }
            }, function(error) {
                res.end(JSON.stringify(Odgovori.SERVER_ERROR));
            });
        }
        else
            res.end(JSON.stringify(Odgovori.UNAUTHORIZED));

    },

    urediUcesnika : function(req, res) {
        var korisnik = {korisnickoIme : req.body.korisnickoIme, token : req.body.token};
        if(req.session.rola == 'admin_takmicenja' && Sesija.isOK(korisnik)) {
            var ucesnik = req.body.ucesnik;
            var lokacija = req.body.lokacija;

            Ucesnici.update(
                {
                    ime : ucesnik.ime,
                    prezime : ucesnik.prezime,
                    maticniBroj : ucesnik.maticniBroj
                },
                {
                    where : {
                        id : ucesnik.id
                    }
                }
            )
            .then(updated => {
                Lokacija.update(
                    {
                        skola : lokacija.skola,
                        grad : lokacija.grad,
                        opcina : lokacija.opcina,
                        kanton : lokacija.kanton,
                        drzava : lokacija.drzava
                    },
                    {
                        where : {
                            id : lokacija.id
                        }
                    }
                )
                .then(updated => {
                    res.end(JSON.stringify({
                        'success' : 'yes'
                    }));
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