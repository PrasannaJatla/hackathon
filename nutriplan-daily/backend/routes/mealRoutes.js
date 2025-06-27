const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { getMealPlan, getMealById, getAllMeals, regenerateMealPlan, replaceSingleMeal } = require('../controllers/mealController');

router.get('/plan', authMiddleware, getMealPlan);
router.post('/regenerate', authMiddleware, regenerateMealPlan);
router.post('/replace', authMiddleware, replaceSingleMeal);
router.get('/all', authMiddleware, getAllMeals);
router.get('/:id', authMiddleware, getMealById);

module.exports = router;