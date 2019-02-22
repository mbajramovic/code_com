const express = require('express');
const router = express.Router();
const Sequelize = require('sequelize');
const sequelize = require('../../client/src/base/baza.js');
const multer = require('multer');
var upload = multer({ dest: 'uploads/' });
const fs = require('fs');
//const {Ucesnici, Korisnici, AdminiZaTakmicenja} = sequelize.import('../client/src/base/models/Models.js');
const { Zadaci } = sequelize.import('../../client/src/base/models/Models.js');


router.post('/', upload.single('file'), function(req, res) {
    if (req.file) {
        Zadaci.findOne({ 
            where: { 
                id: req.body.id 
            } 
        })
        .then(zadatak =>  {
          if (zadatak) {
            zadatak.updateAttributes({
              tacnoRjesenje: req.file.filename,
              tacnoRjesenje_originalName : req.file.originalname
            })
            .then(done => {
                var rjesenje = fs.readFileSync('uploads/' + req.file.filename);
                res.end(JSON.stringify({
                    'success' : 'yes',
                    'data' : req.file.originalname,
                    'tacnoRjesenje' : rjesenje.toString()
                }));
            })
            .catch(error => {
                res.end(JSON.stringify({
                'success' : null,
                'data' : error.message
            }));
            });
          }
        });
    }
});

module.exports = router;