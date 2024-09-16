//fixedDeposit.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FixedDepositSchema = new Schema({
    fdId: {
        type: String,
    },
    srNo: {
        type: Number
    },
    firstName: {
        type: String,
        trim: true
    },
    lastName: {
        type: String,
        trim: true
    },
    fdNo: {
        type: Number,
        unique: true,
    },
    fdType: {
        type: String,
    },
    bankId: {
        type: Schema.Types.ObjectId,
        ref: 'bank',    
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
        type: Number, // to be calculated in backend
    },
    tenureInMonths: {
        type: Number, // to be calculated in backend
    },
    currentReturnAmount: {
        type: Number, // to be calculated in backend
    },
    totalReturnedAmount: {
        type: Number, // to be calculated in backend
    },
    currentProfitAmount: {
        type: Number, // to be calculated in backend
    },
    totalYears: {
        type: String, // to be calculated in backend
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'UserModel',
    }, 
    sector: {
        type: String,
        default: 'Banking' // Default value if all FixedDeposits are in the Banking sector
    }
}, { timestamps: true });

const FixedDepositModel = mongoose.model('FixedDeposit', FixedDepositSchema);
module.exports = FixedDepositModel;


