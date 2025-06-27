const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, '../../database.sqlite'), (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite database');
  }
});

// Initialize database tables
db.serialize(() => {
  // Users table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    age INTEGER,
    gender TEXT,
    height REAL,
    weight REAL,
    activity_level TEXT,
    dietary_preferences TEXT,
    allergies TEXT,
    caloric_goal TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Meals table
  db.run(`CREATE TABLE IF NOT EXISTS meals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    meal_type TEXT NOT NULL,
    calories INTEGER,
    protein REAL,
    carbs REAL,
    fat REAL,
    fiber REAL,
    prep_time INTEGER,
    cook_time INTEGER,
    difficulty TEXT,
    image_url TEXT,
    dietary_tags TEXT,
    spoonacular_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Recipes table
  db.run(`CREATE TABLE IF NOT EXISTS recipes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    meal_id INTEGER,
    ingredients TEXT,
    instructions TEXT,
    servings INTEGER DEFAULT 1,
    FOREIGN KEY (meal_id) REFERENCES meals (id)
  )`);

  // User meal plans table
  db.run(`CREATE TABLE IF NOT EXISTS user_meal_plans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    date DATE,
    breakfast_id INTEGER,
    lunch_id INTEGER,
    dinner_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id),
    FOREIGN KEY (breakfast_id) REFERENCES meals (id),
    FOREIGN KEY (lunch_id) REFERENCES meals (id),
    FOREIGN KEY (dinner_id) REFERENCES meals (id)
  )`);

  // Insert sample meals if the table is empty
  db.get("SELECT COUNT(*) as count FROM meals", (err, row) => {
    if (!err && row.count === 0) {
      console.log('Inserting sample meals...');
      
      const sampleMeals = [
        // Breakfast meals
        {
          name: 'Greek Yogurt Parfait',
          meal_type: 'breakfast',
          calories: 350,
          protein: 20,
          carbs: 45,
          fat: 10,
          fiber: 5,
          prep_time: 10,
          cook_time: 0,
          difficulty: 'Easy',
          image_url: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=500',
          dietary_tags: 'vegetarian,gluten-free'
        },
        {
          name: 'Avocado Toast with Poached Egg',
          meal_type: 'breakfast',
          calories: 420,
          protein: 18,
          carbs: 35,
          fat: 25,
          fiber: 8,
          prep_time: 15,
          cook_time: 5,
          difficulty: 'Easy',
          image_url: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=500',
          dietary_tags: 'vegetarian'
        },
        {
          name: 'Protein Smoothie Bowl',
          meal_type: 'breakfast',
          calories: 380,
          protein: 25,
          carbs: 50,
          fat: 8,
          fiber: 7,
          prep_time: 10,
          cook_time: 0,
          difficulty: 'Easy',
          image_url: 'https://images.unsplash.com/photo-1490323814310-bc5b27ff12ff?w=500',
          dietary_tags: 'vegetarian,gluten-free'
        },
        // Lunch meals
        {
          name: 'Grilled Chicken Caesar Salad',
          meal_type: 'lunch',
          calories: 480,
          protein: 35,
          carbs: 20,
          fat: 28,
          fiber: 5,
          prep_time: 20,
          cook_time: 15,
          difficulty: 'Medium',
          image_url: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=500',
          dietary_tags: ''
        },
        {
          name: 'Quinoa Buddha Bowl',
          meal_type: 'lunch',
          calories: 520,
          protein: 18,
          carbs: 65,
          fat: 20,
          fiber: 12,
          prep_time: 25,
          cook_time: 20,
          difficulty: 'Medium',
          image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500',
          dietary_tags: 'vegetarian,vegan,gluten-free'
        },
        {
          name: 'Turkey Club Sandwich',
          meal_type: 'lunch',
          calories: 540,
          protein: 30,
          carbs: 45,
          fat: 24,
          fiber: 4,
          prep_time: 15,
          cook_time: 0,
          difficulty: 'Easy',
          image_url: 'https://images.unsplash.com/photo-1526234362653-3b24e1a1c043?w=500',
          dietary_tags: ''
        },
        // Dinner meals
        {
          name: 'Grilled Salmon with Asparagus',
          meal_type: 'dinner',
          calories: 580,
          protein: 42,
          carbs: 25,
          fat: 32,
          fiber: 6,
          prep_time: 20,
          cook_time: 25,
          difficulty: 'Medium',
          image_url: 'https://images.unsplash.com/photo-1485921325833-c519f76c4927?w=500',
          dietary_tags: 'gluten-free'
        },
        {
          name: 'Vegetable Stir Fry with Tofu',
          meal_type: 'dinner',
          calories: 450,
          protein: 20,
          carbs: 55,
          fat: 18,
          fiber: 8,
          prep_time: 25,
          cook_time: 20,
          difficulty: 'Medium',
          image_url: 'https://images.unsplash.com/photo-1584270354949-c26b0d5b4a0c?w=500',
          dietary_tags: 'vegetarian,vegan'
        },
        {
          name: 'Spaghetti Bolognese',
          meal_type: 'dinner',
          calories: 650,
          protein: 28,
          carbs: 75,
          fat: 22,
          fiber: 5,
          prep_time: 20,
          cook_time: 45,
          difficulty: 'Medium',
          image_url: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=500',
          dietary_tags: ''
        }
      ];

      const stmt = db.prepare(`INSERT INTO meals (name, meal_type, calories, protein, carbs, fat, fiber, prep_time, cook_time, difficulty, image_url, dietary_tags) 
                               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
      
      sampleMeals.forEach(meal => {
        stmt.run(meal.name, meal.meal_type, meal.calories, meal.protein, meal.carbs, meal.fat, meal.fiber, 
                 meal.prep_time, meal.cook_time, meal.difficulty, meal.image_url, meal.dietary_tags);
      });
      
      stmt.finalize();

      // Add sample recipes for each meal
      const recipes = [
        { meal_id: 1, ingredients: '["1 cup Greek yogurt", "1/2 cup granola", "1 cup mixed berries", "2 tbsp honey", "1/4 cup chopped nuts"]', instructions: '["Layer yogurt in a glass or bowl", "Add a layer of granola", "Top with mixed berries", "Drizzle with honey", "Sprinkle with chopped nuts"]' },
        { meal_id: 2, ingredients: '["2 slices whole grain bread", "1 ripe avocado", "2 eggs", "Salt and pepper to taste", "Red pepper flakes", "Lemon juice"]', instructions: '["Toast the bread until golden", "Mash avocado with lemon juice, salt, and pepper", "Poach eggs in simmering water", "Spread avocado on toast", "Top with poached eggs", "Season with red pepper flakes"]' },
        { meal_id: 3, ingredients: '["1 cup mixed berries", "1 banana", "1 scoop protein powder", "1/2 cup almond milk", "Toppings: granola, coconut, chia seeds"]', instructions: '["Blend berries, banana, protein powder, and almond milk", "Pour into a bowl", "Arrange toppings decoratively", "Serve immediately"]' },
        { meal_id: 4, ingredients: '["6 oz grilled chicken breast", "2 cups romaine lettuce", "1/4 cup Caesar dressing", "2 tbsp parmesan cheese", "Croutons", "Lemon wedge"]', instructions: '["Grill chicken breast until cooked through", "Chop romaine lettuce", "Slice grilled chicken", "Toss lettuce with dressing", "Top with chicken, parmesan, and croutons", "Serve with lemon wedge"]' },
        { meal_id: 5, ingredients: '["1 cup cooked quinoa", "1/2 cup chickpeas", "1 cup mixed vegetables", "1/4 avocado", "2 tbsp tahini dressing", "Hemp seeds"]', instructions: '["Cook quinoa according to package directions", "Roast mixed vegetables", "Warm chickpeas", "Arrange all ingredients in a bowl", "Drizzle with tahini dressing", "Sprinkle with hemp seeds"]' },
        { meal_id: 6, ingredients: '["3 slices bread", "4 oz sliced turkey", "2 strips bacon", "Lettuce and tomato", "Mayo", "Cheese slice"]', instructions: '["Toast bread slices", "Cook bacon until crispy", "Spread mayo on toast", "Layer turkey, bacon, lettuce, tomato, and cheese", "Stack layers with toast", "Cut diagonally and secure with picks"]' },
        { meal_id: 7, ingredients: '["6 oz salmon fillet", "1 bunch asparagus", "2 tbsp olive oil", "Lemon", "Garlic", "Salt and pepper"]', instructions: '["Preheat oven to 400°F", "Season salmon with salt, pepper, and garlic", "Toss asparagus with olive oil", "Place both on baking sheet", "Bake for 20-25 minutes", "Serve with lemon wedges"]' },
        { meal_id: 8, ingredients: '["8 oz firm tofu", "2 cups mixed vegetables", "2 tbsp soy sauce", "1 tbsp sesame oil", "Ginger and garlic", "Rice for serving"]', instructions: '["Press and cube tofu", "Heat oil in wok", "Stir fry tofu until golden", "Add vegetables and stir fry", "Add soy sauce and seasonings", "Serve over rice"]' },
        { meal_id: 9, ingredients: '["12 oz spaghetti", "1 lb ground beef", "1 can tomato sauce", "Onion and garlic", "Italian herbs", "Parmesan cheese"]', instructions: '["Cook spaghetti according to package", "Brown ground beef", "Sauté onion and garlic", "Add tomato sauce and herbs", "Simmer for 30 minutes", "Serve over pasta with parmesan"]' }
      ];

      const recipeStmt = db.prepare("INSERT INTO recipes (meal_id, ingredients, instructions) VALUES (?, ?, ?)");
      recipes.forEach(recipe => {
        recipeStmt.run(recipe.meal_id, recipe.ingredients, recipe.instructions);
      });
      recipeStmt.finalize();
      
      console.log('Sample meals inserted successfully');
    }
  });
});

module.exports = { db };