const express = require('express');
const { loginUser, registerUser, getUsers} = require('../controllers/usercontroller'); // controller functions
const { userRegisterValidate, userLoginValidate} = require('../utils/userValidation'); // Middleware functions
const ensureAuthenticated = require('../utils/auth'); // middleware functions for authentication

const router = express.Router();

router.post('/register', userRegisterValidate, registerUser);
router.post('/login', userLoginValidate, loginUser);
router.get('/users', ensureAuthenticated, getUsers);


module.exports = router;
