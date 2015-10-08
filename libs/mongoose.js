var mongoose = require('mongoose'),
    config = require('../config'),
    HttpError = require('../error').HttpError;
    log = require('./log')(module);

mongoose.connect(config.get('mongoose:uri'), function(err, db) {
    if (err) {
        log.info(err.message);
    } else {
        log.info('mongoose connect [:' + config.get('mongoose:uri') + ']');
    }
});

module.exports = mongoose;