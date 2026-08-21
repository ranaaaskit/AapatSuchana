import { useCallback, useEffect, useState } from 'react'
import { AlertCircle, Loader2, Plus } from 'lucide-react'
import 'leaflet/dist/leaflet.css'
import './App.css'
import MapView from './components/MapView'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import ReportModal from './components/ReportModel'
import AlertBanner from './components/AlertBanner'
import AuthPage from './components/AuthPage'
import { supabase } from './services/supabaseClient'
import { searchNepalLocation } from './services/geocodingService'

const fallbackIncidents = [
  { id: 'fallback-kathmandu', title: 'Bagmati river watch', type: 'Flood', severity: 'Medium', lat: 27.7172, lng: 85.324, description: 'Water levels are being monitored near the river corridor.', created_at: new Date().toISOString() },
  { id: 'fallback-pokhara', title: 'Sedi road debris', type: 'Roadblock', severity: 'Low', lat: 28.2096, lng: 83.9856, description: 'Travelers report debris along the Sedi road.', created_at: new Date().toISOString() },
  { id: 'fallback-sindhupalchok', title: 'Highway slope movement', type: 'Landslide', severity: 'High', lat: 27.951, lng: 85.684, description: 'Slope movement reported near the highway.', created_at: new Date().toISOString() },
]

export default function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('aapat-theme') || 'light')
  const [session, setSession] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [incidents, setIncidents] = useState([]); const [target, setTarget] = useState(null); const [picked, setPicked] = useState(null); const [reportOpen, setReportOpen] = useState(false); const [demoMode, setDemoMode] = useState(false); const [loading, setLoading] = useState(true); const [lastUpdated, setLastUpdated] = useState('—'); const [error, setError] = useState('')
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('aapat-theme', theme)
  }, [theme])
  useEffect(() => {
    let active = true
    supabase.auth.getSession().then(({ data }) => { if (active) { setSession(data.session); setAuthLoading(false) } })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession))
    return () => { active = false; subscription.unsubscribe() }
  }, [])
  const refresh = useCallback(async () => { setLoading(true); setError(''); const saved = JSON.parse(localStorage.getItem('aapat-incidents') || '[]'); if (!supabase) { setIncidents([...saved, ...fallbackIncidents]); setLoading(false); return } const { data, error: queryError } = await supabase.from('incidents').select('*').order('created_at', { ascending: false }).limit(200); if (queryError) { setIncidents([...saved, ...fallbackIncidents]); setLastUpdated('Offline reports'); setLoading(false); return } setIncidents([...(data || []), ...saved]); setLastUpdated(new Date().toLocaleTimeString('en-NP', { hour: '2-digit', minute: '2-digit' })); setLoading(false) }, [])
  useEffect(() => {
    queueMicrotask(() => { void refresh() })
  }, [refresh])
  useEffect(() => {
    if (!supabase) return undefined
    const channel = supabase.channel('incidents-live').on('postgres_changes', { event: '*', schema: 'public', table: 'incidents' }, () => { void refresh() }).subscribe()
    return () => { void supabase.removeChannel(channel) }
  }, [refresh])
  async function search(query) { setTarget(await searchNepalLocation(query)) }
  function mapClick(coordinates) { setPicked(coordinates); setReportOpen(true) }
  async function submit(form) { const report = { ...form, id: `local-${Date.now()}`, created_at: new Date().toISOString() }; if (supabase) { const { error: insertError } = await supabase.from('incidents').insert([form]); if (!insertError) { await refresh(); return } } const saved = JSON.parse(localStorage.getItem('aapat-incidents') || '[]'); localStorage.setItem('aapat-incidents', JSON.stringify([report, ...saved])); await refresh() }
  const toggleTheme = () => setTheme((value) => value === 'light' ? 'dark' : 'light')
  if (authLoading) return <div className="auth-loading"><Loader2 size={24} className="animate-spin" /> Loading secure access...</div>
  if (!session) return <AuthPage theme={theme} onToggleTheme={toggleTheme} />
  return <div className="app-shell">{demoMode && <AlertBanner onDismiss={() => setDemoMode(false)} />}<Navbar onSearch={search} onSignOut={() => { void supabase.auth.signOut() }} theme={theme} onToggleTheme={toggleTheme} /><main className="layout"><Sidebar incidents={incidents} onReport={() => { setPicked(null); setReportOpen(true) }} demoMode={demoMode} onDemoToggle={() => setDemoMode((value) => !value)} lastUpdated={lastUpdated} onRefresh={refresh} loading={loading} /><section className="map-area"><MapView incidents={incidents} target={target} onMapClick={mapClick} />{error && <div className="map-error"><AlertCircle size={18} /> {error}</div>}<button className="fab" onClick={() => { setPicked(null); setReportOpen(true) }} aria-label="Report a hazard"><Plus size={22} /></button></section></main>{reportOpen && <ReportModal coordinates={picked} onClose={() => setReportOpen(false)} onSubmit={submit} />}</div>
}
