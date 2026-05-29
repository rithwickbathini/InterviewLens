import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import '../styles/components.css'

const FEATURES = [
  { icon: '🎤', title: 'Voice & Text Modes', desc: 'Record your answers with your microphone or type them. Accurate transcription via Whisper AI.' },
  { icon: '⚡', title: 'Instant Feedback', desc: 'Get scored on confidence, communication, and technical accuracy after every single answer.' },
  { icon: '📊', title: 'Detailed Analytics', desc: 'Track your progress over time with charts, trends, and skill-level breakdowns.' },
  { icon: '🎯', title: '7 Interview Types', desc: 'HR, Technical, Coding, Data Analyst, AI/ML, ServiceNow, and Custom roles.' },
  { icon: '📄', title: 'PDF Reports', desc: 'Download a full interview report with scores, feedback, and learning recommendations.' },
  { icon: '🧠', title: 'Adaptive Questions', desc: 'Questions adapt to your difficulty level — beginner, intermediate, or advanced.' },
]

const FAQ = [
  { q: 'Is InterviewLens free?', a: 'Yes. The core analysis is rule-based and free. Voice transcription uses the Groq API (free tier). AI-enhanced feedback uses the Anthropic Claude API (optional).' },
  { q: 'Do I need to create an account?', a: 'No. Guest access is fully supported. Your sessions are saved locally in your browser.' },
  { q: 'Which interview types are supported?', a: 'HR, Technical, Coding, Data Analyst, AI/ML, ServiceNow, and Custom Role.' },
  { q: 'Does it work on mobile?', a: 'Yes. The app is fully responsive and works on Chrome and Edge on mobile. Voice recording is supported on most modern mobile browsers.' },
  { q: 'How accurate is the voice recognition?', a: 'We use Groq\'s Whisper Large v3 model which is highly accurate across accents including Indian English.' },
]

export default function Landing() {
  const navigate = useNavigate()
  const { state } = useApp()

  return (
    <div className="landing">

      {/* Navbar */}
      <nav className="landing-nav">
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60 }}>
          <div className="nav-logo" style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-serif)', fontWeight: 600, fontSize: '1.1rem', color: 'var(--ink)' }}>
            <span style={{ color: 'var(--accent)' }}>◈</span> InterviewLens
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Link to="/login" className="btn btn-ghost btn-sm">Sign In</Link>
            <Link to="/setup" className="btn btn-primary btn-sm">Start Free →</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero slide-up">
        <div className="container-sm" style={{ textAlign: 'center', padding: '5rem 1.5rem 3rem' }}>
          <div className="hero-tag">AI-Powered Interview Coach</div>
          <h1 className="hero-title">
            Prepare smarter.<br />Interview with confidence.
          </h1>
          <p className="hero-sub">
            Practice real interview questions, get instant AI feedback on every answer,
            and track your improvement — completely free.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginTop: '2rem' }}>
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/setup')}>
              Start Practicing →
            </button>
            <button className="btn btn-ghost btn-lg" onClick={() => navigate('/dashboard')}>
              View Dashboard
            </button>
          </div>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: '1rem' }}>
            No account required · Works in Chrome & Edge
          </p>
        </div>
      </section>

      {/* Stats */}
      <section style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '2rem 0' }}>
        <div className="container">
          <div className="grid-4" style={{ textAlign: 'center', gap: '2rem' }}>
            {[
              { val: '7', label: 'Interview Types' },
              { val: '100+', label: 'Questions' },
              { val: '5 sec', label: 'Feedback Speed' },
              { val: '100%', label: 'Free to Use' },
            ].map(s => (
              <div key={s.val}>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', fontWeight: 600, color: 'var(--accent)' }}>{s.val}</div>
                <div style={{ fontSize: 13, color: 'var(--muted)' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '4rem 0' }}>
        <div className="container">
          <div className="section-header" style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h2>Everything you need to ace interviews</h2>
            <p>A complete interview prep toolkit, right in your browser</p>
          </div>
          <div className="grid-3">
            {FEATURES.map(f => (
              <div key={f.title} className="card card-pad card-sm" style={{ gap: '10px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: 28 }}>{f.icon}</div>
                <h4 style={{ fontSize: '0.95rem' }}>{f.title}</h4>
                <p style={{ fontSize: 13, margin: 0 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{ background: 'var(--surface-2)', padding: '4rem 0' }}>
        <div className="container">
          <div className="section-header" style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h2>How it works</h2>
          </div>
          <div className="grid-4" style={{ textAlign: 'center' }}>
            {[
              { step: '01', title: 'Choose Your Setup', desc: 'Select role, difficulty, number of questions, and voice or text mode.' },
              { step: '02', title: 'Answer Questions', desc: 'Speak or type your answers. Live transcription shows your words.' },
              { step: '03', title: 'Get Instant Feedback', desc: 'Every answer is scored on confidence, communication, and accuracy.' },
              { step: '04', title: 'Download Your Report', desc: 'Review your full performance report and download it as PDF.' },
            ].map(s => (
              <div key={s.step} style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--accent-light)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: 14 }}>{s.step}</div>
                <h4 style={{ fontSize: '0.9rem' }}>{s.title}</h4>
                <p style={{ fontSize: 13, color: 'var(--muted)' }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: '4rem 0' }}>
        <div className="container-sm">
          <div className="section-header" style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h2>Frequently asked questions</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
            {FAQ.map((f, i) => (
              <details key={i} style={{ background: 'var(--surface)', borderBottom: i < FAQ.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <summary style={{ padding: '1rem 1.25rem', cursor: 'pointer', fontWeight: 500, fontSize: 14, color: 'var(--ink)', listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  {f.q} <span style={{ color: 'var(--muted)', fontSize: 18 }}>+</span>
                </summary>
                <p style={{ padding: '0 1.25rem 1rem', fontSize: 14, color: 'var(--slate)', margin: 0 }}>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: 'var(--ink)', padding: '4rem 0', textAlign: 'center' }}>
        <div className="container-sm">
          <h2 style={{ color: '#fff', marginBottom: '1rem' }}>Ready to prepare for your next interview?</h2>
          <p style={{ color: 'rgba(255,255,255,0.65)', marginBottom: '2rem' }}>Start practicing now — no account required.</p>
          <button className="btn btn-primary btn-lg" onClick={() => navigate('/setup')}>
            Start Your First Interview →
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)', padding: '1.5rem 0' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, color: 'var(--muted)', flexWrap: 'wrap', gap: 10 }}>
          <span>© 2025 InterviewLens</span>
          <span>Built with React · Powered by Groq Whisper + Claude AI</span>
        </div>
      </footer>

      <style>{`
        .landing { min-height: 100vh; }
        .landing-nav { background: var(--surface); border-bottom: 1px solid var(--border); position: sticky; top: 0; z-index: 100; }
        .hero-tag { display: inline-block; background: var(--accent-light); color: var(--accent); font-size: 12px; font-weight: 600; padding: 4px 12px; border-radius: 20px; margin-bottom: 1.25rem; letter-spacing: 0.05em; text-transform: uppercase; }
        .hero-title { font-size: clamp(2rem, 5vw, 3.2rem); color: var(--ink); margin-bottom: 1rem; }
        .hero-sub { font-size: 1.05rem; color: var(--slate); max-width: 500px; margin: 0 auto; }
        details summary::-webkit-details-marker { display: none; }
      `}</style>
    </div>
  )
}
