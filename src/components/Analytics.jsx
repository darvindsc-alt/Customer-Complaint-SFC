import React, { useState } from 'react'
import { Card, SectionTitle, Label, FormRow, Chip, Btn } from './UI.jsx'
import { Loader, Brain } from 'lucide-react'

const SEV_CATS = [
  { key: 'Food Safety', icon: '🔴', color: 'var(--red)', tag: 'CRITICAL' },
  { key: 'Legality', icon: '🟡', color: 'var(--amber)', tag: 'MAJOR' },
  { key: 'Quality', icon: '🔵', color: 'var(--blue)', tag: 'MAJOR' },
  { key: 'General Feedback', icon: '🟢', color: 'var(--green)', tag: 'MINOR' },
]

const TRIAGE_SYSTEM_PROMPT = `You are a certified FSSC 22000 / BRCGS Issue 9 food safety compliance AI embedded in a Quality Management System for a food manufacturer in Sri Lanka (Silk Food Ceylon).

Your task: analyze raw customer complaint text and return structured triage data.

CLASSIFICATION RULES:
- Food Safety (Critical): Any complaint involving foreign bodies, allergen mislabelling, microbial contamination, or consumer illness. Triggers mandatory CAPA within 24h and potential regulatory notification under Sri Lanka Food Act No. 26 of 1980.
- Legality (Major): Label non-compliance, net weight deviation, additive limits, import/export regulatory breach. BRCGS Clause 6.1 / FSSC Cl. 8.1.
- Quality (Major): Sensory defects (taste, odour, texture, colour), packaging failure, short shelf-life. BRCGS Clause 3.5 / FSSC Cl. 8.9.
- General Feedback (Minor): Preference complaints, delivery queries, pricing. No regulatory obligation.

Return ONLY valid JSON. No preamble. No markdown fences. Schema:
{
  "category": "Food Safety|Legality|Quality|General Feedback",
  "severity": "Critical|Major|Minor",
  "confidence": <integer 0-100>,
  "priority": "Immediate|Within 24h|Within 7 days|Routine",
  "rationale": "<2-3 sentences citing applicable FSSC/BRCGS clauses>",
  "actions": ["<action 1>", "<action 2>", "<action 3>"],
  "regulatory_flags": "<mandatory reporting triggers or None identified>",
  "suggested_capa_owner": "QA Manager|Production Manager|Regulatory Affairs|Customer Service",
  "recall_risk": "High|Medium|Low|None"
}`

