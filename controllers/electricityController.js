const axios = require('axios');

const GetAllProviders = async (req, res) => {
    try {
        //Login to CVDS
        const loginToCVDS = await axios.post(`${process.env.CVDS_URL}login`, {
            username: process.env.CVDS_USERNAME,
            password: process.env.CVDS_PASSWORD,
        });
        const cvdsToken = loginToCVDS.data.token;
        console.log("CVDS Token:", cvdsToken);
    
        // Fetch all electricity plans
        const electricityPlans = await axios.get(`${process.env.CVDS_URL}transactions/electricity`, {
            headers: {
                Authorization: `Bearer ${cvdsToken}`,
            },
        });

        const newData = electricityPlans.data.data.map(plan => plan.name);
        console.log("Normal Rate", electricityPlans.data.data.map(plan => plan.api_price ));

        console.log("Data Plans Amount:", );

        console.log("Data Plans Name:", newData);
        res.status(200).json({message: "Successful", data: newData});
        
    } catch (error) {
        console.error("Error:", error.response?.data || error.message);
        return res.status(500).json({ message: error.message });
    }
}

const BuyElectricityUnits = async (req, res) => {
    try {
        const { meterNumber, provider, phone, amount } = req.body

        //Login to CVDS
        const loginToCVDS = await axios.post(`${process.env.CVDS_URL}login`, {
            username: process.env.CVDS_USERNAME,
            password: process.env.CVDS_PASSWORD,
        });
        const cvdsToken = loginToCVDS.data.token;
        console.log("CVDS Token:", cvdsToken);

        //Buy Electricity Plans
        const buyUnits = await axios.post(`${process.env.CVDS_URL}transactions/electricity/purchase`, {
            billersCode: meterNumber,
            serviceID: provider,
            variation_code: "prepaid",
            phone: phone,
            amount: amount
        }, {
            headers: {
                Authorization: `Bearer ${cvdsToken}`,
            }
        })

        if(buyUnits.status === 200) {
            return res.status(200).json({
                message: buyUnits.data.message
            })
        } else {
            console.log("Message:", buyUnits.data.message)
            return res.status(buyUnits.status).json({
                message: buyUnits.data.message
            })
        }
    } catch (error) {
        // Handle errors
        console.error("Error in BuyAirtime:", error.response?.data || error.message);
        return res.status(500).json({
            message: "Failed to recharge airtime",
            error: error.response?.data || error.message,
        });
    }
}

module.exports={GetAllProviders, BuyElectricityUnits}