import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { Card, Button, Alert, Modal } from '../components/ui/Components'
import { ROLES, DIFFICULTIES, QUESTION_COUNTS } from '../data/questions'
import '../styles/components.css'

const ROLE_ICONS = {
  'HR': '🤝', 'Technical': '⚙️', 'Coding': '💻',
  'Data Analyst': '📊', 'AI/ML': '🧠', 'ServiceNow': '🔧', 'Custom Role': '✨'
}

const ROLE_DESC = {
  'HR': 'Behavioral & situational questions for any role',
  'Technical': 'System design, CS fundamentals, and architecture',
  'Coding': 'Algorithms, data structures, and problem solving',
  'Data Analyst': 'SQL, statistics, analytics, and visualization',
  'AI/ML': 'Machine learning concepts, model design, and MLOps',
  'ServiceNow': 'ITSM, platform development, and workflows',
  'Custom Role': 'General questions for any custom role'
}

export default function Setup() {
  const { state, dispatch } = useApp()
  const navigate = useNavigate()
  const [setup, setSetup] = useState({
    role: 'HR',
    difficulty: 'intermediate',
    questionCount: 5,
    mode: 'voice',
    style: 'practice'
  })
  const [showKeys, setShowKeys] = useState(false)
  const [keys, setKeys] = useState({
    anthropic: state.apiKeys?.anthropic || '',
    groq: state.apiKeys?.groq || ''
  })

  const handleStart = () => {
    if (setup.mode === 'voice' && !state.apiKeys?.groq) {
      setShowKeys(true)
      return
    }
    dispatch({ type: 'SET_SETUP', payload: setup })
    navigate('/interview')
  }

  const saveKeys = () => {
    dispatch({ type: 'SET_API_KEYS', payload: keys })
    setShowKeys(false)
    dispatch({ type: 'SET_SETUP', payload: setup })
    navigate('/interview')
  }

  const opt = (field, value) => {
    setSetup(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="page">
      <div className="container-sm">

        <div className="section-header">
          <h1 style={{ fontSize: '1.6rem' }}>Interview Setup</h1>
          <p>Configure your practice session</p>
        </div>

        {/* Role selection */}
        <Card className="card-sm" style={{ padding: '1.5rem', marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '0.95rem', marginBottom: '1rem' }}>Interview Type</h3>
          <div className="grid-2" style={{ gap: 10 }}>
            {ROLES.map(role => (
              <div
                key={role}
                className={`role-option ${setup.role === role ? 'active' : ''}`}
                onClick={() => opt('role', role)}
              >
                <span className="role-icon">{ROLE_ICONS[role]}</span>
                <div>
                  <div className="role-name">{role}</div>
                  <div className="role-desc">{ROLE_DESC[role]}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Difficulty */}
        <Card className="card-sm" style={{ padding: '1.5rem', marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '0.95rem', marginBottom: '1rem' }}>Difficulty Level</h3>
          <div style={{ display: 'flex', gap: 10 }}>
            {DIFFICULTIES.map(d => (
              <button
                key={d}
                className={`choice-btn ${setup.difficulty === d ? 'active' : ''}`}
                onClick={() => opt('difficulty', d)}
                style={{ flex: 1 }}
              >
                <span className="choice-icon">
                  {d === 'beginner' ? '🟢' : d === 'intermediate' ? '🟡' : '🔴'}
                </span>
                <span style={{ textTransform: 'capitalize' }}>{d}</span>
              </button>
            ))}
          </div>
        </Card>

        {/* Question count */}
        <Card className="card-sm" style={{ padding: '1.5rem', marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '0.95rem', marginBottom: '1rem' }}>Number of Questions</h3>
          <div style={{ display: 'flex', gap: 10 }}>
            {QUESTION_COUNTS.map(n => (
              <button
                key={n}
                className={`choice-btn ${setup.questionCount === n ? 'active' : ''}`}
                onClick={() => opt('questionCount', n)}
                style={{ flex: 1 }}
              >
                {n} Questions
              </button>
            ))}
          </div>
        </Card>

        {/* Mode */}
        <Card className="card-sm" style={{ padding: '1.5rem', marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '0.95rem', marginBottom: '1rem' }}>Answer Mode</h3>
          <div style={{ display: 'flex', gap: 10 }}>
            {[
              { value: 'voice', label: '🎤 Voice', desc: 'Record your answer' },
              { value: 'text', label: '⌨️ Text', desc: 'Type your answer' },
            ].map(m => (
              <button
                key={m.value}
                className={`choice-btn ${setup.mode === m.value ? 'active' : ''}`}
                onClick={() => opt('mode', m.value)}
                style={{ flex: 1, flexDirection: 'column', gap: 4 }}
              >
                <span>{m.label}</span>
                <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 400 }}>{m.desc}</span>
              </button>
            ))}
          </div>
          {setup.mode === 'voice' && !state.apiKeys?.groq && (
            <Alert type="warning" style={{ marginTop: 10 }}>
              Voice mode requires a free Groq API key for transcription.
              <button style={{ marginLeft: 8, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500 }} onClick={() => setShowKeys(true)}>
                Set key →
              </button>
            </Alert>
          )}
        </Card>

        {/* Interview style */}
        <Card className="card-sm" style={{ padding: '1.5rem', marginBottom: '1.75rem' }}>
          <h3 style={{ fontSize: '0.95rem', marginBottom: '1rem' }}>Interview Style</h3>
          <div style={{ display: 'flex', gap: 10 }}>
            {[
              { value: 'practice', label: '📚 Practice Mode', desc: 'Feedback after each answer, can retry' },
              { value: 'simulation', label: '🎬 Real Simulation', desc: 'No feedback until the end — like a real interview' },
            ].map(m => (
              <button
                key={m.value}
                className={`choice-btn ${setup.style === m.value ? 'active' : ''}`}
                onClick={() => opt('style', m.value)}
                style={{ flex: 1, flexDirection: 'column', gap: 4 }}
              >
                <span>{m.label}</span>
                <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 400 }}>{m.desc}</span>
              </button>
            ))}
          </div>
        </Card>

        {/* Summary and start */}
        <Card className="card-sm" style={{ padding: '1.25rem', marginBottom: '1.25rem', background: 'var(--accent-light)', border: '1px solid rgba(59,91,219,0.2)' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 20px', fontSize: 14 }}>
            <span>📌 <strong>{setup.role}</strong></span>
            <span>📶 {setup.difficulty}</span>
            <span>❓ {setup.questionCount} questions</span>
            <span>{setup.mode === 'voice' ? '🎤' : '⌨️'} {setup.mode} mode</span>
            <span>{setup.style === 'practice' ? '📚 Practice' : '🎬 Simulation'}</span>
          </div>
        </Card>

        <Button variant="primary" className="btn-full btn-lg" onClick={handleStart}>
          Start Interview →
        </Button>

        {/* API Keys modal */}
        <Modal open={showKeys} onClose={() => setShowKeys(false)} title="🔑 API Keys Setup">
          <p style={{ fontSize: 14, color: 'var(--slate)', marginBottom: '1rem' }}>
            Voice mode uses <strong>Groq Whisper</strong> for transcription (free). 
            Claude analysis is optional for enhanced feedback.
          </p>

          <div className="form-group">
            <label className="form-label">
              Groq API Key (required for voice)
              <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer" style={{ marginLeft: 8, fontSize: 12 }}>Get free key ↗</a>
            </label>
            <input
              className="form-input" type="password" placeholder="gsk_..."
              value={keys.groq}
              onChange={e => setKeys({ ...keys, groq: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Anthropic API Key (optional — enhanced AI feedback)
              <a href="https://console.anthropic.com/keys" target="_blank" rel="noopener noreferrer" style={{ marginLeft: 8, fontSize: 12 }}>Get key ↗</a>
            </label>
            <input
              className="form-input" type="password" placeholder="sk-ant-..."
              value={keys.anthropic}
              onChange={e => setKeys({ ...keys, anthropic: e.target.value })}
            />
          </div>

          <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: '1rem' }}>
            Keys are saved in your browser's localStorage only.
          </p>

          <Button variant="primary" className="btn-full" onClick={saveKeys}>
            Save & Start Interview
          </Button>
        </Modal>

      </div>

      <style>{`
        .role-option {
          display: flex; align-items: flex-start; gap: 10px;
          padding: 12px; border-radius: var(--radius); border: 1px solid var(--border);
          cursor: pointer; transition: all 0.15s; background: var(--surface);
        }
        .role-option:hover { border-color: var(--accent); background: var(--accent-light); }
        .role-option.active { border-color: var(--accent); background: var(--accent-light); }
        .role-icon { font-size: 20px; flex-shrink: 0; margin-top: 1px; }
        .role-name { font-size: 14px; font-weight: 500; color: var(--ink); }
        .role-desc { font-size: 12px; color: var(--muted); margin-top: 2px; }
        .choice-btn {
          display: flex; align-items: center; justify-content: center; gap: 6px;
          padding: 10px 12px; border-radius: var(--radius-sm);
          border: 1px solid var(--border); background: var(--surface);
          font-size: 13px; font-weight: 500; color: var(--slate);
          cursor: pointer; transition: all 0.15s; font-family: var(--font-sans);
          text-align: center;
        }
        .choice-btn:hover { border-color: var(--accent); color: var(--accent); }
        .choice-btn.active { border-color: var(--accent); background: var(--accent-light); color: var(--accent); }
        .choice-icon { font-size: 16px; }
      `}</style>
    </div>
  )
}
