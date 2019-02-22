const Sequelize = require('sequelize');
const db = require('../baza.js');

const Lokacija = db.define('lokacija', {
    drzava : {
        type : Sequelize.STRING
    },

    kanton : {
        type : Sequelize.STRING
    },

    opcina : {
        type : Sequelize.STRING
    },

    grad : {
        type : Sequelize.STRING
    },

    skola : {
        type :Sequelize.STRING
    }
});

Lokacija.dodajNovuLokaciju = function(ucesnik, htmlencode, fn) {
    Lokacija.create({
        drzava : (ucesnik.drzava),
        kanton : (ucesnik.kanton),
        opcina : (ucesnik.opcina),
        grad : (ucesnik.grad),
        skola : (ucesnik.skola)
    })
    .then(lokacija => {
        if (lokacija)
            return fn('yes', lokacija);
        else
            return fn(null, 'Akcija nije moguća.');
    })
    .catch(error => {
        return fn(null, error.message);
    })
}

module.exports = function(db, DataTypes) {
    return Lokacija;
}