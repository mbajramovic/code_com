const express = require('express');
const router = express.Router();
const Sequelize = require('sequelize');
const sequelize = require('../../client/src/base/baza.js');
var request = require('request');
const buildConfig = require('../../configfiles/buildservice.json').buildservice;
const buildervice_url = require('../../configfiles/buildservice_url.json').buildservice;
var rezultatiTestiranja = require('./RezultatiTestiranja.js');
const Odgovori = require('../ServerOdgovori.js');
var fs = require('fs');
var multer = require('multer');
var upload = multer({ dest: 'uploads/verzije/' });

const Sesija = require('../PomocneRute/Sesija.js');
const {Zadaci, Autotestovi, Verzije, ZadatakTask} = sequelize.import('../../client/src/base/models/Models');

router.post('/', upload.single('file'), function(req, res) {
    var korisnik = {korisnickoIme : req.body.korisnickoIme, token : req.body.token};
    if((req.session.rola == 'ucesnik' && Sesija.isOK(korisnik) || req.session.rola == 'admin_takmicenja')) {
        var verzijaId = req.body.id;
        var zadId = req.body.zadatakId;
        var language = req.body.language;
        ZadatakTask.findOne({
            attributes : ['taskId'],
            where : {
                zadaciId : zadId,
                language : language
            } 
        })
        .then(zadatak => {
            console.log(zadatak.taskId);
            var formdata = {
                name : 'program', 
                task : zadatak.taskId, 
                program : fs.createReadStream(req.file.path)
            };
            request.post((buildervice_url.url + '/push.php?action=addProgram'), {formData : formdata}, function(err, ress, body) {
                if (!err && ress.statusCode == 200) {
                    try {
                        var odgovor = JSON.parse(body);
                        
                        if (odgovor.success == 'true') {
                            var programId = odgovor.data.id;
                            Verzije.findOne({
                                where : { 
                                    id : verzijaId
                                }
                            })
                            .then(verzija => {
                                verzija.updateAttributes({
                                    programId : programId
                                })
                                .then(done => {
                                    res.end(JSON.stringify({
                                        'success' : 'yes',
                                        'vrijeme' : verzija.createdAt,
                                        'programId' : programId
                                    }));
                                })
                            })
                            .catch(error => {
                                console.log(error);
                                res.end(JSON.stringify(Odgovori.SERVER_ERROR));
                            })
                        }
                        else {
                            res.end(JSON.stringify(Odgovori.BUILDSERVICE_ERROR));
                        }
                    }
                    catch(error) {
                        res.end(JSON.stringify(Odgovori.BUILDSERVICE_ERROR));
                    }
                }
                else
                    res.end(JSON.stringify(Odgovori.BUILDSERVICE_ERROR));
            }); 
        
        })
        .catch(error => {
            console.log(error);
            res.end(JSON.stringify(Odgovori.BUILDSERVICE_ERROR));
        });
    }
    else
        res.end(JSON.stringify(Odgovori.UNAUTHORIZED));
});

module.exports = router;