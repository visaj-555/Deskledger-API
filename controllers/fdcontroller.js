//fdcontroller.js

const FixedDepositModel = require('../models/fixedDeposit');
const mongoose = require('mongoose');
const moment = require('moment'); 
const FdAnalysisModel = require('../models/fdAnalysis');


// Register a Fixed Deposit
const fixedDepositRegister = async (req, res) => {
    try {
        const { firstName, lastName, fdNo, fdType, bankName, branchName, interestRate, startDate, maturityDate, totalInvestedAmount } = req.body;
        const userId = req.user.id;

        // Ensure the authenticated user is registering the FD for themselves
        if (String(req.user.id) !== String(userId)) {
            return res.status(403).json({ statusCode: 403, message: "FD already exists" });
        }

        // Validate required field
        if (!firstName || !lastName || !fdNo || !fdType || !bankName || !branchName || !interestRate || !startDate || !maturityDate || !userId || !totalInvestedAmount) {
            return res.status(400).json({ statusCode: 400, message: "All fields are required and must not be null" });
        }

        // Check if FD already exists
        const fdExists = await FixedDepositModel.findOne({ fdNo, userId });
        if (fdExists) {
            return res.status(400).json({ statusCode: 400, message: "FD already exists" });
        }

        // Format dates to 'YYYY-MM-DD'
        const formatDate = (date) => {
            const d = new Date(date);
            let month = '' + (d.getMonth() + 1);
            let day = '' + d.getDate();
            const year = d.getFullYear();
          
            if (month.length < 2) month = '0' + month;
            if (day.length < 2) day = '0' + day;
          
            return [year, month, day].join('-');
        };

        const formattedStartDate = formatDate(startDate);
        const formattedMaturityDate = formatDate(maturityDate);

        // Create new FD with formatted dates
        const newFixedDeposit = new FixedDepositModel({
            firstName,
            lastName,
            fdNo,
            fdType,
            bankName,
            branchName,
            interestRate,
            startDate: formattedStartDate,
            maturityDate: formattedMaturityDate,
            totalInvestedAmount,
            userId
        });

        // Save new FD
        await newFixedDeposit.save();

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
                    currentReturnAmount: {
                        $round: [
                            {
                                $add: [
                                    "$totalInvestedAmount",
                                    {
                                        $multiply: [
                                            "$totalInvestedAmount",
                                            {
                                                $divide: [
                                                    {
                                                        $multiply: ["$interestRate", completedYears]
                                                    },
                                                    100
                                                ]
                                            }
                                        ]
                                    }
                                ]
                            },
                            0
                        ]
                    },
                    totalReturnedAmount: {
                        $round: [
                            {
                                $add: [
                                    "$totalInvestedAmount",
                                    {
                                        $multiply: [
                                            "$totalInvestedAmount",
                                            {
                                                $divide: [
                                                    {
                                                        $multiply: ["$interestRate", totalYears]
                                                    },
                                                    100
                                                ]
                                            }
                                        ]
                                    }
                                ]
                            },
                            0
                        ]
                    },
                    currentProfitAmount: {
                        $round: [
                            {
                                $subtract: [
                                    {
                                        $add: [
                                            "$totalInvestedAmount",
                                            {
                                                $multiply: [
                                                    "$totalInvestedAmount",
                                                    {
                                                        $divide: [
                                                            {
                                                                $multiply: ["$interestRate", completedYears]
                                                            },
                                                            100
                                                        ]
                                                    }
                                                ]
                                            }
                                        ]
                                    },
                                    "$totalInvestedAmount"
                                ]
                            },
                            0
                        ]
                    },
                    totalYears: { $concat: [{ $toString: { $round: [totalYears, 0] } }] }
                }
            }
        ]);

        // Ensure the aggregation returned a document
        if (!updatedFd) {
            console.error("Aggregation returned no documents");
            return res.status(500).json({ statusCode: 500, message: "Failed to update FD details" });
        }

        // Update the new FD with the calculated fields
        const updatedFdResult = await FixedDepositModel.findByIdAndUpdate(
            newFixedDeposit._id,
            {
                currentReturnAmount: updatedFd.currentReturnAmount || 0,
                totalReturnedAmount: updatedFd.totalReturnedAmount || 0,
                currentProfitAmount: updatedFd.currentProfitAmount || 0,
                tenureCompletedYears: updatedFd.tenureCompletedYears || 0,
                totalYears: updatedFd.totalYears || 0,
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
        const { id } = req.params;
        const userId = req.user.id;
        const { ...updateData } = req.body;

        // Validate fdId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ statusCode: 400, message: 'Invalid Fixed Deposit ID' });
        }

        // Ensure the authenticated user is updating their own FD
        if (String(req.user.id) !== String(userId)) {
            return res.status(403).json({ statusCode: 403, message: "You are not authorized to update this FD" });
        }

        // Convert fdId to ObjectId
        const fdObjectId = new mongoose.Types.ObjectId(id);

        console.log('Update Fixed Deposit Request:', { fdObjectId, userId, updateData });

        // Update the Fixed Deposit
        const updatedFdDocument = await FixedDepositModel.findOneAndUpdate(
            { _id: fdObjectId, userId: req.user.id },
            updateData,
            { new: true }
        );

        console.log('Updated Fixed Deposit Document:', updatedFdDocument);

        if (!updatedFdDocument) {
            return res.status(404).json({ statusCode: 404, message: 'Fixed deposit not found or you do not have permission to update it' });
        }

        // Perform aggregation to calculate fields
        const updatedFdAggregation = await FixedDepositModel.aggregate([
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
                                $add: [
                                    "$totalInvestedAmount",
                                    {
                                        $multiply: [
                                            "$totalInvestedAmount",
                                            {
                                                $divide: [
                                                    "$interestRate",
                                                    100
                                                ]
                                            },
                                            "$tenureCompletedYears"
                                        ]
                                    }
                                ]
                            },
                            0
                        ]
                    },
                    totalReturnedAmount: {
                        $round: [
                            {
                                $add: [
                                    "$totalInvestedAmount",
                                    {
                                        $multiply: [
                                            "$totalInvestedAmount",
                                            {
                                                $divide: [
                                                    "$interestRate",
                                                    100
                                                ]
                                            },
                                            "$tenureInYears"
                                        ]
                                    }
                                ]
                            },
                            0
                        ]
                    },
                    currentProfitAmount: {
                        $round: [
                            {
                                $subtract: [
                                    {
                                        $add: [
                                            "$totalInvestedAmount",
                                            {
                                                $multiply: [
                                                    "$totalInvestedAmount",
                                                    {
                                                        $divide: [
                                                            {
                                                                $multiply: ["$interestRate", "$tenureCompletedYears"]
                                                            },
                                                            100
                                                        ]
                                                    }
                                                ]
                                            }
                                        ]
                                    },
                                    "$totalInvestedAmount"
                                ]
                            },
                            0
                        ]
                    },
                    totalYears: {
                        $concat: [
                            { $toString: "$tenureInYears" },
                        ]
                    }
                }
            }
        ]);

        console.log('Updated Fixed Deposit Aggregation Result:', updatedFdAggregation);

        if (!updatedFdAggregation.length) {
            return res.status(404).json({ statusCode: 404, message: 'Fixed deposit not found or you do not have permission to view it' });
        }

        const aggregatedData = updatedFdAggregation[0];

        // Update the Fixed Deposit with aggregated values
        const finalUpdatedFd = await FixedDepositModel.findOneAndUpdate(
            { _id: fdObjectId, userId: req.user.id },
            {
                currentProfitAmount: aggregatedData.currentProfitAmount,
                currentReturnAmount: aggregatedData.currentReturnAmount,
                totalReturnedAmount: aggregatedData.totalReturnedAmount,
                totalYears: aggregatedData.totalYears
            },
            { new: true }
        );

        console.log('Final Updated Fixed Deposit:', finalUpdatedFd);

        // Format dates
        finalUpdatedFd.startDate = formatDate(finalUpdatedFd.startDate);
        finalUpdatedFd.maturityDate = formatDate(finalUpdatedFd.maturityDate);

        res.status(200).json({ statusCode: 200, message: "Fixed Deposit updated successfully", data: finalUpdatedFd });
    } catch (err) {
        console.error("Error while updating data:", err);
        res.status(500).json({ statusCode: 500, message: 'Internal server error' });
    }
};


