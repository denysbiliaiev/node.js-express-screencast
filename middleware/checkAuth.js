var HttpError = require('../error').HttpError;

module.exports = function(req, res, next) {
    if (!req.session.auth){
        return res.redirect('/');
        //return next(new HttpError(401, 'авторизируйтесь'));
    }
    next();
}