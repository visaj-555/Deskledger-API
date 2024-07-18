const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const fdAnalysisSchema = new Schema({
    totalInvestedAmountOfFds: Number,
    currentReturnAmountOfFds: Number,
    totalProfitGainedOfFds: Number
});

module.exports = mongoose.model('FdAnalysis', fdAnalysisSchema);
