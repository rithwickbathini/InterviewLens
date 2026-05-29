import React, { useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import { useApp } from '../context/AppContext'
import { Card, Badge, QualityBadge, ProgressBar, Button, EmptyState } from '../components/ui/Components'
import '../styles/components.css'

function exportPDF(report, setup, sessionDate) {
  // Lazy-load jsPDF
  import('jspdf').then(({ default: jsPDF }) => {
    import('jspdf-autotable').then(() => {
      const doc = new jsPDF()
      const accent = [59, 91, 219]
      const gray = [100, 100, 120]

      // Header
      doc.setFillColor(...accent)
      doc.rect(0, 0, 210, 32, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(20)
      doc.setFont('helvetica', 'bold')
      doc.text('InterviewLens', 14, 14)
      doc.setFontSize(11)
      doc.setFont('helvetica', 'normal')
      doc.text('Interview Performance Report', 14, 22)
      doc.text(new Date(sessionDate).toLocaleDateString(), 160, 22)

      // Setup
      doc.setTextColor(...gray)
      doc.setFontSize(10)
      doc.text(`Role: ${setup?.role || '-'}  |  Difficulty: ${setup?.difficulty || '-'}  |  Questions: ${report.questionCount}`, 14, 42)

      // Overall
      doc.setTextColor(0, 0, 0)
      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.text(`Overall Score: ${report.overall}/100`, 14, 56)
      doc.setFontSize(12)
      doc.text(`Readiness Level: ${report.readiness}`, 14, 66)

      // Score table
      doc.autoTable({
        startY: 76,
        head: [['Metric', 'Score', 'Assessment']],
        body: [
          ['Confidence', report.avgConfidence, report.avgConfidence >= 75 ? 'Strong' : report.avgConfidence >= 55 ? 'Good' : 'Needs Work'],
          ['Communication', report.avgComm, report.avgComm >= 75 ? 'Strong' : report.avgComm >= 55 ? 'Good' : 'Needs Work'],
          ['Technical', report.avgTech, report.avgTech >= 75 ? 'Strong' : report.avgTech >= 55 ? 'Good' : 'Needs Work'],
        ],
        styles: { fontSize: 11 },
        headStyles: { fillColor: accent },
      })

      const y2 = doc.lastAutoTable.finalY + 12

      // Strengths
      doc.setFontSize(12); doc.setFont('helvetica', 'bold')
      doc.text('Top Strengths', 14, y2)
      doc.setFont('helvetica', 'normal'); doc.setFontSize(10)
      report.topStrengths.forEach((s, i) => doc.text(`• ${s}`, 16, y2 + 8 + i * 7))

      // Suggestions
      const y3 = y2 + 8 + report.topStrengths.length * 7 + 8
      doc.setFontSize(12); doc.setFont('helvetica', 'bold')
      doc.text('Key Suggestions', 14, y3)
      doc.setFont('helvetica', 'normal'); doc.setFontSize(10)
      report.topSuggestions.forEach((s, i) => doc.text(`• ${s}`, 16, y3 + 8 + i * 7))

      // Question detail
      const y4 = y3 + 8 + report.topSuggestions.length * 7 + 10
      doc.addPage()
      doc.setFontSize(14); doc.setFont('helvetica', 'bold')
      doc.text('Answer-by-Answer Breakdown', 14, 16)

      const rows = report.answers.map((a, i) => [
        `Q${i + 1}`,
        (a.question || '').substring(0, 60) + (a.question?.length > 60 ? '...' : ''),
        a.analysis.confidence,
        a.analysis.communication,
        a.analysis.technical,
        a.analysis.quality
      ])
      doc.autoTable({
        startY: 24,
        head: [['#', 'Question', 'Conf', 'Comm', 'Tech', 'Quality']],
        body: rows,
        styles: { fontSize: 9 },
        headStyles: { fillColor: accent },
        columnStyles: { 1: { cellWidth: 80 } }
      })

      doc.save(`InterviewLens_Report_${new Date(sessionDate).toISOString().slice(0, 10)}.pdf`)
    })
  })
}

export default function Report() {
  const { id } = useParams()
  const { state } = useApp()
  const navigate = useNavigate()

  const session = useMemo(() => {
    return state.sessions.find(s => s.id === id) || state.currentSession
  }, [id, state.sessions, state.currentSession])

  if (!session || !session.report) {
    return (
      <div className="page">
        <div className="container">
          <EmptyState
            icon="📄"
            title="Report not found"
            message="This session may have been cleared."
            action={<Button onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>}
          />
        </div>
      </div>
    )
  }

  const { report, setup, date, answers } = session
  const readinessColor = { 'Job Ready': 'green', 'Intermediate': 'blue', 'Beginner': 'amber' }

  const radarData = [
    { subject: 'Confidence', value: report.avgConfidence },
    { subject: 'Communication', value: report.avgComm },
    { subject: 'Technical', value: report.avgTech },
    { subject: 'Consistency', value: Math.round((report.avgConfidence + report.avgComm) / 2) },
    { subject: 'Depth', value: Math.round((report.avgComm + report.avgTech) / 2) },
  ]

  const barData = report.answers.map((a, i) => ({
    name: `Q${i + 1}`,
    Confidence: a.analysis.confidence,
    Communication: a.analysis.communication,
    Technical: a.analysis.technical,
  }))

  const learningRecs = []
  if (report.avgConfidence < 60) learningRecs.push({ area: 'Confidence', tips: ['Practice the STAR method', 'Record yourself and review', 'Reduce filler word usage'] })
  if (report.avgComm < 60) learningRecs.push({ area: 'Communication', tips: ['Study professional vocabulary', 'Practice structured responses', 'Read business communication books'] })
  if (report.avgTech < 60) learningRecs.push({ area: 'Technical Knowledge', tips: [`Review ${setup?.role} fundamentals`, 'Practice mock technical questions', 'Study recent industry trends'] })

  return (
    <div className="page">
      <div className="container">

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.75rem', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: '1.6rem', marginBottom: 4 }}>Interview Report</h1>
            <p style={{ color: 'var(--muted)', fontSize: 14 }}>
              {setup?.role} · {setup?.difficulty} · {report.questionCount} questions · {new Date(date).toLocaleDateString()}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="ghost" onClick={() => navigate('/setup')}>New Interview</Button>
            <Button variant="primary" onClick={() => exportPDF(report, setup, date)}>
              ↓ Download PDF
            </Button>
          </div>
        </div>

        {/* Overall score card */}
        <Card className="card-sm" style={{ padding: '2rem', marginBottom: '1.5rem', background: 'var(--ink)', color: 'white' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'center', minWidth: 100 }}>
              <div style={{ fontSize: '4rem', fontWeight: 700, fontFamily: 'var(--font-mono)', lineHeight: 1, color: report.overall >= 75 ? '#6ee7b7' : report.overall >= 55 ? '#93c5fd' : '#fca5a5' }}>
                {report.overall}
              </div>
              <div style={{ fontSize: 12, opacity: 0.6, marginTop: 4 }}>out of 100</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <h2 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: 0 }}>
                  {report.readiness === 'Job Ready' ? '🎉' : report.readiness === 'Intermediate' ? '📈' : '🌱'} {report.readiness}
                </h2>
                <Badge color={readinessColor[report.readiness]}>{report.readiness}</Badge>
              </div>
              <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                {[
                  { label: 'Confidence', val: report.avgConfidence },
                  { label: 'Communication', val: report.avgComm },
                  { label: 'Technical', val: report.avgTech },
                ].map(m => (
                  <div key={m.label}>
                    <div style={{ fontSize: 11, opacity: 0.65, marginBottom: 2 }}>{m.label}</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{m.val}</div>
                  </div>
                ))}
                <div>
                  <div style={{ fontSize: 11, opacity: 0.65, marginBottom: 2 }}>Trend</div>
                  <div style={{ fontSize: '1.25rem' }}>{report.trend === 'Improving' ? '↑' : report.trend === 'Declining' ? '↓' : '→'} {report.trend}</div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Charts */}
        <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
          <Card className="card-sm" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '0.95rem', marginBottom: '1rem' }}>Skill Profile</h3>
            <ResponsiveContainer width="100%" height={200}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: 'var(--slate)' }} />
                <Radar dataKey="value" stroke="var(--accent)" fill="var(--accent)" fillOpacity={0.18} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </Card>
          <Card className="card-sm" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '0.95rem', marginBottom: '1rem' }}>Answer Breakdown</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--muted)' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: 'var(--muted)' }} />
                <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="Confidence" fill="var(--accent)" radius={[3, 3, 0, 0]} />
                <Bar dataKey="Communication" fill="var(--teal)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Strengths + Suggestions */}
        <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
          <Card className="card-sm" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '0.95rem', marginBottom: '1rem', color: 'var(--green)' }}>✓ Top Strengths</h3>
            <ul className="strength-list">
              {report.topStrengths.map((s, i) => <li key={i}>{s}</li>)}
            </ul>
          </Card>
          <Card className="card-sm" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '0.95rem', marginBottom: '1rem' }}>💡 Key Suggestions</h3>
            <ul className="suggestion-list">
              {report.topSuggestions.map((s, i) => <li key={i}>{s}</li>)}
            </ul>
          </Card>
        </div>

        {/* Answer detail */}
        <Card className="card-sm" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '0.95rem', marginBottom: '1rem' }}>Question-by-Question Breakdown</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {report.answers.map((a, i) => (
              <details key={i} style={{ borderBottom: i < report.answers.length - 1 ? '1px solid var(--border-light)' : 'none' }}>
                <summary style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 0', cursor: 'pointer', listStyle: 'none' }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, flexShrink: 0 }}>
                    {i + 1}
                  </div>
                  <span style={{ flex: 1, fontSize: 14, color: 'var(--ink)', fontWeight: 500 }}>{a.question}</span>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <QualityBadge quality={a.analysis.quality} />
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--accent)' }}>
                      {Math.round((a.analysis.confidence + a.analysis.communication + a.analysis.technical) / 3)}
                    </span>
                  </div>
                </summary>
                <div style={{ padding: '0 0 1rem 38px' }}>
                  {a.transcript && a.transcript !== '[Skipped]' && (
                    <div style={{ background: 'var(--surface-2)', borderRadius: 'var(--radius-sm)', padding: '10px 12px', fontSize: 13, color: 'var(--slate)', lineHeight: 1.6, marginBottom: 12, fontStyle: 'italic' }}>
                      "{a.transcript}"
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 12, marginBottom: 10, flexWrap: 'wrap' }}>
                    {[
                      { label: 'Confidence', val: a.analysis.confidence },
                      { label: 'Communication', val: a.analysis.communication },
                      { label: 'Technical', val: a.analysis.technical },
                    ].map(m => (
                      <div key={m.label} style={{ minWidth: 120 }}>
                        <ProgressBar label={m.label} value={m.val} size="sm" />
                      </div>
                    ))}
                  </div>
                  {a.analysis.suggestions?.length > 0 && (
                    <ul className="suggestion-list" style={{ borderTop: '1px solid var(--border-light)', paddingTop: 8 }}>
                      {a.analysis.suggestions.slice(0, 2).map((s, j) => <li key={j}>{s}</li>)}
                    </ul>
                  )}
                </div>
              </details>
            ))}
          </div>
        </Card>

        {/* Learning recommendations */}
        {learningRecs.length > 0 && (
          <Card className="card-sm" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '0.95rem', marginBottom: '1rem' }}>📚 Learning Recommendations</h3>
            <div className="grid-3" style={{ gap: '1rem' }}>
              {learningRecs.map(rec => (
                <div key={rec.area} style={{ background: 'var(--surface-2)', borderRadius: 'var(--radius-sm)', padding: '1rem' }}>
                  <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 8 }}>{rec.area}</div>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {rec.tips.map((t, i) => (
                      <li key={i} style={{ fontSize: 13, color: 'var(--slate)', paddingLeft: 14, position: 'relative' }}>
                        <span style={{ position: 'absolute', left: 0, color: 'var(--accent)' }}>·</span>{t}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', paddingBottom: '1rem' }}>
          <Button variant="ghost" onClick={() => navigate('/dashboard')}>← Dashboard</Button>
          <Button variant="outline" onClick={() => navigate('/setup')}>Practice Again</Button>
          <Button variant="primary" onClick={() => exportPDF(report, setup, date)}>↓ Download Report PDF</Button>
        </div>

      </div>
      <style>{`
        details summary::-webkit-details-marker { display: none; }
      `}</style>
    </div>
  )
}
