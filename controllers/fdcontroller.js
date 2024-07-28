//fdcontroller.js

const FixedDepositModel = require('../models/fixedDeposit');
const mongoose = require('mongoose');


// Register a Fixed Deposit
const fixedDepositRegister = async (req, res) => {
    try {
        const { firstName, lastName, fdNo, fdType, bankName, branchName, interestRate, startDate, maturityDate, userId, totalInvestedAmount } = req.body;

        // Ensure the authenticated user is registering the FD for themselves
        if (String(req.user.id) !== String(userId)) {
            return res.status(403).json({ statusCode: 403, message: "You are not authorized to register this FD" });
        }

        // Validate required fields
        if (!firstName || !lastName || !fdNo || !fdType || !bankName || !branchName || !interestRate || !startDate || !maturityDate || !userId || !totalInvestedAmount) {
            return res.status(400).json({ statusCode: 400, message: "All fields are required and must not be null" });
        }

        // Check if FD already exists
        const fdExists = await FixedDepositModel.findOne({ fdNo, userId });
        if (fdExists) {
            return res.status(400).json({ statusCode: 400, message: "FD already exists" });
        }

        // Create new FD
        const newFixedDeposit = new FixedDepositModel({
            firstName,
            lastName,
            fdNo,
            fdType,
            bankName,
            branchName,
            interestRate,
            startDate,
            maturityDate,
            totalInvestedAmount,
            userId
        });

        // Save new FD
        await newFixedDeposit.save();

        // Helper function to calculate quarterly compounded amount using MongoDB aggregation expressions
        const calculateCompoundedAmount = (principal, rate, time) => {
            return {
                $round: [
                    {
                        $multiply: [
                            principal,
                            {
                                $pow: [
                                    { $add: [1, { $divide: [rate, 400] }] },
                                    { $multiply: [time, 4] }
                                ]
                            }
                        ]
                    },
                    0
                ]
            };
        };

        // Calculate tenure in years for total and completed periods
        const totalYears = {
            $divide: [
                { $subtract: [new Date(maturityDate), new Date(startDate)] },
                1000 * 60 * 60 * 24 * 365
            ]
        };
        const completedYears = {
            $divide: [
                { $subtract: [new Date(), new Date(startDate)] },
                1000 * 60 * 60 * 24 * 365
            ]
        };

        // Aggregation pipeline for updating the FD with calculated fields
        const [updatedFd] = await FixedDepositModel.aggregate([
            { $match: { _id: newFixedDeposit._id } },
            {
                $addFields: {
                    tenureInYears: { $round: [totalYears, 0] },
                    tenureCompletedYears: { $round: [completedYears, 0] },
                    currentReturnAmount: calculateCompoundedAmount("$totalInvestedAmount", "$interestRate", completedYears),
                    totalReturnedAmount: calculateCompoundedAmount("$totalInvestedAmount", "$interestRate", totalYears),
                    currentProfitAmount: {
                        $subtract: [
                            calculateCompoundedAmount("$totalInvestedAmount", "$interestRate", completedYears),
                            "$totalInvestedAmount"
                        ]
                    },
                    totalYears: { $concat: [{ $toString: { $round: [totalYears, 0] } }, " Years"] }
                }
            }
        ]);

        // Ensure the aggregation returned a document
        if (!updatedFd) {
            console.error("Aggregation returned no documents");
            return res.status(500).json({ statusCode: 500, message: "Failed to update FD details" });
        }

        // Formatting dates
        const formatDate = (date) => {
            const d = new Date(date);
            const month = (d.getMonth() + 1).toString().padStart(2, '0');
            const day = d.getDate().toString().padStart(2, '0');
            const year = d.getFullYear();

            return [year, month, day].join('-');
        };

        // Update the new FD with the calculated fields and formatted dates
        const updatedFdResult = await FixedDepositModel.findByIdAndUpdate(
            newFixedDeposit._id,
            {
                currentReturnAmount: updatedFd.currentReturnAmount || 0,
                totalReturnedAmount: updatedFd.totalReturnedAmount || 0,
                currentProfitAmount: updatedFd.currentProfitAmount || 0,
                tenureCompletedYears: updatedFd.tenureCompletedYears || 0,
                totalYears: updatedFd.totalYears || "0 Years",
                startDate: formatDate(startDate), // Format the provided date directly
                maturityDate: formatDate(maturityDate) // Format the provided date directly
            },
            { new: true } // Return the updated document
        );

        if (!updatedFdResult) {
            console.error("Failed to update FD details after aggregation");
            return res.status(500).json({ statusCode: 500, message: "Failed to update FD details" });
        }

        // Format dates in the response
        const responseData = {
            ...updatedFdResult.toObject(),
            startDate: formatDate(updatedFdResult.startDate),
            maturityDate: formatDate(updatedFdResult.maturityDate)
        };

        // Send the response
        res.status(201).json({
            statusCode: 201,
            message: "FD registered successfully",
            data: responseData
        });
    } catch (error) {
        console.error("Error registering FD:", error);
        res.status(500).json({ statusCode: 500, message: "Internal server error" });
    }
};

