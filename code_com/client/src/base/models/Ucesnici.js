const Sequelize = require('sequelize');
const db = require('../baza.js');

const Ucesnici = db.define('ucesnici', {
    ime : {
        type : Sequelize.STRING
    },

    prezime : {
        type : Sequelize.STRING
    },

    maticniBroj : {
        type : Sequelize.STRING
    }
});

Ucesnici.dodajNovogUcesnika = function(ucesnik, idLokacije, idKorinika, htmlencode, fn) {
    Ucesnici.create({
        ime : (ucesnik.ime),
        prezime : (ucesnik.prezime),
        maticniBroj : (ucesnik.maticniBroj),
        lokacijaId : idLokacije,
        korisniciId : idKorinika
    })
    .then(ucesnik => {
        if (ucesnik)
            return fn('yes', ucesnik);
        else
            return fn(null, 'Akcija nije moguća.');
    })
    .catch(error => {
        return fn(null, error.message);
    })
}

Ucesnici.povuciUcesnika = function(ucesnikId, fn) {
    Ucesnici.findOne({
        where : {
            korisniciId : ucesnikId
        }
    })
    .then(ucesnik => {
        if (ucesnik) 
            fn('yes', ucesnik);
        else 
            fn(null, 'Greška....');
    })
    .catch(error => {
        fn(null, error.message);
    })
}

module.exports = function(db, DataTypes) {
    return Ucesnici;
}