const express = require ('express'); 

const router =  express.Router(); 

const realEstateController = require('../controllers/realEstateController'); 
const { ensureAuthenticated } = require('../validation/authValidator');

router.post('/real-estate/register', ensureAuthenticated, realEstateController.createRealEstate); 
router.get('/real-estate/view', ensureAuthenticated, realEstateController.getAllRealEstate); 
// router.get('/real-estate/view/:id', ensureAuthenticated, realEstateController.getRealEstateById); 
router.put('/real-estate/update/:id', ensureAuthenticated, realEstateController.updateRealEstate); 
router.delete('/real-estate/delete/:id', ensureAuthenticated, realEstateController.deleteRealEstate); 
router.delete('/real-estate/multiple-delete', ensureAuthenticated, realEstateController.deleteMultipleRealEstates); 
router.get('/real-estate-analysis', ensureAuthenticated, realEstateController.getRealEstateAnalysis); 

module.exports = router; 