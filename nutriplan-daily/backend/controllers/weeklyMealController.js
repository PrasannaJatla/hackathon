const MealPlan = require('../models/MealPlan');
const User = require('../models/User');

// Get weekly meal plan
const getWeeklyPlan = async (req, res) => {
  try {
    const { startDate } = req.query;
    
    if (!startDate) {
      return res.status(400).json({ error: 'Start date is required' });
    }
    
    const user = await User.findById(req.userId);
    const preferences = {
      dietary_preferences: user.dietary_preferences,
      allergies: user.allergies
    };
    
    // Generate 7 days of meal plans
    const weeklyPlan = [];
    const startDateTime = new Date(startDate);
    
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(startDateTime);
      currentDate.setDate(startDateTime.getDate() + i);
      const dateStr = currentDate.toISOString().split('T')[0];
      
      // Check if meal plan exists for this date
      let mealPlan = await MealPlan.findByUserAndDate(req.userId, dateStr);
      
      if (!mealPlan) {
        // Generate new meal plan for this date
        mealPlan = await MealPlan.generateForUser(req.userId, preferences, false, dateStr);
      }
      
      weeklyPlan.push({
        date: dateStr,
        dayName: currentDate.toLocaleDateString('en-US', { weekday: 'long' }),
        meals: mealPlan
      });
    }
    
    res.json({ weeklyPlan });
  } catch (error) {
    console.error('Get weekly plan error:', error);
    res.status(500).json({ error: 'Error fetching weekly meal plan' });
  }
};

// Generate full week of meals
const generateWeekMeals = async (req, res) => {
  try {
    const { startDate } = req.body;
    
    if (!startDate) {
      return res.status(400).json({ error: 'Start date is required' });
    }
    
    const user = await User.findById(req.userId);
    const preferences = {
      dietary_preferences: user.dietary_preferences,
      allergies: user.allergies
    };
    
    // Delete existing meal plans for the week
    const startDateTime = new Date(startDate);
    const weeklyPlan = [];
    
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(startDateTime);
      currentDate.setDate(startDateTime.getDate() + i);
      const dateStr = currentDate.toISOString().split('T')[0];
      
      // Delete existing plan
      await MealPlan.deleteByUserAndDate(req.userId, dateStr);
      
      // Generate new meal plan
      const mealPlan = await MealPlan.generateForUser(req.userId, preferences, true, dateStr);
      
      weeklyPlan.push({
        date: dateStr,
        dayName: currentDate.toLocaleDateString('en-US', { weekday: 'long' }),
        meals: mealPlan
      });
    }
    
    res.json({ weeklyPlan });
  } catch (error) {
    console.error('Generate week meals error:', error);
    res.status(500).json({ error: 'Error generating weekly meal plan' });
  }
};

// Generate meals for a specific day
const generateDayMeals = async (req, res) => {
  try {
    const { date } = req.body;
    
    if (!date) {
      return res.status(400).json({ error: 'Date is required' });
    }
    
    const user = await User.findById(req.userId);
    const preferences = {
      dietary_preferences: user.dietary_preferences,
      allergies: user.allergies
    };
    
    // Delete existing meal plan for this date
    await MealPlan.deleteByUserAndDate(req.userId, date);
    
    // Generate new meal plan
    const mealPlan = await MealPlan.generateForUser(req.userId, preferences, true, date);
    
    res.json({ 
      date,
      dayName: new Date(date).toLocaleDateString('en-US', { weekday: 'long' }),
      meals: mealPlan 
    });
  } catch (error) {
    console.error('Generate day meals error:', error);
    res.status(500).json({ error: 'Error generating daily meal plan' });
  }
};

// Get consolidated shopping list for the week
const getWeeklyShoppingList = async (req, res) => {
  try {
    const { startDate } = req.query;
    
    if (!startDate) {
      return res.status(400).json({ error: 'Start date is required' });
    }
    
    // Get all meals for the week
    const startDateTime = new Date(startDate);
    const allIngredients = {};
    const mealsByCategory = {
      breakfast: [],
      lunch: [],
      dinner: []
    };
    
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(startDateTime);
      currentDate.setDate(startDateTime.getDate() + i);
      const dateStr = currentDate.toISOString().split('T')[0];
      
      const mealPlan = await MealPlan.findByUserAndDate(req.userId, dateStr);
      
      if (mealPlan) {
        // Process breakfast
        if (mealPlan.breakfast) {
          mealsByCategory.breakfast.push(mealPlan.breakfast);
          processIngredients(mealPlan.breakfast.ingredients, allIngredients);
        }
        
        // Process lunch
        if (mealPlan.lunch) {
          mealsByCategory.lunch.push(mealPlan.lunch);
          processIngredients(mealPlan.lunch.ingredients, allIngredients);
        }
        
        // Process dinner
        if (mealPlan.dinner) {
          mealsByCategory.dinner.push(mealPlan.dinner);
          processIngredients(mealPlan.dinner.ingredients, allIngredients);
        }
      }
    }
    
    // Categorize ingredients
    const categorizedList = categorizeIngredients(allIngredients);
    
    res.json({ 
      shoppingList: categorizedList,
      mealsByCategory,
      totalItems: Object.keys(allIngredients).length
    });
  } catch (error) {
    console.error('Get weekly shopping list error:', error);
    res.status(500).json({ error: 'Error generating shopping list' });
  }
};

