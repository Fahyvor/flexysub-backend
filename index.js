const express = require('express');
const cors = require('cors');
const app = express();
const userRoutes = require('./routes/userRoutes');

app.use(cors())

app.use(express.json());

const PORT = process.env.PORT || 9000;

app.use('/api/auth', userRoutes);

app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

app.use('/', (req, res) => {
    res.send('Welcome to Flexysub API!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});