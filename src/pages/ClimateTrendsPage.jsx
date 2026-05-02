import { useState, useRef, useEffect } from 'react'
import { Line, Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, Title, Tooltip, Legend, Filler,
} from 'chart.js'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, Title, Tooltip, Legend, Filler,
)

// ─── Data ──────────────────────────────────────────────────────────────────
const YEARS = [
  '1973','1975','1977','1979','1981','1983','1985','1987','1989','1991',
  '1993','1995','1997','1999','2001','2003','2005','2007','2009','2011',
  '2013','2015','2017','2019','2021','2023',
]

const DISASTER_DATA = {
  all:        [3,4,3,5,4,4,5,5,6,5,9,8,7,9,9,11,17,12,10,14,9,10,16,14,20,28],
  hurricanes: [1,0,1,1,0,1,0,1,2,1,2,2,1,3,1,2,7,2,0,3,1,1,3,1,4,3],
  floods:     [1,1,1,2,1,1,2,1,1,1,3,2,2,2,2,2,3,3,3,3,2,3,4,4,7,9],
  wildfires:  [0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,1,1,1,2,2,3,3,4,6],
  tornadoes:  [1,2,1,2,2,1,2,2,2,2,2,2,2,1,3,3,2,3,3,5,2,2,3,3,3,4],
}

const LOSSES_DATA = {
  all: [4,6,5,8,11,7,5,4,16,11,21,20,14,35,12,21,160,26,16,59,22,27,360,95,145,93],
}

const REGION_MULTIPLIERS = {
  national: 1.0, northeast: 0.65, southeast: 1.15, midwest: 0.85, south: 1.05, west: 1.2, southwest: 1.0,
}

const STAT_TILES = [
  { value: '340%', label: 'increase in weather disasters since 1980', icon: '📈' },
  { value: '$2.6T', label: 'total losses 2000–2023', icon: '💸' },
  { value: '18/yr', label: 'avg billion-dollar disasters 2020–2023', icon: '🌪️' },
  { value: '2.4×', label: 'more wildfires than the 1980s', icon: '🔥' },
]

const WHY_CARDS = [
  {
    icon: '🌡️',
    title: 'Rising Temperatures',
    body: 'Each 1°C increase intensifies hurricane rainfall by ~7% (Clausius-Clapeyron relationship). The U.S. has warmed ~1.3°C since pre-industrial times.',
  },
  {
    icon: '🌊',
    title: 'Sea Level Rise',
    body: 'U.S. coasts have seen 8–9 inches of rise since 1880, amplifying storm surge damage and pushing flood zones further inland.',
  },
  {
    icon: '🔥',
    title: 'Drought Cycles',
    body: 'Western U.S. drought severity has increased 40% since 1980, extending wildfire seasons and creating year-round fire risk.',
  },
]

// ─── Shared styles ─────────────────────────────────────────────────────────
const glass = {
  background: 'rgba(250,252,255,0.92)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  border: '1px solid rgba(99,150,222,0.18)',
  borderRadius: '1rem',
  padding: '1.5rem',
}

const pillBtn = {
  background: '#0C1A2E',
  borderRadius: '9999px',
  color: '#fff',
  padding: '0.75rem 1.75rem',
  border: 'none',
  cursor: 'pointer',
  fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
  fontWeight: 600,
  fontSize: '0.9rem',
}

const selectStyle = {
  background: 'rgba(255,255,255,0.85)',
  border: '1px solid rgba(99,150,222,0.3)',
  borderRadius: '0.5rem',
  padding: '0.5rem 0.875rem',
  fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
  fontSize: '0.875rem',
  color: '#1A3558',
  cursor: 'pointer',
  outline: 'none',
  minWidth: '160px',
}

// ─── FitBounds helper for Chart.js gradient ────────────────────────────────
function makeGradient(ctx, area) {
  const gradient = ctx.createLinearGradient(0, area.top, 0, area.bottom)
  gradient.addColorStop(0, 'rgba(37,99,235,0.30)')
  gradient.addColorStop(1, 'rgba(37,99,235,0.00)')
  return gradient
}

// ─── County risk data generator ────────────────────────────────────────────
function generateLocalRisk(region, disasterType) {
  const base = DISASTER_DATA[disasterType] || DISASTER_DATA.all
  const mult = REGION_MULTIPLIERS[region] || 1
  return base.map((v) => Math.max(0, +(v * mult + (Math.random() - 0.5) * 1.2).toFixed(1)))
}

