import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function NotFound() {
  const navigate = useNavigate()
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', textAlign: 'center', padding: '2rem', background: 'var(--bg)' }}>
      <div style={{ fontSize: '5rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--border)', lineHeight: 1 }}>404</div>
      <h2 style={{ fontSize: '1.5rem' }}>Page not found</h2>
      <p style={{ color: 'var(--muted)' }}>The page you're looking for doesn't exist.</p>
      <button className="btn btn-primary" onClick={() => navigate('/')}>Go Home</button>
    </div>
  )
}
