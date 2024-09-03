//fdcontroller.js

const FixedDepositModel = require("../models/fixedDeposit");
const mongoose = require("mongoose");
const moment = require("moment");
const FdAnalysisModel = require("../models/fdAnalysis");
const { statusCode, message } = require("../utils/api.response");
const {formatAmount} = require('../utils/formatAmount');
const {
  registerFdAggregation,
  updateFdAggregation,
} = require("../helpers/aggregationHelper");

const formatDate = (date) => {
  const d = new Date(date);
  let month = "" + (d.getMonth() + 1);
  let day = "" + d.getDate();
  const year = d.getFullYear();

  if (month.length < 2) month = "0" + month;
  if (day.length < 2) day = "0" + day;

  return [year, month, day].join("-");
};

function calculateTotalYears(startDate, maturityDate) {
  const start = new Date(startDate);
  const maturity = new Date(maturityDate);

  // Calculate the difference in full years
  let years = maturity.getFullYear() - start.getFullYear();

  // Calculate the difference in months and days
  let months = maturity.getMonth() - start.getMonth();
  let days = maturity.getDate() - start.getDate();

  // If the maturity date is before the anniversary in the current year, adjust the years
  if (months < 0 || (months === 0 && days < 0)) {
    years--;
  }

  // If the maturity date is on or after the anniversary date, it should count as a full year
  if (maturity >= start && maturity.getFullYear() === start.getFullYear() + years) {
    return `${years + 1}`;
  }

  return `${years}`;
}

const fixedDepositRegister = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      fdNo,
      fdType,
      bankName,
      branchName,
      interestRate,
      startDate,
      maturityDate,
      totalInvestedAmount,
    } = req.body;
    const userId = req.user.id;

    // Ensure the authenticated user is registering the FD for themselves
    if (String(req.user.id) !== String(userId)) {
      return res
        .status(statusCode.FORBIDDEN)
        .json({ statusCode: statusCode.FORBIDDEN, message: message.errorCreatingFD });
    }

    // Check if FD already exists
    const fdExists = await FixedDepositModel.findOne({ fdNo, userId });
    if (fdExists) {
      return res
        .status(statusCode.BAD_REQUEST)
        .json({ statusCode: statusCode.BAD_REQUEST, message: message.fdAlreadyExists });
    }

    const formattedStartDate = formatDate(startDate);
    const formattedMaturityDate = formatDate(maturityDate);

    // Create new FD with formatted dates
    const newFixedDeposit = new FixedDepositModel({
      firstName,
      lastName,
      fdNo,
      fdType,
      bankName,
      branchName,
      interestRate,
      startDate: formattedStartDate,
      maturityDate: formattedMaturityDate,
      totalInvestedAmount,
      userId,
    });

    // Save new FD
    await newFixedDeposit.save();

    // Aggregation pipeline for updating the FD with calculated fields
    const [updatedFd] = await FixedDepositModel.aggregate(
      registerFdAggregation(
        newFixedDeposit._id,
        startDate,
        maturityDate,
        totalInvestedAmount,
        interestRate
      )
    );

    if (!updatedFd) {
      console.error("Aggregation returned no documents");
      return res
        .status(statusCode.INTERNAL_SERVER_ERROR)
        .json({ statusCode: statusCode.INTERNAL_SERVER_ERROR, message: message.errorUpdatingFD });
    }

    // Calculate totalYears correctly
    const totalYears = calculateTotalYears(formattedStartDate, formattedMaturityDate);

    // Update the new FD with the calculated fields
    const updatedFdResult = await FixedDepositModel.findByIdAndUpdate(
      newFixedDeposit._id,
      {
        currentReturnAmount: updatedFd.currentReturnAmount || 0,
        totalReturnedAmount: updatedFd.totalReturnedAmount || 0,
        currentProfitAmount: updatedFd.currentProfitAmount || 0,
        tenureCompletedYears: updatedFd.tenureCompletedYears || 0,
        totalYears: totalYears,
      },
      { new: true } // Return the updated document
    );

    if (!updatedFdResult) {
      console.error("Failed to update FD details after aggregation");
      return res
        .status(statusCode.INTERNAL_SERVER_ERROR)
        .json({ statusCode: statusCode.INTERNAL_SERVER_ERROR, message: message.errorUpdatingFD });
    }

    // Format dates in the response
    const responseData = {
      ...updatedFdResult.toObject(),
      startDate: formatDate(updatedFdResult.startDate),
      maturityDate: formatDate(updatedFdResult.maturityDate),
    };

    // Send the response
    res.status(statusCode.CREATED).json({
      statusCode: statusCode.CREATED,
      message: message.fdCreated,
      data: responseData,
    });
  } catch (error) {
    console.error("Error registering FD:", error);
    res
      .status(statusCode.INTERNAL_SERVER_ERROR)
      .json({ statusCode: statusCode.INTERNAL_SERVER_ERROR, message: message.errorCreatingFD });
  }
};

