const express = require('express');
const router = express.Router();
const Stage = require('../models').stage;
const winston = require('winston');
const constants = require('../constants');

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


// get all stages
router.get('/', (req, res, next) => {
  Stage
  .find({"is_deleted": false}, '')
  .sort('order')
  .exec(function(err, stages){
    if(err){
      winston.log('info', err.message);
      return res.render('index', { error : err.message });
    } else{
      return res.render('stages', { user: req.user, stages : stages, message: req.flash('info'), error: req.flash('error')});
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
        req.flash('error', constants.genericError);
        return res.status(301).redirect('/stages');
    }
    else{
      if(!stage){
        if(req.body.name){
          data = {
            'name': req.body.name,
            'order': req.body.order,
            'bg_color': '#'+req.body.bgColor,
            'font_color': '#'+req.body.fontColor
          };
          var stage = new Stage(data);
          stage.save(function (err) {
            if (err) {
              winston.log('info', err.message);
              req.flash('error', constants.createFailed);
              return res.status(301).redirect('/stages');
            } else {
              req.flash('info', constants.createSuccess);
              return res.status(301).redirect('/stages');
            }
          });
        }
        else{
          req.flash('error', constants.nameMandatory);
          return res.status(301).redirect('/stages');
        }
      }
      else{
        req.flash('error', constants.alreadyExists);
        return res.status(301).redirect('/stages');
      }
    }
  });
});


// route to edit stage form
router.get('/edit/:name', (req, res, next) => {
  Stage
  .findOne({"name": req.params.name}, '')
  .exec(function(err, stage){
    if(err){
      winston.log('info', err.message);
      req.flash('error', constants.genericError);
      return res.status(301).redirect('/stages');
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
        req.flash('error', constants.genericError);
        return res.status(301).redirect('/stages');
    }
    else{
      if(stage){
        Stage.findOne({"name": req.body.name}, '', function(err, duplicate){
          if(err){
            winston.log('info', err.message);
            req.flash('error', constants.updateFailed);
            return res.status(301).redirect('/stages');
          }
          else{
            if(!duplicate){
              stage.name = req.body.name;
              stage.bg_color = '#'+req.body.bgColor;
              stage.font_color = '#'+req.body.fontColor;
              stage.order = req.body.order;
              stage.save();
              req.flash('info', constants.updateSuccess);
              return res.status(301).redirect('/stages');
            }
            else if(duplicate.name == req.params.name){
              stage.bg_color = '#'+req.body.bgColor;
              stage.font_color = '#'+req.body.fontColor;
              stage.order = req.body.order;
              stage.save();
              req.flash('info', constants.updateSuccess);
              return res.status(301).redirect('/stages');
            }
            else{
              req.flash('error', 'Stage already exists with name '+req.body.name);
              return res.status(301).redirect('/stages');
            }
          }
        });
      }
      else{
        winston.log('info', err.message);
        req.flash('error', constants.genericError);
        return res.status(301).redirect('/stages');
      }
    }
  });
});


// delete stage
router.get('/remove/:name', (req, res, next) => {
  Stage
  .findOne({"name": req.params.name}, '')
  .exec(function(err, stage){
    if(err){
      winston.log('info', err.message);
      req.flash('error', constants.deleteFailed);
      return res.status(301).redirect('/stages');
    }
    else{
      stage.is_deleted = true
      stage.save();
      req.flash('info', constants.deleteSuccess);
      return res.status(301).redirect('/stages');
    }
  });
});


module.exports = router;
