const express = require('express');
const router = express.Router();
const Label = require('../models').label;
const constants = require('../constants');
const winston = require('winston');

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


// get all labels
router.get('/', (req, res, next) => {
  Label
  .find({"is_deleted": false}, '')
  .exec(function(err, labels){
    if(err){
        winston.log('info', err.message);
        return res.render('index', { error : err.message });
    } else{
        return res.render('labels', { user: req.user, labels : labels, message: req.flash('info'), error: req.flash('error')});
    }
  });
});



// route to add new label form
router.get('/add', (req, res, next) => {
  return res.render('new-label');
});


// create label
router.post('/', (req, res, next) => {
  Label
  .findOne({"name": req.body.name})
  .exec(function(err, label){
    if(err){
        winston.log('info', err.message);
        req.flash('error', constants.genericError);
        return res.status(301).redirect('/labels');
    }
    else{
      if(!label){
        if(req.body.name){
          data = {
            'name': req.body.name,
            'bg_color': '#'+req.body.bgColor,
            'font_color': '#'+req.body.fontColor
          };
          var label = new Label(data);
          label.save(function (err) {
            if (err) {
              winston.log('info', err.message);
              req.flash('error', constants.createFailed);
              return res.status(301).redirect('/labels');
            } else {
              req.flash('info', constants.createSuccess);
              return res.status(301).redirect('/labels');
            }
          });
        }
        else{
          req.flash('error', constants.nameMandatory);
          return res.status(301).redirect('/labels');
        }
      }
      else{
        req.flash('error', constants.alreadyExists);
        return res.status(301).redirect('/labels');
      }
    }
  });
});


// route to edit label form
router.get('/edit/:name', (req, res, next) => {
  Label
  .findOne({"name": req.params.name}, '')
  .exec(function(err, label){
    if(err){
      winston.log('info', err.message);
      req.flash('error', constants.genericError);
      return res.status(301).redirect('/labels');
    }
    else{
      return res.render('edit-label', { label : label });
    }
  });
});


// edit label
router.post('/:name', (req, res, next) => {
  Label
  .findOne({"name": req.params.name})
  .exec(function(err, label){
    if(err){
      winston.log('info', err.message);
      req.flash('error', constants.genericError);
      return res.status(301).redirect('/labels');
    }
    else{
      if(label){
        Label.findOne({"name": req.body.name}, '', function(err, duplicate){
          if(err){
            req.flash('error', constants.updateFailed);
            return res.status(301).redirect('/labels')
          }
          else{
            if(!duplicate){
              label.name = req.body.name;
              label.bg_color = '#'+req.body.bgColor,
              label.font_color = '#'+req.body.fontColor
              label.save();
              req.flash('info', constants.updateSuccess);
              return res.status(301).redirect('/labels');
            }
            else if(duplicate.name == req.params.name){
              label.bg_color = '#'+req.body.bgColor,
              label.font_color = '#'+req.body.fontColor
              label.save();
              req.flash('info', constants.updateSuccess);
              return res.status(301).redirect('/labels');
            }
            else{
              let error = 'Label already exists with name '+req.body.name;
              req.flash('error', error);
              return res.status(301).redirect('/labels');
            }
          }
        });
      }
      else{
        winston.log('info', err.message);
        req.flash('error', constants.genericError);
        return res.status(301).redirect('/labels');
      }
    }
  });
});


// delete label
router.get('/remove/:name', (req, res, next) => {
  Label
  .findOne({"name": req.params.name}, '')
  .exec(function(err, label){
    if(err){
      req.flash('error', constants.deleteFailed);
      return res.status(301).redirect('/labels');
    }
    else{
      label.is_deleted = true
      label.save();
      req.flash('info', constants.deleteSuccess);
      return res.status(301).redirect('/labels');
    }
  });
});


module.exports = router;
