const CityModel = require("../models/city");

// Create a new city
const cityRegister = async (req, res) => {
  try {
    const { cityName, state_id } = req.body;

    const cityExists = await CityModel.findOne({ cityName, state_id });
    if (cityExists) {
      return res
        .status(400)
        .json({ statusCode: 400, message: "City already exists" });
    }

    const newCity = new CityModel({
      cityName,
      state_id,
    });

    const savedCity = await newCity.save();
    res
      .status(201)
      .json({ statusCode: 201, message: "City registered", data: savedCity });
  } catch (error) {
    console.log("Error while registering city:", error);
    res
      .status(500)
      .json({
        statusCode: 500,
        message: "Error registering city",
        error: error.message,
      });
  }
};

const updateCity = async (req, res) => {
  try {
    const { cityId, cityName, state_id } = req.body; // Destructure cityId from req.body

    console.log(cityName);

    const updatedCity = await CityModel.findByIdAndUpdate(
      cityId, 
      { cityName, state_id },
      { new: true } // Return the updated document
    );

    if (!updatedCity) {
      return res.status(404).json({ error: "City not found" });
    } // if the city id is not found then throw an error

    res.status(200).json({
      statusCode: 200, // If the city is updated successfully
      message: "City updated successfully!",
      data: updatedCity,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

const deleteCity = async (req, res) => {
  try {
    const city_id = req.body.id;

    const deletedCity = await CityModel.findByIdAndDelete(city_id); // Delete user data from database by its ID

    if (!deletedCity) {
      return res.status(404).json({ error: "City not found" });
    } // If Id not found then throw the error

    res.status(200).json({
      statusCode: 200,
      message: "City deleted successfully!",
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};


const getCity = async (req, res) => {
  try {
    const cityId = req.params.id;

    if (cityId) {
      const city = await CityModel.findById(cityId).populate("state_id");

      if (!city) {
        return res.status(404).json({ statusCode: 404, message: "City not found" });
      }

      res.status(200).json({ statusCode: 200, data: city });
    } else {
      const cities = await CityModel.find().populate("state_id");
      res.status(200).json({ statusCode: 200, data: cities });
    }
  } catch (error) {
    console.log("Error while fetching cities:", error);
    res.status(500).json({ statusCode: 500, message: "Error fetching states", error });
  }
};

module.exports = {
  cityRegister,
  getCity,
  updateCity,
  deleteCity,
};