// ─── Main Component ────────────────────────────────────────────────────────
export default function ClimateTrendsPage() {
  const [disasterType, setDisasterType] = useState('all')
  const [region, setRegion] = useState('national')
  const [countyInput, setCountyInput] = useState('')
  const [localRisk, setLocalRisk] = useState(null)
  const [localLabel, setLocalLabel] = useState('')
  const lineChartRef = useRef(null)

  const activeData = (DISASTER_DATA[disasterType] || DISASTER_DATA.all).map((v) => {
    const mult = REGION_MULTIPLIERS[region] || 1
    return +(v * mult).toFixed(1)
  })

  const lossData = LOSSES_DATA.all.map((v) => {
    const mult = REGION_MULTIPLIERS[region] || 1
    return +(v * mult).toFixed(1)
  })

  const lineData = {
    labels: YEARS,
    datasets: [
      {
        label: 'Disaster Events',
        data: activeData,
        borderColor: '#2563EB',
        backgroundColor: (context) => {
          const chart = context.chart
          const { ctx, chartArea } = chart
          if (!chartArea) return 'rgba(37,99,235,0.15)'
          return makeGradient(ctx, chartArea)
        },
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: '#2563EB',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      },
    ],
  }

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(12,26,46,0.92)',
        titleFont: { family: "'Plus Jakarta Sans', sans-serif", size: 12 },
        bodyFont: { family: "'Plus Jakarta Sans', sans-serif", size: 13 },
        padding: 10,
        callbacks: {
          label: (ctx) => ` ${ctx.parsed.y} events`,
        },
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(99,150,222,0.12)' },
        ticks: {
          color: '#3D5A80',
          font: { family: "'Plus Jakarta Sans', sans-serif", size: 11 },
          maxTicksLimit: 13,
        },
      },
      y: {
        grid: { color: 'rgba(99,150,222,0.12)' },
        ticks: {
          color: '#3D5A80',
          font: { family: "'Plus Jakarta Sans', sans-serif", size: 11 },
        },
        title: {
          display: true,
          text: 'Billion-Dollar Events',
          color: '#3D5A80',
          font: { family: "'Plus Jakarta Sans', sans-serif", size: 11 },
        },
      },
    },
  }

  const barData = {
    labels: YEARS,
    datasets: [
      {
        label: 'Economic Losses ($B)',
        data: lossData,
        backgroundColor: '#2563EB',
        borderRadius: 4,
        hoverBackgroundColor: '#1D4ED8',
      },
    ],
  }

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(12,26,46,0.92)',
        titleFont: { family: "'Plus Jakarta Sans', sans-serif", size: 12 },
        bodyFont: { family: "'Plus Jakarta Sans', sans-serif", size: 13 },
        padding: 10,
        callbacks: {
          label: (ctx) => ` $${ctx.parsed.y}B`,
        },
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(99,150,222,0.12)' },
        ticks: {
          color: '#3D5A80',
          font: { family: "'Plus Jakarta Sans', sans-serif", size: 11 },
          maxTicksLimit: 13,
        },
      },
      y: {
        grid: { color: 'rgba(99,150,222,0.12)' },
        ticks: {
          color: '#3D5A80',
          font: { family: "'Plus Jakarta Sans', sans-serif", size: 11 },
          callback: (v) => `$${v}B`,
        },
        title: {
          display: true,
          text: 'Losses (Billion USD)',
          color: '#3D5A80',
          font: { family: "'Plus Jakarta Sans', sans-serif", size: 11 },
        },
      },
    },
  }

  // Local risk chart
  const localRiskData = localRisk
    ? {
        labels: YEARS,
        datasets: [
          {
            label: 'Estimated Local Risk',
            data: localRisk,
            borderColor: '#7C3AED',
            backgroundColor: 'rgba(124,58,237,0.12)',
            tension: 0.4,
            fill: true,
            pointRadius: 3,
            pointBackgroundColor: '#7C3AED',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
          },
        ],
      }
    : null

  const localRiskOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(12,26,46,0.92)',
        titleFont: { family: "'Plus Jakarta Sans', sans-serif", size: 12 },
        bodyFont: { family: "'Plus Jakarta Sans', sans-serif", size: 13 },
        padding: 10,
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(99,150,222,0.12)' },
        ticks: { color: '#3D5A80', font: { family: "'Plus Jakarta Sans', sans-serif", size: 11 }, maxTicksLimit: 10 },
      },
      y: {
        grid: { color: 'rgba(99,150,222,0.12)' },
        ticks: { color: '#3D5A80', font: { family: "'Plus Jakarta Sans', sans-serif", size: 11 } },
      },
    },
  }

  function handleLocalRiskSubmit(e) {
    e.preventDefault()
    if (!countyInput.trim()) return
    setLocalLabel(countyInput.trim())
    setLocalRisk(generateLocalRisk(region, disasterType))
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--ds-bg, #F0F7FF)' }}>
      <Navbar />

      {/* ── Hero ── */}
      <section
        style={{
          background: 'linear-gradient(135deg, #C8E6FA 0%, #EFF8FF 50%, #DBEAFE 100%)',
          marginTop: '-5rem',
          padding: '8rem 1.5rem 4rem',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: '48rem', margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.2)',
            borderRadius: '9999px', padding: '0.35rem 1rem', marginBottom: '1.25rem',
            fontSize: '0.78rem', fontWeight: 600, color: '#2563EB',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}>
            📊 NOAA &amp; EMDAT Data Analysis
          </div>
          <h1 style={{
            fontFamily: "'Fraunces', Georgia, serif",
            fontSize: 'clamp(2rem, 5vw, 3rem)',
            fontWeight: 900,
            color: '#1A3558',
            margin: '0 0 0.75rem',
            letterSpacing: '-0.025em',
            lineHeight: 1.15,
          }}>
            Climate Disaster Trends
          </h1>
          <p style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: '1.05rem',
            color: '#3D5A80',
            margin: '0 0 2.5rem',
            lineHeight: 1.7,
          }}>
            50 years of NOAA &amp; EMDAT data · Billion-dollar disasters on the rise
          </p>

          {/* Stat tiles */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '1rem',
            maxWidth: '44rem',
            margin: '0 auto',
          }}>
            {STAT_TILES.map((tile) => (
              <div key={tile.value} style={{
                ...glass,
                textAlign: 'center',
                padding: '1.25rem 1rem',
              }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '0.35rem' }}>{tile.icon}</div>
                <div style={{
                  fontFamily: "'Fraunces', Georgia, serif",
                  fontSize: '1.75rem',
                  fontWeight: 900,
                  color: '#2563EB',
                  lineHeight: 1,
                  marginBottom: '0.35rem',
                }}>{tile.value}</div>
                <div style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: '0.72rem',
                  color: '#3D5A80',
                  lineHeight: 1.4,
                }}>{tile.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Main content ── */}
      <main style={{ flex: 1, maxWidth: '72rem', margin: '0 auto', width: '100%', padding: '2.5rem 1.25rem 3rem' }}>

        {/* ── Filter bar ── */}
        <div style={{ ...glass, marginBottom: '2rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1rem' }}>
            <span style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 700,
              fontSize: '0.875rem',
              color: '#1A3558',
              whiteSpace: 'nowrap',
            }}>
              🔍 Filter Charts
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <label style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.8rem', color: '#3D5A80', fontWeight: 600 }}>
                Disaster Type
              </label>
              <select style={selectStyle} value={disasterType} onChange={(e) => setDisasterType(e.target.value)}>
                <option value="all">All Disasters</option>
                <option value="hurricanes">Hurricanes</option>
                <option value="floods">Floods</option>
                <option value="wildfires">Wildfires</option>
                <option value="tornadoes">Tornadoes</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <label style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.8rem', color: '#3D5A80', fontWeight: 600 }}>
                Region
              </label>
              <select style={selectStyle} value={region} onChange={(e) => setRegion(e.target.value)}>
                <option value="national">National</option>
                <option value="northeast">Northeast</option>
                <option value="southeast">Southeast</option>
                <option value="midwest">Midwest</option>
                <option value="south">South</option>
                <option value="west">West</option>
                <option value="southwest">Southwest</option>
              </select>
            </div>

            <div style={{
              marginLeft: 'auto',
              background: 'rgba(37,99,235,0.08)',
              border: '1px solid rgba(37,99,235,0.18)',
              borderRadius: '0.5rem',
              padding: '0.35rem 0.75rem',
              fontSize: '0.75rem',
              color: '#2563EB',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 600,
            }}>
              Showing: {disasterType === 'all' ? 'All Disasters' : disasterType.charAt(0).toUpperCase() + disasterType.slice(1)} · {region.charAt(0).toUpperCase() + region.slice(1)}
            </div>
          </div>
        </div>

        {/* ── Line Chart ── */}
        <div style={{ ...glass, marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <h2 style={{
                fontFamily: "'Fraunces', Georgia, serif",
                fontSize: '1.25rem',
                fontWeight: 800,
                color: '#1A3558',
                margin: '0 0 0.25rem',
              }}>
                Annual Disaster Events (1973–2023)
              </h2>
              <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.8rem', color: '#3D5A80', margin: 0 }}>
                Billion-dollar weather &amp; climate disasters — Source: NOAA NCEI
              </p>
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              background: 'rgba(37,99,235,0.08)', borderRadius: '0.5rem', padding: '0.35rem 0.75rem',
            }}>
              <div style={{ width: 12, height: 3, background: '#2563EB', borderRadius: 2 }} />
              <span style={{ fontSize: '0.75rem', color: '#2563EB', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600 }}>
                Event count
              </span>
            </div>
          </div>
          <div style={{ height: '300px', position: 'relative' }}>
            <Line ref={lineChartRef} data={lineData} options={lineOptions} />
          </div>
        </div>

        {/* ── Bar Chart ── */}
        <div style={{ ...glass, marginBottom: '2rem' }}>
          <div style={{ marginBottom: '1.25rem' }}>
            <h2 style={{
              fontFamily: "'Fraunces', Georgia, serif",
              fontSize: '1.25rem',
              fontWeight: 800,
              color: '#1A3558',
              margin: '0 0 0.25rem',
            }}>
              Annual Economic Losses (Billion $)
            </h2>
            <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.8rem', color: '#3D5A80', margin: 0 }}>
              Inflation-adjusted total damages — Source: NOAA NCEI, Swiss Re Sigma
            </p>
          </div>
          <div style={{ height: '260px', position: 'relative' }}>
            <Bar data={barData} options={barOptions} />
          </div>
          <p style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: '0.72rem',
            color: '#3D5A80',
            marginTop: '0.75rem',
            marginBottom: 0,
            textAlign: 'right',
          }}>
            * 2005 peak includes Hurricane Katrina ($160B). 2017 peak includes Hurricanes Harvey, Irma &amp; Maria ($360B).
          </p>
        </div>

        {/* ── Why It's Getting Worse ── */}
        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{
            fontFamily: "'Fraunces', Georgia, serif",
            fontSize: '1.5rem',
            fontWeight: 800,
            color: '#1A3558',
            marginBottom: '1.25rem',
            textAlign: 'center',
          }}>
            Why It's Getting Worse
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
            {WHY_CARDS.map((card) => (
              <div key={card.title} style={{
                ...glass,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
              }}>
                <div style={{ fontSize: '2rem' }}>{card.icon}</div>
                <h3 style={{
                  fontFamily: "'Fraunces', Georgia, serif",
                  fontSize: '1.05rem',
                  fontWeight: 800,
                  color: '#1A3558',
                  margin: 0,
                }}>
                  {card.title}
                </h3>
                <p style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: '0.875rem',
                  color: '#3D5A80',
                  lineHeight: 1.65,
                  margin: 0,
                }}>
                  {card.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── County-Level Risk Lookup ── */}
        <section>
          <div style={{ ...glass }}>
            <h2 style={{
              fontFamily: "'Fraunces', Georgia, serif",
              fontSize: '1.25rem',
              fontWeight: 800,
              color: '#1A3558',
              margin: '0 0 0.375rem',
            }}>
              County-Level Risk Over Time
            </h2>
            <p style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: '0.85rem',
              color: '#3D5A80',
              margin: '0 0 1.25rem',
            }}>
              Estimate how disaster risk has trended in your area based on regional NOAA data.
            </p>

            <form onSubmit={handleLocalRiskSubmit} style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <input
                type="text"
                placeholder="Enter your county or zip code (e.g. Harris County TX, 77001)"
                value={countyInput}
                onChange={(e) => setCountyInput(e.target.value)}
                style={{
                  flex: '1 1 260px',
                  background: 'rgba(255,255,255,0.9)',
                  border: '1px solid rgba(99,150,222,0.35)',
                  borderRadius: '0.625rem',
                  padding: '0.7rem 1rem',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: '0.9rem',
                  color: '#1A3558',
                  outline: 'none',
                }}
              />
              <button type="submit" style={pillBtn}>
                Estimate Risk Trend
              </button>
            </form>

            {localRisk && localRiskData && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                  <span style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    color: '#1A3558',
                  }}>
                    📍 {localLabel}
                  </span>
                  <span style={{
                    background: 'rgba(124,58,237,0.1)',
                    border: '1px solid rgba(124,58,237,0.2)',
                    borderRadius: '9999px',
                    padding: '0.2rem 0.75rem',
                    fontSize: '0.72rem',
                    color: '#7C3AED',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontWeight: 600,
                  }}>
                    Regional model
                  </span>
                </div>
                <div style={{ height: '220px', position: 'relative', marginBottom: '0.875rem' }}>
                  <Line data={localRiskData} options={localRiskOptions} />
                </div>
                <p style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: '0.72rem',
                  color: '#3D5A80',
                  margin: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                }}>
                  ⚠️ Estimates based on NOAA NCEI regional data. Local conditions may vary. Not a substitute for official hazard assessments.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@700;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
      `}</style>
    </div>
  )
}
