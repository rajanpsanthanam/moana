const express = require('express');
const router = express.Router();
const Account = require('../models/account');
const User = require('../models/user');
const Feature = require('../models/feature');
const Stage = require('../models/stage');


// auth middleware
router.use(function (req, res, next) {
  if (!req.user){
      res.redirect('/');
  }
  next();
});


// get a single account
router.get('/view/:name', (req, res, next) => {
  Account
  .findOne({"name": req.params.name})
  .populate('primary_manager secondary_manager features stages.stage stages.last_updated_by comments.by')
  .exec(function(err, account) {
    if(err){
        return res.render('accounts', { error : err.message });
    } else{
        return res.render('account', { account : account });
    }
  });
});


// return stage analytics data
router.get('/analytics/:name/stage', (req, res, next) => {
  Account
  .findOne({"name": req.params.name})
  .populate('primary_manager secondary_manager features stages.stage stages.last_updated_by comments.by')
  .exec(function(err, account) {
    if(err){
        return res.render('accounts', { error : err.message });
    }
    else{
      var labels = [];
      var data_points = [];
      var background_color = [];
      var border_color = [];
      var millisecondsPerDay = 1000 * 60 * 60 * 24;
      for(i=0; i<account.stages.length; i++){
        labels.push(account.stages[i].stage.name);
        var millisBetween = account.stages[i].start_date.getTime() - account.stages[i].end_date.getTime();
        var data_point = millisBetween / millisecondsPerDay;
        data_points.push(Math.ceil(data_point));
        background_color.push(account.stages[i].stage.color)
        border_color.push(account.stages[i].stage.color)
      }
      res_data = {
        'labels': labels,
        'data': data_points,
        'background_color': background_color,
        'border_color': border_color
      }
      res.send(JSON.stringify(res_data));
    }
  });
})


router.post('/manage/:name/add-comment', (req, res, next) => {
  var comment = req.body.comment
  Account.findOneAndUpdate({"name": req.params.name}, { $push: {"comments": {"body": comment, "by": req.user._id} } }, function(err, account){
      if(err){
        res.redirect('/accounts/view/'+req.params.name+'/')
      }
      else{
        res.redirect('/accounts/view/'+req.params.name+'/')
      }
    });
});


router.get('/manage/:name/stages', (req, res, next) => {
  Account
  .findOne({"name": req.params.name})
  .populate('primary_manager secondary_manager features stages.stage stages.last_updated_by comments.by')
  .exec( function(err, account) {
    if(err){
      return res.render('manage-stage', { error : err.message });
    } else{
      return res.render('manage-stage', { account : account });
    }
  });
});

router.get('/manage/:name/add-stage', (req, res, next) => {
  Account
  .findOne({ "name": req.params.name })
  .populate('primary_manager secondary_manager features stages.stage stages.last_updated_by comments.by')
  .exec(function(err, account) {
    if (err)
      return res.render('add-stage', { error : err.message });
    var account = account;
    Stage.find({"is_deleted": false}, '', function(err, stages){
          if(err){
              return res.render('add-stage', { error : err.message });
          } else{
              return res.render('add-stage', { account: account, stages : stages});
          }
      });
  });
});


router.post('/manage/:name/add-stage', (req, res, next) => {
  var stage = req.body.stage
  Account.findOneAndUpdate({"name": req.params.name}, { $push: {"stages": {"stage": stage, "last_updated_by": req.user._id} } }, function(err, account){
      if(err){
        return res.render('manage-stage', { error : err.message });
      }
      else{
        res.redirect('/accounts/manage/'+req.params.name+'/stages/')
      }
    });
});


router.get('/manage/:name/complete-stage/:stage', (req, res, next) => {
  var stage = req.params.stage;
  Account
  .findOne({ "name": req.params.name })
  .populate('primary_manager secondary_manager features stages.stage stages.last_updated_by comments.by')
  .exec(function(err, account) {
    if (err)
      return res.render('manage-stage', { error : err.message });
    for(i=0; i<account.stages.length; i++){
      if(account.stages[i].stage.name == stage){
        account.stages[i].end_date = new Date();
        account.save();
      }
    }
    res.redirect('/accounts/manage/'+req.params.name+'/stages/')
  });
});


