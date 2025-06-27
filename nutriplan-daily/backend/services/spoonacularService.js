const axios = require('axios');
const NodeCache = require('node-cache');

// Cache for 24 hours to reduce API calls
const cache = new NodeCache({ stdTTL: 86400 });

const SPOONACULAR_BASE_URL = 'https://api.spoonacular.com';
const API_KEY = process.env.SPOONACULAR_API_KEY;

class SpoonacularService {
  // Clear cache
  static clearCache() {
    cache.flushAll();
    console.log('Spoonacular cache cleared');
  }

  // Get random recipes based on meal type and dietary preferences
  static async getRandomRecipes(mealType, diet = '', intolerances = '', number = 10, bypassCache = false) {
    const cacheKey = `recipes_${mealType}_${diet}_${intolerances}`;
    
    if (!bypassCache) {
      const cachedData = cache.get(cacheKey);
      if (cachedData) {
        return cachedData;
      }
    }

    try {
      const params = {
        apiKey: API_KEY,
        number,
        tags: mealType,
        includeNutrition: true,
        addRecipeInformation: true,
        addRecipeNutrition: true,
        fillIngredients: true,
        instructionsRequired: true
      };

      if (diet) params.diet = diet;
      if (intolerances) params.intolerances = intolerances;

      const response = await axios.get(`${SPOONACULAR_BASE_URL}/recipes/random`, { params });
      
      const recipes = response.data.recipes.map(recipe => this.formatRecipe(recipe, mealType));
      cache.set(cacheKey, recipes);
      
      return recipes;
    } catch (error) {
      console.error('Error fetching recipes from Spoonacular:', error);
      return [];
    }
  }

  // Get recipe by ID
  static async getRecipeById(recipeId) {
    const cacheKey = `recipe_${recipeId}`;
    const cachedData = cache.get(cacheKey);
    
    if (cachedData) {
      return cachedData;
    }

    try {
      const response = await axios.get(`${SPOONACULAR_BASE_URL}/recipes/${recipeId}/information`, {
        params: {
          apiKey: API_KEY,
          includeNutrition: true
        }
      });
      
      const recipe = this.formatRecipe(response.data);
      cache.set(cacheKey, recipe);
      
      return recipe;
    } catch (error) {
      console.error('Error fetching recipe details:', error);
      return null;
    }
  }

  // Search recipes by nutrients
  static async searchRecipesByNutrients(minProtein, maxCalories, mealType) {
    try {
      const params = {
        apiKey: API_KEY,
        minProtein,
        maxCalories,
        number: 10,
        random: true
      };

      const response = await axios.get(`${SPOONACULAR_BASE_URL}/recipes/findByNutrients`, { params });
      
      const recipePromises = response.data.map(recipe => this.getRecipeById(recipe.id));
      const detailedRecipes = await Promise.all(recipePromises);
      
      return detailedRecipes.filter(recipe => recipe !== null);
    } catch (error) {
      console.error('Error searching recipes by nutrients:', error);
      return [];
    }
  }

