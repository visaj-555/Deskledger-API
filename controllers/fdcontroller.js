const FixedDepositModel = require('../models/FixedDeposit');

const fixedDepositRegister = async (req, res) => {  // Registering FixedDeposit Details from user 
    try {
        const {firstName, lastName, fdNo, fdType, bankName, branchName, interestRate, startDate, maturityDate, totalInvestedAmount } = req.body;
        console.log("Request Body : ", req.body);
        const fdExists = await FixedDepositModel.findOne({fdNo});
        if (fdExists) {
            return res.status(400).json({ statusCode: 400, message: "FD already exists" });
        }

        const newfixedDeposit = new FixedDepositModel({ firstName, lastName, fdNo, fdType, bankName, branchName, interestRate, startDate, maturityDate, totalInvestedAmount });
        
        console.log(newfixedDeposit);
        const savedFD = await newfixedDeposit.save();
        res.status(201).json({ statusCode: 201, message: "Fixed Deposit registered successfully", data: { ...savedFD.toObject()} });
    } catch (error) {
        console.log("Error while registering Fixed Deposit:", error);
        res.status(500).json({ statusCode: 500, message: "Error registering Fixed Deposit", error });    
    }
};

const fixedDepositDelete = async (req, res) => {  // Deleting FixedDeposit
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

    // Validate the request body
    const { error } = validateFixedDeposit(req, res, () => {});
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }

    try {
        // Find the fixed deposit by FD number and update it
        const updatedFD = await FixedDeposit.findOneAndUpdate(
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
            },
            { new: true, runValidators: true }
        );

        if (!updatedFD) {
            return res.status(404).json({ error: 'Fixed deposit not found' });
        }

        res.status(200).json({ message: 'Fixed deposit updated successfully', fixedDeposit: updatedFD });
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
};


const getFdDetails = async (req, res) => {
    try {
      const details = await FixedDepositModel.aggregate([
        {
          $addFields: {
            currentDate: new Date() // Add the current date to the document
          }
        },
        {
          $addFields: {
            startDate: { $toDate: "$startDate" }, // Convert startDate to Date
            maturityDate: { $toDate: "$maturityDate" } // Convert maturityDate to Date
          }
        },
        {
          $addFields: {
            tenureInYears: {
              $dateDiff: {
                startDate: "$startDate",
                endDate: "$maturityDate",
                unit: "year"
              }
            },
            tenureInMonths: {
              $dateDiff: {
                startDate: "$startDate",
                endDate: "$maturityDate",
                unit: "month"
              }
            },
            tenureCompletedYears: {
              $dateDiff: {
                startDate: "$startDate",
                endDate: "$currentDate",
                unit: "year"
              }
            },
            tenureCompletedMonths: {
              $dateDiff: {
                startDate: "$startDate",
                endDate: "$currentDate",
                unit: "month"
              }
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
            currentProfitPercentage: {
              $round: [
                {
                  $multiply: [
                    {
                      $divide: [
                        {
                          $subtract: [
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
                            "$totalInvestedAmount"
                          ]
                        },
                        "$totalInvestedAmount"
                      ]
                    },
                    100
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
                    "$totalInvestedAmount"
                  ]
                },
                0
              ]
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
            tenureInYears: 1,
            tenureInMonths: 1,
            currentReturnAmount: 1,
            totalReturnedAmount: 1,
            currentProfitPercentage: 1,
            currentProfitAmount: 1
          }
        }
      ]);
  
      res.status(200).json(details);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };
  

module.exports = {
    fixedDepositRegister,
    fixedDepositDelete,
    getFdDetails,
    updateFixedDeposit
   
};
