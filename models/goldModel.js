const mongoose = require('mongoose');
const schema  = mongoose.Schema;

const goldSchema = new schema({
    goldId: {
        type: String,
    },
    firstName :{
        type: String,
        required: true
    }, 
    lastName:{
        type: String,
        required: true
    }, 
    goldWeight: {
        type: Number,
        required: true
    }, 
    goldPurchasePrice: {
        type: Number,
        required: true
    },
    goldCurrentPricePerGram:{
        type: Number,
    }, 
    makingChargesPerGram:{
        type :Number, 
    },
    goldCurrentValue:{
        type: Number,
    }, 
    gst:{
        type: Number,
    }, 
    finalGoldPrice:{
        type: Number,
    }, 
    profit:{
        type: Number,
    }
})

const GoldModel = mongoose.model("Gold", goldSchema); 
module.exports = GoldModel;