// Delete a Fixed Deposit
const fixedDepositDelete = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate fdId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ statusCode: 400, message: 'Invalid Fixed Deposit ID' });
        }

        // Ensure the authenticated user is deleting their own FD
        const deletedFixedDeposit = await FixedDepositModel.findOneAndDelete({ _id: id, userId: req.user.id });
        if (!deletedFixedDeposit) {
            return res.status(404).json({ statusCode: 404, message: "Fixed Deposit not found or you do not have permission to delete it" });
        }

        // Delete the associated FD Analysis data
        await FdAnalysisModel.deleteOne({ userId: req.user.id });

        res.status(200).json({ statusCode: 200, message: "Fd Deleted Successfully" });
    } catch (error) {
        console.error("Error while deleting Fixed Deposit:", error.message || error);
        res.status(500).json({ statusCode: 500, message: "Error deleting Fixed Deposit", error: error.message || error });
    }
};


// Get all Fixed Deposit Details  
const getFdDetails = async (req, res) => {
    try {
        const userId = req.user.id;

        // Fetch all FDs for the authenticated user, sorted by createdAt date
        const fdDetails = await FixedDepositModel.find({ userId }).sort({ createdAt: 1 }).lean();

        if (!fdDetails.length) {
            return res.status(200).json({ statusCode: 200, message: 'No Fixed Deposits found for this user', data: fdDetails });
        }

        // Debugging: Check the raw data before formatting
        console.log('FD Details before formatting:', fdDetails);

        // Format the dates and add srNo starting from 1
        const formattedFdDetails = fdDetails.map((fd, index) => {
            const srNo = index + 1; // Ensure srNo starts from 1
            console.log(`Index: ${index}, Assigned srNo: ${srNo}, FD ID: ${fd._id}`);

            // Add srNo to the plain object
            fd.srNo = srNo;

            // Format dates
            fd.createdAt = moment(fd.createdAt).format('YYYY-MM-DD');
            fd.updatedAt = moment(fd.updatedAt).format('YYYY-MM-DD');
            fd.maturityDate = moment(fd.maturityDate).format('YYYY-MM-DD');
            fd.startDate = moment(fd.startDate).format('YYYY-MM-DD');

            return fd;
        });

        // Debugging: Check the formatted data before sending the response
        console.log('Formatted FD Details:', formattedFdDetails);

        res.status(200).json({ statusCode: 200, message: "Fixed Deposits retrieved successfully", data: formattedFdDetails });
    } catch (err) {
        console.error("Error while fetching Fixed Deposit details:", err);
        res.status(500).json({ statusCode: 500, message: 'Internal server error' });
    }
};


