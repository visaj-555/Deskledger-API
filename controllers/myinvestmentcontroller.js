const FixedDeposit = require('../models/FixedDeposit');

const getOverallInvestmentBySector = async (req, res) => {
    try {
        const overallInvestment = await FixedDeposit.aggregate([
            {
                $group: {
                    _id: '$sector',
                    totalProfitAmount: { $sum: '$currentProfitAmount' }
                }
            },
            {
                $project: {
                    sector: '$_id',
                    totalProfitAmount: 1,
                    _id: 0
                }
            }
        ]);

        res.status(200).json({ statusCode: 200, message: "Overall Investment in All the Sectors", data: overallInvestment });

    } catch (error) {
        console.error("Error while fetching overall Investment sector:", error);
        res.status(500).json({ statusCode: 500, message: "Error while fetching overall Investment sector", error: error });
    }
};

const getTopGainers = async (req, res) => {
    try {
        const topGainers = await FixedDeposit.aggregate([
            {
                $project: {
                    srNo: 1,
                    investmentType: 'FD',
                    sector: 'Banking',
                    totalInvestedAmount: 1,
                    currentReturnAmount: 1,
                    profit: { $subtract: ['$currentReturnAmount', '$totalInvestedAmount'] }
                }
            },
            { $sort: { profit: -1 } },
            { $limit: 10 }
        ]);

        res.status(200).json({ statusCode: 201, message: "Top Gainers of all the Sectors", data: topGainers });

    } catch (error) {
        console.error("Error while fetching Top Gainers:", error);
        res.status(500).json({ statusCode: 500, message: "Error while fetching Top Gainers", error });
    }
};

const getInvestmentsBySector = async (req, res) => {
    const { sector } = req.params;

    try {
        let investments;

        switch (sector.toLowerCase()) {
            case 'bank':
                investments = await FixedDeposit.aggregate([
                    { $match: { sector: "Bank" } },
                    {
                        $project: {
                            srNo: 1,
                            fdType: 1,
                            bankName: 1,
                            totalInvestedAmount: 1,
                            currentReturnAmount: 1,
                            interestRate: 1,
                            tenureInYears: 1
                        }
                    },
                    { $sort: { currentReturnAmount: -1 } },
                    { $limit: 1 }
                ]);
                break;
            case 'financial institution':
                investments = await FixedDeposit.aggregate([
                    { $match: { sector: "Financial Institution" } },
                    {
                        $project: {
                            srNo: 1,
                            fdType: 1,
                            bankName: 1,
                            totalInvestedAmount: 1,
                            currentReturnAmount: 1,
                            interestRate: 1,
                            tenureInYears: 1
                        }
                    },
                    { $sort: { currentReturnAmount: -1 } },
                    { $limit: 1 }
                ]);
                break;
            default:
                return res.status(400).json({ statusCode: 400, message: "Invalid Sector Type" });
        }

        res.status(200).json({ statusCode: 200, message: `Investments in ${sector} Sector`, data: investments });

    } catch (error) {
        console.error("Error while fetching Investments by sector:", error);
        res.status(500).json({ statusCode: 500, message: "Error while fetching Investments by sector", error });
    }
};

module.exports = {
    getOverallInvestmentBySector,
    getTopGainers,
    getInvestmentsBySector
};
