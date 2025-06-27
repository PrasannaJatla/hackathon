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
    
    const ingredients = meal.ingredients ? JSON.parse(meal.ingredients) : [];
    const instructions = meal.instructions ? JSON.parse(meal.instructions) : [];
    
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
            const ingredients = meal.ingredients ? JSON.parse(meal.ingredients) : [];
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