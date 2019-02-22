const Sequelize = require('sequelize');
const db = require('../baza.js');

const ZadatakTask = db.define('zadaci_tasks', {
    language : {
        type : Sequelize.STRING(255)
    }
});


module.exports = function(db, DataTypes) {
    return ZadatakTask;
}