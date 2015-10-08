//var em = require('../libs/eventemitter');

exports.post = function(req, res, next) {
    var sid = req.session.id,
        io = req.app.get('io'),
        sockets = io.sockets.sockets;

    req.session.destroy(function(err) {
        if (err) return next(err);

        sockets.forEach(function(socket) {
            if(socket.handshake.sessionID !== sid) return;

            socket.server.emit('logout');
            socket.client.disconnect();
        });
    });

};

