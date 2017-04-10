const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Comments = new Schema({
  body: String,
  date: { type: Date, default: Date.now },
  by: { type: Schema.Types.ObjectId, ref: 'user' }
});


const Stages = new Schema({
  stage: { type: Schema.Types.ObjectId, ref: 'stage' },
  start_date: { type: Date, default: Date.now },
  end_date: Date,
  last_updated_by: { type: Schema.Types.ObjectId, ref: 'user' }
});


const Account = new Schema({
    name: String,
    agreed_date: Date,
    onboarding_start_date: Date,
    expected_go_live_date: Date,
    actual_live_date: Date,
    primary_manager:{ type: Schema.Types.ObjectId, ref: 'user' },
    secondary_manager:{ type: Schema.Types.ObjectId, ref: 'user' },
    no_of_stores:{ type: Number, default: 0 },
    comments: [Comments],
    stages: [Stages],
    features: [{ type: Schema.Types.ObjectId, ref: 'feature' }],
    is_deleted: { type: Boolean, default: false }
});

module.exports = mongoose.model('account', Account);
