
const sequelize = require('../../client/src/base/baza.js');
var request = require('request');

const buildConfig = require('../../configfiles/buildservice.json').buildservice;
const buildervice_url = require('../../configfiles/buildservice_url.json').buildservice;

const Odgovori = require('../ServerOdgovori.js');
const Sesija = require('../PomocneRute/Sesija.js');
const {Zadaci, Autotestovi, Takmicenja, TakmicarskeGrupe, Task, ZadatakTask} = sequelize.import('../../client/src/base/models/Models');
var takmicenjeId = -1;

module.exports = {
    
    otvoriTakmicenje : function(req, res) {
        var korisnik = {korisnickoIme : req.body.korisnickoIme, token : req.body.token};
        if(req.session.rola == 'admin_takmicenja' && Sesija.isOK(korisnik)) {
            takmicenjeId = req.body.id,
            vrijeme = req.body.vrijeme;

            TakmicarskeGrupe.findAll({
                attributes : ['id'],
                where : {
                    takmicenjaId : takmicenjeId
                }
            })
            .then(takmicarskeGrupeIDs => {
                var takmicarskeGrupe = [];
                for (var k = 0; k < takmicarskeGrupeIDs.length; k++)
                    takmicarskeGrupe.push(takmicarskeGrupeIDs[k].id);
                Zadaci.findAll({
                    attributes : ['id'],
                    where : {
                        takmicarskeGrupeID : takmicarskeGrupe
                    }
                })
                .then(zadaciIDs => {
                    if (zadaciIDs.length > 0) {
                        var zadaci = Array.from(zadaciIDs);
                        for (let i = 0; i < zadaci.length; i++) {
                            Task.findAll({
                                where : {
                                    zadaciId : zadaci[i].id
                                }
                            })
                            .then(tasks => {
                            if (tasks.length == 0) {
                                res.end(JSON.stringify(Odgovori.NO_TESTS));
                                return;
                            }
                            for (let ii = 0; ii < tasks.length; ii++) {
                               
                            Autotestovi.findAll({
                                where : {
                                    zadaciId : zadaci[i].id,
                                    language : tasks[ii].language
                                },

                                order : [
                                    ['id', 'ASC']
                                ]
                            })
                            .then(autotestovi => {
                                if (autotestovi.length == 0) {
                                        res.end(JSON.stringify(Odgovori.NO_TESTS));
                                        return;
                                    }
                                else {
                                    //if (i == autotestovi.length - 1) { //??
                                    var testovi = [];
                                    for (let j = 0; j < autotestovi.length; j++) {
                                        let expected = [];
                                        for (var k = 0;;k++) {
                                            if (autotestovi[j].expected[k.toString()] != null)
                                                expected.push(autotestovi[j].expected[k.toString()]);
                                            else
                                                break;
                                        }
                                        var testSpecification = autotestovi[j].dataValues;/* {'id' : (j + 1).toString(), 'code' : '_main();', 'expected' : [autotestovi[j].izlaz], 'substring' : 'false', 'regex' : 'false', 'require_symbols' : [], 
                                                                'replace_symbols' : [], 'global_top' : "", 'global_above_main' : "", "expected_exception" : "false", "ignore_whitespace" : "false",
                                                                "expected_crash" : "false", "debug" : "true"};*/
                                        testSpecification.running_params = {'stdin' : testSpecification.stdin, 'timeout' : testSpecification.timeout, 'vmem' : testSpecification.vmem == null ? 0 : testSpecification.vmem};
                                        testSpecification.expected = expected;

                                        testSpecification.expected_exception = testSpecification.expected_exception ? "true" : "false";
                                        testSpecification.expected_crash = testSpecification.expected_crash ? "true" : "false";
                                        testSpecification.ignore_whitespace = testSpecification.ignore_whitespace ? "true" : "false";
                                        testSpecification.regex = testSpecification.regex ? "true" : "false";
                                        testSpecification.substring = testSpecification.substring ? "true" : "false";
                                        testSpecification.require_symbols = [];
                                        testSpecification.replace_symbols = [];
                                        testSpecification.id = testSpecification._id;
                                        testovi.push(testSpecification);
                                    }
                                    var task = tasks[ii];
                                    task.dataValues.compiler_features = [];
                                    task = task.dataValues;
                                    task.running_params = {'timeout' : 10, 'vmem' : 1000};
                                    task.test_specifications = testovi;
                                    
                                    task.compiler_features = [];
                                    task.compile = task.compile ? "true" : "false";
                                    task.run = task.run ? "true" : "false";
                                    task.test = task.test ? "true" : "false";
                                    task.profile = task.profile ? "true" : "false";
                                    task.debug = task.debug ? "true" : "false";
                                    request.get(
                                        buildervice_url.url + '/push.php?action=setTask&task=' + JSON.stringify(task),
                                        function(error, response, body) {
                                            if (!error && response.statusCode == 200) {
                                                let taskId = JSON.parse(body).data.id;
                                                ZadatakTask.destroy({
                                                    where : {
                                                        zadaciId : zadaci[i].id,
                                                        taskId : taskId,
                                                        language : task.language
                                                    }
                                                })
                                                .then(destroyed => {
                                                    ZadatakTask.create({
                                                        zadaciId : zadaci[i].id,
                                                        taskId : taskId,
                                                        language : task.language
                                                    })
                                                    .then(done => {
                                                        if (i == zadaci.length - 1) {
                                                            if (vrijeme != null) {
                                                                Takmicenja.findOne({
                                                                    where : {
                                                                        id : takmicenjeId
                                                                    }
                                                                })
                                                                .then(takmicenje => {
                                                                    var dateTime = new Date();
                                                                    dateTime.setHours(dateTime.getHours() + parseInt(vrijeme.sati));
                                                                    dateTime.setMinutes(dateTime.getMinutes() + parseInt(vrijeme.minute));
                                                                    
                                                                    Takmicenja.update(
                                                                    {
                                                                        trajanje : dateTime,
                                                                        aktivno : true,
                                                                        zavrseno : false
                                                                    },
                                                                    {
                                                                            where : {
                                                                                id : takmicenjeId
                                                                            }
                                                                    })
                                                                    .then(done => {
                                                                        //update();
                                                                        res.end(JSON.stringify({
                                                                            'success' : 'yes',
                                                                            'sekunde' : parseInt(vrijeme.minute) * 60 + parseInt(vrijeme.sati) * 3600
                                                                        }));
                                                                        return;
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
                                                            else {
                                                                res.end(JSON.stringify({
                                                                    'success' : 'yes'
                                                                }));
                                                            }
                                                        }
                                                    })
                                                    .catch(error => {
                                                        console.log(error);

                                                        res.end(JSON.stringify(Odgovori.SERVER_ERROR));
                                                        
                                                    });
                                                });
                                            }
                                            else { 
                                                console.log(error);
                                                res.end(JSON.stringify(Odgovori.BUILDSERVICE_ERROR));}
                                        }
                                    
                                    )
                                }
                            })
                            .catch(error => {
                                console.log(error);

                                res.end(JSON.stringify(Odgovori.SERVER_ERROR));
                            });
                        }
                    
                        })
                        .catch(error => {
                            console.log(error);

                            res.end(JSON.stringify(Odgovori.SERVER_ERROR));     
                        });
                        }
                    }
                    else
                        res.end(JSON.stringify(Odgovori.NO_TASKS));
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
        else
            res.end(JSON.stringify(Odgovori.UNAUTHORIZED));
    }
}

function update() {
    Takmicenja.findOne({
        where : {
            id : takmicenjeId
        }
    })
    .then(takmicenje => {
        takmicenje.update({
            trajanje : takmicenje.trajanje - 1
        })
        .then(done => {
            if (takmicenje.trajanje > 0)
                setTimeout(update, 1000);
        })
    })
}
