const GoldModel = require("../model/goldModel");
const GoldMasterModel = require("../../admin/gold-master/model/goldMaster");
const GoldAnalysisModel = require("../model/goldAnalysis");
const { statusCode, message } = require("../../../utils/api.response");
const mongoose = require("mongoose");

exports.updateGoldData = async () => {
  try {
    const goldMaster = await GoldMasterModel.findOne();
    if (!goldMaster) {
      console.error("GoldMaster data not found");
      return;
    }

    const goldRate22KPerGram = goldMaster.goldRate22KPerGram;
    const goldRate24KPerGram = goldMaster.goldRate24KPerGram;

    if (isNaN(goldRate22KPerGram) || isNaN(goldRate24KPerGram)) {
      console.error("Invalid GoldMaster data. Exiting...");
      return;
    }

    const goldinfo = await GoldModel.find();

    for (const gold of goldinfo) {
      const { goldWeight, goldPurchasePrice, purityOfGold } = gold;

      // Validate if the necessary fields from each gold record are numbers
      if (
        isNaN(goldWeight) ||
        isNaN(goldPurchasePrice) ||
        isNaN(purityOfGold)
      ) {
        console.error(
          `Invalid data for gold record ID ${gold._id}. Skipping...`
        );
        continue;
      }

      // Determine the correct rate per gram based on the purity of gold
      const currentGoldPricePerGram =
        purityOfGold === 24 ? goldRate24KPerGram : goldRate22KPerGram;

      // Calculate the current return amount (finalGoldPrice) based on the gold weight and rate
      const totalReturnAmount = Math.round(
        currentGoldPricePerGram * goldWeight
      );

      // Calculate the profit (difference between current gold price and purchase price)
      const profit = Math.round(totalReturnAmount - goldPurchasePrice);

      // Update the gold record with the calculated values
      gold.totalReturnAmount = totalReturnAmount;
      gold.profit = profit;

      // Save the updated record
      await gold.save();
    }
  } catch (error) {
    console.error("Error while updating gold data:", error);
  }
};

