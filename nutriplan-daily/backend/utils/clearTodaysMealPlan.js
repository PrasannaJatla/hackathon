const { db } = require('../config/database');

const clearTodaysMealPlan = () => {
  const today = new Date().toISOString().split('T')[0];
  
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM user_meal_plans WHERE date = ?', [today], function(err) {
      if (err) {
        console.error('Error clearing meal plans:', err);
        reject(err);
      } else {
        console.log(`Cleared ${this.changes} meal plan(s) for today (${today})`);
        resolve(this.changes);
      }
    });
  });
};

// Run if called directly
if (require.main === module) {
  clearTodaysMealPlan().then(() => {
    console.log('Today\'s meal plans cleared successfully!');
    process.exit(0);
  }).catch(err => {
    console.error('Failed to clear meal plans:', err);
    process.exit(1);
  });
}

module.exports = { clearTodaysMealPlan };