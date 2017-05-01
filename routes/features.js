const express = require('express');
const router = express.Router();
const Feature = require('../models/feature');
const constants = require('../common/constants');
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


// get all featues
router.get('/', (req, res, next) => {
  Feature
  .find({"is_deleted": false}, '')
  .exec(function(err, features){
    if(err){
        winston.log('info', err.message);
        return res.render('index', { error : err.message });
    } else{
        return res.render('features', { user: req.user, features : features, message: req.flash('info'), error: req.flash('error')});
    }
  });
});



// route to add new feature form
router.get('/add', (req, res, next) => {
  return res.render('new-feature');
});


// create feature
router.post('/', (req, res, next) => {
  Feature
  .findOne({"name": req.body.name})
  .exec(function(err, feature){
    if(err){
        winston.log('info', err.message);
        req.flash('error', constants.genericError);
        return res.status(301).redirect('/features');
    }
    else{
      if(!feature){
        if(req.body.name){
          data = {
            'name': req.body.name,
            'bg_color': req.body.bgColor,
            'font_color': req.body.fontColor
          };
          var feature = new Feature(data);
          feature.save(function (err) {
            if (err) {
              winston.log('info', err.message);
              req.flash('error', constants.createFailed);
              return res.status(301).redirect('/features');
            } else {
              req.flash('info', constants.createSuccess);
              return res.status(301).redirect('/features');
            }
          });
        }
        else{
          req.flash('error', constants.nameMandatory);
          return res.status(301).redirect('/features');
        }
      }
      else{
        req.flash('error', constants.alreadyExists);
        return res.status(301).redirect('/features');
      }
    }
  });
});


// route to edit feature form
router.get('/edit/:name', (req, res, next) => {
  Feature
  .findOne({"name": req.params.name}, '')
  .exec(function(err, feature){
    if(err){
      winston.log('info', err.message);
      req.flash('error', constants.genericError);
      return res.status(301).redirect('/features');
    }
    else{
      return res.render('edit-feature', { feature : feature });
    }
  });
});


// edit feature
router.post('/:name', (req, res, next) => {
  Feature
  .findOne({"name": req.params.name})
  .exec(function(err, feature){
    if(err){
      winston.log('info', err.message);
      req.flash('error', constants.genericError);
      return res.status(301).redirect('/features');
    }
    else{
      if(feature){
        Feature.findOne({"name": req.body.name}, '', function(err, duplicate){
          if(err){
            req.flash('error', constants.updateFailed);
            return res.status(301).redirect('/features')
          }
          else{
            if(!duplicate){
              feature.name = req.body.name;
              feature.bg_color = req.body.bgColor,
              feature.font_color = req.body.fontColor
              feature.save();
              req.flash('info', constants.updateSuccess);
              return res.status(301).redirect('/features');
            }
            else if(duplicate.name == req.params.name){
              feature.bg_color = req.body.bgColor,
              feature.font_color = req.body.fontColor
              feature.save();
              req.flash('info', constants.updateSuccess);
              return res.status(301).redirect('/features');
            }
            else{
              let error = 'Feature already exists with name '+req.body.name;
              req.flash('error', error);
              return res.status(301).redirect('/features');
            }
          }
        });
      }
      else{
        winston.log('info', err.message);
        req.flash('error', constants.genericError);
        return res.status(301).redirect('/features');
      }
    }
  });
});


// delete feature
router.get('/remove/:name', (req, res, next) => {
  Feature
  .findOne({"name": req.params.name}, '')
  .exec(function(err, feature){
    if(err){
      req.flash('error', constants.deleteFailed);
      return res.status(301).redirect('/features');
    }
    else{
      feature.is_deleted = true
      feature.save();
      req.flash('info', constants.deleteSuccess);
      return res.status(301).redirect('/features');
    }
  });
});


module.exports = router;
