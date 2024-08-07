const StateModel = require("../models/state");

// Create a new state
const stateRegister = async (req, res) => {
  try {
    const { stateName, country_id } = req.body;

    const stateExists = await StateModel.findOne({ stateName, country_id });
    if (stateExists) {
      return res
        .status(400)
        .json({ statusCode: 400, message: "State already exists" });
    }

    const newState = new StateModel({ stateName, country_id });
    const savedState = await newState.save();

    res
      .status(201)
      .json({ statusCode: 201, message: "State registered", data: savedState });
  } catch (error) {
    console.error("Error while registering state:", error);
    res
      .status(500)
      .json({
        statusCode: 500,
        message: "Error registering state",
        error: error.message,
      });
  }
};

const updateState = async (req, res) => {
  try {
    const { stateId, stateName, country_id } = req.body;

    console.log(stateName);

    const updatedState = await StateModel.findByIdAndUpdate(
      stateId,
      { stateName, country_id },
      { new: true }
    );

    if (!updatedState) {
      return res.status(404).json({ statusCode: 404, message: 'State not found' });
    }

    res.status(200).json({
      statusCode: 200,
      message: 'State updated successfully!',
      data: updatedState,
    });
  } catch (error) {
    console.error('Error while updating state:', error);
    res.status(500).json({
      statusCode: 500,
      message: 'Error updating state',
      error: error.message,
    });
  }
};


const deleteState = async (req, res) => {
  try {
    const { id } = req.body;

    const deletedState = await StateModel.findByIdAndDelete(id);

    if (!deletedState) {
      return res
        .status(404)
        .json({ statusCode: 404, message: "State not found" });
    }

    res
      .status(200)
      .json({ statusCode: 200, message: "State deleted successfully!" });
  } catch (error) {
    console.error("Error while deleting state:", error);
    res
      .status(500)
      .json({
        statusCode: 500,
        message: "Error deleting state",
        error: error.message,
      });
  }
};

const getState = async (req, res) => {
  try {
    const stateId = req.params.id;

    if (stateId) {
      const state = await StateModel.findById(stateId).populate("country_id");

      if (!state) {
        return res.status(404).json({ statusCode: 404, message: "State not found" });
      }

      res.status(200).json({ statusCode: 200, data: state });
    } else {
      const states = await StateModel.find().populate("country_id");
      res.status(200).json({ statusCode: 200, data: states });
    }
  } catch (error) {
    console.error("Error while fetching states:", error);
    res.status(500).json({ statusCode: 500, message: "Error fetching states", error: error.message });
  }
};

module.exports = {
  stateRegister,
  getState,
  updateState,
  deleteState,
};

