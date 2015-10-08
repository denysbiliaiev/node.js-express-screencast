var crypto = require('crypto'),
    mongoose = require('../libs/mongoose'),
    log = require('../libs/log')(module);
    async = require('async');

var Schema = mongoose.Schema;

var schema = new Schema({
    username: {
        type: String,
        unique: true,
        required: true
    },
    hashedPassword: {
        type: String,
        required: true
    },
    salt: {
        type: String,
        required: true
    },
//    userType: {
//        type: String,
//        required: true
//    },
    created: {
        type: Date,
        default: Date.now()
    }
});

schema.methods.encryptPassword = function(password) {
    return crypto.createHmac('sha1', this.salt).update(password).digest('hex');
};

schema.virtual('password')
    .set(function(password) {
        this._plainPassword = password;
        this.salt = Math.random() + '';
        this.hashedPassword = this.encryptPassword(password);
    })
    .get(function() {
        return this._plainPassword;
    });

schema.methods.checkPassword = function(password) {
    return this.encryptPassword(password) == this.hashedPassword;
};

schema.methods.findSimilarUserTypes = function(callback) {
    return this.model('User').find({userType: this.userType}, callback);
};

schema.statics.authorize = function(username, password, callback) {
    var User = this;

    async.waterfall([
        function(callback) {
            User.findOne({username: username}, callback);
        },
        function(user, callback) {
            if (user) {
                if (user.checkPassword(password)) {
                    log.info('[auth]: ' + username);
                    callback(null, user);
                } else {
                    callback(new AuthError('неверный пароль'));
                }
            } else {
                var user = new User({username:username, password:password});
                user.save(callback);
                log.info('[register]: ' + username);
            }
        }
    ], callback);
};

exports.User = mongoose.model('User', schema);


