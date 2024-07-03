const express = require('express');
const { loginAdmin, registerUser, getUsers, getUser, updateUser, deleteUser} = require('../controllers/usercontroller'); // controller functions
const { userRegisterValidate, userLoginValidate} = require('../middlewares/userValidation'); // Middleware functions
const ensureAuthenticated = require('../middlewares/auth'); // middleware functions for authentication

const router = express.Router();

router.post('/register', userRegisterValidate, registerUser); // Register the user and validate
router.post('/login', userLoginValidate, loginAdmin); // Login the user and validate
router.get('/users', ensureAuthenticated, getUsers); // Get all the users 
router.get('/users/:id', getUser); // Get the user by id
router.put('/update', updateUser); // Update the user
router.delete('/delete', deleteUser); // Delete the user



module.exports = router;
