
const apiKey = 'd31e50190104c1c8594466f52a759f12';
let unit = 'metric';


const citySearch = document.getElementById('city-search');
const searchButton = document.getElementById('search-button');
const locationButton = document.getElementById('location-button');
const unitToggle = document.getElementById('unit-toggle');
const cityName = document.getElementById('city-name');
const mainTemp = document.getElementById('main-temp');
const weatherDescription = document.getElementById('weather-description');
const feelsLikeTemp = document.getElementById('feels-like-temp');
const precipitationValue = document.getElementById('precipitation-value');
const visibilityValue = document.getElementById('visibility-value');
const humidityValue = document.getElementById('humidity-value');
const uvIndexValue = document.getElementById('uv-index-value');
const windSpeed = document.getElementById('wind-speed');
const windGusts = document.getElementById('wind-gusts');
const hourlyForecastContainer = document.getElementById('hourly-forecast-container');
const dailyForecastContainer = document.getElementById('daily-forecast-container');

// берет данные смотря какой город введ
async function fetchWeather(city) {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=${unit}`;
    const response = await fetch(url);
    const data = await response.json();
    displayCurrentWeather(data);
}

// показывает все на 5 дней вперед
async function fetchForecast(city) {
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=${unit}`;
    const response = await fetch(url);
    const data = await response.json();
    displayForecast(data);
}

// тут берет данныке то есть локацию
async function fetchWeatherByLocation(lat, lon) {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${unit}`;
    const response = await fetch(url);
    const data = await response.json();
    displayCurrentWeather(data);
}

async function fetchForecastByLocation(lat, lon) {
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${unit}`;
    const response = await fetch(url);
    const data = await response.json();
    displayForecast(data);
}

// показывает данные о сегоднешней погоде
function displayCurrentWeather(data) {
    cityName.textContent = data.name;
    mainTemp.textContent = `${Math.round(data.main.temp)}°`;
    weatherDescription.textContent = data.weather[0].description;
    feelsLikeTemp.textContent = `${Math.round(data.main.feels_like)}°`;
    humidityValue.textContent = `${data.main.humidity}%`;
    visibilityValue.textContent = `${data.visibility / 1000} km`;
    windSpeed.textContent = `${Math.round(data.wind.speed)} ${unit === 'metric' ? 'm/s' : 'mph'}`;
    windGusts.textContent = `${Math.round(data.wind.gust || 0)} ${unit === 'metric' ? 'm/s' : 'mph'}`;
    // Assume UV index and precipitation will be fetched separately if available
}

// а тут по часавой на 5 часов
function displayForecast(data) {

    hourlyForecastContainer.innerHTML = '';
    dailyForecastContainer.innerHTML = '';


    for (let i = 0; i < 8; i++) {
        const hourData = data.list[i];
        const hourElement = document.createElement('div');
        hourElement.classList.add('forecast-hour');

        const iconUrl = `http://openweathermap.org/img/wn/${hourData.weather[0].icon}@2x.png`;

        hourElement.innerHTML = `
            <img src="${iconUrl}" alt="${hourData.weather[0].description}">
            <div>${new Date(hourData.dt_txt).getHours()}:00</div>
            <div>${Math.round(hourData.main.temp)}°</div>
        `;
        hourlyForecastContainer.appendChild(hourElement);
    }


    const dailyData = data.list.filter(entry => entry.dt_txt.includes("12:00:00")).slice(0, 5);
    dailyData.forEach(dayData => {
        const dayElement = document.createElement('div');
        dayElement.classList.add('forecast-day');

        const iconUrl = `http://openweathermap.org/img/wn/${dayData.weather[0].icon}@2x.png`;

        dayElement.innerHTML = `
            <img src="${iconUrl}" alt="${dayData.weather[0].description}">
            <div>${new Date(dayData.dt_txt).toLocaleDateString('en', { weekday: 'short' })}</div>
            <div>${Math.round(dayData.main.temp)}°</div>
        `;
        dailyForecastContainer.appendChild(dayElement);
    });
}

// запрашивает местоположения
window.onload = () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                const { latitude, longitude } = position.coords;
                fetchWeatherByLocation(latitude, longitude);
                fetchForecastByLocation(latitude, longitude);
            },
            error => {
                console.error("Error getting location:", error);
                alert("Location access denied. You can still search for weather by city.");
            }
        );
    } else {
        alert("Geolocation is not supported by your browser.");
    }
};


searchButton.addEventListener('click', () => {
    const city = citySearch.value.trim();
    if (city) {
        fetchWeather(city);
        fetchForecast(city);
    }
});

unitToggle.addEventListener('change', () => {
    unit = unitToggle.value;
    const city = cityName.textContent;
    if (city !== 'City Name') {
        fetchWeather(city);
        fetchForecast(city);
    }
});