// Update a Fixed Deposit
const updateFixedDeposit = async (req, res) => {
    try {
        const { fdId, userId, ...updateData } = req.body;

        // Validate fdId
        if (!mongoose.Types.ObjectId.isValid(fdId)) {
            return res.status(400).json({ statusCode: 400, message: 'Invalid Fixed Deposit ID' });
        }

        // Ensure the authenticated user is updating their own FD
        if (String(req.user.id) !== String(userId)) {
            return res.status(403).json({ statusCode: 403, message: "You are not authorized to update this FD" });
        }

        // Convert fdId to ObjectId
        const fdObjectId = new mongoose.Types.ObjectId(fdId);

        // Log the inputs
        console.log('Update Fixed Deposit Request:', { fdObjectId, userId, updateData });

        // Update the Fixed Deposit
        const updatedFdDocument = await FixedDepositModel.findOneAndUpdate(
            { _id: fdObjectId, userId: req.user.id },
            updateData,
            { new: true }
        );

        // Log the result of the findOneAndUpdate
        console.log('Updated Fixed Deposit Document:', updatedFdDocument);

        if (!updatedFdDocument) {
            return res.status(404).json({ statusCode: 404, message: 'Fixed deposit not found or you do not have permission to update it' });
        }

        const updatedFd = await FixedDepositModel.aggregate([
            { $match: { _id: fdObjectId, userId: new mongoose.Types.ObjectId(req.user.id) } },
            {
                $addFields: {
                    currentDate: new Date(),
                    tenureInYears: {
                        $round: [
                            {
                                $divide: [
                                    { $subtract: ["$maturityDate", "$startDate"] },
                                    1000 * 60 * 60 * 24 * 365
                                ]
                            },
                            0
                        ]
                    },
                    tenureCompletedYears: {
                        $round: [
                            {
                                $divide: [
                                    { $subtract: [new Date(), "$startDate"] },
                                    1000 * 60 * 60 * 24 * 365
                                ]
                            },
                            0
                        ]
                    }
                }
            },
            {
                $addFields: {
                    currentReturnAmount: {
                        $round: [
                            {
                                $cond: {
                                    if: { $gte: [new Date(), "$maturityDate"] },
                                    then: {
                                        $multiply: [
                                            "$totalInvestedAmount",
                                            { $pow: [{ $add: [1, { $divide: ["$interestRate", 100] }] }, "$tenureInYears"] }
                                        ]
                                    },
                                    else: {
                                        $multiply: [
                                            "$totalInvestedAmount",
                                            { $pow: [{ $add: [1, { $divide: ["$interestRate", 100] }] }, "$tenureCompletedYears"] }
                                        ]
                                    }
                                }
                            },
                            0
                        ]
                    },
                    totalReturnedAmount: {
                        $round: [
                            {
                                $multiply: [
                                    "$totalInvestedAmount",
                                    { $pow: [{ $add: [1, { $divide: ["$interestRate", 100] }] }, "$tenureInYears"] }
                                ]
                            },
                            0
                        ]
                    },
                    totalYears: {
                        $concat: [
                            { $toString: "$tenureInYears" },
                            { $cond: { if: { $eq: ["$tenureInYears", 1] }, then: " year", else: " years" } }
                        ]
                    }
                }
            }
        ]);

        // Log the result of the aggregation
        console.log('Updated Fixed Deposit Aggregation Result:', updatedFd);

        if (!updatedFd.length) {
            return res.status(404).json({ statusCode: 404, message: 'Fixed deposit not found or you do not have permission to view it' });
        }

        // Format dates
        updatedFd[0].startDate = formatDate(updatedFd[0].startDate);
        updatedFd[0].maturityDate = formatDate(updatedFd[0].maturityDate);

        res.status(200).json({ statusCode: 200, message: "Fixed Deposit updated successfully", data: updatedFd[0] });
    } catch (err) {
        console.error("Error while updating data:", err);
        res.status(500).json({ statusCode: 500, message: 'Internal server error' });
    }
};


