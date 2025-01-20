const axios = require('axios');
const axiosRetry = require('axios-retry').default;

// Define the moniepiont url for wallet integration tests
// const billStackUrl = process.env.BILLSTACK_URL;
const strowalletUrl = process.env.STROWALLET_URL

// Define the API keys for the sandbox environment
// const apiKey = process.env.BILLSTACK_SECRET_KEY;
const apiSecret = process.env.PAYVESSEL_SECRET;
const apiKey = process.env.PAYVESSEL_KEY
// const publicKey = process.env.BILLSTACK_PUBLIC_KEY;
const publicKey = process.env.STROWALLET_PUBLIC_KEY;
const secretKey = process.env.STROWALLET_SECRET_KEY;
const bvn = process.env.BVN;
const address = process.env.ADDRESS;
const dob = process.env.DOB;
const walletReference = "flexysub";
const bank = "9BSB"
const payvesselUrl = process.env.PAYVESSEL_URL;

// Set the headers for the API requests
// const headers = {
//   'Content-Type': 'application/json',
//   // 'Authorization': `Bearer ${apiKey}`,
// };

// Payvessel Heades
const headers = {
  'api-key': apiKey,
  'api-secret': `Bearer ${apiSecret}`,
  'Content-Type': 'application/json',
};

// Create an axios instance with custom configuration
const axiosInstance = axios.create({
  baseURL: payvesselUrl,
  headers: headers,
});

axiosRetry(axiosInstance, { retries: 3, retryDelay: axiosRetry.exponentialDelay });
// Export the axios instance and other variables
module.exports = {
  axiosInstance,
  bvn,
  address,
  dob,
  strowalletUrl,
  payvesselUrl,
  secretKey,
  apiSecret,
  publicKey,
  walletReference,
  bank,
};
