const mongoose = require('mongoose');
const Schema = mongoose.Schema; // Correctly imported Schema from mongoose

const goldAnalysisSchema = new Schema({ // Use 'Schema' instead of 'schema'
    totalInvestedAmountOfGold: {
        type: Number,
    },
    currentReturnAmountOfGold: {
        type: Number,
    },
    totalProfitGainedOfGold: {
        type: Number,
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'userModel',
    },
}, { timestamps: true });

const GoldAnalysisModel = mongoose.model("GoldAnalysis", goldAnalysisSchema);
module.exports = GoldAnalysisModel;
