var log = require('../libs/log.js')(module),
    config = require('../config'),
    cookie = require('cookie'),
    cookieParser = require('cookie-parser'),
    sessionStore = require('../libs/sessionStore'),
    socketHandshake = require('socket.io-handshake'),
    HttpError = require('../error').HttpError,
    User = require('../models/user').User,
    //em = require('../libs/eventemitter'),
    async = require('async');

function LoadSession(sid, callback) {
    sessionStore.load(sid, function(err, session) {
        if (arguments.length == 0) {

            callback(null, null);
        } else {
            log.info('[sid]: ', sid);
            return callback(null, session);
        }
    });
}

function LoadUser(session, callback) {
    if (!session.auth) {
        log.debug('session %s is anonymous', session.id);
        return callback(null, null);
    }

    log.info('[uid]: ', session.userData._id);

    User.findById(session.userData._id, function(err, user) {
        if (err) { return callback(err) };

        if (!user) { return callback(null, null) };

        log.info('[uname]: ', user.username);
        callback(null, user);
    });
}

module.exports = function(server) {
    var io = require('socket.io').listen(server);

    io.use(socketHandshake({store: sessionStore, key: 'node', secret: 's', parser: cookieParser()}));
    io.set('origins', 'localhost:3000/chat');
    //io.set('logger', log);

    io.set('authorization', function(handshake, callback) {

        async.waterfall([
            function(callback) {
                handshake.cookies = cookie.parse(handshake.headers.cookie || '');
                var sidCookie = handshake.cookies[config.get('session:name')];
                if (sidCookie) {
                    var sid = cookieParser.signedCookie(sidCookie, config.get('session:secret'));
                }

                LoadSession(sid, callback);
            },
            function(session, callback) {
                if (!session) {
                    callback(new HttpError(401, 'no session'));
                }

                handshake.session__id = session;
                LoadUser(session, callback);
            },
            function(user, callback) {
                if (!user) {
                    callback(new HttpError(401, 'anonymous session may not connect'));
                }

                handshake.user = user;
                callback(null, 'test');
            }
        ],  function(err, result) {
            if (!err) {
                return callback(null, true);
            }

            if (err instanceof HttpError) {
                return callback(null, false);
            }

            callback(err);
        });
    });

    io.sockets.on('connection', function (socket) {

        log.info('socket[id]: ' + socket.id);
        log.info("[sockets count]: " + io.sockets.sockets.length);

        var username = socket.handshake.session.userData.username;
        socket.broadcast.emit('join', username);

        socket.on('message', function (text, cb) {
            console.log(text);
            socket.broadcast.emit('message', username, text);
            cb && cb();
        });

        socket.on('drawClick', function(data, callback){
            console.log(data);
            socket.broadcast.emit('draw', {x: data.x, y: data.y, type: data.type});
            callback(data);
        });

        socket.on('disconnect', function() {
            socket.broadcast.emit('leave', username);
        });
    });

    return io;
}
