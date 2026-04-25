import { useState, useCallback } from 'react'
import { C, S, ts, severityColor } from '../theme'
import { streamClaude } from '../api/claude'
import { Terminal, Card, MetricCard, Btn, Field, AIOutput } from '../components/UI'

// SIEM live event stream simulation
const SIEM_EVENTS = [
  { type:'AUTH',     msg:'Failed login: admin@10.0.0.5',    sev:'MEDIUM', ip:'10.0.0.5' },
  { type:'SCAN',     msg:'Port scan detected from 45.33.32.156', sev:'HIGH', ip:'45.33.32.156' },
  { type:'MALWARE',  msg:'YARA match: Emotet dropper in upload/', sev:'CRITICAL', ip:'192.168.1.44' },
  { type:'EXFIL',    msg:'Unusual outbound: 450MB to 203.0.113.99', sev:'CRITICAL', ip:'203.0.113.99' },
  { type:'POLICY',   msg:'USB device inserted on WORKSTATION-07', sev:'MEDIUM', ip:'192.168.1.7' },
  { type:'VULN',     msg:'CVE-2023-28733 exploit attempt blocked', sev:'HIGH', ip:'185.220.101.45' },
  { type:'AUTH',     msg:'Brute force: 47 failures from 103.21.244.0', sev:'HIGH', ip:'103.21.244.0' },
  { type:'DNS',      msg:'DNS query to known C2: malware-cdn.io', sev:'CRITICAL', ip:'192.168.1.22' },
]

