const sequelize = require('../../../client/src/base/baza.js');
var request = require('request');

const buildConfig = require('../../../configfiles/buildservice.json').buildservice;
const buildervice_url = require('../../../configfiles/buildservice_url.json').buildservice;

const Odgovori = require('../../ServerOdgovori.js');
const {Autotestovi, Task, ZadatakTask} = sequelize.import('../../../client/src/base/models/Models');
var takmicenjeId = -1;

module.exports = {
    addTask : function(_taskId) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                Task.findOne({
                    where : {
                        id : _taskId
                    }
                })
                .then(task => {
                    Autotestovi.findAll({
                        where : {
                            zadaciId : task.zadaciId,
                            language : task.language
                        },
                        order : [
                            ['id', 'ASC']
                        ]
                    })
                    .then(autotestovi => {
                        var testovi = [];
                        for (let i = 0; i < autotestovi.length; i++) {
                            let expected = [];
                            for (var k = 0; ; k++) {
                                if (autotestovi[i].expected[k.toString()] != null) {
                                    var expectedValue = autotestovi[i].expected[k.toString()];
                                    expectedValue = expectedValue.replace(/\%0A/g, "\n");
                                    console.log(expectedValue);
                                    expected.push(expectedValue);
                                    console.log("pushed");
                                }
                                else
                                    break;
                            }
                            
                            var testSpecification = autotestovi[i].dataValues;
                            testSpecification.running_params = {'stdin' : (testSpecification.stdin).replace("%0A", "\n"), 'timeout' : testSpecification.timeout, 'vmem' : testSpecification.vmem == null ? 0 : testSpecification.vmem};
                            console.log(testSpecification.expected);
                            testSpecification.expected = (expected);
                            console.log(testSpecification.expected); 
        
                            testSpecification.expected_exception = testSpecification.expected_exception ? "true" : "false";
                            testSpecification.expected_crash = testSpecification.expected_crash ? "true" : "false";
                            testSpecification.ignore_whitespace = testSpecification.ignore_whitespace ? "true" : "false";
                            testSpecification.regex = testSpecification.regex ? "true" : "false";
                            testSpecification.substring = testSpecification.substring ? "true" : "false";
                            testSpecification.require_symbols = [];
                            testSpecification.replace_symbols = [];
                            if (task.dataValues.language === 'QBasic')
                                testSpecification.running_params.use_pipes = "true";
                            testSpecification.id = testSpecification._id;
                            testovi.push(testSpecification);
                        }
                        
                        
                        task.dataValues.compiler_features = [];
                        task = task.dataValues;
                        task.test_specifications = testovi;
                        task.running_params = {'timeout' : 10, 'vmem' : 1000};
                        task.language = (task.language); 
                        task.compiler_features = [];
                        task.compile = task.compile ? "true" : "false";
                        task.run = task.run ? "true" : "false";
                        task.test = task.test ? "true" : "false";
                        task.profile = task.profile ? "true" : "false";
                        task.debug = task.debug ? "true" : "false";
                        if (task.language[0] === 'C' && task.language.length > 1)
                            task.language = "C++";
                        console.log(JSON.stringify(task));
			var v = {task : JSON.stringify(task)};
	                request.post((buildervice_url.url + '/push.php?action=setTask'), {formData : v}, 
                            function(error, response, body) {
				console.log(body);
                                if (!error && response.statusCode == 200) {
                                    console.log(body);
                                    let taskId = JSON.parse(body).data.id;
                                    ZadatakTask.destroy({
                                        where : {
                                            zadaciId : task.zadaciId,
                                            taskId : taskId,
                                            language : decodeURIComponent(task.language)
                                        }
                                    })
                                    .then(destroyed => {
                                        ZadatakTask.create({
                                            zadaciId : task.zadaciId,
                                            taskId : taskId,
                                            language : decodeURIComponent(task.language)
                                        })
                                        .then(created => {
                                            resolve(JSON.stringify({
                                                'success' : 'yes'
                                            }));
                                        })
                                        .catch(error => {
                                            console.log(error);
                                            reject(JSON.stringify(Odgovori.SERVER_ERROR));
                                        });
                                    })
                                    .catch(error => {
                                        console.log(error);
                                        reject(JSON.stringify(Odgovori.SERVER_ERROR));
                                    });
                                }
                                else   {
                                    console.log(error);
                                    reject(JSON.stringify(Odgovori.BUILDSERVICE_ERROR));
                                }
                        });
                    })
                    .catch(error => {
                        console.log(error);

                        reject(JSON.stringify(Odgovori.SERVER_ERROR));
                    });
                })
                .catch(error => {
                    console.log(error);

                    reject(JSON.stringify(Odgovori.SERVER_ERROR));
                });
            }, 5000);
        });
    }
}
