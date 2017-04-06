const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const User = new Schema({
    username: String,
    password: String,
    is_admin: { type: Boolean, default: false },
    is_deleted: { type: Boolean, default: false }
});

User.plugin(passportLocalMongoose);

module.exports = mongoose.model('user', User);
