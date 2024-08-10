const BankModel = require("../models/bank");

// Create a new bank
const createBank = async (req, res) => {
  try {
    const { bankName } = req.body;

    const bankExists = await BankModel.findOne({ bankName });
    if (bankExists) {
      return res
        .status(400)
        .json({ statusCode: 400, message: "Bank already exists" });
    }

    const newBank = new BankModel({ bankName });
    const savedBank = await newBank.save();

    res
      .status(201)
      .json({ statusCode: 201, message: "Bank created", data: savedBank });
  } catch (error) {
    console.error("Error while creating bank:", error);
    res
      .status(500)
      .json({
        statusCode: 500,
        message: "Error creating bank",
        error: error.message,
      });
  }
};

// Update a bank
const updateBank = async (req, res) => {
  try {
    const { bankId, bankName } = req.body;

    const updatedBank = await BankModel.findByIdAndUpdate(
      bankId,
      { bankName },
      { new: true }
    );

    if (!updatedBank) {
      return res.status(404).json({ statusCode: 404, message: 'Bank not found' });
    }

    res.status(200).json({
      statusCode: 200,
      message: 'Bank updated successfully!',
      data: updatedBank,
    });
  } catch (error) {
    console.error('Error while updating bank:', error);
    res.status(500).json({
      statusCode: 500,
      message: 'Error updating bank',
      error: error.message,
    });
  }
};

// Delete a bank
const deleteBank = async (req, res) => {
  try {
    const { id } = req.body;

    const deletedBank = await BankModel.findByIdAndDelete(id);

    if (!deletedBank) {
      return res
        .status(404)
        .json({ statusCode: 404, message: "Bank not found" });
    }

    res
      .status(200)
      .json({ statusCode: 200, message: "Bank deleted successfully!" });
  } catch (error) {
    console.error("Error while deleting bank:", error);
    res
      .status(500)
      .json({
        statusCode: 500,
        message: "Error deleting bank",
        error: error.message,
      });
  }
};

// Get banks
// Get banks
const getBanks = async (req, res) => {
  try {
    const banks = await BankModel.find();
    res.status(200).json({ statusCode: 200, data: banks });
  } catch (error) {
    console.error("Error while fetching banks:", error);
    res.status(500).json({ statusCode: 500, message: "Error fetching banks", error: error.message });
  }
};

module.exports = {
  createBank,
  updateBank,
  deleteBank,
  getBanks,
};
