import { useCallback, useEffect, useState } from 'react'
import { AlertCircle, Loader2, Plus } from 'lucide-react'
import 'leaflet/dist/leaflet.css'
import './App.css'
import MapView from './components/MapView'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import ReportModal from './components/ReportModel'
import AlertBanner from './components/AlertBanner'
import NotificationSystem from './components/NotificationSystem'
import AuthPage from './components/AuthPage'
import EmployeeDashboard from './components/EmployeeDashboard'
import EmployeeAuthPage from './components/EmployeeAuthPage'
import { createIncident, getSession, signOut } from './services/apiClient'
import { searchNepalLocation } from './services/geocodingService'
import { fetchLiveHazards } from './services/hazardService'
import { fetchIncidents } from './services/incidentService'

const fallbackIncidents = [
  { id: 'fallback-kathmandu', title: 'Bagmati river watch', type: 'Flood', severity: 'Medium', status: 'approved', lat: 27.7172, lng: 85.324, description: 'Water levels are being monitored near the river corridor.', created_at: new Date().toISOString() },
  { id: 'fallback-pokhara', title: 'Sedi road debris', type: 'Roadblock', severity: 'Low', status: 'approved', lat: 28.2096, lng: 83.9856, description: 'Travelers report debris along the Sedi road.', created_at: new Date().toISOString() },
  { id: 'fallback-sindhupalchok', title: 'Highway slope movement', type: 'Landslide', severity: 'High', status: 'approved', lat: 27.951, lng: 85.684, description: 'Slope movement reported near the highway.', created_at: new Date().toISOString() },
]

export default function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('aapat-theme') || 'light')
  const [language, setLanguage] = useState(() => localStorage.getItem('aapat-language') || 'en')
  const [session, setSession] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [employeeView, setEmployeeView] = useState(false)
  const [employeeLogin, setEmployeeLogin] = useState(false)
  const [incidents, setIncidents] = useState([]); const [target, setTarget] = useState(null); const [picked, setPicked] = useState(null); const [reportOpen, setReportOpen] = useState(false); const [demoMode, setDemoMode] = useState(false); const [loading, setLoading] = useState(true); const [lastUpdated, setLastUpdated] = useState('—'); const [error, setError] = useState('')
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('aapat-theme', theme)
  }, [theme])
  useEffect(() => {
    localStorage.setItem('aapat-language', language)
  }, [language])
  useEffect(() => {
    let active = true
    getSession().then((nextSession) => { if (active) { setSession(nextSession); setAuthLoading(false) } })
    return () => { active = false }
  }, [])
  const refresh = useCallback(async () => { setLoading(true); setError(''); const saved = JSON.parse(localStorage.getItem('aapat-incidents') || '[]'); const visibleSaved = saved.filter((incident) => employeeView || incident.status === 'approved'); const [liveHazards, reportResult] = await Promise.all([fetchLiveHazards().catch(() => []), fetchIncidents({ includePending: employeeView })]); const reports = reportResult.error ? [...visibleSaved, ...fallbackIncidents] : [...(reportResult.data || []), ...visibleSaved]; setIncidents([...liveHazards, ...reports]); setLastUpdated(new Date().toLocaleTimeString('en-NP', { hour: '2-digit', minute: '2-digit' })); if (reportResult.error && !liveHazards.length) setLastUpdated('Offline reports'); setLoading(false) }, [employeeView])
  useEffect(() => {
    queueMicrotask(() => { void refresh() })
    const timer = window.setInterval(() => { void refresh() }, 5 * 60 * 1000)
    return () => window.clearInterval(timer)
  }, [refresh])
  async function search(query) { setTarget(await searchNepalLocation(query)) }
  function mapClick(coordinates) { setPicked(coordinates); setReportOpen(true) }
  async function submit(form) { const report = { ...form, status: 'pending', id: `local-${Date.now()}`, created_at: new Date().toISOString() }; try { await createIncident(form); await refresh(); return } catch { const saved = JSON.parse(localStorage.getItem('aapat-incidents') || '[]'); localStorage.setItem('aapat-incidents', JSON.stringify([report, ...saved])); await refresh() } }
  const toggleTheme = () => setTheme((value) => value === 'light' ? 'dark' : 'light')
  const toggleLanguage = () => setLanguage((value) => value === 'en' ? 'ne' : 'en')
  const alertLevel = incidents.some((incident) => incident.severity === 'High') ? 'Critical' : 'Normal'
  if (authLoading) return <div className="auth-loading"><Loader2 size={24} className="animate-spin" /> {language === 'ne' ? 'सुरक्षित पहुँच लोड हुँदैछ...' : 'Loading secure access...'}</div>
  if (!session && employeeLogin) return <EmployeeAuthPage theme={theme} language={language} onToggleLanguage={toggleLanguage} onToggleTheme={toggleTheme} onAuthorized={(nextSession) => { setSession({ ...nextSession, is_employee: true }); setEmployeeView(true); setEmployeeLogin(false) }} onBack={() => setEmployeeLogin(false)} />
  if (!session) return <AuthPage theme={theme} language={language} onToggleLanguage={toggleLanguage} onToggleTheme={toggleTheme} onEmployeeLogin={() => setEmployeeLogin(true)} onAuthenticated={setSession} />
  if (employeeView) return <div className="app-shell"><Navbar onSearch={search} onSignOut={() => { setEmployeeView(false); signOut(); setSession(null) }} theme={theme} onToggleTheme={toggleTheme} language={language} onToggleLanguage={toggleLanguage} /><NotificationSystem alertLevel={alertLevel} language={language} /><EmployeeDashboard incidents={incidents} userEmail={session.user.email} language={language} onBackToMap={() => setEmployeeView(false)} onRefresh={refresh} loading={loading} onIncidentChange={(next) => setIncidents((current) => current.map((incident) => incident.id === next.id ? next : incident))} /></div>
  return <div className="app-shell">{demoMode && <AlertBanner onDismiss={() => setDemoMode(false)} language={language} />}<Navbar onSearch={search} onEmployeeDashboard={session.is_employee ? () => setEmployeeView(true) : undefined} onSignOut={() => { signOut(); setSession(null) }} theme={theme} onToggleTheme={toggleTheme} language={language} onToggleLanguage={toggleLanguage} /><NotificationSystem alertLevel={alertLevel} language={language} /><main className="layout"><Sidebar incidents={incidents} language={language} onReport={() => { setPicked(null); setReportOpen(true) }} demoMode={demoMode} onDemoToggle={() => setDemoMode((value) => !value)} lastUpdated={lastUpdated} onRefresh={refresh} loading={loading} /><section className="map-area"><MapView incidents={incidents} language={language} target={target} onMapClick={mapClick} />{error && <div className="map-error"><AlertCircle size={18} /> {error}</div>}<button className="fab" onClick={() => { setPicked(null); setReportOpen(true) }} aria-label={language === 'ne' ? 'जोखिम रिपोर्ट गर्नुहोस्' : 'Report a hazard'}><Plus size={22} /></button></section></main>{reportOpen && <ReportModal coordinates={picked} language={language} onClose={() => setReportOpen(false)} onSubmit={submit} />}</div>
}
