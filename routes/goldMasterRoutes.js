const express = require('express'); 

const router = express.Router();

const goldMasterController =  require('../controllers/goldMasterController');
const {ensureAuthenticated, ensureAdmin} = require('../validation/authValidator');



// Gold Master routes
router.post("/goldMaster/register", ensureAuthenticated, ensureAdmin,  goldMasterController.goldMasterInfoRegister);
router.put("/goldMaster/update/:id",  ensureAuthenticated, ensureAdmin, goldMasterController.updateGoldMasterInfo);
router.delete("/goldMaster/delete/:id", ensureAuthenticated, ensureAdmin, goldMasterController.deleteGoldMasterInfo);
router.get("/goldMaster", ensureAuthenticated, ensureAdmin, goldMasterController.getGoldMasterInfo);

module.exports = router; 