// Create a new gold record
exports.createGoldRecord = async (req, res) => {
  try {
    const userId = req.user.id; // Get the user ID from the authenticated request

    const {
      firstName,
      lastName,
      goldWeight,
      goldPurchasePrice,
      formOfGold,
      purityOfGold,
    } = req.body;

    // Fetch the latest gold master data
    const goldMaster = await GoldMasterModel.findOne().sort({ createdAt: -1 });

    if (!goldMaster) {
      return res.status(statusCode.BAD_REQUEST).json({
        statusCode: statusCode.BAD_REQUEST,
        message: message.goldMasterNotFound,
      });
    }

    // Check if the gold information already exists for this user
    const existingGoldRecord = await GoldModel.findOne({
      firstName,
      lastName,
      goldWeight,
      goldPurchasePrice,
      formOfGold,
      purityOfGold,
      userId,
    });

    if (existingGoldRecord) {
      return res.status(statusCode.CONFLICT).json({
        statusCode: statusCode.CONFLICT,
        message: "Gold information already exists",
      });
    }

    const { goldRate22KPerGram, goldRate24KPerGram } = goldMaster;

    const goldCurrentPricePerGram =
      purityOfGold === 22 ? goldRate22KPerGram : goldRate24KPerGram;

    const goldCurrentValue = goldCurrentPricePerGram * goldWeight;
    let totalReturnAmount = Math.round(goldCurrentValue);
    let profit = Math.round(totalReturnAmount - goldPurchasePrice);

    // Create a new gold record
    const newGoldRecord = new GoldModel({
      firstName,
      lastName,
      goldWeight,
      goldPurchasePrice,
      formOfGold,
      purityOfGold,
      totalReturnAmount,
      profit,
      userId, // Associate the gold record with the authenticated user
    });

    // Save the new record to the database
    const saveGoldInfo = await newGoldRecord.save();

    return res.status(statusCode.CREATED).json({
      statusCode: statusCode.CREATED,
      message: message.goldInfoRegister,
      data: saveGoldInfo,
    });
  } catch (error) {
    console.error(error);
    return res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      statusCode: statusCode.INTERNAL_SERVER_ERROR,
      message: message.errorCreatingGoldInfo,
    });
  }
};
// Update existing gold record
exports.updateGoldRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      firstName,
      lastName,
      goldWeight,
      goldPurchasePrice,
      formOfGold,
      purityOfGold,
    } = req.body;
    const userId = req.user.id;

    let goldCurrentPricePerGram, totalReturnAmount, profit;

    // Fetch the existing gold record to get existing values if not provided in the request
    const existingGoldRecord = await GoldModel.findOne({ _id: id, userId });

    if (!existingGoldRecord) {
      return res.status(statusCode.NOT_FOUND).json({
        statusCode: statusCode.NOT_FOUND,
        message: message.goldNotFound,
      });
    }

    // Use existing values if not provided in the request body
    const updatedGoldWeight = goldWeight || existingGoldRecord.goldWeight;
    const updatedGoldPurchasePrice =
      goldPurchasePrice || existingGoldRecord.goldPurchasePrice;
    const updatedPurityOfGold = purityOfGold || existingGoldRecord.purityOfGold;

    // Fetch the latest gold master data if purityOfGold or calculations are needed
    if (updatedPurityOfGold) {
      const goldMaster = await GoldMasterModel.findOne().sort({
        createdAt: -1,
      });

      if (!goldMaster) {
        return res.status(statusCode.BAD_REQUEST).json({
          statusCode: statusCode.BAD_REQUEST,
          message: message.errorFetchingGoldMaster,
        });
      }

      const { goldRate22KPerGram, goldRate24KPerGram } = goldMaster;

      // Validate purityOfGold
      if (![22, 24].includes(updatedPurityOfGold)) {
        return res.status(statusCode.BAD_REQUEST).json({
          statusCode: statusCode.BAD_REQUEST,
          message: message.errorUpdatingGoldInfo,
        });
      }

      goldCurrentPricePerGram =
        updatedPurityOfGold === 22 ? goldRate22KPerGram : goldRate24KPerGram;

      // Perform calculations if necessary values are available
      if (updatedGoldWeight && updatedGoldPurchasePrice) {
        const goldCurrentValue = goldCurrentPricePerGram * updatedGoldWeight;
        totalReturnAmount = Math.round(goldCurrentValue);
        profit = Math.round(totalReturnAmount - updatedGoldPurchasePrice);
      }
    }

    // Update the gold record, ensuring it belongs to the authenticated user
    const updatedGoldRecord = await GoldModel.findOneAndUpdate(
      { _id: id, userId },
      {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(goldWeight && { goldWeight: updatedGoldWeight }),
        ...(goldPurchasePrice && {
          goldPurchasePrice: updatedGoldPurchasePrice,
        }),
        ...(formOfGold && { formOfGold }),
        ...(purityOfGold && { purityOfGold: updatedPurityOfGold }),
        ...(totalReturnAmount && { totalReturnAmount }),
        ...(profit && { profit }),
      },
      { new: true }
    );

    if (!updatedGoldRecord) {
      return res.status(statusCode.NOT_FOUND).json({
        statusCode: statusCode.NOT_FOUND,
        message: message.goldNotFound,
      });
    }

    return res.status(statusCode.OK).json({
      statusCode: statusCode.OK,
      message: message.goldInfoUpdate,
      data: updatedGoldRecord,
    });
  } catch (error) {
    console.error("Error updating gold record:", error);
    return res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      statusCode: statusCode.INTERNAL_SERVER_ERROR,
      message: message.errorUpdatingGoldInfo,
    });
  }
};

// Delete a gold record
exports.deleteGoldRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id; // Get the user ID from the authenticated request

    // Ensure the gold record belongs to the authenticated user
    const deletedGoldRecord = await GoldModel.findOneAndDelete({
      _id: id,
      userId,
    });

    if (!deletedGoldRecord) {
      return res.status(statusCode.NOT_FOUND).json({
        statusCode: statusCode.NOT_FOUND,
        message: message.goldNotFound,
      });
    }

    return res
      .status(statusCode.OK)
      .json({ statusCode: statusCode.OK, message: message.goldInfoDelete });
  } catch (error) {
    console.error(error);
    return res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      statusCode: statusCode.INTERNAL_SERVER_ERROR,
      message: message.errorDeletingGoldInfo,
    });
  }
};

