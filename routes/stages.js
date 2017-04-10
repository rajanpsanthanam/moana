const express = require('express');
const router = express.Router();
const Stage = require('../models/stage');


// auth middleware
router.use(function (req, res, next) {
  if (!req.user){
      res.redirect('/');
  }
  next();
});


// admin auth middleware
router.use(function (req, res, next) {
  if(!req.user.is_admin){
    res.redirect('/');
  }
  next();
});


// get all stages
router.get('/', (req, res, next) => {
  if (!req.user){
    res.redirect('/');
  }
  var message = req.query.message;
  Stage.find({"is_deleted": false}, '', function(err, stages){
        if(err){
            return res.render('stages', { error : err.message });
        } else{
            return res.render('stages', { stages : stages, message: message});
        }
    });
});


// route to add new stage form
router.get('/add', (req, res, next) => {
  if (!req.user){
    res.redirect('/');
  }
  res.render('new-stage');
});


// create stage
router.post('/', (req, res, next) => {
  if (!req.user){
    res.redirect('/');
  }
  data = {
    'name': req.body.name,
    'order': req.body.order,
    'color': req.body.color
  };
  var stage = new Stage(data);
  stage.save(function (err) {
    if (err) {
      res.redirect('/stages/?message=create failed');
    } else {
      res.redirect('/stages/?message=successfully created');
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
        return res.render('edit-stage', { error : err.message });
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
