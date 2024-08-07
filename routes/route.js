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
  resetPassword
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
} = require("../Validation/userValidator");

const { getFdAnalysis } = require("../controllers/fdAnalysisController");
const { ensureAuthenticated } = require("../Validation/authValidator");
const { validateFixedDeposit } = require("../Validation/fdValidator");
const { upload, multerErrorHandling  } = require("../Validation/upload");



// User routes
router.post("/user/login", userLoginValidate, loginUser);
router.post("/user/register", userRegisterValidate, registerUser);
router.get("/users", getUsers);
router.get("/user-profile/:id", ensureAuthenticated, getUser);
router.get("/users/:id", ensureAuthenticated, getUser);
router.put("/user-profile/update/:id", ensureAuthenticated, upload.single('profileImage'), multerErrorHandling, updateUser);

router.delete("/users/delete", ensureAuthenticated, deleteUser);
router.post("/user/changepassword",  ensureAuthenticated, changePassword);

// Fixed Deposit routes
router.post("/fd/register", ensureAuthenticated, validateFixedDeposit, fixedDepositRegister);
router.post("/fd/create", ensureAuthenticated, validateFixedDeposit, fixedDepositRegister);

router.delete("/fd/delete/:id", ensureAuthenticated, fixedDepositDelete);
router.get("/fds", ensureAuthenticated, getFdDetails);
router.put( "/fd/update/:id", ensureAuthenticated,validateFixedDeposit, updateFixedDeposit);
router.get("/fd/:id", ensureAuthenticated, getFdDetails);
router.get("/fd-analysis", ensureAuthenticated, getFdAnalysis);

// Investment routes
router.get("/top-gainers", ensureAuthenticated, getTopGainers);
router.get("/overall-investment-by-sector", ensureAuthenticated, getOverallInvestmentBySector);
router.get("/investments-by-sector/:sector",ensureAuthenticated, getInvestmentsBySector);
router.get("/investments", ensureAuthenticated, getInvestmentById);
router.get("/investments/highest-growth", ensureAuthenticated, getHighestGrowthInSector);

router.post('/forgot-password', ensureAuthenticated, forgotPassword);
router.post('/reset-password', ensureAuthenticated, resetPassword);



module.exports = router;
