const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000/api' 
    : `${window.location.protocol}//${window.location.host}/api`;
let authToken = localStorage.getItem('authToken');
let currentUser = null;

// DOM Elements
const authContainer = document.getElementById('authContainer');
const profileSetupContainer = document.getElementById('profileSetupContainer');
const dashboardContainer = document.getElementById('dashboardContainer');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const errorMessage = document.getElementById('errorMessage');
const successMessage = document.getElementById('successMessage');

// Password Toggle Function
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const button = input.nextElementSibling;
    const eyeIcon = button.querySelector('.eye-icon');
    
    if (input.type === 'password') {
        input.type = 'text';
        eyeIcon.textContent = '👁‍🗨';
    } else {
        input.type = 'password';
        eyeIcon.textContent = '👁';
    }
}

// Password Strength Checker
document.getElementById('signupPassword').addEventListener('input', (e) => {
    const password = e.target.value;
    const strengthFill = document.getElementById('strengthFill');
    const strengthText = document.getElementById('strengthText');
    
    let strength = 0;
    
    // Check password criteria
    if (password.length >= 8) strength++;
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++;
    if (password.match(/[0-9]/)) strength++;
    if (password.match(/[^a-zA-Z0-9]/)) strength++;
    
    // Update UI
    strengthFill.className = 'strength-fill';
    
    if (password.length === 0) {
        strengthFill.style.width = '0';
        strengthText.textContent = 'Enter a password';
    } else if (strength <= 1) {
        strengthFill.classList.add('weak');
        strengthText.textContent = 'Weak password';
    } else if (strength <= 2) {
        strengthFill.classList.add('medium');
        strengthText.textContent = 'Medium strength';
    } else {
        strengthFill.classList.add('strong');
        strengthText.textContent = 'Strong password';
    }
});

// Auth Form Switching with Animation
document.getElementById('showSignup').addEventListener('click', (e) => {
    e.preventDefault();
    loginForm.style.opacity = '0';
    setTimeout(() => {
        loginForm.classList.add('hidden');
        signupForm.classList.remove('hidden');
        signupForm.style.opacity = '0';
        setTimeout(() => {
            signupForm.style.opacity = '1';
        }, 50);
    }, 300);
    errorMessage.classList.add('hidden');
    successMessage.classList.add('hidden');
});

document.getElementById('showLogin').addEventListener('click', (e) => {
    e.preventDefault();
    signupForm.style.opacity = '0';
    setTimeout(() => {
        signupForm.classList.add('hidden');
        loginForm.classList.remove('hidden');
        loginForm.style.opacity = '0';
        setTimeout(() => {
            loginForm.style.opacity = '1';
        }, 50);
    }, 300);
    errorMessage.classList.add('hidden');
    successMessage.classList.add('hidden');
});

// Login Handler
document.getElementById('loginFormElement').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            authToken = data.token;
            localStorage.setItem('authToken', authToken);
            currentUser = data.user;
            await checkUserProfile();
        } else {
            showError(data.error);
        }
    } catch (error) {
        showError('Network error. Please try again.');
    }
});

// Signup Handler
document.getElementById('signupFormElement').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    
    try {
        const response = await fetch(`${API_URL}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            authToken = data.token;
            localStorage.setItem('authToken', authToken);
            currentUser = data.user;
            showSuccess('Account created successfully! Setting up your profile...');
            setTimeout(() => {
                showProfileSetup();
            }, 1500);
        } else {
            showError(data.error);
        }
    } catch (error) {
        showError('Network error. Please try again.');
    }
});

// Multi-step form navigation
let currentStep = 1;
const totalSteps = 3;

function updateProgressBar() {
    const progressFill = document.querySelector('.progress-fill');
    const progressPercentage = (currentStep / totalSteps) * 100;
    progressFill.style.width = `${progressPercentage}%`;
    
    // Update step indicators
    document.querySelectorAll('.step').forEach((step, index) => {
        if (index + 1 < currentStep) {
            step.classList.add('completed');
            step.classList.remove('active');
        } else if (index + 1 === currentStep) {
            step.classList.add('active');
            step.classList.remove('completed');
        } else {
            step.classList.remove('active', 'completed');
        }
    });
}

function nextStep(stepNumber) {
    // Validate current step
    if (!validateStep(stepNumber)) {
        return;
    }
    
    // Hide current step
    document.getElementById(`step${stepNumber}`).classList.remove('active');
    
    // Show next step
    currentStep = stepNumber + 1;
    document.getElementById(`step${currentStep}`).classList.add('active');
    
    // Update progress
    updateProgressBar();
}

function prevStep(stepNumber) {
    // Hide current step
    document.getElementById(`step${stepNumber}`).classList.remove('active');
    
    // Show previous step
    currentStep = stepNumber - 1;
    document.getElementById(`step${currentStep}`).classList.add('active');
    
    // Update progress
    updateProgressBar();
}

function validateStep(stepNumber) {
    const step = document.getElementById(`step${stepNumber}`);
    const requiredInputs = step.querySelectorAll('input[required]');
    let isValid = true;
    
    requiredInputs.forEach(input => {
        if (input.type === 'radio') {
            const radioGroup = step.querySelectorAll(`input[name="${input.name}"]`);
            const isChecked = Array.from(radioGroup).some(radio => radio.checked);
            if (!isChecked) {
                isValid = false;
                showError(`Please select ${input.name.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
            }
        } else if (!input.value) {
            isValid = false;
            input.classList.add('error');
            showError(`Please fill in ${input.previousElementSibling.textContent}`);
        }
    });
    
    return isValid;
}

// Unit conversion functions
function toggleHeightUnit(unit) {
    const heightInput = document.getElementById('height');
    const suffix = heightInput.parentElement.querySelector('.input-suffix');
    const buttons = heightInput.parentElement.parentElement.querySelectorAll('.unit-btn');
    
    buttons.forEach(btn => {
        btn.classList.toggle('active', btn.textContent === unit);
    });
    
    if (unit === 'ft') {
        suffix.textContent = 'ft/in';
        heightInput.placeholder = '5\'10"';
        // Convert cm to feet/inches if there's a value
        if (heightInput.value) {
            const cm = parseFloat(heightInput.value);
            const totalInches = cm / 2.54;
            const feet = Math.floor(totalInches / 12);
            const inches = Math.round(totalInches % 12);
            heightInput.value = `${feet}'${inches}"`;
        }
    } else {
        suffix.textContent = 'cm';
        heightInput.placeholder = '170';
        // Convert feet/inches to cm if there's a value
        if (heightInput.value && heightInput.value.includes("'")) {
            const parts = heightInput.value.split("'");
            const feet = parseInt(parts[0]) || 0;
            const inches = parseInt(parts[1]) || 0;
            const cm = Math.round((feet * 12 + inches) * 2.54);
            heightInput.value = cm;
        }
    }
}