function SIEMDashboard() {
  const [events, setEvents] = useState([])
  const [running, setRunning] = useState(false)
  const [filter, setFilter] = useState('ALL')

  const startFeed = () => {
    setRunning(true); setEvents([])
    let i = 0
    const interval = setInterval(() => {
      if (i >= SIEM_EVENTS.length * 2) { clearInterval(interval); setRunning(false); return }
      const ev = SIEM_EVENTS[i % SIEM_EVENTS.length]
      setEvents(e => [{...ev, ts: ts(), id: Date.now()+i}, ...e].slice(0,50))
      i++
    }, 800)
  }

  const sevC = s => s==='CRITICAL'?C.red:s==='HIGH'?C.orange:s==='MEDIUM'?C.yellow:C.green
  const filtered = filter==='ALL' ? events : events.filter(e=>e.sev===filter)
  const counts = events.reduce((a,e)=>({...a,[e.sev]:(a[e.sev]||0)+1}),{})

  return (
    <div style={{marginTop:'16px',borderTop:`1px solid ${C.border}`,paddingTop:'16px'}}>
      <div style={{fontSize:'11px',letterSpacing:'3px',color:C.cyan,marginBottom:'12px'}}>◈ SIEM LIVE DASHBOARD</div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'8px',marginBottom:'12px'}}>
        {['CRITICAL','HIGH','MEDIUM','LOW'].map(s=>(
          <MetricCard key={s} label={s} value={counts[s]||0} color={sevC(s)} size="22px" />
        ))}
      </div>
      <div style={{display:'flex',gap:'8px',marginBottom:'10px',alignItems:'center'}}>
        <Btn color={C.cyan} disabled={running} onClick={startFeed}>{running?'◉ STREAMING...':'▶ START FEED'}</Btn>
        <Btn color={C.textDim} onClick={()=>setEvents([])}>CLEAR</Btn>
        <select style={{...S.select,width:'auto'}} value={filter} onChange={e=>setFilter(e.target.value)}>
          {['ALL','CRITICAL','HIGH','MEDIUM','LOW'].map(s=><option key={s}>{s}</option>)}
        </select>
      </div>
      <div style={{background:'#020508',border:`1px solid ${C.border}`,borderRadius:'4px',padding:'10px',maxHeight:'220px',overflowY:'auto',fontSize:'11px'}}>
        {filtered.length===0&&<span style={{color:C.textDim}}>No events. Start the feed.</span>}
        {filtered.map(ev=>(
          <div key={ev.id} style={{display:'flex',gap:'8px',alignItems:'center',marginBottom:'6px',padding:'6px 8px',background:'#04080f',borderRadius:'3px',borderLeft:`3px solid ${sevC(ev.sev)}`}}>
            <span style={{color:C.textDim,flexShrink:0}}>[{ev.ts}]</span>
            <span style={{color:sevC(ev.sev),width:'70px',flexShrink:0,fontSize:'10px',fontWeight:'600'}}>{ev.sev}</span>
            <span style={{color:C.cyan,width:'60px',flexShrink:0,fontSize:'10px'}}>{ev.type}</span>
            <span style={{color:C.text,flex:1}}>{ev.msg}</span>
            <span style={{color:C.textDim,fontSize:'10px',flexShrink:0}}>{ev.ip}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function ThreatIntelFeed() {
  const [region, setRegion] = useState('west-africa')
  const [feed, setFeed] = useState('')
  const [loading, setLoading] = useState(false)

  const fetch = async () => {
    setLoading(true); setFeed('')
    await streamClaude(
      `You are NEXUS ThreatIntel AI, providing threat intelligence for ${region} digital markets with a focus on SME cyber risk research. Be specific and technical.`,
      `Generate a current threat intelligence brief for ${region} region covering: 1) Top 5 active threat actors targeting SMEs 2) Most exploited CVEs this quarter 3) Predominant attack vectors (focus on mobile money fraud, supply chain, phishing) 4) IOC samples (IPs, hashes, domains — fictional but realistic) 5) Recommended defensive priorities for resource-constrained SMEs. PhD research framing.`,
      setFeed
    ).catch(e=>setFeed('Error: '+e.message))
    setLoading(false)
  }

  return (
    <div style={{marginTop:'16px',borderTop:`1px solid ${C.border}`,paddingTop:'16px'}}>
      <div style={{fontSize:'11px',letterSpacing:'3px',color:C.yellow,marginBottom:'12px'}}>◈ THREAT INTELLIGENCE FEED</div>
      <div style={{display:'flex',gap:'8px',alignItems:'center',marginBottom:'12px'}}>
        <select style={{...S.select,flex:1}} value={region} onChange={e=>setRegion(e.target.value)}>
          <option value="west-africa">West Africa (All)</option>
          <option value="benin-republic">Benin Republic</option>
          <option value="ghana">Ghana</option>
          <option value="togo">Togo</option>
          <option value="gambia">The Gambia</option>
          <option value="nigeria">Nigeria</option>
          <option value="global-sme">Global SME</option>
        </select>
        <Btn color={C.yellow} disabled={loading} onClick={fetch}>{loading?'◉ FETCHING...':'▶ FETCH INTEL'}</Btn>
      </div>
      {feed&&<div style={{background:'#020508',border:`1px solid ${C.border}`,borderRadius:'4px',padding:'12px',fontSize:'11px',lineHeight:'1.8',color:C.text,whiteSpace:'pre-wrap',maxHeight:'260px',overflowY:'auto'}}>{feed}</div>}
    </div>
  )
}

function IRPlaybook() {
  const [incident, setIncident] = useState('')
  const [playbook, setPlaybook] = useState('')
  const [loading, setLoading] = useState(false)

  const generate = async () => {
    if(!incident.trim()) return
    setLoading(true); setPlaybook('')
    await streamClaude(
      `You are NEXUS IR-AI, generating incident response playbooks for West African SMEs with limited IT staff and budgets. Format as a numbered step-by-step playbook with time estimates, tool names (free/open-source preferred), and SME-specific considerations.`,
      `Generate a complete IR playbook for: "${incident}". Include: Immediate triage steps (0-1hr), Containment actions (1-4hr), Evidence preservation, Eradication steps, Recovery procedures, Post-incident review template, and Tools recommended (budget-conscious for African SME). Flag any steps requiring external CERT assistance.`,
      setPlaybook
    ).catch(e=>setPlaybook('Error: '+e.message))
    setLoading(false)
  }

  return (
    <div style={{marginTop:'16px',borderTop:`1px solid ${C.border}`,paddingTop:'16px'}}>
      <div style={{fontSize:'11px',letterSpacing:'3px',color:C.green,marginBottom:'12px'}}>◈ INCIDENT RESPONSE PLAYBOOK GENERATOR</div>
      <div style={{display:'flex',gap:'8px',marginBottom:'10px'}}>
        <input style={{...S.input,flex:1}} placeholder="e.g., ransomware attack, data breach, DDoS, insider threat" value={incident} onChange={e=>setIncident(e.target.value)} />
        <Btn color={C.green} disabled={loading||!incident.trim()} onClick={generate}>{loading?'◉ GENERATING...':'▶ BUILD PLAYBOOK'}</Btn>
      </div>
      {playbook&&<div style={{background:'#020508',border:`1px solid ${C.border}`,borderRadius:'4px',padding:'12px',fontSize:'11px',lineHeight:'1.8',color:C.text,whiteSpace:'pre-wrap',maxHeight:'300px',overflowY:'auto'}}>{playbook}</div>}
    </div>
  )
}

export default function DefensiveTool({ onThreat }) {
  const [logInput, setLogInput] = useState(`192.168.1.105 - POST /wp-admin/admin-ajax.php 200 2847\n10.0.0.23 - GET /etc/passwd 403 512 "sqlmap/1.7"\n203.0.113.42 - POST /login 401 234 "python-requests/2.28"\n203.0.113.42 - POST /login 401 234 "python-requests/2.28"\n203.0.113.42 - POST /login 200 1823 "python-requests/2.28"\n192.168.1.105 - GET /wp-content/uploads/shell.php 200 44`)
  const [analysis, setAnalysis] = useState('')
  const [loading, setLoading] = useState(false)
  const [threats, setThreats] = useState(null)
  const [eventLog, setEventLog] = useState([])
  const [subTab, setSubTab] = useState('sentinel')

  const log = useCallback((msg, color=C.green) => setEventLog(l=>[...l,{msg,color,ts:ts()}]),[])

  const analyze = async () => {
    if(!logInput.trim()) return
    setLoading(true); setAnalysis(''); setThreats(null)
    const steps=[
      [C.cyan,'NEXUS Sentinel v2.1 — Threat Detection Engine'],
      [C.textDim,'Ingesting log data...'],
      [C.textDim,'Running ML anomaly detection model...'],
      [C.red,'⚠ ALERT: Brute force from 203.0.113.42 (2 failures → success)'],
      [C.red,'⚠ ALERT: SQL injection attempt (sqlmap signature)'],
      [C.red,'⚠ CRITICAL: Webshell execution — shell.php accessed'],
      [C.textDim,'Correlating IOCs with threat feeds...'],
      [C.orange,'IP 203.0.113.42 found in AbuseIPDB (92 reports)'],
      [C.purple,'Routing to NEXUS AI for research analysis...'],
    ]
    setEventLog([])
    for(const [color,msg] of steps){
      await new Promise(r=>setTimeout(r,180+Math.random()*200))
      log(msg,color)
    }
    const detected=[
      {id:'T001',type:'BRUTE FORCE',   ip:'203.0.113.42',  sev:'HIGH',     confidence:94},
      {id:'T002',type:'SQL INJECTION', ip:'10.0.0.23',     sev:'CRITICAL', confidence:99},
      {id:'T003',type:'WEBSHELL EXEC', ip:'192.168.1.105', sev:'CRITICAL', confidence:97},
      {id:'T004',type:'RECON/SCAN',    ip:'10.0.0.23',     sev:'MEDIUM',   confidence:82},
    ]
    setThreats(detected)
    onThreat?.(detected)
    await streamClaude(
      `You are NEXUS Sentinel AI for PhD research on AI-Driven Cyber Risk for West African SMEs. Analyze logs and provide: 1) Threat Summary with MITRE ATT&CK mapping 2) Kill Chain Analysis 3) Attacker TTPs 4) Risk Score for West Africa SME context 5) Containment Actions 6) Research Insights on SME vulnerability patterns. ~400 words.`,
      `Logs:\n${logInput}\n\nDetected: brute force 203.0.113.42, SQL injection 10.0.0.23 (sqlmap), webshell shell.php, path traversal /etc/passwd. Target: West African SME WordPress site.`,
      setAnalysis
    ).catch(e=>log('AI error: '+e.message,C.red))
    log('Analysis complete — threat report generated',C.cyan)
    setLoading(false)
  }

  const sevC = s => s==='CRITICAL'?C.red:s==='HIGH'?C.orange:s==='MEDIUM'?C.yellow:C.green
  const tb=(id,label,active)=>(
    <button key={id} onClick={()=>setSubTab(id)} style={{padding:'6px 14px',fontSize:'10px',letterSpacing:'2px',cursor:'pointer',background:active?C.border:'transparent',color:active?C.cyan:C.textDim,border:`1px solid ${active?C.borderBright:'transparent'}`,borderRadius:'3px',fontFamily:'inherit'}}>
      {label}
    </button>
  )

  return (
    <div>
      <div style={{display:'flex',gap:'6px',marginBottom:'20px',flexWrap:'wrap'}}>
        {tb('sentinel','🛡 SENTINEL',subTab==='sentinel')}
        {tb('siem','📊 SIEM',subTab==='siem')}
        {tb('intel','🌐 THREAT INTEL',subTab==='intel')}
        {tb('ir','🚨 IR PLAYBOOKS',subTab==='ir')}
      </div>

      {subTab==='sentinel'&&(
        <div style={S.grid2}>
          <Card title="◈ LOG ANALYSIS" badge="DEFENSIVE" badgeColor={C.green}>
            <Field label="PASTE SECURITY LOGS / EVENTS">
              <textarea style={{...S.textarea,minHeight:'180px'}} value={logInput} onChange={e=>setLogInput(e.target.value)} placeholder="Apache logs, firewall events, SIEM alerts..." />
            </Field>
            <div style={{marginTop:'10px',display:'flex',gap:'8px'}}>
              <Btn color={C.green} disabled={loading} onClick={analyze}>{loading?'◉ ANALYZING...':'▶ ANALYZE THREATS'}</Btn>
              <Btn color={C.textDim} onClick={()=>{setEventLog([]);setAnalysis('');setThreats(null)}}>CLEAR</Btn>
            </div>
            {threats&&(
              <div style={{marginTop:'16px'}}>
                <div style={{fontSize:'10px',letterSpacing:'2px',color:C.textDim,marginBottom:'8px'}}>DETECTED THREATS</div>
                {threats.map(t=>(
                  <div key={t.id} style={{background:'#020508',border:`1px solid ${sevC(t.sev)}33`,borderLeft:`3px solid ${sevC(t.sev)}`,borderRadius:'3px',padding:'10px 14px',marginBottom:'6px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    <div>
                      <span style={{color:sevC(t.sev),fontSize:'12px',fontWeight:'600'}}>{t.type}</span>
                      <span style={{color:C.textDim,fontSize:'11px',marginLeft:'10px'}}>{t.ip}</span>
                    </div>
                    <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                      <span style={S.tag(sevC(t.sev))}>{t.sev}</span>
                      <span style={{fontSize:'11px',color:C.textDim}}>{t.confidence}%</span>
                    </div>
                  </div>
                ))}
                <div style={{...S.grid3,marginTop:'10px'}}>
                  <MetricCard label="THREAT LEVEL" value="HIGH" color={C.red} size="16px" />
                  <MetricCard label="ACTIVE IOCs" value={threats.length} color={C.orange} size="16px" />
                  <MetricCard label="MTTR est." value="~12m" color={C.cyan} size="16px" />
                </div>
              </div>
            )}
          </Card>
          <Card title="◈ EVENT STREAM" badge={`${eventLog.length} events`} badgeColor={C.textDim}>
            <Terminal logs={eventLog} placeholder="Awaiting log ingestion..." />
          </Card>
          {analysis&&<AIOutput text={analysis} title="◈ NEXUS AI — THREAT INTELLIGENCE REPORT" badge="PhD RESEARCH" />}
        </div>
      )}

      {subTab==='siem'&&(
        <div style={S.grid2}>
          <div style={{...S.card,...S.fullWidth}}>
            <div style={S.cardHeader}><span style={S.cardTitle}>◈ SIEM DASHBOARD</span><span style={S.tag(C.cyan)}>REAL-TIME</span></div>
            <p style={{fontSize:'11px',color:C.textDim,lineHeight:'1.7'}}>Simulates a Security Information and Event Management dashboard for resource-constrained West African SME environments. Demonstrates what a minimal SOC setup would look like.</p>
            <SIEMDashboard />
          </div>
        </div>
      )}

      {subTab==='intel'&&(
        <div style={S.grid2}>
          <div style={{...S.card,...S.fullWidth}}>
            <div style={S.cardHeader}><span style={S.cardTitle}>◈ THREAT INTELLIGENCE FEED</span><span style={S.tag(C.yellow)}>REGIONAL</span></div>
            <p style={{fontSize:'11px',color:C.textDim,lineHeight:'1.7'}}>AI-generated threat intelligence briefs tailored to West African digital markets. Covers active threat actors, exploited CVEs, predominant attack vectors, and IOC samples relevant to SME risk research.</p>
            <ThreatIntelFeed />
          </div>
        </div>
      )}

      {subTab==='ir'&&(
        <div style={S.grid2}>
          <div style={{...S.card,...S.fullWidth}}>
            <div style={S.cardHeader}><span style={S.cardTitle}>◈ INCIDENT RESPONSE PLAYBOOKS</span><span style={S.tag(C.green)}>AI GENERATED</span></div>
            <p style={{fontSize:'11px',color:C.textDim,lineHeight:'1.7'}}>Generate step-by-step IR playbooks tailored to West African SME constraints: limited IT staff, budget restrictions, open-source tooling priority, and local CERT coordination.</p>
            <IRPlaybook />
          </div>
        </div>
      )}
    </div>
  )
}
