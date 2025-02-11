const {BuyData, BuyAirtime, ConvertAirtimeToCash, getDataPlan, sendAdminMessage} = require('../controllers/vtuController')


const express = require('express')
const router = express.Router()

router.post("/buy-data", BuyData)
router.post("/buy-airtime", BuyAirtime)
router.post("/convert-airtime-to-cash", ConvertAirtimeToCash)
router.get("/get-data-plans", getDataPlan)
router.post("/send-admin-message", sendAdminMessage)

module.exports = router