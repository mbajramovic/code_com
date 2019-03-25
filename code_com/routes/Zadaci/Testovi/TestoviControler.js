const sequelize = require('../../../client/src/base/baza.js');
//const {Ucesnici, Korisnici, AdminiZaTakmicenja} = sequelize.import('../client/src/base/models/Models.js');
const Buildservice = require('./Buildservice.js');
const { Task, Autotestovi } = sequelize.import('../../../client/src/base/models/Models.js');


module.exports = {
    openGenerator : function(req, res) {
       // Helpers.openGenerator('','/autotestovi', true);
    },

    postAutotestovi : function(req, res) {
        var task = req.body.file;
        var zadaciId = req.body.zadaciId;
        task.compiler_features = task.compiler_features.toString();
        task.zadaciId = zadaciId;
        Task.findOne({
            where : {
                zadaciId : zadaciId,
                language : task.language
            }
        })
        .then(_task => {
            if (_task) {
                let autotestovi = task.test_specifications;
                Task.updateTask(task, function(success, data) {
                    Autotestovi.destroy({
                        where : {
                            zadaciId : -1,
                            language : task.language
                        }
                    })
                    .then(destroyed => {
                        if (autotestovi.length == 0) 
                            azurirajAutotestove(task, autotestovi, _task.id);
                        else 
                            for (let i = 0; i < autotestovi.length; i++) {
                                let autotest = autotestovi[i];
                                console.log(autotest.id);
                                autotest.running_params.vmem = autotest.running_params.vmem == null ? '' : autotest.running_params.vmem;
                                autotest.running_params.timeout = autotest.running_params.timeout == null ? '' : autotest.running_params.timeout;
                                /*autotest.require_symbols = autotest.require_symbols.toString();
                                autotest.replace_symbols = autotest.replace_symbols.toString();*/
                                autotest.zadaciId = zadaciId;
                                autotest.language = task.language;
                                /*var expected = {};
                                for (let j = 0; j < autotest.expected.length; j++)
                                expected[j.toString()] = autotest.expected[j];
                                autotest.expected = expected;*/
                            
                                    /*if (_autotest) {
                                        Autotestovi.updateAutotest(autotest, function(success, data) {
                                            console.log(data);
                                        }); 
                                    }
                                    else {
                                        Autotestovi.dodajAutotest(autotest, function(success,data) {
        
                                        });
                                    }*/
                                    Autotestovi.findOne({
                                        where : {
                                            _id : autotest.id,
                                            language : task.language,
                                            zadaciId : zadaciId
                                        }
                                    })
                                    .then(at => {
                                        if (at == null) {
                                            Autotestovi.dodajAutotest(autotest, function(success, data) {
                                                if (i == autotestovi.length - 1) {
                                                azurirajAutotestove(task, autotestovi, _task.id);
                                                }
                                            });
                                        }
                                        else {
                                            Autotestovi.updateAutotest(autotest, function(success, data) {
                                                if (i == autotestovi.length - 1)
                                                    azurirajAutotestove(task, autotestovi, _task.id); 
                                            });
                                        }
                                    })
                            }
                    })
                });
            }
            else {
                let autotestovi = task.test_specifications;
                /*for (let j = 0; j < 4; j++) {
                    let jezik;
                    switch(j) {
                        case 0:
                            task.language = 'C'; 
                            jezik = 'C';
                            break;
                        case 1:
                            task.language = 'C++';
                            jezik = 'C++';
                            break;
                        case 2:
                            task.language = 'QBasic'; 
                            jezik = 'QBasic'; 
                            break;
                        case 3:
                            task.language = 'Pascal';
                            jezik = 'Pascal';
                            break;
                    }*/

                    Task.dodajTask(task, function(success, data) {
                        for (let i = 0; i < autotestovi.length; i++) {
                            let autotest = autotestovi[i];
                            console.log(autotest);

                            autotest.zadaciId = zadaciId;
                            autotest.language = task.language;
                       
                            Autotestovi.dodajAutotest(autotest, function(success, _data) {
                                if (i == autotestovi.length - 1) {
                                    Buildservice.addTask(data.id)
                                    .then(odgovor => {
                                        console.log(odgovor);
                                    })
                                    .catch(error => {
                                        console.log(error);
                                    });
                                }
                            }); 
                        }
                        
                    });
                }
            //}
        });
    },

    getAutotestovi : function(req, res) {
        var zadaciId = req.query.zadaciId;
        var jezik = req.query.jezik.length == 3 && req.query.jezik[2] == ' ' && req.query.jezik[0] == 'C' ? 'C++' : req.query.jezik;
        console.log(jezik);
        Task.findOne({
            where : {
                zadaciId : zadaciId,
                language : jezik
            }
        })
        .then(task => {
            if (task) {
            Autotestovi.findAll({
                where : {
                    zadaciId : zadaciId,
                    language : task.language
                }
            })
            .then(autotestovi => {
                var autotestoviArray = [];
                for(let i = 0; i < autotestovi.length; i++) {
                    autotestovi[i].dataValues.running_params = {
                        'timeout' : autotestovi[i].dataValues.timeout,
                        'vmem' : autotestovi[i].dataValues.vmem,
                        'stdin' : autotestovi[i].dataValues.stdin
                    };
                    autotestovi[i].dataValues.expected_exception = autotestovi[i].dataValues.expected_exception.toString();
                    autotestovi[i].dataValues.expected_crash = autotestovi[i].dataValues.expected_crash.toString();
                    autotestovi[i].dataValues.ignore_whitespace = autotestovi[i].dataValues.ignore_whitespace.toString();
                    autotestovi[i].dataValues.regex = autotestovi[i].dataValues.regex.toString();
                    autotestovi[i].dataValues.substring = autotestovi[i].dataValues.substring.toString();
                    autotestovi[i].dataValues.id = autotestovi[i].dataValues._id;
                    /*var expected = [];

                    for (let j = 0;;j++) {
                        if (autotestovi[i].expected[j.toString()] != null)
                            expected.push(autotestovi[i].expected[j.toString()]);
                        else
                            break;
                    }*/
                    autotestovi[i].dataValues.expected = jsonToArray(autotestovi[i].dataValues.expected);
                    autotestovi[i].dataValues.replace_symbols = jsonToArray(autotestovi[i].dataValues.replace_symbols);
                    autotestovi[i].dataValues.require_symbols = jsonToArray(autotestovi[i].dataValues.require_symbols);
                }
                task.dataValues.test_specifications = autotestovi;
                    // zbog servisa za kreiranje testova
                task.dataValues.compile = task.dataValues.compile.toString();
                task.dataValues.run = task.dataValues.run.toString();
                task.dataValues.test = task.dataValues.test.toString();
                task.dataValues.profile = task.dataValues.profile.toString();
                task.dataValues.debug = task.dataValues.debug.toString();

                task.dataValues.compiler_features = jsonToArray(task.dataValues.compiler_features);
                res.send(JSON.stringify(task));
            });
            }
            else {
                Task.findOne({
                    where : {
                        zadaciId : zadaciId
                    }
                })
                .then(task => {
                    if (task) {
                        Autotestovi.findAll({
                            where : {
                                zadaciId : zadaciId,
                                language : task.language
                            }
                        })
                        .then(autotestovi => {
                            var autotestoviArray = [];
                            for(let i = 0; i < autotestovi.length; i++) {
                                autotestovi[i].dataValues.running_params = {
                                    'timeout' : autotestovi[i].dataValues.timeout,
                                    'vmem' : autotestovi[i].dataValues.vmem,
                                    'stdin' : autotestovi[i].dataValues.stdin
                                };
                                autotestovi[i].dataValues.expected_exception = autotestovi[i].dataValues.expected_exception.toString();
                                autotestovi[i].dataValues.expected_crash = autotestovi[i].dataValues.expected_crash.toString();
                                autotestovi[i].dataValues.ignore_whitespace = autotestovi[i].dataValues.ignore_whitespace.toString();
                                autotestovi[i].dataValues.regex = autotestovi[i].dataValues.regex.toString();
                                autotestovi[i].dataValues.substring = autotestovi[i].dataValues.substring.toString();
                                autotestovi[i].dataValues.id = autotestovi[i].dataValues._id;
                                /*var expected = [];
            
                                for (let j = 0;;j++) {
                                    if (autotestovi[i].expected[j.toString()] != null)
                                        expected.push(autotestovi[i].expected[j.toString()]);
                                    else
                                        break;
                                }*/
                                autotestovi[i].dataValues.expected = jsonToArray(autotestovi[i].dataValues.expected);
                                autotestovi[i].dataValues.replace_symbols = jsonToArray(autotestovi[i].dataValues.replace_symbols);
                                autotestovi[i].dataValues.require_symbols = jsonToArray(autotestovi[i].dataValues.require_symbols);
                            }
                            task.dataValues.test_specifications = autotestovi;
                                // zbog servisa za kreiranje testova
                            task.dataValues.compile = task.dataValues.compile.toString();
                            task.dataValues.run = task.dataValues.run.toString();
                            task.dataValues.test = task.dataValues.test.toString();
                            task.dataValues.profile = task.dataValues.profile.toString();
                            task.dataValues.debug = task.dataValues.debug.toString();
            
                            task.dataValues.compiler_features = jsonToArray(task.dataValues.compiler_features);
                            Task.findAll({
                                where : {
                                    zadaciId : zadaciId
                                }
                            })
                            .then(tasks => {
                                task.dataValues.id = task.id + tasks.length;
                                res.send(JSON.stringify(task));
                            });
                        });
                    }
                    else    
                        res.end();
                })
            }
        })
    }
} 

