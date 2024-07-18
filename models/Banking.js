const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BankingSchema = new Schema({
    investmentType: {
        type: String,
        required: true
    }
}, { timestamps: true });

const BankingModel = mongoose.model('Banking', BankingSchema);
module.exports = BankingModel;
