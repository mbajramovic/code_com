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
        type : Sequelize.STRING,
        validate : {
            is : {
                args: ["^[a-z]+$",'i'],
                msg : 'Ime mora sadržavati isključivo slova'
            } 
        }
    },
    prezime : {
        type : Sequelize.STRING,
        validate : {
            is : {
                args: ["^[a-z]+$",'i'],
                msg : 'Prezime mora sadržavati isključivo slova'
            } 
        }
    }, 
    grad : {
        type : Sequelize.STRING,
        validate : {
            is : {
                args: ["^[a-z]+$",'i'],
                msg : 'Grad mora sadržavati isključivo slova'
            } 
        }
    },
    titula : {
        type : Sequelize.STRING,
        validate : {
            is : {
                args: ["^[a-z]+$",'i'],
                msg : 'Titula mora sadržavati isključivo slova'
            } 
        }
    }
});

//AdminiZaTakmicenja.belongsTo(Korisnici);

// inicijalni podaci
/*AdminiZaTakmicenja.sync({force:true}).then(() => {
    return AdminiZaTakmicenja.create({ id : 1, ime : 'Maid', prezime : 'Bajramovic', grad : 'Travnik', titula : 'profesor', KorisnikID : 1 });
});*/

AdminiZaTakmicenja.dodajNovogAdmina = function(admin, korId, htmlencode, fn) {
    AdminiZaTakmicenja.create({
        ime : htmlencode(admin.ime),
        prezime : htmlencode(admin.prezime),
        grad : htmlencode(admin.grad),
        titula : htmlencode(admin.titula),
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