const Sequelize = require('sequelize');
const htmlencode = require('htmlencode').htmlEncode;
const sequelize = require('../../client/src/base/baza.js');
const fs = require('fs');
const jwt = require('jsonwebtoken');

const Sesija = require('./Sesija.js');
const {Ucesnici, Korisnici, AdminiZaTakmicenja} = sequelize.import('../../client/src/base/models/Models.js');

module.exports = {
    login : function(req, res) {
        var korisnik = req.body;
        var token = generisiToken(korisnik);
        
        if (korisnik.korisnickoIme == 'admin' && korisnik.lozinka == 'admin') {
           
            req.session.korisnik = 'admin';
            req.session.rola = 'administrator';
            
            korisnik.token = token;
            Sesija.dodajKorisnika(korisnik);

            res.end(JSON.stringify({
                'success' : 'yes',
                'rola' : 'administrator',
                'id' : true,
                'korisnik' : korisnik
            }));
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