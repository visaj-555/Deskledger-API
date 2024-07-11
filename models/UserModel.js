const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    firstName: {
        type: String
    },
    lastName: {
        type: String,
    },
    phoneNo: {
        type: String, 
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
