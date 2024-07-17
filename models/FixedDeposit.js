const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FixedDepositSchema = new Schema({
    srNo : {
        type : Number
    },
    firstName: {
        type: String,
    },
    lastName: {
        type: String,
    },
    fdNo: {
        type: Number,
        unique: true,
    },
    fdType: {
        type: String,
    },
    bankName: {
        type: String,
    },
    branchName: {
        type: String,
    },
    interestRate: {
        type: Number,
    },
    startDate: {
        type: Date,
    },
    maturityDate: {
        type: Date,
    },
    totalInvestedAmount: {
        type: Number,
    },
    tenureInYears: {
        type: Number,
    },
    tenureInMonths: {
        type: Number,
    },
    currentReturnAmount: {
        type: Number,
    },
    totalReturnedAmount: {
        type: Number,
    },
    currentProfitPercentage: {
        type: Number,
    },
    currentProfitAmount: {
        type: Number,
    },
});

const FixedDepositModel = mongoose.model('FixedDeposit', FixedDepositSchema);
module.exports = FixedDepositModel;
