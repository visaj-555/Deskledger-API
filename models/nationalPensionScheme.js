//UserModel.js

const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');
const Schema = mongoose.Schema;

const NationalPensionScheme = new Schema(
  {
    firstName: {
      type: String,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    pranNo: {
      type: Number,
      unique: true
    },
    accountType: {
      type: String,
      unique: true,
    },
    startDate: {
      type: String,
    }, 
    maturityDate: {
        type: String,
    },
    tenure : {
        type: String,
    }, 
    pensionFund : {
        type: String,
    }, 
    investmentOption : {
        type : String,
    }, 
    investedAmount :{
        type: Number,
    }, 
    recentlyInvestedAmount :{
        type: Number,
    } 
},

  { timestamps: true }
); 

const NPSModel = mongoose.model("National Pension Scheme",  NationalPensionScheme);
module.exports = NPSModel;
