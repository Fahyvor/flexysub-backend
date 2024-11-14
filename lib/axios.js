const axios = require('axios');
const axiosRetry = require('axios-retry').default;

// Define the moniepiont url for wallet integration tests
const moniepiontUrl = process.env.SANDBOX_API_URL;

// Define the API keys for the sandbox environment
const apiKey = process.env.SANDBOX_API_KEY;
const apiSecret = process.env.SANDBOX_API_SECRET;
const bvn = process.env.BVN;
const dob = process.env.DOB;
const walletReference = "ref12345678987654";
const walletName = "Flexysub - ref12345678987654";
const apiSecretAndKey = process.env.API_KEY_AND_SECRET;

// Set the headers for the API requests
const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${apiKey}`, // Corrected template literal usage
};

// Create an axios instance with custom configuration
const axiosInstance = axios.create({
  baseURL: moniepiontUrl,
  headers: headers,
});

axiosRetry(axiosInstance, { retries: 3, retryDelay: axiosRetry.exponentialDelay });
// Export the axios instance and other variables
module.exports = {
  axiosInstance,
  moniepiontUrl,
  apiKey,
  apiSecret,
  bvn,
  dob,
  walletName,
  walletReference,
  apiSecretAndKey,
};
