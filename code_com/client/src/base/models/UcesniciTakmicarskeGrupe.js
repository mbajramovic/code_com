const Sequelize = require('sequelize');
const db = require('../baza.js');

const UcesniciTakmicarskeGrupe = db.define('ucesnici_takmicarskegrupe', {
});

UcesniciTakmicarskeGrupe.novaVeza = function(ucesnikId, takmicarskaGrupaId, fn) {
    UcesniciTakmicarskeGrupe.create({
        ucesniciId : ucesnikId,
        takmicarskeGrupeId : takmicarskaGrupaId
    })
    .then(veza => {
        if (veza)
            fn('yes', veza);
        else
            fn(null, 'Akcija trenutno nije moguća.');
    })
    .catch(error => {
        fn(null, error.message);
    })
}

module.exports = function(db, DataTypes) {
    return UcesniciTakmicarskeGrupe;
}