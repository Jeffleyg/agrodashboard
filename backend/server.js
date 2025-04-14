require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuração
app.use(cors());
app.use(express.json());

// Variáveis de ambiente
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
if (!OPENWEATHER_API_KEY) {
    console.error("Erro: Chave API do OpenWeather não configurada!");
    process.exit(1);
}

// Rota para buscar dados meteorológicos
app.get('/api/weather', async (req, res) => {
    try {
        const { city } = req.query;
        
        if (!city) {
            return res.status(400).json({ error: "O parâmetro 'city' é obrigatório" });
        }

        // Busca dados atuais
        const currentUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&lang=pt_br&appid=${OPENWEATHER_API_KEY}`;
        const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&units=metric&lang=pt_br&appid=${OPENWEATHER_API_KEY}`;

        const [currentResponse, forecastResponse] = await Promise.all([
            axios.get(currentUrl),
            axios.get(forecastUrl)
        ]);

        // Processa os dados
        const weatherData = {
            city: currentResponse.data.name,
            current: {
                temp: Math.round(currentResponse.data.main.temp),
                humidity: currentResponse.data.main.humidity,
                feels_like: Math.round(currentResponse.data.main.feels_like),
                description: currentResponse.data.weather[0].description,
                icon: currentResponse.data.weather[0].icon,
                wind_speed: (currentResponse.data.wind.speed * 3.6).toFixed(1),
                pressure: currentResponse.data.main.pressure,
                sunrise: new Date(currentResponse.data.sys.sunrise * 1000).toLocaleTimeString('pt-BR'),
                sunset: new Date(currentResponse.data.sys.sunset * 1000).toLocaleTimeString('pt-BR')
            },
            forecast: processForecastData(forecastResponse.data.list)
        };

        res.json(weatherData);
    } catch (error) {
        console.error("Erro no servidor:", error.message);
        
        let status = 500;
        let message = "Erro ao buscar dados meteorológicos";
        
        if (error.response) {
            status = error.response.status;
            if (status === 404) message = "Cidade não encontrada";
            if (status === 401) message = "Chave API inválida";
        }
        
        res.status(status).json({ error: message });
    }
});

function processForecastData(forecastList) {
    const dailyForecast = {};
    
    forecastList.forEach(item => {
        const date = new Date(item.dt * 1000);
        const day = date.toLocaleDateString('pt-BR', { weekday: 'short' });
        
        if (!dailyForecast[day] || date.getHours() === 12) {
            dailyForecast[day] = {
                temp: Math.round(item.main.temp),
                humidity: item.main.humidity,
                description: item.weather[0].description,
                icon: item.weather[0].icon,
                date: date.toLocaleDateString('pt-BR')
            };
        }
    });
    
    return Object.entries(dailyForecast).slice(0, 7).map(([day, data]) => ({
        day, ...data
    }));
}

// Inicia o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});