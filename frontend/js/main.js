// Configurações
const API_URL = 'https://weatherpro-backend.onrender.com';
const UPDATE_INTERVAL = 15 * 60 * 1000; // 15 minutos

fetch(`${API_BASE_URL}/api/test`)
  .then(response => console.log('Conexão OK:', response))
  .catch(error => console.error('Falha na conexão:', error));

// Elementos DOM
const elements = {
    cityInput: document.getElementById('city-input'),
    searchBtn: document.getElementById('search-btn'),
    currentWeather: document.getElementById('current-weather'),
    weatherChart: document.getElementById('weather-chart') ? document.getElementById('weather-chart').getContext('2d') : null,
    currentDate: document.getElementById('current-date'),
    updateTime: document.getElementById('update-time'),
    hourlyForecast: document.getElementById('hourly-forecast')
};

// Verificação inicial
if (!elements.weatherChart) {
    console.error('Canvas do gráfico não encontrado!');
}

// Função atualizada para atualizar o tempo
function updateLastUpdated() {
    if (elements.updateTime) {
        elements.updateTime.textContent = `Atualizado: ${new Date().toLocaleTimeString('pt-BR')}`;
    }
}

document.getElementById('current-date').textContent= '...'; // Placeholder para data atual
// Estado da aplicação
const state = {
    currentCity: 'São Paulo',
    weatherData: null,
    chartInstance: null,
    theme: 'light'
};

const element = document.getElementById('some-id')
    if (element) {
        element.textContent = 'Novo contúdo';
    } else {
        console.error('Elemento não encontrado');
}


const dateElement = document.getElementById('current-date');
if (dateElement) {
  dateElement.textContent = new Date().toLocaleString('pt-BR');
} else {
  console.error('Elemento #current-date não encontrado');
}

// Mapeamento de ícones
const weatherIcons = {
    '01d': 'sunny', '01n': 'clear-night',
    '02d': 'partly-cloudy', '02n': 'partly-cloudy-night',
    '03d': 'cloudy', '03n': 'cloudy',
    '04d': 'overcast', '04n': 'overcast',
    '09d': 'rain', '09n': 'rain',
    '10d': 'rain', '10n': 'rain',
    '11d': 'thunderstorm', '11n': 'thunderstorm',
    '13d': 'snow', '13n': 'snow',
    '50d': 'fog', '50n': 'fog'
};

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    // Elementos básicos
    const currentDateElement = document.getElementById('current-date');
    const currentWeatherElement = document.getElementById('current-weather');
    const hourlyForecastElement = document.getElementById('hourly-forecast');
    
    // Verifique se os elementos existem
    if (!currentDateElement || !currentWeatherElement || !hourlyForecastElement) {
        console.error('Elementos essenciais não encontrados!');
        return;
    }
    
    // Atualize a data
    currentDateElement.textContent = new Date().toLocaleString('pt-BR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    // Restante da lógica...
});


// Função de inicialização
function initApp() {
    updateDateTime();
    loadWeatherData(state.currentCity);
    setupEventListeners();
    setupAutoRefresh();
}

// Configura listeners de eventos
function setupEventListeners() {
    elements.searchBtn.addEventListener('click', () => {
        const city = elements.cityInput.value.trim();
        if (city) {
            state.currentCity = city;
            loadWeatherData(city);
        }
    });

    elements.cityInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const city = elements.cityInput.value.trim();
            if (city) {
                state.currentCity = city;
                loadWeatherData(city);
            }
        }
    });
}

// Busca dados meteorológicos
async function loadWeatherData(city) {
    try {
        showLoading();
        
        const response = await fetch(`${API_BASE_URL}/api/weather?city=${encodeURIComponent(city)}`);
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Erro ao buscar dados');
        }
        
        state.weatherData = await response.json();
        updateUI();
        updateLastUpdated();
    } catch (error) {
        console.error('Erro:', error);
        showError(error.message);
    }
}

// Atualiza a interface
function updateUI() {
    if (!state.weatherData) return;
    
    updateCurrentWeather();
    updateForecastChart();
    updateHourlyForecast();
    updateDateTime();
}

