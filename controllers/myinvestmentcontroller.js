// myinvestmentcontroller.js

const FixedDeposit = require('../models/FixedDeposit');


const getOverallInvestmentBySector = async (req, res) => {
    try {
        const overallInvestment = await FixedDeposit.aggregate([
            {
                $group: {
                    _id: '$sector',
                    totalProfitAmount: { $sum: '$currentProfitAmount' }
                }
            },                                                             // Pie chart 
            {
                $project: {
                    sector: '$_id',
                    totalProfitAmount: 1
                }
            }
        ]);
        res.status(200).json({ statusCode: 200, message: "Overall Investment in All the Sectors (%)", data: overallInvestment });

    } catch (error) {
        res.status(500).json({ statusCode: 500, message: "Error while fetching overall Investment sector", error: error });
    }
};

const getTopGainers = async (req, res) => {
    try {
        const topGainers = await FixedDeposit.aggregate([
            {
                $setWindowFields: {
                    sortBy: { profit: -1 },
                    output: {
                        srNo: { $documentNumber: {} }
                    }
                }
            },
            {
                $set: {
                    investmentType: 'FD',
                    sector: 'Banking',
                    profit: { $subtract: ['$currentReturnAmount', '$totalInvestedAmount'] }
                }
            },
            {
                $project: {
                    srNo: 1,
                    investmentType: 1,
                    sector: 1,
                    totalInvestedAmount: 1,
                    currentReturnAmount: 1,
                    profit: 1
                }
            },
            { $sort: { profit: -1 } },
            { $limit: 10 }
        ]);

        // Manually adjust the srNo field to start from 1
        topGainers.forEach((item, index) => {
            item.srNo = index + 1;
        });

        res.status(200).json({ statusCode: 200, message: "Top Gainers of all the Sectors", data: topGainers });
    } catch (error) {
        res.status(500).json({ statusCode: 500, message: "Error while fetching Top Gainers", error: error.message });
    }
};


const getInvestmentsBySector = async (req, res) => {
    const { sector } = req.params;

    let investments;
    switch (sector) {
        case 'banking':
            investments = await FixedDeposit.find({}); // Fetching investments by sector
            break;
        default:
            return res.status(400).json({ message: 'Invalid sector' });
    }

    // Add SrNo to each investment
    investments = investments.map((item, index) => ({
        srNo: index + 1,
        ...item._doc
    }));

    res.status(200).json({ statusCode: 200, message: "Investment data of All the Sectors", data: investments });
};

// Controller to get investment by ID
const getInvestmentById = async (req, res) => {
    try {
        const { id } = req.params;
        const investment = await FixedDeposit.findById(id);

        if (!investment) {
            return res.status(404).json({ message: 'Investment not found' });
        }

        res.status(200).json({ statusCode: 200, message: "Investment of All the Sectors by Id", data: investment });
    } catch (error) {
        console.log("Fetching Investment by Id " + error);
        res.status(500).json({ statusCode: 500, message: "Error while fetching Investment by Id", error: error.message });
    }
};



const getHighestGrowthInSector = async (req, res) => {
    const { sector } = req.query; 
    console.log("Sector: ", sector);

    if (!sector) {
        return res.status(400).json({ message: 'Sector is required' });
    }

    let highestGrowth;
    try {
        switch (sector.toLowerCase()) {
            case 'banking':
                highestGrowth = await FixedDeposit.findOne({})
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
        console.error('Error in getHighestGrowthInSector:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};



module.exports = {
    getTopGainers ,  
    getOverallInvestmentBySector , 
    getInvestmentsBySector,
    getInvestmentById, 
    getHighestGrowthInSector
};

