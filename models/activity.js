const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const Activity = new Schema({
    is_deleted: { type: Boolean, default: false }
});

module.exports = mongoose.model('activity', Activity);