const updateFixedDeposit = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const updateData = req.body;

    // Validate id
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(statusCode.BAD_REQUEST)
        .json({ statusCode: statusCode.BAD_REQUEST, message: message.errorUpdatingFD });
    }

    // Ensure the authenticated user is updating their own FD
    const fixedDeposit = await FixedDepositModel.findOne({
      _id: new mongoose.Types.ObjectId(id),
      userId: new mongoose.Types.ObjectId(userId),
    });
    if (!fixedDeposit) {
      return res
        .status(statusCode.NOT_FOUND)
        .json({ statusCode: statusCode.NOT_FOUND, message: message.errorFetchingFD });
    }

    // Update the fixed deposit document with new values
    const updatedFixedDeposit = await FixedDepositModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!updatedFixedDeposit) {
      return res
        .status(statusCode.INTERNAL_SERVER_ERROR)
        .json({ statusCode: statusCode.INTERNAL_SERVER_ERROR, message: message.errorUpdatingFD });
    }

    // Recalculate values using the updated details
    const [updatedFd] = await FixedDepositModel.aggregate(
      updateFdAggregation(
        new mongoose.Types.ObjectId(id),
        updatedFixedDeposit.startDate,
        updatedFixedDeposit.maturityDate,
        updatedFixedDeposit.totalInvestedAmount,
        updatedFixedDeposit.interestRate
      )
    );

    if (!updatedFd) {
      console.error("Aggregation returned no documents");
      return res
        .status(statusCode.INTERNAL_SERVER_ERROR)
        .json({ statusCode: statusCode.INTERNAL_SERVER_ERROR, message: message.errorUpdatingFD });
    }

    // Calculate totalYears correctly
    const totalYears = calculateTotalYears(
      updatedFixedDeposit.startDate,
      updatedFixedDeposit.maturityDate
    );

    // Update the FD with recalculated fields
    const updatedFdResult = await FixedDepositModel.findByIdAndUpdate(
      id,
      {
        currentReturnAmount: updatedFd.currentReturnAmount || 0,
        totalReturnedAmount: updatedFd.totalReturnedAmount || 0,
        currentProfitAmount: updatedFd.currentProfitAmount || 0,
        tenureCompletedYears: updatedFd.tenureCompletedYears || 0,
        totalYears: totalYears, // Use the calculated totalYears
      },
      { new: true }
    );

    if (!updatedFdResult) {
      console.error("Failed to update FD details after aggregation");
      return res
        .status(statusCode.INTERNAL_SERVER_ERROR)
        .json({ statusCode: statusCode.INTERNAL_SERVER_ERROR, message: message.errorUpdatingFD });
    }

    // Send the updated FD details as response
    res.status(statusCode.OK).json({
      statusCode : statusCode.OK,
      message: message.fdUpdated,
      data: updatedFdResult,
    });
  } catch (error) {
    console.error("Error updating FD:", error);
    res
      .status(statusCode.INTERNAL_SERVER_ERROR)
      .json({ statusCode: statusCode.INTERNAL_SERVER_ERROR, message: message.errorUpdatingFD });
  }
};

