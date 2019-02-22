const Sequelize = require('sequelize');
const db = require('../baza.js');

//const Takmicenja = db.import(__dirname + '/Takmicenja.js');

const TakmicarskeGrupe = db.define('takmicarske_grupe', {
    /*id : {
        type : Sequelize.INTEGER,
        primaryKey : true,
		autoIncrement : true
    },*/

    naziv : {
        type : Sequelize.STRING,
        allowNull : false
    },

    brojTakmicara : {
        type : Sequelize.INTEGER,
        allowNull : true
    },

    brojZadataka : {
        type : Sequelize.INTEGER,
        allowNull : true
    }
});


module.exports = function(db, DataTypes) {
    return TakmicarskeGrupe;
}


