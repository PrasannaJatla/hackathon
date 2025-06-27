const { db } = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  static create(userData) {
    return new Promise(async (resolve, reject) => {
      try {
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        const { email, name, age, gender, height, weight, activity_level, dietary_preferences, allergies, caloric_goal } = userData;
        
        db.run(
          `INSERT INTO users (email, password, name, age, gender, height, weight, activity_level, dietary_preferences, allergies, caloric_goal) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [email, hashedPassword, name, age, gender, height, weight, activity_level, dietary_preferences, allergies, caloric_goal],
          function(err) {
            if (err) reject(err);
            else resolve({ id: this.lastID, email, name });
          }
        );
      } catch (error) {
        reject(error);
      }
    });
  }

  static findByEmail(email) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  static findById(id) {
    return new Promise((resolve, reject) => {
      db.get('SELECT id, email, name, age, gender, height, weight, activity_level, dietary_preferences, allergies, caloric_goal, regeneration_count FROM users WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }
  
  static incrementRegenerationCount(id) {
    return new Promise((resolve, reject) => {
      db.run('UPDATE users SET regeneration_count = regeneration_count + 1 WHERE id = ?', [id], function(err) {
        if (err) reject(err);
        else resolve(this.changes);
      });
    });
  }
  
  static getRegenerationCount(id) {
    return new Promise((resolve, reject) => {
      db.get('SELECT regeneration_count FROM users WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row ? row.regeneration_count : 0);
      });
    });
  }

  static update(id, userData) {
    return new Promise((resolve, reject) => {
      const fields = [];
      const values = [];
      
      Object.keys(userData).forEach(key => {
        if (key !== 'password' && userData[key] !== undefined) {
          fields.push(`${key} = ?`);
          values.push(userData[key]);
        }
      });
      
      values.push(id);
      
      db.run(
        `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
        values,
        function(err) {
          if (err) reject(err);
          else resolve({ id, ...userData });
        }
      );
    });
  }

  static async verifyPassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}

module.exports = User;