import React, { useState } from 'react'
import { Toast } from './components/UI.jsx'
import IntakeForm from './components/IntakeForm.jsx'
import QADashboard from './components/QADashboard.jsx'
import CAPAModule from './components/CAPAModule.jsx'
import Analytics from './components/Analytics.jsx'

const TABS = [
  { id: 'intake', label: 'Intake', dot: '#ef4444', badge: null },
  { id: 'dashboard', label: 'QA Dashboard', dot: '#f59e0b', badge: null },
  { id: 'capa', label: 'CAPA', dot: '#60a5fa', badge: 'ACTIVE' },
  { id: 'analytics', label: 'Analytics', dot: '#a78bfa', badge: null },
]

export default function App() {
  const [activeTab, setActiveTab] = useState('intake')
  const [tickets, setTickets] = useState([])
  const [toast, setToast] = useState({ show: false, message: '' })

  const showToast = (message) => {
    setToast({ show: true, message })
    setTimeout(() => setToast({ show: false, message: '' }), 3200)
  }

  const handleSubmit = (formData) => {
    const newTicket = {
      id: formData.ref,
      desc: formData.description.slice(0, 60) + (formData.description.length > 60 ? '...' : ''),
      cat: formData.triage.category.toLowerCase().replace(' ', '-'),
      catLabel: formData.triage.category,
      catChip: { 'Food Safety': 'red', 'Legality': 'amber', 'Quality': 'blue', 'General Feedback': 'green' }[formData.triage.category] || 'gray',
      product: formData.product,
      assigned: formData.triage.suggested_capa_owner || 'QA Manager',
      status: 'open',
      statusChip: 'red',
      statusLabel: 'OPEN',
    }
    setTickets(t => [newTicket, ...t])
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg)' }}>
      <header style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '0 24px', display: 'flex', alignItems: 'center', gap: 16, height: 56, position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 28, height: 28, background: 'linear-gradient(135deg,#3b82f6,#a78bfa)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#fff', fontWeight: 700, fontFamily: 'IBM Plex Mono' }}>
            QA
          </div>
          <span style={{ fontWeight: 600, fontSize: 15, color: 'var(--text)', letterSpacing: '-0.3px' }}>CompliantTrack</span>
          <span style={{ fontSize: 9, fontFamily: 'IBM Plex Mono', background: 'var(--green-bg)', color: 'var(--green)', border: '1px solid var(--green-border)', padding: '2px 6px', borderRadius: 3, letterSpacing: 1 }}>
            FSSC 22000 · BRCGS
          </span>
        </div>
        <nav style={{ display: 'flex', gap: 2, marginLeft: 'auto' }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              style={{
                background: activeTab === t.id ? 'var(--blue-bg)' : 'none',
                border: activeTab === t.id ? '1px solid var(--blue-border)' : '1px solid transparent',
                color: activeTab === t.id ? 'var(--accent)' : 'var(--muted)',
                fontFamily: 'Sora, sans-serif', fontSize: 13, padding: '6px 14px', borderRadius: 6,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap',
                transition: 'all 0.15s',
              }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: t.dot, display: 'inline-block' }} />
              {t.label}
              {t.badge && (
                <span style={{ fontSize: 8, fontFamily: 'IBM Plex Mono', background: 'var(--amber-bg)', color: 'var(--amber)', border: '1px solid var(--amber-border)', padding: '1px 4px', borderRadius: 3 }}>
                  {t.badge}
                </span>
              )}
            </button>
          ))}
        </nav>
      </header>
      <main style={{ flex: 1, padding: '24px', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
        {activeTab === 'intake' && <IntakeForm onSubmit={handleSubmit} showToast={showToast} />}
        {activeTab === 'dashboard' && <QADashboard tickets={tickets} onOpenCapa={() => setActiveTab('capa')} />}
        {activeTab === 'capa' && <CAPAModule showToast={showToast} />}
        {activeTab === 'analytics' && <Analytics />}
      </main>
      <Toast message={toast.message} show={toast.show} />
    </div>
  )
}