function toggleWeightUnit(unit) {
    const weightInput = document.getElementById('weight');
    const suffix = weightInput.parentElement.querySelector('.input-suffix');
    const buttons = weightInput.parentElement.parentElement.querySelectorAll('.unit-btn');
    
    buttons.forEach(btn => {
        btn.classList.toggle('active', btn.textContent === unit);
    });
    
    if (unit === 'lbs') {
        suffix.textContent = 'lbs';
        // Convert kg to lbs if there's a value
        if (weightInput.value) {
            const kg = parseFloat(weightInput.value);
            const lbs = Math.round(kg * 2.20462 * 10) / 10;
            weightInput.value = lbs;
        }
    } else {
        suffix.textContent = 'kg';
        // Convert lbs to kg if there's a value
        if (weightInput.value) {
            const lbs = parseFloat(weightInput.value);
            const kg = Math.round(lbs / 2.20462 * 10) / 10;
            weightInput.value = kg;
        }
    }
}

// Profile Setup Handler
document.getElementById('profileForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Validate final step
    if (!validateStep(3)) {
        return;
    }
    
    // Get selected diet type
    const dietTypeInput = document.querySelector('input[name="dietType"]:checked');
    const dietType = dietTypeInput ? dietTypeInput.value : 'anything';
    
    // Get gender value
    const genderInput = document.querySelector('input[name="gender"]:checked');
    const activityInput = document.querySelector('input[name="activityLevel"]:checked');
    const goalInput = document.querySelector('input[name="caloricGoal"]:checked');
    
    // Get meals per day
    const mealsPerDay = document.getElementById('mealsPerDay').value;
    const favoriteFoods = document.getElementById('favoriteFoods').value;
    
    // Handle height conversion
    let height = document.getElementById('height').value;
    const heightButtons = document.getElementById('height').parentElement.parentElement.querySelectorAll('.unit-btn');
    const heightUnit = Array.from(heightButtons).find(btn => btn.classList.contains('active'))?.textContent || 'cm';
    if (heightUnit === 'ft/in' && height.includes("'")) {
        const parts = height.split("'");
        const feet = parseInt(parts[0]) || 0;
        const inches = parseInt(parts[1]) || 0;
        height = Math.round((feet * 12 + inches) * 2.54);
    }
    
    // Handle weight conversion
    let weight = parseFloat(document.getElementById('weight').value);
    const weightButtons = document.getElementById('weight').parentElement.parentElement.querySelectorAll('.unit-btn');
    const weightUnit = Array.from(weightButtons).find(btn => btn.classList.contains('active'))?.textContent || 'kg';
    if (weightUnit === 'lbs') {
        weight = Math.round(weight / 2.20462 * 10) / 10;
    }
    
    const profileData = {
        age: parseInt(document.getElementById('age').value),
        gender: genderInput ? genderInput.value : '',
        height: parseFloat(height),
        weight: parseFloat(weight),
        activity_level: activityInput ? activityInput.value : 'moderate',
        dietary_preferences: dietType,
        allergies: document.getElementById('allergies').value,
        caloric_goal: goalInput ? goalInput.value : 'maintain',
        meals_per_day: parseInt(mealsPerDay),
        favorite_foods: favoriteFoods
    };
    
    try {
        const response = await fetch(`${API_URL}/users/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(profileData)
        });
        
        if (response.ok) {
            showDashboard();
        } else {
            showError('Failed to update profile. Please try again.');
        }
    } catch (error) {
        showError('Network error. Please try again.');
    }
});

// Logout Handler
document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('authToken');
    authToken = null;
    currentUser = null;
    location.reload();
});

// Check User Profile
async function checkUserProfile() {
    try {
        const response = await fetch(`${API_URL}/users/profile`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        if (response.ok) {
            const profile = await response.json();
            if (!profile.age || !profile.gender) {
                showProfileSetup();
            } else {
                showDashboard();
            }
        }
    } catch (error) {
        showError('Failed to load profile');
    }
}

// Show Functions
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
    successMessage.classList.add('hidden');
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        errorMessage.classList.add('hidden');
    }, 5000);
}

function showSuccess(message) {
    successMessage.textContent = message;
    successMessage.classList.remove('hidden');
    errorMessage.classList.add('hidden');
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        successMessage.classList.add('hidden');
    }, 5000);
}

function showProfileSetup() {
    authContainer.classList.add('hidden');
    profileSetupContainer.classList.remove('hidden');
    dashboardContainer.classList.add('hidden');
}

function showDashboard() {
    console.log('showDashboard called');
    authContainer.classList.add('hidden');
    profileSetupContainer.classList.add('hidden');
    dashboardContainer.classList.remove('hidden');
    console.log('Dashboard container visible:', !dashboardContainer.classList.contains('hidden'));
    loadDashboard();
}

// Load Dashboard
async function loadDashboard() {
    console.log('loadDashboard called');
    console.log('Auth token:', authToken);
    
    try {
        // Load user profile
        console.log('Loading user profile...');
        const profileResponse = await fetch(`${API_URL}/users/profile`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        console.log('Profile response status:', profileResponse.status);
        
        if (!profileResponse.ok) {
            throw new Error(`Profile fetch failed: ${profileResponse.status}`);
        }
        
        const profile = await profileResponse.json();
        console.log('Profile loaded:', profile);
        
        const userNameElement = document.getElementById('userName');
        if (userNameElement) {
            userNameElement.textContent = `Hello, ${profile.name}!`;
        } else {
            console.error('userName element not found!');
        }
        
        // Load meal plan
        console.log('Loading meal plan...');
        const mealPlanResponse = await fetch(`${API_URL}/meals/plan`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        console.log('Meal plan response status:', mealPlanResponse.status);
        
        if (!mealPlanResponse.ok) {
            throw new Error(`Meal plan fetch failed: ${mealPlanResponse.status}`);
        }
        
        const { mealPlan, totalNutrition, regenerationCount, regenerationLimit } = await mealPlanResponse.json();
        
        console.log('Meal plan loaded:', mealPlan);
        console.log('Total nutrition:', totalNutrition);
        console.log('Regeneration count:', regenerationCount, '/', regenerationLimit);
        
        // Check if dashboard element exists
        const dashboardElement = document.getElementById('dashboard');
        if (!dashboardElement) {
            console.error('Dashboard element not found!');
            return;
        }
        
        console.log('Calling renderDashboard...');
        renderDashboard(mealPlan, totalNutrition, regenerationCount, regenerationLimit);
    } catch (error) {
        console.error('Dashboard error:', error);
        showError('Failed to load dashboard: ' + error.message);
    }
}


// Render Meal Item (EatThisMuch style)
function renderMealItem(mealType, meal, mealClass) {
    console.log(`Rendering ${mealType}:`, meal);
    
    if (!meal) {
        console.error(`No meal data for ${mealType}`);
        return `<div class="meal-item ${mealClass}">No meal data available</div>`;
    }
    
    // Ensure meal has required properties
    const mealId = meal.id || 0;
    const mealName = meal.name || 'Unknown Meal';
    const mealCalories = meal.calories || 0;
    const mealImage = meal.image_url || '';
    const dietaryTags = meal.dietary_tags || '';
    
    console.log(`Meal ${mealType} details: id=${mealId}, name=${mealName}, calories=${mealCalories}`);
    
    // Create dietary badges
    let dietaryBadges = '';
    if (dietaryTags) {
        const tags = dietaryTags.split(',').filter(tag => tag.trim());
        dietaryBadges = tags.map(tag => {
            const tagClass = tag.trim().toLowerCase().replace(/\s+/g, '-');
            return `<span class="dietary-badge ${tagClass}">${tag.trim()}</span>`;
        }).join('');
    }
    
    return `
        <div class="meal-item ${mealClass}" data-meal-id="${mealId}" data-meal-type="${mealType.toLowerCase()}">
            <div class="meal-header-section">
                <h3>${mealType}</h3>
                <span class="meal-calories">${mealCalories} Calories</span>
            </div>
            <div class="meal-content-wrapper">
                ${mealImage ? `
                    <div class="meal-thumbnail">
                        <img src="${mealImage}" alt="${mealName}" onerror="this.style.display='none'">
                    </div>
                ` : ''}
                <div class="meal-details">
                    <h4 class="meal-title" onclick="viewMealDetails(${mealId})">${mealName}</h4>
                    <p class="meal-serving">1 serving</p>
                    ${dietaryBadges ? `<div class="dietary-badges">${dietaryBadges}</div>` : ''}
                </div>
                <button class="meal-options-btn" onclick="showMealOptions(${mealId}, event, '${mealType.toLowerCase()}')">⋮</button>
            </div>
        </div>
    `;
}

// Create nutrition pie chart
function createNutritionPieChart(totalNutrition) {
    console.log('Creating nutrition pie chart with data:', totalNutrition);
    
    const canvas = document.getElementById('nutritionPieChart');
    if (!canvas) {
        console.error('Canvas element not found for nutrition pie chart');
        return;
    }
    
    const ctx = canvas.getContext('2d');
    const protein = totalNutrition.protein || 0;
    const carbs = totalNutrition.carbs || 0;
    const fat = totalNutrition.fat || 0;
    const total = protein + carbs + fat;
    
    if (total === 0) {
        console.error('No nutrition data to display in pie chart');
        return;
    }
    
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Protein', 'Carbs', 'Fat'],
            datasets: [{
                data: [
                    Math.round((protein / total) * 100),
                    Math.round((carbs / total) * 100),
                    Math.round((fat / total) * 100)
                ],
                backgroundColor: [
                    '#9b5de5',
                    '#f6bd60',
                    '#00bbf9'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.label + ': ' + context.parsed + '%';
                        }
                    }
                }
            },
            cutout: '60%'
        }
    });
}

// Show meal options menu
async function showMealOptions(mealId, event, mealType) {
    if (event) {
        event.stopPropagation();
    }
    
    // Remove any existing menu
    const existingMenu = document.querySelector('.meal-options-menu');
    if (existingMenu) {
        existingMenu.remove();
    }
    
    // Check if meal is favorited
    const isFavorited = await checkIfFavorited(mealId);
    
    // Create menu
    const menu = document.createElement('div');
    menu.className = 'meal-options-menu';
    menu.innerHTML = `
        <div class="menu-item" onclick="viewMealDetails(${mealId})">
            <span class="menu-icon">📖</span> View Recipe
        </div>
        <div class="menu-item" onclick="replaceMeal(${mealId}, '${mealType}')">
            <span class="menu-icon">🔄</span> Replace Meal
        </div>
        <div class="menu-item" onclick="toggleFavorite(${mealId})">
            <span class="menu-icon">${isFavorited ? '❤️' : '🤍'}</span> ${isFavorited ? 'Remove from' : 'Add to'} Favorites
        </div>
    `;
    
    // Position menu near button
    const button = event ? event.target : document.querySelector(`[data-meal-id="${mealId}"] .meal-options-btn`);
    const rect = button.getBoundingClientRect();
    menu.style.position = 'fixed';
    menu.style.top = rect.bottom + 'px';
    menu.style.left = (rect.left - 150) + 'px';
    
    document.body.appendChild(menu);
    
    // Close menu when clicking outside
    setTimeout(() => {
        document.addEventListener('click', function closeMenu() {
            menu.remove();
            document.removeEventListener('click', closeMenu);
        });
    }, 100);
}

// Replace meal function
async function replaceMeal(mealId, mealType) {
    console.log('Replace meal:', mealId, 'Type:', mealType);
    
    try {
        // Show loading state
        const mealElement = document.querySelector(`[data-meal-id="${mealId}"]`);
        if (mealElement) {
            mealElement.style.opacity = '0.5';
            mealElement.style.pointerEvents = 'none';
        }
        
        const response = await fetch(`${API_URL}/meals/replace`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                mealId: mealId,
                mealType: mealType
            })
        });
        
        if (response.ok) {
            const { newMeal } = await response.json();
            
            // Update the meal in the UI
            if (mealElement && newMeal) {
                const newMealHtml = renderMealItem(mealType.charAt(0).toUpperCase() + mealType.slice(1), newMeal, mealType);
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = newMealHtml;
                const newMealElement = tempDiv.firstElementChild;
                
                // Replace the old meal with the new one
                mealElement.parentNode.replaceChild(newMealElement, mealElement);
                
                // Update nutrition totals
                await loadDashboard();
            }
            
            showSuccess('Meal replaced successfully!');
        } else {
            const error = await response.json();
            throw new Error(error.error || 'Failed to replace meal');
        }
    } catch (error) {
        console.error('Replace meal error:', error);
        showError(error.message || 'Failed to replace meal');
        
        // Restore the meal element state
        const mealElement = document.querySelector(`[data-meal-id="${mealId}"]`);
        if (mealElement) {
            mealElement.style.opacity = '1';
            mealElement.style.pointerEvents = 'auto';
        }
    }
}

// Add to favorites function
async function addToFavorites(mealId) {
    try {
        const response = await fetch(`${API_URL}/favorites/${mealId}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        if (response.ok) {
            showSuccess('Meal added to favorites!');
            // Update UI to show the meal is favorited
            updateFavoriteButtons(mealId, true);
        } else {
            const error = await response.json();
            showError(error.error || 'Failed to add to favorites');
        }
    } catch (error) {
        console.error('Add to favorites error:', error);
        showError('Failed to add to favorites');
    }
}

// Remove from favorites function
async function removeFromFavorites(mealId) {
    try {
        const response = await fetch(`${API_URL}/favorites/${mealId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        if (response.ok) {
            showSuccess('Meal removed from favorites!');
            // Update UI to show the meal is not favorited
            updateFavoriteButtons(mealId, false);
        } else {
            const error = await response.json();
            showError(error.error || 'Failed to remove from favorites');
        }
    } catch (error) {
        console.error('Remove from favorites error:', error);
        showError('Failed to remove from favorites');
    }
}

// Toggle favorite status
async function toggleFavorite(mealId) {
    const isFavorited = await checkIfFavorited(mealId);
    if (isFavorited) {
        await removeFromFavorites(mealId);
    } else {
        await addToFavorites(mealId);
    }
}

// Check if a meal is favorited
async function checkIfFavorited(mealId) {
    try {
        const response = await fetch(`${API_URL}/favorites/${mealId}/check`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        if (response.ok) {
            const data = await response.json();
            return data.isFavorite;
        }
        return false;
    } catch (error) {
        console.error('Check favorite error:', error);
        return false;
    }
}

// Update favorite buttons in the UI
function updateFavoriteButtons(mealId, isFavorited) {
    const buttons = document.querySelectorAll(`[data-meal-id="${mealId}"] .favorite-btn`);
    buttons.forEach(btn => {
        if (isFavorited) {
            btn.classList.add('favorited');
            btn.innerHTML = '❤️ Favorited';
        } else {
            btn.classList.remove('favorited');
            btn.innerHTML = '🤍 Add to Favorites';
        }
    });
}

// Get user's favorite meals
async function getFavoriteMeals() {
    try {
        const response = await fetch(`${API_URL}/favorites`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        if (response.ok) {
            return await response.json();
        }
        return [];
    } catch (error) {
        console.error('Get favorites error:', error);
        return [];
    }
}

// Show favorites modal
async function showFavorites() {
    const favorites = await getFavoriteMeals();
    
    const modal = document.createElement('div');
    modal.className = 'modal shopping-list-modal';
    
    const favoritesList = favorites.length > 0 
        ? favorites.map(meal => `
            <div class="favorite-meal-item" data-meal-id="${meal.id}">
                <div class="favorite-meal-info">
                    ${meal.image_url ? `
                        <img src="${meal.image_url}" alt="${meal.name}" class="favorite-meal-image">
                    ` : ''}
                    <div class="favorite-meal-details">
                        <h4>${meal.name}</h4>
                        <p>${meal.meal_type} • ${meal.calories} calories</p>
                        <p class="favorite-date">Favorited ${new Date(meal.favorited_at).toLocaleDateString()}</p>
                    </div>
                </div>
                <div class="favorite-meal-actions">
                    <button class="btn btn-small" onclick="viewMealDetails(${meal.id})">View Recipe</button>
                    <button class="btn btn-small btn-danger" onclick="removeFavoriteFromList(${meal.id})">Remove</button>
                </div>
            </div>
        `).join('')
        : '<p class="no-favorites">You haven\'t added any favorite meals yet!</p>';
    
    modal.innerHTML = `
        <div class="modal-content shopping-list-content">
            <div class="modal-header">
                <h2>My Favorite Meals</h2>
                <button class="close-modal" onclick="this.closest('.modal').remove()">×</button>
            </div>
            <div class="modal-body favorites-list">
                ${favoritesList}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Remove favorite from the favorites list view
async function removeFavoriteFromList(mealId) {
    if (confirm('Remove this meal from your favorites?')) {
        await removeFromFavorites(mealId);
        // Refresh the favorites modal
        document.querySelector('.modal').remove();
        showFavorites();
    }
}

// Show weekly meal planner
async function showWeeklyPlanner() {
    const modal = document.createElement('div');
    modal.className = 'modal weekly-planner-modal';
    
    // Show loading state
    modal.innerHTML = `
        <div class="modal-content weekly-planner-content">
            <div class="modal-header">
                <h2>📅 Weekly Meal Planner</h2>
                <button class="close-modal" onclick="this.closest('.modal').remove()">×</button>
            </div>
            <div class="modal-body">
                <div class="loading-spinner">
                    <div class="spinner"></div>
                    <p>Loading your weekly meal plan...</p>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    try {
        // Get start date (Monday of current week)
        const today = new Date();
        const monday = new Date(today);
        const day = monday.getDay();
        const diff = monday.getDate() - day + (day === 0 ? -6 : 1);
        monday.setDate(diff);
        const startDate = monday.toISOString().split('T')[0];
        
        // Fetch weekly meal plan
        const response = await fetch(`${API_URL}/meals/weekly-plan?startDate=${startDate}`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        if (response.ok) {
            const data = await response.json();
            showWeeklyPlannerContent(modal, data.weeklyPlan);
        } else {
            throw new Error('Failed to load weekly plan');
        }
    } catch (error) {
        console.error('Weekly planner error:', error);
        modal.querySelector('.modal-body').innerHTML = `
            <div class="error-state">
                <span class="error-icon">😕</span>
                <h3>Failed to load weekly plan</h3>
                <p>${error.message}</p>
            </div>
        `;
    }
}

// Show weekly planner content
function showWeeklyPlannerContent(modal, weeklyPlan) {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const today = new Date();
    const currentDayIndex = today.getDay() === 0 ? 6 : today.getDay() - 1; // Adjust for Monday start
    
    let weeklyCalories = 0;
    let weeklyProtein = 0;
    let weeklyCarbs = 0;
    let weeklyFat = 0;
    
    // Calculate weekly totals
    weeklyPlan.forEach(day => {
        if (day.meals) {
            weeklyCalories += (day.meals.breakfast?.calories || 0) + (day.meals.lunch?.calories || 0) + (day.meals.dinner?.calories || 0);
            weeklyProtein += (day.meals.breakfast?.protein || 0) + (day.meals.lunch?.protein || 0) + (day.meals.dinner?.protein || 0);
            weeklyCarbs += (day.meals.breakfast?.carbs || 0) + (day.meals.lunch?.carbs || 0) + (day.meals.dinner?.carbs || 0);
            weeklyFat += (day.meals.breakfast?.fat || 0) + (day.meals.lunch?.fat || 0) + (day.meals.dinner?.fat || 0);
        }
    });
    
    const weeklyPlanHtml = days.map((day, index) => {
        const dayPlan = weeklyPlan[index] || { meals: null };
        const isToday = index === currentDayIndex;
        const isPast = index < currentDayIndex;
        
        return `
            <div class="day-plan ${isToday ? 'today' : ''} ${isPast ? 'past' : ''}">
                <div class="day-header">
                    <h3>${day}</h3>
                    ${isToday ? '<span class="today-badge">Today</span>' : ''}
                    ${dayPlan.meals ? `<span class="day-calories">${calculateDayCalories(dayPlan.meals)} cal</span>` : ''}
                </div>
                <div class="day-meals">
                    ${dayPlan.meals ? `
                        <div class="mini-meal breakfast">
                            <span class="meal-type-icon">🌅</span>
                            <div class="mini-meal-info">
                                <p class="mini-meal-name">${dayPlan.meals.breakfast?.name || 'No breakfast'}</p>
                                <p class="mini-meal-calories">${dayPlan.meals.breakfast?.calories || 0} cal</p>
                            </div>
                        </div>
                        <div class="mini-meal lunch">
                            <span class="meal-type-icon">☀️</span>
                            <div class="mini-meal-info">
                                <p class="mini-meal-name">${dayPlan.meals.lunch?.name || 'No lunch'}</p>
                                <p class="mini-meal-calories">${dayPlan.meals.lunch?.calories || 0} cal</p>
                            </div>
                        </div>
                        <div class="mini-meal dinner">
                            <span class="meal-type-icon">🌙</span>
                            <div class="mini-meal-info">
                                <p class="mini-meal-name">${dayPlan.meals.dinner?.name || 'No dinner'}</p>
                                <p class="mini-meal-calories">${dayPlan.meals.dinner?.calories || 0} cal</p>
                            </div>
                        </div>
                    ` : `
                        <div class="no-meals">
                            <p>No meals planned</p>
                            <button class="btn btn-small" onclick="generateDayMeals(${index})">Generate Meals</button>
                        </div>
                    `}
                </div>
            </div>
        `;
    }).join('');
    
    modal.querySelector('.modal-body').innerHTML = `
        <div class="weekly-overview">
            <div class="week-stats">
                <div class="stat-item">
                    <span class="stat-label">Weekly Calories</span>
                    <span class="stat-value">${Math.round(weeklyCalories)}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Avg Daily</span>
                    <span class="stat-value">${Math.round(weeklyCalories / 7)}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Protein</span>
                    <span class="stat-value">${Math.round(weeklyProtein)}g</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Shopping Items</span>
                    <span class="stat-value">${countUniqueIngredients(weeklyPlan)}</span>
                </div>
            </div>
            
            <div class="week-actions">
                <button class="btn btn-secondary" onclick="generateFullWeek()">
                    <span class="btn-icon">🔄</span> Generate Full Week
                </button>
                <button class="btn btn-primary" onclick="showWeeklyShoppingList()">
                    <span class="btn-icon">🛒</span> Weekly Shopping List
                </button>
                <button class="btn btn-amazon" onclick="orderOnAmazon()">
                    <span class="btn-icon">📦</span> Order on Amazon Fresh
                </button>
            </div>
        </div>
        
        <div class="weekly-calendar">
            ${weeklyPlanHtml}
        </div>
    `;
}

// Calculate daily calories
function calculateDayCalories(meals) {
    return (meals.breakfast?.calories || 0) + (meals.lunch?.calories || 0) + (meals.dinner?.calories || 0);
}

// Count unique ingredients
function countUniqueIngredients(weeklyPlan) {
    const ingredients = new Set();
    weeklyPlan.forEach(day => {
        if (day.meals) {
            ['breakfast', 'lunch', 'dinner'].forEach(mealType => {
                if (day.meals[mealType]?.ingredients) {
                    // ingredients are already parsed by backend
                    const mealIngredients = Array.isArray(day.meals[mealType].ingredients) 
                        ? day.meals[mealType].ingredients 
                        : [];
                    mealIngredients.forEach(ing => ingredients.add(ing.toLowerCase()));
                }
            });
        }
    });
    return ingredients.size;
}

// Generate meals for a specific day
async function generateDayMeals(dayIndex) {
    try {
        // Calculate the date for this day
        const today = new Date();
        const monday = new Date(today);
        const day = monday.getDay();
        const diff = monday.getDate() - day + (day === 0 ? -6 : 1);
        monday.setDate(diff + dayIndex);
        const date = monday.toISOString().split('T')[0];
        
        const response = await fetch(`${API_URL}/meals/generate-day`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ date })
        });
        
        if (response.ok) {
            // Refresh the weekly planner
            document.querySelector('.weekly-planner-modal').remove();
            showWeeklyPlanner();
        }
    } catch (error) {
        console.error('Generate day meals error:', error);
        showError('Failed to generate meals for this day');
    }
}

// Generate full week of meals
async function generateFullWeek() {
    const modal = document.querySelector('.weekly-planner-modal');
    const originalContent = modal.querySelector('.modal-body').innerHTML;
    
    modal.querySelector('.modal-body').innerHTML = `
        <div class="loading-spinner">
            <div class="spinner"></div>
            <p>Generating your personalized weekly meal plan...</p>
        </div>
    `;
    
    try {
        // Get start date (Monday of current week)
        const today = new Date();
        const monday = new Date(today);
        const day = monday.getDay();
        const diff = monday.getDate() - day + (day === 0 ? -6 : 1);
        monday.setDate(diff);
        const startDate = monday.toISOString().split('T')[0];
        
        const response = await fetch(`${API_URL}/meals/generate-week`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ startDate })
        });
        
        if (response.ok) {
            const weeklyPlan = await response.json();
            showWeeklyPlannerContent(modal, weeklyPlan.weeklyPlan);
        } else {
            throw new Error('Failed to generate weekly plan');
        }
    } catch (error) {
        console.error('Generate week error:', error);
        modal.querySelector('.modal-body').innerHTML = originalContent;
        showError('Failed to generate weekly plan');
    }
}

// Show weekly shopping list
async function showWeeklyShoppingList() {
    try {
        // Get start date (Monday of current week)
        const today = new Date();
        const monday = new Date(today);
        const day = monday.getDay();
        const diff = monday.getDate() - day + (day === 0 ? -6 : 1);
        monday.setDate(diff);
        const startDate = monday.toISOString().split('T')[0];
        
        const response = await fetch(`${API_URL}/meals/weekly-shopping-list?startDate=${startDate}`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        if (response.ok) {
            const shoppingData = await response.json();
            showWeeklyShoppingModal(shoppingData);
        }
    } catch (error) {
        console.error('Weekly shopping list error:', error);
        showError('Failed to generate shopping list');
    }
}

// Show weekly shopping modal
function showWeeklyShoppingModal(shoppingData) {
    const modal = document.createElement('div');
    modal.className = 'modal shopping-list-modal';
    
    // Use the pre-categorized shopping list from backend
    const categoriesHtml = Object.entries(shoppingData.shoppingList || {}).map(([category, items]) => `
        <div class="category-section">
            <h3 class="category-title">${category}</h3>
            <div class="shopping-items">
                ${items.map(item => `
                    <div class="shopping-item">
                        <label class="item-checkbox">
                            <input type="checkbox" onchange="toggleShoppingItem(this)">
                            <span class="item-text">${item.name} - ${item.amount} ${item.unit}</span>
                        </label>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');
    
    modal.innerHTML = `
        <div class="modal-content shopping-list-content">
            <div class="modal-header">
                <div>
                    <h2>📋 Weekly Shopping List</h2>
                    <p class="shopping-subtitle">For 7 days of meals</p>
                </div>
                <div class="shopping-actions">
                    <button class="btn btn-small" onclick="printShoppingList()">🖨️ Print</button>
                    <button class="btn btn-small btn-amazon" onclick="orderOnAmazon()">📦 Order on Amazon</button>
                    <button class="close-modal" onclick="this.closest('.modal').remove()">×</button>
                </div>
            </div>
            <div class="modal-body">
                <div class="shopping-summary">
                    <p><strong>${shoppingData.totalItems || 0}</strong> total items</p>
                    <p>Estimated cost: <strong>$${shoppingData.estimatedCost || '---'}</strong></p>
                </div>
                <div class="shopping-categories">
                    ${categoriesHtml}
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Categorize shopping items
function categorizeShopping(items) {
    const categories = {
        'Produce': [],
        'Dairy & Eggs': [],
        'Meat & Seafood': [],
        'Pantry': [],
        'Frozen': [],
        'Other': []
    };
    
    items.forEach(item => {
        const category = determineCategory(item.name);
        categories[category].push(item);
    });
    
    // Remove empty categories
    Object.keys(categories).forEach(key => {
        if (categories[key].length === 0) delete categories[key];
    });
    
    return categories;
}

// Determine item category
function determineCategory(itemName) {
    const name = itemName.toLowerCase();
    if (name.match(/chicken|beef|pork|fish|salmon|shrimp|turkey/)) return 'Meat & Seafood';
    if (name.match(/milk|cheese|yogurt|egg|butter|cream/)) return 'Dairy & Eggs';
    if (name.match(/lettuce|tomato|onion|garlic|pepper|carrot|broccoli|fruit|apple|banana/)) return 'Produce';
    if (name.match(/frozen|ice cream/)) return 'Frozen';
    if (name.match(/rice|pasta|bread|flour|sugar|oil|sauce|spice/)) return 'Pantry';
    return 'Other';
}

// Order on Amazon Fresh
async function orderOnAmazon() {
    const modal = document.createElement('div');
    modal.className = 'modal amazon-modal';
    
    modal.innerHTML = `
        <div class="modal-content amazon-modal-content">
            <div class="modal-header">
                <h2>📦 Order on Amazon Fresh</h2>
                <button class="close-modal" onclick="this.closest('.modal').remove()">×</button>
            </div>
            <div class="modal-body">
                <div class="amazon-integration">
                    <div class="amazon-logo">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg" alt="Amazon" style="width: 120px;">
                    </div>
                    <p>Connect your Amazon account to order groceries directly!</p>
                    
                    <div class="amazon-features">
                        <div class="feature">
                            <span class="feature-icon">🚚</span>
                            <p>Free delivery on orders over $35</p>
                        </div>
                        <div class="feature">
                            <span class="feature-icon">⚡</span>
                            <p>Same-day or next-day delivery</p>
                        </div>
                        <div class="feature">
                            <span class="feature-icon">💰</span>
                            <p>Exclusive Prime member discounts</p>
                        </div>
                    </div>
                    
                    <button class="btn btn-amazon-connect" onclick="connectAmazon()">
                        Connect Amazon Account
                    </button>
                    
                    <p class="amazon-note">
                        Note: This will redirect you to Amazon to authorize NutriPlan Daily to create shopping lists in your Amazon Fresh account.
                    </p>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Connect to Amazon
async function connectAmazon() {
    // In production, this would initiate OAuth flow with Amazon
    try {
        const response = await fetch(`${API_URL}/amazon/auth-url`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        if (response.ok) {
            const { authUrl } = await response.json();
            // window.location.href = authUrl;
            
            // For demo purposes
            showSuccess('Amazon integration coming soon! For now, we\'ll generate a shopping list you can manually add to Amazon Fresh.');
            
            // Generate Amazon-compatible list
            generateAmazonList();
        }
    } catch (error) {
        console.error('Amazon connection error:', error);
        showError('Failed to connect to Amazon');
    }
}

// Generate Amazon-compatible shopping list
async function generateAmazonList() {
    try {
        // Get start date (Monday of current week)
        const today = new Date();
        const monday = new Date(today);
        const day = monday.getDay();
        const diff = monday.getDate() - day + (day === 0 ? -6 : 1);
        monday.setDate(diff);
        const startDate = monday.toISOString().split('T')[0];
        
        const response = await fetch(`${API_URL}/meals/amazon-list?startDate=${startDate}`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        if (response.ok) {
            const data = await response.json();
            const items = data.amazonItems || [];
            
            // Create a text list for copying
            const itemsList = items.map(item => `${item.quantity} ${item.name}`).join('\n');
            
            const modal = document.createElement('div');
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>📋 Amazon Fresh Shopping List</h2>
                        <button class="close-modal" onclick="this.closest('.modal').remove()">×</button>
                    </div>
                    <div class="modal-body">
                        <p>Copy this list and paste it into Amazon Fresh:</p>
                        <textarea class="amazon-list-textarea" readonly>${itemsList}</textarea>
                        <button class="btn btn-primary" onclick="copyToClipboard(this.previousElementSibling)">
                            📋 Copy List
                        </button>
                        <a href="https://www.amazon.com/alm/storefront?almBrandId=QW1hem9uIEZyZXNo" target="_blank" class="btn btn-amazon">
                            🛒 Open Amazon Fresh
                        </a>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
        }
    } catch (error) {
        console.error('Generate Amazon list error:', error);
        showError('Failed to generate Amazon list');
    }
}

// Copy to clipboard
function copyToClipboard(textarea) {
    textarea.select();
    document.execCommand('copy');
    showSuccess('List copied to clipboard!');
}

// Create pie chart for meal card
function createMealChart(canvasId, meal) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Protein', 'Carbs', 'Fat'],
            datasets: [{
                data: [meal.protein, meal.carbs, meal.fat],
                backgroundColor: [
                    '#e74c3c',
                    '#3498db',
                    '#f1c40f'
                ],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.label + ': ' + context.parsed + 'g';
                        }
                    }
                }
            }
        }
    });
}

// View Meal Details
async function viewMealDetails(mealId) {
    try {
        const response = await fetch(`${API_URL}/meals/${mealId}`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const meal = await response.json();
        
        showMealModal(meal);
    } catch (error) {
        showError('Failed to load meal details');
    }
}

// Show Meal Modal
function showMealModal(meal) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    
    const ingredients = meal.ingredients ? (Array.isArray(meal.ingredients) ? meal.ingredients : JSON.parse(meal.ingredients)) : [];
    const instructions = meal.instructions ? (Array.isArray(meal.instructions) ? meal.instructions : JSON.parse(meal.instructions)) : [];
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>${meal.name}</h2>
                <button class="close-modal" onclick="this.closest('.modal').remove()">×</button>
            </div>
            <div class="modal-body">
                ${meal.image_url ? `<img src="${meal.image_url}" alt="${meal.name}" class="meal-detail-image">` : ''}
                <div class="nutrition-facts">
                    <h3>Nutrition Facts</h3>
                    <div class="nutrition-overview">
                        <div class="detail-chart-container">
                            <canvas id="detail-chart" width="250" height="250"></canvas>
                        </div>
                        <div class="nutrition-legend">
                            <div class="legend-item">
                                <span class="legend-color" style="background-color: #e74c3c;"></span>
                                <span>Protein: ${meal.protein}g</span>
                            </div>
                            <div class="legend-item">
                                <span class="legend-color" style="background-color: #3498db;"></span>
                                <span>Carbs: ${meal.carbs}g</span>
                            </div>
                            <div class="legend-item">
                                <span class="legend-color" style="background-color: #f1c40f;"></span>
                                <span>Fat: ${meal.fat}g</span>
                            </div>
                            <div class="legend-item">
                                <span class="legend-color" style="background-color: #95a5a6;"></span>
                                <span>Fiber: ${meal.fiber || 0}g</span>
                            </div>
                        </div>
                    </div>
                    <div class="nutrition-details">
                        <div class="detail-item">
                            <span class="detail-label">Total Calories</span>
                            <span class="detail-value">${meal.calories} kcal</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Servings</span>
                            <span class="detail-value">${meal.servings || 1}</span>
                        </div>
                    </div>
                </div>
                
                <div class="recipe-section">
                    <h3>Ingredients</h3>
                    <ul class="ingredients-list">
                        ${ingredients.map(ing => `<li>${ing}</li>`).join('')}
                    </ul>
                </div>
                
                <div class="recipe-section">
                    <h3>Instructions</h3>
                    <ol class="instructions-list">
                        ${instructions.map(inst => `<li>${inst}</li>`).join('')}
                    </ol>
                </div>
                
                <div class="prep-info">
                    <span><strong>Prep Time:</strong> ${meal.prep_time || 0} minutes</span>
                    <span><strong>Cook Time:</strong> ${meal.cook_time || 0} minutes</span>
                    <span><strong>Difficulty:</strong> ${meal.difficulty || 'Easy'}</span>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Create detail chart
    setTimeout(() => {
        createDetailChart(meal);
    }, 100);
}

// Create pie chart for modal
function createDetailChart(meal) {
    const canvas = document.getElementById('detail-chart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Protein', 'Carbs', 'Fat', 'Fiber'],
            datasets: [{
                data: [meal.protein, meal.carbs, meal.fat, meal.fiber || 0],
                backgroundColor: [
                    '#e74c3c',
                    '#3498db',
                    '#f1c40f',
                    '#95a5a6'
                ],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return label + ': ' + value + 'g (' + percentage + '%)';
                        }
                    }
                }
            }
        }
    });
}

// Regenerate Meal Plan
async function regenerateMealPlan() {
    const regenerateBtn = document.getElementById('regenerateBtn');
    const originalContent = regenerateBtn.innerHTML;
    
    // Show loading state
    regenerateBtn.disabled = true;
    regenerateBtn.innerHTML = '<span class="btn-icon spinning">⏳</span> Generating...';
    
    try {
        const response = await fetch(`${API_URL}/meals/regenerate`, {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const { mealPlan, totalNutrition, regenerationCount, regenerationLimit } = await response.json();
            
            // Update the dashboard with animation
            const dashboard = document.getElementById('dashboard');
            dashboard.style.opacity = '0';
            
            setTimeout(() => {
                renderDashboard(mealPlan, totalNutrition, regenerationCount || 0, regenerationLimit || 3);
                dashboard.style.opacity = '1';
            }, 300);
            
            showSuccess('New meal plan generated!');
        } else {
            const errorData = await response.json().catch(() => ({}));
            console.error('Regenerate failed:', response.status, errorData);
            
            if (response.status === 403 && errorData.error === 'You have reached your regeneration limit') {
                showError('You have reached your regeneration limit');
            } else {
                showError(`Failed to generate new meal plan: ${errorData.error || 'Please try again.'}`);
            }
        }
    } catch (error) {
        console.error('Regenerate error:', error);
        showError('Network error. Please try again.');
    } finally {
        regenerateBtn.disabled = false;
        regenerateBtn.innerHTML = originalContent;
    }
}

// Shopping List Functionality
let currentMealPlan = null;

async function showShoppingList() {
    if (!currentMealPlan) {
        showError('No meal plan available');
        return;
    }
    
    // Fetch full recipe details for all meals
    try {
        const [breakfast, lunch, dinner] = await Promise.all([
            fetch(`${API_URL}/meals/${currentMealPlan.breakfast.id}`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            }).then(r => r.json()),
            fetch(`${API_URL}/meals/${currentMealPlan.lunch.id}`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            }).then(r => r.json()),
            fetch(`${API_URL}/meals/${currentMealPlan.dinner.id}`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            }).then(r => r.json())
        ]);
        
        // Combine all ingredients
        const allIngredients = [];
        
        const addIngredients = (meal, mealType) => {
            const ingredients = meal.ingredients ? (Array.isArray(meal.ingredients) ? meal.ingredients : JSON.parse(meal.ingredients)) : [];
            ingredients.forEach(ing => {
                allIngredients.push({
                    ingredient: ing,
                    meal: meal.name,
                    mealType: mealType
                });
            });
        };
        
        addIngredients(breakfast, 'Breakfast');
        addIngredients(lunch, 'Lunch');
        addIngredients(dinner, 'Dinner');
        
        // Create shopping list modal
        createShoppingListModal(allIngredients);
        
    } catch (error) {
        showError('Failed to generate shopping list');
    }
}

function createShoppingListModal(ingredients) {
    const modal = document.createElement('div');
    modal.className = 'modal shopping-list-modal';
    
    const groupedIngredients = groupIngredientsByCategory(ingredients);
    
    modal.innerHTML = `
        <div class="modal-content shopping-list-content">
            <div class="modal-header">
                <h2>Shopping List</h2>
                <div class="shopping-actions">
                    <button class="btn btn-secondary btn-small" onclick="printShoppingList()">
                        <span class="btn-icon">🖨️</span>
                        Print
                    </button>
                    <button class="close-modal" onclick="this.closest('.modal').remove()">×</button>
                </div>
            </div>
            <div class="modal-body">
                <div class="shopping-list-header">
                    <p class="shopping-date">For ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    <p class="shopping-meals">Breakfast, Lunch & Dinner</p>
                </div>
                
                <div class="shopping-categories">
                    ${Object.entries(groupedIngredients).map(([category, items]) => `
                        <div class="category-section">
                            <h3 class="category-title">${category}</h3>
                            <div class="shopping-items">
                                ${items.map((item, index) => `
                                    <div class="shopping-item" data-id="${category}-${index}">
                                        <label class="item-checkbox">
                                            <input type="checkbox" onchange="toggleShoppingItem(this)">
                                            <span class="item-text">${item.ingredient}</span>
                                        </label>
                                        <span class="item-meal">${item.meal}</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <div class="shopping-footer">
                    <p class="items-count">Total items: <span id="totalItems">${ingredients.length}</span></p>
                    <p class="checked-count">Checked: <span id="checkedItems">0</span></p>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function groupIngredientsByCategory(ingredients) {
    // Simple categorization based on common ingredient patterns
    const categories = {
        'Produce': [],
        'Proteins': [],
        'Dairy & Eggs': [],
        'Grains & Bread': [],
        'Pantry Staples': [],
        'Other': []
    };
    
    ingredients.forEach(item => {
        const ing = item.ingredient.toLowerCase();
        
        if (ing.match(/chicken|beef|pork|fish|salmon|tuna|shrimp|turkey|lamb|tofu/)) {
            categories['Proteins'].push(item);
        } else if (ing.match(/milk|cheese|yogurt|cream|butter|egg/)) {
            categories['Dairy & Eggs'].push(item);
        } else if (ing.match(/lettuce|tomato|onion|garlic|pepper|carrot|celery|cucumber|spinach|kale|broccoli|potato|mushroom|fruit|apple|banana|berry|lemon|lime/)) {
            categories['Produce'].push(item);
        } else if (ing.match(/bread|pasta|rice|flour|oat|cereal|tortilla|noodle/)) {
            categories['Grains & Bread'].push(item);
        } else if (ing.match(/oil|vinegar|salt|pepper|spice|sugar|honey|sauce|can|jar|stock|broth/)) {
            categories['Pantry Staples'].push(item);
        } else {
            categories['Other'].push(item);
        }
    });
    
    // Remove empty categories
    Object.keys(categories).forEach(key => {
        if (categories[key].length === 0) {
            delete categories[key];
        }
    });
    
    return categories;
}

function toggleShoppingItem(checkbox) {
    const item = checkbox.closest('.shopping-item');
    item.classList.toggle('checked', checkbox.checked);
    
    // Update counts
    const totalChecked = document.querySelectorAll('.shopping-item input:checked').length;
    document.getElementById('checkedItems').textContent = totalChecked;
}

function printShoppingList() {
    window.print();
}

// Store meal plan when loading dashboard
function renderDashboard(mealPlan, totalNutrition, regenerationCount = 0, regenerationLimit = 3) {
    console.log('renderDashboard called with:', { mealPlan, totalNutrition, regenerationCount, regenerationLimit });
    
    // Validate input data
    if (!mealPlan || !totalNutrition) {
        console.error('Invalid data passed to renderDashboard');
        showError('Invalid meal plan data received');
        return;
    }
    
    // Ensure meal plan has the expected structure
    if (!mealPlan.breakfast || !mealPlan.lunch || !mealPlan.dinner) {
        console.error('Meal plan missing required meals:', mealPlan);
        showError('Incomplete meal plan data');
        return;
    }
    
    currentMealPlan = mealPlan; // Store for shopping list
    
    const dashboard = document.getElementById('dashboard');
    if (!dashboard) {
        console.error('Dashboard element not found in renderDashboard!');
        return;
    }
    
    console.log('Dashboard element found:', dashboard);
    
    const today = new Date().toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    
    // Calculate daily targets based on user profile
    const dailyTargets = {
        calories: 2000, // This should come from user profile
        protein: 50,
        carbs: 250,
        fat: 65,
        fiber: 25
    };

    console.log('Setting dashboard innerHTML...');
    dashboard.innerHTML = `
        <div class="dashboard-layout">
            <div class="meals-section">
                <div class="section-header">
                    <h2>Meals</h2>
                    <div class="calories-badge">
                        <span class="icon">🔥</span> ${Math.round(totalNutrition.calories || 0)} Calories
                    </div>
                </div>
                
                <div class="meal-list">
                    ${renderMealItem('Breakfast', mealPlan.breakfast, 'breakfast')}
                    ${renderMealItem('Lunch', mealPlan.lunch, 'lunch')}
                    ${renderMealItem('Dinner', mealPlan.dinner, 'dinner')}
                </div>
                
                <div class="meal-actions">
                    <button id="regenerateBtn" class="btn btn-secondary compact" onclick="regenerateMealPlan()" ${regenerationCount >= regenerationLimit ? 'disabled' : ''}>
                        <span class="btn-icon">🔄</span> Regenerate ${regenerationCount < regenerationLimit ? `(${regenerationLimit - regenerationCount} left)` : '(Limit reached)'}
                    </button>
                    <button class="btn btn-primary compact" onclick="showShoppingList()">
                        <span class="btn-icon">🛒</span> Shopping List
                    </button>
                    <button class="btn btn-secondary compact" onclick="showFavorites()">
                        <span class="btn-icon">❤️</span> My Favorites
                    </button>
                    <button class="btn btn-primary compact" onclick="showWeeklyPlanner()">
                        <span class="btn-icon">📅</span> Weekly Planner
                    </button>
                </div>
            </div>
            
            <div class="nutrition-section">
                <div class="section-header">
                    <h2>Nutrition</h2>
                </div>
                
                <div class="nutrition-chart-container">
                    <canvas id="nutritionPieChart" width="200" height="200"></canvas>
                </div>
                
                <div class="nutrition-details">
                    <table class="nutrition-table">
                        <thead>
                            <tr>
                                <th></th>
                                <th>Totals</th>
                                <th>Target</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><span class="nutrient-label">Calories</span></td>
                                <td class="value">${Math.round(totalNutrition.calories || 0)}</td>
                                <td class="target">${dailyTargets.calories}</td>
                            </tr>
                            <tr class="carbs-row">
                                <td><span class="dot carbs"></span> Carbs</td>
                                <td class="value">${Math.round(totalNutrition.carbs || 0)}g</td>
                                <td class="target">${dailyTargets.carbs}g</td>
                            </tr>
                            <tr class="fat-row">
                                <td><span class="dot fat"></span> Fat</td>
                                <td class="value">${Math.round(totalNutrition.fat || 0)}g</td>
                                <td class="target">${dailyTargets.fat}g</td>
                            </tr>
                            <tr class="protein-row">
                                <td><span class="dot protein"></span> Protein</td>
                                <td class="value">${Math.round(totalNutrition.protein || 0)}g</td>
                                <td class="target">${dailyTargets.protein}g</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
    
    console.log('Dashboard innerHTML set successfully');
    console.log('Dashboard content:', dashboard.innerHTML.substring(0, 200) + '...');
    
    // Create the nutrition pie chart
    setTimeout(() => {
        console.log('Creating nutrition pie chart...');
        createNutritionPieChart(totalNutrition);
    }, 100);
}

// Meal count adjustment function
function adjustMealCount(change) {
    const display = document.getElementById('mealCountDisplay');
    const input = document.getElementById('mealsPerDay');
    let currentCount = parseInt(input.value);
    
    // Adjust count with bounds (minimum 1, maximum 6)
    currentCount = Math.max(1, Math.min(6, currentCount + change));
    
    // Update display and input
    display.textContent = currentCount;
    input.value = currentCount;
}

// Make functions available globally for onclick handlers
window.togglePassword = togglePassword;
window.nextStep = nextStep;
window.prevStep = prevStep;
window.toggleHeightUnit = toggleHeightUnit;
window.toggleWeightUnit = toggleWeightUnit;
window.viewMealDetails = viewMealDetails;
window.regenerateMealPlan = regenerateMealPlan;
window.showShoppingList = showShoppingList;
window.toggleShoppingItem = toggleShoppingItem;
window.printShoppingList = printShoppingList;
window.showMealOptions = showMealOptions;
window.replaceMeal = replaceMeal;
window.addToFavorites = addToFavorites;
window.toggleFavorite = toggleFavorite;
window.showFavorites = showFavorites;
window.removeFavoriteFromList = removeFavoriteFromList;
window.adjustMealCount = adjustMealCount;

// Initialize App
if (authToken) {
    checkUserProfile();
}