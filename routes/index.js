var HttpError = require('../error').HttpError,
    checkAuth = require('../middleware/checkAuth');
    ObjectID = require('mongodb').ObjectID;

require('../models/user');

module.exports = function(app, server) {
    app.get('/', require('./frontpage').get);
    app.get('/login', require('./login').get);
    app.post('/login', require('./login').post);
    app.get('/chat', checkAuth, require('./chat').get);
    app.get('/canvas', checkAuth, require('./canvas').get);
    app.post('/logout', require('./logout').post);
};
