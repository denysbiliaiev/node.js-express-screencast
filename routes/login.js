var User = require('../models/user').User,
    async = require('async');
    HttpError = require('../error').HttpError,
    AuthError = require('../error').AuthError;

exports.get = function(req, res) {
    res.render('login');
};

exports.post = function(req, res, next) {
    var username = req.body.username,
        password = req.body.password;

    console.log(req.body);
    User.authorize(username, password, function(err, user) {
        if (err) {
            if (err instanceof AuthError) {
                return next(new HttpError(403, err.message));
            }
            return next(err);
        } else {
            req.session.userData = user;
            req.session.auth = true;
            res.send({});
        }
});
};
