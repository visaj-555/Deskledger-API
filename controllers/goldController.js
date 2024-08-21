const GoldModel = require('../models/goldModel');
const GoldMasterModel = require('../models/goldMaster');
const { message, statusCode } = require('../utils/api.response');

// Create a new gold record
exports.createGoldRecord = async (req, res) => {
    try {
        const { firstName, lastName, goldWeight, goldPurchasePrice, formOfGold, purityOfGold } = req.body;
        const userId = req.user.id; // Get the user ID from the authenticated request

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
            profit,
            userId // Associate the gold record with the authenticated user
        });

        // Save the new record to the database
        const saveGoldInfo = await newGoldRecord.save();

        return res.status(statusCode.CREATED).json({ message: message.goldInfoRegister, data: saveGoldInfo });

    } catch (error) {
        console.error(error);
        return res.status(statusCode.INTERNAL_SERVER_ERROR).json({ message: message.internalError });
    }
};

// Get all gold records for the authenticated user
exports.getAllGoldRecords = async (req, res) => {
    try {
        const userId = req.user.id; // Get the user ID from the authenticated request
        const goldRecords = await GoldModel.find({ userId }).populate('goldMasterId'); // Fetch records for this user
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
        const userId = req.user.id; // Get the user ID from the authenticated request
        const goldRecord = await GoldModel.findOne({ _id: id, userId }).populate('goldMasterId'); // Ensure the record belongs to the user

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
        const userId = req.user.id; // Get the user ID from the authenticated request

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

        // Update the gold record, ensuring it belongs to the authenticated user
        const updatedGoldRecord = await GoldModel.findOneAndUpdate(
            { _id: id, userId }, // Ensure the record belongs to the user
            {
                firstName,
                lastName,
                goldWeight,
                goldPurchasePrice,
                formOfGold,
                purityOfGold,
                totalReturnAmount,
                profit
            },
            { new: true }
        );

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
        const userId = req.user.id; // Get the user ID from the authenticated request

        // Ensure the gold record belongs to the authenticated user
        const deletedGoldRecord = await GoldModel.findOneAndDelete({ _id: id, userId });

        if (!deletedGoldRecord) {
            return res.status(statusCode.NOT_FOUND).json({ message: message.goldNotFound });
        }

        return res.status(statusCode.OK).json({ message: message.goldInfoDelete });
    } catch (error) {
        console.error(error);
        return res.status(statusCode.INTERNAL_SERVER_ERROR).json({ message: message.internalError });
    }
};
