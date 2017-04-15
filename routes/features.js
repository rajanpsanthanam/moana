const express = require('express');
const router = express.Router();
const Feature = require('../models/feature');
const constants = require('../common/constants');
const winston = require('winston');

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


// get all featues
router.get('/', (req, res, next) => {
  var message = req.query.message;
  var error = req.query.error;
  Feature.find({"is_deleted": false}, '', function(err, features){
        if(err){
            winston.log('info', err.message);
            return res.render('index', { error : err.message });
        } else{
            return res.render('features', { user: req.user, features : features, message: message, error: error});
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
        return res.status(301).redirect('/features/?error='+genericError);
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
              return res.status(301).redirect('/features/?error='+createFailed);
            } else {
              return res.status(301).redirect('/features/?message='+createSuccess);
            }
          });
        }
        else{
          let error = 'Feature name is mandatory';
          return res.status(301).redirect('/features/?error='+error);
        }
      }
      else{
        let error = 'Feature already exists';
        return res.status(301).redirect('/features/?error='+error);
      }
    }
  });
});


// route to edit feature form
router.get('/edit/:name', (req, res, next) => {
  Feature.findOne({"name": req.params.name}, '', function(err, feature){
      if(err){
        winston.log('info', err.message);
        return res.status(301).redirect('/features/?error='+genericError);
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
      return res.status(301).redirect('/features/?error='+genericError);
    }
    else{
      if(feature){
        Feature.findOne({"name": req.body.name}, '', function(err, duplicate){
          if(err){
            return res.status(301).redirect('/features/?error='+updateFailed)
          }
          else{
            if(!duplicate){
              feature.name = req.body.name;
              feature.bg_color = req.body.bgColor,
              feature.font_color = req.body.fontColor
              feature.save();
              return res.status(301).redirect('/features/?message='+updateSuccess);
            }
            else if(duplicate.name == req.params.name){
              feature.bg_color = req.body.bgColor,
              feature.font_color = req.body.fontColor
              feature.save();
              return res.status(301).redirect('/features/?message='+updateSuccess);
            }
            else{
              let error = 'Feature already exists with name '+req.body.name;
              return res.status(301).redirect('/features/?error='+error);
            }
          }
        });
      }
      else{
        winston.log('info', err.message);
        return res.status(301).redirect('/features/?error='+genericError);
      }
    }
  });
});


// delete feature
router.get('/remove/:name', (req, res, next) => {
  Feature.findOne({"name": req.params.name}, '', function(err, feature){
      if(err){
        return res.status(301).redirect('/features/?error='+deleteFailed)
      }
      else{
        feature.is_deleted = true
        feature.save();
        return res.status(301).redirect('/features/?message='+deleteSuccess)
      }
    });
});


module.exports = router;