// Delete multiple gold records
exports.deleteMultipleGoldRecords = async (req, res) => {
  try {
    const { ids } = req.body; // Expecting an array of IDs to delete
    const userId = req.user.id; // Get the user ID from the authenticated request

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(statusCode.BAD_REQUEST).json({
        statusCode: statusCode.BAD_REQUEST,
        message: message.invalidIds,
      });
    }

    // Ensure that the gold records belong to the authenticated user
    const result = await GoldModel.deleteMany({ _id: { $in: ids }, userId });

    if (result.deletedCount === 0) {
      return res.status(statusCode.NOT_FOUND).json({
        statusCode: statusCode.NOT_FOUND,
        message: message.goldNotFound,
      });
    }

    return res.status(statusCode.OK).json({
      statusCode: statusCode.OK,
      message: `${result.deletedCount} gold records have been successfully deleted.`,
    });
  } catch (error) {
    console.error("Error deleting multiple gold records:", error);
    return res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      statusCode: statusCode.INTERNAL_SERVER_ERROR,
      message: message.errorDeletingGoldInfo,
    });
  }
};

// gold Analysis
exports.getGoldAnalysis = async (req, res) => {
  try {
    const userId = req.user.id;

    const goldAnalysis = await GoldModel.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $addFields: {
          totalInvestedAmount: "$goldPurchasePrice",
          currentReturnAmount: "$totalReturnAmount",
          profit: "$profit",
        },
      },
      {
        $group: {
          _id: null,
          totalInvestedAmountOfGold: { $sum: "$totalInvestedAmount" },
          currentReturnAmountOfGold: { $sum: "$currentReturnAmount" },
          totalProfitGainedOfGold: { $sum: "$profit" },
        },
      },
    ]);

    if (!goldAnalysis || goldAnalysis.length === 0) {
      return res.status(statusCode.NO_CONTENT).json({
        statusCode: statusCode.NO_CONTENT,
        message: message.goldNotFetch,
      });
    }

    const analysisData = {
      totalInvestedAmountOfGold: Math.round(
        goldAnalysis[0].totalInvestedAmountOfGold
      ),
      currentReturnAmountOfGold: Math.round(
        goldAnalysis[0].currentReturnAmountOfGold
      ),
      totalProfitGainedOfGold: Math.round(
        goldAnalysis[0].totalProfitGainedOfGold
      ),
      userId: new mongoose.Types.ObjectId(userId),
    };

    const filter = { userId: new mongoose.Types.ObjectId(userId) };
    const update = { $set: analysisData };
    const options = { upsert: true, new: true };
    const updatedGoldAnalysis = await GoldAnalysisModel.findOneAndUpdate(
      filter,
      update,
      options
    );

    res.status(statusCode.OK).json({
      statusCode: statusCode.OK,
      message: message.analysisReportofGold,
      data: analysisData,
    });
  } catch (error) {
    console.error("Error calculating Gold analytics:", error);
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      statusCode: statusCode.INTERNAL_SERVER_ERROR,
      message: message.errorGoldAnalytics,
      error: error.message,
    });
  }
};

// Get all gold records or a single gold record by ID for the authenticated user
exports.getAllGoldRecords = async (req, res) => {
  try {
    const userId = req.user.id; // Get the user ID from the authenticated request
    const { id } = req.params; // Get the ID from the request params if it exists

    // If an ID is provided, fetch the specific record by ID
    if (id) {
      const goldRecord = await GoldModel.findOne({ _id: id, userId }); // Ensure the record belongs to the user

      if (!goldRecord) {
        return res.status(statusCode.NOT_FOUND).json({
          statusCode: statusCode.NOT_FOUND,
          message: message.goldNotFound,
        });
      }

      return res.status(statusCode.OK).json({
        statusCode: statusCode.OK,
        message: message.goldRecordFetched, // Message for fetching a single record
        data: goldRecord,
      });
    }

    // If no ID is provided, fetch all records for the authenticated user
    const goldRecords = await GoldModel.find({ userId }); // Fetch all records for this user

    // Add srNo to each record
    const goldRecordsWithSrNo = goldRecords.map((record, index) => {
      const recordObj = record.toObject(); // Convert Mongoose document to plain object
      return {
        ...recordObj,
        srNo: index + 1, // Add srNo starting from 1
      };
    });

    return res.status(statusCode.OK).json({
      statusCode: statusCode.OK,
      message: message.goldRecordsFetched, // Message for fetching all records
      data: goldRecordsWithSrNo,
    });
  } catch (error) {
    console.error(error);
    return res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      statusCode: statusCode.INTERNAL_SERVER_ERROR,
      message: message.errorFetchingGoldRecords,
    });
  }
};
