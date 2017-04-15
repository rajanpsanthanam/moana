const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const Stage = new Schema({
    name: { type: String, required: true, unique: true },
    order: { type: Number, min: 0},
    bg_color: String,
    font_color: String,
    is_deleted: { type: Boolean, default: false }
});

module.exports = mongoose.model('stage', Stage);
