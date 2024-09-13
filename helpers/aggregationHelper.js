// aggregationHelper.js

const commonAggregationStages = (startDate, maturityDate, totalInvestedAmount, interestRate) => {
  return [
    {
      $addFields: {
        startDate: new Date(startDate),
        maturityDate: new Date(maturityDate),
        currentDate: new Date(),
      }
    },
    {
      $addFields: {
        tenureInYears: { 
          $divide: [{ $subtract: ["$maturityDate", "$startDate"] }, 1000 * 60 * 60 * 24 * 365] 
        },
        tenureCompletedYears: { 
          $divide: [{ $subtract: ["$currentDate", "$startDate"] }, 1000 * 60 * 60 * 24 * 365] 
        }
      } 
    },
    {
      $addFields: {
        currentReturnAmount: {
          $trunc: {
            $add: [
              totalInvestedAmount,
              { 
                $multiply: [
                  totalInvestedAmount, 
                  { $divide: [{ $multiply: [interestRate, "$tenureCompletedYears"] }, 100] }
                ]
              }
            ]
          }
        },
        totalReturnedAmount: {
          $trunc: {
            $add: [
          totalInvestedAmount,
              { 
                $multiply: [
                  totalInvestedAmount, 
                  { $divide: [{ $multiply: [interestRate, "$tenureInYears"] }, 100] }
                ]
              }
            ]
          }
        },
        currentProfitAmount: {
          $trunc: {
            $subtract: [
              { $add: [
                totalInvestedAmount,
                { 
                  $multiply: [
                    totalInvestedAmount, 
                    { $divide: [{ $multiply: [interestRate, "$tenureCompletedYears"] }, 100] }
                  ]
                }
              ]},
              totalInvestedAmount
            ]
          }
        }
      }
    },
    {
      $addFields: {
        totalYears: {
          $ceil: "$tenureInYears" // Use $ceil to ensure totalYears is correctly rounded up
        }
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
  ...commonAggregationStages(startDate, maturityDate, totalInvestedAmount, interestRate)
];

module.exports = {
  registerFdAggregation,
  updateFdAggregation
};
