import { MapContainer, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import { useEffect } from 'react'
import HazardMarker from './HazardMarker'
function Controller({ target }) { const map = useMap(); useEffect(() => { if (target) map.flyTo([target.lat, target.lng], 11, { duration: 1.2 }) }, [map, target]); return null }
function ClickCapture({ onMapClick }) { useMapEvents({ click: (e) => onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng }) }); return null }
export default function MapView({ incidents, target, onMapClick }) { return <MapContainer center={[28.3949, 84.124]} zoom={7} minZoom={6} maxZoom={16} className="map-canvas" zoomControl={false}><TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" /><Controller target={target} /><ClickCapture onMapClick={onMapClick} />{incidents.map((item) => <HazardMarker key={item.id} incident={item} />)}</MapContainer> }



