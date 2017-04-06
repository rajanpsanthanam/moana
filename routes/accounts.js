const express = require('express');
const router = express.Router();
const Account = require('../models/account');
const User = require('../models/user');


// get all accounts
router.get('/', (req, res, next) => {
  var message = req.query.message;
  Account.find({"is_deleted": false}, '', function(err, accounts){
        if(err){
            return res.render('accounts', { error : err.message });
        } else{
            return res.render('accounts', { accounts : accounts, message: message });
        }
    })
});

// create new account
router.post('/', (req, res, next) => {
  data = {
    'name': req.body.name,
    'stage': req.body.stage,
    'is_on_android': 'is_on_android' in req.body,
    'is_on_ios': 'is_on_ios' in req.body,
    'is_on_web': 'is_on_web' in req.body,
    'is_on_loyalty': 'is_on_loyalty' in req.body,
    'primary_manager': req.body.primary_manager,
    'secondary_manager': req.body.secondary_manager
  }
  if (req.body.no_of_stores){
    data['no_of_stores'] = req.body.no_of_stores
  }
  if (req.body.agreed_date){
    data['agreed_date'] = new Date(req.body.agreed_date)
  }
  if (req.body.onboarding_start_date){
    data['onboarding_start_date'] = new Date(req.body.onboarding_start_date)
  }
  if (req.body.expected_go_live_date){
    data['expected_go_live_date'] = new Date(req.body.expected_go_live_date)
  }
  if (req.body.actual_live_date){
    data['actual_live_date'] = new Date(req.body.actual_live_date)
  }
  var account = new Account(data);
  account.save(function (err) {
    if (err) {
      res.redirect('/accounts/?message=create failed');
    } else {
      res.redirect('/accounts/?message=successfully created');
    }
  });
});


// update account data
router.post('/:name', (req, res, next) => {
  Account.findOne({"name": req.params.name}, '', function(err, account){
      if(err){
        res.redirect('/accounts/?message=update failed')
      }
      else{
        account.name = req.body.name;
        account.stage = req.body.stage;
        account.is_on_android = 'is_on_android' in req.body;
        account.is_on_ios = 'is_on_ios' in req.body;
        account.is_on_web = 'is_on_web' in req.body;
        account.is_on_loyalty = 'is_on_loyalty' in req.body;
        account.primary_manager = req.body.primary_manager;
        account.secondary_manager = req.body.secondary_manager;
        if (req.body.no_of_stores){
          account.no_of_stores = req.body.no_of_stores;
        }
        if (req.body.agreed_date){
          account.agreed_date = new Date(req.body.agreed_date);
        }
        if (req.body.onboarding_start_date){
          account.onboarding_start_date = new Date(req.body.onboarding_start_date);
        }
        if (req.body.expected_go_live_date){
          account.expected_go_live_date = new Date(req.body.expected_go_live_date);
        }
        if (req.body.actual_live_date){
          account.actual_live_date = new Date(req.body.actual_live_date);
        }
        account.save();
        res.redirect('/accounts/?message=successfully updated')
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


// soft delete account
router.get('/remove/:name', (req, res, next) => {
  Account.findOne({"name": req.params.name}, '', function(err, account){
      if(err){
        res.redirect('/accounts/?message=delete failed')
      }
      else{
        account.is_deleted = true
        account.save();
        res.redirect('/accounts/?message=successfully deleted')
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
