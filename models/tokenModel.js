// models/tokenModel.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tokenSchema = new Schema({
    token: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 86400 // 1 day
    }
});

module.exports = mongoose.model('Token', tokenSchema);
