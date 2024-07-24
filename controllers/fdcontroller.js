//fdcontroller.js

const FixedDepositModel = require('../models/FixedDeposit');
const mongoose = require('mongoose');
const {formatDate} =  require('../utils/utils');
 

// Register FixedDeposit
const fixedDepositRegister = async (req, res) => {
    try {
        const { firstName, lastName, fdNo, fdType, bankName, branchName, interestRate, startDate, maturityDate, totalInvestedAmount, userId} = req.body;

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
            totalInvestedAmount, 
            userId
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

        await FixedDepositModel.updateOne(
            { _id: newFixedDeposit._id },
            {
                $set: {
                    tenureInYears: updatedFd.tenureInYears,
                    tenureCompletedYears: updatedFd.tenureCompletedYears,
                    currentReturnAmount: updatedFd.currentReturnAmount,
                    totalReturnedAmount: updatedFd.totalReturnedAmount,
                    totalYears: updatedFd.totalYears
                }
            }
        );

        updatedFd.startDate = formatDate(updatedFd.startDate);
        updatedFd.maturityDate = formatDate(updatedFd.maturityDate);

        console.log("Fixed Deposit : " + updatedFd);

        res.status(201).json({ statusCode: 201, message: "Fixed Deposit registered successfully", data: updatedFd });
    } catch (error) {
        console.log("Error while registering Fixed Deposit:", error);
        res.status(500).json({ statusCode: 500, message: "Error registering Fixed Deposit", error });
    }
};



// Update a Fixed Deposit
const updateFixedDeposit = async (req, res) => {
    const { id } = req.params;
    const {fdNo, firstName, lastName, fdType, bankName, branchName, interestRate, startDate, maturityDate, totalInvestedAmount } = req.body;

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

        await FixedDepositModel.updateOne(
            { _id: new mongoose.Types.ObjectId(id) },
            {
                $set: {
                    tenureInYears: updatedFd.tenureInYears,
                    tenureCompletedYears: updatedFd.tenureCompletedYears,
                    currentReturnAmount: updatedFd.currentReturnAmount,
                    totalReturnedAmount: updatedFd.totalReturnedAmount,
                    totalYears: updatedFd.totalYears
                }
            }
        );

        updatedFd.startDate = formatDate(updatedFd.startDate);
        updatedFd.maturityDate = formatDate(updatedFd.maturityDate);
        console.log("Updated data : " + updatedFd);

        res.status(201).json({ statusCode: 201, message: "Fixed Deposit updated successfully", data: updatedFd });
    } catch (err) {
        console.log("Error while updating data");
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Delete a Fixed Deposit

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


// Get all Fixed Deposit Details  
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
                $group: {
                    _id: null,
                    docs: { $push: "$$ROOT" }
                }
            },
            {
                $set: {
                    docs: {
                        $zip: {
                            inputs: ["$docs", { $range: [1, { $add: [1, { $size: "$docs" }] }] }],
                            useLongestLength: true
                        }
                    }
                }
            },
            { $unwind: "$docs" },
            {
                $replaceRoot: {
                    newRoot: {
                        $mergeObjects: ["$$ROOT", { srNo: { $arrayElemAt: ["$docs", 1] } }, { $arrayElemAt: ["$docs", 0] }]
                    }
                }
            },
            { $project: { docs: 0} }
        ]);

        details.forEach(fd => {
            fd.startDate = formatDate(fd.startDate);
            fd.maturityDate = formatDate(fd.maturityDate);
        });

        console.log(details);

        res.status(201).json({ statusCode: 201, message: "Fixed Deposits fetched successfully", data: details });
    } catch (error) {
        console.error('Error fetching fixed deposits:', error);
        res.status(500).json({ statusCode: 500, message: 'Error fetching fixed deposits', error });
    }
};



// Get the Fixed Deposit by Id

const getFdById = async (req, res) => {
    try {
        const { id } = req.params;
        const details = await FixedDepositModel.aggregate([
            { $match: { _id: new mongoose.Types.ObjectId(id) } },
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

        if (!details.length) {
            return res.status(404).json({ message: 'Fixed deposit not found' });
        }

        const fixedDeposit = details[0];
        fixedDeposit.startDate = formatDate(fixedDeposit.startDate);
        fixedDeposit.maturityDate = formatDate(fixedDeposit.maturityDate);

        console.log(fixedDeposit);

        res.status(201).json({ statusCode: 201, message: "Fixed Deposit fetched successfully", data: fixedDeposit });
    } catch (error) {
        console.error('Error fetching fixed deposit:', error);
        res.status(500).json({ statusCode: 500, message: 'Error fetching fixed deposit', error });
    }
};


module.exports = {
    fixedDepositRegister,
    fixedDepositDelete,
    updateFixedDeposit,
    getFdDetails,
    getFdById
};
