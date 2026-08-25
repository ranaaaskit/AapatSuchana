export async function getWeatherRisk(lat, lng) {
  const params = new URLSearchParams({ latitude: String(lat), longitude: String(lng), hourly: 'precipitation,soil_moisture_0_to_7cm', forecast_days: '1', timezone: 'Asia/Kathmandu' })
  const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`)
  if (!response.ok) throw new Error('Live weather is unavailable right now.')
  const data = await response.json()
  const rain = (data.hourly?.precipitation || []).reduce((sum, value) => sum + value, 0)
  const soil = data.hourly?.soil_moisture_0_to_7cm || []
  const moisture = soil.length ? soil.reduce((sum, value) => sum + value, 0) / soil.length : 0
  return { precipitation: rain, soilMoisture: moisture, risk: rain > 100 ? 'High Risk' : rain > 50 ? 'Moderate Risk' : 'Low Risk' }
}

export async function getCurrentWeather(lat, lng) {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lng),
    current: 'precipitation,relative_humidity_2m,wind_speed_10m',
    wind_speed_unit: 'kmh',
    timezone: 'Asia/Kathmandu',
  })
  const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`)
  if (!response.ok) throw new Error('Live weather is unavailable right now.')

  const data = await response.json()
  const current = data.current
  if (!current) throw new Error('Live weather data is incomplete.')

  const rainfallVolume = Number(current.precipitation)
  const humidity = Number(current.relative_humidity_2m)
  const windSpeed = Number(current.wind_speed_10m)
  if (![rainfallVolume, humidity, windSpeed].every(Number.isFinite)) {
    throw new Error('Live weather data is incomplete.')
  }

  return {
    rainfallVolume,
    humidity,
    windSpeed,
    risk: rainfallVolume > 10 ? 'High Risk' : rainfallVolume > 2 ? 'Moderate Risk' : 'Low Risk',
  }
}
