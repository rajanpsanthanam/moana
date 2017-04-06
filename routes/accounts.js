const express = require('express');
const router = express.Router();
const Account = require('../models/account');
const User = require('../models/user');


// get all accounts
router.get('/', (req, res, next) => {
  Account.find({}, '', function(err, accounts){
        if(err){
            return res.render('accounts', { error : err.message });
        } else{
            return res.render('accounts', { accounts : accounts });
        }
    })
});

// create new account
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
    no_of_stores: req.body.no_of_stores,
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


// update account data
router.post('/:name', (req, res, next) => {
  Account.findOne({"name": req.params.name}, '', function(err, account){
      if(err){
          return res.render('edit-account', { error : err.message });
      }
      else{
          res.redirect('/accounts')
      }
    });
  });


// route to add new account form
router.get('/add', (req, res, next) => {
  User.find({}, 'username', function(err, users){
        if(err){
            return res.render('new-account', { error : err.message });
        } else{
            return res.render('new-account', { users : users});
        }
    })
});


// route to edit account form
router.get('/edit/:name', (req, res, next) => {
  Account.findOne({"name": req.params.name}, '', function(err, account){
        if(err){
            return res.render('edit-account', { error : err.message });
        }
        else{
            var account = account;
            User.find({}, 'username', function(err, users){
                if(err){
                    return res.render('edit-account', { error : err.message });
                }
                else{
                  return res.render('edit-account', { account : account, users: users});
                }
            });
        }
    });
});


// get a single account
router.get('/:name', (req, res, next) => {
  Account.findOne({"name": req.params.name}, 'name stage primary_manager', function(err, account){
        if(err){
            return res.render('accounts', { error : err.message });
        } else{
            return res.render('account', { account : account });
        }
    })
})



module.exports = router;
