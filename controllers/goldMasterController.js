const GoldMasterModel = require("../models/goldMaster");

const { statusCode, message } = require("../utils/api.response");

// Create a new gold information
const goldMasterInfoRegister = async (req, res) => {
  try {
    const { goldRate22KPerGram, goldRate24KPerGram, gst, makingChargesPerGram } = req.body;

    const masterGoldInfoExists = await GoldMasterModel.findOne({
      goldRate22KPerGram, 
      goldRate24KPerGram, 
      gst,
      makingChargesPerGram
    });

    if (masterGoldInfoExists) {
      return res
        .status(statusCode.BAD_REQUEST)
        .json({ message: message.goldExists });
    }

    const newGoldMasterInfo = new GoldMasterModel({ 
      goldRate22KPerGram, 
      goldRate24KPerGram, 
      gst,
      makingChargesPerGram
    });

    const saveGoldMasterInfo = await newGoldMasterInfo.save();

    return res.status(statusCode.CREATED).json({
      message: message.goldInfoRegister,
      data: saveGoldMasterInfo,
    });
  } catch (error) {
    console.error("Error while creating gold information:", error);
    return res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      message: message.goldRegisterError,
      error: error.message,
    });
  }
};


// Update gold information
const updateGoldMasterInfo = async (req, res) => {
  try {
    const { goldId } = req.params; 
    const { goldRate22KPerGram, goldRate24KPerGram, gst, makingChargesPerGram } = req.body;

    const updateGoldInfo = await GoldMasterModel.findByIdAndUpdate(
      goldId,
      { goldRate22KPerGram, goldRate24KPerGram, gst, makingChargesPerGram },
      { new: true }
    );

    if (!updateGoldInfo) {
      return res
        .status(statusCode.NOT_FOUND)
        .json({ message: message.errorFetchingGoldInfo });
    }

    return res.status(statusCode.OK).json({
      message: message.goldInfoUpdate,
      data: updateGoldInfo,
    });
  } catch (error) {
    console.error('Error while updating gold information:', error);
    return res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      message: message.errorUpdatingGoldInfo,
      error: error.message,
    });
  }
};

// Delete gold information
const deleteGoldMasterInfo = async (req, res) => {
  try {
    const { goldId } = req.params;

    const deleteGoldMasterInfo = await GoldMasterModel.findByIdAndDelete(goldId);

    if (!deleteGoldMasterInfo) {
      return res
        .status(statusCode.NOT_FOUND)
        .json({ message: message.errorFetchingGoldInfo });
    }

    return res.status(statusCode.OK).json({ message: message.goldInfoDelete });
  } catch (error) {
    console.error("Error while deleting gold information:", error);
    return res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      message: message.errorDeletingGoldInfo,
      error: error.message,
    });
  }
};

// Get gold master information
const getGoldMasterInfo = async (req, res) => {
  try {
    const goldMasterInformation = await GoldMasterModel.find();

    // Add srNo to each gold master record
    const goldMasterWithSrNo = goldMasterInformation.map((record, index) => ({
      srNo: index + 1, // Adding srNo starting from 1
      ...record.toObject(), // Spread the existing properties of the record
    }));

    return res.status(statusCode.OK).json({ data: goldMasterWithSrNo });
  } catch (error) {
    console.error('Error while fetching gold master information:', error);
    return res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      message: message.errorFetchingGoldInfo,
      error: error.message,
    });
  }
};

module.exports = {
  goldMasterInfoRegister, 
  updateGoldMasterInfo, 
  deleteGoldMasterInfo, 
  getGoldMasterInfo,
};
