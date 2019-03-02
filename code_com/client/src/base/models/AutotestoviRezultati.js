const Sequelize = require('sequelize');
const db = require('../baza.js');

const Autotestovi = db.import('./Autotestovi.js');

const AutotestoviRezultati = db.define('autotestovi_rezultati', {
    compileResult : {
        type : Sequelize.STRING
    },
    

    runResult : {
        type : Sequelize.STRING
    },

    status : {
        type : Sequelize.INTEGER
    },

    output : {
        type : Sequelize.STRING(1000)
    },

    bodovi : {
        type : Sequelize.DOUBLE,
        defaultValue : 10
    }
});

AutotestoviRezultati.dodajRezultat = function(rezultat, fn) {
    if (rezultat.run_result.output.length > 1000)
        rezultat.run_result.output = rezultat.run_result.output.substring(0, 1000);
    console.log(rezultat.run_result.output.length);
    Autotestovi.findOne({
        attributes : ['id', 'stdin', 'expected'],
        where : {
            zadaciId : rezultat.zadatakId,
            _id : rezultat.id
        }
    })
    .then(autotest => {
        AutotestoviRezultati.findOne({
            where : {
                verzijeId : rezultat.verzijeId,
                autotestoviId : autotest.id
            }
        })
        .then(autotest_rezultat => {
            if (autotest_rezultat) {
                autotest_rezultat.ulaz = autotest.stdin;
                var expected = [];
                for (let i = 0;;i++) {
                    if (autotest.expected[i.toString()] != null)
                        expected.push(autotest.expected[i.toString()]);
                    else
                        break;
                }
                autotest_rezultat.ocekivaniIzlaz = expected;
                autotest_rezultat.bodovi = autotest.bodovi;
                fn('yes', autotest_rezultat);
            }
            else {
                AutotestoviRezultati.create({
                    compileResult : rezultat.compile_result.status,
                    runResult : rezultat.run_result.status,
                    status : rezultat.status,
                    autotestoviId : autotest.id,
                    verzijeId : rezultat.verzijeId,
                    output : rezultat.run_result.output
                })
                .then(autotest_rezultat => {
                    if (autotest_rezultat) {
                        autotest_rezultat.ulaz = autotest.stdin;
                        var expected = [];
                        for (let i = 0;;i++) {
                            if (autotest.expected[i.toString()] != null)
                                expected.push(autotest.expected[i.toString()]);
                            else
                                break;
                        }
                        autotest_rezultat.ocekivaniIzlaz = expected;
                        autotest_rezultat.bodovi = autotest.bodovi;
                        fn('yes', autotest_rezultat);
                    }
                    else
                        fn(null, 'Greska..');
                })
                .catch(error => {
                    console.log(error.message);
                    fn(null, error.message);
                })
            }
        });
    });
}

AutotestoviRezultati.bodoviUpdate = function(ar_id, bodovi, fn) {
    AutotestoviRezultati.update(
        {bodovi : bodovi},
        {
            where : {
                id : ar_id
            }
        }
    )
    .then(done => {
        fn('yes', null);
    })
    .catch(error => {
        fn(null, error.message);
    })
}

module.exports = function(db, DataTypes) {
    return AutotestoviRezultati;
}