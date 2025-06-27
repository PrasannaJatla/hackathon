const { db } = require('../config/database');

const meals = [
  // Breakfast meals
  {
    name: "Oatmeal with Berries and Nuts",
    meal_type: "breakfast",
    calories: 350,
    protein: 12,
    carbs: 58,
    fat: 10,
    fiber: 8,
    prep_time: 5,
    cook_time: 10,
    difficulty: "Easy",
    dietary_tags: "vegetarian,gluten-free",
    image_url: "https://images.unsplash.com/photo-1559127492-290a4c4dc689?w=800&q=80",
    ingredients: JSON.stringify([
      "1 cup rolled oats",
      "2 cups water",
      "1/2 cup mixed berries",
      "2 tbsp chopped almonds",
      "1 tbsp honey",
      "Pinch of cinnamon"
    ]),
    instructions: JSON.stringify([
      "Bring water to a boil in a saucepan",
      "Add oats and reduce heat to medium-low",
      "Simmer for 5-7 minutes, stirring occasionally",
      "Top with berries, almonds, and honey",
      "Sprinkle with cinnamon before serving"
    ]),
    servings: 1
  },
  {
    name: "Veggie Scrambled Eggs",
    meal_type: "breakfast",
    calories: 320,
    protein: 24,
    carbs: 12,
    fat: 20,
    fiber: 3,
    prep_time: 10,
    cook_time: 10,
    difficulty: "Easy",
    dietary_tags: "vegetarian,gluten-free,low-carb",
    image_url: "https://images.unsplash.com/photo-1536816579748-4ecb3f03d72a?w=800&q=80",
    ingredients: JSON.stringify([
      "3 large eggs",
      "1/4 cup bell peppers, diced",
      "1/4 cup onions, diced",
      "1/4 cup mushrooms, sliced",
      "1 tbsp olive oil",
      "Salt and pepper to taste"
    ]),
    instructions: JSON.stringify([
      "Heat olive oil in a non-stick pan",
      "Sauté vegetables until softened",
      "Beat eggs in a bowl and pour into pan",
      "Scramble eggs with vegetables until cooked",
      "Season with salt and pepper"
    ]),
    servings: 1
  },
  {
    name: "Greek Yogurt Parfait",
    meal_type: "breakfast",
    calories: 280,
    protein: 20,
    carbs: 35,
    fat: 8,
    fiber: 4,
    prep_time: 5,
    cook_time: 0,
    difficulty: "Easy",
    dietary_tags: "vegetarian,gluten-free",
    image_url: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800&q=80",
    ingredients: JSON.stringify([
      "1 cup Greek yogurt",
      "1/4 cup granola",
      "1/2 cup mixed berries",
      "1 tbsp honey",
      "1 tbsp chia seeds"
    ]),
    instructions: JSON.stringify([
      "Layer half the yogurt in a glass",
      "Add half the berries and granola",
      "Repeat layers with remaining ingredients",
      "Drizzle with honey",
      "Top with chia seeds"
    ]),
    servings: 1
  },
  
  // Lunch meals
  {
    name: "Grilled Chicken Salad",
    meal_type: "lunch",
    calories: 420,
    protein: 35,
    carbs: 25,
    fat: 18,
    fiber: 7,
    prep_time: 15,
    cook_time: 15,
    difficulty: "Easy",
    dietary_tags: "gluten-free,dairy-free",
    image_url: "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=800&q=80",
    ingredients: JSON.stringify([
      "6 oz grilled chicken breast",
      "2 cups mixed greens",
      "1/2 cup cherry tomatoes",
      "1/4 cup cucumber, sliced",
      "1/4 avocado, sliced",
      "2 tbsp balsamic vinaigrette"
    ]),
    instructions: JSON.stringify([
      "Season chicken with salt and pepper",
      "Grill chicken for 6-7 minutes per side",
      "Let chicken rest, then slice",
      "Combine greens, tomatoes, and cucumber",
      "Top with chicken and avocado",
      "Drizzle with vinaigrette"
    ]),
    servings: 1
  },
  {
    name: "Quinoa Buddha Bowl",
    meal_type: "lunch",
    calories: 450,
    protein: 18,
    carbs: 55,
    fat: 20,
    fiber: 10,
    prep_time: 20,
    cook_time: 20,
    difficulty: "Medium",
    dietary_tags: "vegetarian,vegan,gluten-free",
    image_url: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80",
    ingredients: JSON.stringify([
      "1 cup cooked quinoa",
      "1/2 cup roasted chickpeas",
      "1/2 cup roasted sweet potato",
      "1/4 cup shredded carrots",
      "2 tbsp tahini dressing",
      "1 tbsp pumpkin seeds"
    ]),
    instructions: JSON.stringify([
      "Cook quinoa according to package directions",
      "Roast chickpeas at 400°F for 20 minutes",
      "Roast sweet potato cubes for 25 minutes",
      "Arrange quinoa in a bowl",
      "Top with roasted vegetables and carrots",
      "Drizzle with tahini and sprinkle seeds"
    ]),
    servings: 1
  },
  {
    name: "Turkey and Avocado Wrap",
    meal_type: "lunch",
    calories: 380,
    protein: 28,
    carbs: 35,
    fat: 16,
    fiber: 8,
    prep_time: 10,
    cook_time: 0,
    difficulty: "Easy",
    dietary_tags: "dairy-free",
    image_url: "https://images.unsplash.com/photo-1486887396153-fa416526c108?w=800&q=80",
    ingredients: JSON.stringify([
      "1 whole wheat tortilla",
      "4 oz sliced turkey breast",
      "1/2 avocado, mashed",
      "Lettuce leaves",
      "2 slices tomato",
      "1 tbsp mustard"
    ]),
    instructions: JSON.stringify([
      "Spread mashed avocado on tortilla",
      "Layer turkey, lettuce, and tomato",
      "Add mustard to taste",
      "Roll tightly, tucking in sides",
      "Cut in half diagonally"
    ]),
    servings: 1
  },
  
  // Dinner meals
  {
    name: "Baked Salmon with Vegetables",
    meal_type: "dinner",
    calories: 480,
    protein: 35,
    carbs: 30,
    fat: 22,
    fiber: 6,
    prep_time: 15,
    cook_time: 25,
    difficulty: "Medium",
    dietary_tags: "gluten-free,dairy-free",
    image_url: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&q=80",
    ingredients: JSON.stringify([
      "6 oz salmon fillet",
      "1 cup broccoli florets",
      "1 cup baby carrots",
      "2 tbsp olive oil",
      "1 lemon, sliced",
      "Herbs and spices"
    ]),
    instructions: JSON.stringify([
      "Preheat oven to 400°F",
      "Place salmon and vegetables on baking sheet",
      "Drizzle with olive oil and season",
      "Top salmon with lemon slices",
      "Bake for 20-25 minutes",
      "Serve immediately"
    ]),
    servings: 1
  },
  {
    name: "Vegetarian Stir-Fry",
    meal_type: "dinner",
    calories: 420,
    protein: 16,
    carbs: 58,
    fat: 15,
    fiber: 8,
    prep_time: 20,
    cook_time: 15,
    difficulty: "Easy",
    dietary_tags: "vegetarian,vegan,dairy-free",
    image_url: "https://images.unsplash.com/photo-1609501676725-7186f017a4b7?w=800&q=80",
    ingredients: JSON.stringify([
      "1 cup brown rice, cooked",
      "1 cup mixed vegetables",
      "1/2 cup tofu, cubed",
      "2 tbsp soy sauce",
      "1 tbsp sesame oil",
      "1 tsp ginger, minced"
    ]),
    instructions: JSON.stringify([
      "Heat sesame oil in a wok or large pan",
      "Add ginger and stir for 30 seconds",
      "Add tofu and cook until golden",
      "Add vegetables and stir-fry for 5 minutes",
      "Add soy sauce and toss",
      "Serve over brown rice"
    ]),
    servings: 1
  },
  {
    name: "Chicken and Sweet Potato Curry",
    meal_type: "dinner",
    calories: 520,
    protein: 32,
    carbs: 48,
    fat: 20,
    fiber: 7,
    prep_time: 20,
    cook_time: 30,
    difficulty: "Medium",
    dietary_tags: "gluten-free,dairy-free",
    image_url: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800&q=80",
    ingredients: JSON.stringify([
      "6 oz chicken breast, cubed",
      "1 cup sweet potato, cubed",
      "1/2 cup coconut milk",
      "2 tbsp curry paste",
      "1/2 cup spinach",
      "1/2 cup jasmine rice, cooked"
    ]),
    instructions: JSON.stringify([
      "Cook rice according to package directions",
      "Sauté chicken until browned",
      "Add curry paste and cook for 1 minute",
      "Add sweet potato and coconut milk",
      "Simmer for 20 minutes until tender",
      "Stir in spinach and serve over rice"
    ]),
    servings: 1
  }
];

