const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const Feature = new Schema({
    name: String,
    bg_color: String,
    font_color: String,
    is_deleted: { type: Boolean, default: false }
});

module.exports = mongoose.model('feature', Feature);
