const Sequelize = require('sequelize');
const sequelize = require('../../client/src/base/baza.js');
const fs = require('fs');
var rezultatiTestiranja = require('../Buildservice/RezultatiTestiranja.js');

const Odgovori = require('../ServerOdgovori.js');
const Sesija = require('../PomocneRute/Sesija.js');
const {Zadaci, Autotestovi, AutotestoviRezultati, Verzije, Ucesnici, Korisnici} = sequelize.import('../../client/src/base/models/Models');

module.exports = {
    getVerzijeZaUcesnika : function(req, res) {
        var korisnik = {korisnickoIme : req.query.korisnickoIme, token : req.query.token};
        if((req.session.rola == 'ucesnik' || req.session.rola == 'admin_takmicenja') && Sesija.isOK(korisnik)) {
            var ucesnikId = req.query.ucesnikId,
            zadatakId = req.query.zadatakId,
            _verzijaId = req.query.verzijaId;
            var verzije = [];
    

            AutotestoviRezultati.findAll({
                include : [
                    {model : Verzije, as : 'verzije', attributes : ['createdAt', 'filename', 'compileResult'], where : {
                        ucesniciId : ucesnikId,
                        zadaciId : zadatakId
                    }},
                    {model : Autotestovi, as : 'autotestovi'},
                
                ],
                order : [
                    ['verzijeId', 'ASC']
                    ]
            })
            .then(_verzije => {
                var grupisaneVerzije = {};
                for (let i = 0; i < _verzije.length; i++) { 
                    var verzijaId = _verzije[i].verzijeId.toString();
                    if (!grupisaneVerzije[verzijaId])
                        grupisaneVerzije[verzijaId] = [];
                    grupisaneVerzije[verzijaId].push(_verzije[i]);
                }
                var konacneVerzije = [];
                for (var verzija in grupisaneVerzije) {
                    konacneVerzije.push({'verzijeId' : verzija, 'rezultati' : grupisaneVerzije[verzija]})
                }
                var verzije = [];
                for (let  i = 0; i < konacneVerzije.length; i++) {
                    var verzija = {}; 
                    var rez = konacneVerzije[i];
                    var autotestovi = [];
                    for (let j = 0; j < rez.rezultati.length; j++) {
                        var at = rez.rezultati[j];
                        var expected = [];
                    if (at.autotestovi != null) {
                        for (let ii = 0; ;ii++) {
                            if (at.autotestovi.expected[ii.toString()] != null)
                                    expected.push(at.autotestovi.expected[ii.toString()]);
                                else
                                    break;
                        }
                    }
                        var autotest = {
                            'status' : at.status, 
                            'output' : at.output,
                            'runResult' : at.runResult,
                            'compileResult' : at.compileResult,
                            'ulaz' : at.autotestovi != null ? at.autotestovi.stdin : '',
                            'ocekivaniIzlaz' : at.autotestovi != null? expected.toString() :'',
                            'kod' : at.autotestovi != null ? at.autotestovi.code : '',
                            'global' : at.autotestovi != null ? at.autotestovi.global_above_main : ''
                        }; 

                        var ver = rez.rezultati[j].verzije;
                        verzija = {
                            'id' : rez.verzijeId,
                            'vrijeme' : ver.createdAt,
                            'rjesenje' : fs.readFileSync('uploads/verzije/' + ver.filename).toString(),
                            'status' : ver.compileResult
                        }
                        autotestovi.push(autotest);
                    }

                    verzija.autotest_rezultati = autotestovi;
                    
                    if (_verzijaId != null && _verzijaId == verzija.id)
                        res.end(JSON.stringify({
                            'success' : 'yes',
                            'verzija' : verzija
                        }));
                    verzije.push(verzija);
                }
                
                var netestiraneVerzije = [];
                Verzije.findAll({
                    where : {
                        ucesniciId : ucesnikId,
                        zadaciId : zadatakId,
                        compileResult : null
                    }
                })
                .then(_verzije => {
                    if (_verzije.length > 0) {
                        for (let j = 0; j < _verzije.length; j++) {
                            _verzije[j].rjesenje = fs.readFileSync('uploads/verzije/' + _verzije[j].filename).toString();
                            _verzije[j].status = rezultatiTestiranja.glavniRezultat(_verzije[j].compileResult);

                            if (j == _verzije.length - 1) {
                                netestiraneVerzije = _verzije;
                                res.end(JSON.stringify({
                                    'success' : 'yes',
                                    'verzije' : verzije,
                                    'netestiraneVerzije' : netestiraneVerzije
                                }));
                            }
                        }

                    }
                    else 
                        res.end(JSON.stringify({
                            'success' : 'yes',
                            'verzije' : verzije,
                            'netestiraneVerzije' : netestiraneVerzije
                        }));
                });
            })
            .catch(error => {
                res.end(JSON.stringify(Odgovori.SERVER_ERROR));
            });
        }
        else
            res.end(JSON.stringify(Odgovori.UNAUTHORIZED));
    },

     getVerzijeZaOsoblje :  function(req, res) {
        var korisnik = {korisnickoIme : req.query.korisnickoIme, token : req.query.token};
        if(req.session.rola == 'admin_takmicenja' && Sesija.isOK(korisnik)) {
            var takmGrupeId = req.query.id;
            
                Zadaci.findAll({
                    attributes : ['id'],
                    where : {
                        takmicarskeGrupeId : takmGrupeId
                    }
                })
                .then(zadaci => {
                    var zadaciIDs = [];
                    for (let i = 0; i < zadaci.length; i++)
                        zadaciIDs.push(zadaci[i].id)
                    AutotestoviRezultati.findAll({
                        include : [
                            {model : Verzije, as : 'verzije', attributes : ['createdAt', 'filename', 'compileResult', 'zadaciId', 'ucesniciId'], where : {
                                zadaciId : zadaciIDs
                            }, include : [{model : Ucesnici, as : 'ucesnici', include : [{model : Korisnici, as : 'korisnici'}]}]},
                            {model : Autotestovi, as : 'autotestovi'},
                            
                        ],
                        order : [
                        ['verzijeId', 'DESC']
                        ]
                    })
                    .then(_verzije => {
                        var grupisaneVerzije = {};
                        for (let i = 0; i < _verzije.length; i++) {
                            var verzijaId = _verzije[i].verzijeId.toString();
                            if (!grupisaneVerzije[verzijaId])
                                grupisaneVerzije[verzijaId] = [];
                            grupisaneVerzije[verzijaId].push(_verzije[i]);
                        }
                        var konacneVerzije = [];
                        for (var verzija in grupisaneVerzije) {
                            konacneVerzije.push({'verzijeId' : verzija, 'rezultati' : grupisaneVerzije[verzija]})
                        }
                        var verzije = [];
                        for (let  i = 0; i < konacneVerzije.length; i++) {
                            var verzija = {};
                            var rez = konacneVerzije[i];
                            var autotestovi = [];
                            for (let j = 0; j < rez.rezultati.length; j++) {
                                var at = rez.rezultati[j];
                                var expected = [];
                                if (at.autotestovi != null) {
                                    for (let j = 0; ;j++) {
                                        if (at.autotestovi.expected[j.toString()] != null)
                                            expected.push(at.autotestovi.expected[j.toString()]);
                                        else
                                            break;
                                    }
                                }
                                var autotest = {
                                    'status' : at.status,
                                    'output' : at.output,
                                    'runResult' : at.runResult,
                                    'compileResult' : at.compileResult,
                                    'ulaz' : at.autotestovi != null ? at.autotestovi.stdin : '',
                                    'ocekivaniIzlaz' : at.autotestovi != null? expected.toString() :'',
                                    'kod' : at.autotestovi != null ? at.autotestovi.code : '',
                                    'global' : at.autotestovi != null ? at.autotestovi.global_above_main : ''
                                };
                                var ver = rez.rezultati[j].verzije;

                                     verzija = {
                                        'id' : rez.verzijeId,
                                        'vrijeme' : ver.createdAt,
                                        'rjesenje' : fs.readFileSync('uploads/verzije/' + ver.filename).toString(),
                                        'status' : rezultatiTestiranja.glavniRezultat(ver.compileResult),
                                        'zadatakId' : ver.zadaciId,
                                        'ucesnikId' : ver.ucesniciId,
                                        'korisnickoIme' : ver.ucesnici.korisnici.korisnickoIme
                                    }
                                    autotestovi.push(autotest);
                            
            
                                    verzija.autotest_rezultati = autotestovi;
                            
                                    
                                
                            }
                            verzije.push(verzija);
                        }
                        var grupisaneVerzije = {};
                        for (let i = 0; i < verzije.length; i++) {
                            var zadatakId = verzije[i].zadatakId.toString();
                            if (!grupisaneVerzije[zadatakId])
                                grupisaneVerzije[zadatakId] = [];
                            grupisaneVerzije[zadatakId].push(verzije[i]);
                        }
                        console.log(grupisaneVerzije);
                        var konacneVerzije = [];
                        for (var zadatak in grupisaneVerzije) {
                            konacneVerzije.push({'zadatakId' : zadatak, 'rezultati' : grupisaneVerzije[zadatak]})
                        }
                    
                        if (konacneVerzije.length < zadaciIDs.length) {
                            var length = konacneVerzije.length;
                            for (let i = 0; i < zadaciIDs.length; i++) {
                                let j = 0;
                                for (j = 0; j < length; j++) {
                                    if (konacneVerzije[j].zadatakId == zadaciIDs[i])
                                        break;
                                }
                                if (j == length)
                                    konacneVerzije.push({'zadatakId' : zadaciIDs[i], 'rezultati' : []});
                            }
                        }
                        console.log(konacneVerzije);
                        res.end(JSON.stringify({
                            'success' : 'yes',
                            'data' : konacneVerzije
                        }));
                })
                .catch(error => {
                    res.end(JSON.stringify(Odgovori.SERVER_ERROR));
                });
            });
        }
        else
            res.end(JSON.stringify(Odgovori.UNAUTHORIZED));
    },

    getRjesenje : function(req, res) {
        var korisnik = {korisnickoIme : req.query.korisnickoIme, token : req.query.token};
        if((req.session.rola == 'ucesnik' || req.session.rola == 'admin_takmicenja') && Sesija.isOK(korisnik)) {
            var id = req.query.id;
            Verzije.findOne({
                where : {
                    id : id
                }
            })
            .then(verzija => {
                var rjesenje = fs.readFileSync('uploads/verzije/' + verzija.filename).toString();        
                res.end(JSON.stringify({
                    'success' : 'yes',
                    'rjesenje' : rjesenje,
                    'compileOutput' : verzija.compileResult_output
                }));
            })
            .catch(error => {
                res.end(JSON.stringify(Odgovori.SERVER_ERROR));
            });
        }
        else
            res.end(JSON.stringify(Odgovori.UNAUTHORIZED));
    },

    getNajnovijaVerzija : function(req, res) {
        var ucesnikId = req.query.ucesnikId;
        var zadatakId = req.query.zadatakId;
        Verzije.findAll({
            where : {
                ucesniciId : ucesnikId,
                zadaciId : zadatakId
            },
            order : [
                ['createdAt', 'DESC']
            ]
        })
        .then(verzije => {
            if (verzije.length != 0) {
                let verzija = verzije[0];

                Verzije.create({
                    filename : verzija.filename,
                    zadaciId : zadatakId,
                    ucesniciId : ucesnikId,
                    programId : -1
                })
                .then(nova_verzija => {
                    res.end(JSON.stringify({
                        'success' : 'yes',
                        'verzijaId' : verzije.length != 0 ? verzija.id : -1,
                        'novaVerzijaId' : nova_verzija.id,
                        'jezik' : verzija.jezik,
                        'rjesenje' : fs.readFileSync('uploads/verzije/' + verzija.filename).toString()      
                    }));
                })
            }
            else {
                res.end(JSON.stringify({
                    'data' : -1
                }));
            }
        });

    }
}
