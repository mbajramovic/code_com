const Sequelize = require('sequelize');
const db = require('../baza.js');

const Verzije = db.define('verzije', {
    filename : {
        type : Sequelize.STRING
    },

    compileResult : {
        type : Sequelize.STRING
    },
    compileResult_output : {
        type : Sequelize.STRING(1000)
    },
    programId : {
        type : Sequelize.INTEGER
    },

    bodovi : {
        type : Sequelize.DOUBLE
    },

    jezik : {
        type : Sequelize.STRING(255)
    }
});

Verzije.novaVerzija = function(verzija, fn) {
    Verzije.create({
        filename : verzija.filename,
        programId : verzija.programId,
        zadaciId : verzija.zadaciId,
        ucesniciId : verzija.ucesniciId,
        bodovi : 0,
        jezik : verzija.jezik
    })
    .then(verzija => {
        if (verzija)
            return fn('yes', verzija);
        else
            return fn(null, 'Greška.');
    })
    .catch(error => {
        return fn(null, error.message);
    })
}

module.exports = function(db, DataTypes) {
    return Verzije;
}