//aggregationHelper.js

// Helper function to generate common aggregation stages
const commonAggregationStages = (startDate, maturityDate, totalInvestedAmount, interestRate) => {
  const currentDate = new Date();
  const tenureInYears = { 
    $round: [{ $divide: [{ $subtract: [new Date(maturityDate), new Date(startDate)] }, 1000 * 60 * 60 * 24 * 365] }, 0] 
  };
  const tenureCompletedYears = { 
    $round: [{ $divide: [{ $subtract: [currentDate, new Date(startDate)] }, 1000 * 60 * 60 * 24 * 365] }, 0] 
  };

  return [
    {
      $addFields: {
        tenureInYears,
        tenureCompletedYears
      }
    },
    {
      $addFields: {
        currentReturnAmount: {
          $round: [{
            $add: [
              totalInvestedAmount,
              { $multiply: [totalInvestedAmount, { $divide: [{ $multiply: [interestRate, "$tenureCompletedYears"] }, 100] }] }
            ]
          }, 0]
        },
        totalReturnedAmount: {
          $round: [{
            $add: [
              totalInvestedAmount,
              { $multiply: [totalInvestedAmount, { $divide: [{ $multiply: [interestRate, "$tenureInYears"] }, 100] }] }
            ]
          }, 0]
        },
        currentProfitAmount: {
          $round: [{
            $subtract: [
              { $add: [
                totalInvestedAmount,
                { $multiply: [totalInvestedAmount, { $divide: [{ $multiply: [interestRate, "$tenureCompletedYears"] }, 100] }] }
              ]},
              totalInvestedAmount
            ]
          }, 0]
        }
      }
    },
    {
      $addFields: {
        totalYears: { $toString: "$tenureInYears" }
      }
    }
  ];
};

// Aggregation pipeline for registering a new FD
const registerFdAggregation = (fdId, startDate, maturityDate, totalInvestedAmount, interestRate) => [
  { $match: { _id: fdId } },
  ...commonAggregationStages(startDate, maturityDate, totalInvestedAmount, interestRate)
];

// Aggregation pipeline for updating an FD
const updateFdAggregation = (fdId, startDate, maturityDate, totalInvestedAmount, interestRate) => [
  { $match: { _id: fdId } },
  {
    $addFields: { currentDate: new Date() }
  },
  ...commonAggregationStages(startDate, maturityDate, totalInvestedAmount, interestRate)
];


module.exports = {
  registerFdAggregation,
  updateFdAggregation
};
