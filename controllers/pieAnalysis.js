const mongoose = require('mongoose');
const GoldModel = require('../models/goldModel');
const GoldAnalysisModel = require('../models/goldAnalysis');
const FixedDepositModel = require('../models/fixedDeposit'); // Ensure this path is correct
const { statusCode, message } = require('../utils/api.response');

// Combined analysis function
const getPieAnalysis = async (req, res) => {
    try {
        const userId = req.user.id;

        // Get Gold Analysis
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

        const goldAnalysisData = {
            totalInvestedAmountOfGold: Math.round(goldAnalysis[0].totalInvestedAmountOfGold),
            currentReturnAmountOfGold: Math.round(goldAnalysis[0].currentReturnAmountOfGold),
            totalProfitGainedOfGold: Math.round(goldAnalysis[0].totalProfitGainedOfGold),
            userId: new mongoose.Types.ObjectId(userId)
        };

        const filterGold = { userId: new mongoose.Types.ObjectId(userId) };
        const updateGold = { $set: goldAnalysisData };
        const optionsGold = { upsert: true, new: true };
        await GoldAnalysisModel.findOneAndUpdate(filterGold, updateGold, optionsGold);

        // Get FD Analysis
        const fdAnalysis = await FixedDepositModel.aggregate([
            { $match: { userId: new mongoose.Types.ObjectId(userId) } },
            {
                $addFields: {
                    currentDate: new Date(),
                    tenureInYears: {
                        $divide: [
                            { $subtract: ["$maturityDate", "$startDate"] },
                            1000 * 60 * 60 * 24 * 365
                        ]
                    },
                    tenureCompletedYears: {
                        $divide: [
                            { $subtract: [new Date(), "$startDate"] },
                            1000 * 60 * 60 * 24 * 365
                        ]
                    }
                }
            },
            {
                $addFields: {
                    currentReturnAmount: {
                        $round: [
                            {
                                $cond: {
                                    if: { $gte: [new Date(), "$maturityDate"] },
                                    then: {
                                        $multiply: [
                                            "$totalInvestedAmount",
                                            {
                                                $pow: [
                                                    { $add: [1, { $divide: ["$interestRate", 100] }] },
                                                    { $round: ["$tenureInYears", 2] }
                                                ]
                                            }
                                        ]
                                    },
                                    else: {
                                        $multiply: [
                                            "$totalInvestedAmount",
                                            {
                                                $pow: [
                                                    { $add: [1, { $divide: ["$interestRate", 100] }] },
                                                    { $round: ["$tenureCompletedYears", 2] }
                                                ]
                                            }
                                        ]
                                    }
                                }
                            },
                            0
                        ]
                    },
                    totalReturnedAmount: {
                        $round: [
                            {
                                $multiply: [
                                    "$totalInvestedAmount",
                                    {
                                        $pow: [
                                            { $add: [1, { $divide: ["$interestRate", 100] }] },
                                            { $round: ["$tenureInYears", 2] }
                                        ]
                                    }
                                ]
                            },
                            0
                        ]
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    totalInvestedAmountOfFds: { $sum: "$totalInvestedAmount" },
                    currentReturnAmountOfFds: { $sum: { $round: ["$currentReturnAmount", 0] } },
                    totalReturnAmountofFds: { $sum: "$totalReturnedAmount" } // New field added here
                }
            },
            {
                $addFields: {
                    totalProfitGainedOfFds: {
                        $subtract: ["$currentReturnAmountOfFds", "$totalInvestedAmountOfFds"]
                    }
                }
            }
        ]);

        if (!fdAnalysis || fdAnalysis.length === 0) {
            return res.status(statusCode.OK).json({ statusCode: statusCode.OK, message: message.errorFetchingFD });
        }

        const fdAnalysisData = {
            totalInvestedAmountOfFds: Math.round(fdAnalysis[0].totalInvestedAmountOfFds),
            currentReturnAmountOfFds: Math.round(fdAnalysis[0].currentReturnAmountOfFds),
            totalReturnAmountofFds: Math.round(fdAnalysis[0].totalReturnAmountofFds),
            totalProfitGainedOfFds: Math.round(fdAnalysis[0].totalProfitGainedOfFds),
            userId: new mongoose.Types.ObjectId(userId)
        };

        res.status(statusCode.OK).json({
            statusCode: statusCode.OK,
            message: message.combinedAnalysisReport,
            data: {
                goldAnalysis: goldAnalysisData,
                fdAnalysis: fdAnalysisData
            }
        });
    } catch (error) {
        console.error("Error calculating combined analytics:", error);
        res.status(statusCode.INTERNAL_SERVER_ERROR).json({ statusCode: statusCode.INTERNAL_SERVER_ERROR, message: message.errorCombinedAnalytics, error: error.message });
    }
};

// Export the combined function
module.exports = {
    getPieAnalysis
};

