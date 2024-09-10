const express = require("express");

const router = express.Router();

const citycontroller = require("../controllers/cityController");
const { ensureAuthenticated, ensureAdmin } = require("../validation/authValidator");

// City routes
router.post("/city", ensureAuthenticated, ensureAdmin, citycontroller.cityRegister);
router.put("/city/update/:id", ensureAuthenticated, ensureAdmin, citycontroller.updateCity);
router.get("/cities", ensureAuthenticated, ensureAdmin, citycontroller.getCity);
router.delete("/city/delete/:id", ensureAuthenticated, ensureAdmin, citycontroller.deleteCity);
router.delete("/cities/multiple-delete", ensureAuthenticated, ensureAdmin, citycontroller.deleteMultipleCities);

module.exports = router;

