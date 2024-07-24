// UserModel.js 

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    firstName: {
        type: String, 
        trim : true
    },
    lastName: {
        type: String,
        trim : true
    },
    phoneNo: {
        type: Number, 
        unique : true, 
        trim : true
    },
    email: {
        type: String,
        unique: true,
        trim : true
    },
    password: {
        type: String,
        trim : true
    },
    token : {
        type: String,
        default: null
    }
    
}, { timestamps: true }); // time stamp to get the correct value 

const UserModel = mongoose.model('User', UserSchema);
module.exports = UserModel;
