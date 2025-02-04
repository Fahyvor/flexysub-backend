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
    console.log(error);
    res.status(500).json({ error: 'Login failed', details: error.message });
  }
}

// const SignUp = async (req, res) => {
//   const { firstName, lastName, phone, email, password } = req.body;

//   console.log('Destructured Fields:', { firstName, lastName, phone, email, password });

//   try {
//     const userData = req.body;
//     console.log('Request Body:', userData);

//     if (!firstName || !lastName || !phone || !email || !password) {
//       return res.status(400).json({ error: 'Missing required fields' });
//     }

//     // Check if the email already exists
//     const existingUser = await prisma.user.findUnique({ where: { email } });
//     if (existingUser) {
//       return res.status(400).json({ error: 'Email already in use' });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Create a new user
//     const user = await prisma.user.create({
//       data: {
//         firstName,
//         lastName,
//         phone,
//         email,
//         password: hashedPassword,
//       },
//     });

//     res.status(201).json({ message: 'User created successfully', data: user });
//   } catch (error) {
//     console.error('Error:', error);
//     res.status(400).json({ error: 'User creation failed', message: error.message || 'An unknown error occurred' });
//   }
// };

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
    let response;
    try {
      response = await axios.post(
        `${payvesselUrl}external/request/customerReservedAccount/`,
        {
          email,
          name: firstName + ' ' + lastName,
          phoneNumber: phone,
          bankcode: [process.env.BANK_CODE],
          businessid: process.env.BUSINESS_ID,
          nin: process.env.NIN,
          accountType: process.env.ACCOUNT_TYPE,
        },
        {
          headers: {
            'api-key': `${process.env.PAYVESSEL_KEY}`,
            'api-secret': `Bearer ${process.env.PAYVESSEL_SECRET}`,
            'Content-Type': 'application/json',
          },
        }
      );
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Axios Error:', {
          message: error.message,
          code: error.code,
          responseStatus: error.response?.status,
          responseStatusText: error.response?.statusText,
          responseData: error.response?.data,
        });
      } else {
        console.error('Unexpected Error:', error);
      }
    }

    if (!response) {
      return res.status(400).json({ error: 'Failed to create virtual account' });
    }

    console.log('Third-Party API Response:', response.data.banks);

    // const { accountNumber, accountName, bankName, trackingReference, accountBalance, account_type } = response.data.banks;

    const bankDetails = response.data.banks[0]; // Assuming you want the first bank details from the array

    console.log('Third-Party API Response:', bankDetails);

    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        phone,
        email,
        password: hashedPassword,
        accountNumber: bankDetails.accountNumber,
        accountName: bankDetails.accountName,
        bankName: bankDetails.bankName,
        trackingReference: bankDetails.trackingReference,
        accountBalance: bankDetails.accountBalance || 0,
        accountType: bankDetails.account_type,
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

//Update User Data
const UpdateUserData = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, phone, email } = req.body;

    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data: {
        firstName,
        lastName,
        phone,
        email,
        password,
      },
    });

    if(!user) {
      return res.status(400).json({ message: 'User not found', status: "Failed" });
    }

    res.status(200).json({ message: 'User updated successfully', data: user });
  }  catch (error) {
    res.status(500).json({ error: 'Failed to update user', message: error.message });
  }
}

//Delete User
const DeleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.delete({
      where: { id: id },
    });

    if(!user) {
      return res.status(400).json({ message: 'User not found', status: "Failed" });
    }

    res.status(200).json({ message: 'User deleted successfully', data: user });
  }  catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Failed to delete user', message: error.message });
  }
}

const ResetPassword = async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const body = await req.json();
    const saltRounds = 10;

    const { email } = body;

    if (!email) {
      return res.status(400).json({ message: "Email address is required" });
    }

    const sqlFindUser = "SELECT * FROM users WHERE email = ?";
    const [findUser] = await connection.query(sqlFindUser, [email]);

    if (!findUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const newPassword = Math.random().toString(36).slice(2, 10);

    // Hash the new password
    const hash = await bcrypt.hash(newPassword, saltRounds);

    // Update the password in the database
    const sqlUpdatePassword = "UPDATE users SET password = ? WHERE email = ?";
    await connection.query(sqlUpdatePassword, [hash, email]);

    console.log("New Password Hash:", hash);
    console.log("New Password:", newPassword);

    // Send New password to user's mail
    const mailOptions = {
      from: "flexysubsupport@flexysub.ng",
      to: email,
      subject: "Your New FlexySub Password",
      text: `Your new password is: ${newPassword}`,
    };

    const sentMail = await transporter.sendMail(mailOptions);
    console.log("Email Sent:", sentMail);

    return res.status(200).json({
      message: "Password reset and sent successfully to your mail, Please check your mail",
    });
  } catch (error) {
    console.error("Error resetting password:", error);
    return res.status(500).json({ message: "Error resetting password" });
  }
}



module.exports = {
  Login,
  SignUp,
  GetAllUsers,
  VerifyUser,
  UpdateUserData,
  DeleteUser,
  ResetPassword,
}
