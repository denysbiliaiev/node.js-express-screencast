exports.get = function(req, res) {

    User.findById(req.session.user, function(err, user) {
        if (err) return next(err);
        res.render('chat');
    });
};

