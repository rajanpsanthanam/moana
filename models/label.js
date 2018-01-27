const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const Label = new Schema({
    name: { type: String, required: true, unique: true },
    bg_color: String,
    font_color: String,
    is_deleted: { type: Boolean, default: false }
});

module.exports = mongoose.model('label', Label);
