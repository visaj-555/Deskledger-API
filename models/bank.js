const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BankSchema = new Schema({
    bankName: {
        type: String,
        required: true
        }, 
    cityId : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'City',
        required: true
        
    }
}, { timestamps: true });

const BankModel = mongoose.model('Bank', BankSchema);
module.exports = BankModel;
