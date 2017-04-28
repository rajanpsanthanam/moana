const express = require('express');
const router = express.Router();
const Account = require('../models/account');
const User = require('../models/user');
const Feature = require('../models/feature');
const Stage = require('../models/stage');
const winston = require('winston');
const constants = require('../common/constants');


// constants needed for the module
var genericError = constants.genericError;

var createSuccess = constants.createSuccess;
var createFailed = constants.createFailed;

var updateSuccess = constants.updateSuccess;
var updateFailed = constants.updateFailed;

var deleteSuccess = constants.deleteSuccess;
var deleteFailed = constants.deleteFailed;


var accountFields = 'primary_manager secondary_manager features stages.stage stages.last_updated_by comments.by'


// middleware for auth check
router.use(function (req, res, next) {
  if (!req.user){
      return res.status(301).redirect('/');
  }
  next();
});


// get a single account
router.get('/view/:name', (req, res, next) => {
  Account
  .findOne({"name": req.params.name})
  .populate(accountFields)
  .exec(function(err, account) {
    if(err){
        winston.log('info', err.message);
        return res.status(301).redirect('/accounts?message='+genericError);
    } else{
        return res.render('account', { account : account, user: req.user });
    }
  });
});


// return account per state analytics data
router.get('/analytics/state', (req, res, next) => {
  Account
  .find({"is_deleted": false})
  .populate(accountFields)
  .exec(function(err, accounts) {
    if(err){
        winston.log('info', err.message);
        return res.status(301).redirect('/accounts?message='+genericError);
    }
    else{
      let notStarted = 0;
      let inProgress = 0;
      let completed = 0;
      for(i=0; i<accounts.length; i++){
        if(accounts[i].actual_completion_date){
          completed += 1;
        }
        else if(accounts[i].stages.length == 0){
          notStarted += 1;
        }
        else{
          inProgress += 1;
        }
      }
      var labels = ['not-started', 'in-progress', 'completed'];
      var data_points = [notStarted, inProgress, completed];
      var background_color = ['#0c4070', '#831e89', '#1e695f'];
      var border_color = ['#fff', '#fff', '#fff'];
      res_data = {
        'labels': labels,
        'data': data_points,
        'background_color': background_color,
        'border_color': border_color
      }
      return res.send(JSON.stringify(res_data));
    }
  });
});


// return accounts per stage analytics data
router.get('/analytics/stage', (req, res, next) => {
  Account
  .find({"is_deleted": false})
  .populate(accountFields)
  .exec(function(err, accounts) {
    if(err){
        winston.log('info', err.message);
        return res.status(301).redirect('/accounts?message='+genericError);
    }
    else{
      var stages = {};
      var labels = [];
      var data_points = [];
      var background_color = [];
      var border_color = [];
      for(var i in accounts){
        var account = accounts[i];
        var total_stages = account.stages.length;
        if(total_stages>0){
          for(j=0; j<total_stages; j++){
            if(!stages.hasOwnProperty(account.stages[j].stage.name)){
              stages[account.stages[j].stage.name] = {
                'count': 0,
                'bg_color': account.stages[j].stage.bg_color,
                'font_color': account.stages[j].stage.font_color
              }
            }
          }
          stages[account.stages[total_stages-1].stage.name]['count'] += 1;
        }
      }
      for(var stage in stages){
        labels.push(stage);
        data_points.push(stages[stage]['count']);
        background_color.push(stages[stage]['bg_color']);
        border_color.push(stages[stage]['font_color']);
      }
      res_data = {
        'labels': labels,
        'data': data_points,
        'background_color': background_color,
        'border_color': border_color
      }
      return res.send(JSON.stringify(res_data));
    }
  });
});


