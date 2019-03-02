const Sequelize = require('sequelize');
const db = require('../baza.js');
//const Korisnici = db.import(__dirname + "/Korisnici.js");

const AdminiZaTakmicenja = db.define('admini_za_takmicenja', {
    /*id : {
        primaryKey : true,
        type : Sequelize.INTEGER,
		autoIncrement : true
    },*/
    ime : {
        type : Sequelize.STRING
       
    },
    prezime : {
        type : Sequelize.STRING
    }, 
    grad : {
        type : Sequelize.STRING
    },
    titula : {
        type : Sequelize.STRING
    }
});

//AdminiZaTakmicenja.belongsTo(Korisnici);

// inicijalni podaci
/*AdminiZaTakmicenja.sync({force:true}).then(() => {
    return AdminiZaTakmicenja.create({ id : 1, ime : 'Maid', prezime : 'Bajramovic', grad : 'Travnik', titula : 'profesor', KorisnikID : 1 });
});*/

AdminiZaTakmicenja.dodajNovogAdmina = function(admin, korId, htmlencode, fn) {
    AdminiZaTakmicenja.create({
        ime : (admin.ime),
        prezime : (admin.prezime),
        grad : (admin.grad),
        titula : (admin.titula),
        korisniciId : korId
    })
    .then(noviAdmin => {
        return fn('yes', noviAdmin);
    })
    .catch(error => {
        return fn(null, error.message);
    });
} 

AdminiZaTakmicenja.povuciAdmina = function(_korisniciId, fn) {
    AdminiZaTakmicenja.findOne({
        attributes : ['id', 'ime', 'prezime', 'grad', 'titula'],
        where : {
            korisniciId : _korisniciId
        }
    })
    .then(admin => {
        if (admin)
            return fn('yes', admin);
        else
            return fn(null, 'Ne postoji.');
    })
    .catch(error => {
        return fn(null, error.message);
    })
}

module.exports = function(db, DataTypes) {
    return AdminiZaTakmicenja;
}