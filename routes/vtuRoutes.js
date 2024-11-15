const {BuyData, BuyAirtime, ConvertAirtimeToCash} = require('../controllers/vtuController')


const express = require('express')
const router = express.Router()

router.post("/buy-data", BuyData)
router.post("/buy-airtime", BuyAirtime)
router.post("/convert-airtime-to-cash", ConvertAirtimeToCash)

module.exports = router