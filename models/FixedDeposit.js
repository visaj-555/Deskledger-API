// Defining all the input fields of Fixed Deposits 


const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FixedDepositSchema =  new Schema ({
    firstName: {
    type : String,  
    },
    lastName :{
        type : String
    }, 
    fdNo : {
        type : Number, 
        unique : true
    }, 
    fdType : {
        type : String
    }, 
    bankName :{
        type : String
    }, 
    branchName : {
        type : String
    },
    interestRate : {
        type : Number
    },
    startDate :{
        type : String
    }, 
    maturityDate : {
        type : String
    }, 
    totalInvestedAmount : {
        type : Number
    }
})

const FixedDepositModel = mongoose.model('Fixed Deposit', FixedDepositSchema);
module.exports = FixedDepositModel;