// admin auth middleware
router.use(function (req, res, next) {
  if(!req.user.is_admin){
    res.redirect('/');
  }
  next();
});


function filter_data(params){
  var filters = {"is_deleted": false};
  if('name' in params){
    filters['name'] = { $regex: params.name+'.*', $options: 'i' };
  };
  if ('primary_manager' in params){
    if (params.primary_manager != 'all'){
      filters['primary_manager'] = params.primary_manager;
    };
  };
  if ('secondary_manager' in params){
    if (params.secondary_manager != 'all'){
      filters['secondary_manager'] = params.secondary_manager;
    };
  };
  return filters;
}


// get all accounts
router.get('/', (req, res, next) => {
  var message = req.query.message;
  var filters = filter_data(req.query);
  Account
  .find(filters)
  .populate('primary_manager secondary_manager features stages.stage stages.last_updated_by comments.by')
  .exec(function(err, accounts){
    if(err){
      return res.render('accounts', { error : err.message });
    }
    else{
      var accounts = accounts;
      User
      .find({"is_deleted": false}, 'username')
      .exec(function(err, users){
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
  Feature
  .find({"is_deleted": false})
  .exec(function(err, features){
    if(err){
        res.redirect('/accounts/?message=create failed');
    }
    else{
      var opted_features = []
      for(i=0; i<features.length; i++) {
        if(features[i].name in req.body){
          opted_features.push(features[i]._id)
        }
      }
      data = {
        'name': req.body.name,
        'stage': req.body.stage,
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
      if(opted_features){
        data['features'] = opted_features;
      }
      var account = new Account(data);
      account.save(function (err) {
        if (err) {
          res.redirect('/accounts/?message=create failed');
        } else {
          res.redirect('/accounts/?message=successfully created');
        }
      });
    }
  });
});


// update account data
router.post('/:name', (req, res, next) => {
  Feature.find({"is_deleted": false}, '', function(err, features){
    if(err){
        res.redirect('/accounts/?message=update failed');
    }
    else{
      var opted_features = []
      for(i=0; i<features.length; i++) {
        if(features[i].name in req.body){
          opted_features.push(features[i]._id)
        }
      }
      Account.findOne({"name": req.params.name}, '', function(err, account){
        if(err){
          res.redirect('/accounts/?message=update failed')
        }
        else{
          account.name = req.body.name;
          account.stage = req.body.stage;
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
          if(opted_features){
            account.features = opted_features;
          }
          account.save();
          res.redirect('/accounts/?message=successfully updated')
          }
        });
      }
    });
  });


// route to add new account form
router.get('/add', (req, res, next) => {
  User.find({"is_deleted": false}, 'username', function(err, users){
        if(err){
            return res.render('new-account', { error : err.message });
        } else{
            var users = users;
            Feature.find({"is_deleted": false}, '_id, name', function(err, features){
                  if(err){
                      return res.render('new-account', { error : err.message });
                  } else{
                      return res.render('new-account', { users : users, features: features});
                  }
              });
        }
    });
});


// route to edit account form
router.get('/edit/:name', (req, res, next) => {
  Account
  .findOne({"name": req.params.name})
  .populate('primary_manager secondary_manager features stages.stage stages.last_updated_by comments.by')
  .exec( function(err, account){
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
              var users = users;
              var opted_features = [];
              for(i=0; i<account.features.length; i++){
                opted_features.push(account.features[i]._id.toString());
              }
              Feature.find({"is_deleted": false}, '_id, name', function(err, features){
                if(err){
                  return res.render('edit-account', { error : err.message });
                }
                else{
                  for(i=0; i<features.length; i++){
                    features[i]._id = features[i]._id.toString();
                  }
                  return res.render(
                    'edit-account', {
                      account: account, users : users, features: features, opted_features: opted_features
                    }
                  );
                }
            });
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

module.exports = router;
