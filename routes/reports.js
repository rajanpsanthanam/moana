const express = require('express');
const router = express.Router();
const Account = require('../models/account');
const User = require('../models/user');
const Feature = require('../models/feature');
const Stage = require('../models/stage');
const winston = require('winston');
const constants = require('../common/constants');

var accountFields = 'primary_manager secondary_manager features stages.feature stages.stage stages.last_updated_by comments.by'


// middleware for auth check
router.use(function (req, res, next) {
  if(!req.user){
    return res.status(301).redirect('/');
  }
  next();
});


// return account per feature analytics data
router.get('/accounts/feature', (req, res, next) => {
  Account
  .find({"is_deleted": false})
  .populate(accountFields)
  .exec(function(err, accounts) {
    if(err){
        winston.log('info', err.message);
        req.flash('error', constants.genericError)
        return res.status(301).redirect('/accounts');
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


// return accounts per user analytics data
router.get('/accounts/user', (req, res, next) => {
  Account
  .find({"is_deleted": false})
  .populate(accountFields)
  .exec(function(err, accounts) {
    if(err){
        winston.log('info', err.message);
        req.flash('error', constants.genericError);
        return res.status(301).redirect('/accounts');
    }
    else{
      var users = {};
      var labels = [];
      var data_points = [];
      var background_color = [];
      var border_color = [];
      for(var i in accounts){
        var account = accounts[i];
        if(!users.hasOwnProperty(account.primary_manager.username)){
          users[account.primary_manager.username]={
            'count': 1
          };
        }
        else{
          users[account.primary_manager.username]['count']+=1;
        }
      }
      for(var user in users){
        labels.push(user);
        data_points.push(users[user]['count']);
      }
      res_data = {
        'labels': labels,
        'data': data_points
      }
      return res.send(JSON.stringify(res_data));
    }
  });
});

// return days per stage analytics data
router.get('/account/:name/feature/:feature/stage-data', (req, res, next) => {
  var labels = [];
  var data_points = [];
  var background_color = [];
  var border_color = [];
  var millisecondsPerDay = 1000 * 60 * 60 * 24;
  res_data = {
    'labels': labels,
    'data': data_points,
    'background_color': background_color,
    'border_color': border_color
  }
  Account
  .findOne({"name": req.params.name})
  .populate(accountFields)
  .exec(function(err, account) {
    if(err){
        winston.log('info', err.message);
        return res.send(JSON.stringify(res_data));
    }
    else{
      var account = account;
      Feature
      .findOne({"name": req.params.feature})
      .exec(function(err, feature) {
        if(err){
            winston.log('info', err.message);
            return res.send(JSON.stringify(res_data));
        }
        else{
          for(i=0; i<account.stages.length; i++){
            if(account.stages[i].feature && (account.stages[i].feature.name == feature.name)){
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
    }
  });
});



/* deprecated

// return accounts per stage analytics data
router.get('/accounts/stage', (req, res, next) => {
  Account
  .find({"is_deleted": false})
  .populate(accountFields)
  .exec(function(err, accounts) {
    if(err){
        winston.log('info', err.message);
        req.flash('error', constants.genericError);
        return res.status(301).redirect('/accounts');
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


// return account per state analytics data
router.get('/accounts/state', (req, res, next) => {
  Account
  .find({"is_deleted": false})
  .populate(accountFields)
  .exec(function(err, accounts) {
    if(err){
        winston.log('info', err.message);
        req.flash('error', constants.genericError);
        return res.status(301).redirect('/accounts');
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

*/

module.exports = router;
