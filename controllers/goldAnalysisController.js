const mongoose = require('mongoose');
const GoldModel = require('../models/goldModel');
const GoldAnalysisModel = require('../models/goldAnalysis');
const { statusCode, message } = require('../utils/api.response');

// Get gold analysis
const getGoldAnalysis = async (req, res) => {
    try {
        const userId = req.user.id;

        const goldAnalysis = await GoldModel.aggregate([
            { $match: { userId: new mongoose.Types.ObjectId(userId) } },
            {
                $addFields: {
                    totalInvestedAmount: "$goldPurchasePrice",
                    currentReturnAmount: "$totalReturnAmount",
                    profit: "$profit"
                }
            },
            {
                $group: {
                    _id: null,
                    totalInvestedAmountOfGold: { $sum: "$totalInvestedAmount" },
                    currentReturnAmountOfGold: { $sum: "$currentReturnAmount" },
                    totalProfitGainedOfGold: { $sum: "$profit" }
                }
            }
        ]);

        if (!goldAnalysis || goldAnalysis.length === 0) {
            return res.status(statusCode.NO_CONTENT).json({ statusCode: statusCode.NO_CONTENT, message: message.goldNotFetch });
        }

        const analysisData = {
            totalInvestedAmountOfGold: Math.round(goldAnalysis[0].totalInvestedAmountOfGold),
            currentReturnAmountOfGold: Math.round(goldAnalysis[0].currentReturnAmountOfGold),
            totalProfitGainedOfGold: Math.round(goldAnalysis[0].totalProfitGainedOfGold),
            userId: new mongoose.Types.ObjectId(userId)
        };

        const filter = { userId: new mongoose.Types.ObjectId(userId) };
        const update = { $set: analysisData };
        const options = { upsert: true, new: true };
        const updatedGoldAnalysis = await GoldAnalysisModel.findOneAndUpdate(filter, update, options);

        console.log("Updated Gold Analysis:", updatedGoldAnalysis);

        res.status(statusCode.OK).json({
            statusCode: statusCode.OK,
            message: message.analysisReportofGold,
            data: analysisData
        });
    } catch (error) {
        console.error("Error calculating Gold analytics:", error);
        res.status(statusCode.INTERNAL_SERVER_ERROR).json({ statusCode: statusCode.INTERNAL_SERVER_ERROR, message: message.errorGoldAnalytics, error: error.message });
    }
};

module.exports = { getGoldAnalysis };
