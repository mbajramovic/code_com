const Sequelize = require('sequelize');
const sequelize = require('../../client/src/base/baza.js');
var htmlencode = require('htmlencode').htmlEncode;

const Odgovori = require('../ServerOdgovori.js');
const Sesija = require('../PomocneRute/Sesija.js');
const { AdminiZaTakmicenja, AdminiTakmicenja, Korisnici } = sequelize.import('../../client/src/base/models/Models.js');

module.exports = {
    noviAdmin : function(req, res) {
        var korisnik = {korisnickoIme : req.body.korisnickoIme, token : req.body.token};
        if (req.session.rola == 'administrator' && Sesija.isOK(korisnik)) {
            var korisnik = req.body;
            Korisnici.dodajNovogKorisnika(korisnik._korisnickoIme, korisnik.lozinka, function(success, data) {
                if (success) {
                    // data sadrzi novog korisnika
                    AdminiZaTakmicenja.dodajNovogAdmina(korisnik, data.id, htmlencode, function(_success, _data) {
                        if (_success) {
                            // _data sadrzi novog admina
                            for (var i = 0; i < korisnik.odabranaTakmicenja.length; i++) {
                                AdminiTakmicenja.novaVeza(data.id, korisnik.odabranaTakmicenja[i].id, function(__success, __data) {
                                    if (__success == null) {
                                        console.log(__data);
                                        res.end(JSON.stringify(Odgovori.SERVER_ERROR));
                                    }
                                });
                            }
                            if (i == korisnik.odabranaTakmicenja.length) {
                                res.end(JSON.stringify({
                                    'success' : 'yes',
                                    'msg' : 'Uspješno dodan korisnik.',
                                    'korIme' : data.korisnickoIme,
                                    'loz' : data.lozinka
                                }));
                            }
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

    getAdmine : function(req, res) {
        var korisnik = {korisnickoIme : req.query.korisnickoIme, token : req.query.token};
        if (req.session.rola == 'administrator' && Sesija.isOK(korisnik)) {
            AdminiZaTakmicenja.findAll({
                attributes : ['id', 'ime', 'prezime', 'grad', 'titula', 'korisniciId']
            })
            .then(function(admini) {
                res.end(JSON.stringify({
                    'success' : 'yes',
                    'data' : admini
                }));
            })
            .catch(function(error) {
                console.log(error);
                res.end(JSON.stringify(Odgovori.SERVER_ERROR));
            });
        }
        else {
            res.end(JSON.stringify({
                'success' : 'no',
                'msg' : 'Nemate pravo na ovu opciju.'
            }));
        }
    }
}