const express = require('express');
const axios = require('axios');

const BuyData = async (req, res) => {
    try {
        const {network, amount, number, service} = req.body;
    
        if(!network || !amount || !service || !amount) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
    
        const loginToCVDS = await axios.post(`${process.env.CVDS_URL}login`, {
            username: process.env.CVDS_USERNAME,
            password: process.env.CVDS_PASSWORD,
        })
        console.log("CVDS Token:", loginToCVDS.data.token)
    
        //Get all Data plans
        const dataPlans = await axios.get(`${process.env.CVDS_URL}data`, {
            headers:  {
                Authorization: `Bearer ${loginToCVDS.data.token}`
            }
        })
    
        console.log("Data plans:", dataPlans.data);
        //Filter the plans based on the network and service
        const filteredPlans = dataPlans.data.filter(plan => plan_id === plan_id && plan.service === service);
    
        //Sort the plans based on the amount
        const sortedPlans = filteredPlans.sort((a, b) => a.amount - b.amount);
    
        //Search for the plan id using the amount and network
    
        //Buy Data now
        const buyData = await axiosInstance.post(`${process.env.CVDS_URL}data-purchase`, {
            network: network,
            mobile_number: number,
            plan: plan,
            Ported_number: true
        })
    
        if(buyData.status == 200) {
            return res.status(200).json({ message: buyData.data.message, data: buyData.data });
        }
        
    } catch (error) {
        //Handle Error
        return res.status(500).json({ message: error.message})
    }
}

const BuyAirtime = async (req, res) => {

}

const ConvertAirtimeToCash = async (req, res) => {

}

module.exports={BuyData, BuyAirtime, ConvertAirtimeToCash}