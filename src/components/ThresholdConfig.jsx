import { useState } from 'react'

const initialValues = {
  maxSafeRainfallRate: '10',
  criticalSoilMoisture: '70',
}

export default function ThresholdConfig({ initialThresholds = initialValues }) {
  const [values, setValues] = useState({
    maxSafeRainfallRate: String(initialThresholds.maxSafeRainfallRate ?? initialValues.maxSafeRainfallRate),
    criticalSoilMoisture: String(initialThresholds.criticalSoilMoisture ?? initialValues.criticalSoilMoisture),
  })
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  function updateValue(event) {
    setValues((current) => ({ ...current, [event.target.name]: event.target.value }))
    setError('')
    setSaved(false)
  }

  function submit(event) {
    event.preventDefault()
    const rainfallRate = Number(values.maxSafeRainfallRate)
    const soilMoisture = Number(values.criticalSoilMoisture)

    if (!values.maxSafeRainfallRate.trim() || !values.criticalSoilMoisture.trim() || !Number.isFinite(rainfallRate) || !Number.isFinite(soilMoisture) || rainfallRate < 0 || soilMoisture < 0) {
      setError('Thresholds must be valid numbers greater than or equal to zero.')
      setSaved(false)
      return
    }

    const thresholds = { maxSafeRainfallRate: rainfallRate, criticalSoilMoisture: soilMoisture }
    console.log('Safety thresholds updated:', thresholds)
    setError('')
    setSaved(true)
  }

  return (
    <section className="threshold-config" aria-labelledby="threshold-config-title">
      <div className="threshold-config-heading">
        <div>
          <span className="section-eyebrow">System controls</span>
          <h2 id="threshold-config-title">Safety thresholds</h2>
        </div>
        {saved && <span className="threshold-saved" role="status">Saved</span>}
      </div>
      <form onSubmit={submit}>
        <label>
          Max Safe Rainfall Rate
          <span className="threshold-input-wrap">
            <input name="maxSafeRainfallRate" type="number" min="0" step="any" value={values.maxSafeRainfallRate} onChange={updateValue} aria-describedby="rainfall-unit" required />
            <span id="rainfall-unit">mm/hr</span>
          </span>
        </label>
        <label>
          Critical Soil Moisture %
          <span className="threshold-input-wrap">
            <input name="criticalSoilMoisture" type="number" min="0" step="any" value={values.criticalSoilMoisture} onChange={updateValue} aria-describedby="moisture-unit" required />
            <span id="moisture-unit">%</span>
          </span>
        </label>
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="employee-button" type="submit">Save thresholds</button>
      </form>
    </section>
  )
}
