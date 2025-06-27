const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const mealRoutes = require('./routes/mealRoutes');
const recipeRoutes = require('./routes/recipeRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');
// const restaurantRoutes = require('./routes/restaurantRoutes');
require('./config/database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, '../frontend')));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/meals', mealRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/favorites', favoriteRoutes);
// app.use('/api/restaurants', restaurantRoutes);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});