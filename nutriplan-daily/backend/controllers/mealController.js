const Meal = require('../models/Meal');
const MealPlan = require('../models/MealPlan');
const User = require('../models/User');

const getMealPlan = async (req, res) => {
  try {
    console.log('Getting meal plan for user:', req.userId);
    
    const user = await User.findById(req.userId);
    if (!user) {
      console.error('User not found:', req.userId);
      return res.status(404).json({ error: 'User not found' });
    }
    
    console.log('User found:', user.email);
    
    const preferences = {
      dietary_preferences: user.dietary_preferences,
      allergies: user.allergies
    };

    console.log('Generating meal plan with preferences:', preferences);
    
    const mealPlan = await MealPlan.generateForUser(req.userId, preferences);
    
    if (!mealPlan) {
      console.error('No meal plan generated');
      return res.status(500).json({ error: 'Failed to generate meal plan' });
    }
    
    // Get regeneration count
    const regenerationCount = await User.getRegenerationCount(req.userId);
    
    console.log('Meal plan generated:', {
      breakfast: mealPlan.breakfast?.name,
      lunch: mealPlan.lunch?.name,
      dinner: mealPlan.dinner?.name
    });
    
    const totalNutrition = {
      calories: (mealPlan.breakfast.calories || 0) + (mealPlan.lunch.calories || 0) + (mealPlan.dinner.calories || 0),
      protein: (mealPlan.breakfast.protein || 0) + (mealPlan.lunch.protein || 0) + (mealPlan.dinner.protein || 0),
      carbs: (mealPlan.breakfast.carbs || 0) + (mealPlan.lunch.carbs || 0) + (mealPlan.dinner.carbs || 0),
      fat: (mealPlan.breakfast.fat || 0) + (mealPlan.lunch.fat || 0) + (mealPlan.dinner.fat || 0)
    };

    res.json({
      mealPlan,
      totalNutrition,
      regenerationCount,
      regenerationLimit: 3
    });
  } catch (error) {
    console.error('Get meal plan error:', error.message);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ error: 'Error fetching meal plan: ' + error.message });
  }
};

const getMealById = async (req, res) => {
  try {
    const meal = await Meal.findById(req.params.id);
    if (!meal) {
      return res.status(404).json({ error: 'Meal not found' });
    }
    res.json(meal);
  } catch (error) {
    console.error('Get meal error:', error);
    res.status(500).json({ error: 'Error fetching meal' });
  }
};

const getAllMeals = async (req, res) => {
  try {
    const meals = await Meal.findAll();
    res.json(meals);
  } catch (error) {
    console.error('Get all meals error:', error);
    res.status(500).json({ error: 'Error fetching meals' });
  }
};

const regenerateMealPlan = async (req, res) => {
  try {
    // Check regeneration count
    const regenerationCount = await User.getRegenerationCount(req.userId);
    
    if (regenerationCount >= 3) {
      return res.status(403).json({ error: 'You have reached your regeneration limit' });
    }
    
    const user = await User.findById(req.userId);
    const preferences = {
      dietary_preferences: user.dietary_preferences,
      allergies: user.allergies
    };

    // Delete existing meal plan for today
    const today = new Date().toISOString().split('T')[0];
    await MealPlan.deleteByUserAndDate(req.userId, today);

    // Generate new meal plan with forceNew flag
    const mealPlan = await MealPlan.generateForUser(req.userId, preferences, true);
    
    // Increment regeneration count
    await User.incrementRegenerationCount(req.userId);
    
    const totalNutrition = {
      calories: (mealPlan.breakfast.calories || 0) + (mealPlan.lunch.calories || 0) + (mealPlan.dinner.calories || 0),
      protein: (mealPlan.breakfast.protein || 0) + (mealPlan.lunch.protein || 0) + (mealPlan.dinner.protein || 0),
      carbs: (mealPlan.breakfast.carbs || 0) + (mealPlan.lunch.carbs || 0) + (mealPlan.dinner.carbs || 0),
      fat: (mealPlan.breakfast.fat || 0) + (mealPlan.lunch.fat || 0) + (mealPlan.dinner.fat || 0)
    };

    res.json({
      mealPlan,
      totalNutrition,
      regenerationCount: regenerationCount + 1,
      regenerationLimit: 3
    });
  } catch (error) {
    console.error('Regenerate meal plan error:', error);
    res.status(500).json({ error: 'Error regenerating meal plan' });
  }
};

const replaceSingleMeal = async (req, res) => {
  try {
    const { mealId, mealType } = req.body;
    
    if (!mealId || !mealType) {
      return res.status(400).json({ error: 'Meal ID and type are required' });
    }
    
    // Validate meal type
    if (!['breakfast', 'lunch', 'dinner'].includes(mealType)) {
      return res.status(400).json({ error: 'Invalid meal type' });
    }
    
    const user = await User.findById(req.userId);
    const preferences = {
      dietary_preferences: user.dietary_preferences,
      allergies: user.allergies
    };
    
    // Get a new meal of the same type
    const newMeal = await MealPlan.getReplacementMeal(mealType, preferences, req.userId);
    
    if (!newMeal) {
      return res.status(404).json({ error: 'No replacement meal available' });
    }
    
    // Update the meal plan
    const today = new Date().toISOString().split('T')[0];
    await MealPlan.updateSingleMeal(req.userId, today, mealType, newMeal.id);
    
    res.json({ newMeal });
  } catch (error) {
    console.error('Replace single meal error:', error);
    res.status(500).json({ error: 'Error replacing meal' });
  }
};

module.exports = { getMealPlan, getMealById, getAllMeals, regenerateMealPlan, replaceSingleMeal };