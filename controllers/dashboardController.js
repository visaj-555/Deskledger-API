const mongoose = require("mongoose");
const FixedDepositModel = require("../models/fixedDeposit");
const GoldModel = require("../models/goldModel");
const GoldAnalysisModel = require("../models/goldAnalysis");
const { formatAmount } = require("../utils/formatAmount");
const { statusCode, message } = require("../utils/api.response");

// Utility function to get date filters
const getDateFilters = (startDate, endDate) => {
  const filters = {};
  if (startDate) {
    filters["$gte"] = new Date(new Date(startDate).setHours(0, 0, 0, 0));
  }
  if (endDate) {
    filters["$lte"] = new Date(new Date(endDate).setHours(23, 59, 59, 999));
  }
  return filters;
};

// CARDS
const getOverallAnalysis = async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate } = req.query;

    // Create the match object for FD data
    const fdMatch = { userId: new mongoose.Types.ObjectId(userId) };
    if (startDate || endDate) {
      fdMatch.createdAt = getDateFilters(startDate, endDate);
    }

    // Aggregate FD data
    const fdAnalysis = await FixedDepositModel.aggregate([
      { $match: fdMatch },
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

    // Create the match object for Gold data
    const goldMatch = { userId: new mongoose.Types.ObjectId(userId) };
    if (startDate || endDate) {
      goldMatch.createdAt = getDateFilters(startDate, endDate);
    }

    // Aggregate Gold data
    const goldAnalysis = await GoldModel.aggregate([
      { $match: goldMatch },
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

    // Combine FD and Gold data and format the amounts
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
    });
  }
};

// 1ST PIE CHART
const getCombinedNumAnalysis = async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate } = req.query;

    // Create the match object with userId and date filters
    const match = { userId: new mongoose.Types.ObjectId(userId) };
    if (startDate || endDate) {
      match.createdAt = getDateFilters(startDate, endDate);
    }

    // Aggregate Gold data
    const goldAnalysis = await GoldModel.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalInvestedAmountOfGold: { $sum: "$goldPurchasePrice" },
          currentReturnAmountOfGold: { $sum: "$totalReturnAmount" },
          totalProfitGainedOfGold: { $sum: "$profit" },
        },
      },
    ]);

    const goldAnalysisData = {
      totalInvestedAmountOfGold: Math.round(
        goldAnalysis[0]?.totalInvestedAmountOfGold || 0
      ),
      currentReturnAmountOfGold: Math.round(
        goldAnalysis[0]?.currentReturnAmountOfGold || 0
      ),
      totalProfitGainedOfGold: Math.round(
        goldAnalysis[0]?.totalProfitGainedOfGold || 0
      ),
      userId: userId,
    };

    // Save Gold Analysis to GoldAnalysisModel
    await GoldAnalysisModel.findOneAndUpdate(
      { userId },
      { $set: goldAnalysisData },
      { upsert: true, new: true }
    );

    // Aggregate Fixed Deposit data
    const fdAnalysis = await FixedDepositModel.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalInvestedAmountOfFds: { $sum: "$totalInvestedAmount" },
          currentReturnAmountOfFds: { $sum: "$currentReturnAmount" },
          totalReturnAmountofFds: { $sum: "$totalReturnedAmount" },
          totalProfitGainedOfFds: {
            $sum: {
              $subtract: ["$currentReturnAmount", "$totalInvestedAmount"],
            },
          },
        },
      },
    ]);

    const fdAnalysisData = {
      totalInvestedAmountOfFds: Math.round(
        fdAnalysis[0]?.totalInvestedAmountOfFds || 0
      ),
      currentReturnAmountOfFds: Math.round(
        fdAnalysis[0]?.currentReturnAmountOfFds || 0
      ),
      totalReturnAmountofFds: Math.round(
        fdAnalysis[0]?.totalReturnAmountofFds || 0
      ),
      totalProfitGainedOfFds: Math.round(
        fdAnalysis[0]?.totalProfitGainedOfFds || 0
      ),
      userId: userId,
    };

    // Return Combined Analysis
    res.status(statusCode.OK).json({
      statusCode: statusCode.OK,
      message: message.combinedNumAnalysis,
      data: { goldAnalysisData, fdAnalysisData },
    });
  } catch (error) {
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      statusCode: statusCode.INTERNAL_SERVER_ERROR,
      message: message.errorCombinedNumAnalysis,
    });
  }
};

