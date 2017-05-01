const express = require('express');
const router = express.Router();
const User = require('../models/user');
const winston = require('winston');
const constants = require('../common/constants');

// admin auth middleware
router.use(function (req, res, next) {
  if(!req.user){
    return res.status(301).redirect('/');
  }
  else if(!req.user.is_admin){
    return res.status(301).redirect('/');
  }
  next();
});


/*
Note: to create initial admin
db.users.updateOne({"username": "admin"}, {$set: {"is_admin": true}})
*/
router.get('/', (req, res, next) => {
  var message = req.query.message;
  User
  .find({"is_deleted": false}, 'username is_admin')
  .exec(function(err, users){
        if(err){
          winston.log('info', err.message);
          return res.render('index', { error : err.message });
        } else{
          return res.render('users', { user: req.user, users : users, message: req.flash('info'), error: req.flash('error') });
        }
    });
});


// revoke admin access
router.get('/revoke/:username', (req, res, next) => {
  User
  .findOneAndUpdate({username: req.params.username}, {is_admin: false})
  .exec(function(err, user){
    if(err){
      req.flash('error', 'revoke failed');
      return res.status(301).redirect('/users');
    }
    else {
      req.flash('info', 'revoke successfull');
      return res.status(301).redirect('/users');
    }
  });
});


// grant admin access
router.get('/grant/:username', (req, res, next) => {
  User
  .findOneAndUpdate({username: req.params.username}, {is_admin: true})
  .exec(function(err, user){
    if(err){
      req.flash('error', 'grant failed');
      return res.status(301).redirect('/users');
    }
    else {
      req.flash('info', 'grant successfull');
      return res.status(301).redirect('/users');
    }
  });
});

// soft delete user
router.get('/remove/:username', (req, res, next) => {
  User
  .findOne({username: req.params.username})
  .exec(function(err, user){
    if(err){
      req.flash('error', 'delete failed');
      return res.status(301).redirect('/users');
    }
    else {
      user.is_deleted = true;
      user.save();
      req.flash('info', 'delete successfull');
      return res.status(301).redirect('/users');
    }
  });
});

module.exports = router;
