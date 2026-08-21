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
