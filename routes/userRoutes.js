const userController= require('../controllers/userController');
const { ensureAuthenticated, ensureAdmin } = require('../validation/authValidator');
const { userLoginValidate , userRegisterValidate } = require('../validation/userValidator')
const Router= require('express').Router()

Router.post('/user/login', userLoginValidate, userController.loginUser)
Router.post('/user/logout', ensureAuthenticated, userController.logoutUser)
Router.post('/user/register', userRegisterValidate, userController.registerUser);
Router.get("/user-profile/:id",  ensureAuthenticated, userController.getUser);
Router.put("/user-profile/update/:id", ensureAuthenticated, userController.updateUser);
Router.delete("/user/delete/:id", ensureAuthenticated, userController.deleteUser);
Router.post("/user/changepassword",  ensureAuthenticated, userController.changePassword);
Router.post('/forgot-password', userController.forgotPassword);
Router.post('/reset-password', userController.resetPassword);
Router.post('/newpassword', userController.newPassword);
Router.post('/users', ensureAuthenticated, ensureAdmin, userController.getUsers);





//User routes
// router.post("/user/login", userLoginValidate, loginUser);
// router.post("/user/register", userRegisterValidate, registerUser);
// router.get("/users", getUsers);
// router.get("/users/:id", ensureAuthenticated, getUser);
// router.put("/user-profile/update/:id", ensureAuthenticated, upload.single('profileImage'), multerErrorHandling, updateUser);
// router.delete("/user/delete/:id", ensureAuthenticated, deleteUser);
// router.post("/user/changepassword",  ensureAuthenticated, changePassword);
// router.post('/forgot-password', forgotPassword);
// router.post('/reset-password', resetPassword);
// router.post('/newpassword', newPassword);

module.exports= Router