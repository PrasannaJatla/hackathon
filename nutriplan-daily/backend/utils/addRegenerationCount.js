const { db } = require('../config/database');

// Add regeneration_count column to users table
db.run(`ALTER TABLE users ADD COLUMN regeneration_count INTEGER DEFAULT 0`, (err) => {
  if (err) {
    if (err.message.includes('duplicate column name')) {
      console.log('regeneration_count column already exists');
    } else {
      console.error('Error adding regeneration_count column:', err);
    }
  } else {
    console.log('Successfully added regeneration_count column to users table');
  }
  
  // Close the database connection
  db.close();
});