const express = require('express');
const router = express.Router();
const Sequelize = require('sequelize');
const sequelize = require('../../client/src/base/baza.js');
const multer = require('multer');
var upload = multer({ dest: 'uploads/' });
var parse = require('csv-parse');
var request = require('request');
var FormData = require('form-data');
var fs = require('fs');
const buildConfig = require('../../configfiles/buildservice.json').buildservice;
const Odgovori = require('../ServerOdgovori.js');
const {Zadaci, Autotestovi} = sequelize.import('../../client/src/base/models/Models');


router.post('/', upload.single('file'), function(req, res, next) {
    var formdata = {
        name : 'program',
        task : req.body.id,
        program : fs.createReadStream(req.file.path)
    };
    request.post('http://' + buildConfig.hostname + ':' + buildConfig.port + '/push.php?action=addProgram', {formData : formdata}, function(err, ress, body) {
        if (!error && ress.statusCode == 200) {
            var odgovor = JSON.parse(body);
            if (odgovor.success == 'true') {
                var programId = odgovor.data.id;// id poslanog programa   
                res.end(JSON.stringify({
                    'success' : 'yes',
                    'id' : programId
                }));
            }
            else {
                res.end(JSON.stringify(Odgovori.BUILDSERVICE_ERROR));
            }
        }
        else 
            res.end(JSON.stringify(Odgovori.BUILDSERVICE_ERROR));
    }); 
});

module.exports = router;