// Delete a Fixed Deposit
const fixedDepositDelete = async (req, res) => {
    try {
        const { fdId } = req.body;

        // Validate fdId
        if (!mongoose.Types.ObjectId.isValid(fdId)) {
            return res.status(400).json({ statusCode: 400, message: 'Invalid Fixed Deposit ID' });
        }

        // Ensure the authenticated user is deleting their own FD
        const deletedFixedDeposit = await FixedDepositModel.findOneAndDelete({ _id: fdId, userId: req.user.id });
        if (!deletedFixedDeposit) {
            return res.status(404).json({ statusCode: 404, message: "Fixed Deposit not found or you do not have permission to delete it" });
        }

        res.status(200).json({ statusCode: 200, message: "Fixed Deposit deleted successfully" });
    } catch (error) {
        console.log("Error while deleting Fixed Deposit:", error);
        res.status(500).json({ statusCode: 500, message: "Error deleting Fixed Deposit", error });
    }
};


// Get all Fixed Deposit Details  
const getFdDetails = async (req, res) => {
    try {
        const details = await FixedDepositModel.aggregate([
            { $match: { userId: new mongoose.Types.ObjectId(req.user.id) } },
            {
                $addFields: {
                    currentDate: new Date(),
                    tenureInYears: {
                        $round: [
                            {
                                $divide: [
                                    { $subtract: ["$maturityDate", "$startDate"] },
                                    1000 * 60 * 60 * 24 * 365
                                ]
                            },
                            0
                        ]
                    },
                    tenureCompletedYears: {
                        $round: [
                            {
                                $divide: [
                                    { $subtract: [new Date(), "$startDate"] },
                                    1000 * 60 * 60 * 24 * 365
                                ]
                            },
                            0
                        ]
                    }
                }
            },
            {
                $addFields: {
                    currentReturnAmount: {
                        $round: [
                            {
                                $cond: {
                                    if: { $gte: [new Date(), "$maturityDate"] },
                                    then: {
                                        $multiply: [
                                            "$totalInvestedAmount",
                                            { $pow: [{ $add: [1, { $divide: ["$interestRate", 100] }] }, "$tenureInYears"] }
                                        ]
                                    },
                                    else: {
                                        $multiply: [
                                            "$totalInvestedAmount",
                                            { $pow: [{ $add: [1, { $divide: ["$interestRate", 100] }] }, "$tenureCompletedYears"] }
                                        ]
                                    }
                                }
                            },
                            0
                        ]
                    },
                    totalReturnedAmount: {
                        $round: [
                            {
                                $multiply: [
                                    "$totalInvestedAmount",
                                    { $pow: [{ $add: [1, { $divide: ["$interestRate", 100] }] }, "$tenureInYears"] }
                                ]
                            },
                            0
                        ]
                    },
                    totalYears: {
                        $concat: [
                            { $toString: "$tenureInYears" },
                            { $cond: { if: { $eq: ["$tenureInYears", 1] }, then: " year", else: " years" } }
                        ]
                    }
                }
            },
            {
                $setWindowFields: {
                    sortBy: { _id: 1 }, // Ensure consistent ordering
                    output: {
                        srNo: {
                            $rank: {} // Ranks documents sequentially starting from 1
                        }
                    }
                }
            }
        ]);

        res.status(201).json({ statusCode: 201, message: "Fixed Deposits fetched successfully", data: details });
    } catch (error) {
        console.error('Error fetching fixed deposits:', error);
        res.status(500).json({ statusCode: 500, message: 'Error fetching fixed deposits', error });
    }
};

