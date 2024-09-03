const AreaPriceModel = require("../models/areaPrice");
const { statusCode, message } = require('../utils/api.response');

// Create a new area price
const createAreaPrice = async (req, res) => {
  try {
    const { city, state, areaName, pricePerSquareFoot } = req.body;

    const areaPriceExists = await AreaPriceModel.findOne({ city, state, areaName });
    if (areaPriceExists) {
      return res.status(statusCode.CONFLICT).json({ statusCode: statusCode.CONFLICT, message: message.areaPriceAlreadyExists });
    }

    const newAreaPrice = new AreaPriceModel({ city, state, areaName, pricePerSquareFoot });
    const savedAreaPrice = await newAreaPrice.save();

    res.status(statusCode.CREATED).json({ statusCode: statusCode.CREATED, message: message.areaPriceCreated, data: savedAreaPrice });
  } catch (error) {
    console.error("Error while creating area price:", error);
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      statusCode: statusCode.INTERNAL_SERVER_ERROR,
      message: message.errorCreatingAreaPrice,
      error: error.message,
    });
  }
};

// Update an area price
const updateAreaPrice = async (req, res) => {
  try {
    const { areaPriceId, city, state, areaName, pricePerSquareFoot } = req.body;

    const updatedAreaPrice = await AreaPriceModel.findByIdAndUpdate(
      areaPriceId,
      { city, state, areaName, pricePerSquareFoot },
      { new: true }
    );

    if (!updatedAreaPrice) {
      return res.status(statusCode.NOT_FOUND).json({ statusCode: statusCode.NOT_FOUND, message: message.errorFetchingAreaPrice });
    }

    res.status(statusCode.OK).json({
      statusCode: statusCode.OK,
      message: message.areaPriceUpdated,
      data: updatedAreaPrice,
    });
  } catch (error) {
    console.error('Error while updating area price:', error);
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      statusCode: statusCode.INTERNAL_SERVER_ERROR,
      message: message.errorUpdatingAreaPrice,
      error: error.message,
    });
  }
};

// Delete an area price
const deleteAreaPrice = async (req, res) => {
  try {
    const { id } = req.body;

    const deletedAreaPrice = await AreaPriceModel.findByIdAndDelete(id);

    if (!deletedAreaPrice) {
      return res.status(statusCode.NOT_FOUND).json({ statusCode: statusCode.NOT_FOUND, message: message.errorFetchingAreaPrice });
    }

    res.status(statusCode.OK).json({ statusCode: statusCode.OK, message: message.areaPriceDeleted });
  } catch (error) {
    console.error("Error while deleting area price:", error);
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      statusCode: statusCode.INTERNAL_SERVER_ERROR,
      message: message.errorDeletingAreaPrice,
      error: error.message,
    });
  }
};

// Get area prices
const getAreaPrices = async (req, res) => {
  try {
    const areaPrices = await AreaPriceModel.find();
    res.status(statusCode.OK).json({ statusCode: statusCode.OK, message: message.areaPricesView, data: areaPrices });
  } catch (error) {
    console.error("Error while fetching area prices:", error);
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({ statusCode: statusCode.INTERNAL_SERVER_ERROR, message: message.errorFetchingAreaPrices, error: error.message });
  }
};

module.exports = {
  createAreaPrice,
  updateAreaPrice,
  deleteAreaPrice,
  getAreaPrices,
};
