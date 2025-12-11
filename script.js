const cityValueInput = document.getElementById("cityValueInput");
const weatherBtn = document.getElementById("weatherBtn");
const weatherInfo = document.getElementById("weatherInfo");
const geoWeatherBtn = document.getElementById("geoWeatherBtn");
const history = document.getElementById("history");

document.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("weather")) {
    const data = JSON.parse(localStorage.getItem("weather"));
    displayWeather(data);
  }
  if (!localStorage.getItem("searchHistory")) {
    localStorage.setItem("searchHistory", JSON.stringify([]));
  }
});

weatherBtn.onclick = async () => await getWeather(cityValueInput.value.trim());

async function getWeather(city) {
  const lang = document.getElementById("langSelect").value;
  try {
    displayWeather(
      await fetchWeather(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric&lang=${lang}`
      )
    );
  } catch (error) {
    weatherInfo.innerHTML = `<p>Не удалось получить погоду</p>`;
  }
}

geoWeatherBtn.onclick = async () => {
  try {
    // 1. Получаем координаты
    const position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    });
    const lang = document.getElementById("langSelect").value;
    const { latitude, longitude } = position.coords;
    // 2. Делаем запрос в погоду по координатам
    displayWeather(
      await fetchWeather(
        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric&lang=${lang}`
      )
    );
  } catch (err) {
    weatherInfo.innerHTML = `<p>Не удалось получить геолокацию</p>`;
  }
};

async function fetchWeather(url) {
  try {
    weatherInfo.innerHTML = `<div class="spinner-border text-primary" role="status">
    <span class="visually-hidden">Loading...</span>
    </div>`;
    // <img src = "./Image20251208130447.gif"/>`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(res.status);
    const data = await res.json();
    localStorage.setItem("weather", JSON.stringify(data));
    pushToHistory("searchHistory", data.name);
    return data;
  } catch (error) {
    weatherInfo.innerHTML = `<p>Не удалось получить геолокацию</p>`;
  }
}

function displayWeather({
  name,
  weather: [{ icon, description }],
  main: { temp, feels_like, humidity },
  wind: { speed },
}) {
  cityValueInput.value = "";
  displayHistory();
  weatherInfo.innerHTML = `
    <p style="text-transform: uppercase;">${name}</p>
    <img class="weather-icon" src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="iconWeatherDescription">
    <p><strong>Температура: </strong>${Math.round(
      temp
    )}°C</p><small><strong>Ощущается как: </strong>${Math.round(
    feels_like
  )}°C</small>
    <p><strong>Описание: </strong>${description}</p>
    <p><strong>Влажность:</strong> ${humidity}%</p>
    <p><strong>Скорость ветра:</strong> ${speed} m/s</p>`;
}

const switcher = document.getElementById("switchCheckDefault");
let changeTheme = false;

switcher.onchange = () => {
  changeTheme = !changeTheme;

  const link = document.getElementById("theme");
  console.log(link);

  if (changeTheme) {
    link.href = "./style.css";
  } else {
    link.href = "./style2.css";
  }
};

function pushToHistory(key, value, limit = 3) {
  const arr = getHistory(key);

  if (!arr.includes(value)) {
    arr.push(value);
  }

  if (arr.length > limit) {
    arr.shift();
  }

  localStorage.setItem(key, JSON.stringify(arr));
}

function getHistory(key) {
  const raw = localStorage.getItem(key);
  return raw ? JSON.parse(raw) : [];
}

function displayHistory() {
  history.innerHTML = "";
  const searchHistory = getHistory("searchHistory");
  console.log(searchHistory.length);  
  for (const city of searchHistory) {
    const btnHistory = document.createElement("button");
    btnHistory.textContent = city;
    btnHistory.style.margin = "5px";
    btnHistory.onclick = async () => await getWeather(city);
    history.appendChild(btnHistory);
  }
}
