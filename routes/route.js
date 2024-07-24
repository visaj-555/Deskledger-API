const express = require('express');
const router = express.Router();

const {
    registerUser,
    getUsers,
    getUser,
    updateUser,
    deleteUser, 
    loginUser
} = require('../controllers/usercontroller');

const {  
    getTopGainers ,  
    getOverallInvestmentBySector , 
    getInvestmentsBySector,
    getInvestmentById, 
    getHighestGrowthInSector
} = require('../controllers/myinvestmentcontroller');

const {
    fixedDepositRegister,
    fixedDepositDelete, 
    getFdDetails,
    updateFixedDeposit,
    getFdById
} = require('../controllers/fdcontroller');

const {
    validateFixedDeposit
} = require('../middlewares/fdValidation');

const {
    userRegisterValidate,
    userLoginValidate
} = require('../middlewares/userValidation');

const { getFdAnalysis } = require('../controllers/fdanalysiscontroller');
const {ensureAuthenticated} = require('../middlewares/authentication');
// User routes
router.get('/user/login', userLoginValidate, loginUser);
router.post('/user/register', userRegisterValidate, registerUser);
router.get('/users', getUsers);
router.get('/users/:id', getUser);
router.put('/user/update',  userRegisterValidate, updateUser);
router.delete('/users/delete', deleteUser);
router.post('/authentication', ensureAuthenticated);

// Fixed Deposit routes
router.post('/fd/register', ensureAuthenticated, validateFixedDeposit, fixedDepositRegister);
router.delete('/fd/delete/:id', ensureAuthenticated, fixedDepositDelete);
router.get('/fds', ensureAuthenticated, getFdDetails);
router.put('/fd/update/:id', ensureAuthenticated, validateFixedDeposit, updateFixedDeposit);
router.get('/fd/:id', ensureAuthenticated, getFdById);
router.get('/fd-analysis', ensureAuthenticated, getFdAnalysis);

// Investment routes
router.get('/top-gainers', ensureAuthenticated, getTopGainers);
router.get('/overall-investment-by-sector', ensureAuthenticated, getOverallInvestmentBySector);
router.get('/investments-by-sector/:sector', ensureAuthenticated, getInvestmentsBySector);
router.get('/investments/:id', ensureAuthenticated, getInvestmentById);
router.get('/investments/highest-growth/:sector', ensureAuthenticated, getHighestGrowthInSector);

module.exports = router;
