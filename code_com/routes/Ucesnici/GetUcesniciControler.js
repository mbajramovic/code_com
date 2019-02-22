const express = require('express');
const router = express.Router();
const Sequelize = require('sequelize');
const sequelize = require('../../client/src/base/baza.js');


const Odgovori = require('../ServerOdgovori.js');
const Sesija = require('../PomocneRute/Sesija.js');
const {Ucesnici, UcesniciTakmicarskeGrupe, Takmicenja, TakmicarskeGrupe, Lokacija, Korisnici} = sequelize.import('../../client/src/base/models/Models.js');

module.exports = {
    getUcesnik : function(req, res) {
        var korisnik = {korisnickoIme : req.query.korisnickoIme, token : req.query.token};
        if(req.session.rola == 'admin_takmicenja' && Sesija.isOK(korisnik)) {
            var idUcesnika = req.query.id;
            Ucesnici.findOne({
                where : {
                    id : idUcesnika
                }
            })
            .then(ucesnik => {
                if (ucesnik) 
                    Lokacija.findOne({
                        where : {
                            id : ucesnik.lokacijaId
                        }
                    })
                    .then(lokacija => {
                        UcesniciTakmicarskeGrupe.findAll({
                            attributes : ['takmicarskeGrupeId'],
                            where : {
                                ucesniciId : idUcesnika
                            }
                        })
                        .then(takmicarskeGrupeIds => {
                            var grupe = [];
                            for (let i = 0; i < takmicarskeGrupeIds.length; i++) {
                                TakmicarskeGrupe.findOne({
                                    where : {
                                        id : takmicarskeGrupeIds[i].takmicarskeGrupeId
                                    }
                                })
                                .then(grupa => {
                                    Takmicenja.findOne({
                                        where : {
                                            id : grupa.takmicenjaId
                                        }
                                    })
                                    .then(takmicenje => {
                                        var takmGrupa = {
                                            'takmicarskaGrupa' : grupa.naziv,
                                            'takmicenje' : takmicenje.naziv
                                        }
                                        grupe.push(takmGrupa);
                                        //console.log(i + ' ' + takmicarskeGrupe.length);
                                        if (i == takmicarskeGrupeIds.length - 1) {
                                            res.end(JSON.stringify({
                                                'success' : 'yes',
                                                'lokacija' : lokacija,
                                                'grupe' : grupe,
                                                'ucesnik' : ucesnik
                                            }));
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
                            })
                        .catch(error => {
                            res.end(JSON.stringify(Odgovori.SERVER_ERROR));
                        });
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
    },

    getUcesnici : function(req, res) {
        var korisnik = {korisnickoIme : req.query.korisnickoIme, token : req.query.token};
        if(req.session.rola == 'admin_takmicenja' && Sesija.isOK(korisnik)) {
            const takmGrupaId = req.query.takmicarskeGrupeId;
            UcesniciTakmicarskeGrupe.findAll({
                attributes : ['ucesniciId'],
                where : {
                    takmicarskeGrupeId : takmGrupaId
                }
            })
            .then(ucesniciIds => {
                var ucesniciIDs = [];
                for (var i = 0; i <ucesniciIds.length; i++) 
                    ucesniciIDs[i] = ucesniciIds[i].ucesniciId;
                Ucesnici.findAll({
                    attributes : ['id', 'ime', 'prezime', 'korisniciId'],
                    where : {
                        id : ucesniciIDs
                    }
                })
                .then(ucesnici => {
                    let _ucesnici = [];
                    let j = 0;
                    for (let i = 0; i < ucesnici.length; i++) {
                        Korisnici.findOne({
                            attributes : ['korisnickoIme'],
                            where : {
                                id : ucesnici[i].korisniciId
                            }
                        })
                        .then(korisnik => {
                            let ucesnik = {'id' : ucesnici[i].id, 'korisnickoIme' : korisnik.korisnickoIme};
                            _ucesnici[i] = ucesnik;
                            j++;
                            if (j == ucesnici.length) {
                                res.end(JSON.stringify({
                                    'success' : 'yes',
                                    'data' : _ucesnici
                                }));
                            }
                        })
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
    },

    brisiUcesnika : function(req, res) {
        var korisnik = {korisnickoIme : req.query.korisnickoIme, token : req.query.token};
        if(req.session.rola == 'admin_takmicenja' && Sesija.isOK(korisnik)) {
            var ucesnikId = req.query.id,
                takmGrupaId = req.query.takmicarskaGrupaId;
            UcesniciTakmicarskeGrupe.destroy({
                where : {
                    ucesniciId : ucesnikId,
                    takmicarskeGrupeId : takmGrupaId
                }
            })
            .then(destroyed => {
                Ucesnici.findOne({
                    attributes : ['lokacijaId', 'korisniciId'],
                    where : {
                        id : ucesnikId
                    }
                })
                .then(ucesnik => {
                    Lokacija.destroy({
                        where : {
                            id : ucesnik.lokacijaId
                        }
                    })
                    .then(destroyed => {
                        Korisnici.destroy({
                            where : {
                                id : ucesnik.korisniciId
                            }
                        })
                        .then(destroyed => {
                            Ucesnici.destroy({
                                where : {
                                    id : ucesnikId
                                }
                            })
                            .then(destroyed => {
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
                    })
                    .catch(error => {
                        res.end(JSON.stringify(Odgovori.SERVER_ERROR));
                    });
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
    },

    informacijeOTakmicenju : function(req, res) {
         var korisnik = {korisnickoIme : req.query.korisnickoIme, token : req.query.token};
        if(req.session.rola == 'ucesnik' && Sesija.isOK(korisnik)) {
            var idUcesnika = req.query.id;
            
            Ucesnici.findOne({
                attributes : ['ime', 'prezime'],
                where : {
                    id : idUcesnika
                }
            })
            .then(ucesnik => {
                UcesniciTakmicarskeGrupe.findOne({
                    attributes : [ 'takmicarskeGrupeId' ],
                    where : {
                        ucesniciId : idUcesnika
                    }
                })
                .then(takmicarskaGrupaId => {
                    TakmicarskeGrupe.findOne({
                        attributes : ['id', 'naziv', 'takmicenjaId'],
                        where : {
                            id : takmicarskaGrupaId.takmicarskeGrupeId
                        }
                    })
                    .then(takmicarskaGrupa => {
                        Takmicenja.findOne({
                            attributes : ['id', 'naziv', 'opis', 'trajanje', 'programskiJezik', 'tipDatoteke'],
                            where : {
                                id : takmicarskaGrupa.takmicenjaId,
                                aktivno : true
                            }
                        })
                        .then(takmicenje => {
                            if (takmicenje) 
                                res.end(JSON.stringify({
                                    'success' : 'yes',
                                    'ucesnik' : ucesnik,
                                    'takmicarskaGrupa' : takmicarskaGrupa,
                                    'takmicenje' : takmicenje
                                }));
                            else 
                                res.end(JSON.stringify({
                                    'success' : null,
                                    'data' : 'Ne postoji aktivno takmičenje za odabranog učesnika.'
                                }));
                        })
                        .catch(error => {
                            res.end(JSON.stringify(Odgovori.SERVER_ERROR));
                        });
                    })
                    .catch(error => {
                        res.end(JSON.stringify(Odgovori.SERVER_ERROR));
                    });
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