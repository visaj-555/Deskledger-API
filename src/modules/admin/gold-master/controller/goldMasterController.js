const GoldMasterModel = require("../model/goldMaster");
const { statusCode, message } = require("../../../../utils/api.response");

// Create a new gold information
const goldMasterInfoRegister = async (req, res) => {
  try {
    const { goldRate22KPerGram, goldRate24KPerGram } = req.body;

    // Check if any gold master record exists
    const masterGoldInfoExists = await GoldMasterModel.findOne();

    if (masterGoldInfoExists) {
      return res
        .status(statusCode.BAD_REQUEST)
        .json({ statusCode: statusCode.CONFLICT, message: message.goldExists });
    }

    const newGoldMasterInfo = new GoldMasterModel({
      goldRate22KPerGram,
      goldRate24KPerGram,
    });

    const saveGoldMasterInfo = await newGoldMasterInfo.save();

    return res.status(statusCode.CREATED).json({
      statusCode: statusCode.CREATED,
      message: message.goldInfoRegister,
      data: saveGoldMasterInfo,
    });
  } catch (error) {
    console.error("Error while creating gold information:", error);
    return res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      statusCode: statusCode.INTERNAL_SERVER_ERROR,
      message: message.goldRegisterError,
      error: error.message,
    });
  }
};

// Update gold information
const updateGoldMasterInfo = async (req, res) => {
  try {
    const { id } = req.params; // Using 'id' from req.params
    const { goldRate22KPerGram, goldRate24KPerGram } = req.body;

    const updateGoldInfo = await GoldMasterModel.findByIdAndUpdate(
      id, // Using 'id' here
      { goldRate22KPerGram, goldRate24KPerGram },
      { new: true }
    );

    if (!updateGoldInfo) {
      console.error("No record found with id:", id); // Debug log
      return res
        .status(statusCode.NOT_FOUND)
        .json({
          statusCode: statusCode.NOT_FOUND,
          message: message.errorFetchingGoldInfo,
        });
    }

    return res.status(statusCode.OK).json({
      statusCode: statusCode.OK,
      message: message.goldInfoUpdate,
      data: updateGoldInfo,
    });
  } catch (error) {
    console.error("Error while updating gold information:", error);
    return res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      statusCode: statusCode.INTERNAL_SERVER_ERROR,
      message: message.errorUpdatingGoldInfo,
      error: error.message,
    });
  }
};

// Delete gold information
const deleteGoldMasterInfo = async (req, res) => {
  try {
    const { id } = req.params;

    const deleteGoldMasterInfo = await GoldMasterModel.findByIdAndDelete(id);

    if (!deleteGoldMasterInfo) {
      return res
        .status(statusCode.NOT_FOUND)
        .json({
          statusCode: statusCode.NOT_FOUND,
          message: message.errorFetchingGoldInfo,
        });
    }

    return res
      .status(statusCode.OK)
      .json({ statusCode: statusCode.OK, message: message.goldInfoDelete });
  } catch (error) {
    console.error("Error while deleting gold information:", error);
    return res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      statusCode: statusCode.INTERNAL_SERVER_ERROR,
      message: message.errorDeletingGoldInfo,
      error: error.message,
    });
  }
};

// Get gold master information
const getGoldMasterInfo = async (req, res) => {
  try {
    const goldMasterInformation = await GoldMasterModel.find();

    const goldMasterWithSrNo = goldMasterInformation.map((record, index) => ({
      srNo: index + 1,
      ...record.toObject(),
    }));

    return res
      .status(statusCode.OK)
      .json({ statusCode: statusCode.OK, data: goldMasterWithSrNo });
  } catch (error) {
    console.error("Error while fetching gold master information:", error);
    return res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      statusCode: statusCode.INTERNAL_SERVER_ERROR,
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
