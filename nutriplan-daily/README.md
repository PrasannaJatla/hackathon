# NutriPlan Daily - Daily Meal Planner

A simple MVP meal planning application that suggests 3 nutritionally balanced meals per day based on user preferences.

## Features

- User authentication (signup/login)
- User profile with dietary preferences
- Daily meal plan generation (breakfast, lunch, dinner)
- Nutritional information display with interactive pie charts
- Detailed recipes with ingredients and instructions
- Integration with Spoonacular API for real recipe data
- Caching system to optimize API usage
- Clean, responsive UI with meal images

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: SQLite3
- **Authentication**: JWT
- **Frontend**: Vanilla JavaScript, HTML5, CSS3, Chart.js
- **External API**: Spoonacular API (optional)

## Installation

1. Clone the repository
2. Navigate to the project directory:
   ```bash
   cd nutriplan-daily
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Seed the database with sample meals:
   ```bash
   node backend/utils/seedData.js
   ```

5. Start the server:
   ```bash
   npm start
   ```

6. Open your browser and navigate to `http://localhost:3000`

## Usage

1. **Sign Up**: Create a new account with email and password
2. **Profile Setup**: Complete your profile with personal details and dietary preferences
3. **View Meal Plan**: See your daily meal plan with nutritional information
4. **View Recipes**: Click on any meal to see detailed recipe and instructions

## Project Structure

```
nutriplan-daily/
├── backend/
│   ├── config/         # Database configuration
│   ├── controllers/    # Route controllers
│   ├── models/         # Data models
│   ├── routes/         # API routes
│   ├── middleware/     # Auth middleware
│   ├── utils/          # Utilities and seed data
│   └── server.js       # Express server
├── frontend/
│   ├── css/            # Stylesheets
│   ├── js/             # Frontend JavaScript
│   └── index.html      # Main HTML file
├── database/           # SQLite database files
└── package.json        # Dependencies
```

## Environment Variables

Create a `.env` file in the root directory:

```
PORT=3000
JWT_SECRET=your-secret-key-change-this-in-production
NODE_ENV=development
SPOONACULAR_API_KEY=your-spoonacular-api-key-here
```

### Spoonacular API Setup (Optional)

To use real recipe data from Spoonacular:

1. Sign up for a free API key at [Spoonacular API](https://spoonacular.com/food-api)
2. Add your API key to the `.env` file
3. The app will automatically use Spoonacular for new meal plans

**Note**: If no API key is provided, the app will use the pre-seeded database meals.

## API Endpoints

- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/meals/plan` - Get daily meal plan
- `GET /api/meals/:id` - Get meal details
- `GET /api/recipes/search` - Search recipes (requires Spoonacular API)
- `POST /api/recipes/refresh` - Refresh recipe database (requires Spoonacular API)

## Development

For development with auto-restart:
```bash
npm run dev
```

## License

MIT