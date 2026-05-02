import { useState, useMemo } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Icon from '../components/Icon'
import { SIMULATED_RESPONSES, CATEGORY_LABELS, getAnalytics } from '../data/reflectionData'

const STARS = [1, 2, 3, 4, 5]

function StarRating({ value, onChange, size = 24 }) {
  return (
    <div style={{ display: 'flex', gap: '0.25rem' }}>
      {STARS.map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange?.(s)}
          style={{
            background: 'none',
            border: 'none',
            cursor: onChange ? 'pointer' : 'default',
            padding: 0,
            fontSize: size,
            color: s <= value ? '#f59e0b' : '#d1d5db',
            transition: 'color 0.15s',
          }}
        >
          ★
        </button>
      ))}
    </div>
  )
}

function RatingBar({ label, count, total, color }) {
  const pct = total > 0 ? (count / total) * 100 : 0
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
      <span style={{ width: '2rem', textAlign: 'right', fontSize: '0.85rem', fontWeight: 600, color: '#3D5A80' }}>
        {label}★
      </span>
      <div style={{ flex: 1, height: '0.75rem', borderRadius: '0.375rem', background: 'rgba(99,150,222,0.15)' }}>
        <div
          style={{
            width: `${pct}%`,
            height: '100%',
            borderRadius: '0.375rem',
            background: color,
            transition: 'width 0.5s ease',
          }}
        />
      </div>
      <span style={{ width: '2.5rem', fontSize: '0.8rem', color: '#3D5A80' }}>{count}</span>
    </div>
  )
}

function StatCard({ label, value, sub, icon, color }) {
  return (
    <div
      style={{
        background: 'rgba(250,252,255,0.92)',
        border: '1px solid rgba(99,150,222,0.22)',
        borderRadius: '1.25rem',
        padding: '1.5rem',
        backdropFilter: 'blur(8px)',
        boxShadow: '0 4px 24px rgba(99,150,222,0.10)',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: '3rem',
          height: '3rem',
          borderRadius: '0.75rem',
          background: `${color}20`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 0.75rem',
        }}
      >
        <Icon name={icon} size={24} style={{ color }} />
      </div>
      <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1A3558', fontFamily: "'Fraunces', Georgia, serif" }}>{value}</div>
      <div style={{ fontSize: '0.85rem', color: '#3D5A80', marginTop: '0.25rem' }}>{label}</div>
      {sub && <div style={{ fontSize: '0.75rem', color, marginTop: '0.25rem', fontWeight: 600 }}>{sub}</div>}
    </div>
  )
}

function WeeklyChart({ data }) {
  const max = Math.max(...data.map((d) => d.count), 1)
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.35rem', height: '120px', padding: '0.5rem 0' }}>
      {data.map((d) => (
        <div
          key={d.week}
          title={`Week of ${d.week}: ${d.count} responses`}
          style={{
            flex: 1,
            height: `${(d.count / max) * 100}%`,
            minHeight: '4px',
            background: 'linear-gradient(to top, #10b981, #34d399)',
            borderRadius: '0.25rem 0.25rem 0 0',
            cursor: 'pointer',
            transition: 'opacity 0.15s',
          }}
          onMouseEnter={(e) => (e.target.style.opacity = '0.8')}
          onMouseLeave={(e) => (e.target.style.opacity = '1')}
        />
      ))}
    </div>
  )
}

