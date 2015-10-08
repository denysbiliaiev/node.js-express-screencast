var User = require('../models/user').User;

module.exports = function (req, res, next) {
    req.user = res.locals.user = null;

    if(!req.session.auth) return next();

    User.findById(req.session.userData._id, function(err, user) {
        if (err) return next(err);
        req.user = res.locals.user = user;
        next();
    });
};
