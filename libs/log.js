var winston = require('winston');

function getLoger(module) {
    var path = module.filename.split('/').slice(-2).join('/');

    var levels = {
        foo: 0,
        info: 1,
        debug: 2,
        error: 3
    };

    var colors =  {
        foo: 'cyan',
        info: 'green',
        debug: 'blue',
        error: 'red'
    };

    var logger = new winston.Logger({
        levels: levels,
        colors: colors,
        transports: [
            new winston.transports.Console({
                handleExceptions: false,
                colorize: true,
                level: 'foo',
                label: path
            }),
            new winston.transports.File({
                handleExceptions: false,
                colorize: true,
                level: 'debug',
                timestamp: true,
                label: path,
                filename: 'error.log'
            })
        ]
    });

    return logger;
}

module.exports = getLoger;