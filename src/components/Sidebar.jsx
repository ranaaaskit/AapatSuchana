import { Activity, CloudRain, Compass, Info, MapPinned, Phone, RefreshCw, ShieldCheck, TriangleAlert } from 'lucide-react'

const emergencyContacts = [
	{ name: 'Police', number: '100' },
	{ name: 'APF', number: '1114' },
	{ name: 'Red Cross', number: '1130' },
	{ name: 'Nepal Army Emergency', number: '1144' },
]

export default function Sidebar({ incidents, language = 'en', onReport, demoMode, onDemoToggle, lastUpdated, onRefresh, loading }) {
	const nepali = language === 'ne'
	const high = incidents.filter((incident) => incident.severity === 'High').length
	const medium = incidents.filter((incident) => incident.severity === 'Medium').length
	const activeAlerts = incidents.filter((incident) => incident.status !== 'rejected').length

	return (
		<aside className="sidebar">
			<div className="sidebar-scroll">
				<div className="sidebar-title"><div><p className="section-eyebrow">{nepali ? 'स्थितिको अवलोकन' : 'Situation overview'}</p><h2>{nepali ? 'प्रत्यक्ष जोखिम बोर्ड' : 'Live hazard board'}</h2></div><button className={`toggle ${demoMode ? 'active' : ''}`} onClick={onDemoToggle} aria-label={nepali ? 'मुसलधारे वर्षा सिमुलेट गर्नुहोस्' : 'Simulate torrential rain'}><span /></button></div>
				<p className="sidebar-intro">{nepali ? 'नेपालभरका सक्रिय जोखिमको साझा, समुदायमा आधारित दृश्य।' : 'A shared, community-powered view of active hazards across Nepal.'}</p>
				<button onClick={onReport} className="primary-button"><MapPinned size={18} /> {nepali ? 'जोखिम रिपोर्ट गर्नुहोस्' : 'Report a hazard'}</button>
				<div className="stat-grid"><div className="stat-card"><span className="stat-icon red"><TriangleAlert size={17} /></span><strong>{high}</strong><span>{nepali ? 'उच्च जोखिम' : 'High risk'}</span></div><div className="stat-card"><span className="stat-icon amber"><Activity size={17} /></span><strong>{medium}</strong><span>{nepali ? 'निगरानीमा' : 'Monitoring'}</span></div><div className="stat-card"><span className="stat-icon green"><ShieldCheck size={17} /></span><strong>{activeAlerts}</strong><span>{nepali ? 'सक्रिय सूचना' : 'Active alerts'}</span></div></div>
				<div className="sidebar-section"><div className="section-heading"><span>{nepali ? 'पछिल्ला रिपोर्ट' : 'Latest reports'}</span><button className="refresh-button" onClick={onRefresh} disabled={loading}><RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> {nepali ? 'ताजा गर्नुहोस्' : 'Refresh'}</button></div>{incidents.slice(0, 6).map((incident) => <div className="incident-row" key={incident.id}><span className={`incident-dot ${(incident.severity || 'Medium').toLowerCase()}`} /><div><strong>{incident.title}</strong><span>{incident.type} · {incident.severity} {nepali ? 'जोखिम' : 'risk'}</span></div><small>{new Date(incident.created_at).toLocaleDateString(nepali ? 'ne-NP' : 'en-NP', { month: 'short', day: 'numeric' })}</small></div>)}</div>
				<section className="emergency-contacts" aria-labelledby="emergency-contacts-title"><div className="section-heading"><span id="emergency-contacts-title">{nepali ? 'आपत्कालीन सम्पर्क' : 'Emergency contacts'}</span><Phone size={15} /></div><div className="contact-list">{emergencyContacts.map((contact) => <a href={`tel:${contact.number}`} className="contact-row" key={contact.number}><span>{contact.name}</span><strong>{contact.number}</strong></a>)}</div></section>
				<div className="weather-card"><span><CloudRain size={20} /></span><div><strong>{nepali ? 'मौसमको अवस्था' : 'Weather context'}</strong><p>{nepali ? 'वर्षा र माटोको चिस्यान हेर्न नक्साको चिन्ह थिच्नुहोस्।' : 'Tap a map marker to check live precipitation and soil moisture.'}</p></div></div><div className="map-tip"><Compass size={17} /><span><strong>{nepali ? 'स्वतन्त्र रूपमा हेर्नुहोस्' : 'Explore freely'}</strong><br />{nepali ? 'नयाँ रिपोर्ट पिन राख्न नक्सामा थिच्नुहोस्।' : 'Click the map to place a new report pin.'}</span></div>
			</div><div className="sidebar-footer"><Info size={14} /> {nepali ? 'समुदायले पठाएका डेटा ·' : 'Data updates are community submitted ·'} {lastUpdated}</div>
		</aside>
	)
}