// return account per feature analytics data
router.get('/analytics/feature', (req, res, next) => {
  Account
  .find({"is_deleted": false})
  .populate(accountFields)
  .exec(function(err, accounts) {
    if(err){
        winston.log('info', err.message);
        return res.status(301).redirect('/accounts?message='+genericError);
    }
    else{
      var features = {};
      var labels = [];
      var data_points = [];
      var background_color = [];
      var border_color = [];
      for(var i in accounts){
        var account = accounts[i];
        if(account.features){
          for(j=0; j<account.features.length; j++){
            if(!features.hasOwnProperty(account.features[j].name)){
              features[account.features[j].name] = {
                'count': 1,
                'bg_color': account.features[j].bg_color,
                'font_color': account.features[j].font_color
              }
            }
            else{
              features[account.features[j].name]['count'] += 1;
            }
          }
        }
      }
      for(var feature in features){
        labels.push(feature);
        data_points.push(features[feature]['count']);
        background_color.push(features[feature]['bg_color']);
        border_color.push(features[feature]['font_color']);
      }
      res_data = {
        'labels': labels,
        'data': data_points,
        'background_color': background_color,
        'border_color': border_color
      }
      return res.send(JSON.stringify(res_data));
    }
  });
});

// return days per stage analytics data
router.get('/analytics/:name/stage', (req, res, next) => {
  Account
  .findOne({"name": req.params.name})
  .populate(accountFields)
  .exec(function(err, account) {
    if(err){
        winston.log('info', err.message);
        return res.status(301).redirect('/accounts?message='+genericError);
    }
    else{
      var labels = [];
      var data_points = [];
      var background_color = [];
      var border_color = [];
      var millisecondsPerDay = 1000 * 60 * 60 * 24;
      for(i=0; i<account.stages.length; i++){
        labels.push(account.stages[i].stage.name);
        if(account.stages[i].start_date && account.stages[i].end_date){
          var millisBetween = account.stages[i].end_date.getTime() - account.stages[i].start_date.getTime();
          var data_point = millisBetween / millisecondsPerDay;
        }
        else{
          var data_point = 0;
        }
        data_points.push(Math.ceil(data_point));
        background_color.push(account.stages[i].stage.bg_color)
        border_color.push(account.stages[i].stage.font_color)
      }
      res_data = {
        'labels': labels,
        'data': data_points,
        'background_color': background_color,
        'border_color': border_color
      }
      return res.send(JSON.stringify(res_data));
    }
  });
});


// add comment to account
router.post('/manage/:name/add-comment', (req, res, next) => {
  var comment = req.body.comment
  Account
  .findOneAndUpdate({"name": req.params.name}, { $push: {"comments": {"body": comment, "by": req.user._id} } })
  .exec(function(err, account){
      if(err){
        winston.log('info', err.message);
        return res.status(301).redirect('/accounts?message='+genericError);
      }
      else{
        return res.status(301).redirect('/accounts/view/'+req.params.name+'/')
      }
    });
});


// list the stages for an account
router.get('/manage/:name/stages', (req, res, next) => {
  Account
  .findOne({"name": req.params.name})
  .populate(accountFields)
  .exec( function(err, account) {
    if(err){
      winston.log('info', err.message);
      return res.status(301).redirect('/accounts?message='+genericError);
    } else{
      return res.render('manage-stage', { account : account });
    }
  });
});


// add a stage to account form
router.get('/manage/:name/add-stage', (req, res, next) => {
  Account
  .findOne({ "name": req.params.name })
  .populate(accountFields)
  .exec(function(err, account) {
    if(err){
      winston.log('info', err.message);
      return res.status(301).redirect('/accounts?message='+genericError);
    }
    else{
      var account = account;
      Stage.find({"is_deleted": false}, '', function(err, stages){
          if(err){
              return res.render('add-stage', { error : err.message });
          } else{
              return res.render('add-stage', { account: account, stages : stages});
          }
      });
    }
  });
});


