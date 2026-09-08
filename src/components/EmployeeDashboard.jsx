import { useMemo, useState } from 'react'
import { CheckCircle2, ClipboardList, Map, MapPin, RefreshCw, Search, ShieldCheck, TriangleAlert } from 'lucide-react'
import { updateIncident as updateIncidentApi } from '../services/apiClient'
import ThresholdConfig from './ThresholdConfig'
import '../employee.css'

const statuses = ['All', 'pending', 'approved', 'rejected']

export default function EmployeeDashboard({ incidents, userEmail, language = 'en', onBackToMap, onRefresh, loading, onIncidentChange }) {
  const nepali = language === 'ne'
  const [status, setStatus] = useState('All')
  const [query, setQuery] = useState('')
  const [savingId, setSavingId] = useState(null)

  const visibleIncidents = useMemo(() => incidents.filter((incident) => {
    const matchesStatus = status === 'All' || (incident.status || 'New') === status
    const text = `${incident.title} ${incident.type} ${incident.description}`.toLowerCase()
    return matchesStatus && text.includes(query.toLowerCase())
  }), [incidents, query, status])

  const counts = useMemo(() => ({
    total: incidents.length,
    pending: incidents.filter((incident) => (incident.status || 'pending') === 'pending').length,
    approved: incidents.filter((incident) => incident.status === 'approved').length,
    rejected: incidents.filter((incident) => incident.status === 'rejected').length,
    high: incidents.filter((incident) => incident.severity === 'High').length,
  }), [incidents])

  async function updateIncident(incident, changes) {
    setSavingId(incident.id)
    const next = { ...incident, ...changes }
    onIncidentChange(next)
    if (!String(incident.id).startsWith('fallback-') && !String(incident.id).startsWith('local-')) {
      await updateIncidentApi(incident.id, changes)
    }
    setSavingId(null)
  }

  return (
    <main className="employee-page">
      <header className="employee-header">
        <div><span className="employee-kicker"><ShieldCheck size={15} /> {nepali ? 'सञ्चालन कार्यक्षेत्र' : 'Operations workspace'}</span><h1>{nepali ? 'कर्मचारी ड्यासबोर्ड' : 'Employee dashboard'}</h1><p>{nepali ? 'समुदायका रिपोर्टहरू एकै ठाउँबाट निगरानी, प्रमाणीकरण र बन्द गर्नुहोस्।' : 'Monitor, verify, and close community reports from one place.'}</p></div>
        <div className="employee-actions"><span className="employee-user">{userEmail}</span><button className="employee-button secondary" onClick={onRefresh} disabled={loading}><RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> {nepali ? 'ताजा गर्नुहोस्' : 'Refresh'}</button><button className="employee-button" onClick={onBackToMap}><Map size={16} /> {nepali ? 'नक्सा दृश्य' : 'Map view'}</button></div>
      </header>
      <section className="employee-stats"><div><ClipboardList size={19} /><strong>{counts.total}</strong><span>{nepali ? 'कुल रिपोर्ट' : 'Total reports'}</span></div><div><TriangleAlert size={19} /><strong>{counts.high}</strong><span>{nepali ? 'उच्च प्राथमिकता' : 'High priority'}</span></div><div><RefreshCw size={19} /><strong>{counts.pending}</strong><span>{nepali ? 'समीक्षाका लागि बाँकी' : 'Pending review'}</span></div><div><CheckCircle2 size={19} /><strong>{counts.approved}</strong><span>{nepali ? 'स्वीकृत' : 'Approved'}</span></div></section>
        <ThresholdConfig language={language} />
      <section className="employee-content">
        <div className="employee-toolbar"><div className="employee-search"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={nepali ? 'रिपोर्ट खोज्नुहोस्' : 'Search reports'} aria-label={nepali ? 'रिपोर्ट खोज्नुहोस्' : 'Search reports'} /></div><div className="status-tabs">{statuses.map((item) => <button key={item} className={status === item ? 'active' : ''} onClick={() => setStatus(item)}>{nepali && item === 'All' ? 'सबै' : item}</button>)}</div></div>
        <div className="report-table"><div className="report-table-head"><span>{nepali ? 'घटना' : 'Incident'}</span><span>{nepali ? 'प्राथमिकता' : 'Priority'}</span><span>{nepali ? 'स्थिति' : 'Status'}</span><span>{nepali ? 'रिपोर्ट गरिएको' : 'Reported'}</span><span>{nepali ? 'कार्यहरू' : 'Actions'}</span></div>{visibleIncidents.length ? visibleIncidents.map((incident) => <article className="employee-report" key={incident.id}><div className="report-name"><span className={`incident-dot ${(incident.severity || 'Medium').toLowerCase()}`} /><div><strong>{incident.title}</strong><span>{incident.type} · <MapPin size={12} /> {Number(incident.lat).toFixed(3)}, {Number(incident.lng).toFixed(3)}</span><p>{incident.description}</p></div></div><span className={`priority-pill ${(incident.severity || 'Medium').toLowerCase()}`}>{incident.severity || 'Medium'}</span><select value={incident.status || 'pending'} disabled={savingId === incident.id} onChange={(event) => updateIncident(incident, { status: event.target.value })} aria-label={`${nepali ? 'स्थिति' : 'Status'} for ${incident.title}`}><option>pending</option><option>approved</option><option>rejected</option></select><time>{new Date(incident.created_at).toLocaleDateString(nepali ? 'ne-NP' : 'en-NP', { month: 'short', day: 'numeric' })}</time><div className="report-actions"><button title={nepali ? 'प्रमाणित गर्नुहोस्' : 'Mark verified'} aria-label={`${nepali ? 'प्रमाणित गर्नुहोस्' : 'Mark'} ${incident.title}`} className={incident.verified ? 'verified' : ''} onClick={() => updateIncident(incident, { verified: !incident.verified })}><CheckCircle2 size={17} /></button><button title={nepali ? 'नक्सामा खोल्नुहोस्' : 'Open on map'} aria-label={`${nepali ? 'नक्सामा खोल्नुहोस्' : 'Open'} ${incident.title}`} onClick={onBackToMap}><Map size={17} /></button></div></article>) : <div className="empty-reports">{nepali ? 'यस दृश्यसँग मिल्ने रिपोर्ट छैन।' : 'No reports match this view.'}</div>}</div>
      </section>
    </main>
  )
}
