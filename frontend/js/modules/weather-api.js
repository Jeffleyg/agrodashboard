const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api';

export async function fetchWeatherData(city) {
    try {
        const response = await fetch(`${API_BASE_URL}/weather?city=${encodeURIComponent(city)}`);
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Erro ao buscar dados');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Erro ao buscar dados:', error);
        throw error;
    }
}

export function processForecastData(forecastList) {
    const dailyForecast = {};
    
    forecastList.forEach(item => {
        const date = new Date(item.dt * 1000);
        const day = date.toLocaleDateString('pt-BR', { weekday: 'short' });
        
        if (!dailyForecast[day] || date.getHours() === 12) {
            dailyForecast[day] = {
                temp: Math.round(item.main.temp),
                humidity: item.main.humidity,
                wind_speed: (item.wind.speed * 3.6).toFixed(1),
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