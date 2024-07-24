const mongoose = require('mongoose');
const FixedDepositModel = require('../models/FixedDeposit');
const FdAnalysisModel = require('../models/FdAnalysis');

const getFdAnalysis = async (req, res) => {
    try {
        const { id: userId } = req.params; 

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
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    totalInvestedAmountOfFds: { $sum: "$totalInvestedAmount" },
                    currentReturnAmountOfFds: { $sum: { $round: ["$currentReturnAmount", 0] } }
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
            return res.status(404).json({ message: 'No Fixed Deposits found' });
        }

        const analysisData = {
            totalInvestedAmountOfFds: Math.round(fdAnalysis[0].totalInvestedAmountOfFds),
            currentReturnAmountOfFds: Math.round(fdAnalysis[0].currentReturnAmountOfFds),
            totalProfitGainedOfFds: Math.round(fdAnalysis[0].totalProfitGainedOfFds),
            userId: new mongoose.Types.ObjectId(userId) // Associate analysis with the user
        };

        const filter = { userId: new mongoose.Types.ObjectId(userId) };
        const update = { $set: analysisData };
        const options = { upsert: true, new: true };
        const updatedFdAnalysis = await FdAnalysisModel.findOneAndUpdate(filter, update, options);

        console.log("Updated FD Analysis:", updatedFdAnalysis);

        res.status(200).json({
            statusCode: 200,
            message: "Analysis Report of all the fixed deposits",
            data: analysisData
        });
    } catch (error) {
        console.error("Error calculating FD analytics:", error);
        res.status(500).json({ statusCode: 500, message: "Error calculating FD analytics", error: error.message });
    }
};

module.exports = {
    getFdAnalysis
};
