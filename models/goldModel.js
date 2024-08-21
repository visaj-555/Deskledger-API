const mongoose = require('mongoose');
const Schema = mongoose.Schema; // Corrected this line to use 'Schema' with an uppercase 'S'

const goldSchema = new Schema({
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
    totalReturnAmount: {
        type: Number, // Current Calculated Gold Price
    },
    profit: {
        type: Number,
    }, 
    sector: {
        type: String,
        default: 'Gold' 
    }, 
    userId: {
        type: Schema.Types.ObjectId, // Corrected this line to use 'Schema' with an uppercase 'S'
        ref: 'userModel',
    }, 
}, { timestamps: true });

const GoldModel = mongoose.model("Gold", goldSchema);
module.exports = GoldModel;
