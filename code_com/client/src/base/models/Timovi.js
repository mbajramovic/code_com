const Sequelize = require('sequelize');
const db = require('../baza.js');

const Timovi = db.define('timovi', {
    
    nazivTima : {
        type : Sequelize.STRING
    },
 
    brojUcesnika : {
        type : Sequelize.INTEGER,
        defaultValue : 1
    }
});



module.exports = function(db, DataTypes) {
    return Timovi;
}