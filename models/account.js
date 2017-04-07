const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Comments = new Schema({
      body: String,
      date: { type: Date, default: Date.now },
      by: String
  });


const Stage = new Schema({
  stage: String,
  date: { type: Date, default: Date.now },
  by: String
})

const Account = new Schema({
    name: String,
    agreed_date: Date,
    onboarding_start_date: Date,
    expected_go_live_date: Date,
    actual_live_date: Date,
    stage: [Stage],
    primary_manager:String,
    secondary_manager:String,
    is_on_android:{ type: Boolean, default: false },
    is_on_ios:{ type: Boolean, default: false },
    is_on_web:{ type: Boolean, default: false },
    is_on_loyalty:{ type: Boolean, default: false },
    no_of_stores:{ type: Number, default: 0 },
    comments: [Comments],
    is_deleted: { type: Boolean, default: false }
});

module.exports = mongoose.model('account', Account);
