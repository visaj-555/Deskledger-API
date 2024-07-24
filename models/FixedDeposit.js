// FixedDeposit.js 

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FixedDepositSchema = new Schema({
    fdId : {
        type : String,
    },
    srNo : {
        type : Number
    },
    firstName: {
        type: String,
        trim : true
    },
    lastName: {
        type: String,
        trim : true
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
    tenure : {
        type: String,
    }, 
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'UserModel',
    }
});

const FixedDepositModel = mongoose.model('FixedDeposit', FixedDepositSchema);
module.exports = FixedDepositModel;
