const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');

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
    const token = jwt.sign({ userId: user.id }, 'your_jwt_secret', { expiresIn: '24h' });
    const data = {user, token};

    res.status(200).json({ message: 'Login successful', data: data });
  } catch (error) {
    res.status(500).json({ error: 'Login failed', details: error.message });
  }
}


const SignUp = async (req, res) => {
  const { name, phone, email, address, password } = req.body;

  try {
    if (!name ||!phone ||!email ||!address ||!password) {
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

    // Create a new user
    const user = await prisma.user.create({
      data: {
        name,
        phone,
        email,
        address,
        password: hashedPassword,
      },
    });

    res.status(201).json({ message: 'User created successfully', data: "Success" });
  } catch (error) {
    res.status(400).json({ error: 'User creation failed', message: error.message });
  }
}

const GetAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany();

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