const { db } = require('../config/database');

class Favorite {
  static async add(userId, mealId) {
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT OR IGNORE INTO favorites (user_id, meal_id) VALUES (?, ?)',
        [userId, mealId],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID, userId, mealId });
        }
      );
    });
  }

  static async remove(userId, mealId) {
    return new Promise((resolve, reject) => {
      db.run(
        'DELETE FROM favorites WHERE user_id = ? AND meal_id = ?',
        [userId, mealId],
        function(err) {
          if (err) reject(err);
          else resolve(this.changes);
        }
      );
    });
  }

  static async getUserFavorites(userId) {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT m.*, f.created_at as favorited_at
         FROM favorites f
         JOIN meals m ON f.meal_id = m.id
         WHERE f.user_id = ?
         ORDER BY f.created_at DESC`,
        [userId],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  }

  static async isFavorite(userId, mealId) {
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT 1 FROM favorites WHERE user_id = ? AND meal_id = ?',
        [userId, mealId],
        (err, row) => {
          if (err) reject(err);
          else resolve(!!row);
        }
      );
    });
  }

  static async getUserFavoriteMealIds(userId) {
    return new Promise((resolve, reject) => {
      db.all(
        'SELECT meal_id FROM favorites WHERE user_id = ?',
        [userId],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows.map(row => row.meal_id));
        }
      );
    });
  }
}

module.exports = Favorite;