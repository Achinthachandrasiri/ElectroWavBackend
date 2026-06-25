const express = require("express");
const router = express.Router();

const getAlertsController  = require("../controllers/alertsController");

router.get("/alerts", getAlertsController.getAlerts);

module.exports = router;