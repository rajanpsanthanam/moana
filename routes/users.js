const express = require('express');
const router = express.Router();
const User = require('../models/user');
const winston = require('winston');
const constants = require('../common/constants');


// auth middleware
router.use(function (req, res, next) {
  if(!req.user){
    return res.status(301).redirect('/');
  }
  next();
});



// filter data on users list
function filter_data(req){
  // var filters = {"username": {"$ne": req.user.username}};
  params = req.query
  filters = {};
  if('name' in params){
    filters['username'] = { $regex: params.name+'.*', $options: 'i' };
  };
  if(req.user.role=='administrator'){
    if('role' in params){
      if (params.role != 'all'){
        filters['role'] = params.role;
      };
    }
    if('state' in params){
      if (params.state == 'active'){
        filters['is_deleted'] = false;
      };
      if (params.state == 'deleted'){
        filters['is_deleted'] = true;
      };
    }
    else{
      filters['is_deleted'] = false;
    }
  }
  else{
    filters['is_deleted'] = false;
  }
  return filters;
}

/*
Note: to create initial admin
db.users.updateOne({"username": "admin"}, {$set: {"is_admin": true}})
*/
router.get('/', (req, res, next) => {
  var filters = filter_data(req);
  var message = req.query.message;
  User
  .find(filters)
  .sort('username')
  .exec(function(err, users){
        if(err){
          winston.log('info', err.message);
          return res.render('index', { error : err.message });
        } else{
          return res.render('users', { req_user: req.user, query_param: req.query, users : users, message: req.flash('info'), error: req.flash('error') });
        }
    });
});


// admin auth middleware
router.use(function (req, res, next) {
  if(!req.user){
    return res.status(301).redirect('/');
  }
  else if(req.user.role != 'administrator'){
    return res.status(301).redirect('/');
  }
  next();
});



// register page
router.get('/add', (req, res) => {
    return res.render('add-user', { });
});


// register route
router.post('/', (req, res, next) => {
      User.register(new User({ 'username' : req.body.username, 'email' : req.body.email }), req.body.password, (err, user) => {
          if (err) {
            winston.log('info', err.message);
            return res.render('add-user', { error : err.message });
          }
          return res.status(301).redirect('/users');
      });
});

// edit user details
router.post('/edit/', (req, res, next) => {
  User
  .findOne({username: req.body.username})
  .exec(function(err, user){
    if(err){
      return res.send(JSON.stringify({ 'status': false }));
    }
    else {
      user.role = req.body.role;
      user.save();
      return res.send(JSON.stringify({ 'status': true }));
    }
  });
});


// revoke admin access
router.get('/revoke/:username', (req, res, next) => {
  User
  .findOneAndUpdate({username: req.params.username}, {is_admin: false})
  .exec(function(err, user){
    if(err){
      req.flash('error', constants.revokeFailed);
      return res.status(301).redirect('/users');
    }
    else {
      req.flash('info', constants.revokeSuccess);
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
      req.flash('error', constants.grantFailed);
      return res.status(301).redirect('/users');
    }
    else {
      req.flash('info', constants.grantSuccess);
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
      req.flash('error', constants.deleteFailed);
      return res.status(301).redirect('/users');
    }
    else {
      user.is_admin = false;
      user.is_deleted = true;
      user.save();
      req.flash('info', constants.deleteSuccess);
      return res.status(301).redirect('/users');
    }
  });
});

// restore deleted user
router.get('/restore/:username', (req, res, next) => {
  User
  .findOne({username: req.params.username})
  .exec(function(err, user){
    if(err){
      req.flash('error', constants.restoreFailed);
      return res.status(301).redirect('/users');
    }
    else {
      user.is_deleted = false;
      user.save();
      req.flash('info', constants.restoreSuccess);
      return res.status(301).redirect('/users');
    }
  });
});


var randomString = function (length, chars) {
    var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
    return result;
}


router.get('/:username/create-token', (req, res, next) => {
  User
  .findOne({username: req.params.username})
  .exec(function(err, user){
    if(err){
      req.flash('error', constants.apiTokenCreateFailed);
      return res.status(301).redirect('/profile');
    }
    else {
      user.api_token = randomString(32, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
      user.save();
      req.flash('info', constants.apiTokenCreateSuccess);
      return res.status(301).redirect('/profile');
    }
  });
});


router.get('/:username/delete-token', (req, res, next) => {
  User
  .findOne({username: req.params.username})
  .exec(function(err, user){
    if(err){
      req.flash('error', constants.apiTokenDeleteFailed);
      return res.status(301).redirect('/profile');
    }
    else {
      user.api_token = '';
      user.save();
      req.flash('info', constants.apiTokenDeleteSuccess);
      return res.status(301).redirect('/profile');
    }
  });
});

module.exports = router;
