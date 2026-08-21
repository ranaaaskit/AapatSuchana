import { MapPin, X } from 'lucide-react'
import { useState } from 'react'
const blank = { title: '', type: 'Landslide', severity: 'Medium', lat: '', lng: '', description: '' }
export default function ReportModal({ coordinates, onClose, onSubmit }) {
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
            <p className="section-eyebrow">Community report</p>
            <h2>Report a hazard</h2>
            <p>Help people make safer decisions with a quick local update.</p>
          </div>
          <button
            onClick={onClose}
            className="icon-button"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        <form onSubmit={submit}>
          <label>
            Location title
            <input
              name="title"
              value={form.title}
              onChange={update}
              placeholder="e.g. Mugling Landslide"
              required
            />
          </label>
          <div className="two-col">
            <label>
              Hazard type
              <select name="type" value={form.type} onChange={update}>
                <option>Landslide</option>
                <option>Flood</option>
                <option>Roadblock</option>
              </select>
            </label>
            <label>
              Severity
              <select name="severity" value={form.severity} onChange={update}>
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </label>
          </div>
          <div className="two-col">
            <label>
              Latitude
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
              Longitude
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
            <MapPin size={15} /> Click anywhere on the map to fill coordinates
          </div>
          <label>
            What is happening?
            <textarea
              name="description"
              value={form.description}
              onChange={update}
              rows="3"
              placeholder="Share useful details for nearby travelers..."
              required
            />
          </label>
          {error && <p className="form-error">{error}</p>}
          <button className="primary-button submit-button" disabled={saving}>
            {saving ? 'Publishing report...' : 'Publish hazard report'}
          </button>
        </form>
      </div>
    </div>
  )
}