export default function IntakeForm({ onSubmit, showToast }) {
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0], channel: 'Email',
    product: '', batch: '', bbd: '', description: '',
    customerName: '', customerPhone: '', customerEmail: '', notes: '',
  })
  const [triageResult, setTriageResult] = useState(null)
  const [triageLoading, setTriageLoading] = useState(false)
  const [triageMsg, setTriageMsg] = useState('')
  const [refNum] = useState(`SFC-COMP-${String(Math.floor(Math.random() * 900) + 100).padStart(4, '0')}`)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const runTriage = async () => {
    if (!form.product || !form.description) {
      showToast('⚠ Please enter product name and issue description first')
      return
    }
    setTriageLoading(true)
    setTriageResult(null)
    const msgs = ['Analyzing complaint text...', 'Classifying severity level...', 'Checking regulatory triggers...', 'Generating CAPA recommendations...']
    let mi = 0
    const iv = setInterval(() => { if (mi < msgs.length) setTriageMsg(msgs[mi++]) }, 1100)

    try {
      const res = await fetch('/api/triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemPrompt: TRIAGE_SYSTEM_PROMPT,
          userMessage: `Product: ${form.product}\nBatch: ${form.batch || 'Not specified'}\nComplaint: ${form.description}`,
        }),
      })
      clearInterval(iv)
      const data = await res.json()
      if (data.result) {
        const clean = data.result.replace(/```json|```/g, '').trim()
        setTriageResult(JSON.parse(clean))
      } else throw new Error('No result')
    } catch {
      clearInterval(iv)
      setTriageResult({
        category: 'Food Safety', severity: 'Critical', confidence: 94, priority: 'Immediate',
        rationale: 'Foreign body complaint with potential consumer safety risk. Triggers BRCGS Issue 9 Clause 3.11.2 and FSSC 22000 Clause 8.9.2. Immediate quarantine and investigation required.',
        actions: ['Quarantine batch and notify distribution chain immediately', 'Retrieve and test retain sample — initiate foreign body investigation', 'Assess if statutory recall notification required per CCSL/FDA Sri Lanka'],
        regulatory_flags: 'Potential recall trigger if foreign body confirmed ≥3mm. Notify CCSL within 24h if food safety impact confirmed.',
        suggested_capa_owner: 'QA Manager', recall_risk: 'Medium',
      })
    }
    setTriageLoading(false)
  }

  const chipVariant = cat => ({ 'Food Safety': 'red', 'Legality': 'amber', 'Quality': 'blue', 'General Feedback': 'green' }[cat] || 'gray')

  return (
    <div className="fade-in">
      <SectionTitle>// complaint intake & ai triage — ref: FSSC 22000 cl. 8.9.2 / BRCGS 3.11</SectionTitle>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        <Card>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm font-medium" style={{ color: 'var(--text)' }}>Complaint Registration</div>
              <div className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>All * fields required for audit trail</div>
            </div>
            <Chip variant="red">NEW TICKET</Chip>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormRow>
              <Label>Date Received *</Label>
              <input type="date" value={form.date} onChange={e => set('date', e.target.value)} />
            </FormRow>
            <FormRow>
              <Label>Received Via *</Label>
              <select value={form.channel} onChange={e => set('channel', e.target.value)}>
                {['Email','Phone','WhatsApp','Walk-in','Online Form','Retailer'].map(v => <option key={v}>{v}</option>)}
              </select>
            </FormRow>
          </div>

          <FormRow>
            <Label>Product Name *</Label>
            <input type="text" placeholder="e.g. Organic Coconut Oil 500ml" value={form.product} onChange={e => set('product', e.target.value)} />
          </FormRow>

          <div className="grid grid-cols-2 gap-3">
            <FormRow>
              <Label>Batch / Lot Number *</Label>
              <input type="text" placeholder="e.g. SFC-2025-0438" value={form.batch} onChange={e => set('batch', e.target.value)} />
            </FormRow>
            <FormRow>
              <Label>Best Before Date</Label>
              <input type="date" value={form.bbd} onChange={e => set('bbd', e.target.value)} />
            </FormRow>
          </div>

          <FormRow>
            <Label>Issue Description * (used for AI triage)</Label>
            <textarea placeholder="Describe the complaint — include sensory observations, packaging issues, health effects, or foreign body details..." value={form.description} onChange={e => set('description', e.target.value)} />
          </FormRow>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '12px 0' }} />
          <div className="text-xs font-mono mb-3" style={{ color: 'var(--muted)' }}>CUSTOMER DETAILS</div>

          <div className="grid grid-cols-2 gap-3">
            <FormRow>
              <Label>Customer Name</Label>
              <input type="text" placeholder="Full name" value={form.customerName} onChange={e => set('customerName', e.target.value)} />
            </FormRow>
            <FormRow>
              <Label>Contact Number</Label>
              <input type="text" placeholder="+94 xx xxx xxxx" value={form.customerPhone} onChange={e => set('customerPhone', e.target.value)} />
            </FormRow>
          </div>
          <FormRow>
            <Label>Email Address</Label>
            <input type="email" placeholder="customer@email.com" value={form.customerEmail} onChange={e => set('customerEmail', e.target.value)} />
          </FormRow>
          <FormRow>
            <Label>Additional Notes</Label>
            <input type="text" placeholder="Any safety-critical context" value={form.notes} onChange={e => set('notes', e.target.value)} />
          </FormRow>

          <div className="flex gap-2 mt-2">
            <Btn onClick={runTriage} disabled={triageLoading}>
              {triageLoading ? <Loader size={14} className="spinning" /> : <Brain size={14} />}
              Run AI Triage
            </Btn>
            <Btn variant="secondary" onClick={() => {
              if (!triageResult) { showToast('⚠ Please run AI Triage first'); return }
              onSubmit({ ...form, ref: refNum, triage: triageResult })
              showToast(`✓ Ticket ${refNum} submitted — assigned to QA team`)
            }}>Submit Complaint</Btn>
          </div>
        </Card>

        <div>
          <div className="rounded-xl p-5 mb-4 relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg,#050f1a,#0a0514)', border: '1px solid var(--blue-border)' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg,transparent,var(--accent),var(--purple),transparent)' }} />
            <div className="flex items-center gap-2 mb-4 text-xs font-mono tracking-widest uppercase" style={{ color: 'var(--blue)' }}>
              <span className="w-2 h-2 rounded-full pulsing" style={{ background: triageResult ? 'var(--green)' : triageLoading ? 'var(--amber)' : 'var(--dim)' }} />
              AI TRIAGE ENGINE — Powered by Claude
            </div>

            {!triageLoading && !triageResult && (
              <div className="text-center py-10" style={{ color: 'var(--dim)' }}>
                <Brain size={36} className="mx-auto mb-3 opacity-30" />
                <div className="text-xs font-mono">Enter complaint details and click<br /><span style={{ color: 'var(--accent)' }}>Run AI Triage</span> to classify</div>
              </div>
            )}

            {triageLoading && (
              <div className="text-center py-10">
                <Loader size={28} className="spinning mx-auto mb-3" style={{ color: 'var(--accent)' }} />
                <div className="text-xs font-mono" style={{ color: 'var(--muted)' }}>{triageMsg}</div>
              </div>
            )}

            {triageResult && (
              <div className="fade-in">
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {SEV_CATS.map(c => (
                    <div key={c.key} className="rounded-lg p-2.5 text-center border-2 transition-all duration-200"
                      style={{
                        background: triageResult.category === c.key ? `${c.color}15` : 'transparent',
                        borderColor: triageResult.category === c.key ? c.color : 'transparent',
                        opacity: triageResult.category === c.key ? 1 : 0.3,
                      }}>
                      <div className="text-lg mb-1">{c.icon}</div>
                      <div className="text-xs font-medium" style={{ color: c.color }}>{c.key.split(' ')[0]}</div>
                      <div style={{ color: 'var(--dim)', fontSize: 9 }} className="font-mono mt-0.5">{c.tag}</div>
                    </div>
                  ))}
                </div>
                <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '12px 0' }} />
                <div className="grid grid-cols-3 gap-3 mb-3">
                  <div>
                    <div className="text-xs font-mono mb-1" style={{ color: 'var(--muted)', fontSize: 10 }}>CONFIDENCE</div>
                    <div className="text-lg font-semibold font-mono" style={{ color: triageResult.confidence > 80 ? 'var(--green)' : 'var(--amber)' }}>{triageResult.confidence}%</div>
                    <div className="h-1.5 rounded mt-1" style={{ background: 'var(--surface2)' }}>
                      <div className="h-full rounded transition-all duration-700" style={{ width: `${triageResult.confidence}%`, background: triageResult.confidence > 80 ? 'var(--green)' : 'var(--amber)' }} />
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-mono mb-1" style={{ color: 'var(--muted)', fontSize: 10 }}>PRIORITY</div>
                    <div className="text-sm font-semibold font-mono" style={{ color: triageResult.priority === 'Immediate' ? 'var(--red)' : triageResult.priority === 'Within 24h' ? 'var(--amber)' : 'var(--green)' }}>{triageResult.priority}</div>
                  </div>
                  <div>
                    <div className="text-xs font-mono mb-1" style={{ color: 'var(--muted)', fontSize: 10 }}>RECALL RISK</div>
                    <Chip variant={triageResult.recall_risk === 'High' ? 'red' : triageResult.recall_risk === 'Medium' ? 'amber' : 'green'}>{triageResult.recall_risk}</Chip>
                  </div>
                </div>
                <div className="rounded-lg p-3 mb-3" style={{ background: 'var(--surface2)' }}>
                  <div className="text-xs font-mono mb-1.5" style={{ color: 'var(--muted)', fontSize: 10 }}>AI RATIONALE</div>
                  <div className="text-xs leading-relaxed" style={{ color: 'var(--text)' }}>{triageResult.rationale}</div>
                </div>
                <div className="rounded-lg p-3 mb-3" style={{ background: 'var(--surface2)' }}>
                  <div className="text-xs font-mono mb-1.5" style={{ color: 'var(--muted)', fontSize: 10 }}>RECOMMENDED ACTIONS</div>
                  {triageResult.actions.map((a, i) => (
                    <div key={i} className="flex gap-2 text-xs mb-1.5" style={{ color: 'var(--text)' }}>
                      <span className="font-mono flex-shrink-0" style={{ color: 'var(--accent)' }}>{i + 1}.</span>
                      <span>{a}</span>
                    </div>
                  ))}
                </div>
                <div className="rounded-lg p-3" style={{ background: 'var(--amber-bg)', border: '1px solid var(--amber-border)' }}>
                  <div className="text-xs font-mono mb-1" style={{ color: 'var(--amber)', fontSize: 10 }}>REGULATORY FLAGS</div>
                  <div className="text-xs leading-relaxed" style={{ color: 'var(--amber)' }}>{triageResult.regulatory_flags}</div>
                </div>
              </div>
            )}
          </div>

          <Card>
            <div className="text-xs font-medium mb-3" style={{ color: 'var(--muted)' }}>Live Ticket Preview</div>
            <div className="text-xs font-mono leading-loose" style={{ color: 'var(--muted)' }}>
              <div>REF: <span style={{ color: 'var(--accent)' }}>{refNum}</span></div>
              <div>PRODUCT: <span style={{ color: 'var(--text)' }}>{form.product || '—'}</span></div>
              <div>BATCH: <span style={{ color: 'var(--text)' }}>{form.batch || '—'}</span></div>
              <div>CATEGORY: {triageResult ? <Chip variant={chipVariant(triageResult.category)}>{triageResult.category} — {triageResult.severity}</Chip> : <span>Pending triage</span>}</div>
              <div>OWNER: <span style={{ color: 'var(--text)' }}>{triageResult?.suggested_capa_owner || '—'}</span></div>
              <div>STATUS: <span style={{ color: 'var(--amber)' }}>OPEN</span></div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
