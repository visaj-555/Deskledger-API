const AreaPriceModel = require("../models/areaPrice");
const RealEstateModel = require("../models/realEstate");
const RealEstateAnalysisModel = require("../models/realEstateAnalysis");
const { statusCode, message } = require("../utils/api.response");
const mongoose = require ("mongoose");

// Create a real estate record
exports.createRealEstate = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      firstName,
      lastName,
      propertyTypeId,
      subPropertyTypeId,
      propertyAddress,
      cityId,
      stateId,
      areaName,
      areaInSquareFeet,
      purchasePrice,
    } = req.body;

    // Check if a real estate entry with the same fields already exists
    const existingRealEstate = await RealEstateModel.findOne({
      firstName,
      lastName,
      propertyTypeId,
      subPropertyTypeId,
      propertyAddress,
      cityId,
      stateId,
      areaName,
      areaInSquareFeet,
      purchasePrice,
      userId,
    });

    if (existingRealEstate) {
      return res.status(statusCode.CONFLICT).json({
        statusCode: statusCode.CONFLICT,
        message: message.propertyAlreadyExists, // You can customize the message here
      });
    }

    const areaPrice = await AreaPriceModel.findOne({
      areaName,
      cityId,
      stateId,
    });

    if (!areaPrice) {
      return res.status(statusCode.NOT_FOUND).json({
        statusCode: statusCode.NOT_FOUND,
        message: message.areaPriceNotFound,
      });
    }

    // Calculate current value and profit
    const currentValue = Math.round(
      areaPrice.pricePerSquareFoot * areaInSquareFeet
    );
    const profit = Math.round(currentValue - purchasePrice);

    // Create and save the real estate entry
    const newRealEstate = new RealEstateModel({
      firstName,
      lastName,
      propertyTypeId,
      subPropertyTypeId,
      propertyAddress,
      cityId,
      stateId,
      areaName,
      areaInSquareFeet,
      purchasePrice,
      currentValue,
      profit,
      userId,
    });

    const saveRealEstate = await newRealEstate.save();

    return res.status(statusCode.CREATED).json({
      statusCode: statusCode.CREATED,
      message: message.PropertyAdded,
      data: saveRealEstate,
    });
  } catch (error) {
    console.error(error);
    return res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      statusCode: statusCode.INTERNAL_SERVER_ERROR,
      message: message.errorCreatingProperty,
    });
  }
};
// Update real estate record
exports.updateRealEstate = async (req, res) => {
  try {
    const id = req.params.id;
    const {
      firstName,
      lastName,
      propertyTypeId,
      subPropertyTypeId,
      propertyAddress,
      cityId,
      stateId,
      areaName,
      areaInSquareFeet,
      purchasePrice,
    } = req.body;

    const existingRealEstate = await RealEstateModel.findById(id);
    if (!existingRealEstate) {
      return res.status(statusCode.NOT_FOUND).json({
        statusCode: statusCode.NOT_FOUND,
        message: message.propertyNotFound,
      });
    }

    let newCurrentValue, newProfit;

    // Use existing cityId, stateId, and areaName if not provided in the request body
    const resolvedCityId = cityId || existingRealEstate.cityId;
    const resolvedStateId = stateId || existingRealEstate.stateId;
    const resolvedAreaName = areaName || existingRealEstate.areaName;

    if (areaInSquareFeet || purchasePrice || areaName) {
      const areaPrice = await AreaPriceModel.findOne({
        areaName: resolvedAreaName,
        cityId: resolvedCityId,
        stateId: resolvedStateId,
      });

      if (!areaPrice) {
        return res.status(statusCode.NOT_FOUND).json({
          statusCode: statusCode.NOT_FOUND,
          message: message.areaPriceNotFound,
        });
      }

      // Calculate new current value and profit
      newCurrentValue =
        areaPrice.pricePerSquareFoot *
        (areaInSquareFeet || existingRealEstate.areaInSquareFeet);
      newProfit =
        newCurrentValue - (purchasePrice || existingRealEstate.purchasePrice);
    }

    // Update the fields if provided
    existingRealEstate.set({
      firstName: firstName || existingRealEstate.firstName,
      lastName: lastName || existingRealEstate.lastName,
      propertyTypeId: propertyTypeId || existingRealEstate.propertyTypeId,
      subPropertyTypeId:
        subPropertyTypeId || existingRealEstate.subPropertyTypeId,
      propertyAddress: propertyAddress || existingRealEstate.propertyAddress,
      cityId: resolvedCityId,
      stateId: resolvedStateId,
      areaName: resolvedAreaName,
      areaInSquareFeet: areaInSquareFeet || existingRealEstate.areaInSquareFeet,
      purchasePrice: purchasePrice || existingRealEstate.purchasePrice,
      currentValue:
        newCurrentValue !== undefined
          ? newCurrentValue
          : existingRealEstate.currentValue,
      profit: newProfit !== undefined ? newProfit : existingRealEstate.profit,
    });

    // Save the updated real estate entry
    const updatedRealEstate = await existingRealEstate.save();

    res.status(statusCode.OK).json({
      statusCode: statusCode.OK,
      message: message.propertyUpdated,
      data: updatedRealEstate,
    });
  } catch (error) {
    console.error(error);
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      statusCode: statusCode.INTERNAL_SERVER_ERROR,
      message: message.errorUpdatingProperty,
    });
  }
};

