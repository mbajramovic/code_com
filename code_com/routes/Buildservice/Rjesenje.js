const express = require('express');
const router = express.Router();
const Sequelize = require('sequelize');
const sequelize = require('../../client/src/base/baza.js');
var fs = require('fs');
var multer = require('multer');
var upload = multer({ dest: 'uploads/verzije/' });

const buildConfig = require('../../configfiles/buildservice.json').buildservice;
var rezultatiTestiranja = require('./RezultatiTestiranja.js');
const Sesija = require('../PomocneRute/Sesija.js');
const Odgovori = require('../ServerOdgovori.js');

const {Zadaci, Autotestovi, Verzije} = sequelize.import('../../client/src/base/models/Models');

router.post('/', upload.single('file'), function(req, res) {
    var korisnik = {korisnickoIme : req.body.korisnickoIme, token : req.body.token};
    if(req.session.rola == 'ucesnik' && Sesija.isOK(korisnik)) {
        if (req.file) {
            var verzija = {'filename' : req.file.filename, 'zadaciId' : req.body.zadatakId, 'ucesniciId' : req.body.ucesnikId, 'programId' : -1};
            Verzije.novaVerzija(verzija, function(success, data) {
                if (success) {
                    var rjesenje = fs.readFileSync('uploads/verzije/' + req.file.filename);
                    res.end(JSON.stringify({
                        'success' : 'yes',
                        'rjesenje' : rjesenje.toString(),
                        'id' : data.id
                    }));
                }
                else {
                    console.log(data);
                    res.end(JSON.stringify(Odgovori.SERVER_ERROR));
                }
            });
        }
        else
            res.end(JSON.stringify(Odgovori.NO_FILE));
    }
    else
        res.end(JSON.stringify(Odgovori.UNAUTHORIZED));
});

module.exports = router;