// HIGHEST GROWTH PIE CHART
const getHighestGrowthInSector = async (req, res) => {
  const { sector } = req.params;
  const { startDate, endDate } = req.query;

  // Prepare the date filters
  const dateFilters =
    startDate && endDate ? getDateFilters(startDate, endDate) : {};

  if (!sector) {
    return res.status(statusCode.BAD_REQUEST).json({
      statusCode: statusCode.BAD_REQUEST,
      message: message.sectorRequired,
    });
  }

  try {
    let highestGrowth;
    switch (sector.toLowerCase()) {
      case "banking":
        highestGrowth = await FixedDepositModel.findOne({
          sector: "Banking",
          userId: req.user.id,
          ...(Object.keys(dateFilters).length
            ? { createdAt: dateFilters }
            : {}),
        })
          .sort({ currentReturnAmount: -1 })
          .select(
            "totalInvestedAmount currentReturnAmount bankName fdType interestRate tenureInYears"
          )
          .lean();
        break;

      case "gold":
        highestGrowth = await GoldModel.findOne({
          sector: "Gold",
          userId: req.user.id,
          ...(Object.keys(dateFilters).length
            ? { createdAt: dateFilters }
            : {}),
        })
          .sort({ totalReturnAmount: -1 })
          .select(
            "goldPurchasePrice totalReturnAmount formOfGold purityOfGold goldWeight"
          )
          .lean();
        break;

      default:
        return res.status(statusCode.BAD_REQUEST).json({
          statusCode: statusCode.BAD_REQUEST,
          message: message.errorFetchingSector,
        });
    }

    if (!highestGrowth) {
      highestGrowth = {
        totalInvestedAmount: 0,
        currentReturnAmount: 0,
        totalReturnAmount: 0,
        profitAmount: 0,
        formOfGold: "",
        purityOfGold: 0,
        goldWeight: 0,
        bankName: "",
        fdType: "",
        interestRate: 0,
        tenureInYears: 0,
      };
    }

    res.status(statusCode.OK).json({
      statusCode: statusCode.OK,
      message: message.highestGrowthinSector,
      data: highestGrowth,
    });
  } catch (error) {
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      statusCode: statusCode.INTERNAL_SERVER_ERROR,
      message: message.errorFetchingHighestGrowth,
    });
  }
};

// TOP GAINERS
const getTopGainers = async (req, res) => {
  const { startDate, endDate } = req.query;
  const dateFilters = getDateFilters(startDate, endDate);
  const userId = req.user.id;

  try {
    // Get top gainers from Fixed Deposits
    const topGainersFD = await FixedDepositModel.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          ...((startDate || endDate) && { createdAt: dateFilters }), // Apply date filters if dates are provided
        },
      },
      {
        $addFields: {
          profit: {
            $subtract: ["$currentReturnAmount", "$totalInvestedAmount"],
          },
        },
      },
      { $sort: { profit: -1 } },
      { $limit: 5 }, // Limit to top 5
      {
        $project: {
          investmentType: { $literal: "Fixed Deposit" },
          sector: { $literal: "Banking" },
          totalInvestedAmount: 1,
          currentReturnAmount: 1,
          profit: 1,
        },
      },
    ]);

    // Get top gainers from Gold
    const topGainersGold = await GoldModel.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          ...((startDate || endDate) && { createdAt: dateFilters }), // Apply date filters if dates are provided
        },
      },
      {
        $addFields: {
          profit: { $subtract: ["$totalReturnAmount", "$goldPurchasePrice"] },
        },
      },
      { $sort: { profit: -1 } },
      { $limit: 5 }, // Limit to top 5
      {
        $project: {
          investmentType: { $literal: "Gold" },
          sector: { $literal: "Gold" },
          totalInvestedAmount: "$goldPurchasePrice",
          currentReturnAmount: "$totalReturnAmount",
          profit: 1,
        },
      },
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
    res.status(statusCode.OK).json({
      statusCode: statusCode.OK,
      message: message.topGainers,
      data: topGainers,
    });

  } catch (error) {
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      statusCode: statusCode.INTERNAL_SERVER_ERROR,
      message: message.errorTopGainers,
    });
  }
};

