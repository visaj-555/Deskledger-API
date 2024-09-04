//FDAnalysis.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const fdAnalysisSchema = new Schema({
    totalInvestedAmountOfFds: { type: Number, required: true },
    currentReturnAmountOfFds: { type: Number, required: true },
    totalProfitGainedOfFds: { type: Number, required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true } 
}, { timestamps: true });
module.exports = mongoose.model('FdAnalysis', fdAnalysisSchema);
