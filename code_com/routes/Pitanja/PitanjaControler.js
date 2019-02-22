const Sequelize = require('sequelize');
const sequelize = require('../../client/src/base/baza.js');
const Op = Sequelize.Op;
const fs = require('fs');

const SOdgovori = require('../ServerOdgovori.js');
const Sesija = require('../PomocneRute/Sesija.js');
const { Pitanja, Odgovori, Ucesnici, Korisnici } = sequelize.import('../../client/src/base/models/Models.js');


module.exports = {
    novoPitanje : function(req, res) {
        var korisnik = {korisnickoIme : req.body.korisnickoIme, token : req.body.token};
        if(req.session.rola == 'ucesnik' && Sesija.isOK(korisnik)) {
            var pitanje = req.body;
            Pitanja.create({
                tekstPitanja : pitanje.tekstPitanja,
                ucesniciId : pitanje.ucesnikId,
                takmicenjaId : pitanje.takmicenjeId
            })
            .then(novoPitanje => {
                if (novoPitanje)
                    res.end(JSON.stringify({
                        'success' : 'yes',
                        'pitanje' : novoPitanje
                    }));
                else
                    res.end(JSON.stringify(SOdgovori.SERVER_ERROR));
            })
            .catch(error => {
                res.end(JSON.stringify(SOdgovori.SERVER_ERROR));
            });
        }
        else
            res.end(JSON.stringify(Odgovori.UNAUTHORIZED));
    },

    odgovorNaPitanje : function(req, res) {
        var korisnik = {korisnickoIme : req.body.korisnickoIme, token : req.body.token};
        if(req.session.rola == 'admin_takmicenja' && Sesija.isOK(korisnik)) {
            var odgovor = req.body;
            Odgovori.create({
                tekstOdgovora : odgovor.tekst,
                odgovorZaSve : odgovor.odgovorZaSve,
                pitanjaId : odgovor.pitanjeId
            })
            .then(noviOdgovor => { 
                Pitanja.update(
                    {odgovoreno : true},
                    {
                        where : {
                            id : odgovor.pitanjeId
                        }
                    }
                )
                .then(done => {
                    res.end(JSON.stringify({
                        'success' : 'yes',
                        'odgovor' : noviOdgovor
                    }));
                });
            })
            .catch(error => {
                res.end(JSON.stringify(SOdgovori.SERVER_ERROR));
            });
        }
        else 
            res.end(JSON.stringify(SOdgovori.UNAUTHORIZED));
    },

    povuciSvaPitanja : function(req, res) { // admin
        var korisnik = {korisnickoIme : req.query.korisnickoIme, token : req.query.token};
        if(req.session.rola == 'admin_takmicenja' && Sesija.isOK(korisnik)) {
            var takmicenjeId = req.query.takmicenjeId;

            Pitanja.findAll({
                include : [
                    {
                        model : Ucesnici, as : 'ucesnici', attributes : ['id'],
                        include : [
                            {model : Korisnici, as : 'korisnici', attributes : ['korisnickoIme']}
                        ]
                    }
                ],
                where : {
                    takmicenjaId : takmicenjeId,
                    odgovoreno : false
                }
            })
            .then(neodgovorenaPitanja => {
                Odgovori.findAll({
                    include : [
                        {model : Pitanja, as : 'pitanja', attributes : ['id', 'tekstPitanja'], 
                            where : {
                                takmicenjaId : takmicenjeId
                            },
                            include : [
                                {model : Ucesnici, as : 'ucesnici', attributes : ['id'],
                                    include : [
                                        {model : Korisnici, as : 'korisnici', attributes : ['korisnickoIme']}
                                    ]
                                }
                            ]
                        }
                    ]
                })
                .then(odgovorenaPitanja => {
                    res.end(JSON.stringify({
                        'success' : 'yes',
                        'odgovorenaPitanja' : odgovorenaPitanja,
                        'neodgovorenaPitanja' : neodgovorenaPitanja
                    }));
                })
                .catch(error => {
                    res.end(JSON.stringify(SOdgovori.SERVER_ERROR));
                });
            })
            .catch(error => {
                res.end(JSON.stringify(SOdgovori.SERVER_ERROR));
            });
        }
        else
            res.end(JSON.stringify(Odgovori.UNAUTHORIZED));
    },

    povuciPitanjaZaUcesnika : function(req, res) {
        var korisnik = {korisnickoIme : req.query.korisnickoIme, token : req.query.token};
        if(req.session.rola == 'ucesnik' && Sesija.isOK(korisnik)) {
            var ucesnikId = req.query.ucesnikId;
            Pitanja.findAll({
                where : {
                    ucesniciId : ucesnikId,
                    odgovoreno : false
                }
            })
            .then(neodgovorenaPitanja => {
                Odgovori.findAll({
                    attributes : ['pitanjaId'],
                    where : {
                        odgovorZaSve : true
                    }
                })
                .then(pitanja => {
                    var pitanjaIDs = [];
                    for (var i = 0; i < pitanja.length; i++)
                        pitanjaIDs[i] = pitanja[i].pitanjaId;
                    Odgovori.findAll({
                        include : [
                            {
                                model : Pitanja, as : 'pitanja',
                                where : {
                                    [Op.or] : {
                                        ucesniciId : ucesnikId,
                                        id : pitanjaIDs
                                    }
                                }
                            }
                        ]
                    })
                    .then(odgovorenaPitanja => {
                        res.end(JSON.stringify({
                            'success' : 'yes',
                            'odgovorenaPitanja' : odgovorenaPitanja,
                            'neodgovorenaPitanja' : neodgovorenaPitanja
                        }));
                    })
                    .catch(error => {
                    res.end(JSON.stringify(SOdgovori.SERVER_ERROR));
                    });
                })
                .catch(error => {
                    res.end(JSON.stringify(SOdgovori.SERVER_ERROR));
                });
            })
            .catch(error => {
                res.end(JSON.stringify(SOdgovori.SERVER_ERROR));
            });
        }
        else
            res.end(JSON.stringify(Odgovori.UNAUTHORIZED));
    }
}