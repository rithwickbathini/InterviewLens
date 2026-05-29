import React, { useState } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'

export default function Layout() {
  const { state, dispatch } = useApp()
  const location = useLocation()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/setup', label: 'Start Interview' },
  ]

  return (
    <div className="layout">
      <nav className="navbar">
        <div className="navbar-inner container">
          <Link to="/" className="nav-logo">
            <span className="logo-icon">◈</span>
            <span>InterviewLens</span>
          </Link>

          <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
            {navLinks.map(l => (
              <Link
                key={l.to}
                to={l.to}
                className={`nav-link ${location.pathname === l.to ? 'active' : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                {l.label}
              </Link>
            ))}
          </div>

          <div className="nav-actions">
            <button
              className="btn-icon"
              onClick={() => dispatch({ type: 'TOGGLE_THEME' })}
              aria-label="Toggle theme"
              title="Toggle dark/light mode"
            >
              {state.theme === 'light' ? '◑' : '○'}
            </button>
            <div className="nav-user">
              <span className="user-avatar">{state.user?.name?.[0] || 'G'}</span>
              <span className="user-name">{state.user?.name || 'Guest'}</span>
            </div>
            <button
              className="hamburger"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Menu"
            >
              <span /><span /><span />
            </button>
          </div>
        </div>
      </nav>

      <main className="main-content">
        <Outlet />
      </main>

      <footer className="app-footer">
        <div className="container">
          <span>© 2025 InterviewLens — AI Interview Coach</span>
          <span className="footer-links">
            <Link to="/">Home</Link>
            <Link to="/dashboard">Dashboard</Link>
          </span>
        </div>
      </footer>

      <style>{`
        .layout { min-height: 100vh; display: flex; flex-direction: column; }
        .navbar { background: var(--surface); border-bottom: 1px solid var(--border); position: sticky; top: 0; z-index: 100; }
        .navbar-inner { display: flex; align-items: center; justify-content: space-between; height: 58px; }
        .nav-logo { display: flex; align-items: center; gap: 8px; font-family: var(--font-serif); font-size: 1.1rem; font-weight: 600; color: var(--ink); text-decoration: none; }
        .logo-icon { color: var(--accent); font-size: 1.2rem; }
        .nav-links { display: flex; align-items: center; gap: 4px; }
        .nav-link { padding: 6px 14px; border-radius: var(--radius-sm); font-size: 14px; color: var(--slate); text-decoration: none; transition: all 0.15s; }
        .nav-link:hover { background: var(--surface-2); color: var(--ink); text-decoration: none; }
        .nav-link.active { background: var(--accent-light); color: var(--accent); }
        .nav-actions { display: flex; align-items: center; gap: 10px; }
        .btn-icon { width: 34px; height: 34px; border-radius: 50%; border: 1px solid var(--border); background: transparent; cursor: pointer; display: flex; align-items: center; justify-content: center; color: var(--slate); font-size: 16px; transition: all 0.15s; }
        .btn-icon:hover { background: var(--surface-2); }
        .nav-user { display: flex; align-items: center; gap: 8px; }
        .user-avatar { width: 30px; height: 30px; background: var(--accent-light); color: var(--accent); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 13px; }
        .user-name { font-size: 13px; color: var(--slate); }
        .hamburger { display: none; flex-direction: column; gap: 4px; cursor: pointer; background: none; border: none; padding: 4px; }
        .hamburger span { display: block; width: 20px; height: 2px; background: var(--slate); border-radius: 2px; }
        .main-content { flex: 1; }
        .app-footer { background: var(--surface); border-top: 1px solid var(--border); padding: 14px 0; }
        .app-footer .container { display: flex; justify-content: space-between; align-items: center; font-size: 13px; color: var(--muted); }
        .footer-links { display: flex; gap: 16px; }
        .footer-links a { color: var(--muted); text-decoration: none; font-size: 13px; }
        .footer-links a:hover { color: var(--slate); }
        @media (max-width: 640px) {
          .nav-links { display: none; position: absolute; top: 58px; left: 0; right: 0; background: var(--surface); border-bottom: 1px solid var(--border); flex-direction: column; padding: 12px; gap: 4px; }
          .nav-links.open { display: flex; }
          .hamburger { display: flex; }
          .user-name { display: none; }
        }
      `}</style>
    </div>
  )
}
