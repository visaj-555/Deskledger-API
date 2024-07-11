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
    userRegisterValidate,
    userLoginValidate
} = require('../middlewares/userValidation');

const ensureAuthenticated = require('../middlewares/auth');

router.post('/user/login', userLoginValidate, loginUser);
router.post('/user/register', userRegisterValidate, registerUser);
router.get('/users', getUsers);
router.get('/users/:id', getUser);
router.put('/user/update', userRegisterValidate, updateUser);
router.delete('/users/delete', deleteUser);

module.exports = router;
