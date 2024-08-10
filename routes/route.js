const express = require("express");
const router = express.Router();

// Importing all the controllers and functions
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

const {
  getTopGainers,
  getOverallInvestmentBySector,
  getInvestmentsBySector,
  getInvestmentById,
  getHighestGrowthInSector,
} = require("../controllers/investmentController");

const {
  fixedDepositRegister,
  fixedDepositDelete,
  getFdDetails,
  updateFixedDeposit
} = require("../controllers/fdcontroller");

const {
  userRegisterValidate,
  userLoginValidate,
} = require("../validation/userValidator");

const {
  createBank,
  updateBank,
  deleteBank,
  getBanks,
} =  require('../controllers/bankController');

const { getFdAnalysis,  getFdAnalysisbyNumber} = require("../controllers/fdAnalysisController");
const { ensureAuthenticated } = require("../validation/authValidator");
const { validateFixedDeposit } = require("../validation/fdValidator");
const { upload, multerErrorHandling  } = require("../validation/upload");

// User routes
router.post("/user/login", userLoginValidate, loginUser);
router.post("/user/register", userRegisterValidate, registerUser);
router.get("/users", getUsers);
router.get("/user-profile/:id", ensureAuthenticated, getUser);
router.get("/users/:id", ensureAuthenticated, getUser);
router.put("/user-profile/update/:id", ensureAuthenticated, upload.single('profileImage'), multerErrorHandling, updateUser);
router.delete("/users/delete", ensureAuthenticated, deleteUser);
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
router.get("/fd-analysis", ensureAuthenticated, getFdAnalysis);
router.get("/fd-analysis-number", ensureAuthenticated, getFdAnalysisbyNumber);

// Investment routes
router.get("/top-gainers", ensureAuthenticated, getTopGainers);
router.get("/overall-investment-by-sector", ensureAuthenticated, getOverallInvestmentBySector);
router.get("/investments-by-sector/:sector",ensureAuthenticated, getInvestmentsBySector);
router.get("/investments/:id", ensureAuthenticated, getInvestmentById);
router.get("/investments/highest-growth", ensureAuthenticated, getHighestGrowthInSector);

//Bank routes
router.post('/banks', createBank);
router.put('/banks', updateBank);
router.delete('/banks',deleteBank);
router.get('/banks/:id?',getBanks);


module.exports = router;
