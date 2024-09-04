const express = require("express");
const router = express.Router();

// Importing all the controllers and functions

//USER 
const {
  registerUser,
  loginUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  changePassword, 
  forgotPassword,
  resetPassword, 
  newPassword
} = require("../controllers/userController");


// FIXED DEPOSIT
const {
  fixedDepositRegister,
  fixedDepositDelete,
  getFdDetails,
  updateFixedDeposit, 
  deleteMultipleFDs,
  getFdAnalysisbyNumber
} = require("../controllers/fdcontroller");

// GOLD
const {
  createGoldRecord,
  getAllGoldRecords,
  getGoldRecordById,
  updateGoldRecord,
  deleteGoldRecord,
  deleteMultipleGoldRecords, 
  getGoldAnalysis
} = require('../controllers/goldController');

// DASHBOARD
const {
  getTopGainers,
  getInvestmentsBySector,
  getInvestmentById,
  getHighestGrowthInSector, 
  getOverallAnalysis, 
  getCombinedNumAnalysis
} = require("../controllers/dashboardController");

//BANK MASTER
const {
  createBank,
  updateBank,
  deleteBank,
  getBanks,
} =  require('../controllers/bankController');

// GOLD MASTER
const {
  goldMasterInfoRegister, 
  updateGoldMasterInfo, 
  deleteGoldMasterInfo, 
  getGoldMasterInfo
} = require('../controllers/goldMasterController');

// AREA PRICE
const {
  createAreaPrice,
  updateAreaPrice,
  deleteAreaPrice,
  getAreaPrices,
} =  require('../controllers/areaPriceController');

const {
  stateRegister,
  updateState,
  getState,
  deleteState
} = require('../controllers/stateController');

const {
  cityRegister,
  updateCity,
  getCity,
  deleteCity
} = require('../controllers/cityController');

// VALIDATORS
const {
  userRegisterValidate,
  userLoginValidate,
} = require("../validation/userValidator");
const { ensureAuthenticated, ensureAdmin } = require("../validation/authValidator");
const { validateFixedDeposit } = require("../validation/fdValidator");
const { upload, multerErrorHandling  } = require("../validation/upload");

const {
  stateValidate
} = require('../validation/stateValidation');

const {
  cityValidate
} = require('../validation/cityValidation');

// User routes
router.post("/user/login", userLoginValidate, loginUser);
router.post("/user/register", userRegisterValidate, registerUser);
router.get("/users", getUsers);
router.get("/user-profile/:id", ensureAuthenticated, getUser);
router.get("/users/:id", ensureAuthenticated, getUser);
router.put("/user-profile/update/:id", ensureAuthenticated, upload.single('profileImage'), multerErrorHandling, updateUser);
router.delete("/user/delete/:id", ensureAuthenticated, deleteUser);
router.post("/user/changepassword",  ensureAuthenticated, changePassword);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/newpassword', newPassword);

// Fixed Deposit routes
router.post("/fd/register", ensureAuthenticated, validateFixedDeposit, fixedDepositRegister);
router.post("/fd/create", ensureAuthenticated, validateFixedDeposit, fixedDepositRegister);
router.delete("/fd/delete/:id", ensureAuthenticated, fixedDepositDelete);
router.get("/fds", ensureAuthenticated, getFdDetails);
router.put( "/fd/update/:id", ensureAuthenticated,validateFixedDeposit, updateFixedDeposit);
router.get("/fd/:id", ensureAuthenticated, getFdDetails);
router.get("/fd-analysis-number", ensureAuthenticated, getFdAnalysisbyNumber);
router.delete('/fd/delete-multiple', ensureAuthenticated, deleteMultipleFDs);

// Gold routes
router.post("/gold/register", ensureAuthenticated,  createGoldRecord);
router.put("/gold/update/:id", ensureAuthenticated, updateGoldRecord);
router.delete("/gold/delete/:id", ensureAuthenticated, deleteGoldRecord);
router.get("/gold-info",ensureAuthenticated, getAllGoldRecords);
router.get("/gold-info/:id", ensureAuthenticated, getGoldRecordById); 
router.delete('/gold/delete-multiple', ensureAuthenticated, deleteMultipleGoldRecords);
router.get('/gold-analysis', ensureAuthenticated, getGoldAnalysis);

// Dashboard routes
router.get("/overall-investment", ensureAuthenticated ,getOverallAnalysis);
router.get("/combined-num-analysis", ensureAuthenticated, getCombinedNumAnalysis);
router.get("/investments/highest-growth/:sector", ensureAuthenticated, getHighestGrowthInSector);
router.get("/top-gainers", ensureAuthenticated, getTopGainers);
router.get("/investments-by-sector/:sector",ensureAuthenticated, getInvestmentsBySector);
router.get("/investments/:id", ensureAuthenticated, getInvestmentById);


// ------------ADMIN------------ //

//Bank Master routes
router.post('/bank-register',  ensureAuthenticated, ensureAdmin, createBank);
router.put('/bank-update/:id', ensureAuthenticated, ensureAdmin, updateBank);
router.delete('/bank-delete/:id',  ensureAuthenticated, ensureAdmin, deleteBank);
router.put('/bank-update/:id', ensureAuthenticated, ensureAdmin, updateBank);
router.delete('/bank-delete/:id',  ensureAuthenticated, ensureAdmin, deleteBank);
router.get('/banks', ensureAuthenticated, ensureAdmin, getBanks);
router.get('/banks-dropdown-user', ensureAuthenticated, getBanks);

// Gold Master routes
router.post("/goldMaster/register", ensureAuthenticated, ensureAdmin,  goldMasterInfoRegister);
router.put("/goldMaster/update/:id",  ensureAuthenticated, ensureAdmin, updateGoldMasterInfo);
router.delete("/goldMaster/delete/:id", ensureAuthenticated, ensureAdmin, deleteGoldMasterInfo);
router.get("/goldMaster", ensureAuthenticated, ensureAdmin, getGoldMasterInfo);

// Area Price routes
router.post("/area-price/register", ensureAuthenticated, ensureAdmin,  createAreaPrice);
router.put("/area-price/update/:id",  ensureAuthenticated, ensureAdmin, updateAreaPrice);
router.delete("/area-price/delete/:id", ensureAuthenticated, ensureAdmin, deleteAreaPrice);
router.get("/area-prices", ensureAuthenticated, ensureAdmin, getAreaPrices);


// State routes
router.post('/state', stateValidate, stateRegister);
router.put('/state/update', stateValidate, updateState);
router.get('/states', getState);
router.get('/states/:id', getState);
router.delete('/state/delete', deleteState);

// City routes
router.post('/city', cityValidate, cityRegister);
router.put('/city/update', cityValidate, updateCity);
router.get('/cities', getCity);
router.get('/cities/:id', getCity);
router.delete('/city/delete', deleteCity);




module.exports = router;
