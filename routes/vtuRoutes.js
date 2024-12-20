const {BuyData, BuyAirtime, ConvertAirtimeToCash, getDataPlan} = require('../controllers/vtuController')


const express = require('express')
const router = express.Router()

router.post("/buy-data", BuyData)
router.post("/buy-airtime", BuyAirtime)
router.post("/convert-airtime-to-cash", ConvertAirtimeToCash)
router.get("/get-data-plans", getDataPlan)

module.exports = router