// Delete real estate record
exports.deleteRealEstate = async (req, res) => {
  try {
    const id = req.params.id;
    const realEstate = await RealEstateModel.findByIdAndDelete(id);
    if (!realEstate) {
      return res.status(statusCode.NOT_FOUND).json({
        statusCode: statusCode.NOT_FOUND,
        message: message.propertyNotFound,
      });
    }
    return res
      .status(statusCode.OK)
      .json({ statusCode: statusCode.OK, message: message.propertyDeleted });
  } catch (error) {
    return res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      statusCode: statusCode.INTERNAL_SERVER_ERROR,
      message: message.errorDeletingProperty,
    });
  }
};

// Get all real estate records
exports.getAllRealEstate = async (req, res) => {
  try {
    const realestates = await RealEstateModel.aggregate([
      {
        $lookup: {
          from: "propertytypes",
          localField: "propertyTypeId",
          foreignField: "_id",
          as: "propertyTypesData",
        },
      },
      {
        $lookup: {
          from: "subpropertytypes",
          localField: "subPropertyTypeId",
          foreignField: "_id",
          as: "subPropertyTypesData",
        },
      },
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
          path: "$propertyTypesData",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: "$subPropertyTypesData",
          preserveNullAndEmptyArrays: true,
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
          firstName: 1,
          lastName: 1,
          propertyTypeId: 1,
          propertyType: "$propertyTypesData.propertyType",
          subPropertyType: "$subPropertyTypesData.subPropertyType",
          city: "$cityData.city",
          state: "$stateData.state",
          propertyAddress: 1,
          areaName: 1,
          areaInSquareFeet: 1,
          purchasePrice: 1,
          currentValue: 1,
          profit: 1,
          sector: 1,
          userId: 1,
        },
      },
    ]);
  

    const realEstatesWithSrNo = realestates.map((realEstate, index) => ({
      srNo: index + 1,
      ...realEstate
    }));

    res.status(statusCode.OK).json({
      statusCode: statusCode.OK,
      message: message.propertiesView,
      data: realEstatesWithSrNo,
    });
  } catch (error) {
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      statusCode: statusCode.INTERNAL_SERVER_ERROR,
      message: message.errorFetchingProperties,
    });
  }
};

// Delete Multiple Real Estates
exports.deleteMultipleRealEstates = async (req, res) => {
  try {
    const { ids } = req.body; // Pass an array of IDs

    const deletedMultipleRealEstates = await RealEstateModel.deleteMany({
      _id: { $in: ids },
    });

    if (deletedMultipleRealEstates.deletedCount === 0) {
      return res.status(statusCode.NOT_FOUND).json({
        statusCode: statusCode.NOT_FOUND,
        message: message.errorFetchingProperties,
      });
    }

    res.status(statusCode.OK).json({
      statusCode: statusCode.OK,
      message: message.propertiesDeleted,
      deletedCount: deletedMultipleSubPropertyTypes.deletedCount,
    });
  } catch (error) {
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      statusCode: statusCode.INTERNAL_SERVER_ERROR,
      message: message.errorDeletingProperties,
    });
  }
};

// Analytics of Real Estates
exports.getRealEstateAnalysis = async (req, res) => {
  try {
    const userId = req.user.id;

    const realEstateAnalysis = await RealEstateModel.aggregate([
      {
        $match: { userId: new mongoose.Types.ObjectId(userId) }, // Match by userId
      },
      {
        $addFields: {
          totalInvestedAmount: "$purchasePrice",
          currentReturnAmount: "$currentValue",
          totalProfit: { $subtract: ["$currentValue", "$purchasePrice"] }, 
        },
      },
      {
        $group: {
          _id: null, 
          totalInvestedAmountOfRealEstate: { $sum: "$totalInvestedAmount" },
          currentReturnAmountOfRealEstate: { $sum: "$currentReturnAmount" },
          totalProfitGainedOfRealEstate: { $sum: "$totalProfit" }, 
        },
      },
    ]);

    if (!realEstateAnalysis || realEstateAnalysis.length === 0) {
      return res.status(statusCode.NO_CONTENT).json({
        statusCode: statusCode.NO_CONTENT,
        message: message.errorFetchingPropertyAnalysis,
      });
    }


    const analysisData = {
      totalInvestedAmountOfRealEstate: Math.round(
        realEstateAnalysis[0].totalInvestedAmountOfRealEstate
      ),
      currentReturnAmountOfRealEstate: Math.round(
        realEstateAnalysis[0].currentReturnAmountOfRealEstate
      ),
      totalProfitGainedOfRealEstate: Math.round(
        realEstateAnalysis[0].totalProfitGainedOfRealEstate 
      ),
      userId: new mongoose.Types.ObjectId(userId),
    };
    
    const filter = { userId: new mongoose.Types.ObjectId(userId) };
    const update = { $set: analysisData }; 
    const options = { upsert: true, new: true };
    
    const updatedRealEstateAnalysis = await RealEstateAnalysisModel.findOneAndUpdate(
      filter,
      update,
      options
    );
    

    return res.status(statusCode.OK).json({
      statusCode: statusCode.OK,
      message: message.analysisReportOfRealEstate,
      data: updatedRealEstateAnalysis, 
    });
  } catch (error) {
    console.error("Error calculating Real Estate analytics:", error);
    return res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      statusCode: statusCode.INTERNAL_SERVER_ERROR,
      message: message.errorFetchingRealEstateAnalytics,
    });
  }
};

