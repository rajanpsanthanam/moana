// dependencies
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var flash = require('connect-flash')
var mongoose = require('mongoose');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var winston = require('winston');

var routes = require('./routes/index');
var users = require('./routes/users');
var stages = require('./routes/stages');
var features = require('./routes/features');
var accounts = require('./routes/accounts');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug')

// favicon
app.use(favicon(__dirname + '/public/images/favicon.ico'));

// log
app.use(logger('dev'));

// parse json data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// cookie parser
app.use(cookieParser());

// session
app.use(require('express-session')({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false
}));

app.use(flash());

// passport
app.use(passport.initialize());
app.use(passport.session());

// static content
app.use(express.static(path.join(__dirname, 'public')));


app.use('/', routes);
app.use('/users', users);
app.use('/stages', stages);
app.use('/features', features);
app.use('/accounts', accounts);


// passport config
var User = require('./models/user');
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

var mongoServer = process.env.SIMBA_MONGODB_HOST || 'localhost'
var mongoPort = process.env.SIMBA_MONGODB_PORT || '27017'

var mongoConnection = 'mongodb://'+mongoServer+':'+mongoPort+'/moana'
// mongoose
// mongodb://localhost/moana
mongoose.connect(mongoConnection);


// logging
winston.configure({
    transports: [
      new (winston.transports.File)({ filename: 'app.log' })
    ]
  });



// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
// if (app.get('env') === 'development') {
//     app.use(function(err, req, res, next) {
//         res.status(err.status || 500);
//         res.render('error', {
//             error: err.message,
//             err: err
//         });
//     });
// }

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    winston.log('info', err.message);
    res.status(err.status || 500);
    res.render('error', {
        error: 'something went wrong! please try again later',
    });
});


module.exports = app;
