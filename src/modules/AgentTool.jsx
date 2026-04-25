import { useState, useCallback } from 'react'
import { C, S, ts } from '../theme'
import { streamClaude, chatClaude } from '../api/claude'
import { Terminal, Card, Btn, Field, AIOutput } from '../components/UI'

const PHASES = [
  {id:1, phase:'RECONNAISSANCE', icon:'🔍', desc:'OSINT, subdomain enum, tech fingerprinting', mitre:'TA0043'},
  {id:2, phase:'SCANNING',       icon:'📡', desc:'Port scan, service detection, vuln mapping',  mitre:'TA0007'},
  {id:3, phase:'ENUMERATION',    icon:'📋', desc:'User enum, directory brute, API discovery',   mitre:'TA0007'},
  {id:4, phase:'EXPLOITATION',   icon:'⚡', desc:'Exploit selection & payload gen (lab)',        mitre:'TA0002'},
  {id:5, phase:'POST-EXPLOIT',   icon:'🔓', desc:'Privilege escalation, persistence vectors',   mitre:'TA0004'},
  {id:6, phase:'REPORTING',      icon:'📊', desc:'Risk scoring, CVSS calc, remediation map',    mitre:'TA0040'},
]

const CTX = {
  'west-africa-sme': 'West African SME (Benin/Ghana/Togo) — WordPress-heavy, limited IT staff, poor patch hygiene, mobile-first',
  'fintech':         'West African fintech startup — mobile money API, regulatory gaps, high fraud exposure',
  'ecommerce':       'African e-commerce platform — payment processing, customer PII, logistics integrations',
  'ngo':             'NGO in West Africa — donor data, beneficiary PII, minimal security budget',
}

// NL Query Interface
function NLQuery({ sessionData }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const ask = async () => {
    if (!input.trim() || loading) return
    const userMsg = input.trim()
    setInput('')
    setMessages(m => [...m, { role: 'user', content: userMsg }])
    setLoading(true)
    const history = [...messages, { role: 'user', content: userMsg }]
    let reply = ''
    await chatClaude(
      `You are NEXUS QueryAI, an intelligent analyst that answers questions about cybersecurity findings and research data. You have access to this session context: ${JSON.stringify(sessionData||{})}. You specialize in West African SME cyber risk research. Answer questions naturally and technically.`,
      history,
      (p) => {
        reply = p
        setMessages(m => [...m.slice(0,-1), { role:'assistant', content:reply }])
      }
    ).catch(e => {
      setMessages(m => [...m, { role:'assistant', content:'Error: '+e.message }])
    })
    if (reply) setMessages(m => [...m.slice(0,-1), { role:'assistant', content:reply }])
    setLoading(false)
  }

  return (
    <div>
      <div style={{background:'#020508',border:`1px solid ${C.border}`,borderRadius:'4px',padding:'12px',minHeight:'200px',maxHeight:'340px',overflowY:'auto',marginBottom:'10px'}}>
        {messages.length===0&&<span style={{color:C.textDim,fontSize:'12px'}}>Ask anything about your scan findings, threat data, or West African SME cyber risk research...</span>}
        {messages.map((m,i)=>(
          <div key={i} style={{marginBottom:'12px'}}>
            <div style={{fontSize:'10px',letterSpacing:'2px',color:m.role==='user'?C.cyan:C.green,marginBottom:'4px'}}>{m.role==='user'?'YOU':'NEXUS AI'}</div>
            <div style={{fontSize:'12px',lineHeight:'1.8',color:C.text,whiteSpace:'pre-wrap'}}>{m.content}</div>
          </div>
        ))}
        {loading&&<div style={{color:C.cyan,fontSize:'12px'}}>◉ Thinking<span style={{animation:'blink 1s infinite'}}>▌</span></div>}
      </div>
      <div style={{display:'flex',gap:'8px'}}>
        <input style={{...S.input,flex:1}} placeholder='e.g., "What is the highest risk vector for a Cotonou fintech?"' value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&!loading&&ask()} />
        <Btn color={C.cyan} disabled={loading||!input.trim()} onClick={ask}>ASK</Btn>
      </div>
      <div style={{marginTop:'10px',display:'flex',gap:'6px',flexWrap:'wrap'}}>
        {['What are the top attack vectors for West African SMEs?','Summarize my scan findings','What MITRE techniques were detected?','Recommend immediate fixes for a Benin SME'].map(q=>(
          <button key={q} onClick={()=>setInput(q)} style={{fontSize:'10px',color:C.textDim,background:'transparent',border:`1px solid ${C.border}`,padding:'4px 8px',borderRadius:'3px',cursor:'pointer',fontFamily:'inherit'}}>
            {q}
          </button>
        ))}
      </div>
    </div>
  )
}

