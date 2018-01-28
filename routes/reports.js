const express = require('express');
const router = express.Router();
const Task = require('../models/task');
const User = require('../models/user');
const Label = require('../models/label');
const Stage = require('../models/stage');
const winston = require('winston');
const constants = require('../common/constants');

var taskFields = 'assignee owner current_stage labels comments.by'


// middleware for auth check
router.use(function (req, res, next) {
  if(!req.user){
    return res.status(301).redirect('/');
  }
  else if(!req.user.is_admin){
    return res.status(301).redirect('/');
  }
  next();
});

// return tasks per label analytics data
router.get('/tasks/label', (req, res, next) => {
  Task
  .find({"is_deleted": false})
  .populate(taskFields)
  .exec(function(err, tasks) {
    if(err){
        winston.log('info', err.message);
        req.flash('error', constants.genericError)
        return res.status(301).redirect('/tasks');
    }
    else{
      var labels = {};
      var labels = [];
      var data_points = [];
      var background_color = [];
      var border_color = [];
      for(var i in tasks){
        var task = tasks[i];
        if(task.labels){
          for(j=0; j<task.labels.length; j++){
            if(!labels.hasOwnProperty(task.labels[j].name)){
              labels[task.labels[j].name] = {
                'count': 1,
                'bg_color': task.labels[j].bg_color,
                'font_color': task.labels[j].font_color
              }
            }
            else{
              labels[task.labels[j].name]['count'] += 1;
            }
          }
        }
      }
      for(var label in labels){
        labels.push(label);
        data_points.push(labels[label]['count']);
        background_color.push(labels[label]['bg_color']);
        border_color.push(labels[label]['font_color']);
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


// return tasks per assignee analytics data
router.get('/tasks/assignee', (req, res, next) => {
  Task
  .find({"is_deleted": false})
  .populate(taskFields)
  .exec(function(err, tasks) {
    if(err){
        winston.log('info', err.message);
        req.flash('error', constants.genericError);
        return res.status(301).redirect('/tasks');
    }
    else{
      var users = {};
      var labels = [];
      var data_points = [];
      var background_color = [];
      var border_color = [];
      for(var i in tasks){
        var task = tasks[i];
        if(!users.hasOwnProperty(task.assignee.username)){
          users[task.assignee.username]={
            'count': 1
          };
        }
        else{
          users[task.assignee.username]['count']+=1;
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



module.exports = router;
