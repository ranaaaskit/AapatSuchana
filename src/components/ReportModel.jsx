import { MapPin, X } from 'lucide-react'
import { useState } from 'react'
const blank = { title: '', type: 'Landslide', severity: 'Medium', lat: '', lng: '', description: '' }
export default function ReportModal({ coordinates, language = 'en', onClose, onSubmit }) {
  const nepali = language === 'ne'
  const [form, setForm] = useState({ ...blank, ...coordinates })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  async function submit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await onSubmit({ ...form, lat: Number(form.lat), lng: Number(form.lng) })
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="report-modal">
        <div className="modal-head">
          <div>
            <p className="section-eyebrow">{nepali ? 'समुदायको रिपोर्ट' : 'Community report'}</p>
            <h2>{nepali ? 'जोखिम रिपोर्ट गर्नुहोस्' : 'Report a hazard'}</h2>
            <p>{nepali ? 'छोटो स्थानीय जानकारीमार्फत मानिसहरूलाई सुरक्षित निर्णय लिन मद्दत गर्नुहोस्।' : 'Help people make safer decisions with a quick local update.'}</p>
          </div>
          <button
            onClick={onClose}
            className="icon-button"
            aria-label={nepali ? 'बन्द गर्नुहोस्' : 'Close'}
          >
            <X size={20} />
          </button>
        </div>
        <form onSubmit={submit}>
          <label>
            {nepali ? 'स्थानको शीर्षक' : 'Location title'}
            <input
              name="title"
              value={form.title}
              onChange={update}
              placeholder={nepali ? 'जस्तै: मुग्लिन पहिरो' : 'e.g. Mugling Landslide'}
              required
            />
          </label>
          <div className="two-col">
            <label>
              {nepali ? 'जोखिमको प्रकार' : 'Hazard type'}
              <select name="type" value={form.type} onChange={update}>
                <option>Landslide</option>
                <option>Flood</option>
                <option>Roadblock</option>
              </select>
            </label>
            <label>
              {nepali ? 'गम्भीरता' : 'Severity'}
              <select name="severity" value={form.severity} onChange={update}>
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </label>
          </div>
          <div className="two-col">
            <label>
              {nepali ? 'अक्षांश' : 'Latitude'}
              <input
                name="lat"
                type="number"
                step="any"
                value={form.lat}
                onChange={update}
                required
              />
            </label>
            <label>
              {nepali ? 'देशान्तर' : 'Longitude'}
              <input
                name="lng"
                type="number"
                step="any"
                value={form.lng}
                onChange={update}
                required
              />
            </label>
          </div>
          <div className="coordinate-hint">
            <MapPin size={15} /> {nepali ? 'निर्देशाङ्क भर्न नक्सामा जहाँसुकै थिच्नुहोस्' : 'Click anywhere on the map to fill coordinates'}
          </div>
          <label>
            {nepali ? 'के भइरहेको छ?' : 'What is happening?'}
            <textarea
              name="description"
              value={form.description}
              onChange={update}
              rows="3"
              placeholder={nepali ? 'नजिकका यात्रुका लागि उपयोगी विवरण साझा गर्नुहोस्...' : 'Share useful details for nearby travelers...'}
              required
            />
          </label>
          {error && <p className="form-error">{error}</p>}
          <button className="primary-button submit-button" disabled={saving}>
            {saving ? (nepali ? 'रिपोर्ट प्रकाशित हुँदैछ...' : 'Publishing report...') : (nepali ? 'जोखिम रिपोर्ट प्रकाशित गर्नुहोस्' : 'Publish hazard report')}
          </button>
        </form>
      </div>
    </div>
  )
}
