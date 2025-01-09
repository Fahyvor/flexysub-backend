const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');
// const axios = require('../lib/axios');
const axios = require('axios')
const { walletName, walletReference, axiosInstance, billStackUrl, bank } = require('../lib/axios');
require('dotenv').config();
// const axios = require('axios');

const Login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the user by email
    const user = await prisma.user.findUnique({
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
  const { firstName, lastName, phone, email, password } = req.body;

  console.log('Destructured Fields:', { firstName, lastName, phone, email, password });

  try {
    const userData = req.body;
    console.log('Request Body:', userData);

    if (!firstName || !lastName || !phone || !email || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if the email already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const reference = `${walletReference}${phone.slice(-4)}`;

    // Creating Virtual Account
    console.log('Email in Axios Payload:', userData.email);
    const response = await axios.post(`${billStackUrl}thirdparty/generateVirtualAccount`, {
      email: userData.email,
      reference,
      firstName: userData.firstName,
      lastName: userData.lastName,
      phone: userData.phone,
      bank: bank,
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.BILLSTACK_SECRET_KEY}`,
      },
    });

    console.log('Third-Party API Response:', response.data);

    // Create a new user
    const { account_number, account_name, bank_name, bank_id, account_balance } = response.data;

    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        phone,
        email,
        password: hashedPassword,
        accountNumber: account_number,
        accountName: account_name,
        bankName: bank_name,
        bankId: bank_id,
        accountBalance: account_balance || 0,
      },
    });

    res.status(201).json({ message: 'User created successfully', data: user });
  } catch (error) {
    console.error('Error:', error);
    res.status(400).json({ error: 'User creation failed', message: error.message });
  }
};

const VerifyUser = async (req, res) => {
  try {
    const { customer, bvn } = req.body

    if( !customer, !bvn )  {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate BVN
    const response = await axiosInstance.post(`thirdparty/upgradeVirtualAccount`);

    if (!customerResponse.data.data) {
      return res.status(400).json({ error: 'Invalid customer details' });
    }

    res.status(200).json({ message: 'User verification successful', data: "Success" });
  } catch (error) {
    
  }
}

const GetAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({});

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
  GetAllUsers,
  VerifyUser,
}