const seedDatabase = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      const stmt = db.prepare(`INSERT INTO meals (name, meal_type, calories, protein, carbs, fat, fiber, prep_time, cook_time, difficulty, dietary_tags, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
      
      meals.forEach(meal => {
        stmt.run(
          meal.name,
          meal.meal_type,
          meal.calories,
          meal.protein,
          meal.carbs,
          meal.fat,
          meal.fiber,
          meal.prep_time,
          meal.cook_time,
          meal.difficulty,
          meal.dietary_tags,
          meal.image_url,
          function(err) {
            if (!err) {
              const mealId = this.lastID;
              db.run(
                `INSERT INTO recipes (meal_id, ingredients, instructions, servings) VALUES (?, ?, ?, ?)`,
                [mealId, meal.ingredients, meal.instructions, meal.servings]
              );
            }
          }
        );
      });
      
      stmt.finalize((err) => {
        if (err) reject(err);
        else {
          console.log('Database seeded successfully!');
          resolve();
        }
      });
    });
  });
};

// Run seeder if called directly
if (require.main === module) {
  const { initializeDatabase } = require('../config/database');
  initializeDatabase().then(() => {
    seedDatabase().then(() => {
      console.log('Seeding complete!');
      process.exit(0);
    }).catch(err => {
      console.error('Seeding failed:', err);
      process.exit(1);
    });
  });
}

module.exports = { seedDatabase };