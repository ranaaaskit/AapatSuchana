const locations = [
  { name: 'Kathmandu Valley', lat: 27.7172, lng: 85.324 },
  { name: 'Pokhara Valley', lat: 28.2096, lng: 83.9856 },
  { name: 'Chitwan', lat: 27.5291, lng: 84.3542 },
  { name: 'Sindhupalchok', lat: 27.951, lng: 85.684 },
  { name: 'Koshi corridor', lat: 26.67, lng: 87.28 },
]

function sum(values = []) {
  return values.reduce((total, value) => total + (Number(value) || 0), 0)
}

export async function fetchLiveHazards() {
  const results = await Promise.allSettled(locations.map(async (location) => {
    const params = new URLSearchParams({
      latitude: String(location.lat),
      longitude: String(location.lng),
      current: 'precipitation,rain,showers,soil_moisture_0_to_7cm',
      hourly: 'precipitation,soil_moisture_0_to_7cm',
      forecast_days: '1',
      timezone: 'Asia/Kathmandu',
    })
    const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`)
    if (!response.ok) throw new Error('Open-Meteo hazard data unavailable')
    const data = await response.json()
    const hourlyRain = data.hourly?.precipitation || []
    const rain6h = sum(hourlyRain.slice(0, 6))
    const rain24h = sum(hourlyRain)
    const soilValues = data.hourly?.soil_moisture_0_to_7cm || []
    const soilMoisture = soilValues.length ? sum(soilValues.slice(0, 6)) / Math.min(soilValues.length, 6) : 0
    const currentRain = Number(data.current?.precipitation) || 0
    const floodScore = Math.min(100, rain24h * 1.8 + currentRain * 8)
    const landslideScore = Math.min(100, rain6h * 2.8 + soilMoisture * 160)
    const signals = []
    if (floodScore >= 45) signals.push({ type: 'Flood', score: floodScore, reason: `${rain24h.toFixed(1)} mm forecast rain` })
    if (landslideScore >= 48) signals.push({ type: 'Landslide', score: landslideScore, reason: `${(soilMoisture * 100).toFixed(0)}% soil moisture` })
    return signals.map((signal) => ({
      id: `open-meteo-${signal.type.toLowerCase()}-${location.name.toLowerCase().replaceAll(' ', '-')}`,
      title: `${signal.type} risk signal: ${location.name}`,
      type: signal.type,
      severity: signal.score >= 75 ? 'High' : signal.score >= 55 ? 'Medium' : 'Low',
      lat: location.lat,
      lng: location.lng,
      description: `Automated weather signal from Open-Meteo: ${signal.reason}, ${rain6h.toFixed(1)} mm in the next 6 hours. Confirm local conditions before responding.`,
      source: 'Open-Meteo weather signal',
      external: true,
      created_at: new Date().toISOString(),
    }))
  }))
  return results.flatMap((result) => result.status === 'fulfilled' ? result.value : [])
}
