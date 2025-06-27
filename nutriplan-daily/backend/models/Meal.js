const { db } = require('../config/database');

class Meal {
  static findAll() {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM meals', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  static findById(id) {
    return new Promise((resolve, reject) => {
      db.get(`
        SELECT m.*, r.ingredients, r.instructions, r.servings 
        FROM meals m 
        LEFT JOIN recipes r ON m.id = r.meal_id 
        WHERE m.id = ?
      `, [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  static findByType(mealType) {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM meals WHERE meal_type = ?', [mealType], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  static findByDietaryPreferences(preferences) {
    return new Promise((resolve, reject) => {
      const query = preferences.map(pref => `dietary_tags LIKE '%${pref}%'`).join(' OR ');
      db.all(`SELECT * FROM meals WHERE ${query}`, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  static create(mealData) {
    return new Promise((resolve, reject) => {
      const { name, meal_type, calories, protein, carbs, fat, fiber, prep_time, cook_time, difficulty, image_url, dietary_tags } = mealData;
      
      db.run(
        `INSERT INTO meals (name, meal_type, calories, protein, carbs, fat, fiber, prep_time, cook_time, difficulty, image_url, dietary_tags) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [name, meal_type, calories, protein, carbs, fat, fiber, prep_time, cook_time, difficulty, image_url, dietary_tags],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID, ...mealData });
        }
      );
    });
  }
}

module.exports = Meal;