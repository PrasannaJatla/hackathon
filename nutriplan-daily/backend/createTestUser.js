const bcrypt = require('bcryptjs');
const { db } = require('./config/database');

async function createTestUser() {
  try {
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    db.run(
      `INSERT INTO users (name, email, password, age, gender, height, weight, activity_level, dietary_preferences, caloric_goal) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        'Test User',
        'test@example.com',
        hashedPassword,
        25,
        'male',
        175,
        70,
        'moderate',
        '',
        'maintain'
      ],
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint failed')) {
            console.log('Test user already exists');
          } else {
            console.error('Error creating test user:', err);
          }
        } else {
          console.log('Test user created successfully!');
          console.log('Email: test@example.com');
          console.log('Password: password123');
        }
        process.exit();
      }
    );
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Wait a bit for database to be ready
setTimeout(createTestUser, 1000);