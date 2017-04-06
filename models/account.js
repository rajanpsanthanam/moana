const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Comments = new Schema({
      body: String,
      date: { type: Date, default: Date.now },
      by: String
  });

const Account = new Schema({
    name: String,
    agreed_date: Date,
    onboarding_start_date: Date,
    expected_go_live_date: Date,
    actual_live_date: Date,
    stage: String,
    primary_manager:String,
    secondary_manager:String,
    is_on_android:Boolean,
    is_on_ios:Boolean,
    is_on_web:Boolean,
    is_on_loyalty:Boolean,
    no_of_stores:Number,
    comments: [Comments]
});

module.exports = mongoose.model('account', Account);
