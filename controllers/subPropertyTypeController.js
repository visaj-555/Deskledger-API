const SubPropertyTypeModel = require("../models/subPropertyType");

const { statusCode, message } = require("../utils/api.response");

// Create a new sub property type
const subPropertyTypeRegister = async (req, res) => {
  try {
    const { subPropertyType, propertyTypeId } = req.body;

    const subPropertyTypeExists = await SubPropertyTypeModel.findOne({
      subPropertyType,
      propertyTypeId,
    });
    if (subPropertyTypeExists) {
      return res
        .status(400)
        .json({ statusCode: 400, message: "Sub Property Type already exists" });
    }

    const newSubPropertyType = new SubPropertyTypeModel({
      subPropertyType,
      propertyTypeId,
    });

    const savedSubPropertyType = await newSubPropertyType.save();

    const registeredSubProperty = await SubPropertyTypeModel.aggregate([
      {
        $match: { _id: savedSubPropertyType._id }
      },
      {
        $lookup: {
          from: "propertytypes",
          localField: "propertyTypeId",
          foreignField: "_id",
          as: "propertyTypesData",
        },
      },
      {
        $unwind: {
          path: "$propertyTypesData",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          subPropertyType: 1,
          propertyTypeId: 1,
          propertyType: "$propertyTypesData.propertyType",
        },
      },
    ]);


    res.status(201).json({
      statusCode: 201,
      message: "Sub Property Type registered",
      data: savedSubPropertyType,
    });
  } catch (error) {
    console.error("Error while registering Sub Property Type:", error);
    res.status(500).json({
      statusCode: 500,
      message: "Error registering Sub Property Type",
      error: error.message,
    });
  }
};

// Update a sub property type
const updateSubPropertyType = async (req, res) => {
  try {
    const { id } = req.params;
    const { subPropertyType, propertyTypeId } = req.body;

    const updatedSubPropertyType = await SubPropertyTypeModel.findByIdAndUpdate(
      id,
      { subPropertyType, propertyTypeId },
      { new: true }
    );

    if (!updatedSubPropertyType) {
      return res
        .status(404)
        .json({ statusCode: 404, message: "Sub Property Type not found" });
    }

    const updatedSubPropertyTypeWithPropertyType = await SubPropertyTypeModel.aggregate([
      {
        $match: { _id: updatedSubPropertyType._id }
      },
      {
        $lookup: {
          from: "propertytypes",
          localField: "propertyTypeId",
          foreignField: "_id",
          as: "propertyTypesData",
        },
      },
      {
        $unwind: {
          path: "$propertyTypesData",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          subPropertyType: 1,
          propertyTypeId: 1,
          propertyType: "$propertyTypesData.propertyType",
        },
      },
    ]);

    res.status(200).json({
      statusCode: 200,
      message: "Sub Property Type updated successfully!",
      data: updatedSubPropertyType,
    });
  } catch (error) {
    console.error("Error while updating Sub Property Type:", error);
    res.status(500).json({
      statusCode: 500,
      message: "Error updating Sub Property Type",
      error: error.message,
    });
  }
};

// Delete a sub property type
const deleteSubPropertyType = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedSubPropertyType = await SubPropertyTypeModel.findByIdAndDelete(
      id
    );

    if (!deletedSubPropertyType) {
      return res
        .status(404)
        .json({ statusCode: 404, message: "Sub Property Type not found" });
    }

    const deletedSubPropertyTypeWithProperty = await SubPropertyTypeModel.aggregate([
      {
        $match: { _id: deletedSubPropertyType._id }
      },
      {
        $lookup: {
          from: "propertytypes",
          localField: "propertyTypeId",
          foreignField: "_id",
          as: "propertyTypesData",
        },
      },
      {
        $unwind: {
          path: "$propertyTypesData",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          subPropertyType: 1,
          propertyTypeId: 1,
          propertyType: "$propertyTypesData.propertyType",
        },
      },
    ]);

    res.status(200).json({
      statusCode: 200,
      message: "Sub Property Type deleted successfully!",
      data: deletedSubPropertyTypeWithProperty[0],
    });
  } catch (error) {
    console.error("Error while deleting Sub Property Type:", error);
    res.status(500).json({
      statusCode: 500,
      message: "Error deleting Sub Property Type",
      error: error.message,
    });
  }
};

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
      {
        $unwind: {
          path: "$propertyTypesData",
          preserveNullAndEmptyArrays: true,
        },
      },
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
      subPropertyType, // Convert the Mongoose document to a plain JavaScript object
    }));

    res.status(statusCode.OK).json({
      statusCode: statusCode.OK,
      message: message.subPropertyTypeView,
      data: subPropertyTypesWithSrNo,
    });
  } catch (error) {
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      statusCode: statusCode.INTERNAL_SERVER_ERROR,
      message: message.errorFetchingSubPropertyType,
      error: error.message,
    });
  }
};

module.exports = {
  subPropertyTypeRegister,
  getSubPropertyType,
  updateSubPropertyType,
  deleteSubPropertyType,
};
