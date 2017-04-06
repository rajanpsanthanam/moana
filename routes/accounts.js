const express = require('express');
const router = express.Router();
const Account = require('../models/account');
const User = require('../models/user');


router.get('/', (req, res, next) => {
  var acc_name = req.query.name;
  if(acc_name){
    Account.findOne({"name": acc_name}, 'name stage primary_manager', function(err, account){
          if(err){
              return res.render('accounts', { error : err.message });
          } else{
              return res.render('account-view', { account : account });
          }
      })
  }
  else{
    Account.find({}, 'name stage primary_manager', function(err, accounts){
          if(err){
              return res.render('accounts', { error : err.message });
          } else{
              return res.render('accounts', { accounts : accounts });
          }
      })
  }
});


router.post('/', (req, res, next) => {
  data = {
    name: req.body.name,
    stage: req.body.stage,
    is_on_android: "is_on_android" in req.body,
    is_on_ios: "is_on_ios" in req.body,
    is_on_web: "is_on_web" in req.body,
    is_on_loyalty: "is_on_loyalty" in req.body,
    primary_manager: req.body.primary_manager,
    secondary_manager: req.body.secondary_manager,
    agreed_date: new Date(req.body.agreed_date),
    onboarding_start_date: new Date(req.body.onboarding_start_date),
    expected_go_live_date: new Date(req.body.expected_go_live_date),
    actual_live_date: new Date(req.body.actual_live_date)
  }
  var account = new Account(data);
  account.save(function (err) {
    if (err) {
      res.redirect('/accounts', {error: err.message});
    } else {
      res.redirect('/accounts');
    }
  });
});

router.get('/add', (req, res, next) => {
  User.find({}, 'username', function(err, users){
        if(err){
            return res.render('account', { error : err.message });
        } else{
            return res.render('account', { users : users});
        }
    })
});


module.exports = router;
