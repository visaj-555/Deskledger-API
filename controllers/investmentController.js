const mongoose = require('mongoose');
const FixedDeposit = require('../models/fixedDeposit');
const GoldModel = require('../models/goldModel');
const { statusCode, message } = require('../utils/api.response');

const getOverallInvestmentBySector = async (req, res) => {
    try {
        const userId = req.user.id;

        // Aggregate data for both sectors
        const fdInvestment = await FixedDeposit.aggregate([
            { $match: { userId: new mongoose.Types.ObjectId(userId) } },
            {
                $group: {
                    _id: '$sector',
                    totalProfitAmount: { $sum: '$currentProfitAmount' }
                }
            },
            {
                $project: {
                    sector: '$_id',
                    totalProfitAmount: 1
                }
            }
        ]);

        const goldInvestment = await GoldModel.aggregate([
            { $match: { userId: new mongoose.Types.ObjectId(userId) } },
            {
                $group: {
                    _id: '$sector',
                    totalProfitAmount: { $sum: '$profit' }
                }
            },
            {
                $project: {
                    sector: '$_id',
                    totalProfitAmount: 1
                }
            }
        ]);

        const overallInvestment = [...fdInvestment, ...goldInvestment];

        res.status(statusCode.OK).json({statusCode : statusCode.OK, message: message.investmentinAllSectors, data: overallInvestment });
    } catch (error) {
        res.status(statusCode.INTERNAL_SERVER_ERROR).json({statusCode : statusCode.INTERNAL_SERVER_ERROR, message: message.errorFetchingInvestments, error: error.message });
    }
};

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

module.exports = {
    getTopGainers,
    getOverallInvestmentBySector,
    getInvestmentsBySector,
    getInvestmentById,
    getHighestGrowthInSector
};
