const express = require('express'); 
const { ensureAuthenticated } = require('../validation/authValidator');
const goldController = require('../controllers/goldController');

const router = express.Router();

// Gold routes
router.post("/gold/register", ensureAuthenticated,  goldController.createGoldRecord);
router.put("/gold/update/:id", ensureAuthenticated, goldController.updateGoldRecord);
router.delete("/gold/delete/:id", ensureAuthenticated, goldController.deleteGoldRecord);
router.get("/gold-info",ensureAuthenticated, goldController.getAllGoldRecords);
router.get("/gold-info/:id", ensureAuthenticated, goldController.getAllGoldRecords); 
router.delete('/gold/delete-multiple', ensureAuthenticated, goldController.deleteMultipleGoldRecords);
router.get('/gold-analysis', ensureAuthenticated, goldController.getGoldAnalysis);

module.exports = router;