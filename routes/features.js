const express = require('express');
const router = express.Router();
const Feature = require('../models/feature');


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


// get all featues
router.get('/', (req, res, next) => {
  if (!req.user){
    res.redirect('/');
  }
  var message = req.query.message;
  Feature.find({"is_deleted": false}, '', function(err, features){
        if(err){
            return res.render('features', { error : err.message });
        } else{
            return res.render('features', { features : features, message: message});
        }
    });
});



// route to add new feature form
router.get('/add', (req, res, next) => {
  if (!req.user){
    res.redirect('/');
  }
  res.render('new-feature');
});


// create feature
router.post('/', (req, res, next) => {
  if (!req.user){
    res.redirect('/');
  }
  data = {
    'name': req.body.name,
    'color': req.body.color,
  };
  var feature = new Feature(data);
  feature.save(function (err) {
    if (err) {
      res.redirect('/features/?message=create failed');
    } else {
      res.redirect('/features/?message=successfully created');
    }
  });

})


// route to edit feature form
router.get('/edit/:name', (req, res, next) => {
  if (!req.user){
    res.redirect('/');
  }
  Feature.findOne({"name": req.params.name}, '', function(err, feature){
      if(err){
        return res.render('edit-feature', { error : err.message });
      }
      else{
        return res.render('edit-feature', { feature : feature });
      }
    });
});


// edit feature
router.post('/:name', (req, res, next) => {
  if (!req.user){
    res.redirect('/');
  }
  Feature.findOne({"name": req.params.name}, '', function(err, feature){
      if(err){
        res.redirect('/features/?message=update failed')
      }
      else{
        feature.name = req.body.name;
        feature.color = req.body.color;
        feature.save();
        res.redirect('/features/?message=successfully updated')
      }
    });
});


// delete feature
router.get('/remove/:name', (req, res, next) => {
  if (!req.user){
    res.redirect('/');
  }
  Feature.findOne({"name": req.params.name}, '', function(err, feature){
      if(err){
        res.redirect('/features/?message=delete failed')
      }
      else{
        feature.is_deleted = true
        feature.save();
        res.redirect('/features/?message=successfully deleted')
      }
    });
});


module.exports = router;
