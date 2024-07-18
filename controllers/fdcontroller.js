//fdcontroller.js

const FixedDepositModel = require('../models/FixedDeposit');
const mongoose = require('mongoose');
const {formatDate} =  require('../utils/utils');
 


 const fixedDepositRegister = async (req, res) => {
    try {
        const { firstName, lastName, fdNo, fdType, bankName, branchName, interestRate, startDate, maturityDate, totalInvestedAmount } = req.body;

        const fdExists = await FixedDepositModel.findOne({ fdNo });
        if (fdExists) {
            return res.status(400).json({ statusCode: 400, message: "FD already exists" });
        }

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
            totalInvestedAmount
        });

        await newFixedDeposit.save();

        const [updatedFd] = await FixedDepositModel.aggregate([
            { $match: { _id: newFixedDeposit._id } },
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
                    }
                }
            }
        ]);

        await FixedDepositModel.updateOne(
            { _id: newFixedDeposit._id },
            {
                $set: {
                    tenureInYears: updatedFd.tenureInYears,
                    tenureCompletedYears: updatedFd.tenureCompletedYears,
                    currentReturnAmount: updatedFd.currentReturnAmount,
                    totalReturnedAmount: updatedFd.totalReturnedAmount
                }
            }
        );

        // Format dates using formatDate utility function
        updatedFd.startDate = formatDate(updatedFd.startDate);
        updatedFd.maturityDate = formatDate(updatedFd.maturityDate);

        console.log("Fixed Deposit : " + updatedFd);

        res.status(201).json({ statusCode: 201, message: "Fixed Deposit registered successfully", data: updatedFd });
    } catch (error) {
        console.log("Error while registering Fixed Deposit:", error);
        res.status(500).json({ statusCode: 500, message: "Error registering Fixed Deposit", error });
    }
};

// Update Fixed Deposit
const updateFixedDeposit = async (req, res) => {
    const { id } = req.params;
    const { fdNo, firstName, lastName, fdType, bankName, branchName, interestRate, startDate, maturityDate, totalInvestedAmount } = req.body;

    try {
        const updatedFdDocument = await FixedDepositModel.findByIdAndUpdate(
            id,
            {
                fdNo,
                firstName,
                lastName,
                fdType,
                bankName,
                branchName,
                interestRate,
                startDate,
                maturityDate,
                totalInvestedAmount
            },
            { new: true }
        );

        if (!updatedFdDocument) {
            return res.status(404).json({ message: 'Fixed deposit not found' });
        }

        console.log("User entered data : " + updatedFdDocument)

        const [updatedFd] = await FixedDepositModel.aggregate([
            { $match: { _id: new mongoose.Types.ObjectId(id) } },
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
                    }
                }
            }
        ]);

        await FixedDepositModel.updateOne(
            { _id: new mongoose.Types.ObjectId(id) },
            {
                $set: {
                    tenureInYears: updatedFd.tenureInYears,
                    tenureCompletedYears: updatedFd.tenureCompletedYears,
                    currentReturnAmount: updatedFd.currentReturnAmount,
                    totalReturnedAmount: updatedFd.totalReturnedAmount
                }
            }
        );

        // Format dates using formatDate utility function
        updatedFd.startDate = formatDate(updatedFd.startDate);
        updatedFd.maturityDate = formatDate(updatedFd.maturityDate);
        console.log("Updated data : " + updatedFd);

        res.status(201).json({ statusCode: 201, message: "Fixed Deposit updated successfully", data: updatedFd });


    } catch (err) {
        console.log("Error while updating data")
        res.status(500).json({ error: 'Internal server error' });
    }
};

const fixedDepositDelete = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedFixedDeposit = await FixedDepositModel.findByIdAndDelete(id);
        if (!deletedFixedDeposit) {
            return res.status(404).json({ error: "Fixed Deposit not found" });
        }
        res.status(200).json({ message: "Fixed Deposit deleted successfully" });
    } catch (error) {
        console.log("Error while deleting Fixed Deposit:", error);
        res.status(500).json({ statusCode: 500, message: "Error deleting Fixed Deposit", error });
    }
};

const getFdDetails = async (req, res) => {
    try {
        const details = await FixedDepositModel.aggregate([
            {
                $addFields: {
                    currentDate: new Date(),
                    startDate: { $toDate: "$startDate" },
                    maturityDate: { $toDate: "$maturityDate" }
                }
            },
            {
                $addFields: {
                    tenureInYears: {
                        $round: [
                            { 
                                $divide: [
                                    { $subtract: ["$maturityDate", "$startDate"] },
                                    1000 * 60 * 60 * 24 * 365
                                ]
                            },
                            0 // Round to the nearest whole number
                        ]
                    },
                    tenureCompletedYears: {
                        $round: [
                            { 
                                $divide: [
                                    { $subtract: ["$currentDate", "$startDate"] },
                                    1000 * 60 * 60 * 24 * 365
                                ]
                            },
                            0 // Round to the nearest whole number
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
                                    if: { $gte: ["$currentDate", "$maturityDate"] },
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
                            0 // Round to the nearest whole number
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
                            0 // Round to the nearest whole number
                        ]
                    }
                }
            },
            {
                $setWindowFields: {
                    sortBy: { _id: 1 },
                    output: {
                        srNo: { $documentNumber: {} }
                    }
                }
            },
            {
                $project: {
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
                    currentReturnAmount: 1,
                    totalReturnedAmount: 1,
                    srNo: 1
                }
            }
        ]);

        // Format dates using formatDate utility function
        details.forEach(fd => {
            fd.startDate = formatDate(fd.startDate);
            fd.maturityDate = formatDate(fd.maturityDate);
        });

        console.log("All FD details : " + details)
        res.status(200).json({statusCode: 200, message: "Fixed Deposits Fetched Successfully", data : details });

    } catch (err) {
        console.log("Error while fetching Fixed Deposit " + err); // Log the error details
        res.status(500).json({ statusCode: 500, message: "Error fetching Fixed Deposit", error });
    }
};




const getFdById = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if the id is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid Fixed Deposit ID' });
        }

        const [fixedDeposit] = await FixedDepositModel.aggregate([
            { $match: { _id: new mongoose.Types.ObjectId(id) } },
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
                            0 // Round to the nearest whole number
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
                            0 // Round to the nearest whole number
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
                            0 // Round to the nearest whole number
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
                    }
                }
            }
        ]);

        if (!fixedDeposit) {
            return res.status(404).json({ message: 'Fixed deposit not found' });
        }

        // Format dates using formatDate utility function
        fixedDeposit.startDate = formatDate(fixedDeposit.startDate);
        fixedDeposit.maturityDate = formatDate(fixedDeposit.maturityDate);

        res.status(200).json({statusCode: 200, message: "Fixed Deposit By Id Fetched Successfully", data : fixedDeposit });
        console.log("FD Details by Id : " + fixedDeposit);
    } catch (err) {
        console.log("Error while fetching details by id  " + err); // Log the error details
        res.status(500).json({statusCode: 500, message: 'Internal server error', error: err.message });
    }
};





module.exports = {
    fixedDepositRegister,
    fixedDepositDelete,
    updateFixedDeposit,
    getFdDetails,
    getFdById
};