jsonToArray = function(json) {
    var array = [];
    for (let i = 0;;i++) {
        if (json[i.toString()] != null)
            array.push(json[i.toString()]);
        else
            break;
    }

    return array;
}

azurirajAutotestove = function(task, autotestovi,id) {
    Autotestovi.findAll({
        where : {
            zadaciId : task.zadaciId,
            language : task.language
        }
    })
    .then(ats => {
        if (ats.length != autotestovi.length) {
            for (let i = 0; i < ats.length; i++) {
                Autotestovi.findOne({
                    where : {
                        language : task.language, 
                        zadaciId : task.zadaciId,
                        _id : i+1
                    }
                })
                .then(att => {
                    if (att != null && (i+1) > autotestovi.length) {
                        Autotestovi.destroy({
                            where : {
                                _id : i+1,
                                zadaciId : task.zadaciId,
                                language : task.language
                            }
                        })
                        .then(destroyed => {
                            if (i == ats.length - 1) {
                                console.log('kkk');
                                Buildservice.addTask(id)
                                .then(odgovor => {
                                    console.log(odgovor);
                                })
                                .catch(error => {
                                    console.log(error);
                                });
                            }
                        });
                    }
                });
            }
        }
        else {
            Buildservice.addTask(id)
            .then(odgovor => {
                console.log(odgovor);
            })
            .catch(error => {
                console.log(error);
            });
        }
    });
}