// WeatherAPI key
const API_KEY = 'f1fa3ed9cf04414daff54634251209';

// Elements
const locBtn = document.getElementById('loc-btn');
const searchBtn = document.getElementById('search-btn');
const cityInput = document.getElementById('city-input');
const alertArea = document.getElementById('alert-area');

const locationName = document.getElementById('location-name');
const localTime = document.getElementById('local-time');
const tempEl = document.getElementById('temp');
const descEl = document.getElementById('desc');
const feelsEl = document.getElementById('feels');
const humidityEl = document.getElementById('humidity');
const windEl = document.getElementById('wind');
const weatherIcon = document.getElementById('weather-icon');

const sunriseEl = document.getElementById('sunrise');
const sunsetEl = document.getElementById('sunset');
const cloudinessEl = document.getElementById('cloudiness');
const pressureEl = document.getElementById('pressure');

const forecastContainer = document.getElementById('forecast');

// Utility: show alert
function showAlert(message, type = 'danger', timeout = 4000) {
  alertArea.innerHTML = `
    <div class="alert alert-${type} alert-dismissible fade show" role="alert">
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>`;
  if (timeout) setTimeout(() => {
    const a = alertArea.querySelector('.alert');
    if (a) a.classList.remove('show');
  }, timeout);
}

// Fetch weather by city
async function fetchWeatherByCity(city) {
  if (!city) return showAlert('Please enter a city name', 'warning');
  try {
    const url = `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${encodeURIComponent(city)}&days=5&aqi=no&alerts=no`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch weather');
    const data = await res.json();
    displayWeather(data);
  } catch (err) {
    showAlert(err.message, 'danger');
    console.error(err);
  }
}

// Fetch weather by coordinates
async function fetchWeatherByCoords(lat, lon) {
  try {
    const url = `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${lat},${lon}&days=5&aqi=no&alerts=no`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch weather');
    const data = await res.json();
    displayWeather(data);
  } catch (err) {
    showAlert(err.message, 'danger');
    console.error(err);
  }
}

// Display weather (current + forecast)
function displayWeather(data) {
  const current = data.current;
  const loc = data.location;
  const forecast = data.forecast.forecastday;

  // Current weather
  locationName.textContent = `${loc.name}, ${loc.country}`;
  localTime.textContent = `Local time: ${loc.localtime}`;
  tempEl.textContent = `${current.temp_c}°C`;
  descEl.textContent = current.condition.text;
  feelsEl.textContent = `${current.feelslike_c}°C`;
  humidityEl.textContent = `${current.humidity}%`;
  windEl.textContent = `${current.wind_kph} kph`;
  weatherIcon.src = `https:${current.condition.icon}`;
  weatherIcon.alt = current.condition.text;

  sunriseEl.textContent = forecast[0].astro.sunrise;
  sunsetEl.textContent = forecast[0].astro.sunset;
  cloudinessEl.textContent = `${current.cloud}%`;
  pressureEl.textContent = `${current.pressure_mb} mb`;

  // Forecast
  forecastContainer.innerHTML = '';
  forecast.forEach(day => {
    const card = document.createElement('div');
    card.className = 'day-card text-center p-2 border rounded shadow-sm';
    card.style.minWidth = '100px';
    card.innerHTML = `
      <div class="small text-muted">${day.date}</div>
      <img src="https:${day.day.condition.icon}" alt="${day.day.condition.text}" />
      <div class="fw-bold">${day.day.avgtemp_c}°C</div>
      <div class="small text-capitalize">${day.day.condition.text}</div>
      <div class="small text-muted mt-1">H:${day.day.maxtemp_c} L:${day.day.mintemp_c}</div>
    `;
    forecastContainer.appendChild(card);
  });
}

// Geolocation flow
function tryUseGeolocation() {
  if (!navigator.geolocation) {
    showAlert('Geolocation is not supported by your browser', 'warning');
    return;
  }
  showAlert('Detecting location…', 'info', 1500);
  navigator.geolocation.getCurrentPosition(
    pos => {
      const { latitude, longitude } = pos.coords;
      fetchWeatherByCoords(latitude, longitude);
    },
    err => {
      console.error(err);
      showAlert('Unable to get your location. Try allowing location access or search by city.', 'warning');
    },
    { timeout: 8000 }
  );
}

// Event listeners
locBtn.addEventListener('click', tryUseGeolocation);
searchBtn.addEventListener('click', () => fetchWeatherByCity(cityInput.value.trim()));
cityInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') fetchWeatherByCity(cityInput.value.trim()); });

// On first load
window.addEventListener('load', () => {
  tryUseGeolocation();
});
