const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const User = new Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  is_admin: { type: Boolean, default: false },
  is_deleted: { type: Boolean, default: false },
  api_token: { type: String, unique: true }
});


// check for more options here https://github.com/saintedlama/passport-local-mongoose
options = {usernameField : 'email'};
User.plugin(passportLocalMongoose, options);


const Label = new Schema({
    name: { type: String, required: true, unique: true },
    bg_color: String,
    font_color: String,
    is_deleted: { type: Boolean, default: false }
});


const Stage = new Schema({
    name: { type: String, required: true, unique: true },
    order: { type: Number, min: 0},
    bg_color: String,
    font_color: String,
    is_deleted: { type: Boolean, default: false }
});

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


module.exports = {
  user: mongoose.model('user', User),
  label: mongoose.model('label', Label),
  stage: mongoose.model('stage', Stage),
  task: mongoose.model('task', Task)
}
