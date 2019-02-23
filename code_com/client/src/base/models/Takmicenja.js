const Sequelize = require('sequelize');
const db = require('../baza.js');

//const Razina = db.import(__dirname + '/Razina.js');

const Takmicenja = db.define('takmicenja', {
    /*id : {
        type : Sequelize.INTEGER,
        primaryKey : true,
		autoIncrement : true
    },*/

    naziv : {
        type : Sequelize.STRING,
        allowNull : false
    },

    pocetak : {
        type : Sequelize.DATEONLY
    },

    kraj : {
        type : Sequelize.DATEONLY
    },

    mjesto : {
        type : Sequelize.STRING,
        validate : {
            is : {
                args : ["^[a-z]+$",'i'],
                msg : 'Mjesto održavanja takmičenja mora sadržavati isključivo slova.'
            }
        }
    },

    opis : { 
        type : Sequelize.STRING
    },

    vrsta : {
        type : Sequelize.ENUM,
        values : ['pojedinacno', 'ekipno']
    },

    aktivno : {
        type : Sequelize.BOOLEAN
    },

    trajanje : {
        type : Sequelize.DATE
    },

    zavrseno : {
        type : Sequelize.BOOLEAN,
        defaultValue : false
    },

    programskiJezik : {
        type : Sequelize.STRING
    },

    tipDatoteke : {
        type : Sequelize.STRING
    }
});

//Takmicenja.belongsTo(Razina);


module.exports = function(db, DataTypes) {
    return Takmicenja;
}
