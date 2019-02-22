const Sequelize = require('sequelize');
const db = require('../baza.js');

const Pitanja = db.define('pitanja', {
    tekstPitanja : {
        type : Sequelize.STRING
    },

    odgovoreno : {
        type : Sequelize.BOOLEAN,
        defaultValue : false
    }
});


module.exports = function(db, DataTypes) {
    return Pitanja
}