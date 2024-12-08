const express = require("express");
let Router = express.Router();
const userRoutes = require("../src/modules/user/routes/userRoutes");
const fdRoutes = require("../src/modules/fixed-deposit/routes/fixedDepositRoutes");
const cityRoutes = require("../src/modules/admin/city/routes/cityRoutes");
const stateRoutes = require("../src/modules/admin/state/routes/stateRoutes");
const goldRoutes = require("../src/modules/gold/routes/goldRoutes");
const bankRoutes = require("../src/modules/admin/bank/routes/bankRoutes");
const goldMasterRoutes = require("../src/modules/admin/gold-master/routes/goldMasterRoutes");
const areaPriceRoutes = require("../src/modules/admin/area-price/routes/areaPriceRoutes");
const propertyTypeRoutes = require("../src/modules/admin/property-type/routes/propertyTypeRoutes");
const subPropertyTypeRoutes = require("../src/modules/admin/sub-prop-type/routes/subPropertyTypeRoutes");
const realEstateRoutes = require("../src/modules/real-estate/routes/realEstateRoutes");

module.exports = [
  userRoutes,
  fdRoutes,
  cityRoutes,
  stateRoutes,
  goldRoutes,
  bankRoutes,
  goldMasterRoutes,
  areaPriceRoutes,
  propertyTypeRoutes,
  subPropertyTypeRoutes,
  realEstateRoutes,
];
