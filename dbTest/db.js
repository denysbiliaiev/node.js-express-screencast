var mongoose = require('../libs/mongoose'),
    async = require('async');

mongoose.set('debug', true);

async.series(
    [   open,//(callback)
        dropDB,//(callback)
        requireModels,//(callback)
        saveUsers, //(callback)
        findUsers
    ], function(err) {
        console.log(arguments);
        mongoose.disconnect();
    }
);

function open(callback) {
    //open: Emitted after we connected and onOpen is executed on all of this connections models.
    mongoose.connection.on('open', callback);
}

function dropDB(callback) {
    var db = mongoose.connection.db;
    db.dropDatabase(callback);
}

function requireModels(callback) {
    require('../models/user');

    //mongo for each index declared in the schema.
    //mongoose.models.User.on('index', callback); //or->

    async.each(Object.keys(mongoose.models), function(model, callback) {
        mongoose.models[model].ensureIndexes(callback);//ensureIndex commands to mongo for each index declared in the schema.
    }, callback);
    callback;
}

function saveUsers(callback) {
    var users = [{username: 'User4', password: 'secret', userType: 'advertiser'},
                 {username: 'User5', password: 'secret', userType: 'advertiser'},
                 {username: 'User6', password: 'secret', userType: 'advertiser'}
    ];

    async.each(users, function(userData, call) {
        var user = new mongoose.models.User(userData);
        user.save(callback);
    }, callback );
}

function findUsers(callback) {
    mongoose.models.User.find({}, callback);
}
