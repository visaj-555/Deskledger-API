const express = require('express');
const { ensureAuthenticated } = require('../validation/authValidator');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController2');

// Dashboard routes
router.get("/overall-investment", ensureAuthenticated ,dashboardController.dashboardAnalysis);
// router.get("/combined-num-analysis", ensureAuthenticated, dashboardController.getCombinedNumAnalysis);
router.get("/investments/highest-growth/:sector", ensureAuthenticated, dashboardController.getHighestGrowthInSector);
// router.get("/top-gainers", ensureAuthenticated, dashboardController.getTopGainers);
router.get("/investments-by-sector/:sector",ensureAuthenticated, dashboardController.getInvestmentsBySector);


module.exports = router;