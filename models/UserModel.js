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
    role: {
        type: String,
        enum: ['admin', 'user'], // User can select only one value 
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    }
}, { timestamps: true }); // time stamp to get the correct value 

const UserModel = mongoose.model('User', UserSchema);
module.exports = UserModel;
