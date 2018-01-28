const express = require('express');
const router = express.Router();
const Task = require('../models/task');
const User = require('../models/user');
const Label = require('../models/label');
const Stage = require('../models/stage');
const winston = require('winston');
const constants = require('../common/constants');

var taskFields = 'assignee owner current_stage labels comments.by'


// get a single task
router.get('/view/:slug', (req, res, next) => {
  Task
  .findOne({"slug": req.params.slug})
  .populate(taskFields)
  .exec(function(err, task) {
    if(err){
        winston.log('info', err.message);
        req.flash('error', constants.genericError);
        return res.status(301).redirect('/tasks');
    } else{
        return res.render('task', { task : task, user: req.user });
    }
  });
});


// add comment to task
router.post('/manage/:slug/add-comment', (req, res, next) => {
  var comment = req.body.comment
  Task
  .findOneAndUpdate({"slug": req.params.slug}, { $push: {"comments": {"body": comment, "by": req.user._id} } })
  .exec(function(err, task){
      if(err){
        winston.log('info', err.message);
        req.flash('error', constants.genericError);
        return res.status(301).redirect('/tasks');
      }
      else{
        return res.status(301).redirect('/tasks/view/'+req.params.slug+'/')
      }
    });
});


// admin auth middleware
router.use(function (req, res, next) {
  if(!req.user){
    return res.status(301).redirect('/');
  }
  else if(!req.user.is_admin){
    return res.status(301).redirect('/');
  }
  next();
});


// filter data on tasks list
function filter_data(params){
  var filters = {"is_deleted": false};
  if('title' in params){
    filters['title'] = { $regex: params.title+'.*', $options: 'i' };
  };
  if ('assignee' in params){
    if (params.assignee != 'all'){
      filters['assignee'] = params.assignee;
    };
  };
  if ('owner' in params){
    if (params.owner != 'all'){
      filters['owner'] = params.owner;
    };
  };
  return filters;
}


// get all tasks
router.get('/', (req, res, next) => {
  var filters = filter_data(req.query);
  Task
  .find(filters)
  .populate(taskFields)
  .exec(function(err, tasks){
    if(err){
      winston.log('info', err.message);
      return res.render('index', { error : err.message });
    }
    else{
      var tasks = tasks;
      User
      .find({"is_deleted": false}, 'username')
      .exec(function(err, users){
          if(err){
            winston.log('info', err.message);
            return res.render('index', { error : err.message });
          }
          else{
            return res.render(
              'tasks',
              { user: req.user, tasks : tasks, users: users, filters: filters, message: req.flash('info'), error: req.flash('error') }
            );
          }
      });
    }
  });
});


// create new task
router.post('/', (req, res, next) => {
  Label
  .find({"is_deleted": false})
  .exec(function(err, labels){
    if(err){
        winston.log('info', err.message);
        req.flash('error', constants.genericError);
        return res.status(301).redirect('/tasks');
    }
    else{
      var opted_labels = []
      for(i=0; i<labels.length; i++) {
        if(labels[i].name in req.body){
          opted_labels.push(labels[i]._id)
        }
      }
      Task
      .findOne({"slug": req.body.slug})
      .exec(function(err, task) {
        if(err){
            winston.log('info', err.message);
            req.flash('error', constants.genericError);
            return res.status(301).redirect('/tasks');
        } else{
            if(!task){
              data = {
                'title': req.body.title,
                'slug': req.body.title,
                'description': req.body.title,
                'assignee': req.body.assignee,
                'owner': req.user,
                'created': new Date()
              }
              if(opted_labels){
                data['labels'] = opted_labels;
              }
              var task = new Task(data);
              task.save(function (err) {
                if (err) {
                  console.log(err);
                  req.flash('error', constants.createFailed);
                  return res.status(301).redirect('/tasks');
                } else {
                  req.flash('info', constants.createSuccess);
                  return res.status(301).redirect('/tasks');
                }
              });
            }
            else{
              req.flash('error', constants.alreadyExists);
              return res.status(301).redirect('/tasks');
            }
          }
      });
    }
  });
});


