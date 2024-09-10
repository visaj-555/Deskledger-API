const StateModel = require("../models/state");
const { statusCode, message } = require("../utils/api.response");

// Create a new state
const stateRegister = async (req, res) => {
  try {
    const { state } = req.body;
    console.log("State: " + state);

    const stateExists = await StateModel.findOne({ state });
    console.log("StateExists: " + stateExists);
    if (stateExists) {
      return res.status(statusCode.CONFLICT).json({
        statusCode: statusCode.CONFLICT,
        message: message.stateAlreadyExists,
      });
    }

    const newState = new StateModel({ state });
    console.log("New State: " + newState);

    const savedState = await newState.save();
    console.log("Saved State: " + savedState);

    res.status(statusCode.CREATED).json({
      statusCode: statusCode.CREATED,
      message: message.stateCreated,
      data: savedState,
    });

  } catch (error) {
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      statusCode: statusCode.INTERNAL_SERVER_ERROR,
      message: message.errorCreatingState,
      error: error.message,
    });
  }
};

const updateState = async (req, res) => {
  try {
    const { id } = req.params;
    const { state } = req.body;

    console.log(id);
    console.log(state);

    const updatedState = await StateModel.findByIdAndUpdate(
      id,
      { state },
      { new: true }
    );

    if (!updatedState) {
      return res
      .status(statusCode.NOT_FOUND)
      .json({
        statusCode: statusCode.NOT_FOUND,
        message: message.errorFetchingState,
      });
  }

    res.status(statusCode.OK).json({
      statusCode: statusCode.OK,
      message: message.stateUpdated,
      data: updatedState,
    });
  } catch (error) {
    console.error("Error while updating state:", error);
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      statusCode: statusCode.INTERNAL_SERVER_ERROR,
      message: message.errorUpdatingState,
      error: error.message,
    });
  }
};

const deleteState = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedState = await StateModel.findByIdAndDelete(id);

    if (!deletedState) {
      return res
      .status(statusCode.NOT_FOUND)
      .json({
        statusCode: statusCode.NOT_FOUND,
        message: message.errorFetchingState,
      });
  }
  res
  .status(statusCode.OK)
  .json({ statusCode: statusCode.OK, message: message.stateDeleted });
} catch (error) {
res.status(statusCode.INTERNAL_SERVER_ERROR).json({
  statusCode: statusCode.INTERNAL_SERVER_ERROR,
  message: message.errorDeletingState,
  error: error.message,
});
}
};

const getState = async (req, res) => {
  try {
    const states = await StateModel.find();

    // Add srNo to each bank, starting from 1
    const statesWithSrNo = states.map((bank, index) => ({
      srNo: index + 1,
      ...bank.toObject(), // Convert the Mongoose document to a plain JavaScript object
    }));

    res.status(statusCode.OK).json({
      statusCode: statusCode.OK,
      message: message.statesView,
      data: statesWithSrNo,
    });
  } catch (error) {
    console.error("Error while fetching banks:", error);
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      statusCode: statusCode.INTERNAL_SERVER_ERROR,
      message: message.errorFetchingStates,
      error: error.message,
    });
  }
};

module.exports = {
  stateRegister,
  getState,
  updateState,
  deleteState,
};
