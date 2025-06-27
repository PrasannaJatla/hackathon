const SpoonacularService = require('../services/spoonacularService');
const User = require('../models/User');

const searchRecipes = async (req, res) => {
  try {
    const { query, mealType, maxCalories, minProtein } = req.query;
    const user = await User.findById(req.userId);
    
    const { diet, intolerances } = SpoonacularService.mapDietaryPreferences(user.dietary_preferences);
    
    let recipes;
    if (minProtein && maxCalories) {
      recipes = await SpoonacularService.searchRecipesByNutrients(minProtein, maxCalories, mealType);
    } else {
      recipes = await SpoonacularService.getRandomRecipes(mealType || 'main course', diet, intolerances, 10);
    }
    
    res.json({ recipes });
  } catch (error) {
    console.error('Search recipes error:', error);
    res.status(500).json({ error: 'Error searching recipes' });
  }
};

const refreshRecipes = async (req, res) => {
  try {
    if (!process.env.SPOONACULAR_API_KEY || process.env.SPOONACULAR_API_KEY === 'your-spoonacular-api-key-here') {
      return res.status(400).json({ error: 'Spoonacular API key not configured' });
    }

    const user = await User.findById(req.userId);
    const { diet, intolerances } = SpoonacularService.mapDietaryPreferences(user.dietary_preferences);
    
    // Fetch fresh recipes for each meal type
    const [breakfastRecipes, lunchRecipes, dinnerRecipes] = await Promise.all([
      SpoonacularService.getRandomRecipes('breakfast', diet, intolerances, 5),
      SpoonacularService.getRandomRecipes('main course,salad', diet, intolerances, 5),
      SpoonacularService.getRandomRecipes('main course', diet, intolerances, 5)
    ]);
    
    res.json({
      message: 'Recipes refreshed successfully',
      count: {
        breakfast: breakfastRecipes.length,
        lunch: lunchRecipes.length,
        dinner: dinnerRecipes.length
      }
    });
  } catch (error) {
    console.error('Refresh recipes error:', error);
    res.status(500).json({ error: 'Error refreshing recipes' });
  }
};

module.exports = { searchRecipes, refreshRecipes };