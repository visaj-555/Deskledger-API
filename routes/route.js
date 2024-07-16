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
    fixedDepositRegister,
    fixedDepositDelete, 
    getFdDetails,
    updateFixedDeposit
} = require('../controllers/fdcontroller');

const {
    validateFixedDeposit
} = require('../middlewares/fdValidation')

const {
    userRegisterValidate,
    userLoginValidate
} = require('../middlewares/userValidation');

router.post('/user/login', userLoginValidate, loginUser);
router.post('/user/register', userRegisterValidate, registerUser);
router.get('/users', getUsers);
router.get('/users/:id', getUser);
router.put('/user/update', userRegisterValidate, updateUser);
router.delete('/users/delete', deleteUser);


router.post('/fd/register', validateFixedDeposit, fixedDepositRegister);
router.delete('/fd/delete', fixedDepositDelete);
router.get('/fds', getFdDetails);
router.get('/fd/update', updateFixedDeposit);


module.exports = router;
