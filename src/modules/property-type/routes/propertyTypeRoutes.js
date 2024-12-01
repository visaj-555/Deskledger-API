const express = require('express');
const router = express.Router();
const {ensureAuthenticated, ensureAdmin} = require('../validation/authValidator');
const propertyTypeController = require("../controllers/propertyTypeController");

// Property type routes
router.post('/propertytype', ensureAuthenticated, ensureAdmin,  propertyTypeController.propertyTypeRegister);
router.put('/propertytype/update/:id', ensureAuthenticated, ensureAdmin, propertyTypeController.updatePropertyType);
router.delete('/propertytype/delete/:id',ensureAuthenticated, ensureAdmin, propertyTypeController.deletePropertyType);
router.get('/propertytypes',ensureAuthenticated, ensureAdmin, propertyTypeController.getPropertyType);
router.get('/propertytypes-for-user',ensureAuthenticated, propertyTypeController.getPropertyType);
router.delete('/propertytypes/multiple-delete',ensureAuthenticated, ensureAdmin, propertyTypeController.deleteMultiplePropertyTypes);

module.exports = router;