// Atualiza o card do tempo atual
function updateCurrentWeather() {
    const { current } = state.weatherData;
    const defaultIcon = 'cloudy';
    
    elements.currentWeather.innerHTML = `
        <div class="weather-card">
            <h3>Temperatura</h3>
            <div class="weather-value">${current.temp}°C</div>
            <div class="weather-detail">
                <img src="./assets/icons/${weatherIcons[current.icon] || defaultIcon}.svg" 
                     alt="${current.description}"
                     onerror="this.src='./assets/icons/${defaultIcon}.svg'">
                <span>${current.description}</span>
            </div>
            <div class="weather-detail">
                <img src="./assets/icons/thermometer.svg" alt="">
                <span>Sensação: ${current.feels_like}°C</span>
            </div>
        </div>
        
        <div class="weather-card">
            <h3>Umidade</h3>
            <div class="weather-value">${current.humidity}%</div>
            <div class="weather-detail">
                <img src="./assets/icons/humidity.svg" alt="">
                <span>Pressão: ${current.pressure} hPa</span>
            </div>
        </div>
        
        <div class="weather-card">
            <h3>Vento & Sol</h3>
            <div class="weather-value">${current.wind_speed} km/h</div>
            <div class="weather-detail">
                <img src="./assets/icons/sunrise.svg" alt="">
                <span>Nascer: ${current.sunrise}</span>
            </div>
            <div class="weather-detail">
                <img src="./assets/icons/sunset.svg" alt="">
                <span>Pôr: ${current.sunset}</span>
            </div>
        </div>
    `;
}

// Atualiza o gráfico de previsão
function updateForecastChart() {
    if (state.chartInstance) {
        state.chartInstance.destroy();
    }
    
    const { forecast } = state.weatherData;
    
    state.chartInstance = new Chart(elements.weatherChart, {
        type: 'line',
        data: {
            labels: forecast.map(item => item.day),
            datasets: [
                {
                    label: 'Temperatura (°C)',
                    data: forecast.map(item => item.temp),
                    borderColor: '#4361ee',
                    backgroundColor: 'rgba(67, 97, 238, 0.1)',
                    borderWidth: 2,
                    tension: 0.3,
                    fill: true,
                    yAxisID: 'y'
                },
                {
                    label: 'Umidade (%)',
                    data: forecast.map(item => item.humidity),
                    borderColor: '#4cc9f0',
                    backgroundColor: 'rgba(76, 201, 240, 0.1)',
                    borderWidth: 2,
                    tension: 0.3,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        padding: 20
                    }
                },
                tooltip: {
                    callbacks: {
                        afterBody: function(context) {
                            const index = context[0].dataIndex;
                            return `Condição: ${forecast[index].description}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Temperatura (°C)'
                    },
                    grid: {
                        drawOnChartArea: true
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    min: 0,
                    max: 100,
                    title: {
                        display: true,
                        text: 'Umidade (%)'
                    },
                    grid: {
                        drawOnChartArea: false
                    }
                }
            }
        }
    });
}

// Atualiza a previsão horária
function updateHourlyForecast() {
    // Implementação simplificada - em produção, use dados reais da API
    const hours = ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00'];
    const temps = [18, 17, 16, 19, 23, 25, 22, 20];
    
    elements.hourlyForecast.innerHTML = hours.map((hour, index) => `
        <div class="hourly-item">
            <span class="hour">${hour}</span>
            <img src="./assets/icons/${index % 2 === 0 ? 'cloudy' : 'partly-cloudy'}.svg" alt="">
            <span class="temp">${temps[index]}°C</span>
        </div>
    `).join('');
}

// Atualiza data e hora
function updateDateTime() {
    const now = new Date();
    elements.currentDate.textContent = now.toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Atualiza hora da última atualização
function updateLastUpdated() {
    elements.updateTime.textContent = new Date().toLocaleTimeString('pt-BR');
}

// Mostra estado de carregamento
function showLoading() {
    elements.currentWeather.innerHTML = `
        <div class="weather-card loading">
            <div class="loading-spinner"></div>
            <p>Carregando dados...</p>
        </div>
    `;
}

// Mostra mensagem de erro
function showError(message) {
    elements.currentWeather.innerHTML = `
        <div class="weather-card error">
            <img src="./assets/icons/error.svg" alt="Erro">
            <h3>Ocorreu um erro</h3>
            <p>${message}</p>
            <button class="btn-retry">Tentar novamente</button>
        </div>
    `;
    
    document.querySelector('.btn-retry').addEventListener('click', () => {
        loadWeatherData(state.currentCity);
    });
}

// Configura atualização automática
function setupAutoRefresh() {
    setInterval(() => {
        loadWeatherData(state.currentCity);
    }, UPDATE_INTERVAL);
}