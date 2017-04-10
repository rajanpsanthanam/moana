const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const Stage = new Schema({
    name: String,
    order: { type: Number, min: 0},
    color: String,
    is_deleted: { type: Boolean, default: false }
});

module.exports = mongoose.model('stage', Stage);