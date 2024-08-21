const mongoose = require('mongoose');
const schema = mongoose.Schema;

const goldSchema = new schema({
    goldId: {
        type: String,
    },
    firstName: {
        type: String,   // input from user
        required: true,
    },
    lastName: {
        type: String,      // input from user
        required: true,
    },
    goldWeight: {
        type: Number,
        required: true, // input from user (in grams)
    },
    goldPurchasePrice: {
        type: Number,   // input from user 
        required: true,
    },
    formOfGold: {
        type: String, // Biscuit, chain, locket, etc...
        required: true,
    },
    purityOfGold: {
        type: Number, // input from user
        required: true, // 22k, 24k, etc...
    },
    // goldMasterId: {   
    //     type: schema.Types.ObjectId,
    //     ref: 'GoldMaster',
    //     required: true,
    // },
    totalReturnAmount: {
        type: Number, // Current Calculated Gold Price
    },
    profit: {
        type: Number,
    }, 
    sector: {
        type: String,
        default: 'Gold' 
    }
}, { timestamps: true });

const GoldModel = mongoose.model("Gold", goldSchema);
module.exports = GoldModel;
