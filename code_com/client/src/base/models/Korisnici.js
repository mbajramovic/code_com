const Sequelize = require('sequelize');
const db = require('../baza.js');
const Op = Sequelize.Op

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
    validiraj(_korisnickoIme)
    .then(kIme => {
        Korisnici.create({
            korisnickoIme : kIme,
            lozinka : _lozinka
        })
        .then(noviKorisnik => {
            return fn('yes', noviKorisnik);
        })
        .catch(error => {
            return fn(null, error.message);
        });
    })
    .catch(error => {
        return fn(null, error);
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

function validiraj(kIme) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (kIme.includes('ucesnik'))
                resolve(kIme);
            Korisnici.findAll({
                where : {
                    korisnickoIme : {
                         [Op.like] : "%" + kIme + "%"
                     }
                }
            })
            .then(korisnici => {
                if (korisnici.length > 0)
                    resolve(kIme + korisnici.length);
                else 
                    resolve(kIme);
            })
            .catch(error => {
                reject(error.message);
            })
        }, 5000);
    });
}

module.exports = function(db, DataTypes) {
    return Korisnici;
}