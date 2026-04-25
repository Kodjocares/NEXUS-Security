import { useState, useEffect } from 'react'
import { C } from './theme'
import { useSession } from './hooks/useSession'
import OffensiveTool from './modules/OffensiveTool'
import DefensiveTool from './modules/DefensiveTool'
import AgentTool     from './modules/AgentTool'
import RiskEngine    from './modules/RiskEngine'
import ResearchLab   from './modules/ResearchLab'

const TABS = [
  { id:'offensive', label:'⚔ OFFENSIVE',   color:C.red    },
  { id:'defensive', label:'🛡 DEFENSIVE',   color:C.green  },
  { id:'agent',     label:'🤖 PENTEST AGENT', color:C.purple },
  { id:'risk',      label:'📊 RISK ENGINE', color:C.orange },
  { id:'research',  label:'🔬 RESEARCH LAB', color:C.cyan  },
]

export default function App() {
  const [tab, setTab]   = useState('offensive')
  const [time, setTime] = useState(new Date().toISOString().slice(11,19))
  const { session, addFinding, addThreat, addAgentRun, addDatasetRow, clearSession, exportDataset } = useSession()

  useEffect(() => {
    const t = setInterval(() => setTime(new Date().toISOString().slice(11,19)), 1000)
    return () => clearInterval(t)
  }, [])

  const dotStyle = c => ({
    display:'inline-block', width:'6px', height:'6px', borderRadius:'50%',
    background:c, boxShadow:`0 0 6px ${c}`, marginRight:'5px',
  })

  return (
    <div style={{minHeight:'100vh',background:C.bg,fontFamily:"'JetBrains Mono','Fira Code',monospace",color:C.text,position:'relative',overflow:'hidden'}}>
      {/* Scanline overlay */}
      <div style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,212,255,0.012) 2px,rgba(0,212,255,0.012) 4px)',pointerEvents:'none',zIndex:9999}} />

      {/* Header */}
      <header style={{background:`linear-gradient(90deg,${C.surface} 0%,#0a1428 50%,${C.surface} 100%)`,borderBottom:`1px solid ${C.borderBright}`,padding:'14px 32px',display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky',top:0,zIndex:100}}>
        <div style={{display:'flex',alignItems:'center',gap:'14px'}}>
          <div style={{width:'38px',height:'38px',border:`2px solid ${C.cyan}`,borderRadius:'5px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'18px',color:C.cyan,boxShadow:`0 0 14px ${C.cyan}44`}}>⬡</div>
          <div>
            <div style={{fontSize:'22px',fontWeight:'700',letterSpacing:'4px',background:`linear-gradient(90deg,${C.cyan},${C.green})`,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>NEXUS SECURITY</div>
            <div style={{fontSize:'9px',letterSpacing:'3px',color:C.textDim,marginTop:'1px'}}>AI-DRIVEN CYBER RISK RESEARCH PLATFORM</div>
          </div>
          <div style={{display:'flex',gap:'6px',marginLeft:'8px'}}>
            <span style={{fontSize:'9px',letterSpacing:'2px',color:C.orange,border:`1px solid ${C.orange}`,padding:'2px 7px',borderRadius:'2px'}}>v2.1</span>
            <span style={{fontSize:'9px',letterSpacing:'2px',color:C.purple,border:`1px solid ${C.purple}`,padding:'2px 7px',borderRadius:'2px'}}>PhD RESEARCH</span>
          </div>
        </div>
        <div style={{display:'flex',gap:'20px',alignItems:'center',fontSize:'11px',color:C.textDim}}>
          <span><span style={dotStyle(C.green)} />AI ONLINE</span>
          <span><span style={dotStyle(C.cyan)} />NEXUS v2.1</span>
          <span style={{fontSize:'10px',color:C.textDim,fontFamily:'monospace'}}>{time} UTC</span>
          <button onClick={()=>{ if(confirm('Clear all session data?')) clearSession() }} style={{fontSize:'9px',color:C.textDim,background:'transparent',border:`1px solid ${C.border}`,padding:'3px 10px',borderRadius:'3px',cursor:'pointer',fontFamily:'inherit',letterSpacing:'1px'}}>
            CLEAR SESSION
          </button>
        </div>
      </header>

      {/* Stats bar */}
      <div style={{background:C.surface,borderBottom:`1px solid ${C.border}`,padding:'8px 32px',display:'flex',gap:'24px',fontSize:'10px',color:C.textDim}}>
        <span>SCANS: <span style={{color:C.cyan}}>{session.stats.totalScans}</span></span>
        <span>THREATS: <span style={{color:C.red}}>{session.stats.totalThreats}</span></span>
        <span>AGENT RUNS: <span style={{color:C.purple}}>{session.stats.totalAgentRuns}</span></span>
        <span>DATASET: <span style={{color:C.green}}>{session.dataset.length} rows</span></span>
        <span style={{marginLeft:'auto',color:C.textDim}}>WEST AFRICA SME CYBER RISK RESEARCH — UNIOLU ITEE</span>
      </div>

      {/* Tabs */}
      <div style={{display:'flex',gap:'2px',padding:'16px 32px 0',borderBottom:`1px solid ${C.border}`,background:C.surface,overflowX:'auto'}}>
        {TABS.map(t=>{
          const active = tab===t.id
          return (
            <button key={t.id} onClick={()=>setTab(t.id)} style={{
              padding:'10px 24px', fontSize:'11px', letterSpacing:'2px', cursor:'pointer',
              background:active?C.card:'transparent', color:active?t.color:C.textDim,
              border:active?`1px solid ${C.borderBright}`:'1px solid transparent',
              borderBottom:active?`1px solid ${C.card}`:'1px solid transparent',
              marginBottom:active?'-1px':'0', transition:'all 0.2s', fontFamily:'inherit',
              fontWeight:active?'600':'400', borderRadius:'4px 4px 0 0', flexShrink:0,
            }}>
              {t.label}
            </button>
          )
        })}
      </div>

      {/* Main content */}
      <main style={{padding:'28px 32px',maxWidth:'1400px',margin:'0 auto'}}>
        {tab==='offensive' && <OffensiveTool onFinding={addFinding} />}
        {tab==='defensive' && <DefensiveTool onThreat={threats=>threats.forEach(addThreat)} />}
        {tab==='agent'     && <AgentTool sessionData={session} onAgentRun={addAgentRun} />}
        {tab==='risk'      && <RiskEngine onDatasetRow={addDatasetRow} />}
        {tab==='research'  && (
          <ResearchLab
            session={session}
            onAddDatasetRow={addDatasetRow}
            onExportDataset={exportDataset}
            onClearDataset={()=>clearSession()}
          />
        )}
      </main>

      {/* Footer */}
      <footer style={{padding:'16px 32px',borderTop:`1px solid ${C.border}`,display:'flex',justifyContent:'space-between',alignItems:'center',fontSize:'10px',color:C.textDim,marginTop:'40px'}}>
        <span>NEXUS Security Research Platform v2.1 — For authorized academic research only</span>
        <span>Village Man (Jah Kodjo) | AI-Driven Cyber Risk Assessment — West Africa SMEs | UniOulu ITEE</span>
      </footer>
    </div>
  )
}
