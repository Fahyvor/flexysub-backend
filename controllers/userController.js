const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');
const axios = require('../lib/axios');
const { apiKey, apiSecret, bvn, dob, walletName, walletReference, axiosInstance, apiSecretAndKey } = require('../lib/axios');
require('dotenv').config();
// const axios = require('axios');

const Login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the user by email
    const user = await prisma.User.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Compare the provided password with the stored hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate a JWT token
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { algorithm: 'HS256', expiresIn: '24h' });
    const data = { user, token };

    res.status(200).json({ message: 'Login successful', data: data });
  } catch (error) {
    res.status(500).json({ error: 'Login failed', details: error.message });
  }
}

const SignUp = async (req, res) => {
  const { name, phone, email, password } = req.body;

  try {
    if (!name || !phone || !email || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Check if the email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Get a Bearer token from sandbox first
    const response = await axiosInstance.post('auth/login', {}, 
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${apiSecretAndKey}`
        },
        timeout: 5000
      }
    );

    if(response.status === 200) {
      // console.log(response.data);
      console.log(response.data.responseBody.accessToken)
    }

    // const { data } = response.data;
    const newAccessToken = response.data.responseBody.accessToken;

    if (!response.data.responseBody.accessToken) {
      return res.status(500).json({ error: 'Failed to get Bearer token from sandbox', message: data.message });
    }

    // Set the Bearer token in the response header
    res.setHeader('Authorization', `Bearer ${newAccessToken}`);

    // Create a wallet for the user
    const walletResponse = await axiosInstance.post('disbursements/wallet', {
      walletName: walletName,
      walletReference: walletReference,
      customerName: name,
      bvnDetails: {
        bvn: bvn,
        bvnDateofBirth: dob
      },
      customerEmail: email
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${newAccessToken}`
      }
    });

    console.log(walletResponse.data)

    // Create a new user
    const user = await prisma.User.create({
      data: {
        name,
        phone,
        email,
        password: hashedPassword,
        accountNumber: String(walletResponse.data.responseBody.accountNumber),
        accountName: walletResponse.data.responseBody.accountName,
        accountBalance: 0,
        // topUpAccountNumber: walletResponse.topUpAccountDetails.accountNumber,
        // bankName: walletResponse.topUpAccountDetails.bankName
      },
    });


    res.status(201).json({ message: 'User created successfully', data: "Success" });
  } catch (error) {
    res.status(400).json({ error: 'User creation failed', message: error.message });
    console.log(error)
  }
}

const GetAllUsers = async (req, res) => {
  try {
    const users = await prisma.User.findMany();

    if (!users || users.length === 0) {
      return res.status(200).json({ message: 'No user found', status: "Success" });
    }

    res.status(200).json({ message: 'Users retrieved successfully', data: users });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve users', message: error.message });
  }
}

module.exports = {
  Login,
  SignUp,
  GetAllUsers
}
