const FixedDepositModel = require('../models/FixedDeposit');
const { validateFixedDeposit } = require('../middlewares/fdValidation');
const fixedDepositRegister = async (req, res) => {
    try {
        const { firstName, lastName, fdNo, fdType, bankName, branchName, interestRate, startDate, maturityDate, totalInvestedAmount } = req.body;

        // Check if FD with the same fdNo already exists
        const fdExists = await FixedDepositModel.findOne({ fdNo });
        if (fdExists) {
            return res.status(400).json({ statusCode: 400, message: "FD already exists" });
        }

        // Create a new Fixed Deposit document
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

        // Save the new FD document
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
                            0 // Round to the nearest whole number
                        ]
                    }
                }
            }
        ]);

        // Update the document with the calculated fields
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

        // Respond with success message and updated FD data
        res.status(201).json({ statusCode: 201, message: "Fixed Deposit registered successfully", data: updatedFd });
    } catch (error) {
        console.log("Error while registering Fixed Deposit:", error);
        res.status(500).json({ statusCode: 500, message: "Error registering Fixed Deposit", error });
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
        res.status(500).json({ statusCode: 500, message: "Error deleting Fixed Deposit", error });
    }
};

const updateFixedDeposit = async (req, res) => {
    const { fdNo, firstName, lastName, fdType, bankName, branchName, interestRate, startDate, maturityDate, totalInvestedAmount } = req.body;

    // Validate FD data
    const { error } = validateFixedDeposit(req, res, () => { });
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }

    try {
        // Update FD document
        await FixedDepositModel.updateOne(
            { fdNo },
            {
                firstName,
                lastName,
                fdType,
                bankName,
                branchName,
                interestRate,
                startDate,
                maturityDate,
                totalInvestedAmount
            }
        );

        // Calculate current and total returns using aggregation pipeline
        const [updatedFd] = await FixedDepositModel.aggregate([
            { $match: { fdNo } },
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
                            0 // Round to the nearest whole number
                        ]
                    }
                }
            }
        ]);

        // Update the document with the calculated fields
        await FixedDepositModel.updateOne(
            { fdNo },
            {
                $set: {
                    tenureInYears: updatedFd.tenureInYears,
                    tenureCompletedYears: updatedFd.tenureCompletedYears,
                    currentReturnAmount: updatedFd.currentReturnAmount,
                    totalReturnedAmount: updatedFd.totalReturnedAmount
                }
            }
        );

        // Respond with success message and updated FD data
        res.status(200).json({ message: 'Fixed deposit updated successfully', data: updatedFd });
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
};


const getFdDetails = async (req, res) => {
    try {
        const details = await FixedDepositModel.aggregate([
            {
                $addFields: {
                    currentDate: new Date()
                }
            },
            {
                $addFields: {
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
                        SrNo: {
                            $documentNumber: {}
                        }
                    }
                }
            },
            {
                $project: {
                    SrNo: 1,
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
                }
            }
        ]);

        res.status(200).json(details);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};



const getFixedDepositById = async (req, res) => {
    try {
        const { id } = req.params;

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
                            0 // Round to the nearest whole number
                        ]
                    }
                }
            }
        ]);

        if (!fixedDeposit) {
            return res.status(404).json({ message: 'Fixed deposit not found' });
        }

        res.status(200).json(fixedDeposit);
    } catch (err) {
        res.status(500).json({ message: 'Internal server error' });
    }
};


module.exports = {
    fixedDepositRegister,
    fixedDepositDelete,
    updateFixedDeposit,
    getFdDetails,
    getFdById
};
