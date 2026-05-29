import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { Alert } from '../components/ui/Components'
import '../styles/components.css'

export default function Login() {
  const { dispatch } = useApp()
  const navigate = useNavigate()
  const [tab, setTab] = useState('login')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')

  const continueAsGuest = () => {
    dispatch({ type: 'SET_USER', payload: { name: 'Guest', isGuest: true } })
    navigate('/dashboard')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name && tab === 'signup') { setError('Name is required'); return }
    if (!form.email) { setError('Email is required'); return }
    if (!form.password || form.password.length < 4) { setError('Password must be at least 4 characters'); return }

    // Simulate local auth (no backend required)
    const user = {
      name: form.name || form.email.split('@')[0],
      email: form.email,
      isGuest: false
    }
    dispatch({ type: 'SET_USER', payload: user })
    navigate('/dashboard')
  }

  return (
    <div className="login-page">
      <div className="login-card card card-pad slide-up">
        <div className="login-logo">
          <span style={{ color: 'var(--accent)', fontSize: '1.5rem' }}>◈</span>
          <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', fontWeight: 600 }}>InterviewLens</span>
        </div>

        <div className="tabs" style={{ marginBottom: '1.5rem' }}>
          <button className={`tab-btn ${tab === 'login' ? 'active' : ''}`} onClick={() => setTab('login')}>Sign In</button>
          <button className={`tab-btn ${tab === 'signup' ? 'active' : ''}`} onClick={() => setTab('signup')}>Sign Up</button>
        </div>

        {error && <Alert type="error" onClose={() => setError('')}>{error}</Alert>}

        <form onSubmit={handleSubmit}>
          {tab === 'signup' && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" placeholder="Your name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
          )}
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" placeholder="••••••••" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
          </div>
          <button className="btn btn-primary btn-full" type="submit" style={{ marginTop: 8 }}>
            {tab === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="divider" style={{ margin: '1.25rem 0', display: 'flex', alignItems: 'center', gap: 10 }}>
          <hr style={{ flex: 1, border: 'none', borderTop: '1px solid var(--border)' }} />
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>or</span>
          <hr style={{ flex: 1, border: 'none', borderTop: '1px solid var(--border)' }} />
        </div>

        <button className="btn btn-secondary btn-full" onClick={continueAsGuest}>
          Continue as Guest
        </button>

        <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: 13, color: 'var(--muted)' }}>
          <Link to="/">← Back to home</Link>
        </p>
      </div>

      <style>{`
        .login-page {
          min-height: 100vh; background: var(--bg);
          display: flex; align-items: center; justify-content: center; padding: 1.5rem;
        }
        .login-card { width: 100%; max-width: 400px; }
        .login-logo { display: flex; align-items: center; gap: 8px; margin-bottom: 1.5rem; justify-content: center; }
      `}</style>
    </div>
  )
}
