/**
 * useSession — persists NEXUS session data to localStorage
 * Stores: scan findings, agent outputs, dataset entries, settings
 */
import { useState, useEffect, useCallback } from 'react'

const KEY = 'nexus_session_v2'

const defaultSession = {
  findings:    [],   // offensive scan findings
  threats:     [],   // defensive threat detections
  agentRuns:   [],   // completed pentest agent runs
  dataset:     [],   // exported research dataset rows
  settings: {
    theme:      'dark',
    context:    'west-africa-sme',
    researcher: '',
    institution: '',
  },
  stats: {
    totalScans:   0,
    totalThreats: 0,
    totalAgentRuns: 0,
  },
}

export function useSession() {
  const [session, setSession] = useState(() => {
    try {
      const raw = localStorage.getItem(KEY)
      return raw ? { ...defaultSession, ...JSON.parse(raw) } : defaultSession
    } catch {
      return defaultSession
    }
  })

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(session)) } catch {}
  }, [session])

  const update = useCallback((patch) => {
    setSession(s => ({ ...s, ...patch }))
  }, [])

  const addFinding = useCallback((finding) => {
    setSession(s => ({
      ...s,
      findings: [{ ...finding, id: Date.now(), ts: new Date().toISOString() }, ...s.findings].slice(0, 100),
      stats: { ...s.stats, totalScans: s.stats.totalScans + 1 },
    }))
  }, [])

  const addThreat = useCallback((threat) => {
    setSession(s => ({
      ...s,
      threats: [{ ...threat, id: Date.now(), ts: new Date().toISOString() }, ...s.threats].slice(0, 100),
      stats: { ...s.stats, totalThreats: s.stats.totalThreats + 1 },
    }))
  }, [])

  const addAgentRun = useCallback((run) => {
    setSession(s => ({
      ...s,
      agentRuns: [{ ...run, id: Date.now(), ts: new Date().toISOString() }, ...s.agentRuns].slice(0, 50),
      stats: { ...s.stats, totalAgentRuns: s.stats.totalAgentRuns + 1 },
    }))
  }, [])

  const addDatasetRow = useCallback((row) => {
    setSession(s => ({
      ...s,
      dataset: [...s.dataset, { ...row, id: Date.now(), ts: new Date().toISOString() }],
    }))
  }, [])

  const clearSession = useCallback(() => {
    setSession(defaultSession)
    localStorage.removeItem(KEY)
  }, [])

  const exportDataset = useCallback(() => {
    const csv = [
      Object.keys(session.dataset[0] || {}).join(','),
      ...session.dataset.map(row => Object.values(row).map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')),
    ].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `nexus_dataset_${Date.now()}.csv`
    a.click()
  }, [session.dataset])

  return { session, update, addFinding, addThreat, addAgentRun, addDatasetRow, clearSession, exportDataset }
}