// Multi-Agent Debate
function MultiAgentDebate() {
  const [scenario, setScenario] = useState('')
  const [offOutput, setOffOutput] = useState('')
  const [defOutput, setDefOutput] = useState('')
  const [synthesis, setSynthesis] = useState('')
  const [loading, setLoading] = useState(false)
  const [phase, setPhase] = useState('')

  const runDebate = async () => {
    if (!scenario.trim()) return
    setLoading(true); setOffOutput(''); setDefOutput(''); setSynthesis('')
    
    setPhase('OFFENSIVE AGENT ARGUING...')
    await streamClaude(
      `You are the OFFENSIVE Agent in a multi-agent cybersecurity debate. Your role: argue from the attacker's perspective. Identify exploitable attack paths, vulnerabilities, and why a threat actor would succeed. Be technical, adversarial, and realistic for West African SME targets.`,
      `Debate scenario: ${scenario}. Argue the offensive perspective — what attack paths exist, which vulnerabilities are most exploitable, and what a motivated threat actor would do. Be specific with techniques and tools.`,
      setOffOutput
    ).catch(e=>setOffOutput('Error: '+e.message))

    setPhase('DEFENSIVE AGENT COUNTERING...')
    await streamClaude(
      `You are the DEFENSIVE Agent in a multi-agent cybersecurity debate. Your role: counter the offensive arguments with detection, mitigation, and hardening strategies. Focus on practical, budget-conscious defenses for West African SMEs.`,
      `Debate scenario: ${scenario}. The offensive side argues attacks are viable. Counter with: detection methods, mitigations, hardening steps, and why these attacks can be prevented. Be specific and practical for resource-constrained SMEs.`,
      setDefOutput
    ).catch(e=>setDefOutput('Error: '+e.message))

    setPhase('SYNTHESIZING RESEARCH INSIGHTS...')
    await streamClaude(
      `You are the NEXUS Research Synthesizer. Analyze both offensive and defensive arguments and synthesize PhD-level research insights.`,
      `Scenario: ${scenario}\n\nSynthesize the debate into: 1) Balanced risk assessment 2) Key research findings 3) SME-specific recommendations 4) PhD research contribution (what this tells us about AI-driven risk assessment for emerging markets) 5) Framework implications.`,
      setSynthesis
    ).catch(e=>setSynthesis('Error: '+e.message))

    setPhase('COMPLETE')
    setLoading(false)
  }

  return (
    <div>
      <Field label="DEBATE SCENARIO">
        <textarea style={{...S.textarea,minHeight:'80px'}} value={scenario} onChange={e=>setScenario(e.target.value)} placeholder="e.g., A West African fintech's mobile API has an IDOR vulnerability. Is it exploitable and how should it be defended?" />
      </Field>
      <div style={{marginTop:'10px',display:'flex',gap:'8px',alignItems:'center'}}>
        <Btn color={C.purple} disabled={loading||!scenario.trim()} onClick={runDebate}>{loading?`◉ ${phase}`:'▶ RUN MULTI-AGENT DEBATE'}</Btn>
      </div>
      {(offOutput||defOutput)&&(
        <div style={{...S.grid2,marginTop:'16px'}}>
          {offOutput&&(
            <div style={{background:'#020508',border:`1px solid ${C.red}44`,borderTop:`3px solid ${C.red}`,borderRadius:'4px',padding:'14px'}}>
              <div style={{fontSize:'10px',letterSpacing:'2px',color:C.red,marginBottom:'8px'}}>⚔ OFFENSIVE AGENT</div>
              <div style={{fontSize:'11px',lineHeight:'1.8',color:C.text,whiteSpace:'pre-wrap',maxHeight:'200px',overflowY:'auto'}}>{offOutput}</div>
            </div>
          )}
          {defOutput&&(
            <div style={{background:'#020508',border:`1px solid ${C.green}44`,borderTop:`3px solid ${C.green}`,borderRadius:'4px',padding:'14px'}}>
              <div style={{fontSize:'10px',letterSpacing:'2px',color:C.green,marginBottom:'8px'}}>🛡 DEFENSIVE AGENT</div>
              <div style={{fontSize:'11px',lineHeight:'1.8',color:C.text,whiteSpace:'pre-wrap',maxHeight:'200px',overflowY:'auto'}}>{defOutput}</div>
            </div>
          )}
        </div>
      )}
      {synthesis&&(
        <div style={{marginTop:'12px',background:'#020508',border:`1px solid ${C.purple}44`,borderTop:`3px solid ${C.purple}`,borderRadius:'4px',padding:'14px'}}>
          <div style={{fontSize:'10px',letterSpacing:'2px',color:C.purple,marginBottom:'8px'}}>🔬 RESEARCH SYNTHESIS</div>
          <div style={{fontSize:'11px',lineHeight:'1.8',color:C.text,whiteSpace:'pre-wrap',maxHeight:'220px',overflowY:'auto'}}>{synthesis}</div>
        </div>
      )}
    </div>
  )
}

