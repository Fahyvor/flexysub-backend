const axios = require('axios');

const GetBettingProviders = async (req, res) => {
    try {
        //Login to CVDS
        const loginToCVDS = await axios.post(`${process.env.CVDS_URL}login`, {
            username: process.env.CVDS_USERNAME,
            password: process.env.CVDS_PASSWORD,
        });
        const cvdsToken = loginToCVDS.data.token;
        console.log("CVDS Token:", cvdsToken);

        // Fetch all betting providers
        const bettingProviders = await axios.get(`${process.env.CVDS_URL}transactions/betting`, {
            headers: {
                Authorization: `Bearer ${cvdsToken}`,
            },
        });

        console.log("Betting Providers:", bettingProviders.data.data.map(provider => provider.name));
        res.status(200).json({message: "Successful", data: bettingProviders.data.data.map(provider => provider.name)});
    } catch (error) {
        
    }
}