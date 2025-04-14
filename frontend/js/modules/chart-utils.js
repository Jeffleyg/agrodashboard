export function createWeatherChart(ctx, forecastData, type = 'temperature') {
    const datasets = [];
    const colors = {
        temperature: { border: '#4361ee', background: 'rgba(67, 97, 238, 0.1)' },
        humidity: { border: '#4cc9f0', background: 'rgba(76, 201, 240, 0.1)' },
        wind: { border: '#f8961e', background: 'rgba(248, 150, 30, 0.1)' }
    };

    if (type === 'temperature') {
        datasets.push({
            label: 'Temperatura (°C)',
            data: forecastData.map(item => item.temp),
            borderColor: colors.temperature.border,
            backgroundColor: colors.temperature.background,
            tension: 0.3,
            yAxisID: 'y'
        });
    }

    if (type === 'humidity') {
        datasets.push({
            label: 'Umidade (%)',
            data: forecastData.map(item => item.humidity),
            borderColor: colors.humidity.border,
            backgroundColor: colors.humidity.background,
            tension: 0.3,
            yAxisID: 'y'
        });
    }

    if (type === 'wind') {
        datasets.push({
            label: 'Vento (km/h)',
            data: forecastData.map(item => item.wind_speed),
            borderColor: colors.wind.border,
            backgroundColor: colors.wind.background,
            tension: 0.3,
            yAxisID: 'y'
        });
    }

    return new Chart(ctx, {
        type: 'line',
        data: {
            labels: forecastData.map(item => item.day),
            datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    callbacks: {
                        afterBody: function(context) {
                            const index = context[0].dataIndex;
                            return `Condição: ${forecastData[index].description}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: type !== 'temperature',
                    title: {
                        display: true,
                        text: type === 'temperature' ? 'Temperatura (°C)' : 
                              type === 'humidity' ? 'Umidade (%)' : 'Vento (km/h)'
                    }
                }
            }
        }
    });
}