const express = require('express');
const axios = require('axios');
const moment = require('moment-timezone');
const prisma = require('../lib/prisma');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const BuyData = async (req, res) => {
    try {
        const { network, number, name, type, duration } = req.body;

        // const token = req.headers.authorization?.split(" ")[1];

        // const user = await prisma.user.findUnique({ where: { id: decoded.userId } });

        // if(user.accountBalance < amount) {
        //     return res.status(400).json({ error: 'Insufficient funds' });
        // }

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

        // Buy data from Connect Value Data
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

// const getDataPlan = async (req, res) => {
//     try {
//         const { plan } = req.params;

//         // Fetch all data plans
//         const dataPlans = await axios.get(`${process.env.VTPASS_URL}service-variations?serviceID=${plan}`, {
//             headers: {
//                 'api-key': process.env.VTPASS_API_KEY,
//                 'secret-key': process.env.VTPASS_PUBLIC_KEY
//             },
//         });

//         // Log the full response
//         console.log("Full Response:", JSON.stringify(dataPlans.data.content, null, 2));

//         const actualData = dataPlans.data.content.varations;
//         console.log("Actual Data:", actualData);

//         // Ensure content is an array
//         const content = Array.isArray(dataPlans.data.content.varations) ? dataPlans.data.content.varations : actualData;

//         // Map names and calculate amounts
//         const newData = content.map(plan => plan.name || "No name provided");
//         const dataAmount = content.map(plan => {
//             const price = parseFloat(plan.variation_amount || 0); // Fallback for empty amounts
//             return price + 50; // Add custom margin
//         });

//         console.log("Data Plans Name:", newData);
//         console.log("Data Plans Amount:", dataAmount);

//         res.status(200).json({
//             message: "Successful",
//             data: newData,
//             dataAmount: dataAmount
//         });

//     } catch (error) {
//         // Handle errors and log them
//         console.error("Error:", error.response?.data || error.message);
//         return res.status(500).json({
//             message: "Failed to fetch data plans",
//             error: error.response?.data || error.message
//         });
//     }
// };

        /**
         * Retrieves all data plans from CVDS
         * @param {object} req - Request object
         * @param {object} res - Response object
         * @returns {object} - Response with data plans name and amount
         */
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
        console.log("Normal Rate", dataPlans.data.data.map(plan => plan.api_price));

        const dataAmount = dataPlans.data.data.map(plan => {
            const price = parseFloat(plan.api_price);
            
            // Extract the GB value using a regular expression
            const match = plan.name.match(/(\d+(\.\d+)?)\s?GB/);
            const dataGb = match ? parseFloat(match[1]) : 0; // Default to 0 if no match

            // Add 34 for every 1GB of data
            const additionalCost = dataGb * 34;
            return price + additionalCost;
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
    try {
        const token = req.headers.authorization?.split(" ")[1];
        console.log(token);

        if(!token) {
            return res.status(401).json({ error: 'jwt must be provided' });
        }

        const { phone, network, amount } = req.body;

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await prisma.user.findUnique({ where: { id: decoded.userId } });

        if(user.accountBalance < amount) {
            return res.status(400).json({ error: 'Insufficient funds' });
        }

        // Generate a request_id that consists of YYYYMMDDHHMMSS and 8 random characters
        function generateRandomString(length) {
            const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            let result = '';
            for (let i = 0; i < length; i++) {
                result += characters.charAt(Math.floor(Math.random() * characters.length));
            }
            return result;
        }
        
        function getGMTPlus1Timestamp() {
            // Get the current time in GMT+1 timezone
            const gmtPlus1Time = moment.tz("Africa/Lagos"); // Nigeria is in GMT+1
        
            // Format as YYYYMMDDHHMMSS
            return gmtPlus1Time.format("YYYYMMDDHHmmss");
        }                   
        
        const requestId = `${getGMTPlus1Timestamp()}${generateRandomString(8)}`;
        console.log("Request ID:", requestId);
        
        // Validate input
        if (!phone || !amount) {
            return res.status(400).json({ message: "Phone and amount are required" });
        }

        // Make airtime purchase request
        const buyAirtimeResponse = await axios.post(
            `${process.env.VTPASS_URL}pay`,
            {
                request_id: requestId,
                serviceID: network,
                amount: parseInt(amount),
                phone: phone
            },
            {
                headers: {
                    'api-key': process.env.VTPASS_API_KEY,
                    'secret-key': process.env.VTPASS_SECRET_KEY
                },
            }
        );

        // Update user account balance
        await prisma.user.update({
            where: { id: user.id },
            data: {
                accountBalance: user.accountBalance - amount
            }
        });

        // Handle successful airtime purchase
        if (buyAirtimeResponse.status === 200) {
            console.log("Airtime Purchase Response:", buyAirtimeResponse.data);
            return res.status(200).json({
                data: buyAirtimeResponse.data,
            });
        } else if (buyAirtimeResponse.response_description == "TRANSACTION FAILED") {
            // Handle transaction failure
            console.log("Airtime Purchase Failed:", buyAirtimeResponse.data);
            return res.status(400).json({
                message: "Airtime purchase failed",
                details: buyAirtimeResponse.data,
            });
        }
        else {
            // Handle unexpected status codes
            return res.status(buyAirtimeResponse.status).json({
                message: "Unexpected response from airtime API",
                details: buyAirtimeResponse.data,
            });
        }
    } catch (error) {
        // Handle errors
        console.error("Error in BuyAirtime:", error.response?.data || error.message, error);
        return res.status(500).json({
            message: "Failed to recharge airtime",
            error: error.response?.data || error.message,
        });
    }
};

// const BuyAirtime = async (req, res) => {
//     try {
//         const { phone, value } = req.body;

//         // Validate input
//         if (!phone || !value) {
//             return res.status(400).json({ message: "Phone and value are required" });
//         }

//         // Login to CVDS
//         const loginToCVDS = await axios.post(`${process.env.CVDS_URL}login`, {
//             username: process.env.CVDS_USERNAME,
//             password: process.env.CVDS_PASSWORD,
//         });

//         // Retrieve token
//         const cvdsToken = loginToCVDS.data.token;
//         console.log("CVDS Token:", cvdsToken);

//         // Make airtime purchase request
//         const buyAirtimeResponse = await axios.post(
//             `${process.env.CVDS_URL}transactions/airtime`,
//             {
//                 phone,
//                 value,
//                 ported: true,
//             },
//             {
//                 headers: {
//                     Authorization: `Bearer ${cvdsToken}`,
//                 },
//             }
//         );

//         // Handle successful airtime purchase
//         if (buyAirtimeResponse.status === 200) {
//             console.log("Airtime Purchase Response:", buyAirtimeResponse.data);
//             return res.status(200).json({
//                 // message: buyAirtimeResponse.data.message,
//                 data: buyAirtimeResponse.data,
//             });
//         } else {
//             // Handle unexpected status codes
//             return res.status(buyAirtimeResponse.status).json({
//                 message: "Unexpected response from airtime API",
//                 details: buyAirtimeResponse.data,
//             });
//         }
//     } catch (error) {
//         // Handle errors
//         console.error("Error in BuyAirtime:", error.response?.data || error.message);
//         return res.status(500).json({
//             message: "Failed to recharge airtime",
//             error: error.response?.data || error.message,
//         });
//     }
// };

const ConvertAirtimeToCash = async (req, res) => {
    try {
        const loginToCVDS = await axios.post(`${process.env.CVDS_URL}login`, {
            username: process.env.CVDS_USERNAME,
            password: process.env.CVDS_PASSWORD,
        });

        // Retrieve token
        const cvdsToken = loginToCVDS.data.token;
        console.log("CVDS Token:", cvdsToken);

        const getNumber = await axios.get(`${process.env.CVDS_URL}transactions/airtime2cash`, {
            headers: {
                Authorization: `Bearer ${cvdsToken}`,
            },
        })
        if(getNumber.status === 200) {
            console.log("Number:", getNumber.data);
        }
    } catch (error) {
        console.error("Error in Converting Airtime:", error.response?.data || error.message);
        return res.status(500).json({
            message: "Failed to convert airtime",
            error: error.response?.data || error.message,
        });
    }
}

//Send Admin a message that I have funded my account
const sendAdminMessage = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        console.log(token);

        if(!token) {
            return res.status(401).json({ error: 'jwt must be provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await prisma.user.findUnique({ where: { id: decoded.userId } });

        // Send email to admin
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.MAIL_ADDRESS,
                pass: process.env.MAIL_PASSWORD,
            },
        });

        const mailOptions = {
            from: process.env.MAIL_ADDRESS,
            to: "ebukadike5@gmail.com",
            subject: 'Account Funded',
            text: `A user has funded their account. with account Number: ${user.accountNumber}`,
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email:', error);
                return res.status(500).json({ message: 'Failed to send email' });
            } else {
                console.log('Email sent:', info.response);
                return res.status(200).json({ message: 'Please hold on while we fund your account' });
            }
        })   
    } catch (error) {
        console.error("Error in sending Admin Message:", error.response?.data || error.message);
    }
}

module.exports={BuyData, BuyAirtime, ConvertAirtimeToCash, getDataPlan, sendAdminMessage}