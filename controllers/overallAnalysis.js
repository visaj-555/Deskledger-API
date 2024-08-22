const mongoose = require("mongoose");
const FixedDepositModel = require("../models/fixedDeposit");
const GoldModel = require("../models/goldModel");
const { statusCode, message } = require("../utils/api.response");
const { formatAmount } = require("../utils/formatAmount"); // Assuming formatAmount is in a separate utils file

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
      profitAmount: formatAmount(profitAmount),
    };

    res.status(statusCode.OK).json({
      message: message.overAllAnalysis,
      data: overallAnalysis,
    });
  } catch (error) {
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      message: message.errorOverAllAnalysis,
      error: error.message,
    });
  }
};

module.exports = {
  getOverallAnalysis,
};
