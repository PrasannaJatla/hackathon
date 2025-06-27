const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { getMealPlan, getMealById, getAllMeals, regenerateMealPlan, replaceSingleMeal } = require('../controllers/mealController');
const { getWeeklyPlan, generateWeekMeals, generateDayMeals, getWeeklyShoppingList, getAmazonList } = require('../controllers/weeklyMealController');

// Daily meal plan routes
router.get('/plan', authMiddleware, getMealPlan);
router.post('/regenerate', authMiddleware, regenerateMealPlan);
router.post('/replace', authMiddleware, replaceSingleMeal);
router.get('/all', authMiddleware, getAllMeals);

// Weekly meal plan routes
router.get('/weekly-plan', authMiddleware, getWeeklyPlan);
router.post('/generate-week', authMiddleware, generateWeekMeals);
router.post('/generate-day', authMiddleware, generateDayMeals);
router.get('/weekly-shopping-list', authMiddleware, getWeeklyShoppingList);
router.get('/amazon-list', authMiddleware, getAmazonList);

router.get('/:id', authMiddleware, getMealById);

module.exports = router;