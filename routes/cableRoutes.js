const { getCablePlanByBiller, buyCablePlan } = require("../controllers/cableController")
const express = require("express");
const router = express.Router();

router.get("/:biller", getCablePlanByBiller);
router.post("/subscribe-cable", buyCablePlan)

module.exports = router;