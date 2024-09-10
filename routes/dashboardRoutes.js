const express = require('express');
const { ensureAuthenticated } = require('../validation/authValidator');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
// Dashboard routes
router.get("/overall-investment", ensureAuthenticated ,dashboardController.getOverallAnalysis);
router.get("/combined-num-analysis", ensureAuthenticated, dashboardController.getCombinedNumAnalysis);
router.get("/investments/highest-growth/:sector", ensureAuthenticated, dashboardController.getHighestGrowthInSector);
router.get("/top-gainers", ensureAuthenticated, dashboardController.getTopGainers);
router.get("/investments-by-sector/:sector",ensureAuthenticated, dashboardController.getInvestmentsBySector);
router.get("/investments/:id", ensureAuthenticated, dashboardController.getInvestmentById);


module.exports = router;