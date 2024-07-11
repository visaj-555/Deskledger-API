const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    phoneNo: {
        type: String, 
        required: true
    },
    email: {
        type: String,
        unique: true
    },
    password: {
        type: String,
    }
}, { timestamps: true }); // time stamp to get the correct value 

const UserModel = mongoose.model('User', UserSchema);
module.exports = UserModel;
