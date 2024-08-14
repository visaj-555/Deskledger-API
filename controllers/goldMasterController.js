const GoldModel = require("../models/goldModel");
const { statusCode, message } = require("../utils/api.response");

// Create a new gold information
const goldMasterInfoRegister = async (req, res) => {
  try {
    const { goldCurrentPricePerGram, gst, makingChargesPerGram } = req.body;

    const masterGoldInfoExists = await GoldModel.findOne({ goldCurrentPricePerGram, gst, makingChargesPerGram });
    if (!masterGoldInfoExists) {
      return res
        .status(statusCode.BAD_REQUEST)
        .json({ message: message.goldExists });
    }

    console.log("Gold Current Price Per Gram:", goldCurrentPricePerGram); 
    console.log("GST:", gst);
    console.log("Making Charges Per Gram:", makingChargesPerGram);

    const newGoldMasterInfo = new GoldModel({ goldCurrentPricePerGram, gst, makingChargesPerGram });
    const saveGoldMasterInfo = await newGoldMasterInfo.save();

    res.status(statusCode.CREATED).json({
      message: message.goldInfoRegister,
      data: saveGoldMasterInfo
    });
  } catch (error) {
    console.error("Error while creating gold information:", error);
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      message: message.goldRegisterError,
    });
  }
};

// Update gold information
const updateGoldMasterInfo = async (req, res) => {
  try {
    const { goldId } = req.params; 
    const { goldCurrentPricePerGram, gst, makingChargesPerGram } = req.body;

    const updateGoldInfo = await GoldModel.findByIdAndUpdate(
      goldId,
      { goldCurrentPricePerGram, gst, makingChargesPerGram },
      { new: true }
    );

    if (!updateGoldInfo) {
      return res.status(statusCode.NOT_FOUND).json({ message: message.errorFetchingGold });
    }

    res.status(statusCode.OK).json({
      message: message.goldInfoUpdate,
      data: updateGoldInfo,
    });
  } catch (error) {
    console.error('Error while updating Gold Information:', error);
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      message: message.errorUpdatingGoldInfo,
    });
  }
};

// Delete gold information
const deleteGoldMasterInfo = async (req, res) => {
  try {
    const { goldId } = req.params; // Corrected destructuring of `id` from params

    const deleteGoldMasterInfo = await GoldModel.findByIdAndDelete(goldId);

    if (!deleteGoldMasterInfo) {
      return res.status(statusCode.NOT_FOUND).json({ message: message.errorFetchingGoldInfo });
    }

    res.status(statusCode.OK).json({ message: message.goldInfoDelete });
  } catch (error) {
    console.error("Error while deleting gold information:", error);
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      message: message.errorDeletingGoldInfo,
      error: error.message,
    });
  }
};

// Get gold master information
const getGoldMasterInfo = async (req, res) => {
  try {
    const goldMasterInformation = await GoldModel.find();
    res.status(statusCode.OK).json({ data: goldMasterInformation });
  } catch (error) {
    console.error('Error while fetching gold master information:', error);
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      message: message.errorFetchingGoldInfo,
    });
  }
};

module.exports = {
  goldMasterInfoRegister, 
  updateGoldMasterInfo, 
  deleteGoldMasterInfo, 
  getGoldMasterInfo
};
