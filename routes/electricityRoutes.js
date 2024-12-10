const { GetAllProviders, BuyElectricityUnits } = require('../controllers/electricityController');
const express = require('express');
const router = express.Router();
const { authenticateJWT } = require("../lib/authenticateJWT")

router.get('/providers', authenticateJWT, GetAllProviders);
router.post('/buy-units', authenticateJWT, BuyElectricityUnits)

module.exports = router;