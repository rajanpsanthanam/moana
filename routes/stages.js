const express = require('express');
const router = express.Router();
const Stage = require('../models/stage');
const winston = require('winston');


// auth middleware
router.use(function (req, res, next) {
  if (!req.user){
      res.status(301).redirect('/');
  }
  next();
});


// admin auth middleware
router.use(function (req, res, next) {
  if(!req.user.is_admin){
    res.status(301).redirect('/');
  }
  next();
});


// get all stages
router.get('/', (req, res, next) => {
  if (!req.user){
    res.status(301).redirect('/');
  }
  var message = req.query.message;
  Stage.find({"is_deleted": false}, '', function(err, stages){
        if(err){
          winston.log('info', err.message);
          res.render('index', { error : err.message });
        } else{
          return res.render('stages', { stages : stages, message: message});
        }
    });
});


// route to add new stage form
router.get('/add', (req, res, next) => {
  if (!req.user){
    res.status(301).redirect('/');
  }
  res.render('new-stage');
});


// create stage
router.post('/', (req, res, next) => {
  if (!req.user){
    res.status(301).redirect('/');
  }
  data = {
    'name': req.body.name,
    'order': req.body.order,
    'color': req.body.color
  };
  var stage = new Stage(data);
  stage.save(function (err) {
    if (err) {
      winston.log('info', err.message);
      res.status(301).redirect('/stages/?message=create failed');
    } else {
      res.status(301).redirect('/stages/?message=successfully created');
    }
  });

})


// route to edit stage form
router.get('/edit/:name', (req, res, next) => {
  if (!req.user){
    res.redirect('/');
  }
  Stage.findOne({"name": req.params.name}, '', function(err, stage){
      if(err){
        winston.log('info', err.message);
        res.status(301).redirect('/stages/?message=something went wrong');
      }
      else{
        return res.render('edit-stage', { stage : stage });
      }
    });
});


// edit stage
router.post('/:name', (req, res, next) => {
  if (!req.user){
    res.redirect('/');
  }
  Stage.findOne({"name": req.params.name}, '', function(err, stage){
      if(err){
        winston.log('info', err.message);
        res.redirect('/stages/?message=update failed')
      }
      else{
        stage.name = req.body.name;
        stage.color = req.body.color;
        stage.order = req.body.order;
        stage.save();
        res.redirect('/stages/?message=successfully updated')
      }
    });
});


// delete stage
router.get('/remove/:name', (req, res, next) => {
  if (!req.user){
    res.redirect('/');
  }
  Stage.findOne({"name": req.params.name}, '', function(err, stage){
      if(err){
        winston.log('info', err.message);
        res.redirect('/stages/?message=delete failed')
      }
      else{
        stage.is_deleted = true
        stage.save();
        res.redirect('/stages/?message=successfully deleted')
      }
    });
});


module.exports = router;
