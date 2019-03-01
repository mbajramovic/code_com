const Sequelize = require('sequelize');
const db = require('../baza.js');

const Task = db.define('task', {
    _id : {
        type : Sequelize.INTEGER
    },
    name : {
        type : Sequelize.STRING(1000)
    },
    language : {
        type : Sequelize.STRING
    },
    required_compiler : {
        type : Sequelize.STRING
    },
    preferred_compiler : {
        type : Sequelize.STRING
    },
    compiler_features : {
        type : Sequelize.JSON
    },
    compiler_options : {
        type : Sequelize.STRING(1000)
    },
    compiler_options_debug : {
        type : Sequelize.STRING(1000)
    },
    compile : {
        type : Sequelize.BOOLEAN
    },
    run : {
        type : Sequelize.BOOLEAN
    },
    test : {
        type : Sequelize.BOOLEAN
    },
    debug : {
        type : Sequelize.BOOLEAN
    },
    profile : {
        type : Sequelize.BOOLEAN
    }
});

Task.dodajTask = function(task, fn) {
    task.compiler_features = arrayToJson(task.compiler_features);
    Task.create({
        id : task.id,
        name : task.name,
        language : task.language,
        required_compiler : task.required_compiler,
        preferred_compiler : task.preferred_compiler,
        compiler_features : task.compiler_features,
        compiler_options : task.compiler_options,
        compiler_options_debug : task.compiler_options_debug,
        compile : task.compile,
        run : task.run,
        test : task.test,
        debug : task.debug,
        profile : task.profile,
        zadaciId : task.zadaciId
    })
    .then(task => {
        if (task)
            return fn('yes', task);
        else
            return fn(null, 'Greška');
    })
    .catch(error => {
        return fn(null, error.message);
    });
}

Task.updateTask = function(task, fn) {
    task.compiler_features = arrayToJson(task.compiler_features);
    Task.update(
        {
            name : task.name,
            language : task.language,
            required_compiler : task.required_compiler,
            preferred_compiler : task.preferred_compiler,
            compiler_features : task.compiler_features,
            compiler_options : task.compiler_options,
            compiler_options_debug : task.compiler_options_debug,
            compile : task.compile,
            run : task.run,
            test : task.test,
            debug : task.debug,
            profile : task.profile
        },
        {
            where : {
                zadaciId : task.zadaciId,
                language : task.language
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
    return Task;
}