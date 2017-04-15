const express = require('express');
const router = express.Router();
const User = require('../models/user');
const winston = require('winston');


// auth middleware
router.use(function (req, res, next) {
  if (!req.user){
    return res.status(301).redirect('/');
  }
  next()
})


// admin auth middleware
router.use(function (req, res, next) {
  if(!req.user.is_admin){
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
  User.find({"is_deleted": false}, 'username is_admin', function(err, users){
        if(err){
          winston.log('info', err.message);
          return res.render('index', { error : err.message });
        } else{
          return res.render('users', { user: req.user, users : users, message: message });
        }
    })
});


// revoke admin access
router.get('/revoke/:username', (req, res, next) => {
  User.findOneAndUpdate({username: req.params.username}, {is_admin: false}, function(err, user){
    if(err){
      return res.status(301).redirect('/users/?message=revoke failed')
    }
    else {
      return res.status(301).redirect('/users/?message=revoke successfull')
    }
  })
});


// grant admin access
router.get('/grant/:username', (req, res, next) => {
  User.findOneAndUpdate({username: req.params.username}, {is_admin: true}, function(err, user){
    if(err){
      return res.status(301).redirect('/users/?message=grant failed')
    }
    else {
      return res.status(301).redirect('/users/?message=grant successfull')
    }
  })
});

// soft delete user
router.get('/remove/:username', (req, res, next) => {
  User.findOne({username: req.params.username}, function(err, user){
    if(err){
      return res.status(301).redirect('/users/?message=delete failed')
    }
    else {
      user.is_deleted = true;
      user.save();
      return res.status(301).redirect('/users/?message=delete successfull')
    }
  })
});

module.exports = router;
