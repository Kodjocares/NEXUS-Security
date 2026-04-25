/**
 * NEXUS Shared UI Components
 */
import { useRef, useEffect } from 'react'
import { C, S, ts } from '../theme'

// ─── Terminal ─────────────────────────────────────────────────────────────────
export function Terminal({ logs, minHeight = 200, maxHeight = 380, placeholder = 'Awaiting input...' }) {
  const ref = useRef()
  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight
  }, [logs])

  return (
    <div style={{ ...S.terminal, minHeight, maxHeight }} ref={ref}>
      {logs.length === 0
        ? <span style={{ color: C.textDim }}>{placeholder}</span>
        : logs.map((l, i) => (
            <span key={i} style={{ color: l.color || C.green, display: 'block', marginBottom: '1px' }}>
              <span style={{ color: C.textDim }}>[{l.ts || ts()}]</span> {l.msg}
            </span>
          ))
      }
    </div>
  )
}

// ─── Card ─────────────────────────────────────────────────────────────────────
export function Card({ title, badge, badgeColor, children, style = {} }) {
  return (
    <div style={{ ...S.card, ...style }}>
      <div style={S.cardHeader}>
        <span style={S.cardTitle}>{title}</span>
        {badge && <span style={S.tag(badgeColor || C.cyan)}>{badge}</span>}
      </div>
      {children}
    </div>
  )
}

// ─── RiskBar ──────────────────────────────────────────────────────────────────
export function RiskBar({ value, max = 100, color }) {
  const pct = Math.min(100, (value / max) * 100)
  const c = color || (pct > 70 ? C.red : pct > 40 ? C.orange : C.green)
  return (
    <div style={{ height: '6px', background: C.border, borderRadius: '3px', overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${pct}%`, background: c, borderRadius: '3px', boxShadow: `0 0 8px ${c}`, transition: 'width 1s ease' }} />
    </div>
  )
}

// ─── MetricCard ───────────────────────────────────────────────────────────────
export function MetricCard({ label, value, color = C.cyan, size = '28px' }) {
  return (
    <div style={S.metricCard}>
      <span style={{ fontSize: size, fontWeight: '700', color, display: 'block', letterSpacing: '2px' }}>{value}</span>
      <span style={{ fontSize: '9px', letterSpacing: '2px', color: C.textDim, marginTop: '4px', display: 'block' }}>{label}</span>
    </div>
  )
}

// ─── Btn ──────────────────────────────────────────────────────────────────────
export function Btn({ children, onClick, color = C.cyan, disabled = false, style = {} }) {
  return (
    <button
      style={{ ...S.btn(color, disabled), ...style }}
      disabled={disabled}
      onClick={onClick}
    >{children}</button>
  )
}

// ─── Field ────────────────────────────────────────────────────────────────────
export function Field({ label, children }) {
  return (
    <div>
      <label style={S.label}>{label}</label>
      {children}
    </div>
  )
}

// ─── AIOutput ─────────────────────────────────────────────────────────────────
export function AIOutput({ text, title = '◈ AI ANALYSIS', badge = 'CLAUDE SONNET', style = {} }) {
  if (!text) return null
  return (
    <div style={{ ...S.card, gridColumn: '1 / -1', ...style }}>
      <div style={S.cardHeader}>
        <span style={S.cardTitle}>{title}</span>
        <span style={S.tag(C.purple)}>{badge}</span>
      </div>
      <div style={{
        background: '#020508', border: `1px solid ${C.border}`, borderRadius: '4px',
        padding: '16px', fontSize: '12px', lineHeight: '1.9', color: C.text,
        whiteSpace: 'pre-wrap', maxHeight: '420px', overflowY: 'auto',
      }}>
        {text}
        <span style={{ animation: 'blink 1s infinite', color: C.cyan }}>▌</span>
      </div>
    </div>
  )
}

// ─── SeverityBadge ────────────────────────────────────────────────────────────
export function SevBadge({ level }) {
  const colors = { CRITICAL: C.red, HIGH: C.orange, MEDIUM: C.yellow, LOW: C.green, INFO: C.cyan }
  const c = colors[level?.toUpperCase()] || C.textDim
  return <span style={S.tag(c)}>{level}</span>
}

// ─── Spinner ──────────────────────────────────────────────────────────────────
export function Spinner({ text = 'PROCESSING...' }) {
  return (
    <span style={{ color: C.cyan, fontSize: '11px', letterSpacing: '2px' }}>
      ◉ {text}
    </span>
  )
}
