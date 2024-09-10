const express = require('express');
const router =  express.Router();

const subPropertyTypeController =  require('../controllers/subPropertyTypeController');
const {ensureAuthenticated, ensureAdmin} = require('../validation/authValidator');


// Sub property type routes
router.post('/subpropertytype', ensureAuthenticated, ensureAdmin, subPropertyTypeController.subPropertyTypeRegister);
router.put('/subpropertytype/update/:id', ensureAuthenticated, ensureAdmin, subPropertyTypeController.updateSubPropertyType);
router.delete('/subpropertytype/delete/:id',ensureAuthenticated, ensureAdmin, subPropertyTypeController.deleteSubPropertyType);
router.get('/subpropertytypes',ensureAuthenticated, ensureAdmin, subPropertyTypeController.getSubPropertyType);


module.exports = router;