const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Comments = new Schema({
  body: String,
  date: { type: Date, default: Date.now },
  by: { type: Schema.Types.ObjectId, ref: 'user' }
});


const Task = new Schema({
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    assignee:{ type: Schema.Types.ObjectId, ref: 'user' },
    owner:{ type: Schema.Types.ObjectId, ref: 'user' },
    created: Date,
    comments: [Comments],
    current_stage: { type: Schema.Types.ObjectId, ref: 'stage' },
    labels: [{ type: Schema.Types.ObjectId, ref: 'label' }],
    is_deleted: { type: Boolean, default: false }
});

module.exports = mongoose.model('task', Task);
