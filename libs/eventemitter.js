var EventEmitter = require('events').EventEmitter,
    em = new EventEmitter();

em.on('error', function(err) {
    console.log(err);
});

module.exports = em;
