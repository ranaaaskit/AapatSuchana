import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

function formatHour(value) {
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? String(value)
    : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function normalizeReadings(readings) {
  return readings.map((reading) => ({
    ...reading,
    label: formatHour(reading.timestamp ?? reading.time),
    rainfall: Number(reading.rainfall ?? reading.precipitation ?? 0),
    soilMoisture: Number(reading.soilMoisture ?? reading.soil_moisture ?? 0),
  }))
}

export default function WeatherTrendChart({ readings = [], height = 280 }) {
  const chartData = normalizeReadings(readings)

  return (
    <section className="weather-trend-chart" aria-label="Hourly weather trends">
      <div className="weather-trend-header">
        <div>
          <span className="section-eyebrow">Conditions over time</span>
          <h3>Hourly weather trends</h3>
        </div>
        <span className="weather-trend-count">{readings.length} readings</span>
      </div>
      {chartData.length === 0 ? (
        <p className="weather-trend-empty">No hourly readings available.</p>
      ) : (
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={chartData} margin={{ top: 12, right: 8, left: -16, bottom: 4 }}>
            <CartesianGrid stroke="#e7eeee" strokeDasharray="3 3" />
            <XAxis dataKey="label" tick={{ fill: '#7d8a8e', fontSize: 10 }} tickLine={false} axisLine={false} />
            <YAxis yAxisId="rainfall" tick={{ fill: '#7d8a8e', fontSize: 10 }} tickLine={false} axisLine={false} width={40} />
            <YAxis yAxisId="moisture" orientation="right" tick={{ fill: '#7d8a8e', fontSize: 10 }} tickLine={false} axisLine={false} width={40} />
            <Tooltip
              labelFormatter={(label) => `Time: ${label}`}
              formatter={(value, name) => [
                `${Number(value).toFixed(2)} ${name === 'Rainfall' ? 'mm/hr' : 'm³/m³'}`,
                name,
              ]}
              contentStyle={{ border: '1px solid #dce8e8', borderRadius: 8, fontSize: 11 }}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Line yAxisId="rainfall" type="monotone" dataKey="rainfall" name="Rainfall" stroke="#2f819d" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
            <Line yAxisId="moisture" type="monotone" dataKey="soilMoisture" name="Soil moisture" stroke="#d9a441" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </section>
  )
}
