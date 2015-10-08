var mongoose = require('./mongoose'),
    session = require('express-session'),
    MongoStore = require('connect-mongo')(session);

var sessionStore = new MongoStore({mongoose_connection: mongoose.connection});

module.exports = sessionStore;