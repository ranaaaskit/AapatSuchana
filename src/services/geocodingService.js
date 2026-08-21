export async function searchNepalLocation(query) {
  const params = new URLSearchParams({ format: 'json', limit: '1', q: `${query}, Nepal` })
  const response = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, { headers: { 'User-Agent': 'AapatSuchana/1.0 community safety map' } })
  if (!response.ok) throw new Error('Location search is unavailable right now.')
  const results = await response.json()
  if (!results.length) throw new Error('No Nepal location found. Try a nearby city or landmark.')
  return { lat: Number(results[0].lat), lng: Number(results[0].lon), label: results[0].display_name }
}
