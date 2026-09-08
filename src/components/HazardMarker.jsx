import { CircleMarker, Tooltip } from 'react-leaflet'
import { MapPin } from 'lucide-react'
const colors = { High: '#d65a4a', Medium: '#d9a441', Low: '#4e9b7c' }
const outlineColors = { Flood: '#2f81ad', Landslide: '#8a5a3b', Earthquake: '#68727a' }
export default function HazardMarker({ incident }) { const color = colors[incident.severity] || colors.Medium
  const outlineColor = outlineColors[incident.type] || (incident.external ? color : '#fff')
  return <CircleMarker center={[incident.lat, incident.lng]} radius={incident.external ? 11 : 9} pathOptions={{ color: outlineColor, weight: 3, fillColor: color, fillOpacity: incident.external ? .75 : 1, dashArray: incident.external ? '4 4' : undefined }}><Tooltip direction="top" offset={[0, -8]} opacity={0.98}><div className="hazard-tooltip"><span>{incident.source || incident.type}</span><strong>{incident.title}</strong><b style={{ color }}>{incident.severity} severity</b><p>{incident.description}</p><small><MapPin size={12} /> {incident.lat.toFixed(4)}, {incident.lng.toFixed(4)}</small></div></Tooltip></CircleMarker> }