export default function AgentTool({ sessionData, onAgentRun }) {
  const [target, setTarget] = useState('')
  const [context, setContext] = useState('west-africa-sme')
  const [stepStatus, setStepStatus] = useState({})
  const [stepOutputs, setStepOutputs] = useState({})
  const [running, setRunning] = useState(false)
  const [currentStep, setCurrentStep] = useState(null)
  const [finalReport, setFinalReport] = useState('')
  const [agentLog, setAgentLog] = useState([])
  const [expanded, setExpanded] = useState(null)
  const [subTab, setSubTab] = useState('agent')

  const log = useCallback((msg, color=C.text) => setAgentLog(l=>[...l,{msg,color,ts:ts()}]),[])

  const runPipeline = async () => {
    if (!target.trim()) return
    setRunning(true); setStepStatus({}); setStepOutputs({}); setFinalReport([]); setAgentLog([]); setCurrentStep(null)
    const ctxDesc = CTX[context]
    log('NEXUS PentestAgent v1.0 — Autonomous Pipeline',C.cyan)
    log(`Target: ${target} | Context: ${context}`,C.textDim)

    const allOutputs = {}
    for (const step of PHASES) {
      setCurrentStep(step.id)
      setStepStatus(s=>({...s,[step.id]:'active'}))
      log(`[AGENT] Phase ${step.id}: ${step.phase} (MITRE ${step.mitre})`,C.cyan)
      await new Promise(r=>setTimeout(r,600))
      try {
        await streamClaude(
          `You are NEXUS PentestAgent for PhD research. Phase: ${step.phase}. Context: ${ctxDesc}. Generate realistic, concise pentesting output (3-5 findings). Include tool names, severity, MITRE technique IDs, West Africa SME relevance. Max 150 words.`,
          `Target: ${target}\nPhase: ${step.phase} — ${step.desc}\nContext: ${ctxDesc}\nPrevious phases: ${Object.keys(allOutputs).join(', ')||'none'}`,
          (p) => {
            allOutputs[step.id] = p
            setStepOutputs(o=>({...o,[step.id]:p}))
          }
        )
        setStepStatus(s=>({...s,[step.id]:'done'}))
        log(`[✓] Phase ${step.id} complete — ${step.phase}`,C.green)
      } catch(e) {
        setStepStatus(s=>({...s,[step.id]:'error'}))
        log(`[✗] Phase ${step.id} failed: ${e.message}`,C.red)
      }
      await new Promise(r=>setTimeout(r,300))
    }

    setCurrentStep(null)
    log('[AGENT] Synthesizing final report...',C.purple)
    const combined = Object.values(allOutputs).join('\n\n---\n\n')
    await streamClaude(
      `You are NEXUS Research Engine. Synthesize a PhD-level pentest report for West African SME cyber risk research. Include: Executive Summary, Risk Score (0-100), Top 5 Findings with CVSS, Attack Chain Narrative, SME Risk Factors for low-resource digital markets, Remediation Roadmap. ~350 words.`,
      `Target: ${target}\nContext: ${CTX[context]}\nPhase outputs:\n${combined}`,
      setFinalReport
    ).catch(e=>log('Report synthesis failed: '+e.message,C.red))

    onAgentRun?.({ target, context, ts: new Date().toISOString() })
    log('[COMPLETE] Pipeline complete. Report generated.',C.cyan)
    setRunning(false)
  }

  const stepColor = s => s==='done'?C.green:s==='active'?C.cyan:s==='error'?C.red:C.border
  const tb=(id,label,active)=>(
    <button key={id} onClick={()=>setSubTab(id)} style={{padding:'6px 14px',fontSize:'10px',letterSpacing:'2px',cursor:'pointer',background:active?C.border:'transparent',color:active?C.cyan:C.textDim,border:`1px solid ${active?C.borderBright:'transparent'}`,borderRadius:'3px',fontFamily:'inherit'}}>
      {label}
    </button>
  )

  return (
    <div>
      <div style={{display:'flex',gap:'6px',marginBottom:'20px',flexWrap:'wrap'}}>
        {tb('agent','🤖 PENTEST AGENT',subTab==='agent')}
        {tb('debate','⚔ MULTI-AGENT DEBATE',subTab==='debate')}
        {tb('query','💬 NL QUERY',subTab==='query')}
      </div>

      {subTab==='agent'&&(
        <div style={S.grid2}>
          <Card title="◈ AGENT PIPELINE CONFIG" badge="AUTONOMOUS" badgeColor={C.purple}>
            <Field label="TARGET">
              <input style={S.input} placeholder="target-sme.com or IP" value={target} onChange={e=>setTarget(e.target.value)} />
            </Field>
            <Field label="TARGET CONTEXT">
              <select style={S.select} value={context} onChange={e=>setContext(e.target.value)}>
                {Object.entries(CTX).map(([k,v])=><option key={k} value={k}>{k.replace(/-/g,' ').toUpperCase()}</option>)}
              </select>
            </Field>
            <div style={{marginTop:'16px'}}>
              <Btn color={C.purple} disabled={running||!target.trim()} onClick={runPipeline}>
                {running?`◉ PHASE ${currentStep}/6 RUNNING`:'▶ LAUNCH AUTONOMOUS AGENT'}
              </Btn>
            </div>
            <div style={{marginTop:'20px'}}>
              <div style={{fontSize:'10px',letterSpacing:'2px',color:C.textDim,marginBottom:'10px'}}>PIPELINE ({PHASES.length} PHASES)</div>
              {PHASES.map(step=>{
                const status=stepStatus[step.id]||'idle'
                const hasOut=stepOutputs[step.id]
                return (
                  <div key={step.id}>
                    <div onClick={()=>hasOut&&setExpanded(expanded===step.id?null:step.id)} style={{background:status==='done'?'rgba(0,255,136,0.04)':status==='active'?'rgba(0,212,255,0.04)':status==='error'?'rgba(255,51,85,0.04)':'transparent',border:`1px solid ${stepColor(status)}`,borderRadius:'4px',padding:'10px 14px',marginBottom:'6px',display:'flex',alignItems:'flex-start',gap:'10px',cursor:hasOut?'pointer':'default'}}>
                      <div style={{width:'20px',height:'20px',borderRadius:'50%',background:stepColor(status),display:'flex',alignItems:'center',justifyContent:'center',fontSize:'10px',flexShrink:0,marginTop:'1px',color:'#04080f',fontWeight:'700'}}>
                        {status==='done'?'✓':status==='active'?'◉':status==='error'?'✗':step.id}
                      </div>
                      <div style={{flex:1}}>
                        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                          <span style={{fontSize:'12px',fontWeight:'600',color:stepColor(status)}}>{step.icon} {step.phase}</span>
                          <span style={S.tag(C.textDim)}>{step.mitre}</span>
                        </div>
                        <span style={{fontSize:'11px',color:C.textDim}}>{step.desc}</span>
                      </div>
                    </div>
                    {expanded===step.id&&hasOut&&(
                      <div style={{background:'#020508',border:`1px solid ${C.borderBright}`,borderRadius:'3px',padding:'12px',marginBottom:'6px',fontSize:'11px',lineHeight:'1.8',color:C.text,whiteSpace:'pre-wrap',marginTop:'-2px'}}>
                        {stepOutputs[step.id]}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </Card>

          <div style={{display:'flex',flexDirection:'column',gap:'20px'}}>
            <Card title="◈ AGENT LOG" badge={`${agentLog.length} events`} badgeColor={C.textDim}>
              <Terminal logs={agentLog} placeholder="Agent idle. Configure and launch pipeline." />
            </Card>
            {finalReport&&(
              <div style={S.card}>
                <div style={S.cardHeader}><span style={S.cardTitle}>◈ FINAL RESEARCH REPORT</span><span style={S.tag(C.purple)}>PhD GRADE</span></div>
                <div style={{background:'#020508',border:`1px solid ${C.borderBright}`,borderRadius:'4px',padding:'14px',fontSize:'12px',lineHeight:'1.9',color:C.text,whiteSpace:'pre-wrap',maxHeight:'340px',overflowY:'auto'}}>
                  {finalReport}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {subTab==='debate'&&(
        <div style={S.grid2}>
          <div style={{...S.card,...S.fullWidth}}>
            <div style={S.cardHeader}><span style={S.cardTitle}>◈ MULTI-AGENT DEBATE MODE</span><span style={S.tag(C.purple)}>RESEARCH</span></div>
            <p style={{fontSize:'11px',color:C.textDim,lineHeight:'1.7',marginBottom:'16px'}}>Two Claude agents argue opposing sides: one offensive (attacker perspective), one defensive (blue team). A third agent synthesizes PhD research insights. Produces richer, more balanced research outputs for your dissertation.</p>
            <MultiAgentDebate />
          </div>
        </div>
      )}

      {subTab==='query'&&(
        <div style={S.grid2}>
          <div style={{...S.card,...S.fullWidth}}>
            <div style={S.cardHeader}><span style={S.cardTitle}>◈ NATURAL LANGUAGE QUERY</span><span style={S.tag(C.cyan)}>AI ANALYST</span></div>
            <p style={{fontSize:'11px',color:C.textDim,lineHeight:'1.7',marginBottom:'16px'}}>Ask NEXUS questions about your session findings, threat data, and West African SME cyber risk research in natural language. The AI analyst has full awareness of your research context.</p>
            <NLQuery sessionData={sessionData} />
          </div>
        </div>
      )}
    </div>
  )
}
