import { useState } from 'react'
import { C, S } from '../theme'
import { streamClaude } from '../api/claude'
import { Card, RiskBar, MetricCard, Btn, Field, AIOutput } from '../components/UI'
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'

const RISK_FACTORS = [
  { key:'patch_mgmt',     label:'Patch Management',      weight:0.18, desc:'Frequency of software updates and vulnerability patching' },
  { key:'access_ctrl',    label:'Access Controls',        weight:0.16, desc:'MFA, RBAC, least privilege enforcement' },
  { key:'backup',         label:'Backup & Recovery',      weight:0.14, desc:'Backup frequency, offsite storage, tested recovery' },
  { key:'staff_training', label:'Security Awareness',     weight:0.12, desc:'Employee phishing training, incident reporting culture' },
  { key:'network_seg',    label:'Network Segmentation',   weight:0.12, desc:'Firewall rules, VLAN separation, DMZ' },
  { key:'incident_resp',  label:'Incident Response',      weight:0.10, desc:'Documented IR plan, defined roles, drills' },
  { key:'data_encrypt',   label:'Data Encryption',        weight:0.10, desc:'Encryption at rest and in transit' },
  { key:'vendor_risk',    label:'Vendor/Supply Chain',    weight:0.08, desc:'Third-party security assessments, contracts' },
]

const MARKET_PROFILES = {
  'benin-republic': { name:'Benin Republic',    baseRisk:72, internet:58, mobile:84, fintech:46 },
  'ghana':          { name:'Ghana',             baseRisk:61, internet:72, mobile:89, fintech:68 },
  'togo':           { name:'Togo',              baseRisk:68, internet:55, mobile:79, fintech:41 },
  'gambia':         { name:'The Gambia',        baseRisk:74, internet:48, mobile:76, fintech:38 },
  'nigeria':        { name:'Nigeria',           baseRisk:65, internet:77, mobile:92, fintech:74 },
  'senegal':        { name:'Senegal',           baseRisk:63, internet:66, mobile:88, fintech:55 },
}

