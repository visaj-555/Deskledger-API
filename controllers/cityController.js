const CityModel = require("../models/city");
const { statusCode, message } = require("../utils/api.response");

// Create a new city
const cityRegister = async (req, res) => {
  try {
    const { city, stateId } = req.body;

    const cityExists = await CityModel.findOne({ city });
    if (cityExists) {
      return res.status(statusCode.CONFLICT).json({
        statusCode: statusCode.CONFLICT,
        message: message.cityAlreadyExists,
      });
    }

    const newCity = new CityModel({
      city,
      stateId,
    });

    const savedCity = await newCity.save();

    // Use aggregation to fetch state details with the newly created city
    const registeredCity = await CityModel.aggregate([
      {
        $match: { _id: savedCity._id },
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
          path: "$stateData",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          city: 1,
          stateId: 1,
          state: "$stateData.state",
        },
      },
    ]);

    res.status(statusCode.CREATED).json({
      statusCode: statusCode.CREATED,
      message: message.cityCreated,
      data: registeredCity[0],
    });
  } catch (error) {
    console.error("Error while adding city", error)
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      statusCode: statusCode.INTERNAL_SERVER_ERROR,
      message: message.errorCreatingCity,
    });
  }
};

const updateCity = async (req, res) => {
  try {
    const { id } = req.params;
    const { city, stateId } = req.body;

    const updatedCity = await CityModel.findByIdAndUpdate(
      id,
      { city, stateId },
      { new: true }
    );

    if (!updatedCity) {
      return res.status(statusCode.NOT_FOUND).json({
        statusCode: statusCode.NOT_FOUND,
        message: message.cityNotFound,
      });
    }

    // Use aggregation to fetch state details with the updated city
    const updatedCityWithState = await CityModel.aggregate([
      {
        $match: { _id: updatedCity._id },
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
          path: "$stateData",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          city: 1,
          stateId: 1,
          state: "$stateData.state",
        },
      },
    ]);

    res.status(statusCode.OK).json({
      statusCode: statusCode.OK,
      message: message.cityUpdated,
      data: updatedCityWithState[0],
    });
  } 
  
  catch (error) {
    console.error("Error while updating bank", error)
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      statusCode: statusCode.INTERNAL_SERVER_ERROR,
      message: message.errorUpdatingCity,
    });
  }
};

const deleteCity = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedCity = await CityModel.findByIdAndDelete(id);
    if (!deletedCity) {
      return res.status(statusCode.NOT_FOUND).json({
        statusCode: statusCode.NOT_FOUND,
        message: message.cityNotFound,
      });
    }

    // Perform the state lookup for the deleted city
    const deletedCityWithState = await CityModel.aggregate([
      {
        $match: { _id: deletedCity._id },
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
          path: "$stateData",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          city: 1,
          stateId: 1,
          state: "$stateData.state",
        },
      },
    ]);

    res.status(statusCode.OK).json({
      statusCode: statusCode.OK,
      message: message.cityDeleted,
      data: deletedCityWithState[0],
    });
  } catch (error) {
    console.error("Error while deleting bank", error)
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      statusCode: statusCode.INTERNAL_SERVER_ERROR,
      message: message.errorDeletingCity,
    });
  }
};

const getCity = async (req, res) => {
  try {
    const cities = await CityModel.aggregate([
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
          path: "$stateData",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          city: 1,
          stateId: 1,
          state: "$stateData.state",
        },
      },
    ]);

    const citiesWithSrNo = cities.map((city, index) => ({
      srNo: index + 1,
      city, 
    }));

    res.status(statusCode.OK).json({
      statusCode: statusCode.OK,
      message: message.citiesView,
      data: citiesWithSrNo,
    });
  } catch (error) {
    console.error("Error while fetching city");
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      statusCode: statusCode.INTERNAL_SERVER_ERROR,
      message: message.errorFetchingCities,
    });
  }
};

// Delete multiple cities
const deleteMultipleCities = async (req, res) => {
  try {
    const { ids } = req.body; // Pass an array of ids

    const deletedCities = await CityModel.deleteMany({ _id: { $in: ids } });

    if (deletedCities.deletedCount === 0) {
      return res.status(statusCode.NOT_FOUND).json({
        statusCode: statusCode.NOT_FOUND,
        message: message.cityNotFound,
      });
    }

    res.status(statusCode.OK).json({
      statusCode: statusCode.OK,
      message: message.citiesDeleted,
      deletedCount: deletedCities.deletedCount,
    });
    
  } catch (error) {
    console.error("Error while deleting multiple cities", error);
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      statusCode: statusCode.INTERNAL_SERVER_ERROR,
      message: message.errorDeletingCity,
      error: error.message,
    });
  }
};

module.exports = {
  cityRegister,
  getCity,
  updateCity,
  deleteCity,
  deleteMultipleCities
};