// Get the Fixed Deposit by Id
const getFdById = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params; // Assume FD ID is passed as a URL parameter

        // Fetch the specific FD for the authenticated user
        const fdDetail = await FixedDepositModel.findOne({ _id: id, userId: userId });

        if (!fdDetail) {
            return res.status(404).json({ statusCode: 404, message: 'Fixed Deposit not found' });
        }

        // Format the dates
        const formattedFdDetail = {
            ...fdDetail.toObject(),
            createdAt: moment(fdDetail.createdAt).format('YYYY-MM-DD'),
            updatedAt: moment(fdDetail.updatedAt).format('YYYY-MM-DD'),
            maturityDate: moment(fdDetail.maturityDate).format('YYYY-MM-DD'),
            startDate: moment(fdDetail.startDate).format('YYYY-MM-DD')

        };

        res.status(200).json({ statusCode: 200, message: "Fixed Deposit retrieved successfully", data: formattedFdDetail });
    } catch (err) {
        console.error("Error while fetching Fixed Deposit detail:", err);
        res.status(500).json({ statusCode: 500, message: 'Internal server error' });
    }
};
const formatDate = (date) => {
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();
  
    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;
  
    return [year, month, day].join('-');
  };

module.exports = {
    
    fixedDepositRegister,
    fixedDepositDelete,
    updateFixedDeposit,
    getFdDetails,
    getFdById, 
};
  