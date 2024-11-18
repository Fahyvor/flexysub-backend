const express = require('express');
const axios = require('axios');

const BuyData = async (req, res) => {
    try {
        const { network, number, name, type, duration } = req.body;

        // Validate request body
        if (!network || !number || !name || !type || !duration) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Login to CVDS
        const loginToCVDS = await axios.post(`${process.env.CVDS_URL}login`, {
            username: process.env.CVDS_USERNAME,
            password: process.env.CVDS_PASSWORD,
        });
        const cvdsToken = loginToCVDS.data.token;
        console.log("CVDS Token:", cvdsToken);

        // Fetch all data plans
        const dataPlans = await axios.get(`${process.env.CVDS_URL}transactions/data`, {
            headers: {
                Authorization: `Bearer ${cvdsToken}`,
            },
        });

        const newData = dataPlans.data.data; // Ensure this is the correct structure
        console.log("Data Plans:", newData);

        // Find the matching plan
        const matchingPlan = newData.find(plan =>
            plan.name === req.body.name
        );

        if (matchingPlan) {
            console.log("Matching Plan:", matchingPlan);
            console.log("Matching Plan Id", matchingPlan.plan_id)
        } else {
            return res.status(404).json({ error: 'No matching plan found.' });
        }

        // Buy data
        const buyData = await axios.post(`${process.env.CVDS_URL}transactions/data`, {
            network: network,
            mobile_number: number,
            plan: matchingPlan.plan_id,
            Ported_number: true,
        },
        {
            headers: {
                Authorization: `Bearer ${cvdsToken}`,
            },
        }
    );

        if (buyData.status === 200) {
            return res.status(200).json({ message: buyData.data.message, data: buyData.data });
        }

    } catch (error) {
        console.error("Error:", error.response?.data || error.message); // Log error details
        return res.status(500).json({ message: error.message });
    }
};

const getDataPlan = async (req, res) => {
    try {
         // Login to CVDS
         const loginToCVDS = await axios.post(`${process.env.CVDS_URL}login`, {
            username: process.env.CVDS_USERNAME,
            password: process.env.CVDS_PASSWORD,
        });
        const cvdsToken = loginToCVDS.data.token;
        console.log("CVDS Token:", cvdsToken);

        // Fetch all data plans
        const dataPlans = await axios.get(`${process.env.CVDS_URL}transactions/data`, {
            headers: {
                Authorization: `Bearer ${cvdsToken}`,
            },
        });

        const newData = dataPlans.data.data.map(plan => plan.name);
        console.log("Normal Rate", dataPlans.data.data.map(plan => plan.api_price ));

        const dataAmount = dataPlans.data.data.map(plan => {
            const price = parseFloat(plan.api_price); 
            return price + 25;
        });

        console.log("Data Plans Amount:", dataAmount);

        console.log("Data Plans Name:", newData);
        res.status(200).json({message: "Successful", data: newData, dataAmount: dataAmount});

    } catch (error) {
        console.error("Error:", error.response?.data || error.message); // Log error details
        return res.status(500).json({ message: error.message });
    }
}

const BuyAirtime = async (req, res) => {

}

const ConvertAirtimeToCash = async (req, res) => {

}

module.exports={BuyData, BuyAirtime, ConvertAirtimeToCash, getDataPlan}