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

// User routes
router.get('/user/login', userLoginValidate, loginUser);
router.post('/user/register', userRegisterValidate, registerUser);
router.get('/users', getUsers);
router.get('/users/:id', getUser);
router.put('/user/update', userRegisterValidate, updateUser);
router.delete('/users/delete', deleteUser);

// Fixed Deposit routes
router.post('/fd/register', validateFixedDeposit, fixedDepositRegister);
router.delete('/fd/delete/:id', fixedDepositDelete);
router.get('/fds', getFdDetails);
router.put('/fd/update/:id', validateFixedDeposit, updateFixedDeposit);
router.get('/fd/:id', getFdById);
router.get('/fd-analysis', getFdAnalysis);

// Investment routes
router.get('/top-gainers', getTopGainers);
router.get('/overall-investment-by-sector', getOverallInvestmentBySector);
router.get('/investments-by-sector/:sector', getInvestmentsBySector);
router.get('/investment/:id', getInvestmentById);
router.get('/investment/highest-growth', getHighestGrowthInSector);

module.exports = router;
