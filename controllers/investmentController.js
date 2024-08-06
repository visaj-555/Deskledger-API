const FixedDeposit = require('../models/fixedDeposit');
const mongoose = require('mongoose');
const { statusCode, message } = require('../utils/api.response');

const getOverallInvestmentBySector = async (req, res) => {
    try {
        const overallInvestment = await FixedDeposit.aggregate([
            { $match: { userId: req.user.id } },
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
        res.status(statusCode.OK).json({ message: message.investmentinAllSectors, data: overallInvestment });
    } catch (error) {
        res.status(statusCode.INTERNAL_SERVER_ERROR).json({ message: message.errorFetchingInvestments, error: error.message });
    }
};

const getTopGainers = async (req, res) => {
    try {
        const userId = req.user.id;
        const topGainers = await FixedDeposit.aggregate([
            { $match: { userId: new mongoose.Types.ObjectId(userId) } },
            {
                $addFields: {
                    profit: { $subtract: ['$currentReturnAmount', '$totalInvestedAmount'] }
                }
            },
            { $sort: { currentReturnAmount: -1 } },
            { $limit: 10 },
            {
                $project: {
                    investmentType: { $literal: 'Fixed Deposit' },
                    sector: { $literal: 'Bank' },
                    totalInvestedAmount: 1,
                    currentReturnAmount: 1,
                    profit: 1
                }
            }
        ]);

        topGainers.forEach((item, index) => {
            item.srNo = index + 1;
        });

        res.status(statusCode.OK).json({ message: message.topGainers, data: topGainers });
    } catch (error) {
        res.status(statusCode.INTERNAL_SERVER_ERROR).json({ message: message.errorFetchingInvestments, error: error.message });
    }
};

const getInvestmentsBySector = async (req, res) => {
    const { sector } = req.params;
    const userId = req.user.id;

    if (!sector) {
        return res.status(statusCode.BAD_REQUEST).json({ message: message.sectorRequired });
    }

    let investments = [];
    try {
        switch (sector.toLowerCase()) {
            case 'banking':
                investments = await FixedDeposit.find({ userId });
                investments = investments.map((item, index) => ({
                    srNo: index + 1,
                    sector: 'Banking',
                    ...item._doc
                }));
                break;
            default:
                return res.status(statusCode.BAD_REQUEST).json({ message: message.errorFetchingSector });
        }

        res.status(statusCode.OK).json({ message: message.investmentBySector, data: investments });
    } catch (error) {
        res.status(statusCode.INTERNAL_SERVER_ERROR).json({ message: message.errorFetchingInvestments, error: error.message });
    }
};

const getInvestmentById = async (req, res) => {
    try {
        const { id } = req.body;
        const investment = await FixedDeposit.findOne({ _id: id, userId: req.user.id });

        if (!investment) {
            return res.status(statusCode.NOT_FOUND).json({ message: message.errorFetchingInvestment });
        }

        res.status(statusCode.OK).json({ message: message.investmentById, data: investment });
    } catch (error) {
        res.status(statusCode.INTERNAL_SERVER_ERROR).json({ message: message.errorFetchingInvestment, error: error.message });
    }
};

const getHighestGrowthInSector = async (req, res) => {
    const { sector } = req.body;

    if (!sector) {
        return res.status(statusCode.BAD_REQUEST).json({ message: message.sectorRequired });
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
            default:
                return res.status(statusCode.BAD_REQUEST).json({ message: message.errorFetchingSector });
        }

        if (!highestGrowth) {
            return res.status(statusCode.NOT_FOUND).json({ message: message.errorFetchingSector });
        }

        res.status(statusCode.OK).json({ message: message.highestGrowthinSector, data: highestGrowth });
    } catch (error) {
        res.status(statusCode.INTERNAL_SERVER_ERROR).json({ message: message.errorFetchingSector, error: error.message });
    }
};

module.exports = {
    getTopGainers,
    getOverallInvestmentBySector,
    getInvestmentsBySector,
    getInvestmentById,
    getHighestGrowthInSector
};
