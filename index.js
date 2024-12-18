const express = require('express');
const cors = require('cors');
const app = express();
const userRoutes = require('./routes/userRoutes');
const vtuRoutes = require('./routes/vtuRoutes');
const electricityRoutes = require('./routes/electricityRoutes');
const cableRoutes = require('./routes/cableRoutes');

app.use(cors())

app.use(express.json());

const PORT = process.env.PORT || 9000;

app.use((err, req, res, next) => {
  if (err.name === 'UnauthorizedError') {
    res.status(401).send('Invalid token');
  } else {
    next(err);
  }
});

app.use('/api/auth', userRoutes);
app.use('/api/vtu', vtuRoutes);
app.use('/api/cable', cableRoutes);
app.use('/api/electricity', electricityRoutes);

app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

app.use('/', (req, res) => {
    res.send('Welcome to Flexysub API!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});