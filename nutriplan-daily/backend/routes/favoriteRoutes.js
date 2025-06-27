const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { addFavorite, removeFavorite, getFavorites, checkFavorite } = require('../controllers/favoriteController');

// All favorite routes require authentication
router.use(authMiddleware);

router.get('/', getFavorites);
router.post('/:mealId', addFavorite);
router.delete('/:mealId', removeFavorite);
router.get('/:mealId/check', checkFavorite);

module.exports = router;