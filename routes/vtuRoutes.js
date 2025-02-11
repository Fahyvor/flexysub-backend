const {BuyData, BuyAirtime, ConvertAirtimeToCash, getDataPlan, sendAdminMessage} = require('../controllers/vtuController')
const { authenticateJWT } = require('../lib/authenticateJWT')


const express = require('express')
const router = express.Router()

router.post("/buy-data", authenticateJWT, BuyData)
router.post("/buy-airtime", authenticateJWT, BuyAirtime)
router.post("/convert-airtime-to-cash", ConvertAirtimeToCash)
router.get("/get-data-plans", getDataPlan)
router.post("/send-admin-message", sendAdminMessage)

module.exports = router