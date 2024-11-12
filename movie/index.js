const apiKey = 'daf3d78ed92e3efd339b408a52740b49';
const baseURL = 'https://api.themoviedb.org/3';

const searchInput = document.getElementById('search');
const moviesGrid = document.getElementById('movies-grid');
const modal = document.getElementById('movie-modal');
const modalContent = document.querySelector('.modal-content');
const sortBySelect = document.getElementById('sort-by');
const viewWatchlistBtn = document.getElementById('view-watchlist-btn');

let currentQuery = '';
let currentSort = 'popularity.desc';
let watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];

// Загрузка популярных фильмов при загрузке страницы
window.addEventListener('DOMContentLoaded', fetchPopularMovies);


// Обработка ввода в поле поиска
searchInput.addEventListener('input', async () => {
    currentQuery = searchInput.value.trim();
    if (currentQuery.length > 2) {
        await fetchMoviesBySearch(currentQuery);
    } else {
        moviesGrid.innerHTML = ''; // Clear the movie grid if input is empty
    }
});

sortBySelect.addEventListener('change', async () => {
    currentSort = sortBySelect.value;
    if (currentQuery.length > 2) {
        await fetchMoviesBySearch(currentQuery);
    } else {
        await fetchMoviesBySort(currentSort);
    }
});

// Показ списка watchlist по клику на кнопку
viewWatchlistBtn.addEventListener('click', displayWatchlist);


// Функция для получения популярных фильмов
async function fetchPopularMovies() {
    try {
        const url = `${baseURL}/movie/popular?api_key=${apiKey}`;
        const response = await fetch(url);
        const data = await response.json();
        if (data.results?.length) {
            displayMovies(data.results);
        } else {
            moviesGrid.innerHTML = '<p>No popular movies found.</p>';
        }
    } catch (error) {
        handleError('Error fetching popular movies.');
    }
}
// Функция для поиска фильмов
async function fetchMoviesBySearch(query) {
    try {
        const url = `${baseURL}/search/movie?query=${encodeURIComponent(query)}&api_key=${apiKey}`;
        const response = await fetch(url);
        const data = await response.json();
        if (data.results?.length) {
            displayMovies(data.results);
        } else {
            moviesGrid.innerHTML = '<p>No movies found.</p>';
        }
    } catch (error) {
        handleError('Error fetching movies by search.');
    }
}

// Функция для получения фильмов с сортировкой
async function fetchMoviesBySort(sort) {
    try {
        const url = `${baseURL}/discover/movie?sort_by=${sort}&api_key=${apiKey}`;
        const response = await fetch(url);
        const data = await response.json();
        if (data.results?.length) {
            displayMovies(data.results);
        } else {
            moviesGrid.innerHTML = '<p>No movies found.</p>';
        }
    } catch (error) {
        handleError('Error fetching movies by sort.');
    }
}

function displayMovies(movies) {
    moviesGrid.innerHTML = '';
    movies.forEach(movie => {
        const movieCard = document.createElement('div');
        movieCard.classList.add('movie-card');
        movieCard.innerHTML = `
            <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}">
            <h3>${movie.title}</h3>
            <p>${movie.release_date}</p>
        `;
        movieCard.addEventListener('click', () => fetchMovieDetails(movie));
        moviesGrid.appendChild(movieCard);
    });
}

async function fetchMovieDetails(movie) {
    try {
        const detailsUrl = `${baseURL}/movie/${movie.id}?api_key=${apiKey}`;
        const creditsUrl = `${baseURL}/movie/${movie.id}/credits?api_key=${apiKey}`;
        const videosUrl = `${baseURL}/movie/${movie.id}/videos?api_key=${apiKey}`;

        const [detailsResponse, creditsResponse, videosResponse] = await Promise.all([
            fetch(detailsUrl),
            fetch(creditsUrl),
            fetch(videosUrl),
        ]);

        const details = await detailsResponse.json();
        const credits = await creditsResponse.json();
        const videos = await videosResponse.json();

        displayMovieDetails(details, credits, videos);
    } catch (error) {
        handleError('Error fetching movie details.');
    }
}

function displayMovieDetails(details, credits, videos) {
    const cast = credits.cast.slice(0, 5).map(actor => actor.name).join(', ');
    const trailer = videos.results.find(video => video.type === 'Trailer');
    const trailerIframe = trailer
        ? `<iframe width="100%" height="315" src="https://www.youtube.com/embed/${trailer.key}" frameborder="0" allowfullscreen></iframe>`
        : '<p>No trailer available.</p>';

    const isInWatchlist = watchlist.some(item => item.id === details.id);
    const watchlistButton = `
        <button id="watchlist-btn">
            ${isInWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
        </button>
    `;

    modalContent.innerHTML = `
        <h2>${details.title}</h2>
        <p><strong>Overview:</strong> ${details.overview}</p>
        <p><strong>Rating:</strong> ${details.vote_average}</p>
        <p><strong>Cast:</strong> ${cast}</p>
        <div>${trailerIframe}</div>
        ${watchlistButton}
        <button class="close-modal" onclick="closeModal()">Close</button>
    `;

    document.getElementById('watchlist-btn').addEventListener('click', () => toggleWatchlist(details));
    modal.style.display = 'flex';
}

function toggleWatchlist(movie) {
    const isInWatchlist = watchlist.some(item => item.id === movie.id);
    if (isInWatchlist) {
        watchlist = watchlist.filter(item => item.id !== movie.id);
        showToast(`${movie.title} removed from watchlist.`);
    } else {
        watchlist.push(movie);
        showToast(`${movie.title} added to watchlist.`);
    }
    localStorage.setItem('watchlist', JSON.stringify(watchlist));
}


function displayWatchlist() {
    moviesGrid.innerHTML = '';
    if (watchlist.length === 0) {
        moviesGrid.innerHTML = '<p>Your watchlist is empty.</p>';
        return;
    }

    watchlist.forEach(movie => {
        const movieCard = document.createElement('div');
        movieCard.classList.add('movie-card');
        movieCard.innerHTML = `
            <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}">
            <h3>${movie.title}</h3>
            <button class="remove-btn">Remove from Watchlist</button>
        `;

        movieCard.querySelector('.remove-btn').addEventListener('click', () => {
            toggleWatchlist(movie);
            displayWatchlist();
        });

        moviesGrid.appendChild(movieCard);
    });
}

function handleError(message) {
    console.error(message);
    moviesGrid.innerHTML = `<p>${message}</p>`;
}

function closeModal() {
    modal.style.display = 'none';
}

function showToast(message) {
    const toastContainer = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.classList.add('toast');
    toast.textContent = message;

    toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}
