//fdcontroller.js

const FixedDepositModel = require("../models/fixedDeposit");
const mongoose = require("mongoose");
const moment = require("moment");
const FdAnalysisModel = require("../models/fdAnalysis");
const { statusCode, message } = require("../utils/api.response");
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
        .json({ message: message.errorCreatingFD });
    }

    // Check if FD already exists
    const fdExists = await FixedDepositModel.findOne({ fdNo, userId });
    if (fdExists) {
      return res
        .status(statusCode.BAD_REQUEST)
        .json({ message: message.fdExists });
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
        .json({ message: message.errorUpdatingFD });
    }

    // Update the new FD with the calculated fields
    const updatedFdResult = await FixedDepositModel.findByIdAndUpdate(
      newFixedDeposit._id,
      {
        currentReturnAmount: updatedFd.currentReturnAmount || 0,
        totalReturnedAmount: updatedFd.totalReturnedAmount || 0,
        currentProfitAmount: updatedFd.currentProfitAmount || 0,
        tenureCompletedYears: updatedFd.tenureCompletedYears || 0,
        totalYears: updatedFd.totalYears || 0,
      },
      { new: true } // Return the updated document
    );

    if (!updatedFdResult) {
      console.error("Failed to update FD details after aggregation");
      return res
        .status(statusCode.INTERNAL_SERVER_ERROR)
        .json({ message: message.errorUpdatingFD });
    }

    // Format dates in the response
    const responseData = {
      ...updatedFdResult.toObject(),
      startDate: formatDate(updatedFdResult.startDate),
      maturityDate: formatDate(updatedFdResult.maturityDate),
    };

    // Send the response
    res.status(statusCode.CREATED).json({
      message: message.fdCreated,
      data: responseData,
    });
  } catch (error) {
    console.error("Error registering FD:", error);
    res
      .status(statusCode.INTERNAL_SERVER_ERROR)
      .json({ message: message.errorCreatingFD });
  }
};

const updateFixedDeposit = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { ...updateData } = req.body;

    // Validate fdId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(statusCode.BAD_REQUEST)
        .json({ message: message.errorUpdatingFD });
    }

    // Ensure the authenticated user is updating their own FD
    const fixedDeposit = await FixedDepositModel.findOne({
      _id: new mongoose.Types.ObjectId(id),
      userId: new mongoose.Types.ObjectId(userId),
    });
    if (!fixedDeposit) {
      return res
        .status(statusCode.NOT_FOUND)
        .json({ message: message.errorFetchingFD });
    }

    // Update the fixed deposit document with new values (e.g., totalInvestedAmount)
    const updatedFixedDeposit = await FixedDepositModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!updatedFixedDeposit) {
      return res
        .status(statusCode.INTERNAL_SERVER_ERROR)
        .json({ message: message.errorUpdatingFD });
    }

    // Recalculate values using the updated `totalInvestedAmount`
    const [updatedFd] = await FixedDepositModel.aggregate(
      updateFdAggregation(
        new mongoose.Types.ObjectId(id),
        updatedFixedDeposit.startDate,
        updatedFixedDeposit.maturityDate,
        updatedFixedDeposit.totalInvestedAmount, // Use the updated totalInvestedAmount
        updatedFixedDeposit.interestRate
      )
    );

    if (!updatedFd) {
      console.error("Aggregation returned no documents");
      return res
        .status(statusCode.INTERNAL_SERVER_ERROR)
        .json({ message: message.errorUpdatingFD });
    }

    // Update the FD with recalculated fields
    const updatedFdResult = await FixedDepositModel.findByIdAndUpdate(
      id,
      {
        currentReturnAmount: updatedFd.currentReturnAmount || 0,
        totalReturnedAmount: updatedFd.totalReturnedAmount || 0,
        currentProfitAmount: updatedFd.currentProfitAmount || 0,
        tenureCompletedYears: updatedFd.tenureCompletedYears || 0,
        totalYears: updatedFd.totalYears || 0,
      },
      { new: true }
    );

    if (!updatedFdResult) {
      console.error("Failed to update FD details after aggregation");
      return res
        .status(statusCode.INTERNAL_SERVER_ERROR)
        .json({ message: message.errorUpdatingFD });
    }

    // Send the updated FD details as response
    res.status(statusCode.OK).json({
      message: message.fdUpdated,
      data: updatedFdResult,
    });
  } catch (error) {
    console.error("Error updating FD:", error);
    res
      .status(statusCode.INTERNAL_SERVER_ERROR)
      .json({ message: message.errorUpdatingFD });
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
      message: message.fdDetailsFetched,
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

module.exports = {
  fixedDepositRegister,
  updateFixedDeposit,
  fixedDepositDelete,
  getFdDetails,
};