// add stage to account
router.post('/manage/:name/add-stage', (req, res, next) => {
  var stage = req.body.stage
  Account
  .findOneAndUpdate({"name": req.params.name}, { $push: {"stages": {"stage": stage, "last_updated_by": req.user._id} } })
  .exec(function(err, account){
      if(err){
        winston.log('info', err.message);
        return res.status(301).redirect('/accounts?message='+genericError);
      }
      else{
        Stage
        .findOne({"_id": stage}, '')
        .exec(function(err, stage_data){
          if(err){
            winston.log('info', err.message);
            return res.status(301).redirect('/accounts?message='+genericError);
          } else{
              // event name: message
              var comment = 'New Stage: stage "'+stage_data.name+'" added into account';
              Account
              .findOneAndUpdate({"name": req.params.name}, { $push: {"comments": {"body": comment, "by": req.user._id} } })
              .exec(function(err, account){
                if(err){
                  winston.log('info', err.message);
                  return res.status(301).redirect('/accounts?message='+genericError);
                }
                else{
                  return res.status(301).redirect('/accounts/manage/'+req.params.name+'/stages/')
                }
            });
          }
        });
      }
    });
});


// complete a stage for an account
router.get('/manage/:name/complete-stage/:stage', (req, res, next) => {
  var stage = req.params.stage;
  Account
  .findOne({ "name": req.params.name })
  .populate(accountFields)
  .exec(function(err, account) {
    if(err){
      winston.log('info', err.message);
      return res.status(301).redirect('/accounts?message='+genericError);
    }
    else{
      for(i=0; i<account.stages.length; i++){
        if(account.stages[i].stage.name == stage && !account.stages[i].end_date){
          account.stages[i].end_date = new Date();
          account.save();
        }
      }
      Stage
      .findOne({"name": stage}, '')
      .exec(function(err, stage_data){
        if(err){
          winston.log('info', err.message);
          return res.status(301).redirect('/accounts?message='+genericError);
        }
        else{
          // event name: message
          var comment = 'Stage Completed: stage "'+stage_data.name+'" got completed';
          Account
          .findOneAndUpdate({"name": req.params.name}, { $push: {"comments": {"body": comment, "by": req.user._id} } })
          .exec(function(err, account){
            if(err){
              winston.log('info', err.message);
              return res.status(301).redirect('/accounts?message='+genericError);
            }
            else{
              return res.status(301).redirect('/accounts/manage/'+req.params.name+'/stages/')
            }
          });
        }
      });
    }
  });
});


// admin auth middleware
router.use(function (req, res, next) {
  if(!req.user.is_admin){
    return res.status(301).redirect('/');
  }
  next();
});


