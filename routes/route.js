const express = require('express');
const { loginUser, registerUser, getUsers } = require('../controllers/usercontroller');
const { userRegisterValidate, userLoginValidate } = require('../utils/userValidation');
const ensureAuthenticated = require('../utils/auth');

const router = express.Router();

router.post('/register', userRegisterValidate, registerUser);
router.post('/login', userLoginValidate, loginUser);
router.get('/users', ensureAuthenticated, getUsers);

module.exports = router;
