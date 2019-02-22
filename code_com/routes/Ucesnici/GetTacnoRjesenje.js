const express = require('express');
const router = express.Router();
const Sequelize = require('sequelize');
const sequelize = require('../../client/src/base/baza.js');
const multer = require('multer');
var upload = multer({ dest: 'uploads/' });
const fs = require('fs');
//const {Ucesnici, Korisnici, AdminiZaTakmicenja} = sequelize.import('../client/src/base/models/Models.js');
const Odgovori = require('../ServerOdgovori.js');
const { Verzije } = sequelize.import('../../client/src/base/models/Models.js');

router.get('/', function(req, res) {
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
})

module.exports = router;