// Get the Fixed Deposit by Id
const getFdById = async (req, res) => {
    try {
        const { fdId } = req.body;
        const userId = req.user.id;

        const details = await FixedDepositModel.aggregate([
            { 
                $match: { 
                    _id: new mongoose.Types.ObjectId(fdId), 
                    userId: new mongoose.Types.ObjectId(userId) 
                } 
            },
            {
                $addFields: {
                    currentDate: new Date(),
                    tenureInYears: {
                        $round: [
                            {
                                $divide: [
                                    { $subtract: ["$maturityDate", "$startDate"] },
                                    1000 * 60 * 60 * 24 * 365
                                ]
                            },
                            0
                        ]
                    },
                    tenureCompletedYears: {
                        $round: [
                            {
                                $divide: [
                                    { $subtract: [new Date(), "$startDate"] },
                                    1000 * 60 * 60 * 24 * 365
                                ]
                            },
                            0
                        ]
                    }
                }
            },
            {
                $addFields: {
                    currentReturnAmount: {
                        $round: [
                            {
                                $cond: {
                                    if: { $gte: [new Date(), "$maturityDate"] },
                                    then: {
                                        $multiply: [
                                            "$totalInvestedAmount",
                                            { $pow: [{ $add: [1, { $divide: ["$interestRate", 100] }] }, "$tenureInYears"] }
                                        ]
                                    },
                                    else: {
                                        $multiply: [
                                            "$totalInvestedAmount",
                                            { $pow: [{ $add: [1, { $divide: ["$interestRate", 100] }] }, "$tenureCompletedYears"] }
                                        ]
                                    }
                                }
                            },
                            0
                        ]
                    },
                    totalReturnedAmount: {
                        $round: [
                            {
                                $multiply: [
                                    "$totalInvestedAmount",
                                    { $pow: [{ $add: [1, { $divide: ["$interestRate", 100] }] }, "$tenureInYears"] }
                                ]
                            },
                            0
                        ]
                    },
                    totalYears: {
                        $concat: [
                            { $toString: "$tenureInYears" },
                            { $cond: { if: { $eq: ["$tenureInYears", 1] }, then: " year", else: " years" } }
                        ]
                    }
                }
            },
            {
                $project: {
                    _id: 1,
                    firstName: 1,
                    lastName: 1,
                    fdNo: 1,
                    fdType: 1,
                    bankName: 1,
                    branchName: 1,
                    interestRate: 1,
                    startDate: 1,
                    maturityDate: 1,
                    totalInvestedAmount: 1,
                    userId: 1,
                    currentProfitAmount: 1,
                    currentReturnAmount: 1,
                    totalReturnedAmount: 1,
                    totalYears: 1,
                }
            }
        ]);

        if (!details.length) {
            return res.status(404).json({ message: 'Fixed deposit not found' });
        }

        // Format the dates to YYYY-MM-DD without timezone
        details[0].startDate = formatDate(details[0].startDate);
        details[0].maturityDate = formatDate(details[0].maturityDate);

        console.log("Fetched data:", details[0]);

        res.status(200).json({ statusCode: 200, message: "Fixed Deposit fetched successfully", data: details[0] });
    } catch (error) {
        console.error('Error fetching fixed deposit:', error);
        res.status(500).json({ statusCode: 500, message: 'Error fetching fixed deposit', error });
    }
};

// Helper function to format dates to YYYY-MM-DD without timezone
const formatDate = (date) => {
    return date.toISOString().split('T')[0];
};

// Utility function to format dates
// const formatDate = (date) => {
//     const d = new Date(date);
//     const year = d.getFullYear();
//     const month = String(d.getMonth() + 1).padStart(2, '0');
//     const day = String(d.getDate()).padStart(2, '0');
//     return `${year}-${month}-${day}`;
// };


module.exports = {
    
    fixedDepositRegister,
    fixedDepositDelete,
    updateFixedDeposit,
    getFdDetails,
    getFdById
};
