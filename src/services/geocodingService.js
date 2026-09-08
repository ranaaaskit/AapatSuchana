export async function searchNepalLocations(query, signal) {
  const params = new URLSearchParams({ format: 'json', limit: '5', q: `${query}, Nepal`, addressdetails: '1' })
  const response = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, { signal, headers: { 'User-Agent': 'AapatSuchana/1.0 community safety map' } })
  if (!response.ok) throw new Error('Location search is unavailable right now.')
  const results = await response.json()
  if (!results.length) throw new Error('No Nepal location found. Try a nearby city or landmark.')
  return results.map((result) => ({ lat: Number(result.lat), lng: Number(result.lon), label: result.display_name }))
}

export async function searchNepalLocation(query) {
  const results = await searchNepalLocations(query)
  return results[0]
}
