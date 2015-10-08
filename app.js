var HttpError = require('./error').HttpError,
    mongoose = require('./libs/mongoose'),
    log = require('./libs/log.js')(module),
    express = require('express'),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    session = require('express-session'),
    sessionStore = require('./libs/sessionStore'),
    http = require('http'),
    app = express();
    User = require('./models/user').User,
    path = require('path'),
    config = require('./config');
    //mongoose.set('debug', true);

var server = http.createServer(app).listen(config.get('server:port'), function() {
    log.info('Express server listening port [:' + config.get('server:port') + ']');
});

var io = require('./socket')(server);
app.set('io', io);

app.engine('ejs', require('ejs-locals'));
app.set('views', __dirname + '/templates');
app.set('view engine', 'ejs');
app.use(require('./middleware/sendHttpError'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(session({"name": "node",
                 secret: config.get('session:secret'),
                 store: sessionStore,
                 resave: config.get('session:resave'),
                 saveUninitialized: config.get('session:saveUninitialized'),
                 cookie: config.get('session:cookie')
}));
app.use(express.static(path.join(__dirname, 'public')))
app.use(require('./middleware/loadUser'));
require('./routes')(app, server);


app.use(function(err, req, res, next) {
    if (typeof err == 'number') {
        err = new HttpError(err);
    }

    if (err instanceof HttpError) {
        log.info(err);
        res.sendHttpError(err);
    } else {
        if (app.get('env') == 'development') {
              log.info(err.message);
              err = new HttpError(500, err.message);
              res.sendHttpError(err);
        } else {
            log.info(err.message);
            err = new HttpError(500, err.message);
            res.sendHttpError(err);
        }
    }
});

function createUser(user) {
    mongoose.models.User.on('index', function() {
        var user = new mongoose.models.User({
            username: user.name,
            password: user.password,
            userType: user.userType
        });

        user.save(function(err, user, affected) {
            if (err) throw err;
        });
    });
}


