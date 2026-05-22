import React from 'react'

export const Card = ({ children, className = '' }) => (
  <div className={`rounded-xl p-5 mb-4 ${className}`}
    style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
    {children}
  </div>
)

export const SectionTitle = ({ children }) => (
  <div className="text-xs font-mono tracking-widest uppercase mb-4 pb-2"
    style={{ color: 'var(--dim)', borderBottom: '1px solid var(--border)', letterSpacing: '2px' }}>
    {children}
  </div>
)

export const Label = ({ children }) => (
  <label className="block text-xs font-mono uppercase mb-1.5 tracking-wide" style={{ color: 'var(--muted)' }}>
    {children}
  </label>
)

export const FormRow = ({ children }) => (
  <div className="mb-3.5">{children}</div>
)

export const Chip = ({ children, variant = 'gray' }) => {
  const styles = {
    red: { background: 'var(--red-bg)', color: 'var(--red)', border: '1px solid var(--red-border)' },
    amber: { background: 'var(--amber-bg)', color: 'var(--amber)', border: '1px solid var(--amber-border)' },
    green: { background: 'var(--green-bg)', color: 'var(--green)', border: '1px solid var(--green-border)' },
    blue: { background: 'var(--blue-bg)', color: 'var(--blue)', border: '1px solid var(--blue-border)' },
    purple: { background: 'var(--purple-bg)', color: 'var(--purple)', border: '1px solid var(--purple-border)' },
    gray: { background: 'var(--surface2)', color: 'var(--muted)', border: '1px solid var(--border)' },
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded font-mono text-xs font-medium"
      style={styles[variant] || styles.gray}>
      {children}
    </span>
  )
}

export const Btn = ({ children, onClick, variant = 'primary', size = 'md', disabled = false, className = '' }) => {
  const base = 'inline-flex items-center gap-2 rounded-lg font-medium font-sans cursor-pointer border-none transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed'
  const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2 text-sm' }
  const variants = {
    primary: { background: 'var(--accent)', color: '#fff' },
    secondary: { background: 'var(--surface2)', color: 'var(--text)', border: '1px solid var(--border)' },
    danger: { background: 'var(--red-bg)', color: 'var(--red)', border: '1px solid var(--red-border)' },
    success: { background: 'var(--green-bg)', color: 'var(--green)', border: '1px solid var(--green-border)' },
  }
  return (
    <button className={`${base} ${sizes[size]} ${className}`} style={variants[variant]} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  )
}

export const StatCard = ({ value, label, delta, deltaColor = 'var(--muted)', valueColor = 'var(--text)' }) => (
  <div className="rounded-lg p-4 text-center" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
    <div className="text-3xl font-semibold font-mono leading-none mb-1" style={{ color: valueColor }}>{value}</div>
    <div className="text-xs font-mono tracking-wide" style={{ color: 'var(--muted)' }}>{label}</div>
    {delta && <div className="text-xs mt-1.5" style={{ color: deltaColor }}>{delta}</div>}
  </div>
)

export const ProgressBar = ({ value, color = 'var(--accent)' }) => (
  <div className="rounded h-2 mt-1" style={{ background: 'var(--surface2)' }}>
    <div className="h-full rounded transition-all duration-500"
      style={{ width: `${value}%`, background: color }} />
  </div>
)

export const Toast = ({ message, show }) => (
  <div className="fixed bottom-5 right-5 z-50 px-5 py-3 rounded-xl text-sm font-mono transition-all duration-300"
    style={{
      background: 'var(--green-bg)', border: '1px solid var(--green-border)', color: 'var(--green)',
      transform: show ? 'translateY(0)' : 'translateY(80px)', opacity: show ? 1 : 0,
    }}>
    {message}
  </div>
)
