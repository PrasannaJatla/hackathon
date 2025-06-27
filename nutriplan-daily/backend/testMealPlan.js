const MealPlan = require('./models/MealPlan');
const { db } = require('./config/database');

async function testMealPlanGeneration() {
  try {
    console.log('Testing meal plan generation for user ID 2...');
    
    const preferences = {
      dietary_preferences: '',
      allergies: ''
    };
    
    console.log('Calling MealPlan.generateForUser...');
    const mealPlan = await MealPlan.generateForUser(2, preferences);
    
    console.log('Generated meal plan:', JSON.stringify(mealPlan, null, 2));
    
  } catch (error) {
    console.error('Error generating meal plan:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    // Close database connection
    db.close();
  }
}

// Wait for database to be ready
setTimeout(testMealPlanGeneration, 1000);