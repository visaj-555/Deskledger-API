const SubPropertyTypeModel = require("../models/subPropertyType");
const { statusCode, message } = require("../utils/api.response");

// Create a new sub-property type
const subPropertyTypeRegister = async (req, res) => {
  try {
    const { subPropertyType, propertyTypeId } = req.body;

    // Check if the sub-property type already exists
    const subPropertyTypeExists = await SubPropertyTypeModel.findOne({
      subPropertyType,
      propertyTypeId,
    });

    if (subPropertyTypeExists) {
      return res.status(statusCode.CONFLICT).json({
        statusCode: statusCode.CONFLICT,
        message: message.subPropertyTypeAlreadyExists,
      });
    }

    // Create a new sub-property type
    const newSubPropertyType = new SubPropertyTypeModel({
      subPropertyType,
      propertyTypeId,
    });

    const savedSubPropertyType = await newSubPropertyType.save();

    // Aggregate to join property types
    const registeredSubProperty = await SubPropertyTypeModel.aggregate([
      { $match: { _id: savedSubPropertyType._id } },
      {
        $lookup: {
          from: "propertytypes",
          localField: "propertyTypeId",
          foreignField: "_id",
          as: "propertyTypesData",
        },
      },
      { $unwind: { path: "$propertyTypesData", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          subPropertyType: 1,
          propertyTypeId: 1,
          propertyType: "$propertyTypesData.propertyType",
        },
      },
    ]);

    res.status(statusCode.CREATED).json({
      statusCode: statusCode.CREATED,
      message: message.subPropertyTypeAdded,
      data: registeredSubProperty[0],
    });
  } catch (error) {
    console.error("Error while registering Sub Property Type:", error);
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      statusCode: statusCode.INTERNAL_SERVER_ERROR,
      message: message.errorAddingSubPropertyType,
      error: error.message,
    });
  }
};

// Update a sub-property type
const updateSubPropertyType = async (req, res) => {
  try {
    const { id } = req.params;
    const { subPropertyType} = req.body;

    const updatedSubPropertyType = await SubPropertyTypeModel.findByIdAndUpdate(
      id,
      { subPropertyType },
      { new: true }
    );

    if (!updatedSubPropertyType) {
      return res.status(statusCode.NOT_FOUND).json({
        statusCode: statusCode.NOT_FOUND,
        message: message.subPropertyTypeNotFound,
      });
    }

    // Fetch the updated sub-property type with joined property type
    const updatedSubPropertyTypeWithPropertyType = await SubPropertyTypeModel.aggregate([
      { $match: { _id: updatedSubPropertyType._id } },
      {
        $lookup: {
          from: "propertytypes",
          localField: "propertyTypeId",
          foreignField: "_id",
          as: "propertyTypesData",
        },
      },
      { $unwind: { path: "$propertyTypesData", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          subPropertyType: 1,
          propertyTypeId: 1,
          propertyType: "$propertyTypesData.propertyType",
        },
      },
    ]);

    res.status(statusCode.OK).json({
      statusCode: statusCode.OK,
      message: message.subPropertyTypeUpdated,
      data: updatedSubPropertyTypeWithPropertyType[0],
    });
  } catch (error) {
    console.error("Error while updating Sub Property Type:", error);
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      statusCode: statusCode.INTERNAL_SERVER_ERROR,
      message: message.errorUpdatingSubPropType,
      error: error.message,
    });
  }
};

// Delete a sub-property type
const deleteSubPropertyType = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedSubPropertyType = await SubPropertyTypeModel.findByIdAndDelete(id);

    if (!deletedSubPropertyType) {
      return res.status(statusCode.NOT_FOUND).json({
        statusCode: statusCode.NOT_FOUND,
        message: message.subPropertyTypeNotFound,
      });
    }

    res.status(statusCode.OK).json({
      statusCode: statusCode.OK,
      message: message.subPropertyTypeDeleted,
      data: deletedSubPropertyType,
    });
  } catch (error) {
    console.error("Error while deleting Sub Property Type:", error);
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      statusCode: statusCode.INTERNAL_SERVER_ERROR,
      message: message.errorDeletingSubPropType,
      error: error.message,
    });
  }
};

// Get all sub-property types with their property types
const getSubPropertyType = async (req, res) => {
  try {
    const subpropertytypes = await SubPropertyTypeModel.aggregate([
      {
        $lookup: {
          from: "propertytypes",
          localField: "propertyTypeId",
          foreignField: "_id",
          as: "propertyTypesData",
        },
      },
      { $unwind: { path: "$propertyTypesData", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          subPropertyType: 1,
          propertyTypeId: 1,
          propertyType: "$propertyTypesData.propertyType",
        },
      },
    ]);

    const subPropertyTypesWithSrNo = subpropertytypes.map((subPropertyType, index) => ({
      srNo: index + 1,
      subPropertyType: {
        _id: subPropertyType._id,
        subPropertyType: subPropertyType.subPropertyType,
        propertyTypeId: subPropertyType.propertyTypeId,
        propertyType: subPropertyType.propertyType,
      },
    }));

    res.status(statusCode.OK).json({
      statusCode: statusCode.OK,
      message: message.subPropertyTypeRetrieved,
      data: subPropertyTypesWithSrNo,
    });
  } catch (error) {
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      statusCode: statusCode.INTERNAL_SERVER_ERROR,
      message: message.errorFetchingSubPropTypes,
      error: error.message,
    });
  }
};

// Delete multiple sub-property types
const deleteMultipleSubPropertyTypes = async (req, res) => {
  try {
    const { ids } = req.body; // Pass an array of IDs

    const deletedMultipleSubPropertyTypes = await SubPropertyTypeModel.deleteMany({ _id: { $in: ids } });

    if (deletedMultipleSubPropertyTypes.deletedCount === 0) {
      return res.status(statusCode.NOT_FOUND).json({
        statusCode: statusCode.NOT_FOUND,
        message: message.errorFetchingSubPropTypes,
      });
    }

    res.status(statusCode.OK).json({
      statusCode: statusCode.OK,
      message: message.subPropertyTypesDeleted,
      deletedCount: deletedMultipleSubPropertyTypes.deletedCount,
    });
  } catch (error) {
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      statusCode: statusCode.INTERNAL_SERVER_ERROR,
      message: message.errorDeletingSubPropertyTypes,
      error: error.message,
    });
  }
};

module.exports = {
  subPropertyTypeRegister,
  getSubPropertyType,
  updateSubPropertyType,
  deleteSubPropertyType,
  deleteMultipleSubPropertyTypes,
};