// INVESTMENT IN SECTOR
const getInvestmentsBySector = async (req, res) => {
  const { sector } = req.params;
  const { startDate, endDate } = req.query;
  const dateFilters = getDateFilters(startDate, endDate);
  const userId = req.user.id;

  if (!sector) {
    return res.status(statusCode.BAD_REQUEST).json({
      statusCode: statusCode.BAD_REQUEST,
      message: message.sectorRequired,
    });
  }

  try {
    let investments = [];
    const query = { userId };

    // Only add date filters if they exist
    if (Object.keys(dateFilters).length > 0) {
      query.createdAt = dateFilters;
    }

    switch (sector.toLowerCase()) {
      case "banking":
        console.log("Fetching Banking Investments for User ID:", userId);
        investments = await FixedDepositModel.find(query).lean();
        break;
      case "gold":
        console.log("Fetching Gold Investments for User ID:", userId);
        investments = await GoldModel.find(query).lean();
        break;
      default:
        return res.status(statusCode.BAD_REQUEST).json({
          statusCode: statusCode.BAD_REQUEST,
          message: message.errorFetchingSector,
        });
    }

    // Map investments and ensure srNo starts from 1
    investments = investments.map((item, index) => {
      delete item.srNo; // Ensure there's no srNo in the original item
      const newItem = {
        srNo: index + 1, // srNo starts from 1
        sector: sector.charAt(0).toUpperCase() + sector.slice(1),
        ...item,
      };
      return newItem;
    });


    return res.status(statusCode.OK).json({
      statusCode: statusCode.OK,
      message: message.investmentBySector,
      data: investments,
    });
  } catch (error) {
    console.error("Error fetching investments:", error.message);
    return res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      statusCode: statusCode.INTERNAL_SERVER_ERROR,
      message: message.errorFetchingInvBySector,
    });
  }
};

// INVESTMENT IN SECTOR BY ID
const getInvestmentById = async (req, res) => {
  const { id } = req.params;
  const { startDate, endDate } = req.query;
  const dateFilters = getDateFilters(startDate, endDate);

  try {
    const investmentFD = await FixedDeposit.findOne({
      _id: id,
      userId: req.user.id,
      createdAt: dateFilters,
    });
    const investmentGold = await GoldModel.findOne({
      _id: id,
      userId: req.user.id,
      createdAt: dateFilters,
    });

    const investment = investmentFD || investmentGold;

    if (!investment) {
      return res.status(statusCode.NOT_FOUND).json({
        statusCode: statusCode.NOT_FOUND,
        message: message.errorFetchingInvestment,
      });
    }

    res.status(statusCode.OK).json({
      statusCode: statusCode.OK,
      message: message.investmentById,
      data: investment,
    });
  } catch (error) {
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      statusCode: statusCode.INTERNAL_SERVER_ERROR,
      message: message.errorFetchingInvestment,
      error: error.message,
    });
  }
};

//==================== COMMON DASHBOARD API ==========================
const getDashboardData = async (req, res) => {
  try {
  } catch (error) {
    console.log("getting error while get dashboard data", error);
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      statusCode: statusCode.INTERNAL_SERVER_ERROR,
      message: message.errorFetchingInvestment,
    });
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
