import { useMemo, useState } from 'react'
import { CheckCircle2, ClipboardList, Map, MapPin, RefreshCw, Search, ShieldCheck, TriangleAlert } from 'lucide-react'
import { supabase } from '../services/supabaseClient'
import '../employee.css'

const statuses = ['All', 'New', 'Investigating', 'Resolved']

export default function EmployeeDashboard({ incidents, userEmail, onBackToMap, onRefresh, loading, onIncidentChange }) {
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
    new: incidents.filter((incident) => (incident.status || 'New') === 'New').length,
    active: incidents.filter((incident) => (incident.status || 'New') === 'Investigating').length,
    resolved: incidents.filter((incident) => incident.status === 'Resolved').length,
    high: incidents.filter((incident) => incident.severity === 'High').length,
  }), [incidents])

  async function updateIncident(incident, changes) {
    setSavingId(incident.id)
    const next = { ...incident, ...changes }
    onIncidentChange(next)
    if (supabase && !String(incident.id).startsWith('fallback-') && !String(incident.id).startsWith('local-')) {
      await supabase.from('incidents').update(changes).eq('id', incident.id)
    }
    setSavingId(null)
  }

  return (
    <main className="employee-page">
      <header className="employee-header">
        <div><span className="employee-kicker"><ShieldCheck size={15} /> Operations workspace</span><h1>Employee dashboard</h1><p>Monitor, verify, and close community reports from one place.</p></div>
        <div className="employee-actions"><span className="employee-user">{userEmail}</span><button className="employee-button secondary" onClick={onRefresh} disabled={loading}><RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh</button><button className="employee-button" onClick={onBackToMap}><Map size={16} /> Map view</button></div>
      </header>
      <section className="employee-stats"><div><ClipboardList size={19} /><strong>{counts.total}</strong><span>Total reports</span></div><div><TriangleAlert size={19} /><strong>{counts.high}</strong><span>High priority</span></div><div><RefreshCw size={19} /><strong>{counts.active}</strong><span>Being investigated</span></div><div><CheckCircle2 size={19} /><strong>{counts.resolved}</strong><span>Resolved</span></div></section>
      <section className="employee-content">
        <div className="employee-toolbar"><div className="employee-search"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search reports" aria-label="Search reports" /></div><div className="status-tabs">{statuses.map((item) => <button key={item} className={status === item ? 'active' : ''} onClick={() => setStatus(item)}>{item}</button>)}</div></div>
        <div className="report-table"><div className="report-table-head"><span>Incident</span><span>Priority</span><span>Status</span><span>Reported</span><span>Actions</span></div>{visibleIncidents.length ? visibleIncidents.map((incident) => <article className="employee-report" key={incident.id}><div className="report-name"><span className={`incident-dot ${(incident.severity || 'Medium').toLowerCase()}`} /><div><strong>{incident.title}</strong><span>{incident.type} · <MapPin size={12} /> {Number(incident.lat).toFixed(3)}, {Number(incident.lng).toFixed(3)}</span><p>{incident.description}</p></div></div><span className={`priority-pill ${(incident.severity || 'Medium').toLowerCase()}`}>{incident.severity || 'Medium'}</span><select value={incident.status || 'New'} disabled={savingId === incident.id} onChange={(event) => updateIncident(incident, { status: event.target.value })} aria-label={`Status for ${incident.title}`}><option>New</option><option>Investigating</option><option>Resolved</option></select><time>{new Date(incident.created_at).toLocaleDateString('en-NP', { month: 'short', day: 'numeric' })}</time><div className="report-actions"><button title="Mark verified" aria-label={`Mark ${incident.title} verified`} className={incident.verified ? 'verified' : ''} onClick={() => updateIncident(incident, { verified: !incident.verified })}><CheckCircle2 size={17} /></button><button title="Open on map" aria-label={`Open ${incident.title} on map`} onClick={onBackToMap}><Map size={17} /></button></div></article>) : <div className="empty-reports">No reports match this view.</div>}</div>
      </section>
    </main>
  )
}