function updateTask(task, req, opted_labels){
  task.title = req.body.title;
  task.assignee = req.body.assignee;
  if(opted_labels){
    task.labels = opted_labels;
  }
  task.save();
  return true;
}


// update task data
router.post('/:slug', (req, res, next) => {
  Label
  .find({"is_deleted": false}, '')
  .exec(function(err, labels){
    if(err){
        return res.status(301).redirect('/tasks/?error=update failed');
    }
    else{
      var opted_labels = []
      for(i=0; i<labels.length; i++) {
        if(labels[i].name in req.body){
          opted_labels.push(labels[i]._id)
        }
      }
      Task
      .findOne({"slug": req.params.slug})
      .exec(function(err, task) {
        if(err){
          winston.log('info', err.message);
          req.flash('error', constants.genericError);
          return res.status(301).redirect('/tasks');
        }
        else{
          if(task){
            Task
            .findOne({"slug": req.body.slug}, '')
            .exec(function(err, duplicate){
              if(err){
                req.flash('error', constants.updateFailed);
                return res.status(301).redirect('/tasks');
              }
              else{
                if(!duplicate){
                  updateTask(task, req, opted_labels);
                  req.flash('info', constants.updateSuccess);
                  return res.status(301).redirect('/tasks');
                }
                else if(duplicate.slug == req.params.slug){
                  updateTask(task, req, opted_labels);
                  req.flash('info', constants.updateSuccess);
                  return res.status(301).redirect('/tasks');
                }
                else{
                  var error = 'Task already exists with title '+req.body.title;
                  req.flash('error', error)
                  return res.status(301).redirect('/tasks');
                }
              }
            });
          }
          else{
            winston.log('info', err.message);
            req.flash('error', genericError);
            return res.status(301).redirect('/tasks');
          }
        }
      });
    }
  });
});


// route to add new task form
router.get('/add', (req, res, next) => {
  User
  .find({"is_deleted": false}, 'username')
  .exec(function(err, users){
        if(err){
          req.flash('error', constants.genericError);
            return res.status(301).redirect('/tasks');
        } else{
            var users = users;
            Label.find({"is_deleted": false}, '_id, name', function(err, labels){
                  if(err){
                      return res.render('new-task', { error : err.message });
                  } else{
                      return res.render('new-task', { users : users, labels: labels});
                  }
              });
        }
    });
});


// route to edit task form
router.get('/edit/:slug', (req, res, next) => {
  Task
  .findOne({"slug": req.params.slug})
  .populate(taskFields)
  .exec( function(err, task){
      if(err){
          req.flash('error', constants.genericError);
          return res.status(301).redirect('/tasks');
      }
      else{
          var task = task;
          User.find({"is_deleted": false}, 'username', function(err, users){
            if(err){
                req.flash('error', constants.genericError);
                return res.status(301).redirect('/tasks');
            }
            else{
              var users = users;
              var opted_labels = [];
              for(i=0; i<task.labels.length; i++){
                opted_labels.push(task.labels[i]._id.toString());
              }
              Label.find({"is_deleted": false}, '_id, name', function(err, labels){
                if(err){
                  return res.render('edit-task', { error : err.message });
                }
                else{
                  for(i=0; i<labels.length; i++){
                    labels[i]._id = labels[i]._id.toString();
                  }
                  return res.render(
                    'edit-task', {
                      task: task, users : users, labels: labels, opted_labels: opted_labels
                    }
                  );
                }
            });
          }
        });
      }
  });
});


// soft delete task
router.get('/remove/:slug', (req, res, next) => {
  Task
  .findOne({"slug": req.params.slug}, '')
  .exec(function(err, task){
      if(err){
        req.flash('error', constants.deleteFailed);
        return res.status(301).redirect('/tasks')
      }
      else{
        task.is_deleted = true
        task.save();
        req.flash('info', constants.deleteSuccess);
        return res.status(301).redirect('/tasks')
      }
    });
});

module.exports = router;
