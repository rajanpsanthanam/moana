const express = require('express');
const router = express.Router();
const User = require('../models/user');

/* GET users listing. */
//db.users.updateOne({"username": ""}, {$set: {"is_admin": true}})
router.get('/', (req, res, next) => {
  var message = req.query.message;
  User.find({}, 'username is_admin', function(err, users){
        if(err){
            return res.render('users', { error : err.message });
        } else{
            return res.render('users', { users : users, message: message });
        }
    })
});

router.get('/revoke/', (req, res, next) => {
  var username = req.query.username;
  User.findOneAndUpdate({username: username}, {is_admin: false}, function(err, user){
    if(err){
      res.redirect('/users/?message=revoke failed')
    }
    else {
      res.redirect('/users/?message=revoke successfull')
    }
  })
});

router.get('/grant/', (req, res, next) => {
  var username = req.query.username;
  User.findOneAndUpdate({username: username}, {is_admin: true}, function(err, user){
    if(err){
      res.redirect('/users/?message=grant failed')
    }
    else {
      res.redirect('/users/?message=grant successfull')
    }
  })
});

router.get('/remove/', (req, res, next) => {
  var username = req.query.username;
  User.findOneAndRemove({username: username}, function(err, user){
    if(err){
      res.redirect('/users/?message=delete failed')
    }
    else {
      res.redirect('/users/?message=delete successfull')
    }
  })
});

module.exports = router;