const fixedDepositDelete = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(statusCode.BAD_REQUEST).json({
        statusCode: statusCode.BAD_REQUEST,
        message: "Invalid FD ID format",
      });
    }

    const fixedDeposit = await FixedDepositModel.findOne({ _id: id, userId: req.user.id });
    if (!fixedDeposit) {
      return res.status(statusCode.NOT_FOUND).json({
        statusCode: statusCode.NOT_FOUND,
        message: "FD not found or not authorized to delete",
      });
    }

    await FixedDepositModel.findByIdAndDelete(id);
    await FdAnalysisModel.deleteOne({ fdId: id, userId: req.user.id });

    res.status(statusCode.OK).json({
      statusCode: statusCode.OK,
      message: "FD deleted successfully",
    });
  } catch (error) {
    console.error("Error while deleting Fixed Deposit:", error.message || error);
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      statusCode: statusCode.INTERNAL_SERVER_ERROR,
      message: "Error deleting FD",
      error: error.message || error,
    });
  }
};

const getFdDetails = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    let fdDetails;
    if (id) {
      fdDetails = await FixedDepositModel.findOne({ _id: id, userId }).lean();
      if (!fdDetails) {
        return res.status(statusCode.NOT_FOUND).json({
          statusCode: statusCode.NOT_FOUND,
          message: message.errorFetchingFD,
        });
      }
      fdDetails = [fdDetails];
    } else {
      fdDetails = await FixedDepositModel.find({ userId })
        .sort({ createdAt: 1 })
        .lean();
      if (!fdDetails.length) {
        return res.status(statusCode.OK).json({
          statusCode: statusCode.OK,
          message: message.errorFetchingFDs,
          data: fdDetails,
        });
      }
    }

    console.log("FD Details before formatting:", fdDetails);

    const formattedFdDetails = fdDetails.map((fd, index) => {
      const srNo = index + 1;
      console.log(`Index: ${index}, Assigned srNo: ${srNo}, FD ID: ${fd._id}`);

      fd.srNo = srNo;
      fd.createdAt = moment(fd.createdAt).format("YYYY-MM-DD");
      fd.updatedAt = moment(fd.updatedAt).format("YYYY-MM-DD");
      fd.maturityDate = moment(fd.maturityDate).format("YYYY-MM-DD");
      fd.startDate = moment(fd.startDate).format("YYYY-MM-DD");

      return fd;
    });

    console.log("FD Details after formatting:", formattedFdDetails);

    res.status(statusCode.OK).json({
      statusCode: statusCode.OK,
      message: message.fdsView,
      data: formattedFdDetails,
    });
  } catch (error) {
    console.error("Error while getting FD details:", error.message || error);
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      statusCode: statusCode.INTERNAL_SERVER_ERROR,
      message: message.errorFetchingFDs,
      error: error.message || error,
    });
  }
};

const deleteMultipleFDs = async (req, res) => {
  try {
    const { ids } = req.body; // Array of FD IDs to delete
    const userId = req.user.id;

    // Validate that the provided IDs are valid MongoDB ObjectIDs
    if (!Array.isArray(ids) || ids.some((id) => !mongoose.Types.ObjectId.isValid(id))) {
      return res.status(statusCode.BAD_REQUEST).json({
        statusCode: statusCode.BAD_REQUEST,
        message: "Invalid FD ID format in the provided list",
      });
    }

    // Check if the FDs exist and belong to the authenticated user
    const fdsToDelete = await FixedDepositModel.find({
      _id: { $in: ids },
      userId,
    });

    if (fdsToDelete.length !== ids.length) {
      return res.status(statusCode.NOT_FOUND).json({
        statusCode: statusCode.NOT_FOUND,
        message: "Some FDs not found or not authorized to delete",
      });
    }

    // Delete the FDs
    await FixedDepositModel.deleteMany({ _id: { $in: ids }, userId });
    await FdAnalysisModel.deleteMany({ fdId: { $in: ids }, userId });

    res.status(statusCode.OK).json({
      statusCode: statusCode.OK,
      message: "FDs deleted successfully",
    });
  } catch (error) {
    console.error("Error while deleting multiple FDs:", error.message || error);
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      statusCode: statusCode.INTERNAL_SERVER_ERROR,
      message: "Error deleting FDs",
      error: error.message || error,
    });
  }
};

