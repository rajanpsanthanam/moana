const express = require('express');
const passport = require('passport');
const User = require('../models/user');
const Account = require('../models/account');
const router = express.Router();
const winston = require('winston');


// dashboard
router.get('/', (req, res) => {
  if(req.user){
    Account.find({"primary_manager": req.user._id, "is_deleted": false}, '', function(err, accounts){
          if(err){
              winston.log('info', err.message);
              return res.render('index', { error : err.message });
          }
          else{
            var primary_accounts = accounts;
            Account.find({"secondary_manager": req.user._id, "is_deleted": false}, '', function(err, accounts){
              if(err){
                  winston.log('info', err.message);
                  return res.render('dashboard', { error : err.message });
              }
              else{
                  var secondary_accounts = accounts;
                  return res.render('dashboard', {
                    user : req.user, primary_accounts : primary_accounts, secondary_accounts: secondary_accounts
                  });
                }
              });
            }
          });
        }
  else{
    return res.render('index');
  }
});


// register page
router.get('/register', (req, res) => {
    return res.render('register', { });
});


// register route
router.post('/register', (req, res, next) => {
    User.register(new User({ 'username' : req.body.username, 'email' : req.body.email }), req.body.password, (err, user) => {
        if (err) {
          winston.log('info', err.message);
          return res.render('register', { error : err.message });
        }

        passport.authenticate('local')(req, res, () => {
            req.session.save((err) => {
              if (err) {
                  return next(err);
              }
              return res.status(301).redirect('/');
            });
        });
    });
});


// login route
router.post('/login', passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }), (req, res, next) => {
    req.session.save((err) => {
        if (err) {
            return next(err);
        }
        return res.status(301).redirect('/');
    });
});


router.get('/login', (req, res) => {
    res.render('index', { user : req.user, error : req.flash('error')});
});


// change password form
router.get('/reset-password', (req, res, next) => {
  return res.render('reset-password', { });
})


// change password
router.post('/reset-password', (req, res, next) => {
  return res.status(301).redirect('/');
});





// auth middleware
router.use(function (req, res, next) {
  if (!req.user){
    return res.status(301).redirect('/');
  }
  next()
})

// logout route
router.get('/logout', (req, res, next) => {
    req.logout();
    req.session.save((err) => {
        if (err) {
            return next(err);
        }
        return res.status(301).redirect('/');
    });
});


// profile
router.get('/profile', (req, res, next) => {
  return res.render('profile', {user: req.user });
})


// profile update
router.post('/email-update', (req, res, next) => {
  email = req.body.email;
  if(req.user.email != email){
    req.user.email = email;
    req.user.save(function(err){
      if (err) {
        return res.render('profile', { user: req.user, error : 'Update email Failed' });
      }
      req.logout();
      req.session.save((err) => {
        if (err) {
            return next(err);
        }
        return res.render('index', { user : req.user, message : 'Email updated successfully! Login with new email'});
      });
    });
  }
  else{
    return res.render('profile',{user: req.user, message: 'No change in email'});
  }
});

// change password
router.post('/change-password', (req, res, next) => {
  newPassword = req.body.newPassword;
  confirmPassword = req.body.confirmPassword;
  if (newPassword != confirmPassword){
    return res.render('profile', { user: req.user, error : 'Password did not match! Try again' });
  }
  req.user.setPassword(confirmPassword, (err, user) => {
    if(!err){
      req.user.save(function(err){
          if (err) {
            return res.render('profile', { user: req.user, error : 'Change Password Failed' });
          }
          req.logout();
          req.session.save((err) => {
            if (err) {
                return next(err);
            }
            return res.render('index', { user : req.user, message : 'Password changed successfully! Login with new password'});
          });
      });
    }
    else{
      return res.render('profile', { user: req.user, error : 'Change Password Failed' });
    }
  });
});

module.exports = router;
