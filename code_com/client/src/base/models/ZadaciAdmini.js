const Sequelize = require('sequelize');
const db = require('../baza.js');

const ZadaciAdmini = db.define('zadaci_admini', {
    autor : {
        type : Sequelize.BOOLEAN
    }
});

ZadaciAdmini.novaVeza = function(zadatakId, adminId, jeLiAutor, fn) {
    return fn('yes', null);
    /*ZadaciAdmini.create({
        zadaciId : zadatakId,
        adminiZaTakmicenjaId : parseInt(adminId),
        autor : jeLiAutor
    })
    .then(veza => {
        if (veza)
            return fn('yes', null);
        else
            return fn(null, 'Akcija nije moguća trenutno.');
    })
    .catch(error => {
        return fn(null, error.message);
    })*/
}

module.exports = function(db, DataTypes) {
    return ZadaciAdmini;
}
