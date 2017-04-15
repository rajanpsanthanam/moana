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
    name: { type: String, required: true, unique: true },
    primary_manager:{ type: Schema.Types.ObjectId, ref: 'user' },
    secondary_manager:{ type: Schema.Types.ObjectId, ref: 'user' },
    signup_date: Date,
    process_start_date: Date,
    expected_completion_date: Date,
    actual_completion_date: Date,
    comments: [Comments],
    stages: [Stages],
    features: [{ type: Schema.Types.ObjectId, ref: 'feature' }],
    is_deleted: { type: Boolean, default: false }
});

module.exports = mongoose.model('account', Account);
