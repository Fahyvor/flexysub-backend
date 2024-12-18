const axios = require('axios');

const getCablePlanByBiller = async (req, res) => {
    try {
        const { biller } = req.params;

        const loginToCVDS = await axios.post(`${process.env.CVDS_URL}login`, {
            username: process.env.CVDS_USERNAME,
            password: process.env.CVDS_PASSWORD,
        });

        const cvdsToken = loginToCVDS.data.token;
        console.log("CVDS Token:", cvdsToken);

        // Fetch all cable plans
        const cablePlans = await axios.get(`${process.env.CVDS_URL}transactions/cable/plans/${biller}`, {
            headers: {
                Authorization: `Bearer ${cvdsToken}`,
            },
        });

        if (cablePlans.status === 200) {
            console.log("Cable plans", cablePlans.data.data.variations);
            return res.status(200).json(cablePlans.data.data.variations);
        }
    } catch (error) {
        console.error("Error:", error.response?.data || error.message);
        return res.status(500).json({ message: error.message });
    }
}

const buyCablePlan = async (req, res) => {
    try {
        // Implementation to buy a cable plan goes here
        const { accountNumber, provider, selectedPackage, phone } = req.body;
    
        const loginToCVDS = await axios.post(`${process.env.CVDS_URL}login`, {
            username: process.env.CVDS_USERNAME,
            password: process.env.CVDS_PASSWORD,
        });
    
        const cvdsToken = loginToCVDS.data.token;
        console.log("CVDS Token:", cvdsToken);
    
        //Buy Cable
        const buyCable = await axios.post(`${process.env.CVDS_URL}transactions/cable/subscribe-cable`, {
            billersCode: accountNumber,
            serviceID: provider,
            variation_code: variation_code,
            phone: phone,
            amount: amount,
            package_id: selectedPackage.id,
        },
        {
            headers: {
                Authorization: `Bearer ${cvdsToken}`,
            },
        }
        );
    
        if (buyCable.status === 200) {
            return res.status(200).json({ message: buyCable.data.message, data: buyCable.data });
        } 
    } catch (error) {
        console.error("Error:", error.response?.data || error.message); // Log error details
        return res.status(500).json({ message: error.message });
    }
}

module.exports = {
    getCablePlanByBiller,
    buyCablePlan,
}