const Sequelize = require('sequelize');
const db = require('../baza.js');

const Korisnici = db.define('korisnici', {
    /*id : {
        type : Sequelize.INTEGER,
        primaryKey : true,
		autoIncrement : true
    },*/

    korisnickoIme : {
        type : Sequelize.STRING,
        allowNull : false
    },

    lozinka : {
        type : Sequelize.STRING,
        allowNull : false
    }
});

Korisnici.dodajNovogKorisnika = function(_korisnickoIme, _lozinka, fn) {
    Korisnici.create({
        korisnickoIme : _korisnickoIme,
        lozinka : _lozinka
    })
    .then(noviKorisnik => {
        return fn('yes', noviKorisnik);
    })
    .catch(error => {
        return fn(null, error.message);
    });
}

Korisnici.povuciKorisnika = function(_korisnickoIme, _lozinka, fn) {
    Korisnici.findOne({
        attributes : ['id'],
        where : {
            korisnickoIme : _korisnickoIme,
            lozinka : _lozinka
        }
    })
    .then(korisnik => {
        if (korisnik)
            return fn('yes', korisnik);
        else
            return fn(null, 'Nepostojeći korisnik.');
    })
    .catch(error => {
        return fn(null, error.message);
    })
}

module.exports = function(db, DataTypes) {
    return Korisnici;
}