const GoldModel = require('../models/goldModel');
const GoldMasterModel = require('../models/goldMaster');
const { message, statusCode } = require('../utils/api.response');

// Create a new gold record
exports.createGoldRecord = async (req, res) => {
    try {
        const { firstName, lastName, goldWeight, goldPurchasePrice, formOfGold, purityOfGold } = req.body;

        // Fetch the latest gold master data
        const goldMaster = await GoldMasterModel.findOne().sort({ createdAt: -1 });

        if (!goldMaster) {
            return res.status(statusCode.BAD_REQUEST).json({ message: message.goldRegisterError });
        }

        // Destructure values from goldMaster
        const { goldRate22KPerGram, goldRate24KPerGram, gst, makingChargesPerGram } = goldMaster;

        // Determine the gold rate based on purity
        const goldCurrentPricePerGram = purityOfGold === 22 ? goldRate22KPerGram : goldRate24KPerGram;

      // Perform calculations using provided making charges
        const goldCurrentValue = goldCurrentPricePerGram * goldWeight;
        const calculatedMakingCharges = (goldCurrentPricePerGram * goldWeight) * (makingChargesPerGram / 100);
        const totalGoldPrice = calculatedMakingCharges + goldCurrentValue;
        const calculatedGst = (gst / 100) * totalGoldPrice;
        let totalReturnAmount = totalGoldPrice + calculatedGst;
        let profit = totalReturnAmount - goldPurchasePrice;

        // Round the values to remove decimal places
        totalReturnAmount = Math.round(totalReturnAmount);
        profit = Math.round(profit);


        // Create a new gold record
        const newGoldRecord = new GoldModel({
            firstName,
            lastName,
            goldWeight,
            goldPurchasePrice,
            formOfGold,
            purityOfGold,
            totalReturnAmount,
            profit
        });

        // Save the new record to the database
        const saveGoldInfo = await newGoldRecord.save();

        return res.status(statusCode.CREATED).json({ message: message.goldInfoRegister, data: saveGoldInfo });

    } catch (error) {
        console.error(error);
        return res.status(statusCode.INTERNAL_SERVER_ERROR).json({ message: message.internalError });
    }
};


// Get all gold records
exports.getAllGoldRecords = async (req, res) => {
    try {
        const goldRecords = await GoldModel.find().populate('goldMasterId');
        return res.status(statusCode.OK).json({ message: message.goldRecords, data: goldRecords });
    } catch (error) {
        console.error(error);
        return res.status(statusCode.INTERNAL_SERVER_ERROR).json({ message: message.internalError });
    }
};

// Get a single gold record by ID
exports.getGoldRecordById = async (req, res) => {
    try {
        const { id } = req.params;
        const goldRecord = await GoldModel.findById(id).populate('goldMasterId');

        if (!goldRecord) {
            return res.status(statusCode.NOT_FOUND).json({ message: message.goldNotFound });
        }

        return res.status(statusCode.OK).json({ message: message.goldRecords, data: goldRecord });
    } catch (error) {
        console.error(error);
        return res.status(statusCode.INTERNAL_SERVER_ERROR).json({ message: message.internalError });
    }
};

// Update a gold record
exports.updateGoldRecord = async (req, res) => {
    try {
        const { id } = req.params;
        const { firstName, lastName, goldWeight, goldPurchasePrice, formOfGold, purityOfGold } = req.body;

        // Fetch the latest gold master data
        const goldMaster = await GoldMasterModel.findOne().sort({ createdAt: -1 });

        if (!goldMaster) {
            return res.status(statusCode.BAD_REQUEST).json({ message: message.goldNotFetch });
        }

        // Destructure values from goldMaster
        const { goldRate22KPerGram, goldRate24KPerGram, gst, makingChargesPerGram } = goldMaster;

        // Determine the gold rate based on purity
        const goldCurrentPricePerGram = purityOfGold === 22 ? goldRate22KPerGram : goldRate24KPerGram;

       // Perform calculations using provided making charges
       const goldCurrentValue = goldCurrentPricePerGram * goldWeight;
       const calculatedMakingCharges = (goldCurrentPricePerGram * goldWeight) * (makingChargesPerGram / 100);
       const totalGoldPrice = calculatedMakingCharges + goldCurrentValue;
       const calculatedGst = (gst / 100) * totalGoldPrice;
       let totalReturnAmount = totalGoldPrice + calculatedGst;
       let profit = totalReturnAmount - goldPurchasePrice;

       // Round the values to remove decimal places
       totalReturnAmount = Math.round(totalReturnAmount);
       profit = Math.round(profit);

        // Update the gold record
        const updatedGoldRecord = await GoldModel.findByIdAndUpdate(id, {
            firstName,
            lastName,
            goldWeight,
            goldPurchasePrice,
            formOfGold,
            purityOfGold,
            totalReturnAmount,
            profit
        }, { new: true });

        if (!updatedGoldRecord) {
            return res.status(statusCode.NOT_FOUND).json({ message: message.goldNotFound });
        }

        return res.status(statusCode.OK).json({ message: message.goldInfoUpdate, data: updatedGoldRecord });

    } catch (error) {
        console.error(error);
        return res.status(statusCode.INTERNAL_SERVER_ERROR).json({ message: message.internalError });
    }
};


// Delete a gold record
exports.deleteGoldRecord = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedGoldRecord = await GoldModel.findByIdAndDelete(id);

        if (!deletedGoldRecord) {
            return res.status(statusCode.NOT_FOUND).json({ message: message.goldNotFound });
        }

        return res.status(statusCode.OK).json({ message: message.goldInfoDelete });
    } catch (error) {
        console.error(error);
        return res.status(statusCode.INTERNAL_SERVER_ERROR).json({ message: message.internalError });
    }
};
