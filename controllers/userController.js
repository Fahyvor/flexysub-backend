const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');
// const axios = require('../lib/axios');
const axios = require('axios')
const { bvn,  address, dob, walletReference, axiosInstance, strowalletUrl, payvesselUrl, bank, publicKey } = require('../lib/axios');
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
//     try {
      
//       const response = await axios.post(`${payvesselUrl}external/request/customerReservedAccount/`, {
//         email,
//         name: firstName + ' ' + lastName,
//         phoneNumber: phone,
//         bankcode: [process.env.BANK_CODE],
//         businessid: process.env.BUSINESS_ID,
//         bvn: process.env.BVN,
//         nin: process.env.NIN,
//         accountType: process.env.ACCOUNT_TYPE,
//       },
//       {
//         headers: {
//           'api-key': 'PVKEY-8U0ETGN3KX8POFZ303RKR16YQ1YT4ZB7',
//           'api-secret': 'Bearer PVSECRET-Y9CLMBR3NE106LXVQD1EJ3RYHO4BDG7BMIOIDAMI8JWYP75YVHK6KKWBJRY3E1Q9',
//           'Content-Type': 'application/json'
//         }
//       }
//     );
//     console.log('First API Response:', response.data);
//     } catch (error) {
//       if (axios.isAxiosError(error)) {
//         console.error('Axios Error:', {
//           message: error.message,
//           code: error.code,
//           responseStatus: error.response?.status,
//           responseStatusText: error.response?.statusText,
//           responseData: error.response?.data
//         });   
//       } else {
//         console.error('Unexpected Error:', error);console.log('Login Request:', req.body);
// console.log('User Data:', user);
// console.log('Generated Token:', token);
// console.log('Login Response:', { message: 'Login successful', data: data });

// console.log('Sign Up Request:', req.body);
// console.log('User Data:', userData);
// console.log('Hashed Password:', hashedPassword);
// console.log('Virtual Account Response:', response.data);
// console.log('Created User:', user);

// console.log('Verify User Request:', req.body);
// console.log('Customer Response:', response.data);

// console.log('Get All Users Request:', req.query);
// console.log('Users Response:', users);
//       }   
//     }


//     console.log('Third-Party API Response:', response.data);

    // Create a new user
    // const { account_number, account_name, bank_name, bank_id, account_balance } = response.data;
    // const { accountNumber, accountName, bankName, trackingReference, accountBalance, account_type } = response.data;

    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        phone,
        email,
        password: hashedPassword,
        // accountNumber: accountNumber,
        // accountName: accountName,
        // bankName: bankName,
        // trackingReference: trackingReference,
        // accountBalance: accountBalance || 0,
        // accountType: account_type,
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
