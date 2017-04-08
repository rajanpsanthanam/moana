const express = require('express');
const router = express.Router();
const Account = require('../models/account');
const User = require('../models/user');


function filter_data(params){
  var filters = {"is_deleted": false};
  if('name' in params){
    filters['name'] = { $regex: params.name+'.*', $options: 'i' };
  }
  if ('primary_manager' in params){
    if (params.primary_manager != 'all'){
      filters['primary_manager'] = params.primary_manager;
    }
  }
  if ('secondary_manager' in params){
    if (params.secondary_manager != 'all'){
      filters['secondary_manager'] = params.secondary_manager;
    }
  }
  if ('is_on_android' in params){
    filters['is_on_android'] = true;
  }
  if ('is_on_ios' in params){
    filters['is_on_ios'] = true;
  }
  if ('is_on_web' in params){
    filters['is_on_web'] = true;
  }
  if ('is_on_loyalty' in params){
    filters['is_on_loyalty'] = true;
  }
  return filters;
}


// get all accounts
router.get('/', (req, res, next) => {
  var message = req.query.message;
  var filters = filter_data(req.query);
  console.log(filters);
  Account.find(filters, '', function(err, accounts){
        if(err){
            return res.render('accounts', { error : err.message });
        } else{
            var accounts = accounts;
            console.log(accounts);
            User.find({"is_deleted": false}, 'username', function(err, users){
                if(err){
                    return res.render('accounts', { error : err.message });
                }
                else{
                  return res.render('accounts', { accounts : accounts, users: users, filters: filters, message: message });
                }
            });
        }
    });
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
  User.find({"is_deleted": false}, 'username', function(err, users){
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
            User.find({"is_deleted": false}, 'username', function(err, users){
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
  Account.findOne({"name": req.params.name}, '', function(err, account){
        if(err){
            return res.render('accounts', { error : err.message });
        } else{
            return res.render('account', { account : account });
        }
    })
})


// return stage analytics data
router.get('/analytics/:name/stage', (req, res, next) => {
  res.send(JSON.stringify([12, 19, 3, 5, 2, 3]));
})



module.exports = router;
