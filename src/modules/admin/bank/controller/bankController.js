const BankModel = require("../model/bank");
const { statusCode, message } = require("../../../../utils/api.response");

// Create a new bank
const createBank = async (req, res) => {
  try {
    const { bankName } = req.body;

    const bankExists = await BankModel.findOne({ bankName });
    if (bankExists) {
      return res.status(statusCode.CONFLICT).json({
        statusCode: statusCode.CONFLICT,
        message: message.bankAlreadyExists,
      });
    }

    const newBank = new BankModel({ bankName });
    const savedBank = await newBank.save();

    res.status(statusCode.CREATED).json({
      statusCode: statusCode.CREATED,
      message: message.bankCreated,
      data: savedBank,
    });
  } catch (error) {
    console.error("Error while adding bank", error);
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      statusCode: statusCode.INTERNAL_SERVER_ERROR,
      message: message.errorCreatingBank,
    });
  }
};
// Update a bank
const updateBank = async (req, res) => {
  try {
    const { id } = req.params;
    const { bankName } = req.body;

    const updatedBank = await BankModel.findByIdAndUpdate(
      id,
      { bankName },
      { new: true }
    );

    if (!updatedBank) {
      return res.status(statusCode.NOT_FOUND).json({
        statusCode: statusCode.NOT_FOUND,
        message: message.errorFetchingBank,
      });
    }

    res.status(statusCode.OK).json({
      statusCode: statusCode.OK,
      message: message.bankUpdated,
      data: updatedBank,
    });
  } catch (error) {
    console.error("Error while updating bank", error);
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      statusCode: statusCode.INTERNAL_SERVER_ERROR,
      message: message.errorUpdatingBank,
    });
  }
};
// Delete a bank
const deleteBank = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedBank = await BankModel.findByIdAndDelete(id);

    if (!deletedBank) {
      return res.status(statusCode.NOT_FOUND).json({
        statusCode: statusCode.NOT_FOUND,
        message: message.errorFetchingBank,
      });
    }

    res
      .status(statusCode.OK)
      .json({ statusCode: statusCode.OK, message: message.bankDeleted });
  } catch (error) {
    console.error("Error while deleting bank");
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      statusCode: statusCode.INTERNAL_SERVER_ERROR,
      message: message.errorDeletingBank,
    });
  }
};
// Get banks
const getBanks = async (req, res) => {
  try {
    const banks = await BankModel.find();

    // Add srNo to each bank, starting from 1
    const banksWithSrNo = banks.map((bank, index) => ({
      srNo: index + 1,
      ...bank.toObject(), // Convert the Mongoose document to a plain JavaScript object
    }));

    res.status(statusCode.OK).json({
      statusCode: statusCode.OK,
      message: message.banksView,
      data: banksWithSrNo,
    });
  } catch (error) {
    console.error("Error while fetching banks:", error);
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      statusCode: statusCode.INTERNAL_SERVER_ERROR,
      message: message.errorFetchingBanks,
    });
  }
};
// Delete multiple banks
const deleteMultipleBanks = async (req, res) => {
  try {
    const { ids } = req.body;
    const deletedBanks = await BankModel.deleteMany({ _id: { $in: ids } });

    if (deletedBanks.deletedCount === 0) {
      return res.status(statusCode.NOT_FOUND).json({
        statusCode: statusCode.NOT_FOUND,
        message: message.errorFetchingBank,
      });
    }

    res.status(statusCode.OK).json({
      statusCode: statusCode.OK,
      message: message.banksDeleted,
      deletedCount: deletedBanks.deletedCount,
    });
  } catch (error) {
    console.error("Error while deleting multiple banks", error);
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      statusCode: statusCode.INTERNAL_SERVER_ERROR,
      message: message.errorDeletingBanks,
    });
  }
};

module.exports = {
  createBank,
  updateBank,
  deleteBank,
  getBanks,
  deleteMultipleBanks,
};
