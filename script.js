
const $ = id => document.getElementById(id);

const conditions = {
  0: ["Clear sky", "☀️", "clear"],
  1: ["Mainly clear", "🌤️", "clear"],
  2: ["Partly cloudy", "⛅", "clouds"],
  3: ["Overcast", "☁️", "clouds"],
  45: ["Foggy", "🌫️", "fog"],
  48: ["Foggy", "🌫️", "fog"],
  51: ["Light drizzle", "🌦️", "rain"],
  53: ["Drizzle", "🌦️", "rain"],
  55: ["Heavy drizzle", "🌧️", "rain"],
  56: ["Freezing drizzle", "🌧️", "rain"],
  57: ["Freezing drizzle", "🌧️", "rain"],
  61: ["Light rain", "🌦️", "rain"],
  63: ["Rainy", "🌧️", "rain"],
  65: ["Heavy rain", "🌧️", "rain"],
  66: ["Freezing rain", "🌧️", "rain"],
  67: ["Heavy freezing rain", "🌧️", "rain"],
  71: ["Light snow", "🌨️", "snow"],
  73: ["Snowy", "❄️", "snow"],
  75: ["Heavy snow", "❄️", "snow"],
  77: ["Snow grains", "🌨️", "snow"],
  80: ["Rain showers", "🌦️", "rain"],
  81: ["Rain showers", "🌧️", "rain"],
  82: ["Heavy showers", "⛈️", "storm"],
  85: ["Snow showers", "🌨️", "snow"],
  86: ["Heavy snow showers", "❄️", "snow"],
  95: ["Thunderstorm", "⛈️", "storm"],
  96: ["Thunderstorm with hail", "⛈️", "storm"],
  99: ["Thunderstorm with hail", "⛈️", "storm"]
};

const backgrounds = {
  clear: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=2000&q=85",
  clouds: "https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&w=2000&q=85",
  rain: "https://images.unsplash.com/photo-1519692933481-e162a57d6721?auto=format&fit=crop&w=2000&q=85",
  fog: "https://images.unsplash.com/photo-1485236715568-ddc5ee6ca227?auto=format&fit=crop&w=2000&q=85",
  snow: "https://images.unsplash.com/photo-1517299321609-52687d1bc55a?auto=format&fit=crop&w=2000&q=85",
  storm: "https://images.unsplash.com/photo-1605727216801-e27ce1d0cc28?auto=format&fit=crop&w=2000&q=85",
  night: "https://images.unsplash.com/photo-1475274047050-1d0c0975c63e?auto=format&fit=crop&w=2000&q=85"
};

const stateCities = {
  "andhra pradesh": "Amaravati",
  "arunachal pradesh": "Itanagar",
  "assam": "Dispur",
  "bihar": "Patna",
  "chhattisgarh": "Raipur",
  "goa": "Panaji",
  "gujarat": "Gandhinagar",
  "haryana": "Chandigarh",
  "himachal pradesh": "Shimla",
  "jharkhand": "Ranchi",
  "karnataka": "Bengaluru",
  "kerala": "Thiruvananthapuram",
  "madhya pradesh": "Bhopal",
  "maharashtra": "Mumbai",
  "manipur": "Imphal",
  "meghalaya": "Shillong",
  "mizoram": "Aizawl",
  "nagaland": "Kohima",
  "odisha": "Bhubaneswar",
  "punjab": "Chandigarh",
  "rajasthan": "Jaipur",
  "sikkim": "Gangtok",
  "tamil nadu": "Chennai",
  "telangana": "Hyderabad",
  "tripura": "Agartala",
  "uttar pradesh": "Lucknow",
  "uttarakhand": "Dehradun",
  "west bengal": "Kolkata",
  "delhi": "New Delhi",
  "jammu and kashmir": "Srinagar",
  "ladakh": "Leh",
  "puducherry": "Puducherry"
};

function getCondition(code) {
  return conditions[code] || ["Variable conditions", "🌤️", "clouds"];
}

function updateBackground(type, isDay) {
  const key = isDay ? type : "night";
  $("background").style.backgroundImage = `url("${backgrounds[key] || backgrounds.clear}")`;
}

function showStatus(message, error = false) {
  $("statusMessage").textContent = message;
  $("statusMessage").style.color = error ? "#ffc5c5" : "#e0e9ff";
}

function formatDate(date, options) {
  return new Date(date + "T12:00:00").toLocaleDateString(undefined, options);
}