// filter data on accounts list
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
  var error = req.query.error;
  var filters = filter_data(req.query);
  Account
  .find(filters)
  .populate(accountFields)
  .exec(function(err, accounts){
    if(err){
      winston.log('info', err.message);
      return res.render('index', { error : err.message });
    }
    else{
      var accounts = accounts;
      User
      .find({"is_deleted": false}, 'username')
      .exec(function(err, users){
          if(err){
            winston.log('info', err.message);
            return res.render('index', { error : err.message });
          }
          else{
            return res.render(
              'accounts',
              { user: req.user, accounts : accounts, users: users, filters: filters, message: message, error: error }
            );
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
        winston.log('info', err.message);
        return res.status(301).redirect('/accounts/?error='+genericError);
    }
    else{
      var opted_features = []
      for(i=0; i<features.length; i++) {
        if(features[i].name in req.body){
          opted_features.push(features[i]._id)
        }
      }
      Account
      .findOne({"name": req.body.name})
      .exec(function(err, account) {
        if(err){
            winston.log('info', err.message);
            return res.status(301).redirect('/accounts?error='+genericError);
        } else{
            if(!account){
              data = {
                'name': req.body.name,
                'primary_manager': req.body.primary_manager,
                'secondary_manager': req.body.secondary_manager
              }
              if (req.body.signup_date){
                data['signup_date'] = new Date(req.body.signup_date)
              }
              if (req.body.process_start_date){
                data['process_start_date'] = new Date(req.body.process_start_date)
              }
              if (req.body.expected_completion_date){
                data['expected_completion_date'] = new Date(req.body.expected_completion_date)
              }
              if (req.body.actual_completion_date){
                data['actual_completion_date'] = new Date(req.body.actual_completion_date)
              }
              if(opted_features){
                data['features'] = opted_features;
              }
              var account = new Account(data);
              account.save(function (err) {
                if (err) {
                  return res.status(301).redirect('/accounts/?error='+createFailed);
                } else {
                  return res.status(301).redirect('/accounts/?message='+createSuccess);
                }
              });
            }
            else{
              let error = 'Account already exists';
              return res.status(301).redirect('/accounts/?error='+error);
            }
          }
      });
    }
  });
});


function updateAccount(account, req, opted_features){
  account.name = req.body.name;
  account.primary_manager = req.body.primary_manager;
  account.secondary_manager = req.body.secondary_manager;
  if (req.body.signup_date){
    account.signup_date = new Date(req.body.signup_date);
  }
  if (req.body.process_start_date){
    account.process_start_date = new Date(req.body.process_start_date);
  }
  if (req.body.expected_completion_date){
    account.expected_completion_date = new Date(req.body.expected_completion_date);
  }
  if (req.body.actual_completion_date){
    account.actual_completion_date = new Date(req.body.actual_completion_date);
  }
  if(opted_features){
    account.features = opted_features;
  }
  account.save();
  return true;
}


// update account data
router.post('/:name', (req, res, next) => {
  Feature
  .find({"is_deleted": false}, '')
  .exec(function(err, features){
    if(err){
        return res.status(301).redirect('/accounts/?error=update failed');
    }
    else{
      var opted_features = []
      for(i=0; i<features.length; i++) {
        if(features[i].name in req.body){
          opted_features.push(features[i]._id)
        }
      }
      Account
      .findOne({"name": req.params.name})
      .exec(function(err, account) {
        if(err){
          winston.log('info', err.message);
          return res.status(301).redirect('/accounts?error='+genericError);
        }
        else{
          if(account){
            Account
            .findOne({"name": req.body.name}, '')
            .exec(function(err, duplicate){
              if(err){
                return res.status(301).redirect('/accounts/?error='+updateFailed);
              }
              else{
                if(!duplicate){
                  updateAccount(account, req, opted_features);
                  return res.status(301).redirect('/accounts/?message='+updateSuccess);
                }
                else if(duplicate.name == req.params.name){
                  updateAccount(account, req, opted_features);
                  return res.status(301).redirect('/accounts/?message='+updateSuccess);
                }
                else{
                  var error = 'Account already exists with name '+req.body.name;
                  return res.status(301).redirect('/accounts/?error='+error);
                }
              }
            });
          }
          else{
            winston.log('info', err.message);
            return res.status(301).redirect('/accounts?error='+genericError);
          }
        }
      });
    }
  });
});


// route to add new account form
router.get('/add', (req, res, next) => {
  User
  .find({"is_deleted": false}, 'username')
  .exec(function(err, users){
        if(err){
            return res.status(301).redirect('/accounts?error='+genericError);
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
  .populate(accountFields)
  .exec( function(err, account){
      if(err){
          return res.status(301).redirect('/accounts?error='+genericError);
      }
      else{
          var account = account;
          User.find({"is_deleted": false}, 'username', function(err, users){
            if(err){
                return res.status(301).redirect('/accounts?error='+genericError);
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
  Account
  .findOne({"name": req.params.name}, '')
  .exec(function(err, account){
      if(err){
        return res.status(301).redirect('/accounts/?error='+deleteFailed)
      }
      else{
        account.is_deleted = true
        account.save();
        res.redirect('/accounts/?message='+deleteSuccess)
      }
    });
});

module.exports = router;
