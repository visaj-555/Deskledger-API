const NationalPensionScheme = require ('../models/nationalPensionScheme'); 
const mongoose = require('mongoose');
const moment = require('moment');

// Register NPS Details 

// const registerNPS = function async (req, res) => {
//     try {
//         const firstName, lastName, pranNo, accountType, startDate, maturityDate, tenure, pensionFund, investmentOption, investedAmount, recentlyInvestedAmount = req.body; 

//         const npsExists =  await NationalPensionScheme.findOne({pranNo});

//         if (npsExists) 
//         {
//             return res.status(400).json({statusCode : 400, message: 'NPS already exists '});
//         }

//     }
// }