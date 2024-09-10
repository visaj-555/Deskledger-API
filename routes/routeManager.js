const express = require("express");
let Router = express.Router();
const userRoutes = require("../routes/userRoutes");
const fdRoutes = require("./fixedDepositRoutes");
const cityRoutes = require("../routes/cityRoutes");
const StateRoutes = require("../routes/stateRoutes");
const goldRoutes = require("../routes/goldRoutes");
const dashboardRoutes = require("../routes/dashboardRoutes");
const bankRoutes = require("../routes/bankRoutes");
const goldMasterRoutes = require("../routes/goldMasterRoutes");
const areaPriceRoutes = require("../routes/areaPriceRoutes");
const propertyTypeRoutes = require("../routes/propertyTypeRoutes");
const subPropertyTypeRoutes = require("../routes/subPropertyTypeRoutes");
const realEstateRoutes =  require("../routes/realEstateRoutes");

module.exports = [
  userRoutes,
  fdRoutes,
  cityRoutes,
  StateRoutes,
  goldRoutes,
  dashboardRoutes,
  bankRoutes,
  goldMasterRoutes,
  areaPriceRoutes,
  propertyTypeRoutes, 
  subPropertyTypeRoutes, 
  realEstateRoutes
];
