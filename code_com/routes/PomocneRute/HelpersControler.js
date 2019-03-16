const Sequelize = require('sequelize');
const htmlencode = require('htmlencode').htmlEncode;
const sequelize = require('../../client/src/base/baza.js');
const fs = require('fs');
const jwt = require('jsonwebtoken');

const Sesija = require('./Sesija.js');
const Odgovori = require('../ServerOdgovori');
const {Ucesnici, Korisnici, AdminiZaTakmicenja} = sequelize.import('../../client/src/base/models/Models.js');

module.exports = {
    login : function(req, res) {
        var korisnik = req.body;
        var token = generisiToken(korisnik);
        
        if (korisnik.korisnickoIme == 'admin') {
           
            req.session.korisnik = 'admin';
            req.session.rola = 'administrator';
            
            korisnik.token = token;
            Sesija.dodajKorisnika(korisnik);
            if (korisnik.lozinka === 'admin') 
                Korisnici.povuciKorisnikaAdmin('admin', function(success, data) {
                    if (success) 
                        res.end(JSON.stringify({
                            'success' : null,
                            'msg' : 'Nepostojeći korisnik.'
                        }));
                    
                    else
                        res.end(JSON.stringify({
                            'success' : 'yes',
                            'rola' : 'administrator',
                            'id' : true,
                            'korisnik' : korisnik
                        }));
                });
            else {
                Korisnici.povuciKorisnika(korisnik.korisnickoIme, korisnik.lozinka, function(success, data) {
                    if (success) 
                        res.end(JSON.stringify({
                            'success' : 'yes',
                            'rola' : 'administrator',
                            'id' : true,
                            'korisnik' : korisnik
                        }));
                    else 
                        res.end(JSON.stringify({
                            'success' : null,
                            'msg' : data
                        }));
                });
            }
        }
    
        else {
            Korisnici.povuciKorisnika((korisnik.korisnickoIme), (korisnik.lozinka), function(success, data) {
                if (success) {
                    AdminiZaTakmicenja.povuciAdmina(data.id, function(_success, _data) {
                        if (_success) {
                            req.session.korisnik = _data.id; // id admina
                            req.session.rola = 'admin_takmicenja';
                            korisnik.token = token;
                            Sesija.dodajKorisnika(korisnik);
                            res.end(JSON.stringify({
                                'success' : 'yes',
                                'rola' : 'admin_takmicenja',
                                'id' : _data.id,
                                'korisnik' : korisnik
                            }));
                        }
                        else {
                            Ucesnici.povuciUcesnika(data.id, function(_success, _data) {
                                if (_success) {
                                    req.session.korisnik = _data.id; // id ucesnika
                                    req.session.rola = 'ucesnik';
                                    korisnik.token = token;
                                    Sesija.dodajKorisnika(korisnik);
                                    res.end(JSON.stringify({
                                        'success' : 'yes',
                                        'rola' : 'ucesnik',
                                        'id' : _data.id,
                                        'korisnik' : korisnik
                                    }));
                                }
                                else {
                                    res.end(JSON.stringify({
                                        'success' : null,
                                        'data' : 'Nepostojeći korisnik.' 
                                    }));
                                }
                            });
                        }
                    });
                }
                else {
                    res.end(JSON.stringify({
                        'success' : null,
                        'msg' : data
                    }));
                }
            });
        }
        
    },

    logout : function(req, res) {
        Sesija.brisiKorisnika(req.query.korisnik);
        res.end(JSON.stringify({
            'success' : 'yes'
        }));
    },

    download : function(req, res) {
        fs.readFile(req.query.fileName, function (err,data){
            res.contentType("application/pdf");
            res.send(data);
        });
    },

    novaLozinka : function(req, res) {
        var korisnik = {korisnickoIme : req.body.korisnickoIme, token : req.body.token};
        if (req.session.rola === 'administrator' && Sesija.isOK(korisnik)) {
            Korisnici.povuciKorisnikaAdmin(korisnik.korisnickoIme, function(success, data) {
                if (success) {
                    Korisnici.update({
                        lozinka : req.body.lozinka
                    }, {
                        where : {
                            korisnickoIme : 'admin'
                        }
                    })
                    .then(updated => {
                        res.end(JSON.stringify({
                            'success' : 'yes'
                        }));
                    });
                }
                else {
                    Korisnici.dodajNovogKorisnika('admin', req.body.lozinka, function(success, data) {
                        if (success) {
                            res.end(JSON.stringify({
                                'success' : 'yes'
                            }));
                        }
                    });
                }
            });
        }
        else 
            res.end(JSON.stringify(Odgovori.UNAUTHORIZED));
    }
}

function generisiToken(user) {
    var u = {
        name : user.korisnickoIme,
        date : new Date()
    };

    return token = jwt.sign(u, 'secret', {
        expiresIn: 60 * 60 * 24 
     });
}