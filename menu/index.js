

const apiKey = '5f0e28251a284108aa49eab29680bad4';
const searchInput = document.getElementById('searchInput');
const recipeGrid = document.getElementById('recipeGrid');
const recipeModal = document.getElementById('recipeModal');
const closeModal = document.getElementById('closeModal');
const recipeTitle = document.getElementById('recipeTitle');
const recipeImage = document.getElementById('recipeImage');
const ingredientsList = document.getElementById('ingredientsList');
const instructions = document.getElementById('instructions');
const nutrition = document.getElementById('nutrition');
const showFavoritesButton = document.getElementById('showFavoritesButton');

// Возврщает любимые блюда из локалки
const favorites = JSON.parse(localStorage.getItem('favorites')) || [];

// вывод рецептов
async function fetchRecipes(query) {
    const url = `https://api.spoonacular.com/recipes/complexSearch?query=${query}&apiKey=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();
    displayRecipes(data.results);
}

// показывает рецепты блюда
function displayRecipes(recipes) {
    recipeGrid.innerHTML = '';
    recipes.forEach(recipe => {
        const card = document.createElement('div');
        card.classList.add('recipe-card');
        card.innerHTML = `
      <img src="${recipe.image}" alt="${recipe.title}">
      <h3>${recipe.title}</h3>
      <button class="details-btn">View Details</button>
      <button class="favorite-btn">Add to Favorites</button>
    `;


        card.querySelector('.details-btn').addEventListener('click', () => fetchRecipeDetails(recipe.id));
        card.querySelector('.favorite-btn').addEventListener('click', () => saveToFavorites(recipe));

        recipeGrid.appendChild(card);
    });
}


async function fetchRecipeDetails(id) {
    const url = `https://api.spoonacular.com/recipes/${id}/information?includeNutrition=true&apiKey=${apiKey}`;
    const response = await fetch(url);
    const recipe = await response.json();

    recipeTitle.textContent = recipe.title;
    recipeImage.src = recipe.image;
    ingredientsList.innerHTML = recipe.extendedIngredients
        .map(ing => `<li>${ing.original}</li>`)
        .join('');
    instructions.innerHTML = recipe.instructions || 'No instructions available.';
    const calories = recipe.nutrition.nutrients.find(n => n.name === 'Calories');
    nutrition.textContent = calories ? `Calories: ${calories.amount} kcal` : 'No nutritional information available.';


    showModal();
}

// здесь функция который сохраняет в любимые
function saveToFavorites(recipe) {
    if (!favorites.some(fav => fav.id === recipe.id)) {
        favorites.push(recipe);
        localStorage.setItem('favorites', JSON.stringify(favorites));
        alert(`${recipe.title} has been added to your favorites!`);
    } else {
        alert(`${recipe.title} is already in your favorites.`);
    }
}

// показывает любимые блюда
function displayFavorites() {
    recipeGrid.innerHTML = '';
    favorites.forEach(recipe => {
        const card = document.createElement('div');
        card.classList.add('recipe-card');
        card.innerHTML = `
      <img src="${recipe.image}" alt="${recipe.title}">
      <h3>${recipe.title}</h3>
      <p>Ready in ${recipe.readyInMinutes || 'unknown'} minutes</p>
      <button class="details-btn">View Details</button>
      <button class="remove-btn">Remove from Favorites</button>
    `;


        card.querySelector('.details-btn').addEventListener('click', () => fetchRecipeDetails(recipe.id));
        card.querySelector('.remove-btn').addEventListener('click', () => {
            removeFromFavorites(recipe.id);
            displayFavorites();
        });

        recipeGrid.appendChild(card);
    });
}

// Удаляет из любимых
function removeFromFavorites(id) {
    const index = favorites.findIndex(fav => fav.id === id);
    if (index !== -1) {
        favorites.splice(index, 1);
        localStorage.setItem('favorites', JSON.stringify(favorites));
        alert('Recipe removed from favorites.');
    }
}

function showModal() {
    recipeModal.classList.remove('hidden');
    recipeModal.classList.add('visible');
}


function hideModal() {
    recipeModal.classList.add('hidden');
    recipeModal.classList.remove('visible');
}


searchInput.addEventListener('input', () => {
    const query = searchInput.value.trim();
    if (query) fetchRecipes(query);
});

closeModal.addEventListener('click', hideModal);
showFavoritesButton.addEventListener('click', displayFavorites);


window.addEventListener('click', (event) => {
    if (event.target === recipeModal) {
        hideModal();
    }
});