  // Format recipe data to match our database schema
  static formatRecipe(recipe, mealType = null) {
    // Debug logging
    console.log('Recipe nutrition data:', JSON.stringify(recipe.nutrition, null, 2));
    
    // Try different paths for nutrition data
    let nutrition = [];
    if (recipe.nutrition?.nutrients) {
      nutrition = recipe.nutrition.nutrients;
    } else if (recipe.nutrients) {
      nutrition = recipe.nutrients;
    }
    
    const getNutrient = (name) => {
      // Try multiple possible nutrient names
      const possibleNames = [name, name.toLowerCase(), name.charAt(0).toUpperCase() + name.slice(1)];
      
      for (const possibleName of possibleNames) {
        const nutrient = nutrition.find(n => 
          n.name?.toLowerCase() === possibleName.toLowerCase() ||
          n.title?.toLowerCase() === possibleName.toLowerCase()
        );
        if (nutrient) {
          return Math.round(nutrient.amount || nutrient.value || 0);
        }
      }
      
      // If not found in array, try direct properties
      if (recipe.nutrition?.caloricBreakdown) {
        if (name.toLowerCase() === 'protein') {
          return Math.round(recipe.nutrition.caloricBreakdown.percentProtein * recipe.nutrition.nutrients?.[0]?.amount / 100 || 0);
        }
        if (name.toLowerCase() === 'carbohydrates' || name.toLowerCase() === 'carbs') {
          return Math.round(recipe.nutrition.caloricBreakdown.percentCarbs * recipe.nutrition.nutrients?.[0]?.amount / 100 || 0);
        }
        if (name.toLowerCase() === 'fat') {
          return Math.round(recipe.nutrition.caloricBreakdown.percentFat * recipe.nutrition.nutrients?.[0]?.amount / 100 || 0);
        }
      }
      
      return 0;
    };

    // Extract ingredients
    const ingredients = recipe.extendedIngredients?.map(ing => ing.original) || [];
    
    // Extract instructions
    const instructions = recipe.analyzedInstructions?.[0]?.steps?.map(step => step.step) || 
                       (recipe.instructions ? [recipe.instructions] : []);

    // Determine meal type if not provided
    if (!mealType) {
      if (recipe.dishTypes?.includes('breakfast')) mealType = 'breakfast';
      else if (recipe.dishTypes?.includes('lunch') || recipe.dishTypes?.includes('salad')) mealType = 'lunch';
      else mealType = 'dinner';
    }

    // Build dietary tags
    const dietaryTags = [];
    if (recipe.vegetarian) dietaryTags.push('vegetarian');
    if (recipe.vegan) dietaryTags.push('vegan');
    if (recipe.glutenFree) dietaryTags.push('gluten-free');
    if (recipe.dairyFree) dietaryTags.push('dairy-free');
    if (recipe.lowFodmap) dietaryTags.push('low-fodmap');
    if (getNutrient('carbohydrates') < 30) dietaryTags.push('low-carb');
    if (getNutrient('protein') > 30) dietaryTags.push('high-protein');

    // Try to get nutritional values with multiple fallbacks
    const calories = getNutrient('calories') || 
                    recipe.nutrition?.nutrients?.find(n => n.name === 'Calories')?.amount ||
                    recipe.calories || 
                    0;
    
    const protein = getNutrient('protein') || 
                   recipe.nutrition?.nutrients?.find(n => n.name === 'Protein')?.amount ||
                   recipe.protein ||
                   0;
    
    const carbs = getNutrient('carbohydrates') || 
                 getNutrient('carbs') ||
                 recipe.nutrition?.nutrients?.find(n => n.name === 'Carbohydrates')?.amount ||
                 recipe.carbs ||
                 0;
    
    const fat = getNutrient('fat') || 
               recipe.nutrition?.nutrients?.find(n => n.name === 'Fat')?.amount ||
               recipe.fat ||
               0;
    
    const fiber = getNutrient('fiber') || 
                 recipe.nutrition?.nutrients?.find(n => n.name === 'Fiber')?.amount ||
                 recipe.fiber ||
                 0;

    console.log(`Formatted recipe ${recipe.title}: calories=${calories}, protein=${protein}, carbs=${carbs}, fat=${fat}`);

    return {
      spoonacular_id: recipe.id,
      name: recipe.title,
      meal_type: mealType,
      calories: Math.round(calories),
      protein: Math.round(protein),
      carbs: Math.round(carbs),
      fat: Math.round(fat),
      fiber: Math.round(fiber),
      prep_time: recipe.preparationMinutes || 15,
      cook_time: recipe.cookingMinutes || recipe.readyInMinutes || 30,
      difficulty: recipe.readyInMinutes > 60 ? 'Hard' : recipe.readyInMinutes > 30 ? 'Medium' : 'Easy',
      image_url: recipe.image || `https://spoonacular.com/recipeImages/${recipe.id}-636x393.jpg`,
      dietary_tags: dietaryTags.join(','),
      ingredients: JSON.stringify(ingredients),
      instructions: JSON.stringify(instructions),
      servings: recipe.servings || 1,
      source_url: recipe.sourceUrl || `https://spoonacular.com/recipes/${recipe.title.replace(/\s+/g, '-')}-${recipe.id}`
    };
  }

  // Convert dietary preferences to Spoonacular format
  static mapDietaryPreferences(preferences) {
    const dietMap = {
      'vegetarian': 'vegetarian',
      'vegan': 'vegan',
      'gluten-free': 'gluten free',
      'dairy-free': 'dairy free',
      'low-carb': 'ketogenic',
      'high-protein': 'primal'
    };

    const diets = [];
    const intolerances = [];

    if (preferences) {
      const prefs = preferences.split(',').map(p => p.trim());
      
      prefs.forEach(pref => {
        if (dietMap[pref]) {
          if (pref.includes('free')) {
            intolerances.push(pref.split('-')[0]);
          } else {
            diets.push(dietMap[pref]);
          }
        }
      });
    }

    return {
      diet: diets.join(','),
      intolerances: intolerances.join(',')
    };
  }
}

module.exports = SpoonacularService;