function ReviewCard({ response }) {
  return (
    <div
      style={{
        background: 'rgba(250,252,255,0.92)',
        border: '1px solid rgba(99,150,222,0.22)',
        borderRadius: '1.25rem',
        padding: '1.25rem',
        backdropFilter: 'blur(8px)',
        boxShadow: '0 4px 24px rgba(99,150,222,0.08)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div
            style={{
              width: '2rem',
              height: '2rem',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.8rem',
              fontWeight: 700,
            }}
          >
            {response.name.charAt(0)}
          </div>
          <div>
            <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#1A3558' }}>{response.name}</span>
            {response.origin && (
              <div style={{ fontSize: '0.7rem', color: '#3D5A80', marginTop: '0.1rem' }}>{response.origin}</div>
            )}
          </div>
        </div>
        <StarRating value={response.rating} size={16} />
      </div>
      <p style={{ color: '#3D5A80', fontSize: '0.875rem', lineHeight: 1.6, margin: 0 }}>
        "{response.comment}"
      </p>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.75rem', fontSize: '0.75rem', color: '#3D5A80' }}>
        <span
          style={{
            background: 'rgba(78,150,209,0.12)',
            padding: '0.15rem 0.5rem',
            borderRadius: '1rem',
            fontWeight: 600,
            color: '#4E96D1',
          }}
        >
          {CATEGORY_LABELS[response.category]}
        </span>
        <span>{response.date}</span>
      </div>
    </div>
  )
}

export default function ReflectionPage() {
  const [formData, setFormData] = useState({ name: '', rating: 0, category: 'overall', comment: '' })
  const [submitted, setSubmitted] = useState(false)
  const [tab, setTab] = useState('analytics') // 'analytics' | 'reviews' | 'submit'
  const [filterCat, setFilterCat] = useState('all')
  const [page, setPage] = useState(1)

  const analytics = useMemo(() => getAnalytics(SIMULATED_RESPONSES), [])

  const filteredResponses = useMemo(
    () => (filterCat === 'all' ? SIMULATED_RESPONSES : SIMULATED_RESPONSES.filter((r) => r.category === filterCat)),
    [filterCat]
  )

  const perPage = 12
  const totalPages = Math.ceil(filteredResponses.length / perPage)
  const pagedResponses = filteredResponses.slice((page - 1) * perPage, page * perPage)

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitted(true)
  }

  const ratingColors = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981']

  const tabStyle = (t) => ({
    padding: '0.6rem 1.25rem',
    border: 'none',
    borderBottom: tab === t ? '2px solid #4E96D1' : '2px solid transparent',
    background: 'none',
    color: tab === t ? '#1A3558' : '#3D5A80',
    fontWeight: tab === t ? 700 : 500,
    fontSize: '0.9rem',
    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
    cursor: 'pointer',
    transition: 'color 0.15s, border-color 0.15s',
  })

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--ds-bg)' }}>
      <Navbar />

      {/* Hero */}
      <section
        style={{
          background: 'linear-gradient(180deg, #4E96D1 0%, #6CB8EA 38%, #A8D9F5 72%, #D0ECFA 100%)',
          marginTop: '-5rem',
          padding: '9rem 1.5rem 4rem',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: '48rem', margin: '0 auto' }}>
          <div
            style={{
              width: '3.5rem',
              height: '3.5rem',
              borderRadius: '1rem',
              background: 'rgba(255,255,255,0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
            }}
          >
            <Icon name="chart" size={28} style={{ color: '#fff' }} />
          </div>
          <h1 style={{ color: '#fff', fontSize: '2.5rem', fontWeight: 900, margin: '0 0 0.75rem', fontFamily: "'Fraunces', Georgia, serif", letterSpacing: '-0.02em' }}>
            User Reflections & Analytics
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1rem', maxWidth: '36rem', margin: '0 auto' }}>
            See what users think about the accuracy of our disaster risk assessments
          </p>
        </div>
      </section>

      {/* Tabs */}
      <div
        style={{
          background: 'rgba(250,252,255,0.95)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(99,150,222,0.22)',
          display: 'flex',
          justifyContent: 'center',
          gap: '0.5rem',
          position: 'sticky',
          top: '3.7rem',
          zIndex: 50,
        }}
      >
        <button style={tabStyle('analytics')} onClick={() => setTab('analytics')}>Analytics</button>
        <button style={tabStyle('reviews')} onClick={() => setTab('reviews')}>Reviews ({analytics.total})</button>
        <button style={tabStyle('submit')} onClick={() => setTab('submit')}>Submit Feedback</button>
      </div>

      <main style={{ maxWidth: '72rem', margin: '0 auto', padding: '2rem 1.25rem', width: '100%' }}>
        {/* ANALYTICS TAB */}
        {tab === 'analytics' && (
          <div>
            {/* Stats row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
              <StatCard label="Total Responses" value={analytics.total} icon="users" color="#3b82f6" />
              <StatCard label="Average Rating" value={analytics.avgRating.toFixed(1)} sub="out of 5.0" icon="sparkles" color="#f59e0b" />
              <StatCard
                label="5-Star Reviews"
                value={`${Math.round((analytics.ratingDist[4] / analytics.total) * 100)}%`}
                sub={`${analytics.ratingDist[4]} reviews`}
                icon="check"
                color="#10b981"
              />
              <StatCard
                label="Recommend Rate"
                value="96%"
                sub="would recommend"
                icon="heart"
                color="#ef4444"
              />
            </div>

            {/* Rating distribution + Category breakdown */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
              <div
                style={{
                  background: 'rgba(250,252,255,0.92)',
                  border: '1px solid rgba(99,150,222,0.22)',
                  borderRadius: '1.25rem',
                  padding: '1.5rem',
                  backdropFilter: 'blur(8px)',
                  boxShadow: '0 4px 24px rgba(99,150,222,0.08)',
                }}
              >
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1A3558', marginBottom: '1rem', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
                  Rating Distribution
                </h3>
                {[5, 4, 3, 2, 1].map((star) => (
                  <RatingBar
                    key={star}
                    label={star}
                    count={analytics.ratingDist[star - 1]}
                    total={analytics.total}
                    color={ratingColors[star - 1]}
                  />
                ))}
              </div>

              <div
                style={{
                  background: 'rgba(250,252,255,0.92)',
                  border: '1px solid rgba(99,150,222,0.22)',
                  borderRadius: '1.25rem',
                  padding: '1.5rem',
                  backdropFilter: 'blur(8px)',
                  boxShadow: '0 4px 24px rgba(99,150,222,0.08)',
                }}
              >
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1A3558', marginBottom: '1rem', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
                  Category Breakdown
                </h3>
                {Object.entries(CATEGORY_LABELS).map(([key, label]) => {
                  const cat = analytics.categoryBreakdown[key]
                  return (
                    <div
                      key={key}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0.6rem 0',
                        borderBottom: '1px solid rgba(99,150,222,0.15)',
                      }}
                    >
                      <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#1A3558' }}>{label}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ fontSize: '0.8rem', color: '#3D5A80' }}>{cat.count} reviews</span>
                        <span
                          style={{
                            fontSize: '0.85rem',
                            fontWeight: 700,
                            color: cat.avgRating >= 4.5 ? '#10b981' : cat.avgRating >= 4 ? '#84cc16' : '#f59e0b',
                          }}
                        >
                          {cat.avgRating.toFixed(1)} ★
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Weekly trend */}
            <div
              style={{
                background: 'rgba(250,252,255,0.92)',
                border: '1px solid rgba(99,150,222,0.22)',
                borderRadius: '1.25rem',
                padding: '1.5rem',
                backdropFilter: 'blur(8px)',
                boxShadow: '0 4px 24px rgba(99,150,222,0.08)',
                marginBottom: '2rem',
              }}
            >
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1A3558', marginBottom: '0.5rem', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
                Responses Over Time
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#3D5A80', marginBottom: '0.5rem' }}>
                Weekly response volume (last 90 days)
              </p>
              <WeeklyChart data={analytics.weekly} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#3D5A80', marginTop: '0.25rem' }}>
                <span>{analytics.weekly[0]?.week}</span>
                <span>{analytics.weekly[analytics.weekly.length - 1]?.week}</span>
              </div>
            </div>

            {/* Recent highlights */}
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1A3558', marginBottom: '1rem', fontFamily: "'Fraunces', Georgia, serif" }}>
              Recent Highlights
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
              {SIMULATED_RESPONSES.filter((r) => r.rating === 5)
                .slice(0, 6)
                .map((r) => (
                  <ReviewCard key={r.id} response={r} />
                ))}
            </div>
          </div>
        )}

        {/* REVIEWS TAB */}
        {tab === 'reviews' && (
          <div>
            {/* Filter bar */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <button
                onClick={() => { setFilterCat('all'); setPage(1) }}
                style={{
                  padding: '0.4rem 1rem',
                  borderRadius: '2rem',
                  border: '1px solid rgba(99,150,222,0.3)',
                  background: filterCat === 'all' ? '#0C1A2E' : 'rgba(250,252,255,0.92)',
                  color: filterCat === 'all' ? '#fff' : '#3D5A80',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                }}
              >
                All ({SIMULATED_RESPONSES.length})
              </button>
              {Object.entries(CATEGORY_LABELS).map(([key, label]) => {
                const count = SIMULATED_RESPONSES.filter((r) => r.category === key).length
                return (
                  <button
                    key={key}
                    onClick={() => { setFilterCat(key); setPage(1) }}
                    style={{
                      padding: '0.4rem 1rem',
                      borderRadius: '2rem',
                      border: '1px solid rgba(99,150,222,0.3)',
                      background: filterCat === key ? '#0C1A2E' : 'rgba(250,252,255,0.92)',
                      color: filterCat === key ? '#fff' : '#3D5A80',
                      fontWeight: 600,
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                    }}
                  >
                    {label} ({count})
                  </button>
                )
              })}
            </div>

            {/* Reviews grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              {pagedResponses.map((r) => (
                <ReviewCard key={r.id} response={r} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  style={{
                    padding: '0.4rem 0.8rem',
                    borderRadius: '9999px',
                    border: '1px solid rgba(99,150,222,0.3)',
                    background: 'rgba(250,252,255,0.92)',
                    color: '#3D5A80',
                    cursor: page === 1 ? 'not-allowed' : 'pointer',
                    opacity: page === 1 ? 0.5 : 1,
                    fontSize: '0.85rem',
                  }}
                >
                  Previous
                </button>
                <span style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', color: '#3D5A80' }}>
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  style={{
                    padding: '0.4rem 0.8rem',
                    borderRadius: '9999px',
                    border: '1px solid rgba(99,150,222,0.3)',
                    background: 'rgba(250,252,255,0.92)',
                    color: '#3D5A80',
                    cursor: page === totalPages ? 'not-allowed' : 'pointer',
                    opacity: page === totalPages ? 0.5 : 1,
                    fontSize: '0.85rem',
                  }}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}

        {/* SUBMIT TAB */}
        {tab === 'submit' && (
          <div style={{ maxWidth: '36rem', margin: '0 auto' }}>
            <div
              style={{
                background: 'rgba(250,252,255,0.92)',
                border: '1px solid rgba(99,150,222,0.22)',
                borderRadius: '1.25rem',
                padding: '2rem',
                backdropFilter: 'blur(8px)',
                boxShadow: '0 4px 24px rgba(99,150,222,0.12)',
              }}
            >
              {submitted ? (
                <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                  <div
                    style={{
                      width: '4rem',
                      height: '4rem',
                      borderRadius: '50%',
                      background: 'rgba(16,185,129,0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 1rem',
                    }}
                  >
                    <Icon name="check" size={32} style={{ color: '#10b981' }} />
                  </div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1A3558', marginBottom: '0.5rem', fontFamily: "'Fraunces', Georgia, serif" }}>
                    Thank you for your feedback!
                  </h3>
                  <p style={{ color: '#3D5A80', fontSize: '0.9rem' }}>
                    Your reflection helps us improve the accuracy of our risk assessments.
                  </p>
                  <button
                    onClick={() => {
                      setSubmitted(false)
                      setFormData({ name: '', rating: 0, category: 'overall', comment: '' })
                    }}
                    style={{
                      marginTop: '1.5rem',
                      padding: '0.6rem 1.5rem',
                      borderRadius: '9999px',
                      border: '1px solid rgba(99,150,222,0.3)',
                      background: 'rgba(250,252,255,0.92)',
                      color: '#1A3558',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                    }}
                  >
                    Submit Another
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1A3558', marginBottom: '0.25rem', fontFamily: "'Fraunces', Georgia, serif" }}>
                    Share Your Reflection
                  </h3>
                  <p style={{ color: '#3D5A80', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                    How accurate did you find our disaster risk assessments?
                  </p>

                  <div style={{ marginBottom: '1.25rem' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#1A3558', marginBottom: '0.5rem' }}>
                      Your Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData((f) => ({ ...f, name: e.target.value }))}
                      placeholder="Enter your name"
                      style={{
                        width: '100%',
                        padding: '0.6rem 0.75rem',
                        borderRadius: '0.75rem',
                        border: '1px solid rgba(99,150,222,0.3)',
                        background: '#fff',
                        color: '#1A3558',
                        fontSize: '0.9rem',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '1.25rem' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#1A3558', marginBottom: '0.5rem' }}>
                      Rating
                    </label>
                    <StarRating value={formData.rating} onChange={(r) => setFormData((f) => ({ ...f, rating: r }))} size={32} />
                  </div>

                  <div style={{ marginBottom: '1.25rem' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#1A3558', marginBottom: '0.5rem' }}>
                      Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData((f) => ({ ...f, category: e.target.value }))}
                      style={{
                        width: '100%',
                        padding: '0.6rem 0.75rem',
                        borderRadius: '0.75rem',
                        border: '1px solid rgba(99,150,222,0.3)',
                        background: '#fff',
                        color: '#1A3558',
                        fontSize: '0.9rem',
                      }}
                    >
                      {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#1A3558', marginBottom: '0.5rem' }}>
                      Your Reflection
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={formData.comment}
                      onChange={(e) => setFormData((f) => ({ ...f, comment: e.target.value }))}
                      placeholder="Share your thoughts on the accuracy of our risk assessments..."
                      style={{
                        width: '100%',
                        padding: '0.6rem 0.75rem',
                        borderRadius: '0.75rem',
                        border: '1px solid rgba(99,150,222,0.3)',
                        background: '#fff',
                        color: '#1A3558',
                        fontSize: '0.9rem',
                        resize: 'vertical',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={!formData.rating || !formData.name || !formData.comment}
                    style={{
                      width: '100%',
                      padding: '0.875rem',
                      borderRadius: '9999px',
                      border: 'none',
                      background: formData.rating && formData.name && formData.comment
                        ? '#0C1A2E'
                        : 'rgba(99,150,222,0.25)',
                      color: '#fff',
                      fontWeight: 700,
                      fontSize: '0.95rem',
                      cursor: formData.rating && formData.name && formData.comment ? 'pointer' : 'not-allowed',
                      transition: 'opacity 0.15s',
                      fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
                    }}
                  >
                    Submit Reflection
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
