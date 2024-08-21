const mongoose = require('mongoose');
const { FormFieldValidationStatus } = require('sanity');
const schema = mongoose.Schema;

const goldMasterSchema = new schema({
    goldRate22KPerGram :{ // 22 carat Gold rate per gram
        type: Number,
        required: true,
    }, 
    goldRate24KPerGram :{
        type: Number, // 24 carat Gold rate per gram
        required: true,
    },
    gst: {
        type: Number,
        required: true,
    }, 
    makingChargesPerGram: {
        type: Number, // (In %)
        required: true,
    },



}, { timestamps: true });

const GoldMasterModel = mongoose.model("GoldMaster", goldMasterSchema);
module.exports = GoldMasterModel;



