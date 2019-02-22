const express = require('express');
const router = express.Router();
const Sequelize = require('sequelize');
const sequelize = require('../../client/src/base/baza.js');
const multer = require('multer');
var upload = multer({ dest: 'uploads/' });
var parse = require('csv-parse');
var fs = require('fs');
var task = require('./task.json');
var request = require('request');
const axios = require('axios');
var FormData = require('form-data');
var buildConfig = require('../../configfiles/buildservice.json').buildservice;

//var Archiver = require('archiver');
const {Zadaci, Autotestovi} = sequelize.import('../../client/src/base/models/Models');
 
router.post('/', upload.single('file'), function(req, res) {
   var testovi = [];
    let i = 1;
    Autotestovi.destroy({ where : { zadaciId : req.body.id }});
    fs.createReadStream('uploads/' + req.file.filename)
    .pipe(parse({delimiter : ','}))
    .on('data', function(autotest) {
        var testSpecification = {'id' : i, 'code' : '_main();', 'expected' : '', 'substring' : 'false', 'regex' : 'false', 'require_symbols' : [], 'replace_symbols' : [], 'global_top' : "", 'global_above_main' : "",  'expected_crash' : "false"}
        testSpecification.running_params = {'stdin' : autotest[1], 'timeout' : ''};
        testovi.push(testSpecification);
        var autotest = {'naziv' : i.toString(), 'ulaz' : autotest[1], 'skriven' : autotest[2], 'bodovi' : autotest[3], 'zadatakId' : req.body.id};
        Autotestovi.dodajAutotest(autotest, function(success, data) { 
            if (!success) {
                console.log(data);
            }
        });
        i++;
    })
    .on('end', function() {
        task.test_specifications = testovi;
        console.log(task);
        request.get(
            'http://' + buildConfig.hostname + ':' + buildConfig.port + '/push.php?action=setTask&task=' + JSON.stringify(task),
            function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    Zadaci.findOne({
                        attributes : ['tacnoRjesenje'],
                        where : {
                            id : req.body.id
                        }
                    })
                    .then(zadatak =>{
                        if (zadatak) {         
                            var file = fs.readFileSync('uploads/' + zadatak.tacnoRjesenje);
                            var odgovor = JSON.parse(body);

                            if (odgovor.success == 'true') {
                                res.end(JSON.stringify({'file' : file.toString(), 'taskId' : odgovor.data.id, 'brojAutotestova' : i}));
                                //res.end(file.toString());
                            }
                        } 
                        else {

                        }
                    })
                    .catch(error => {

                    })
                }
                else 
                    res.end(JSON.stringify({'success' : null, 'data' : response.statusCode}));
            }
        );
    })
    .on('error', function() {
        res.end(JSON.stringify({
            'success' : null
        }))
    });

  
});


module.exports = router;