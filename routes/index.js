const express = require('express');
const passport = require('passport');
const User = require('../models/user');
const router = express.Router();


// dashboard
router.get('/', (req, res) => {
    res.render('index', { user : req.user });
});


// register page
router.get('/register', (req, res) => {
    res.render('register', { });
});


// register route
router.post('/register', (req, res, next) => {
    User.register(new User({ username : req.body.username }), req.body.password, (err, user) => {
        if (err) {
          return res.render('register', { error : err.message });
        }

        passport.authenticate('local')(req, res, () => {
            req.session.save((err) => {
                if (err) {
                    return next(err);
                }
                res.redirect('/');
            });
        });
    });
});


// login page
router.get('/login', (req, res) => {
    res.render('login', { user : req.user, error : req.flash('error')});
});


// login route
router.post('/login', passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }), (req, res, next) => {
    req.session.save((err) => {
        if (err) {
            return next(err);
        }
        res.redirect('/');
    });
});


// logout route
router.get('/logout', (req, res, next) => {
    req.logout();
    req.session.save((err) => {
        if (err) {
            return next(err);
        }
        res.redirect('/');
    });
});

module.exports = router;
