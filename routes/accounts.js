const express = require('express');
const router = express.Router();
const Account = require('../models/account');
const User = require('../models/user');
const Feature = require('../models/feature');
const Stage = require('../models/stage');
const winston = require('winston');
const constants = require('../common/constants');

var accountFields = 'primary_manager secondary_manager features stages stages.stage stages.feature stages.last_updated_by comments.by'


// get a single account
router.get('/view/:name', (req, res, next) => {
  Account
  .findOne({"name": req.params.name})
  .populate(accountFields)
  .exec(function(err, account) {
    if(err){
        winston.log('info', err.message);
        req.flash('error', constants.genericError);
        return res.status(301).redirect('/accounts');
    } else{
        var features = [];
        for(i=0;i<account.features.length;i++){
          features.push(account.features[i].name)
        }
        return res.render('account', { account : account, features: features, req_user: req.user });
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
        req.flash('error', constants.genericError);
        return res.status(301).redirect('/accounts');
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
      req.flash('error', constants.genericError);
      return res.status(301).redirect('/accounts');
    } else{
      var filtered_stages = [];
      var feature = req.query.feature;
      if (feature){
        for(i=0; i<account.stages.length;i++){
          if(account.stages[i].feature && account.stages[i].feature._id==feature){
            filtered_stages.push(account.stages[i])
          }
        }
      }
      return res.render('manage-stage', { account : account, filtered_stages: filtered_stages, query_param: req.query, user: req.user});
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
      req.flash('error', constants.genericError);
      return res.status(301).redirect('/accounts');
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
  var feature = req.body.feature
  Account
  .findOneAndUpdate({"name": req.params.name}, { $push: {"stages": {"stage": stage, "feature": feature, "last_updated_by": req.user._id} } })
  .exec(function(err, account){
      if(err){
        winston.log('info', err.message);
        req.flash('error', constants.genericError);
        return res.status(301).redirect('/accounts');
      }
      else{
        Stage
        .findOne({"_id": stage}, '')
        .exec(function(err, stage_data){
          if(err){
            winston.log('info', err.message);
            req.flash('error', constants.genericError);
            return res.status(301).redirect('/accounts');
          } else{
              var stage_data = stage_data;
              Feature
              .findOne({"_id": feature}, '')
              .exec(function(err, feature_data){
                if(err){
                  winston.log('info', err.message);
                  req.flash('error', constants.genericError);
                  return res.status(301).redirect('/accounts');
                }
                else{
                  // event name: message
                  var comment = 'New Stage: stage "'+stage_data.name+'" added for "'+feature_data.name+'"';
                  Account
                  .findOneAndUpdate({"name": req.params.name}, { $push: {"comments": {"body": comment, "by": req.user._id} } })
                  .exec(function(err, account){
                    if(err){
                      winston.log('info', err.message);
                      req.flash('error', constants.genericError);
                      return res.status(301).redirect('/accounts');
                    }
                    else{
                      return res.status(301).redirect('/accounts/manage/'+req.params.name+'/stages/?feature='+feature)
                    }
                  });
                }
            });
          }
        });
      }
    });
});


// complete a stage for an account
router.get('/manage/:name/complete-stage', (req, res, next) => {
  var stage = req.query.stage;
  Account
  .findOne({ "name": req.params.name })
  .populate(accountFields)
  .exec(function(err, account) {
    if(err){
      winston.log('info', err.message);
      req.flash('error', constants.genericError);
      return res.status(301).redirect('/accounts');
    }
    else{
      for(i=0; i<account.stages.length; i++){
        if(account.stages[i]._id==stage){
          var stage_info = account.stages[i]
          account.stages[i].end_date = new Date();
          account.save();
          break;
        }
      }
      if(stage_info){
        // event name: message
        var comment = 'Stage Completed: stage "'+stage_info.stage.name+'" for "'+stage_info.feature.name+'" got completed';
        Account
        .findOneAndUpdate({"name": req.params.name}, { $push: {"comments": {"body": comment, "by": req.user._id} } })
        .exec(function(err, account){
          if(err){
            winston.log('info', err.message);
            req.flash('error', constants.genericError);
            return res.status(301).redirect('/accounts');
          }
          else{
            return res.status(301).redirect('/accounts/manage/'+req.params.name+'/stages/?feature='+stage_info.feature._id)
          }
        });
      }else{
        req.flash('error', constants.genericError);
        return res.status(301).redirect('/accounts');
      }
    }
  });
});


// filter data on accounts list
function filter_data(params){
  var filters = {"is_deleted": false};
  if('name' in params){
    filters['name'] = { $regex: params.name+'.*', $options: 'i' };
  };
  if ('contact' in params){
    if (params.contact != 'all'){
      filters['primary_manager'] = params.contact;
    };
  };
  return filters;
}


// get all accounts
router.get('/', (req, res, next) => {
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
              { req_user: req.user, accounts : accounts, users: users, query_param: req.query, message: req.flash('info'), error: req.flash('error') }
            );
          }
      });
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


// create new account
router.post('/', (req, res, next) => {
  Feature
  .find({"is_deleted": false})
  .exec(function(err, features){
    if(err){
        winston.log('info', err.message);
        req.flash('error', constants.genericError);
        return res.status(301).redirect('/accounts');
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
            req.flash('error', constants.genericError);
            return res.status(301).redirect('/accounts');
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
                  req.flash('error', constants.createFailed);
                  return res.status(301).redirect('/accounts');
                } else {
                  req.flash('info', constants.createSuccess);
                  return res.status(301).redirect('/accounts');
                }
              });
            }
            else{
              req.flash('error', constants.alreadyExists);
              return res.status(301).redirect('/accounts');
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
          req.flash('error', constants.genericError);
          return res.status(301).redirect('/accounts');
        }
        else{
          if(account){
            Account
            .findOne({"name": req.body.name}, '')
            .exec(function(err, duplicate){
              if(err){
                req.flash('error', constants.updateFailed);
                return res.status(301).redirect('/accounts');
              }
              else{
                if(!duplicate){
                  updateAccount(account, req, opted_features);
                  req.flash('info', constants.updateSuccess);
                  return res.status(301).redirect('/accounts');
                }
                else if(duplicate.name == req.params.name){
                  updateAccount(account, req, opted_features);
                  req.flash('info', constants.updateSuccess);
                  return res.status(301).redirect('/accounts');
                }
                else{
                  var error = 'Account already exists with name '+req.body.name;
                  req.flash('error', error)
                  return res.status(301).redirect('/accounts');
                }
              }
            });
          }
          else{
            winston.log('info', err.message);
            req.flash('error', genericError);
            return res.status(301).redirect('/accounts');
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
          req.flash('error', constants.genericError);
            return res.status(301).redirect('/accounts');
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
          req.flash('error', constants.genericError);
          return res.status(301).redirect('/accounts');
      }
      else{
          var account = account;
          User.find({"is_deleted": false}, 'username', function(err, users){
            if(err){
                req.flash('error', constants.genericError);
                return res.status(301).redirect('/accounts');
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
        req.flash('error', constants.deleteFailed);
        return res.status(301).redirect('/accounts')
      }
      else{
        account.is_deleted = true
        account.save();
        req.flash('info', constants.deleteSuccess);
        return res.status(301).redirect('/accounts')
      }
    });
});

module.exports = router;
