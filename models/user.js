const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

/*role: ['administrator', 'member', 'viewer']*/

const User = new Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, lowercase: true, default: 'viewer' },
  is_admin: { type: Boolean, default: false },
  is_deleted: { type: Boolean, default: false },
  api_token: { type: String, unique: true }
});


// check for more options here https://github.com/saintedlama/passport-local-mongoose
options = {usernameField : 'email'};
User.plugin(passportLocalMongoose, options);

module.exports = mongoose.model('user', User);
