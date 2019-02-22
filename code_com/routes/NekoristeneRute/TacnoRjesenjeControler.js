const Sequelize = require('sequelize');
const sequelize = require('../../client/src/base/baza.js');
const fs = require('fs');
const { Zadaci } = sequelize.import('../../client/src/base/models/Models.js');


module.exports = {
    getTacnoRjesenje : function(req, res) {
        var id = req.query.id;
        Zadaci.findOne({
            where : {
                id : id
            }
        })
        .then(zadatak => {
            if (zadatak) {
                console.log(zadatak);
                var rjesenje = fs.readFileSync('uploads/' + zadatak.tacnoRjesenje);
                res.end(JSON.stringify({
                    'success' : 'yes',
                    'tacnoRjesenje' : rjesenje.toString(),
                    'tacnoRjesenje_originalName' : zadatak.tacnoRjesenje_originalName
                }));
            }
            else {

            }
        })
        .catch(error => {
            res.end(JSON.stringify({
                'success' : null,
                'data' : error.message
            }));
        });
    }
}