const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Comments = new Schema({
  body: String,
  date: { type: Date, default: Date.now },
  by: String
});

const Stages = new Schema({
  stage: String,
  date: { type: Date, default: Date.now },
  by: String
});

const Features = new Schema({
  feature: String,
  date: { type: Date, default: Date.now },
  by: String
})

const Account = new Schema({
    name: String,
    agreed_date: Date,
    onboarding_start_date: Date,
    expected_go_live_date: Date,
    actual_live_date: Date,
    stage: [Stages],
    primary_manager:String,
    secondary_manager:String,
    no_of_stores:{ type: Number, default: 0 },
    comments: [Comments],
    features: [Features],
    is_deleted: { type: Boolean, default: false }
});

module.exports = mongoose.model('account', Account);