// Helper function to process ingredients
function processIngredients(ingredients, allIngredients) {
  if (!ingredients || !Array.isArray(ingredients)) return;
  
  ingredients.forEach(ingredient => {
    // Handle both string ingredients and object ingredients
    if (typeof ingredient === 'string') {
      // For simple string ingredients, just add them to the list
      const key = ingredient.toLowerCase().trim();
      if (key) {
        allIngredients[key] = { name: ingredient, amount: 1, unit: 'item' };
      }
    } else if (ingredient && typeof ingredient === 'object' && ingredient.name) {
      // For object ingredients with name property
      const key = ingredient.name.toLowerCase();
      if (allIngredients[key]) {
        // Combine quantities if units match
        if (allIngredients[key].unit === ingredient.unit) {
          allIngredients[key].amount += ingredient.amount;
        } else {
          // If units don't match, create a new entry with a different key
          const newKey = `${key}_${ingredient.unit}`;
          allIngredients[newKey] = { ...ingredient };
        }
      } else {
        allIngredients[key] = { ...ingredient };
      }
    }
  });
}

// Helper function to categorize ingredients
function categorizeIngredients(ingredients) {
  const categories = {
    'Produce': [],
    'Meat & Seafood': [],
    'Dairy & Eggs': [],
    'Grains & Bread': [],
    'Pantry': [],
    'Frozen': [],
    'Other': []
  };
  
  for (const [key, ingredient] of Object.entries(ingredients)) {
    const category = getIngredientCategory(ingredient.name);
    categories[category].push({
      name: ingredient.name,
      amount: Math.round(ingredient.amount * 10) / 10,
      unit: ingredient.unit
    });
  }
  
  // Remove empty categories
  return Object.entries(categories)
    .filter(([_, items]) => items.length > 0)
    .reduce((acc, [category, items]) => {
      acc[category] = items.sort((a, b) => a.name.localeCompare(b.name));
      return acc;
    }, {});
}

// Helper function to determine ingredient category
function getIngredientCategory(ingredientName) {
  const name = ingredientName.toLowerCase();
  
  // Produce
  if (/vegetable|tomato|lettuce|spinach|onion|garlic|potato|carrot|pepper|cucumber|broccoli|celery|mushroom|corn|bean|pea|fruit|apple|banana|orange|lemon|lime|berry|grape/.test(name)) {
    return 'Produce';
  }
  
  // Meat & Seafood
  if (/chicken|beef|pork|turkey|fish|salmon|tuna|shrimp|bacon|sausage|meat|steak/.test(name)) {
    return 'Meat & Seafood';
  }
  
  // Dairy & Eggs
  if (/milk|cheese|yogurt|butter|cream|egg|dairy/.test(name)) {
    return 'Dairy & Eggs';
  }
  
  // Grains & Bread
  if (/bread|rice|pasta|noodle|flour|cereal|oat|wheat|grain|tortilla/.test(name)) {
    return 'Grains & Bread';
  }
  
  // Frozen
  if (/frozen/.test(name)) {
    return 'Frozen';
  }
  
  // Pantry (default for most dry goods, spices, etc.)
  if (/oil|vinegar|sauce|spice|salt|pepper|sugar|honey|can|jar|seasoning/.test(name)) {
    return 'Pantry';
  }
  
  return 'Other';
}

// Get Amazon-compatible shopping list
const getAmazonList = async (req, res) => {
  try {
    const { startDate } = req.query;
    
    if (!startDate) {
      return res.status(400).json({ error: 'Start date is required' });
    }
    
    // Get all meals for the week
    const startDateTime = new Date(startDate);
    const allIngredients = {};
    
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(startDateTime);
      currentDate.setDate(startDateTime.getDate() + i);
      const dateStr = currentDate.toISOString().split('T')[0];
      
      const mealPlan = await MealPlan.findByUserAndDate(req.userId, dateStr);
      
      if (mealPlan) {
        processIngredients(mealPlan.breakfast.ingredients, allIngredients);
        processIngredients(mealPlan.lunch.ingredients, allIngredients);
        processIngredients(mealPlan.dinner.ingredients, allIngredients);
      }
    }
    
    // Categorize ingredients
    const categorizedList = categorizeIngredients(allIngredients);
    
    // Format for Amazon Fresh
    const amazonItems = [];
    
    for (const [category, items] of Object.entries(categorizedList)) {
      items.forEach(item => {
        amazonItems.push({
          name: item.name,
          quantity: `${item.amount} ${item.unit}`,
          category: category,
          searchTerm: formatForAmazonSearch(item.name)
        });
      });
    }
    
    res.json({ 
      amazonItems,
      totalItems: amazonItems.length,
      estimatedCost: estimateCost(amazonItems)
    });
  } catch (error) {
    console.error('Get Amazon list error:', error);
    res.status(500).json({ error: 'Error generating Amazon shopping list' });
  }
};

// Helper function to format item names for Amazon search
function formatForAmazonSearch(itemName) {
  // Remove common cooking terms and measurements
  return itemName
    .replace(/fresh|organic|raw|cooked|dried|ground|whole|chopped|diced|sliced/gi, '')
    .trim();
}

// Helper function to estimate cost (very rough estimates)
function estimateCost(items) {
  let total = 0;
  const categoryPrices = {
    'Produce': 2.50,
    'Meat & Seafood': 8.00,
    'Dairy & Eggs': 3.50,
    'Grains & Bread': 3.00,
    'Pantry': 4.00,
    'Frozen': 5.00,
    'Other': 3.00
  };
  
  items.forEach(item => {
    total += categoryPrices[item.category] || 3.00;
  });
  
  return Math.round(total * 100) / 100;
}

module.exports = {
  getWeeklyPlan,
  generateWeekMeals,
  generateDayMeals,
  getWeeklyShoppingList,
  getAmazonList
};