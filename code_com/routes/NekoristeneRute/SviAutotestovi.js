const express = require('express');
const router = express.Router();
const Sequelize = require('sequelize');
const sequelize = require('../../client/src/base/baza.js');
const { Autotestovi } = sequelize.import('../../client/src/base/models/Models.js');

router.get('/', function(req, res) {
    var id = req.query.id;

    Autotestovi.findAll({
        where : {
            zadaciId : id
        }
    })
    .then(autotestovi => {
        if (autotestovi)
            res.end(JSON.stringify({
                'success' : 'yes',
                'autotestovi' : autotestovi
            }));
    })
    .catch(error => {
        res.end(JSON.stringify({
            'success' : null,
            'data' : error.message
        }));
    });
})
module.exports = router;