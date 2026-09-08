const BIPAD_INCIDENT_URL = `${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'}/live-incidents/`
const includedHazards = new Set([1, 11, 17])

const hazardTypes = {
  1: 'Earthquake',
  2: 'Animal incident',
  3: 'Avalanche',
  4: 'Cold wave',
  5: 'Drought',
  6: 'Epidemic',
  7: 'Famine',
  8: 'Forest fire',
  9: 'Hailstorm',
  10: 'Fire',
  11: 'Flood',
  12: 'Heat wave',
  13: 'Lightning',
  14: 'Other',
  15: 'Pollution',
  16: 'Storm',
  17: 'Landslide',
  18: 'Snowfall',
  19: 'Thunderstorm',
  20: 'Windstorm',
}

function getSeverity(incident) {
  const loss = Number(incident.loss) || 0
  if (loss >= 1000000 || incident.verified === false) return 'High'
  if (loss >= 100000 || incident.approved) return 'Medium'
  return 'Low'
}

function normalizeIncident(incident) {
  const coordinates = incident.point?.coordinates
  const lng = Number(coordinates?.[0])
  const lat = Number(coordinates?.[1])
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat < 26 || lat > 31 || lng < 80 || lng > 89) return null

  const type = hazardTypes[incident.hazard] || 'Disaster'
  return {
    id: `bipad-${incident.id}`,
    title: incident.title || `${type} reported in Nepal`,
    type,
    severity: getSeverity(incident),
    lat,
    lng,
    description: incident.description || incident.detail || incident.streetAddress || `${type} reported by ${incident.dataSource || 'BIPAD'}.`,
    status: incident.approved ? 'approved' : 'pending',
    verified: Boolean(incident.verified),
    source: 'BIPAD Portal',
    external: true,
    created_at: incident.incidentOn || incident.reportedOn || incident.createdOn || new Date().toISOString(),
  }
}

export async function fetchLiveHazards() {
  const response = await fetch(BIPAD_INCIDENT_URL)
  if (!response.ok) throw new Error(`BIPAD incident service returned ${response.status}`)
  const payload = await response.json()
  return (payload.results || [])
    .filter((incident) => includedHazards.has(Number(incident.hazard)))
    .map(normalizeIncident)
    .filter(Boolean)
    .sort((first, second) => new Date(second.created_at) - new Date(first.created_at))
}
