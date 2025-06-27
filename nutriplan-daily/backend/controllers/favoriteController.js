const Favorite = require('../models/Favorite');

const addFavorite = async (req, res) => {
  try {
    const userId = req.userId;
    const { mealId } = req.params;
    
    await Favorite.add(userId, mealId);
    res.json({ success: true, message: 'Meal added to favorites' });
  } catch (error) {
    console.error('Add favorite error:', error);
    res.status(500).json({ error: 'Error adding favorite' });
  }
};

const removeFavorite = async (req, res) => {
  try {
    const userId = req.userId;
    const { mealId } = req.params;
    
    const changes = await Favorite.remove(userId, mealId);
    if (changes > 0) {
      res.json({ success: true, message: 'Meal removed from favorites' });
    } else {
      res.status(404).json({ error: 'Favorite not found' });
    }
  } catch (error) {
    console.error('Remove favorite error:', error);
    res.status(500).json({ error: 'Error removing favorite' });
  }
};

const getFavorites = async (req, res) => {
  try {
    const userId = req.userId;
    const favorites = await Favorite.getUserFavorites(userId);
    res.json(favorites);
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({ error: 'Error fetching favorites' });
  }
};

const checkFavorite = async (req, res) => {
  try {
    const userId = req.userId;
    const { mealId } = req.params;
    
    const isFavorite = await Favorite.isFavorite(userId, mealId);
    res.json({ isFavorite });
  } catch (error) {
    console.error('Check favorite error:', error);
    res.status(500).json({ error: 'Error checking favorite status' });
  }
};

module.exports = {
  addFavorite,
  removeFavorite,
  getFavorites,
  checkFavorite
};