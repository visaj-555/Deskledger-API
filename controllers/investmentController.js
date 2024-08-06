const FixedDeposit = require('../models/fixedDeposit');
const mongoose = require('mongoose');

const getOverallInvestmentBySector = async (req, res) => {
    try {
        const overallInvestment = await FixedDeposit.aggregate([
            { $match: { userId: req.user.id } }, // Filter by authenticated user
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
        res.status(200).json({ statusCode: 200, message: "Overall Investment in All the Sectors (%)", data: overallInvestment });
    } catch (error) {
        res.status(500).json({ statusCode: 500, message: "Error while fetching overall Investment sector", error: error.message });
    }
};

const getTopGainers = async (req, res) => {
    try {
       
        const userId = req.user.id; 

        const topGainers = await FixedDeposit.aggregate([
            { $match: { userId: new mongoose.Types.ObjectId(userId) 
            } }, 
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

        res.status(200).json({
            statusCode: 200,
            message: "Top Gainers of all the Sectors",
            data: topGainers
        });

        console.log("Top Gainers: ", topGainers);
    } catch (error) {
        res.status(500).json({
            statusCode: 500,
            message: "Error while fetching Top Gainers",
            error: error.message
        });
    }
};

const getInvestmentsBySector = async (req, res) => {
    const { sector } = req.params; 
    const userId = req.user.id; 

    if (!sector) {
        return res.status(400).json({ message: 'Sector field is required in the body' });
    }

    let investments = [];
    try {
        console.log("Fetching investments for User ID:", userId, "and Sector:", sector);

        switch (sector.toLowerCase()) {
            case 'banking':
                investments = await FixedDeposit.find({ userId });
                console.log("Investments fetched:", investments);

                investments = investments.map((item, index) => ({
                    srNo: index + 1,
                    sector: 'Banking', 
                    ...item._doc
                }));
                break;
            default:
                return res.status(400).json({ message: 'Invalid sector' });
        }

        res.status(200).json({ statusCode: 200, message: "Investment data for the specified sector", data: investments });
    } catch (error) {
        console.error("Error while fetching Investments by Sector:", error);
        res.status(500).json({ statusCode: 500, message: "Error while fetching Investments by Sector", error: error.message });
    }
};

const getInvestmentById = async (req, res) => {
    try {
        const { id } = req.body; 
        const investment = await FixedDeposit.findOne({ _id: id, userId: req.user.id }); 

        if (!investment) {
            return res.status(404).json({ message: 'Investment not found' });
        }

        res.status(200).json({ statusCode: 200, message: "Investment by Id", data: investment });
    } catch (error) {
        res.status(500).json({ statusCode: 500, message: "Error while fetching Investment by Id", error: error.message });
    }
};

const getHighestGrowthInSector = async (req, res) => {
    const { sector } = req.body;

    if (!sector) {
        return res.status(400).json({ message: 'Sector is required' });
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
                return res.status(400).json({ message: 'Invalid sector' });
        }

        if (!highestGrowth) {
            return res.status(404).json({ message: 'No data found for the selected sector' });
        }

        res.status(200).json({
            message: 'Highest growth in sector retrieved successfully',
            data: highestGrowth
        });

    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

module.exports = {
    getTopGainers,
    getOverallInvestmentBySector,
    getInvestmentsBySector,
    getInvestmentById,
    getHighestGrowthInSector
};
