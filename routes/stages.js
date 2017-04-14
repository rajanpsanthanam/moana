const express = require('express');
const router = express.Router();
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


// auth middleware
router.use(function (req, res, next) {
  if (!req.user){
    return res.status(301).redirect('/');
  }
  next();
});


// admin auth middleware
router.use(function (req, res, next) {
  if(!req.user.is_admin){
    return res.status(301).redirect('/');
  }
  next();
});


// get all stages
router.get('/', (req, res, next) => {
  var message = req.query.message;
  var error = req.query.error;
  Stage.find({"is_deleted": false}, '', function(err, stages){
        if(err){
          winston.log('info', err.message);
          return res.render('index', { error : err.message });
        } else{
          return res.render('stages', { stages : stages, message: message, error: error});
        }
    });
});


// route to add new stage form
router.get('/add', (req, res, next) => {
  return res.render('new-stage');
});


// create stage
router.post('/', (req, res, next) => {
  Stage
  .findOne({"name": req.body.name})
  .exec(function(err, stage){
    if(err){
        winston.log('info', err.message);
        return res.status(301).redirect('/stages/?error='+genericError);
    }
    else{
      if(!stage){
        data = {
          'name': req.body.name,
          'order': req.body.order,
          'color': req.body.color
        };
        var stage = new Stage(data);
        stage.save(function (err) {
          if (err) {
            winston.log('info', err.message);
            return res.status(301).redirect('/stages/?error='+createFailed);
          } else {
            return res.status(301).redirect('/stages/?message='+createSuccess);
          }
        });
      }
      else{
        let error = 'Stage already exists';
        return res.status(301).redirect('/stages/?error='+error);
      }
    }
  });
});


// route to edit stage form
router.get('/edit/:name', (req, res, next) => {
  Stage.findOne({"name": req.params.name}, '', function(err, stage){
      if(err){
        winston.log('info', err.message);
        return res.status(301).redirect('/stages/?error='+genericError);
      }
      else{
        return res.render('edit-stage', { stage : stage });
      }
    });
});


// edit stage
router.post('/:name', (req, res, next) => {
  Stage
  .findOne({"name": req.params.name})
  .exec(function(err, stage){
    if(err){
        winston.log('info', err.message);
        return res.status(301).redirect('/stages/?error='+genericError);
    }
    else{
      if(stage){
        Stage.findOne({"name": req.body.name}, '', function(err, duplicate){
          if(err){
            winston.log('info', err.message);
            return res.status(301).redirect('/stages/?error='+updateFailed)
          }
          else{
            if(!duplicate){
              stage.name = req.body.name;
              stage.color = req.body.color;
              stage.order = req.body.order;
              stage.save();
              return res.status(301).redirect('/stages/?message='+updateSuccess)
            }
            else if(duplicate.name == req.params.name){
              stage.color = req.body.color;
              stage.order = req.body.order;
              stage.save();
              return res.status(301).redirect('/stages/?message='+updateSuccess);
            }
            else{
              let error = 'Stage already exists with name '+req.body.name;
              return res.status(301).redirect('/stages/?error='+error);
            }
          }
        });
      }
      else{
        winston.log('info', err.message);
        return res.status(301).redirect('/stages/?error='+genericError);
      }
    }
  });
});


// delete stage
router.get('/remove/:name', (req, res, next) => {
  Stage.findOne({"name": req.params.name}, '', function(err, stage){
      if(err){
        winston.log('info', err.message);
        return res.status(301).redirect('/error/?message='+deleteFailed)
      }
      else{
        stage.is_deleted = true
        stage.save();
        return res.status(301).redirect('/stages/?message='+deleteSuccess)
      }
    });
});


module.exports = router;
