const axios = require('axios');
const axiosRetry = require('axios-retry').default;

// Define the moniepiont url for wallet integration tests
const billStackUrl = process.env.BILLSTACK_URL;

// Define the API keys for the sandbox environment
const apiKey = process.env.BILLSTACK_SECRET_KEY;
const publicKey = process.env.BILLSTACK_PUBLIC_KEY;
const walletReference = "flexysub";
const bank = "PROVIDUS"

// Set the headers for the API requests
const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${apiKey}`,
};

// Create an axios instance with custom configuration
const axiosInstance = axios.create({
  baseURL: billStackUrl,
  headers: headers,
});

axiosRetry(axiosInstance, { retries: 3, retryDelay: axiosRetry.exponentialDelay });
// Export the axios instance and other variables
module.exports = {
  axiosInstance,
  billStackUrl,
  apiKey,
  publicKey,
  walletReference,
  bank,
};
