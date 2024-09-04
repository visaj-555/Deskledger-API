const mongoose = require('mongoose');
const FixedDepositModel = require('../models/fixedDeposit');
const GoldModel = require('../models/goldModel');
const GoldAnalysisModel = require('../models/goldAnalysis');
const {formatAmount} = require('../utils/formatAmount');
const { statusCode, message } = require('../utils/api.response');


// CARDS
const getOverallAnalysis = async (req, res) => {
    try {
        const userId = req.user.id;
        console.log("UserId: " + userId);
  
        // Aggregate FD data
        const fdAnalysis = await FixedDepositModel.aggregate([
            { $match: { userId: new mongoose.Types.ObjectId(userId) } },
            {
                $group: {
                    _id: null,
                    totalInvestedAmount: { $sum: "$totalInvestedAmount" },
                    currentReturnAmount: { $sum: "$currentReturnAmount" },
                    totalReturnAmount: { $sum: "$totalReturnedAmount" },
                    profitAmount: {
                        $sum: {
                            $subtract: ["$currentReturnAmount", "$totalInvestedAmount"],
                        },
                    },
                },
            },
        ]);
  
        // Aggregate Gold data
        const goldAnalysis = await GoldModel.aggregate([
            { $match: { userId: new mongoose.Types.ObjectId(userId) } },
            {
                $group: {
                    _id: null,
                    totalInvestedAmount: { $sum: "$goldPurchasePrice" },
                    currentReturnAmount: { $sum: "$totalReturnAmount" },
                    totalReturnAmount: { $sum: "$totalReturnAmount" },
                    profitAmount: { $sum: "$profit" },
                },
            },
        ]);
  
        // Combine FD and Gold data
        const totalInvestedAmount =
            (fdAnalysis[0]?.totalInvestedAmount || 0) +
            (goldAnalysis[0]?.totalInvestedAmount || 0);
        const currentReturnAmount =
            (fdAnalysis[0]?.currentReturnAmount || 0) +
            (goldAnalysis[0]?.currentReturnAmount || 0);
        const totalReturnAmount =
            (fdAnalysis[0]?.totalReturnAmount || 0) +
            (goldAnalysis[0]?.totalReturnAmount || 0);
        const profitAmount =
            (fdAnalysis[0]?.profitAmount || 0) + (goldAnalysis[0]?.profitAmount || 0);
  
        // Format the amounts
        const overallAnalysis = {
            totalInvestedAmount: formatAmount(totalInvestedAmount),
            currentReturnAmount: formatAmount(currentReturnAmount),
            totalReturnAmount: formatAmount(totalReturnAmount),
            totalProfitGained: formatAmount(profitAmount),
            userId: userId,
        };
  
        res.status(statusCode.OK).json({
            statusCode: statusCode.OK,
            message: "Analysis Report of all the fixed deposits",
            data: overallAnalysis,
        });
    } catch (error) {
        res.status(statusCode.INTERNAL_SERVER_ERROR).json({
            statusCode: statusCode.INTERNAL_SERVER_ERROR,
            message: message.errorOverAllAnalysis,
            error: error.message,
        });
    }
};

