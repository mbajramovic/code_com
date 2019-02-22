const express = require('express');
const router = express.Router();
const Sequelize = require('sequelize');
const sequelize = require('../../client/src/base/baza.js');

const {Zadaci, Autotestovi} = sequelize.import('../../client/src/base/models/Models');

router.post('/', function(req, res) {
    var autotest = req.body;
    Autotestovi.dodajAutotest(autotest, function(success, data) {
        res.end(JSON.stringify({
            'success' : success,
            'data' : data
        }));
    });

})

module.exports = router;