const PropertyTypeModel = require("../models/propertyType");
const { statusCode, message } = require("../utils/api.response");

const propertyTypeRegister = async (req, res) => {
  try {
    const { propertyType } = req.body;


    const PropertyTypeExists = await PropertyTypeModel.findOne({
      propertyType,
    });
    if (PropertyTypeExists) {
      return res.status(statusCode.CONFLICT).json({
        statusCode: statusCode.CONFLICT,
        message: message.propertyTypeAlreadyExists,
      });
    }

    const newPropertyType = new PropertyTypeModel({ propertyType });
    const savedPropertyType = await newPropertyType.save();


    res.status(statusCode.CREATED).json({
      statusCode: statusCode.CREATED,
      message: message.propertyTypeCreated,
      data: savedPropertyType,
    });
  } catch (error) {
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      statusCode: statusCode.INTERNAL_SERVER_ERROR,
      message: message.errorRegisterPropertyType,
      error: error.message,
    });
  }
};

const updatePropertyType = async (req, res) => {
  try {
    const id = req.params.id;
    const {propertyType} = req.body;

    const updatedPropertyType = await PropertyTypeModel.findByIdAndUpdate(
      id,
      { propertyType},
      { new: true }
    );

    if (!updatedPropertyType) {
      return res.status(statusCode.NOT_FOUND).json({
        statusCode: statusCode.NOT_FOUND,
        message: message.propertyTypeNotFound,
      });
    }

    res.status(statusCode.OK).json({
      statusCode: statusCode.OK,
      message: message.propertyTypeUpdated,
      data: updatedPropertyType,
    });

  } catch (error) {
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      statusCode: statusCode.INTERNAL_SERVER_ERROR,
      message: message.errorUpdatingProperty,
      error: error.message,
    });
  }
};

const deletePropertyType = async (req, res) => {
  try {
    const id = req.params.id;

    const deletedState = await PropertyTypeModel.findByIdAndDelete(
      id
    );

    if (!deletedState) {
      return res.status(statusCode.NOT_FOUND).json({
        statusCode: statusCode.NOT_FOUND,
        message: message.propertyTypeNotFound,
      });
    }

    res
    .status(statusCode.OK)
    .json({ statusCode: statusCode.OK, message: message.propertyTypeDeleted });
  } catch (error) {
    
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      statusCode: statusCode.INTERNAL_SERVER_ERROR,
      message: message.errorDeletingPropertyType,
      error: error.message,
    });
  }
};

const getPropertyType = async (req, res) => {
  try {
    const propertyTypes = await PropertyTypeModel.find();

    // Add srNo to each bank, starting from 1
    const propertyTypesWithSrNo = propertyTypes.map((propertyType, index) => ({
      srNo: index + 1,
      ...propertyType.toObject(), // Convert the Mongoose document to a plain JavaScript object
    }));

    res.status(statusCode.OK).json({
      statusCode: statusCode.OK,
      message: message.propertyTypeView,
      data: propertyTypesWithSrNo,
    });
  } catch (error) {

    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      statusCode: statusCode.INTERNAL_SERVER_ERROR,
      message: message.errorFetchingPropertyType,
      error: error.message,
    });
  }
};

const deleteMultiplePropertyTypes = async (req,res) => {
  try {
    const { ids } = req.body; // Pass an array of ids

    const deletedPropertyTypes = await PropertyTypeModel.deleteMany({ _id: { $in: ids } });

    if (deletedPropertyTypes.deletedCount === 0) {
      return res.status(statusCode.NOT_FOUND).json({
        statusCode: statusCode.NOT_FOUND,
        message: message.errorFetchingPropertyType,
      });
    }

    res.status(statusCode.OK).json({
      statusCode: statusCode.OK,
      message: message.propertyTypesDeleted,
      deletedCount: deletedPropertyTypes.deletedCount,
    });
  } catch (error) {
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      statusCode: statusCode.INTERNAL_SERVER_ERROR,
      message: message.errorDeletingPropertyTypes,
      error: error.message,
    });
  }
};
module.exports = {
  propertyTypeRegister,
  updatePropertyType,
  deletePropertyType,
  getPropertyType,
  deleteMultiplePropertyTypes
};
