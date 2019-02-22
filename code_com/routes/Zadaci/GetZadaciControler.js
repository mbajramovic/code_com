const Sequelize = require('sequelize');
const sequelize = require('../../client/src/base/baza.js');

const Odgovori = require('../ServerOdgovori.js');
const Sesija = require('../PomocneRute/Sesija.js');
const { AdminiZaTakmicenja, ZadaciAdmini, Zadaci, Task } = sequelize.import('../../client/src/base/models/Models.js');

module.exports = {
    getZadaci : function(req, res) {
        var korisnik = {korisnickoIme : req.query.korisnickoIme, token : req.query.token};
        if((req.session.rola == 'admin_takmicenja' || req.session.rola == 'ucesnik') && Sesija.isOK(korisnik)) {
            Zadaci.findAll({
                attributes : ['id', 'redniBroj'],
                where : {
                    takmicarskeGrupeId : req.query.takmicarskeGrupeId
                }
            })
            .then(zadaci => {
                if (zadaci)
                    res.end(JSON.stringify({
                        'success' : 'yes',
                        'data' : zadaci
                    }));
                else
                    res.end(JSON.stringify(Odgovori.SERVER_ERROR));
            })
            .catch(error => {
                res.end(JSON.stringify(Odgovori.SERVER_ERROR));
            });
        }
        else    
            res.end(JSON.stringify(Odgovori.UNAUTHORIZED));
    },

    getZadatak : function(req, res) {
        var korisnik = {korisnickoIme : req.query.korisnickoIme, token : req.query.token};
        if((req.session.rola == 'admin_takmicenja' || req.session.rola == 'ucesnik') && Sesija.isOK(korisnik)) {
            Zadaci.findOne({
                attributes : ['id', 'redniBroj', 'naslov', 'tekst', 'ulaz', 'izlaz', 'oblast', 'obrazlozenje', 'dozvoliIzmjene', 'bodovi'],
                where : {
                    id : req.query.id
                }
            })
            .then(zadatak => {
                if (zadatak) {
                    ZadaciAdmini.findAll({
                        attributes : ['adminiZaTakmicenjaId', 'autor'],
                        where : {
                            zadaciId : zadatak.id
                        }
                    })
                    .then(admini => {
                        if (admini) {
                            var listaAdmina = [];
                            let j = -1;
                            for (let i = 0; i < admini.length; i++) {
                                AdminiZaTakmicenja.findOne({
                                    attributes : ['id', 'ime', 'prezime'],
                                    where : {
                                        id : admini[i].adminiZaTakmicenjaId
                                    }
                                })
                                .then(admin => {
                                    if (admini[i].autor)
                                        j = i;
                                    listaAdmina.push(admin);
                                    if (i == admini.length - 1)
                                        res.end(JSON.stringify({
                                            'success' : 'yes',
                                            'data' : zadatak,
                                            'admini' : listaAdmina,
                                            'autorInd' : j
                                        }));
                                })
                                .catch(error => {
                                    res.end(JSON.stringify(Odgovori.SERVER_ERROR));
                                })
                            }
                        }
                    })
                    .catch(error => {
                        res.end(JSON.stringify(Odgovori.SERVER_ERROR));
                    })
                }
                else
                    res.end(JSON.stringify(Odgovori.SERVER_ERROR));
            })
            .catch(error => {
                res.end(JSON.stringify(Odgovori.SERVER_ERROR));
            });
        }
        else   
            res.end(JSON.stringify(Odgovori.UNAUTHORIZED));
    },

    zadaciZaUcesnika : function(req, res) {
        var takmicarskaGrupaId = req.query.takmicarskaGrupaId;
        
            Zadaci.findAll({
                where : {
                    takmicarskeGrupeId : takmicarskaGrupaId
                }
            })
            .then(zadaci => {
                if (zadaci) 
                    res.end(JSON.stringify({
                        'success' : 'yes',
                        'zadaci' : zadaci
                    }));
                else
                    res.end(JSON.stringify({
                        'success' : null,
                        'data' : 'Takmičarska grupa nema deifnisane zadatke.'
                    }));
            })
            .catch(error => {
                res.end(JSON.stringify(Odgovori.SERVER_ERROR));
            });
    },

    getJeziciZaZadatak : function(req, res) {
        var zadatakId = req.query.zadatakId;
        var languages = [];
        Task.findAll({
            where : {
                zadaciId : zadatakId
            },
            attributes : ['language']
        })
        .then(tasks => {
            for (var i = 0; i < tasks.length; i++) {
                languages.push(tasks[i].language);
            }
            res.end(JSON.stringify({
                'success' : 'yes',
                'data' : languages
            }));
        });
    }
}