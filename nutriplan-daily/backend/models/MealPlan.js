const { db } = require('../config/database');
const SpoonacularService = require('../services/spoonacularService');
const Meal = require('./Meal');

class MealPlan {
  static generateForUser(userId, preferences = {}, forceNew = false) {
    return new Promise(async (resolve, reject) => {
      try {
        const today = new Date().toISOString().split('T')[0];
        
        // Only return existing plan if not forcing new generation
        if (!forceNew) {
          const existingPlan = await this.findByUserAndDate(userId, today);
          if (existingPlan) {
            return resolve(existingPlan);
          }
        }

        // Try to get meals from API first, fallback to database
        let breakfastMeal, lunchMeal, dinnerMeal;

        if (process.env.SPOONACULAR_API_KEY && process.env.SPOONACULAR_API_KEY !== 'your-spoonacular-api-key-here') {
          // Use Spoonacular API
          const { diet, intolerances } = SpoonacularService.mapDietaryPreferences(preferences.dietary_preferences, preferences.allergies);
          
          console.log('Dietary preferences:', preferences.dietary_preferences);
          console.log('Allergies:', preferences.allergies);
          console.log('Mapped diet:', diet);
          console.log('Mapped intolerances:', intolerances);
          
          // Clear cache on force new to get fresh recipes
          if (forceNew) {
            SpoonacularService.clearCache();
          }
          
          const [breakfastRecipes, lunchRecipes, dinnerRecipes] = await Promise.all([
            SpoonacularService.getRandomRecipes('breakfast', diet, intolerances, 10, forceNew),
            SpoonacularService.getRandomRecipes('main course,salad', diet, intolerances, 10, forceNew),
            SpoonacularService.getRandomRecipes('main course', diet, intolerances, 10, forceNew)
          ]);

          // Log API responses
          console.log('Breakfast recipes from API:', breakfastRecipes.length);
          console.log('Lunch recipes from API:', lunchRecipes.length);
          console.log('Dinner recipes from API:', dinnerRecipes.length);
          
          // Randomly select from available recipes
          if (breakfastRecipes.length > 0) {
            const randomIndex = Math.floor(Math.random() * breakfastRecipes.length);
            breakfastMeal = await this.saveAndGetMeal(breakfastRecipes[randomIndex], 'breakfast');
          }
          if (lunchRecipes.length > 0) {
            const randomIndex = Math.floor(Math.random() * lunchRecipes.length);
            lunchMeal = await this.saveAndGetMeal(lunchRecipes[randomIndex], 'lunch');
          }
          if (dinnerRecipes.length > 0) {
            const randomIndex = Math.floor(Math.random() * dinnerRecipes.length);
            dinnerMeal = await this.saveAndGetMeal(dinnerRecipes[randomIndex], 'dinner');
          }
        } else {
          // Fallback to database
          breakfastMeal = await this.getRandomMealByType('breakfast', preferences);
          lunchMeal = await this.getRandomMealByType('lunch', preferences);
          dinnerMeal = await this.getRandomMealByType('dinner', preferences);
        }

        if (!breakfastMeal || !lunchMeal || !dinnerMeal) {
          return reject(new Error('Not enough meals available'));
        }

        db.run(
          `INSERT INTO user_meal_plans (user_id, date, breakfast_id, lunch_id, dinner_id) VALUES (?, ?, ?, ?, ?)`,
          [userId, today, breakfastMeal.id, lunchMeal.id, dinnerMeal.id],
          function(err) {
            if (err) reject(err);
            else {
              resolve({
                id: this.lastID,
                user_id: userId,
                date: today,
                breakfast: breakfastMeal,
                lunch: lunchMeal,
                dinner: dinnerMeal
              });
            }
          }
        );
      } catch (error) {
        reject(error);
      }
    });
  }

