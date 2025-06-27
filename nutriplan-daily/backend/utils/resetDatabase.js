const { db, initializeDatabase } = require('../config/database');
const { seedDatabase } = require('./seedData');

const resetDatabase = () => {
  return new Promise((resolve, reject) => {
    console.log('Clearing existing data...');
    
    db.serialize(() => {
      // Delete all existing data
      db.run('DELETE FROM recipes', (err) => {
        if (err) console.error('Error clearing recipes:', err);
      });
      
      db.run('DELETE FROM user_meal_plans', (err) => {
        if (err) console.error('Error clearing meal plans:', err);
      });
      
      db.run('DELETE FROM meals', (err) => {
        if (err) console.error('Error clearing meals:', err);
        else {
          console.log('Database cleared successfully!');
          resolve();
        }
      });
    });
  });
};

// Run reset and reseed
if (require.main === module) {
  initializeDatabase().then(() => {
    resetDatabase().then(() => {
      console.log('Reseeding database...');
      seedDatabase().then(() => {
        console.log('Database reset and reseeded successfully!');
        process.exit(0);
      }).catch(err => {
        console.error('Seeding failed:', err);
        process.exit(1);
      });
    }).catch(err => {
      console.error('Reset failed:', err);
      process.exit(1);
    });
  });
}

module.exports = { resetDatabase };