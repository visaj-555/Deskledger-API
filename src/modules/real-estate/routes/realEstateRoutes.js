const express = require("express");

const router = express.Router();

const realEstateController = require("../controller/realEstateController");
const { ensureAuthenticated } = require("../../../middlewares/authValidator");

router.post(
  "/real-estate/register",
  ensureAuthenticated,
  realEstateController.createRealEstate
);
router.get(
  "/real-estate/view",
  ensureAuthenticated,
  realEstateController.getAllRealEstate
);
router.put(
  "/real-estate/update/:id",
  ensureAuthenticated,
  realEstateController.updateRealEstate
);
router.delete(
  "/real-estate/delete/:id",
  ensureAuthenticated,
  realEstateController.deleteRealEstate
);
router.delete(
  "/real-estate/multiple-delete",
  ensureAuthenticated,
  realEstateController.deleteMultipleRealEstates
);
router.get(
  "/real-estate-analysis",
  ensureAuthenticated,
  realEstateController.getRealEstateAnalysis
);

module.exports = router;
