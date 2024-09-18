const AreaPriceModel = require("../models/areaPrice");
const { statusCode, message } = require('../utils/api.response');

// Create a new area price
const createAreaPrice = async (req, res) => {
  try {
    const { cityId, stateId, areaName, pricePerSquareFoot } = req.body;

    const areaPriceExists = await AreaPriceModel.findOne({ cityId, stateId, areaName, pricePerSquareFoot });

    if (areaPriceExists) {
      return res.status(statusCode.CONFLICT).json({ statusCode: statusCode.CONFLICT, message: message.areaPriceAlreadyExists });
    }

    const newAreaPrice = new AreaPriceModel({ cityId, stateId, areaName, pricePerSquareFoot });

    const savedAreaPrice = await newAreaPrice.save();

    res.status(statusCode.CREATED).json({ statusCode: statusCode.CREATED, message: message.areaPriceCreated, data: savedAreaPrice });

  } catch (error) {
    console.error("Error while adding area price:", error);
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      statusCode: statusCode.INTERNAL_SERVER_ERROR,
      message: message.errorCreatingAreaPrice,
    });
  }
};

// Update an area price
const updateAreaPrice = async (req, res) => {
  try {
    const {id} =  req.params;
    const {cityId, stateId, areaName, pricePerSquareFoot } = req.body;

    const updatedAreaPrice = await AreaPriceModel.findByIdAndUpdate(
      id,
      { cityId, stateId, areaName, pricePerSquareFoot },
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
    });
  }
};

// Delete an area price
const deleteAreaPrice = async (req, res) => {
  try {
    const { id } = req.params;

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
    });
  }
};

// Get area prices
const getAreaPrices = async (req, res) => {
  try {
    const areaPrices = await AreaPriceModel.aggregate([
      {
        $lookup: {
          from: "cities",
          localField: "cityId",
          foreignField: "_id",
          as: "cityData",
        },
      },
      {
        $lookup: {
          from: "states",
          localField: "stateId",
          foreignField: "_id",
          as: "stateData",
        },
      },
      {
        $unwind: {
          path: "$cityData",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: "$stateData",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          areaName: 1,
          pricePerSquareFoot: 1,
          city: "$cityData.city", 
          state: "$stateData.state", 
        },
      },
    ]);

    const areaPricesWithSrNo = areaPrices.map((areaPrice, index) => ({
      srNo: index + 1,
      ...areaPrice,
    }));

    res.status(statusCode.OK).json({
      statusCode: statusCode.OK,
      message: message.areaPriceRetrieved,
      data: areaPricesWithSrNo,
    });
  } catch (error) {
    console.error("Error fetching area prices:", error);
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      statusCode: statusCode.INTERNAL_SERVER_ERROR,
      message: message.errorFetchingAreaPrice,
    });
  }
};

// Delete multiple area prices
const deleteMultipleAreaPrices = async (req, res) => {
  try {
    const {ids} = req.body; 

    const deletedAreaPrices = await AreaPriceModel.deleteMany({ _id: { $in: ids } });

    if (deletedAreaPrices.deletedCount === 0) {
      return res.status(statusCode.NOT_FOUND).json({
        statusCode: statusCode.NOT_FOUND,
        message: message.errorFetchingAreaPrice,
      });
    }

    res.status(statusCode.OK).json({
      statusCode: statusCode.OK,
      message: message.areaPricesDeleted,
      deletedCount: deletedAreaPrices.deletedCount,
    });
  } 
  catch (error) {
    console.error("Error while deleting multiple data", error);
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      statusCode: statusCode.INTERNAL_SERVER_ERROR,
      message: message.errorDeletingAreaPrice,
    });
  }
};

module.exports = {
  createAreaPrice,
  updateAreaPrice,
  deleteAreaPrice,
  getAreaPrices,
  deleteMultipleAreaPrices
};

