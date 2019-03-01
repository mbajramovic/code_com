const Sequelize = require('sequelize');
const db = require('../baza.js');

const Autotestovi = db.define('autotestovi', {

    _id : {
        type : Sequelize.STRING
    },

    require_symbols : {
        type : Sequelize.JSON
    },

    replace_symbols : {
        type : Sequelize.JSON
    },

    code : {
        type : Sequelize.STRING(1000)
    },

    global_above_main : {
        type : Sequelize.STRING(1000)
    },

    global_top : {
        type : Sequelize.STRING(1000)
    },

    timeout : {
        type : Sequelize.DOUBLE
    },

    vmem : {
        type : Sequelize.DOUBLE
    },
    stdin : {
        type : Sequelize.STRING(1000)
    },

    expected : {
        type : Sequelize.JSON
    },

    expected_exception : {
        type : Sequelize.BOOLEAN
    },

    expected_crash : {
        type : Sequelize.BOOLEAN
    },

    ignore_whitespace : {
        type : Sequelize.BOOLEAN
    },

    regex : {
        type : Sequelize.BOOLEAN
    },

    substring : {
        type : Sequelize.BOOLEAN
    },

    skriven : {
        type : Sequelize.BOOLEAN
    },

    language : {
        type : Sequelize.STRING(255)
    },

    bodovi : {
        type : Sequelize.DOUBLE
    }
});

Autotestovi.dodajAutotest = function(autotest, fn) {
    if (autotest.running_params.vmem.length == 0)
        autotest.running_params.vmem = null;
    if (autotest.running_params.timeout.length == 0)
        autotest.running_params.timeout = null;
    
        console.log(autotest.expected.toString()[0]);
    autotest.expected = autotest.expected.toString()[0] === '[' ? autotest.expected : arrayToJson(autotest.expected);
    autotest.require_symbols = typeof autotest.require_symbols !== 'array' ?  autotest.require_symbols : arrayToJson(autotest.require_symbols);
    autotest.replace_symbols = typeof autotest.replace_symbols !== 'array' ? autotest.replace_symbols : arrayToJson(autotest.replace_symbols);
    
    Autotestovi.create({
        _id : autotest.id,
        require_symbols : autotest.require_symbols,
        replace_symbols : autotest.replace_symbols,
        code : autotest.code,
        global_above_main : autotest.global_above_main,
        global_top : autotest.global_top,
        timeout : autotest.running_params.timeout,
        vmem : autotest.running_params.vmem,
        stdin : autotest.running_params.stdin,
        expected : autotest.expected,
        expected_exception : autotest.expected_exception,
        expected_crash : autotest.expected_crash,
        ignore_whitespace : autotest.ignore_whitespace,
        regex : autotest.regex,
        substring : autotest.substring,
        zadaciId : autotest.zadaciId,
        language : autotest.language
    })
    .then(nAutotest => {
        if (nAutotest)
            fn('yes', nAutotest);
        else 
            fn(null, 'Greška');
    })
    .catch(error => { 
        fn(null, error);
    });
}

Autotestovi.updateAutotest = function(autotest, fn) {
    if (autotest.running_params.vmem != null && autotest.running_params.vmem.length == 0)
        autotest.running_params.vmem = null;
    if (autotest.running_params.timeout != null && autotest.running_params.timeout.length == 0)
        autotest.running_params.timeout = null;
    
    autotest.expected = arrayToJson(autotest.expected);
    autotest.require_symbols = arrayToJson(autotest.require_symbols);
    autotest.replace_symbols = arrayToJson(autotest.replace_symbols);

    Autotestovi.update(
        {    
            require_symbols : autotest.require_symbols,
            replace_symbols : autotest.replace_symbols,
            code : autotest.code,
            global_above_main : autotest.global_above_main,
            global_top : autotest.global_top,
            timeout : autotest.running_params.timeout,
            vmem : autotest.running_params.vmem,
            stdin : autotest.running_params.stdin,
            expected : autotest.expected,
            expected_exception : autotest.expected_exception,
            expected_crash : autotest.expected_crash,
            ignore_whitespace : autotest.ignore_whitespace,
            regex : autotest.regex,
            substring : autotest.substring
        },
        {
            where : {
                _id : autotest.id,
                zadaciId : autotest.zadaciId,
                language : autotest.language
            }
        }
    )
    .then(updated => {
        return fn('yes', updated);
    })
    .catch(error => {
        return fn(null, error.message);
    });
}

arrayToJson = function(array) {
    var json = {};
    for (let i = 0; i < array.length; i++)
        json[i.toString()] = array[i];

    return json;
}

module.exports = function(db, DataTypes) {
    return Autotestovi;
}
