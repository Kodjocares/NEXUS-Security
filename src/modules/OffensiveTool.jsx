import { useState, useCallback } from 'react'
import { C, S, ts } from '../theme'
import { streamClaude } from '../api/claude'
import { Terminal, Card, RiskBar, MetricCard, Btn, Field, AIOutput } from '../components/UI'

const KILL_CHAIN = [
  { id:1, label:'RECON',     icon:'🔍', mitre:'TA0043', color:C.cyan },
  { id:2, label:'WEAPONIZE', icon:'⚒',  mitre:'TA0001', color:C.purple },
  { id:3, label:'DELIVER',   icon:'📨', mitre:'TA0002', color:C.orange },
  { id:4, label:'EXPLOIT',   icon:'⚡', mitre:'TA0003', color:C.red },
  { id:5, label:'INSTALL',   icon:'💾', mitre:'TA0005', color:C.red },
  { id:6, label:'C2',        icon:'📡', mitre:'TA0011', color:'#cc2244' },
  { id:7, label:'ACTIONS',   icon:'🎯', mitre:'TA0040', color:'#aa1133' },
]

function KillChainViz({ activePhase=0 }) {
  return (
    <div style={{padding:'12px 0',overflowX:'auto'}}>
      <div style={{display:'flex',alignItems:'center',minWidth:'500px'}}>
        {KILL_CHAIN.map((p,i) => {
          const on = p.id <= activePhase
          return (
            <div key={p.id} style={{display:'flex',alignItems:'center',flex:1}}>
              <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'4px',flex:1}}>
                <div style={{width:'44px',height:'44px',borderRadius:'50%',border:`2px solid ${on?p.color:C.border}`,background:on?`${p.color}22`:'transparent',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'18px',boxShadow:on?`0 0 12px ${p.color}66`:'none',transition:'all 0.4s'}}>
                  {p.icon}
                </div>
                <span style={{fontSize:'8px',letterSpacing:'1px',color:on?p.color:C.textDim,fontWeight:'600'}}>{p.label}</span>
                <span style={{fontSize:'7px',color:C.textDim}}>{p.mitre}</span>
              </div>
              {i < KILL_CHAIN.length-1 && (
                <div style={{height:'2px',width:'20px',flexShrink:0,background:on?`linear-gradient(90deg,${p.color},${KILL_CHAIN[i+1].color})`:C.border,transition:'background 0.4s'}} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function PayloadGen() {
  const [type,setType]=useState('sqli')
  const [ctx,setCtx]=useState('')
  const [out,setOut]=useState('')
  const [busy,setBusy]=useState(false)
  const run=async()=>{
    if(!ctx.trim())return;setBusy(true);setOut('')
    await streamClaude(
      `You are NEXUS PayloadAI for PhD cyber research on West African SMEs. Generate research-grade payloads for authorized lab use only.`,
      `Generate 5 ${type.toUpperCase()} payloads for context: "${ctx}". For each: payload, description, evasion notes, CVE if applicable, West Africa SME relevance.`,
      setOut
    ).catch(e=>setOut('Error: '+e.message))
    setBusy(false)
  }
  return (
    <div style={{marginTop:'16px',borderTop:`1px solid ${C.border}`,paddingTop:'16px'}}>
      <div style={{fontSize:'11px',letterSpacing:'3px',color:C.orange,marginBottom:'12px'}}>◈ PAYLOAD GENERATOR</div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px',marginBottom:'10px'}}>
        <div>
          <label style={S.label}>TYPE</label>
          <select style={S.select} value={type} onChange={e=>setType(e.target.value)}>
            {['sqli','xss','ssrf','xxe','lfi','rce','csrf','idor'].map(t=>(
              <option key={t} value={t}>{t.toUpperCase()}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={S.label}>TARGET CONTEXT</label>
          <input style={S.input} placeholder="e.g., WP login, REST API" value={ctx} onChange={e=>setCtx(e.target.value)} />
        </div>
      </div>
      <Btn color={C.orange} disabled={busy||!ctx.trim()} onClick={run}>{busy?'◉ GENERATING...':'▶ GENERATE PAYLOADS'}</Btn>
      {out&&<div style={{marginTop:'12px',background:'#020508',border:`1px solid ${C.border}`,borderRadius:'4px',padding:'12px',fontSize:'11px',lineHeight:'1.8',color:C.text,whiteSpace:'pre-wrap',maxHeight:'260px',overflowY:'auto'}}>{out}</div>}
    </div>
  )
}

function SocialEngSim() {
  const [vec,setVec]=useState('phishing')
  const [persona,setPersona]=useState('')
  const [out,setOut]=useState('')
  const [busy,setBusy]=useState(false)
  const run=async()=>{
    if(!persona.trim())return;setBusy(true);setOut('')
    await streamClaude(
      `You are NEXUS SocialEngAI for West African SME PhD security awareness research. Generate realistic scenarios for training/academic study only.`,
      `Create a ${vec} scenario targeting: "${persona}" in West African SME context (Benin Republic/Ghana/Togo). Include: attack narrative, psychological triggers, victim red flags, detection indicators, awareness training notes. Realistic for mobile-money culture.`,
      setOut
    ).catch(e=>setOut('Error: '+e.message))
    setBusy(false)
  }
  return (
    <div style={{marginTop:'16px',borderTop:`1px solid ${C.border}`,paddingTop:'16px'}}>
      <div style={{fontSize:'11px',letterSpacing:'3px',color:C.purple,marginBottom:'12px'}}>◈ SOCIAL ENGINEERING SIMULATOR</div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px',marginBottom:'10px'}}>
        <div>
          <label style={S.label}>ATTACK VECTOR</label>
          <select style={S.select} value={vec} onChange={e=>setVec(e.target.value)}>
            <option value="phishing">Spear Phishing Email</option>
            <option value="vishing">Vishing (Voice)</option>
            <option value="smishing">Smishing (SMS)</option>
            <option value="pretexting">Pretexting</option>
            <option value="whatsapp">WhatsApp / Mobile Money Scam</option>
            <option value="baiting">USB Baiting</option>
          </select>
        </div>
        <div>
          <label style={S.label}>TARGET PERSONA</label>
          <input style={S.input} placeholder="e.g., finance manager, SME owner" value={persona} onChange={e=>setPersona(e.target.value)} />
        </div>
      </div>
      <Btn color={C.purple} disabled={busy||!persona.trim()} onClick={run}>{busy?'◉ GENERATING...':'▶ GENERATE SCENARIO'}</Btn>
      {out&&<div style={{marginTop:'12px',background:'#020508',border:`1px solid ${C.border}`,borderRadius:'4px',padding:'12px',fontSize:'11px',lineHeight:'1.8',color:C.text,whiteSpace:'pre-wrap',maxHeight:'260px',overflowY:'auto'}}>{out}</div>}
    </div>
  )
}

export default function OffensiveTool({ onFinding }) {
  const [target,setTarget]=useState('')
  const [scope,setScope]=useState('external')
  const [scanType,setScanType]=useState('full')
  const [logs,setLogs]=useState([])
  const [analysis,setAnalysis]=useState('')
  const [running,setRunning]=useState(false)
  const [findings,setFindings]=useState(null)
  const [killPhase,setKillPhase]=useState(0)
  const [subTab,setSubTab]=useState('recon')
  const log=useCallback((msg,color=C.green)=>setLogs(l=>[...l,{msg,color,ts:ts()}]),[])

  const run=async()=>{
    if(!target.trim())return
    setRunning(true);setLogs([]);setAnalysis('');setFindings(null);setKillPhase(1)
    const steps=[
      [C.cyan,`[INIT] NEXUS Offensive Module v2.1 — Academic Research Mode`],
      [C.text,`[TARGET] ${target} | Scope: ${scope} | Mode: ${scanType}`],
      [C.green,`[DNS] A: 203.0.113.${Math.floor(Math.random()*200+10)} | MX: mail.${target}`],
      [C.green,`[WHOIS] Registrar: GoDaddy LLC | Created: 2019-03-14`],
      [C.orange,`[SHODAN] Open ports: 22 80 443 8080 3306`],
      [C.red,`[SHODAN] ⚠ Port 3306 MySQL exposed to public internet`],
      [C.green,`[TECH] WordPress 6.2.1 | PHP 7.4.33 | Apache 2.4.51`],
      [C.red,`[CVE] ⚠ CVE-2023-28733 — WP SQLi CVSS 9.1 CRITICAL`],
      [C.orange,`[CVE] ⚠ CVE-2022-21592 — PHP RCE CVSS 7.5 HIGH`],
      [C.orange,`[TLS] TLS 1.0 enabled | Cert expires in 14 days`],
      [C.red,`[EMAIL] ⚠ No DMARC policy — phishing vector open`],
      [C.orange,`[SUBS] api.${target} dev.${target} admin.${target} staging.${target}`],
      [C.red,`[SUBS] ⚠ staging.${target} — dev env exposed`],
      [C.orange,`[OSINT] 3 email addresses found in breach databases`],
      [C.cyan,`[SCAN] Recon complete. 78/100 risk score.`],
      [C.purple,`[AI] Routing to NEXUS AI Risk Engine...`],
    ]
    for(let i=0;i<steps.length;i++){
      await new Promise(r=>setTimeout(r,120+Math.random()*260))
      log(steps[i][1],steps[i][0])
      setKillPhase(Math.min(4,Math.floor((i/steps.length)*4)+1))
    }
    const f={critical:3,high:4,medium:6,low:2,riskScore:78}
    setFindings(f)
    onFinding?.({target,scope,...f,ts:new Date().toISOString()})
    await streamClaude(
      `You are NEXUS Offensive AI for PhD research on AI-Driven Cyber Risk for West African SMEs. Format: 1) Attack Surface Summary 2) Top 3 Critical Findings with CVE+CVSS 3) Exploitation Pathways (lab context) 4) West Africa SME Risk Context 5) Remediation Roadmap. ~400 words.`,
      `Target: ${target} | Findings: port 3306 exposed, WordPress CVE-2023-28733 CVSS9.1, PHP CVE-2022-21592, TLS1.0, no DMARC, staging subdomain exposed, 3 breach hits. Risk 78/100. Benin Republic/Ghana SME context.`,
      setAnalysis
    ).catch(e=>log('AI error: '+e.message,C.red))
    setKillPhase(7)
    log(`[COMPLETE] Analysis done — ${f.critical+f.high} critical/high findings`,C.cyan)
    setRunning(false)
  }

  const riskC=findings?(findings.riskScore>70?C.red:findings.riskScore>40?C.orange:C.green):C.green
  const tb=(id,label,active)=>(
    <button key={id} onClick={()=>setSubTab(id)} style={{padding:'6px 14px',fontSize:'10px',letterSpacing:'2px',cursor:'pointer',background:active?C.border:'transparent',color:active?C.cyan:C.textDim,border:`1px solid ${active?C.borderBright:'transparent'}`,borderRadius:'3px',fontFamily:'inherit'}}>
      {label}
    </button>
  )

  return (
    <div>
      <div style={{display:'flex',gap:'6px',marginBottom:'20px',flexWrap:'wrap'}}>
        {tb('recon','⚔ RECON',subTab==='recon')}
        {tb('payload','⚒ PAYLOADS',subTab==='payload')}
        {tb('social','🎭 SOCIAL ENG',subTab==='social')}
        {tb('killchain','☠ KILL CHAIN',subTab==='killchain')}
      </div>

      {subTab==='recon'&&(
        <div style={S.grid2}>
          <Card title="◈ TARGET CONFIG" badge="OFFENSIVE" badgeColor={C.red}>
            <Field label="TARGET DOMAIN / IP">
              <input style={S.input} placeholder="target-sme.bj or 192.168.1.0/24" value={target} onChange={e=>setTarget(e.target.value)} onKeyDown={e=>e.key==='Enter'&&!running&&run()} />
            </Field>
            <Field label="SCOPE">
              <select style={S.select} value={scope} onChange={e=>setScope(e.target.value)}>
                <option value="external">External Black-box</option>
                <option value="internal">Internal White-box</option>
                <option value="grey">Grey-box</option>
                <option value="web">Web App Only</option>
              </select>
            </Field>
            <Field label="INTENSITY">
              <select style={S.select} value={scanType} onChange={e=>setScanType(e.target.value)}>
                <option value="passive">Passive OSINT</option>
                <option value="light">Light Scan</option>
                <option value="full">Full Recon</option>
                <option value="aggressive">Aggressive (Lab)</option>
              </select>
            </Field>
            <div style={{marginTop:'16px',display:'flex',gap:'8px'}}>
              <Btn color={C.red} disabled={running||!target.trim()} onClick={run}>{running?'◉ SCANNING...':'▶ LAUNCH RECON'}</Btn>
              <Btn color={C.textDim} onClick={()=>{setLogs([]);setAnalysis('');setFindings(null);setKillPhase(0)}}>CLEAR</Btn>
            </div>
            {findings&&(
              <div style={{marginTop:'20px'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'8px'}}>
                  <span style={{fontSize:'10px',letterSpacing:'2px',color:C.textDim}}>RISK SCORE</span>
                  <span style={{fontSize:'24px',fontWeight:'700',color:riskC}}>{findings.riskScore}/100</span>
                </div>
                <RiskBar value={findings.riskScore} color={riskC} />
                <div style={{...S.grid3,marginTop:'12px'}}>
                  <MetricCard label="CRITICAL" value={findings.critical} color={C.red} />
                  <MetricCard label="HIGH" value={findings.high} color={C.orange} />
                  <MetricCard label="MEDIUM" value={findings.medium} color={C.yellow} />
                </div>
              </div>
            )}
          </Card>
          <Card title="◈ RECON TERMINAL" badge={`${logs.length} events`} badgeColor={C.textDim}>
            <Terminal logs={logs} placeholder="Configure target and launch reconnaissance." />
          </Card>
          {killPhase>0&&(
            <div style={{...S.card,...S.fullWidth}}>
              <div style={S.cardHeader}><span style={S.cardTitle}>◈ KILL CHAIN PROGRESS</span></div>
              <KillChainViz activePhase={killPhase} />
            </div>
          )}
          {analysis&&<AIOutput text={analysis} title="◈ NEXUS AI — PhD THREAT ANALYSIS" badge="WEST AFRICA SME" />}
        </div>
      )}

      {subTab==='payload'&&(
        <div style={S.grid2}>
          <div style={{...S.card,...S.fullWidth}}>
            <div style={S.cardHeader}><span style={S.cardTitle}>◈ AI PAYLOAD GENERATOR</span><span style={S.tag(C.orange)}>RESEARCH LAB</span></div>
            <p style={{fontSize:'11px',color:C.textDim,lineHeight:'1.7'}}>Generate research-grade payloads for authorized lab environments, CTF, and PhD pen-test studies only.</p>
            <PayloadGen />
          </div>
        </div>
      )}

      {subTab==='social'&&(
        <div style={S.grid2}>
          <div style={{...S.card,...S.fullWidth}}>
            <div style={S.cardHeader}><span style={S.cardTitle}>◈ SOCIAL ENGINEERING SIMULATOR</span><span style={S.tag(C.purple)}>HUMAN FACTOR</span></div>
            <p style={{fontSize:'11px',color:C.textDim,lineHeight:'1.7'}}>Simulate social engineering for security awareness training. WhatsApp/mobile money fraud is a primary vector in West African SME digital markets.</p>
            <SocialEngSim />
          </div>
        </div>
      )}

      {subTab==='killchain'&&(
        <div style={S.grid2}>
          <div style={{...S.card,...S.fullWidth}}>
            <div style={S.cardHeader}><span style={S.cardTitle}>◈ KILL CHAIN VISUALIZER</span><span style={S.tag(C.red)}>MITRE ATT&CK</span></div>
            <KillChainViz activePhase={killPhase||7} />
            <div style={{marginTop:'16px'}}>
              <label style={S.label}>SIMULATE PHASE</label>
              <input type="range" min="0" max="7" value={killPhase||7} onChange={e=>setKillPhase(+e.target.value)} style={{width:'100%',accentColor:C.red}} />
            </div>
            <div style={{marginTop:'16px',display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'8px'}}>
              {KILL_CHAIN.map(p=>(
                <div key={p.id} style={{background:'#020508',border:`1px solid ${(p.id<=(killPhase||7))?p.color+'44':C.border}`,borderLeft:`3px solid ${(p.id<=(killPhase||7))?p.color:C.border}`,borderRadius:'3px',padding:'10px'}}>
                  <div style={{fontSize:'12px',marginBottom:'4px'}}>{p.icon} <span style={{color:(p.id<=(killPhase||7))?p.color:C.textDim,fontSize:'10px',fontWeight:'600'}}>{p.label}</span></div>
                  <div style={{fontSize:'9px',color:C.textDim}}>{p.mitre}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
