const express = require('express');
const router = express.Router();
const User = require('../models/user');


/*
Note: to create initial admin
db.users.updateOne({"username": "admin"}, {$set: {"is_admin": true}})
*/
router.get('/', (req, res, next) => {
  if (!req.user){
    res.redirect('/');
  }
  var message = req.query.message;
  User.find({"is_deleted": false}, 'username is_admin', function(err, users){
        if(err){
            return res.render('users', { error : err.message });
        } else{
            return res.render('users', { users : users, message: message });
        }
    })
});


// revoke admin access
router.get('/revoke/:username', (req, res, next) => {
  if (!req.user){
    res.redirect('/');
  }
  User.findOneAndUpdate({username: req.params.username}, {is_admin: false}, function(err, user){
    if(err){
      res.redirect('/users/?message=revoke failed')
    }
    else {
      res.redirect('/users/?message=revoke successfull')
    }
  })
});


// grant admin access
router.get('/grant/:username', (req, res, next) => {
  if (!req.user){
    res.redirect('/');
  }
  User.findOneAndUpdate({username: req.params.username}, {is_admin: true}, function(err, user){
    if(err){
      res.redirect('/users/?message=grant failed')
    }
    else {
      res.redirect('/users/?message=grant successfull')
    }
  })
});

// soft delete user
router.get('/remove/:username', (req, res, next) => {
  if (!req.user){
    res.redirect('/');
  }
  User.findOne({username: req.params.username}, function(err, user){
    if(err){
      res.redirect('/users/?message=delete failed')
    }
    else {
      user.is_deleted = true;
      user.save();
      res.redirect('/users/?message=delete successfull')
    }
  })
});

module.exports = router;