async function findPlace(query) {
  const key = query.trim().toLowerCase();
  const search = stateCities[key] || query.trim();

  const url = "https://geocoding-api.open-meteo.com/v1/search?name=" +
    encodeURIComponent(search) + "&count=10&language=en&format=json";

  const response = await fetch(url);
  if (!response.ok) throw new Error("Location search is unavailable. Try again.");

  const result = await response.json();
  if (!result.results?.length) {
    throw new Error("Place not found. Please try another city or state.");
  }

  return result.results.find(p => p.name.toLowerCase() === search.toLowerCase())
    || result.results[0];
}

async function fetchWeather(place) {
  const params = new URLSearchParams({
    latitude: place.latitude,
    longitude: place.longitude,
    current: [
      "temperature_2m",
      "relative_humidity_2m",
      "apparent_temperature",
      "is_day",
      "precipitation",
      "weather_code",
      "wind_speed_10m"
    ].join(","),
    daily: [
      "weather_code",
      "temperature_2m_max",
      "temperature_2m_min",
      "precipitation_sum",
      "uv_index_max"
    ].join(","),
    forecast_days: "5",
    timezone: "auto"
  });

  const response = await fetch(
    "https://api.open-meteo.com/v1/forecast?" + params
  );

  if (!response.ok) throw new Error("Weather data unavailable. Please try again.");
  return response.json();
}

function renderForecast(daily) {
  $("forecast").innerHTML = daily.time.map((date, i) => {
    const [description, icon] = getCondition(daily.weather_code[i]);
    const day = i === 0
      ? "Today"
      : formatDate(date, { weekday: "short" });

    const dateLabel = formatDate(date, {
      day: "numeric",
      month: "short"
    });

    return `
      <div class="forecast-day">
        <div class="day-name">${day}</div>
        <div class="day-date">${dateLabel}</div>
        <div class="day-icon">${icon}</div>
        <div class="day-description">${description}</div>
        <div class="day-temps">
          <span>${Math.round(daily.temperature_2m_max[i])}°</span>
          <span class="low">${Math.round(daily.temperature_2m_min[i])}°</span>
        </div>
      </div>
    `;
  }).join("");
}

function renderWeather(place, data) {
  const c = data.current;
  const d = data.daily;
  const [description, icon, type] = getCondition(c.weather_code);

  updateBackground(type, c.is_day === 1);

  $("cityName").textContent = [place.name, place.admin1]
    .filter((v, i, a) => v && a.indexOf(v) === i)
    .join(", ");

  $("currentDate").textContent = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric"
  });

  $("weatherIcon").textContent = icon;
  $("temperature").textContent = Math.round(c.temperature_2m) + "°";
  $("description").textContent = description;
  $("feelsLike").textContent = Math.round(c.apparent_temperature) + "°";
  $("humidity").textContent = Math.round(c.relative_humidity_2m) + "%";
  $("windSpeed").textContent = Math.round(c.wind_speed_10m) + " km/h";
  $("precipitation").textContent = Number(c.precipitation).toFixed(1) + " mm";
  $("uvIndex").textContent = Number.isFinite(d.uv_index_max?.[0])
    ? d.uv_index_max[0].toFixed(1)
    : "—";

  renderForecast(d);

  $("welcomeCard").hidden = true;
  $("weatherResult").hidden = false;
  showStatus("Weather updated for " + place.name + ".");
}

async function searchWeather(query) {
  if (!query.trim()) {
    showStatus("Please enter a city or state.", true);
    return;
  }

  const button = $("searchBtn");
  button.disabled = true;
  button.textContent = "Loading…";
  showStatus("Finding your sky…");

  try {
    const place = await findPlace(query);
    const weather = await fetchWeather(place);
    renderWeather(place, weather);
  } catch (error) {
    showStatus(error.message || "Something went wrong. Please try again.", true);
  } finally {
    button.disabled = false;
    button.textContent = "Explore ↗";
  }
}

$("searchForm").addEventListener("submit", event => {
  event.preventDefault();
  searchWeather($("cityInput").value);
});

document.querySelectorAll("[data-city]").forEach(button => {
  button.addEventListener("click", () => {
    $("cityInput").value = button.dataset.city;
    searchWeather(button.dataset.city);
  });
});

$("year").textContent = new Date().getFullYear();

// Load a default location automatically.
searchWeather("Bengaluru");
