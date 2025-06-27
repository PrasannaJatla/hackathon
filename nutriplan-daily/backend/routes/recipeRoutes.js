const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { searchRecipes, refreshRecipes } = require('../controllers/recipeController');

router.get('/search', authMiddleware, searchRecipes);
router.post('/refresh', authMiddleware, refreshRecipes);

module.exports = router;