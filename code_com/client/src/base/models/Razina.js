const Sequelize = require('sequelize');
const db = require('../baza.js');

const Razina = db.define('razina', {
    /*id : {
        type : Sequelize.INTEGER,
        primaryKey : true,
		autoIncrement : true
    },*/

    naziv : {
        type : Sequelize.STRING,
        allowNull : false
    }
});


module.exports = function(db, DataTypes) {
    return Razina
}