  static async saveAndGetMeal(recipeData, mealType) {
    if (!recipeData) return null;

    return new Promise((resolve, reject) => {
      // Check if meal already exists
      db.get('SELECT * FROM meals WHERE name = ?', [recipeData.name], async (err, existingMeal) => {
        if (err) return reject(err);
        
        if (existingMeal) {
          return resolve(existingMeal);
        }

        // Set the correct meal type
        recipeData.meal_type = mealType;

        // Insert new meal
        const mealFields = ['name', 'meal_type', 'calories', 'protein', 'carbs', 'fat', 'fiber', 'prep_time', 'cook_time', 'difficulty', 'image_url', 'dietary_tags', 'spoonacular_id'];
        const values = mealFields.map(field => recipeData[field]);
        const placeholders = mealFields.map(() => '?').join(', ');

        db.run(
          `INSERT INTO meals (${mealFields.join(', ')}) VALUES (${placeholders})`,
          values,
          function(err) {
            if (err) return reject(err);
            
            const mealId = this.lastID;
            
            // Insert recipe details
            db.run(
              'INSERT INTO recipes (meal_id, ingredients, instructions, servings) VALUES (?, ?, ?, ?)',
              [mealId, recipeData.ingredients, recipeData.instructions, recipeData.servings],
              (err) => {
                if (err) return reject(err);
                
                // Return the complete meal object
                resolve({
                  id: mealId,
                  ...recipeData
                });
              }
            );
          }
        );
      });
    });
  }

