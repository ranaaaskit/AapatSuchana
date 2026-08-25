import { useCallback, useEffect, useState } from 'react'
import { getCurrentWeather } from '../services/weatherService'

export function useWeatherData(lat, lng, { enabled = true } = {}) {
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const refetch = useCallback(async () => {
    if (!Number.isFinite(Number(lat)) || !Number.isFinite(Number(lng))) {
      setError('A valid location is required to fetch weather.')
      return
    }

    setLoading(true)
    setError('')

    try {
      setWeather(await getCurrentWeather(lat, lng))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to fetch live weather.')
    } finally {
      setLoading(false)
    }
  }, [lat, lng])

  useEffect(() => {
    if (enabled) refetch()
  }, [enabled, refetch])

  return {
    rainfallVolume: weather?.rainfallVolume ?? null,
    humidity: weather?.humidity ?? null,
    windSpeed: weather?.windSpeed ?? null,
    loading,
    error,
    refetch,
  }
}
