
import { CircleMarker, Popup } from 'react-leaflet'
import { CloudRain, MapPin, Waves } from 'lucide-react'
import { useState } from 'react'
import { getWeatherRisk } from '../services/weatherService'
const colors = { High: '#d65a4a', Medium: '#d9a441', Low: '#4e9b7c' }
export default function HazardMarker({ incident }) { const [weather, setWeather] = useState(null); const [loading, setLoading] = useState(false); const [error, setError] = useState(''); const color = colors[incident.severity] || colors.Medium
  async function check() { setLoading(true); setError(''); try { setWeather(await getWeatherRisk(incident.lat, incident.lng)) } catch (err) { setError(err.message) } finally { setLoading(false) } }
  return <CircleMarker center={[incident.lat, incident.lng]} radius={9} pathOptions={{ color: '#fff', weight: 3, fillColor: color, fillOpacity: 1 }}><Popup className="hazard-popup"><div className="popup-content"><div className="popup-top"><div><span>{incident.type}</span><h3>{incident.title}</h3></div><b style={{ color, backgroundColor: `${color}18` }}>{incident.severity}</b></div><p>{incident.description}</p><small><MapPin size={13} /> {incident.lat.toFixed(4)}, {incident.lng.toFixed(4)}</small>{weather && <div className={`weather-result ${weather.risk.toLowerCase().replace(' ', '-')}`}><strong><CloudRain size={16} /> {weather.risk}</strong><span>{weather.precipitation.toFixed(1)} mm rain · {(weather.soilMoisture * 100).toFixed(0)}% soil moisture</span></div>}{error && <em>{error}</em>}<button onClick={check} disabled={loading} className="weather-button"><Waves size={15} /> {loading ? 'Checking live risk...' : 'Check Live Weather Risk'}</button></div></Popup></CircleMarker> }