  static getRandomMealByType(mealType, preferences, userId = null) {
    return new Promise((resolve, reject) => {
      let query = 'SELECT * FROM meals WHERE meal_type = ?';
      const params = [mealType];

      // Exclude current meals if userId provided
      if (userId) {
        query += ` AND id NOT IN (
          SELECT breakfast_id FROM user_meal_plans WHERE user_id = ? AND date = date('now')
          UNION SELECT lunch_id FROM user_meal_plans WHERE user_id = ? AND date = date('now')
          UNION SELECT dinner_id FROM user_meal_plans WHERE user_id = ? AND date = date('now')
        )`;
        params.push(userId, userId, userId);
      }

      // Apply dietary preferences
      if (preferences && preferences.dietary_preferences) {
        const prefs = preferences.dietary_preferences.split(',').map(p => p.trim());
        
        // For specific diets, include matching dietary tags
        const includeTags = prefs.filter(pref => pref !== 'anything');
        if (includeTags.length > 0) {
          const dietQuery = includeTags.map(() => 'dietary_tags LIKE ?').join(' OR ');
          query += ` AND (${dietQuery})`;
          includeTags.forEach(pref => params.push(`%${pref}%`));
        }
      }

      // Exclude meals with allergens
      if (preferences && preferences.allergies) {
        const allergies = preferences.allergies.split(',').map(a => a.trim().toLowerCase());
        
        // For each allergy, exclude meals that might contain it
        // This is a simple text search in ingredients
        allergies.forEach(allergy => {
          query += ` AND id NOT IN (
            SELECT meal_id FROM recipes 
            WHERE LOWER(ingredients) LIKE ?
          )`;
          params.push(`%${allergy}%`);
        });
      }

      query += ' ORDER BY RANDOM() LIMIT 1';

      db.get(query, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  static findByUserAndDate(userId, date) {
    return new Promise((resolve, reject) => {
      db.get(`
        SELECT 
          p.*,
          b.id as breakfast_id, b.name as breakfast_name, b.calories as breakfast_calories, 
          b.protein as breakfast_protein, b.carbs as breakfast_carbs, b.fat as breakfast_fat, 
          b.image_url as breakfast_image_url, b.dietary_tags as breakfast_dietary_tags,
          l.id as lunch_id, l.name as lunch_name, l.calories as lunch_calories,
          l.protein as lunch_protein, l.carbs as lunch_carbs, l.fat as lunch_fat, 
          l.image_url as lunch_image_url, l.dietary_tags as lunch_dietary_tags,
          d.id as dinner_id, d.name as dinner_name, d.calories as dinner_calories,
          d.protein as dinner_protein, d.carbs as dinner_carbs, d.fat as dinner_fat, 
          d.image_url as dinner_image_url, d.dietary_tags as dinner_dietary_tags
        FROM user_meal_plans p
        JOIN meals b ON p.breakfast_id = b.id
        JOIN meals l ON p.lunch_id = l.id
        JOIN meals d ON p.dinner_id = d.id
        WHERE p.user_id = ? AND p.date = ?
      `, [userId, date], (err, row) => {
        if (err) reject(err);
        else if (row) {
          resolve({
            id: row.id,
            user_id: row.user_id,
            date: row.date,
            breakfast: {
              id: row.breakfast_id,
              name: row.breakfast_name,
              calories: row.breakfast_calories,
              protein: row.breakfast_protein,
              carbs: row.breakfast_carbs,
              fat: row.breakfast_fat,
              image_url: row.breakfast_image_url,
              dietary_tags: row.breakfast_dietary_tags
            },
            lunch: {
              id: row.lunch_id,
              name: row.lunch_name,
              calories: row.lunch_calories,
              protein: row.lunch_protein,
              carbs: row.lunch_carbs,
              fat: row.lunch_fat,
              image_url: row.lunch_image_url,
              dietary_tags: row.lunch_dietary_tags
            },
            dinner: {
              id: row.dinner_id,
              name: row.dinner_name,
              calories: row.dinner_calories,
              protein: row.dinner_protein,
              carbs: row.dinner_carbs,
              fat: row.dinner_fat,
              image_url: row.dinner_image_url,
              dietary_tags: row.dinner_dietary_tags
            }
          });
        } else {
          resolve(null);
        }
      });
    });
  }

  static deleteByUserAndDate(userId, date) {
    return new Promise((resolve, reject) => {
      db.run(
        'DELETE FROM user_meal_plans WHERE user_id = ? AND date = ?',
        [userId, date],
        function(err) {
          if (err) reject(err);
          else resolve({ deletedRows: this.changes });
        }
      );
    });
  }

  static getPreviousMealIds(userId, date) {
    return new Promise((resolve, reject) => {
      // Get meals from recent meal plans to avoid repetition
      db.all(`
        SELECT DISTINCT m.spoonacular_id 
        FROM user_meal_plans p
        JOIN meals m ON m.id IN (p.breakfast_id, p.lunch_id, p.dinner_id)
        WHERE p.user_id = ? 
        AND p.date >= date(?, '-3 days')
        AND m.spoonacular_id IS NOT NULL
      `, [userId, date], (err, rows) => {
        if (err) reject(err);
        else resolve(rows.map(row => row.spoonacular_id));
      });
    });
  }

  static async getReplacementMeal(mealType, preferences, userId) {
    try {
      // Try to get from API first
      if (process.env.SPOONACULAR_API_KEY && process.env.SPOONACULAR_API_KEY !== 'your-spoonacular-api-key-here') {
        const { diet, intolerances } = SpoonacularService.mapDietaryPreferences(preferences.dietary_preferences, preferences.allergies);
        
        let recipeType = mealType === 'breakfast' ? 'breakfast' : 'main course';
        if (mealType === 'lunch') {
          recipeType = 'main course,salad';
        }
        
        const recipes = await SpoonacularService.getRandomRecipes(recipeType, diet, intolerances, 10, true);
        
        if (recipes.length > 0) {
          // Get current meal IDs to avoid duplicates
          const today = new Date().toISOString().split('T')[0];
          const currentPlan = await this.findByUserAndDate(userId, today);
          const currentMealIds = [];
          
          if (currentPlan) {
            currentMealIds.push(currentPlan.breakfast.id, currentPlan.lunch.id, currentPlan.dinner.id);
          }
          
          // Find a recipe that's not already in today's plan
          const availableRecipes = recipes.filter(recipe => {
            return !currentMealIds.includes(recipe.spoonacular_id);
          });
          
          if (availableRecipes.length > 0) {
            const randomIndex = Math.floor(Math.random() * availableRecipes.length);
            return await this.saveAndGetMeal(availableRecipes[randomIndex], mealType);
          }
        }
      }
      
      // Fallback to database
      return await this.getRandomMealByType(mealType, preferences, userId);
    } catch (error) {
      console.error('Error getting replacement meal:', error);
      // Final fallback to database
      return await this.getRandomMealByType(mealType, preferences, userId);
    }
  }


  static updateSingleMeal(userId, date, mealType, newMealId) {
    return new Promise((resolve, reject) => {
      const column = `${mealType}_id`;
      db.run(
        `UPDATE user_meal_plans SET ${column} = ? WHERE user_id = ? AND date = ?`,
        [newMealId, userId, date],
        function(err) {
          if (err) reject(err);
          else resolve({ updated: this.changes > 0 });
        }
      );
    });
  }
}

module.exports = MealPlan;