const Sequelize = require('sequelize');
const db = require('../baza.js');


const Zadaci = db.define('zadaci', {
    redniBroj : {
        type : Sequelize.INTEGER
    },

    naslov : {
        type : Sequelize.STRING
    },

    tekst : {
        type : Sequelize.STRING(2000)
    },

    ulaz: {
        type : Sequelize.STRING(1000)
    },

    izlaz : {
        type : Sequelize.STRING(1000)  
    },

    dozvoliIzmjene : {
        type : Sequelize.BOOLEAN,
        defaultValue : false
    },

    oblast : {
        type : Sequelize.STRING
    },

    obrazlozenje : {
        type : Sequelize.STRING(1000)
    },

    tacnoRjesenje : {
        type :Sequelize.STRING(1000)
    },

    tacnoRjesenje_originalName : {
        type : Sequelize.STRING(1000)
    },

    bodovi : {
        type : Sequelize.DOUBLE
    },

    taskId : {
        type : Sequelize.INTEGER
    }
});

Zadaci.dodajNoviZadatak = function(zadatak, htmlencode, fn) {
    zadatak.bodovi = zadatak.bodovi.length == 0 ? 0 : zadatak.bodovi;
    Zadaci.create({
        redniBroj : zadatak.redniBroj,
        naslov : zadatak.naslov,
        tekst : zadatak.tekst,
        ulaz : zadatak.ulaz,
        izlaz : zadatak.izlaz,
        dozvoliIzmjene : zadatak.editable,
        oblast : zadatak.oblast,
        takmicarskeGrupeId : zadatak.odabranaGrupa.id,
        tacnoRjesenje : '',
        tacnoRjesenje_originalName : '',
        bodovi : zadatak.bodovi,
        taskId : -1
    })
    .then(zadatak => {
        if (zadatak)
            return fn('yes', zadatak);
        else
            return fn(null, null);
    })
    .catch(error => {
        return fn(null, error.message);
    });
}

Zadaci.azurirajZadatak = function(zadatak, noviZadatak, htmlencode, fn) {
    Zadaci.update({
        naslov : noviZadatak.naslov,
        tekst : noviZadatak.tekst,
        ulaz : noviZadatak.ulaz,
        izlaz : noviZadatak.izlaz,
        oblast : noviZadatak.oblast,
        bodovi : noviZadatak.bodovi
    }, {
    where : {
        id : zadatak.id
    }

    })
    .then(nz => {
        if (nz)
            return fn('yes', nz);
        else
            return fn(null, 'Akcija nije moguca.');
    })
    .catch(error => {
        return fn(null, error.message);
    });
}

module.exports = function(db, DataTypes) {
    return Zadaci;
}