function MarketDashboard() {
  const [selectedMarkets, setSelectedMarkets] = useState(['benin-republic','ghana','togo'])
  const toggle = k => setSelectedMarkets(m => m.includes(k) ? m.filter(x=>x!==k) : [...m,k])

  const radarData = ['internet','mobile','fintech','baseRisk'].map(metric => ({
    metric: metric==='baseRisk'?'Cyber Risk':metric==='internet'?'Internet Pen.':metric==='mobile'?'Mobile Pen.':'Fintech Maturity',
    ...selectedMarkets.reduce((a,mk)=>({...a,[MARKET_PROFILES[mk].name]:MARKET_PROFILES[mk][metric]}),{}),
  }))

  const barData = selectedMarkets.map(mk=>({...MARKET_PROFILES[mk]}))

  const COLORS = [C.cyan,C.green,C.orange,C.purple,C.red,C.yellow]

  return (
    <div>
      <div style={{marginBottom:'16px'}}>
        <label style={S.label}>SELECT MARKETS TO COMPARE</label>
        <div style={{display:'flex',gap:'8px',flexWrap:'wrap'}}>
          {Object.entries(MARKET_PROFILES).map(([k,v])=>(
            <button key={k} onClick={()=>toggle(k)} style={{padding:'5px 12px',fontSize:'10px',letterSpacing:'1px',cursor:'pointer',background:selectedMarkets.includes(k)?`${C.cyan}22`:'transparent',color:selectedMarkets.includes(k)?C.cyan:C.textDim,border:`1px solid ${selectedMarkets.includes(k)?C.cyan:C.border}`,borderRadius:'3px',fontFamily:'inherit'}}>
              {v.name}
            </button>
          ))}
        </div>
      </div>

      <div style={S.grid2}>
        <div>
          <div style={{fontSize:'10px',letterSpacing:'2px',color:C.textDim,marginBottom:'8px'}}>RISK & MATURITY RADAR</div>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData}>
              <PolarGrid stroke={C.border} />
              <PolarAngleAxis dataKey="metric" tick={{fill:C.textDim,fontSize:9}} />
              {selectedMarkets.map((mk,i)=>(
                <Radar key={mk} name={MARKET_PROFILES[mk].name} dataKey={MARKET_PROFILES[mk].name} stroke={COLORS[i]} fill={COLORS[i]} fillOpacity={0.15} />
              ))}
            </RadarChart>
          </ResponsiveContainer>
        </div>
        <div>
          <div style={{fontSize:'10px',letterSpacing:'2px',color:C.textDim,marginBottom:'8px'}}>CYBER RISK SCORE COMPARISON</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData} margin={{top:5,right:5,left:-20,bottom:5}}>
              <CartesianGrid strokeDasharray="2 4" stroke={C.border} />
              <XAxis dataKey="name" tick={{fill:C.textDim,fontSize:9}} />
              <YAxis tick={{fill:C.textDim,fontSize:9}} />
              <Tooltip contentStyle={{background:C.card,border:`1px solid ${C.border}`,fontSize:'11px',color:C.text}} />
              <Bar dataKey="baseRisk" name="Risk Score" fill={C.red} opacity={0.85} radius={[2,2,0,0]} />
              <Bar dataKey="mobile" name="Mobile Pen." fill={C.cyan} opacity={0.7} radius={[2,2,0,0]} />
              <Bar dataKey="fintech" name="Fintech Mat." fill={C.green} opacity={0.7} radius={[2,2,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

export default function RiskEngine({ onDatasetRow }) {
  const [scores, setScores] = useState(Object.fromEntries(RISK_FACTORS.map(f=>[f.key,50])))
  const [sectorCtx, setSectorCtx] = useState('west-africa-sme')
  const [orgSize, setOrgSize] = useState('micro')
  const [aiAnalysis, setAiAnalysis] = useState('')
  const [loading, setLoading] = useState(false)
  const [riskScore, setRiskScore] = useState(null)
  const [subTab, setSubTab] = useState('scoring')

  const computeRisk = () => {
    const raw = RISK_FACTORS.reduce((sum,f) => sum + ((100-scores[f.key]) * f.weight), 0)
    return Math.round(raw)
  }

  const analyze = async () => {
    setLoading(true); setAiAnalysis('')
    const rs = computeRisk()
    setRiskScore(rs)
    const factorText = RISK_FACTORS.map(f=>`${f.label}: ${scores[f.key]}/100 (weight ${f.weight})`).join('\n')
    onDatasetRow?.({ sector:sectorCtx, orgSize, ...scores, computedRisk:rs, ts:new Date().toISOString() })
    await streamClaude(
      `You are NEXUS Risk Engine AI for PhD research on AI-Driven Cyber Risk Assessment for West African SMEs. Analyze risk factor scores and provide: 1) Overall Risk Profile interpretation 2) Critical weaknesses (lowest scores) 3) SHAP-style feature importance explanation 4) West Africa market-specific risk amplifiers 5) Prioritized remediation with ROI estimates 6) Research contribution: how this scoring model advances the field. ~400 words.`,
      `Sector: ${sectorCtx} | Org Size: ${orgSize} | Computed Risk Score: ${rs}/100\n\nFactor Scores:\n${factorText}\n\nProvide PhD-research-grade risk analysis with West African digital market context.`,
      setAiAnalysis
    ).catch(e=>setAiAnalysis('Error: '+e.message))
    setLoading(false)
  }

  const rs = computeRisk()
  const riskC = rs>70?C.red:rs>40?C.orange:C.green
  const tb=(id,label,active)=>(
    <button key={id} onClick={()=>setSubTab(id)} style={{padding:'6px 14px',fontSize:'10px',letterSpacing:'2px',cursor:'pointer',background:active?C.border:'transparent',color:active?C.cyan:C.textDim,border:`1px solid ${active?C.borderBright:'transparent'}`,borderRadius:'3px',fontFamily:'inherit'}}>
      {label}
    </button>
  )

  return (
    <div>
      <div style={{display:'flex',gap:'6px',marginBottom:'20px',flexWrap:'wrap'}}>
        {tb('scoring','📊 RISK SCORING',subTab==='scoring')}
        {tb('market','🌍 MARKET DASHBOARD',subTab==='market')}
      </div>

      {subTab==='scoring'&&(
        <div style={S.grid2}>
          <Card title="◈ SME RISK FACTOR INPUT" badge="XGBoost-STYLE" badgeColor={C.orange}>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px',marginBottom:'12px'}}>
              <div>
                <label style={S.label}>SECTOR</label>
                <select style={S.select} value={sectorCtx} onChange={e=>setSectorCtx(e.target.value)}>
                  <option value="west-africa-sme">West Africa SME</option>
                  <option value="benin-fintech">Benin Fintech</option>
                  <option value="ghana-ecommerce">Ghana E-commerce</option>
                  <option value="togo-ngo">Togo NGO</option>
                  <option value="west-africa-health">Health Sector</option>
                </select>
              </div>
              <div>
                <label style={S.label}>ORG SIZE</label>
                <select style={S.select} value={orgSize} onChange={e=>setOrgSize(e.target.value)}>
                  <option value="micro">Micro (1-9)</option>
                  <option value="small">Small (10-49)</option>
                  <option value="medium">Medium (50-249)</option>
                </select>
              </div>
            </div>

            <div style={{fontSize:'10px',letterSpacing:'2px',color:C.textDim,marginBottom:'10px'}}>RISK FACTOR MATURITY SCORES (0=worst, 100=best)</div>
            {RISK_FACTORS.map(f=>(
              <div key={f.key} style={{marginBottom:'14px'}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:'4px'}}>
                  <span style={{fontSize:'11px',color:C.text}}>{f.label}</span>
                  <span style={{fontSize:'11px',color:scores[f.key]>60?C.green:scores[f.key]>30?C.orange:C.red,fontWeight:'600'}}>{scores[f.key]}</span>
                </div>
                <input type="range" min="0" max="100" value={scores[f.key]}
                  onChange={e=>setScores(s=>({...s,[f.key]:+e.target.value}))}
                  style={{width:'100%',accentColor:scores[f.key]>60?C.green:scores[f.key]>30?C.orange:C.red}} />
                <span style={{fontSize:'9px',color:C.textDim}}>{f.desc} (weight: {(f.weight*100).toFixed(0)}%)</span>
              </div>
            ))}

            <div style={{borderTop:`1px solid ${C.border}`,paddingTop:'16px',marginTop:'8px'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'10px'}}>
                <span style={{fontSize:'10px',letterSpacing:'2px',color:C.textDim}}>LIVE RISK SCORE</span>
                <span style={{fontSize:'32px',fontWeight:'700',color:riskC,letterSpacing:'2px'}}>{rs}</span>
              </div>
              <RiskBar value={rs} color={riskC} />
              <Btn color={C.orange} disabled={loading} onClick={analyze} style={{marginTop:'14px',width:'100%',justifyContent:'center'}}>
                {loading?'◉ ANALYZING...':'▶ RUN AI RISK ANALYSIS'}
              </Btn>
            </div>
          </Card>

          <div style={{display:'flex',flexDirection:'column',gap:'20px'}}>
            <Card title="◈ FEATURE IMPORTANCE" badge="SHAP STYLE" badgeColor={C.cyan}>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={[...RISK_FACTORS].sort((a,b)=>a.weight-b.weight).map(f=>({name:f.label.split(' ')[0],impact:Math.round((100-scores[f.key])*f.weight),score:scores[f.key]}))} layout="vertical" margin={{top:0,right:20,left:0,bottom:0}}>
                  <CartesianGrid strokeDasharray="2 4" stroke={C.border} horizontal={false} />
                  <XAxis type="number" tick={{fill:C.textDim,fontSize:9}} />
                  <YAxis dataKey="name" type="category" tick={{fill:C.textDim,fontSize:9}} width={60} />
                  <Tooltip contentStyle={{background:C.card,border:`1px solid ${C.border}`,fontSize:'11px',color:C.text}} />
                  <Bar dataKey="impact" name="Risk Contribution" fill={C.orange} opacity={0.85} radius={[0,2,2,0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
            {riskScore!==null&&(
              <Card title="◈ RISK PROFILE">
                <div style={S.grid2}>
                  <MetricCard label="RISK SCORE" value={`${riskScore}/100`} color={riskC} size="20px" />
                  <MetricCard label="RISK LEVEL" value={riskScore>70?'HIGH':riskScore>40?'MEDIUM':'LOW'} color={riskC} size="16px" />
                  <MetricCard label="WEAKEST AREA" value={RISK_FACTORS.sort((a,b)=>scores[a.key]-scores[b.key])[0]?.label.split(' ')[0]} color={C.red} size="14px" />
                  <MetricCard label="SECTOR" value={sectorCtx.split('-')[0].toUpperCase()} color={C.cyan} size="14px" />
                </div>
              </Card>
            )}
          </div>
          {aiAnalysis&&<AIOutput text={aiAnalysis} title="◈ NEXUS AI — RISK INTELLIGENCE REPORT" badge="PhD RESEARCH" />}
        </div>
      )}

      {subTab==='market'&&(
        <div style={S.grid2}>
          <div style={{...S.card,...S.fullWidth}}>
            <div style={S.cardHeader}><span style={S.cardTitle}>◈ WEST AFRICA COMPARATIVE MARKET DASHBOARD</span><span style={S.tag(C.green)}>RESEARCH</span></div>
            <p style={{fontSize:'11px',color:C.textDim,lineHeight:'1.7',marginBottom:'16px'}}>Side-by-side cyber risk profile comparison across West African digital markets. Maps directly to your empirical research scope: Benin Republic, Ghana, Togo, The Gambia.</p>
            <MarketDashboard />
          </div>
        </div>
      )}
    </div>
  )
}