const getFdAnalysisbyNumber = async (req, res) => {
  try {
      const userId = req.user.id;

      const fdAnalysis = await FixedDepositModel.aggregate([
          { $match: { userId: new mongoose.Types.ObjectId(userId) } },
          {
              $addFields: {
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
                  // Simple Interest Calculation for Maturity Amount
                  totalReturnedAmount: {
                      $trunc: {
                          $add: [
                              "$totalInvestedAmount",
                              { 
                                  $multiply: [
                                      "$totalInvestedAmount", 
                                      { $multiply: ["$interestRate", "$tenureInYears", 0.01] }
                                  ]
                              }
                          ]
                      }
                  },
                  currentReturnAmount: {
                      $trunc: {
                          $add: [
                              "$totalInvestedAmount",
                              { 
                                  $multiply: [
                                      "$totalInvestedAmount", 
                                      { $multiply: ["$interestRate", "$tenureCompletedYears", 0.01] }
                                  ]
                              }
                          ]
                      }
                  }
              }
          },
          {
              $group: {
                  _id: null,
                  totalInvestedAmountOfFds: { $sum: "$totalInvestedAmount" },
                  currentReturnAmountOfFds: { $sum: "$currentReturnAmount" },
                  totalReturnAmountofFds: { $sum: "$totalReturnedAmount" }
              }
          },
          {
              $addFields: {
                  totalProfitGainedOfFds: {
                      $trunc: {
                          $subtract: ["$currentReturnAmountOfFds", "$totalInvestedAmountOfFds"]
                      }
                  }
              }
          }
      ]);

      if (!fdAnalysis || fdAnalysis.length === 0) {
          return res.status(statusCode.OK).json({ statusCode: statusCode.OK, message: message.errorFetchingFD });
      }

      const rawData = {
          totalInvestedAmountOfFds: Math.round(fdAnalysis[0].totalInvestedAmountOfFds),
          currentReturnAmountOfFds: Math.round(fdAnalysis[0].currentReturnAmountOfFds),
          totalReturnAmountofFds: Math.round(fdAnalysis[0].totalReturnAmountofFds),
          totalProfitGainedOfFds: Math.round(fdAnalysis[0].totalProfitGainedOfFds),
          userId: new mongoose.Types.ObjectId(userId)
      };

      const formattedData = {
          totalInvestedAmountOfFds: formatAmount(rawData.totalInvestedAmountOfFds),
          currentReturnAmountOfFds: formatAmount(rawData.currentReturnAmountOfFds),
          totalReturnAmountofFds: formatAmount(rawData.totalReturnAmountofFds),
          totalProfitGainedOfFds: formatAmount(rawData.totalProfitGainedOfFds),
          userId: rawData.userId
      };

      res.status(statusCode.OK).json({ statusCode: statusCode.OK, message: message.analysisReportofFd, data: rawData });
  } catch (error) {
      res.status(statusCode.INTERNAL_SERVER_ERROR).json({ statusCode: statusCode.INTERNAL_SERVER_ERROR, message: message.errorFdAnalytics, error: error.message });
  }
};

module.exports = {
  fixedDepositRegister,
  updateFixedDeposit,
  fixedDepositDelete,
  getFdDetails,
  deleteMultipleFDs,
  getFdAnalysisbyNumber
};
