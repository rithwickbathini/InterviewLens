import React from 'react'

/* ---- Button ---- */
export function Button({ children, variant = 'primary', size = 'md', disabled, onClick, className = '', ...props }) {
  const base = 'btn'
  const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    ghost: 'btn-ghost',
    danger: 'btn-danger',
    outline: 'btn-outline'
  }
  const sizes = { sm: 'btn-sm', md: '', lg: 'btn-lg' }
  return (
    <button
      className={`${base} ${variants[variant] || ''} ${sizes[size] || ''} ${className}`}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  )
}

/* ---- Card ---- */
export function Card({ children, className = '', padding = true, ...props }) {
  return (
    <div className={`card ${padding ? 'card-pad' : ''} ${className}`} {...props}>
      {children}
    </div>
  )
}

/* ---- Badge ---- */
export function Badge({ children, color = 'default' }) {
  const colors = {
    default: 'badge-default',
    green: 'badge-green',
    amber: 'badge-amber',
    red: 'badge-red',
    blue: 'badge-blue',
    teal: 'badge-teal'
  }
  return <span className={`badge ${colors[color] || 'badge-default'}`}>{children}</span>
}

/* ---- Quality Badge ---- */
export function QualityBadge({ quality }) {
  const map = {
    Strong: { color: 'green', icon: '●' },
    Good: { color: 'blue', icon: '●' },
    Average: { color: 'amber', icon: '●' },
    Weak: { color: 'red', icon: '●' }
  }
  const { color, icon } = map[quality] || map['Average']
  return <Badge color={color}>{icon} {quality}</Badge>
}

/* ---- Progress Bar ---- */
export function ProgressBar({ value, max = 100, color = 'accent', label, showValue = true, size = 'md' }) {
  const pct = Math.round((value / max) * 100)
  const colors = {
    accent: 'var(--accent)',
    green: 'var(--green)',
    amber: 'var(--amber)',
    red: 'var(--red)',
    teal: 'var(--teal)'
  }
  const barColor = pct >= 75 ? colors.green : pct >= 50 ? colors.accent : pct >= 35 ? colors.amber : colors.red
  const heights = { sm: '4px', md: '8px', lg: '12px' }

  return (
    <div className="progress-wrap">
      {(label || showValue) && (
        <div className="progress-header">
          {label && <span className="progress-label">{label}</span>}
          {showValue && <span className="progress-value">{value}</span>}
        </div>
      )}
      <div className="progress-track" style={{ height: heights[size] }}>
        <div
          className="progress-fill"
          style={{ width: `${pct}%`, background: barColor, height: '100%' }}
        />
      </div>
    </div>
  )
}

/* ---- Score Card ---- */
export function ScoreCard({ label, value, icon }) {
  const color = value >= 75 ? 'var(--green)' : value >= 50 ? 'var(--accent)' : value >= 35 ? 'var(--amber)' : 'var(--red)'
  return (
    <div className="score-card">
      <div className="score-icon">{icon}</div>
      <div className="score-val" style={{ color }}>{value}</div>
      <div className="score-label">{label}</div>
      <ProgressBar value={value} size="sm" showValue={false} />
    </div>
  )
}

/* ---- Modal ---- */
export function Modal({ open, onClose, title, children, width = '480px' }) {
  if (!open) return null
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth: width }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onClose} aria-label="Close">×</button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  )
}

/* ---- Alert ---- */
export function Alert({ type = 'info', children, onClose }) {
  const types = {
    info: { bg: 'var(--accent-light)', border: 'var(--accent)', color: 'var(--accent-dark)', icon: 'ℹ' },
    success: { bg: 'var(--green-light)', border: 'var(--green)', color: 'var(--green)', icon: '✓' },
    warning: { bg: 'var(--amber-light)', border: 'var(--amber)', color: 'var(--amber)', icon: '⚠' },
    error: { bg: 'var(--red-light)', border: 'var(--red)', color: 'var(--red)', icon: '✕' }
  }
  const t = types[type] || types.info
  return (
    <div className="alert" style={{ background: t.bg, borderColor: t.border, color: t.color }}>
      <span className="alert-icon">{t.icon}</span>
      <span>{children}</span>
      {onClose && <button className="alert-close" onClick={onClose}>×</button>}
    </div>
  )
}

/* ---- Spinner ---- */
export function Spinner({ size = 24 }) {
  return (
    <div className="spinner" style={{ width: size, height: size }}></div>
  )
}

/* ---- Empty State ---- */
export function EmptyState({ icon, title, message, action }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon || '📋'}</div>
      <h3>{title}</h3>
      <p>{message}</p>
      {action}
    </div>
  )
}
