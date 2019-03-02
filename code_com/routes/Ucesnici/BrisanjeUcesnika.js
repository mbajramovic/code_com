const Sequelize = require('sequelize');
const sequelize = require('../../client/src/base/baza.js');

const {Ucesnici, UcesniciTakmicarskeGrupe, Lokacija, Korisnici, Verzije, Pitanja} = sequelize.import('../../client/src/base/models/Models.js');

module.exports = {

    brisiPoTakmicarskojGrupi : function(takmicarskaGrupaId) {
        return new Promise(
            function(resole, reject) {
                UcesniciTakmicarskeGrupe.findAll({
                    attributes : ['ucesniciId'],
                    where : {
                        takmicarskeGrupeId : takmicarskaGrupaId
                    }
                })
                .then(ucesnici => {
                    var ucesniciIDs = [];
                    for (var i = 0; i < ucesnici.length; i++)
                        ucesniciIDs[i] = ucesnici[i].ucesniciId;
                    Ucesnici.findAll({
                        attributes : ['korisniciId'],
                        where : {
                            id : ucesniciIDs
                        }
                    })
                    .then(korisnici => {
                        var korisniciIDs = [];
                        for (var i = 0; i < korisnici.length; i++) 
                            korisniciIDs[i] = korisnici[i].korisniciId;
                        Korisnici.destroy({
                            where : {
                                id : korisniciIDs
                            }
                        })
                        .then(done => {
                            Ucesnici.destroy({
                                where : {
                                    id : ucesniciIDs
                                }
                            })
                            .then(done => {
                                UcesniciTakmicarskeGrupe.destroy({
                                    where : {
                                        takmicarskeGrupeId : takmicarskaGrupaId
                                    }
                                })
                                .then(done => {
                                    Verzije.destroy({
                                        where : {
                                            ucesniciId : ucesniciIDs
                                        }
                                    })
                                    .then(done => {
                                        Pitanja.destroy({
                                            where : {
                                                ucesniciId : ucesniciIDs
                                            }
                                        })
                                        .then(done => {
                                            resole('done');
                                        })
                                        .catch(error => {
                                            reject(error.message);
                                        })
                                    })
                                    .catch(error => {
                                        reject(error.message);
                                    })
                                })
                                .catch(error => {
                                    reject(error.message);
                                });
                            })
                            .catch(error => {
                                reject(error.message);
                            });
                        })
                        .catch(error => {
                            reject(error.message);
                        });
                    })
                    .catch(error => {
                        reject(error.message);
                    });
                })
                .catch(error=> {
                    reject(error.message);
                });
            }
        );
    }
}