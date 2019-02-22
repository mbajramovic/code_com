const Sequelize = require('sequelize');
const db = require('../baza.js');

const Odgovori = db.define('odgovori', {
    tekstOdgovora : {
        type : Sequelize.STRING
    },

    odgovorZaSve : {
        type : Sequelize.BOOLEAN,
        defaultValue : false
    }
});


module.exports = function(db, DataTypes) {
    return Odgovori
}