const Sequelize = require('sequelize');
const sequelize = require('../../client/src/base/baza.js');
var request = require('request');

const buildConfig = require('../../configfiles/buildservice.json').buildservice;
const buildervice_url = require('../../configfiles/buildservice_url.json').buildservice;

const Odgovori = require('../ServerOdgovori.js');
var rezultatiTestiranja = require('./RezultatiTestiranja.js');

const {Zadaci, Autotestovi, AutotestoviRezultati, Verzije, TakmicarskeGrupe} = sequelize.import('../../client/src/base/models/Models');

module.exports = {
    getProgramStatus : function(req, res) {
        var programId = req.query.id;
        var akcija = req.query.akcija;
        var brojAutotestova = req.query.brojAutotestova;
        var idZadatka = req.query.zadatakId;
        var jezik = req.query.language;
        
        request.get(buildervice_url.url + '/push.php?action=getProgramStatus&program=' + programId, function(error, response, body) {
            if (!error && response.statusCode == 200) {
                var odgovor = JSON.parse(body);
                if (odgovor.success == 'true') {
                    var rezultatTestiranja = odgovor.status;
                    if (rezultatTestiranja) {
                        if (rezultatTestiranja.status == 4) { // testiranje je zavrseno
                            if (akcija && akcija == 'kreiranjeAutotestova') {
                                var autotestovi = rezultatTestiranja.test_results;
                                var nekompajliraniAutotestovi = [];
                                var uspjesniAutotestovi = [];
                                if (brojAutotestova) {
                                    for (let i = 1; i < brojAutotestova; i++) {
                                        var autotest = autotestovi[i.toString()];
                                        if (autotest.compile_result.status == 2) {
                                            nekompajliraniAutotestovi.push(i);
                                        }
                                        else {
                                            Autotestovi.update({
                                                izlaz : autotest.run_result.output
                                            }, {
                                                where : {
                                                    zadaciId : idZadatka,
                                                    naziv : i.toString()
                                                }
                                            })
                                            .then(autotest => {
                                                if (i == brojAutotestova - 1)
                                                    res.end(JSON.stringify({
                                                        'success' : 'yes'
                                                    }));
                                            })
                                        }
                                        
                                    }
                                }
                            }
                            else {
                                var autotestovi = rezultatTestiranja.test_results;
                                var verzijaId = req.query.verzijaId;
                                var uspjesniTestovi = 0;
                                Verzije.findOne({
                                    where : {
                                        id : req.query.verzijaId
                                    },
                                    attributes : ['jezik']
                                })
                                .then(v => {
                                    Autotestovi.findAll({
                                        where : {
                                            zadaciId : idZadatka,
                                            language : v.jezik
                                        }
                                    })
                                    .then(testovi => {
                                        for (let i = 1; i <= testovi.length; i++) {
                                            if (autotestovi[i.toString()].status == 1)
                                                uspjesniTestovi++;
                                        }
                                        Zadaci.findOne({
                                            attributes : ['bodovi'],
                                            where : {
                                                id : idZadatka
                                            }
                                        })
                                        .then(zad => {
                                            var output = rezultatTestiranja.compile_result.output.length == 0 ? 'Program se uspješno kompajlirao.' : rezultatTestiranja.compile_result.output;
                                            Verzije.update({
                                                compileResult : rezultatTestiranja.compile_result.status,
                                                compileResult_output : output,
                                                bodovi : (uspjesniTestovi/testovi.length) * zad.bodovi,
                                                jezik : jezik
                                            }, {
                                                where : {
                                                    id : req.query.verzijaId
                                                }
                                            })
                                            .then(updated => {
                                                Autotestovi.findAll({
                                                    where : {
                                                        zadaciId : idZadatka,
                                                        language : v.jezik
                                                    }
                                                })
                                                .then(_autotestovi => {
                                                    var autotestoviZaVratit = [];
                                                    if (_autotestovi) {
                                                        for (let i = 1; i <= _autotestovi.length; i++) {
                                                            var autotest = autotestovi[i.toString()];
                                                            autotest.verzijeId = verzijaId;
                                                            autotest.zadatakId = idZadatka;
                                                            autotest.id = i;
                                                            AutotestoviRezultati.dodajRezultat(autotest, function(success, data) {
                                                                if (success) {
                                                                    autotest.ulaz = data.ulaz;
                                                                    autotest.ocekivaniIzlaz = data.ocekivaniIzlaz;
                                                                    autotest.bodovi = data.status == 1 ? _autotestovi[i-1].bodovi : 0;
                                                                    AutotestoviRezultati.bodoviUpdate(data.id, autotest.bodovi, function(_success, _data) {
                                                                        if (_success) {
                                                                            autotestoviZaVratit.push(autotest);
                                                                            if (i == _autotestovi.length) {
                                                                                Zadaci.findOne({
                                                                                    attributes : ['takmicarskeGrupeId'],
                                                                                    where : {
                                                                                        id : idZadatka
                                                                                    }
                                                                                })
                                                                                .then(zadatak => {  
                                                                                    TakmicarskeGrupe.findOne({
                                                                                        where : {
                                                                                            id : zadatak.takmicarskeGrupeId
                                                                                        }
                                                                                    })
                                                                                    .then(grupa => {
                                                                                        rezultatTestiranja.takmicenjeId = grupa.takmicenjaId;
                                                                                        rezultatTestiranja.takmicarskaGrupaId = zadatak.takmicarskeGrupeId;
                                                                                        res.end(JSON.stringify({
                                                                                            'success' : 'yes',
                                                                                            'autotestovi' : autotestoviZaVratit, 
                                                                                            'rezultat' : rezultatTestiranja
                                                                                        }));
                                                                                    })
                                                                                    .catch(error => {
                                                                                        console.log(error);
                                                                                        res.end(JSON.stringify( Odgovori.SERVER_ERROR));
                                                                                    });
                                                                                })
                                                                                .catch(error => {
                                                                                    console.log(error);
                                                                                    res.end(JSON.stringify(Odgovori.SERVER_ERROR));
                                                                                })
                                                                            }
                                                                        }
                                                                        else {
                                                                            console.log(error);
                                                                            res.end(JSON.stringify(Odgovori.SERVER_ERROR));
                                                                        }
                                                                    });
                                                                }
                                                                else {
                                                                    console.log(error);
                                                                    res.end(JSON.stringify( Odgovori.SERVER_ERROR));
                                                                }
                                                            });
                                                        }
                                                    }
                                                })
                                                .catch(error => {
                                                    console.log(error);
                                                    res.end(JSON.stringify(Odgovori.SERVER_ERROR));
                                                });
                                            })
                                            .catch(error => {
                                                console.log(error);
                                                res.end(JSON.stringify(Odgovori.SERVER_ERROR));
                                            });
                                        })
                                        .catch(error => {
                                            console.log(error);
                                            res.end(JSON.stringify( Odgovori.SERVER_ERROR));
                                        });
                                    })
                                    .catch(error => {
                                        console.log(error);
                                        res.end(JSON.stringify(Odgovori.SERVER_ERROR));
                                    });
                                })
                               .catch(error => {
                                   console.log(error);
                                   res.end(JSON.stringify(Odgovori.SERVER_ERROR));
                               })
                            }
                        }
                        else if(rezultatTestiranja.status == 3) {
                            
                            var autotestoviZaVratiti = [];
                            if (akcija == null) {
                                Verzije.update({
                                    compileResult : rezultatTestiranja.compile_result.status,
                                    compileResult_output : rezultatTestiranja.compile_result.output
                                }, {
                                    where : {
                                        id : req.query.verzijaId
                                    }
                                });
                                Autotestovi.findAll({
                                    where : {
                                        zadaciId : idZadatka
                                    }
                                })
                                .then(at => {
                                    //let i = 0;
                                    for (let i = 1; i <= at.length; i++) {
                                        var autotest ={
                                            'compile_result' : {
                                                'status' : -1
                                            },
                                            'run_result' : {
                                                'status' : -1,
                                                'output' : 'Program se ne može kompajlirati'
                                            },
                                            'status' : -1
                                        };
                                        autotest.verzijeId = req.query.verzijaId;
                                        autotest.zadatakId = idZadatka;
                                        autotest.id = i;
                                        AutotestoviRezultati.dodajRezultat(autotest, function(success, data) {
                                            if (success) {
                                                autotest.ulaz = data.ulaz;
                                                autotest.ocekivaniIzlaz = data.ocekivaniIzlaz;
                                                AutotestoviRezultati.bodoviUpdate(data.id, 0, function(_success, _data) {
                                                    if (_success) {
                                                        autotest.bodovi = 0;                                      
                                                        autotestoviZaVratiti.push(autotest);   
                                                        if (i == at.length) {
                                                            Zadaci.findOne({
                                                                attributes : ['takmicarskeGrupeId'],
                                                                where : {
                                                                    id : idZadatka
                                                                }
                                                            })
                                                            .then(zadatak => {  
                                                                TakmicarskeGrupe.findOne({
                                                                    where : {
                                                                        id : zadatak.takmicarskeGrupeId
                                                                    }
                                                                })
                                                                .then(grupa => {
                                                                    rezultatTestiranja.takmicenjeId = grupa.takmicenjaId;
                                                                    rezultatTestiranja.takmicarskaGrupaId = zadatak.takmicarskeGrupeId;
                                                                    res.end(JSON.stringify({
                                                                        'success' : 'yes',
                                                                        'autotestovi' : autotestoviZaVratiti, 
                                                                        'rezultat' : rezultatTestiranja
                                                                    }));
                                                                })
                                                                .catch(error => {
                                                                    console.log(error);
                                                                    res.end(JSON.stringify(Odgovori.SERVER_ERROR));
                                                                });
                                                            })
                                                            .catch(error => {
                                                                console.log(error);
                                                                res.end(JSON.stringify(Odgovori.SERVER_ERROR));
                                                            });
                                                        }
                                                    }
                                                    else   {
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
                                })
                                .catch(error => {
                                    console.log(error);
                                    res.end(JSON.stringify(Odgovori.SERVER_ERROR));
                                });
                            }

                        }
                        else { 
                            res.end(JSON.stringify({
                                'success' : 'no',
                                'data' : rezultatiTestiranja.glavniRezultat(rezultatTestiranja.status)
                            }));
                        } 
                    }
                    else   
                        res.end(JSON.stringify(Odgovori.BUILDSERVICE_ERROR));
                }
                else 
                    res.end(JSON.stringify(Odgovori.BUILDSERVICE_ERROR));  
            }
        else
            res.end(JSON.stringify(Odgovori.BUILDSERVICE_ERROR));

        });
    }
}