const Sequelize = require('sequelize');
const sequelize = require('../../client/src/base/baza.js');
const Op = Sequelize.Op;
const fs = require('fs');

const Odgovori = require('../ServerOdgovori.js');
const Sesija = require('../PomocneRute/Sesija.js');
const { Takmicenja, TakmicarskeGrupe, AdminiTakmicenja, Pitanja } = sequelize.import('../../client/src/base/models/Models.js');

module.exports = {
    getTakmicenja : function(req, res) {
        var korisnik = {korisnickoIme : req.query.korisnickoIme, token : req.query.token};
    if ((req.session.rola == 'administrator' || req.session.rola == 'admin_takmicenja') && Sesija.isOK(korisnik)) {
        if (req.query.filter == 'sva') {

        }
        else if (req.query.filter == 'aktivna' || req.query.filter== 'zavrsena') {
            if (req.query.id) { // aktivna takmicenja samo za jednog od administratora takmicenja
                var id = req.query.id;
                AdminiTakmicenja.findAll({
                    attributes : ['takmicenjaId'],
                    where : {
                        adminiZaTakmicenjaId : id
                    }
                })
                .then(takmicenja => {
                    var IDs = [];
                    if (takmicenja.length > 0)
                        takmicenja.map((takmicenje) => (
                            IDs.push(takmicenje.takmicenjaId)
                        ));
                    if (req.query.filter == 'aktivna') {
                        Takmicenja.findAll({
                            attributes : ['id', 'naziv', 'pocetak', 'kraj', 'aktivno', 'zavrseno'],
                            where : {
                                id : IDs,
                                zavrseno : false,
                                kraj : {
                                    [Op.gte] : new Date()
                                }
                            }
                        })
                        .then(_takmicenja => {
                            res.end(JSON.stringify({
                                'success' : 'yes',
                                'data' : _takmicenja
                            }));
                        })
                        .catch(error => { 
                            res.end(JSON.stringify(Odgovori.SERVER_ERROR));
                        });
                    }
                    else {
                        Takmicenja.findAll({
                            attributes : ['id', 'naziv', 'pocetak', 'kraj', 'aktivno', 'zavrseno'],
                            where : {
                                id : IDs,
                                zavrseno : true
                            }
                        })
                        .then(_takmicenja => {
                            res.end(JSON.stringify({
                                'success' : 'yes',
                                'data' : _takmicenja
                            }));
                        })
                        .catch(error => {
                            res.end(JSON.stringify(Odgovori.SERVER_ERROR));
                        });
                    }
                })
                .catch(error => {
                    res.end(JSON.stringify(Odgovori.SERVER_ERROR));
                });
                }
                else {
                    Takmicenja.findAll({ 
                    
                        where : {
                            trajanje : 0,
                            aktivno : 0,
                            zavrseno : 0,
                            kraj : {
                                [Op.gte] : new Date() // ... where kraj <= today
                            }
                        }
                    })
                    .then(takmicenja => {
                        res.end(JSON.stringify({
                            'success' : 'yes',
                            'data' : takmicenja
                        }));
                    })
                    .catch(error => {
                        res.end(JSON.stringify(Odgovori.SERVER_ERROR));
                    });
                }
            }
        }
        else 
            res.end(JSON.stringify(Odgovori.UNAUTHORIZED));
    },

    getTakmicenje : function(req, res) {
        var korisnik = {korisnickoIme : req.query.korisnickoIme, token : req.query.token};
        if ((req.session.rola == 'administrator' || req.session.rola == 'admin_takmicenja') && Sesija.isOK(korisnik)) {
            Takmicenja.findOne({
                attributes : ['id', 'naziv', 'pocetak', 'kraj', 'mjesto', 'opis', 'vrsta', 'razinaId', 'aktivno', 'trajanje', 'zavrseno', 'programskiJezik', 'tipDatoteke'],
                where : {
                    id : req.query.id
                }
            })
            .then(takmicenje => {
                TakmicarskeGrupe.findAll({
                    attributes : ['id', 'naziv', 'brojTakmicara', 'brojZadataka'],
                    where : {
                        takmicenjaId : req.query.id
                    }
                })
                .then(takmicarskeGrupe => {
                    Pitanja.findAll({
                        where : {
                            takmicenjaId : takmicenje.id,
                            odgovoreno : false
                        }
                    })
                    .then(pitanja => { 
                        res.end(JSON.stringify({
                            'success' : 'yes',
                            'takmicenje' : takmicenje,
                            'takmicarskeGrupe' : takmicarskeGrupe ,
                            'brojPitanja' : pitanja.length
                        }));
                    });
                });
            })
            .catch(error => {
                res.end(JSON.stringify(Odgovori.SERVER_ERROR));
            });
        }
        else 
            res.end(JSON.stringify(Odgovori.UNAUTHORIZED));
    },

    getEkstenziju : function(req, res) {
        var id = req.query.id;
        Takmicenja.findOne({
            attributes : ['programskiJezik', 'tipDatoteke'],
            where : {
                id : id
            }
        })
        .then(takmicenje => {
            if (takmicenje)
                res.end(JSON.stringify({
                    'success' : 'yes',
                    'data' : takmicenje
                }));
        })
        .catch(error => {
            res.end(JSON.stringify(Odgovori.SERVER_ERROR));
        });
    },

    brisiTakmicenje : function(req, res) {
        var korisnik = {korisnickoIme : req.query.korisnickoIme, token : req.query.token};
        if(req.session.rola == 'administrator' && Sesija.isOK(korisnik)) {
            var id = req.query.id;
            Takmicenja.destroy({
                where : {
                    id : id
                }
            })
            .then(deleted => {
                res.end(JSON.stringify({
                    'success' : 'yes'
                }));
            })
            .catch(error => {
                res.end(JSON.stringify(Odgovori.SERVER_ERROR));
            });
        }
        else
            res.end(JSON.stringify(Odgovori.UNAUTHORIZED));
    }
}