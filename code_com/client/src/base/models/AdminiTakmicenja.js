const Sequelize = require('sequelize');
const db = require('../baza.js');

//const Takmicenja = db.import(__dirname + '/Takmicenja.js');
//const AdminiZaTakmicenja = db.import(__dirname + '/AdminiZaTakmicenja.js');

const AdminiTakmicenja = db.define('admini_takmicenja', {});

//Takmicenja.belongsToMany(AdminiZaTakmicenja, {through : AdminiTakmicenja});
//AdminiZaTakmicenja.belongsToMany(Takmicenja, {through : AdminiTakmicenja});

AdminiTakmicenja.novaVeza = function(adminId, takmId, fn) {
    AdminiTakmicenja.create({
        adminiZaTakmicenjaId : adminId,
        takmicenjaId : takmId
    })
    .then(adminiTakmicenja => {
        return fn('yes', null);
    })
    .catch(error => {
        return fn(null, error.messages);
    })
}

module.exports = function(db, DataTypes) {
    return AdminiTakmicenja;
}