// 1ST PIE CHART
const getCombinedNumAnalysis = async (req, res) => {
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
                            1000 * 60 * 60 *  24 *  365
                        ]
                    },
                    tenureCompletedYears: {
                        $divide: [
                            { $subtract: [new Date(), "$startDate"] },
                            1000 * 60 * 60 *  24 *  365
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

// HIGHEST GROWTH PIE CHART
const getHighestGrowthInSector = async (req, res) => {
    const { sector } = req.params;

    if (!sector) {
        return res.status(statusCode.BAD_REQUEST).json({ statusCode :statusCode.BAD_REQUEST,  message: message.sectorRequired });
    }

    try {
        let highestGrowth;
        switch (sector.toLowerCase()) {
            case 'banking':
                highestGrowth = await FixedDeposit.findOne({
                    sector: 'Banking',
                    userId: req.user.id
                })
                .sort({ currentReturnAmount: -1 })
                .select('totalInvestedAmount currentReturnAmount bankName fdType interestRate tenureInYears')
                .lean();
                break;
                
            case 'gold':
                highestGrowth = await GoldModel.findOne({
                    sector: 'Gold',
                    userId: req.user.id
                })
                .sort({ totalReturnAmount: -1 })
                .select('goldPurchasePrice totalReturnAmount formOfGold purityOfGold goldWeight')
                .lean();
                break;
            default:
                return res.status(statusCode.BAD_REQUEST).json({ statusCode : statusCode.BAD_REQUEST,   message: message.errorFetchingSector });
        }

        if (!highestGrowth) {
            return res.status(statusCode.NOT_FOUND).json({ statusCode : statusCode.NOT_FOUND, message: message.errorFetchingSector });
        }

        res.status(statusCode.OK).json({statusCode: statusCode.OK,  message: message.highestGrowthinSector, data: highestGrowth });
    } catch (error) {
        res.status(statusCode.INTERNAL_SERVER_ERROR).json({statusCode : statusCode.INTERNAL_SERVER_ERROR, message: message.errorFetchingSector, error: error.message });
    }
};

// TOP GAINERS
const getTopGainers = async (req, res) => {
    try {
        const userId = req.user.id;

        // Get top gainers from Fixed Deposits
        const topGainersFD = await FixedDeposit.aggregate([
            { $match: { userId: new mongoose.Types.ObjectId(userId) } },
            {
                $addFields: {
                    profit: { $subtract: ['$currentReturnAmount', '$totalInvestedAmount'] }
                }
            },
            { $sort: { profit: -1 } },
            { $limit: 5 },  // Limit to top 5
            {
                $project: {
                    investmentType: { $literal: 'Fixed Deposit' },
                    sector: { $literal: 'Banking' },
                    totalInvestedAmount: 1,
                    currentReturnAmount: 1,
                    profit: 1
                }
            }
        ]);

        // Get top gainers from Gold
        const topGainersGold = await GoldModel.aggregate([
            { $match: { userId: new mongoose.Types.ObjectId(userId) } },
            { $sort: { profit: -1 } },
            { $limit: 5 },  // Limit to top 5
            {
                $project: {
                    investmentType: { $literal: 'Gold' },
                    sector: { $literal: 'Gold' },
                    totalInvestedAmount: '$goldPurchasePrice',
                    currentReturnAmount: '$totalReturnAmount',
                    profit: 1
                }
            }
        ]);

        // Combine and sort by profit
        const topGainers = [...topGainersFD, ...topGainersGold]
            .sort((a, b) => b.profit - a.profit) // Sort in descending order
            .slice(0, 10); // Limit to top 10

        // Assign srNo starting from 1
        topGainers.forEach((item, index) => {
            item.srNo = index + 1;
        });

        // Respond with the top gainers data
        res.status(statusCode.OK).json({ statusCode : statusCode.OK,  message: message.topGainers, data: topGainers });
    } catch (error) {
        res.status(statusCode.INTERNAL_SERVER_ERROR).json({ statusCode : statusCode.INTERNAL_SERVER_ERROR,  message: message.errorFetchingInvestments, error: error.message });
    }
};

// INVESTMENT IN SECTOR
const getInvestmentsBySector = async (req, res) => {
    const { sector } = req.params;
    const userId = req.user.id;

    if (!sector) {
        return res.status(statusCode.BAD_REQUEST).json({ 
            statusCode: statusCode.BAD_REQUEST, 
            message: message.sectorRequired 
        });
    }

    try {
        let investments = [];
        switch (sector.toLowerCase()) {
            case 'banking':
                console.log('Fetching Banking Investments for User ID:', userId);
                investments = await FixedDeposit.find({ userId }).lean(); // Fetch documents as plain objects directly
                break;
            case 'gold':
                console.log('Fetching Gold Investments for User ID:', userId);
                investments = await GoldModel.find({ userId }).lean(); // Fetch documents as plain objects directly
                break;
            default:
                return res.status(statusCode.BAD_REQUEST).json({ 
                    statusCode: statusCode.BAD_REQUEST, 
                    message: message.errorFetchingSector 
                });
        }

        // Map investments and add srNo, explicitly set srNo to avoid overriding
        investments = investments.map((item, index) => ({
            srNo: index + 1, // Incremental numbering
            sector: sector.charAt(0).toUpperCase() + sector.slice(1), // Capitalize sector
            ...item, // Spread the plain object properties
            srNo: index + 1 // Override srNo with the correct value
        }));

        res.status(statusCode.OK).json({ 
            statusCode: statusCode.OK, 
            message: message.investmentBySector, 
            data: investments 
        });
    } catch (error) {
        console.error('Error fetching investments:', error.message);
        res.status(statusCode.INTERNAL_SERVER_ERROR).json({ 
            statusCode: statusCode.INTERNAL_SERVER_ERROR, 
            message: message.errorFetchingInvestments, 
            error: error.message 
        });
    }
};

// INVESTMENT IN SECTOR BY ID
const getInvestmentById = async (req, res) => {
    try {
        const { id } = req.params;
        const investmentFD = await FixedDeposit.findOne({ _id: id, userId: req.user.id });
        const investmentGold = await GoldModel.findOne({ _id: id, userId: req.user.id });

        const investment = investmentFD || investmentGold;

        if (!investment) {
            return res.status(statusCode.NOT_FOUND).json({ statusCode :statusCode.NOT_FOUND, message: message.errorFetchingInvestment });
        }

        res.status(statusCode.OK).json({statusCode : statusCode.OK,  message: message.investmentById, data: investment });
    } catch (error) {
        res.status(statusCode.INTERNAL_SERVER_ERROR).json({ statusCode : statusCode.INTERNAL_SERVER_ERROR,  message: message.errorFetchingInvestment, error: error.message });
    }
};


module.exports = {
    getOverallAnalysis, 
    getCombinedNumAnalysis,
    getHighestGrowthInSector, 
    getTopGainers,
    getInvestmentsBySector,
    getInvestmentById,
};
