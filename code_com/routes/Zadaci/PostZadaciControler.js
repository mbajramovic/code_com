const Sequelize = require('sequelize');
const sequelize = require('../../client/src/base/baza.js');
var htmlencode = require('htmlencode').htmlEncode;

const Odgovori = require('../ServerOdgovori.js');
const Sesija = require('../PomocneRute/Sesija.js');
const { AdminiZaTakmicenja, ZadaciAdmini, Zadaci } = sequelize.import('../../client/src/base/models/Models.js');

module.exports = {
    noviZadatak : function(req, res) {
        var korisnik = {korisnickoIme : req.body.korisnickoIme, token : req.body.token};
        if(req.session.rola == 'admin_takmicenja' && Sesija.isOK(korisnik)) {
            const zadatak = req.body.zadatak;
            Zadaci.dodajNoviZadatak(zadatak, htmlencode, function(success, data) {
                if (success) {
                    ZadaciAdmini.novaVeza(data.id, zadatak.adminId, true, function(_success, _data){
                        if (_success) {
                            res.end(JSON.stringify({
                                'success' : 'yes'
                            }));
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

    updateZadatak : function(req, res) {
        var korisnik = {korisnickoIme : req.body.korisnickoIme, token : req.body.token};
        if(req.session.rola == 'admin_takmicenja' && Sesija.isOK(korisnik)) {
            const noviZadatak = req.body.zadatak;
            const zadatakId = req.body.zadatakId;
            Zadaci.findOne({
                where : {
                    id : zadatakId
                }
            })
            .then(zadatak => {
                Zadaci.azurirajZadatak(zadatak, noviZadatak, htmlencode, function(success, data) {
                    if (success) {

                        ZadaciAdmini.novaVeza(zadatakId, noviZadatak.adminId, false, function(_success, _data) {
                            if (_success) {
                                res.end(JSON.stringify({
                                    'success': 'yes',
                                    'data' : null
                                }));
                            }
                            else {
                                console.log(_data);
                                res.end(JSON.stringify(Odgovori.SERVER_ERROR));
                            }
                        }, true)
                    }
                    else {
                        console.log(data);
                        res.end(JSON.stringify(Odgovori.SERVER_ERROR));
                    }
                });
            })
            .catch(error => {
                console.log(error);
                res.end(JSON.stringify(Odgovori.SERVER_ERROR));
            });
        }
        else
            res.end(JSON.stringify(Odgovori.UNAUTHORIZED));
    }
}