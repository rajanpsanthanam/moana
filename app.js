// library dependencies
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var bodyParser = require('body-parser');
var flash = require('connect-flash')
var mongoose = require('mongoose');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var winston = require('winston');
var helmet = require('helmet')

var routes = require('./routes/index');
var users = require('./routes/users');
var stages = require('./routes/stages');
var features = require('./routes/features');
var accounts = require('./routes/accounts');
var reports = require('./routes/reports');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// set SIMBA_ENV to 'development' for debug mode
var env = process.env.SIMBA_ENV || 'production'
app.set('env', env);

// favicon
app.use(favicon(__dirname + '/public/images/favicon.ico'));

// helmet refer: https://expressjs.com/en/advanced/best-practice-security.html
app.use(helmet())

// parse json data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// session
var sess = {
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false,
  cookie: {}
}
var session = require('express-session')(sess);

app.use(session);

app.use(flash());

// passport
app.use(passport.initialize());
app.use(passport.session());


// static content
app.use(express.static(path.join(__dirname, 'public')));


// routes
app.use('/', routes);
app.use('/users', users);
app.use('/stages', stages);
app.use('/features', features);
app.use('/accounts', accounts);
app.use('/reports', reports);


// passport config
var User = require('./models/user');
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


// mongoose
var mongoServer = process.env.SIMBA_MONGODB_HOST || 'localhost'
var mongoPort = process.env.SIMBA_MONGODB_PORT || '27017'
var mongoConnection = 'mongodb://'+mongoServer+':'+mongoPort+'/simba'
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
    res.render('error', {
        error: 'page not found',
    });
});


/* error handlers
- overide if env is dev and print stack trace */
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            error: err.message,
            err: err
        });
    });
}

app.use(function(err, req, res, next) {
    winston.log('info', err.message);
    res.status(err.status || 500);
    res.render('error', {
        error: 'something went wrong! please try again later',
    });
});


module.exports = app;
