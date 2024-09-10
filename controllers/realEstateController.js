const RealEstateModel = require('../models/realEstate');
const AreaPriceModel = require('../models/areaPrice');

// CREATE a new Real Estate entry
exports.createRealEstate = async (req, res) => {
    try {
        const { 
            firstName, lastName, propertyTypeId, subPropertyTypeId, 
            propertyName, propertyAddress, cityId, stateId, areaInSquareFeet, 
            purchasePrice
        } = req.body;

        // Find the area price from the AreaPrice collection
        const areaPrice = await AreaPriceModel.findOne({ cityId, stateId });

        if (!areaPrice) {
            return res.status(404).json({ message: 'Area price not found for the given city and state' });
        }

        // Calculate currentValue and profit
        const currentValue = areaInSquareFeet * areaPrice.pricePerSquareFoot;
        const profit = currentValue - purchasePrice;

        const realEstate = new RealEstateModel({
            firstName,
            lastName,
            propertyTypeId,
            subPropertyTypeId,
            propertyName,
            propertyAddress,
            cityId,
            stateId,
            areaInSquareFeet,
            purchasePrice,
            currentValue,
            profit,
            userId
        });

        await realEstate.save();
        res.status(201).json(realEstate);
    } catch (error) {
        res.status(500).json({ message: 'Error creating real estate', error });
    }
};

// GET all Real Estate entries
exports.getAllRealEstate = async (req, res) => {
    try {
        const realEstateList = await RealEstateModel.find()
            .populate('propertyTypeId', 'propertyType')
            .populate('subPropertyTypeId', 'subPropertyType')
            .populate('cityId', 'city')
            .populate('stateId', 'state');

        res.status(200).json(realEstateList);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving real estate data', error });
    }
};

// GET a single Real Estate entry by ID
exports.getRealEstateById = async (req, res) => {
    try {
        const realEstate = await RealEstateModel.findById(req.params.id)
            .populate('propertyTypeId', 'propertyType')
            .populate('subPropertyTypeId', 'subPropertyType')
            .populate('cityId', 'city')
            .populate('stateId', 'state');

        if (!realEstate) {
            return res.status(404).json({ message: 'Real estate not found' });
        }

        res.status(200).json(realEstate);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving real estate data', error });
    }
};

// UPDATE a Real Estate entry by ID
exports.updateRealEstate = async (req, res) => {
    try {
        const { 
            firstName, lastName, propertyTypeId, subPropertyTypeId, 
            propertyName, propertyAddress, cityId, stateId, areaInSquareFeet, 
            purchasePrice, userId 
        } = req.body;

        // Find the area price from the AreaPrice collection
        const areaPrice = await AreaPriceModel.findOne({ cityId, stateId });

        if (!areaPrice) {
            return res.status(404).json({ message: 'Area price not found for the given city and state' });
        }

        // Calculate currentValue and profit
        const currentValue = areaInSquareFeet * areaPrice.pricePerSquareFoot;
        const profit = currentValue - purchasePrice;

        const updatedRealEstate = await RealEstateModel.findByIdAndUpdate(
            req.params.id,
            {
                firstName,
                lastName,
                propertyTypeId,
                subPropertyTypeId,
                propertyName,
                propertyAddress,
                cityId,
                stateId,
                areaInSquareFeet,
                purchasePrice,
                currentValue,
                profit,
                userId
            },
            { new: true }
        );

        if (!updatedRealEstate) {
            return res.status(404).json({ message: 'Real estate not found' });
        }

        res.status(200).json(updatedRealEstate);
    } catch (error) {
        res.status(500).json({ message: 'Error updating real estate', error });
    }
};

// DELETE a Real Estate entry by ID
exports.deleteRealEstate = async (req, res) => {
    try {
        const deletedRealEstate = await RealEstateModel.findByIdAndDelete(req.params.id);

        if (!deletedRealEstate) {
            return res.status(404).json({ message: 'Real estate not found' });
        }

        res.status(200).json({ message: 'Real estate deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting real estate', error });
    }
};

exports.deleteMultipleRealEstateData =  async (req,res) => {
    try {
        const { ids } = req.body; // Pass an array of ids
    
        const deletedMultipleRealEstateData = await RealEstateModel.deleteMany({ _id: { $in: ids } });
    
        if (deletedMultipleSubPropertyTypes.deletedCount === 0) {
          return res.status(statusCode.NOT_FOUND).json({
            statusCode: statusCode.NOT_FOUND,
            message: message.errorFetchingSubPropertyTypes,
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