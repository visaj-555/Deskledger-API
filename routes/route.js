const express = require('express');
const {
    registerUser,
    getUsers,
    getUser,
    updateUser,
    deleteUser, 
    loginUser
} = require('../controllers/usercontroller'); // controller functions

const {
    userRegisterValidate,
    userLoginValidate
} = require('../middlewares/userValidation'); // Middleware functions

const ensureAuthenticated = require('../middlewares/auth'); // middleware functions for authentication

router.post('/login', userLoginValidate, ensureAuthenticated, loginUser);
router.post('/register', userRegisterValidate, registerUser);
router.get('/users', getUsers);
router.get('/users/:id',getUser);
router.put('/user/update',userRegisterValidate, updateUser);
router.delete('/users/delete', deleteUser);

module.exports = router;
