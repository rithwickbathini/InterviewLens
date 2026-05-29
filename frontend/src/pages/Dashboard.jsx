import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import { useApp } from '../context/AppContext'
import { Card, Badge, QualityBadge, EmptyState, Button, ProgressBar } from '../components/ui/Components'
import '../styles/components.css'

export default function Dashboard() {
  const { state } = useApp()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')
  const sessions = state.sessions || []

  const stats = useMemo(() => {
    if (!sessions.length) return null
    const reports = sessions.map(s => s.report).filter(Boolean)
    if (!reports.length) return null

    const avgOverall = Math.round(reports.reduce((s, r) => s + r.overall, 0) / reports.length)
    const avgConf = Math.round(reports.reduce((s, r) => s + r.avgConfidence, 0) / reports.length)
    const avgComm = Math.round(reports.reduce((s, r) => s + r.avgComm, 0) / reports.length)
    const avgTech = Math.round(reports.reduce((s, r) => s + r.avgTech, 0) / reports.length)

    const streak = sessions.filter((s, i) => {
      if (i === 0) return true
      const prev = new Date(sessions[i - 1].date)
      const curr = new Date(s.date)
      return (prev - curr) < 86400000 * 2
    }).length

    // Trend data
    const trendData = reports.slice().reverse().slice(-8).map((r, i) => ({
      session: `S${i + 1}`,
      score: r.overall,
      confidence: r.avgConfidence,
      communication: r.avgComm
    }))

    // Radar
    const radar = [
      { subject: 'Confidence', value: avgConf },
      { subject: 'Communication', value: avgComm },
      { subject: 'Technical', value: avgTech },
      { subject: 'Structure', value: Math.round((avgComm + avgTech) / 2) },
      { subject: 'Clarity', value: Math.round((avgConf + avgComm) / 2) },
    ]

    // Weak areas across all sessions
    const allWeak = reports.flatMap(r => r.weakAreas || [])
    const weakCount = allWeak.reduce((acc, w) => { acc[w] = (acc[w] || 0) + 1; return acc }, {})
    const topWeak = Object.entries(weakCount).sort((a, b) => b[1] - a[1]).slice(0, 3)

    return { avgOverall, avgConf, avgComm, avgTech, streak, trendData, radar, topWeak }
  }, [sessions])

  const readinessColor = (r) => {
    if (r === 'Job Ready') return 'green'
    if (r === 'Intermediate') return 'blue'
    return 'amber'
  }

  return (
    <div className="page">
      <div className="container">

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.75rem', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: '1.6rem', marginBottom: 4 }}>
              Welcome back, {state.user?.name || 'Candidate'}
            </h1>
            <p style={{ color: 'var(--muted)', fontSize: 14 }}>
              {sessions.length} interview session{sessions.length !== 1 ? 's' : ''} completed
            </p>
          </div>
          <Button onClick={() => navigate('/setup')}>Start New Interview →</Button>
        </div>

        {/* Empty state */}
        {!sessions.length && (
          <div style={{ padding: '3rem 0' }}>
            <EmptyState
              icon="🎯"
              title="No interviews yet"
              message="Start your first practice session to see your performance analytics here."
              action={<Button onClick={() => navigate('/setup')} style={{ marginTop: '1rem' }}>Start Your First Interview</Button>}
            />
          </div>
        )}

        {sessions.length > 0 && stats && (
          <>
            {/* Stats row */}
            <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
              {[
                { label: 'Overall Score', value: stats.avgOverall, icon: '📊', suffix: '/100' },
                { label: 'Confidence', value: stats.avgConf, icon: '💪', suffix: '/100' },
                { label: 'Communication', value: stats.avgComm, icon: '🗣', suffix: '/100' },
                { label: 'Practice Streak', value: stats.streak, icon: '🔥', suffix: ' days' },
              ].map(s => (
                <Card key={s.label} className="card-sm" style={{ textAlign: 'center', padding: '1.25rem' }}>
                  <div style={{ fontSize: 24, marginBottom: 4 }}>{s.icon}</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>
                    {s.value}<span style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>{s.suffix}</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{s.label}</div>
                </Card>
              ))}
            </div>

            {/* Charts row */}
            <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
              {/* Trend chart */}
              <Card className="card-sm" style={{ padding: '1.25rem' }}>
                <h3 style={{ fontSize: '0.95rem', marginBottom: '1rem' }}>Score Trend</h3>
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={stats.trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="session" tick={{ fontSize: 11, fill: 'var(--muted)' }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: 'var(--muted)' }} />
                    <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
                    <Line type="monotone" dataKey="score" stroke="var(--accent)" strokeWidth={2} dot={{ fill: 'var(--accent)', r: 3 }} name="Overall" />
                    <Line type="monotone" dataKey="confidence" stroke="var(--green)" strokeWidth={1.5} strokeDasharray="4 2" dot={false} name="Confidence" />
                  </LineChart>
                </ResponsiveContainer>
              </Card>

              {/* Radar chart */}
              <Card className="card-sm" style={{ padding: '1.25rem' }}>
                <h3 style={{ fontSize: '0.95rem', marginBottom: '1rem' }}>Skill Radar</h3>
                <ResponsiveContainer width="100%" height={180}>
                  <RadarChart data={stats.radar}>
                    <PolarGrid stroke="var(--border)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: 'var(--slate)' }} />
                    <Radar name="Score" dataKey="value" stroke="var(--accent)" fill="var(--accent)" fillOpacity={0.15} strokeWidth={2} />
                  </RadarChart>
                </ResponsiveContainer>
              </Card>
            </div>

            {/* Weak areas */}
            {stats.topWeak.length > 0 && (
              <Card className="card-sm" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '0.95rem', marginBottom: '1rem' }}>Areas Needing Attention</h3>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {stats.topWeak.map(([area, count]) => (
                    <div key={area} style={{ background: 'var(--amber-light)', color: 'var(--amber)', padding: '6px 14px', borderRadius: 'var(--radius-sm)', fontSize: 13, fontWeight: 500 }}>
                      ⚠ {area} <span style={{ opacity: 0.7, fontSize: 11 }}>×{count}</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Session history */}
            <Card className="card-sm" style={{ padding: '1.25rem' }}>
              <h3 style={{ fontSize: '0.95rem', marginBottom: '1rem' }}>Session History</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {sessions.slice(0, 10).map((s, i) => (
                  <div
                    key={s.id}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < Math.min(sessions.length, 10) - 1 ? '1px solid var(--border-light)' : 'none', flexWrap: 'wrap', gap: 8 }}
                  >
                    <div style={{ display: 'flex', flex: 1, gap: 12, alignItems: 'center', minWidth: 200 }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>
                        {i + 1}
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)' }}>{s.setup?.role || 'Interview'}</div>
                        <div style={{ fontSize: 12, color: 'var(--muted)' }}>{s.setup?.difficulty} · {s.setup?.questionCount} questions · {new Date(s.date).toLocaleDateString()}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {s.report && <Badge color={readinessColor(s.report.readiness)}>{s.report.readiness}</Badge>}
                      {s.report && <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent)', fontSize: 15 }}>{s.report.overall}</span>}
                      <Button size="sm" variant="ghost" onClick={() => navigate(`/report/${s.id}`)}>View →</Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
