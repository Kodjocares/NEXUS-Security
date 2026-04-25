import { useState } from 'react'
import { C, S } from '../theme'
import { streamClaude } from '../api/claude'
import { Card, Btn, Field, AIOutput } from '../components/UI'

// Paper Draft Generator
function PaperDraftGen() {
  const [section, setSection] = useState('abstract')
  const [context, setContext] = useState('')
  const [format, setFormat] = useState('ieee')
  const [draft, setDraft] = useState('')
  const [loading, setLoading] = useState(false)

  const generate = async () => {
    if (!context.trim()) return
    setLoading(true); setDraft('')
    const sectionGuide = {
      abstract:    'structured abstract: Background, Objective, Methods, Results, Conclusion. ~250 words.',
      intro:       'introduction: research gap, problem statement, contribution, paper structure. ~600 words.',
      litreview:   'literature review: AI in cybersecurity, SME cyber risk, emerging market digital security, gap analysis. ~800 words.',
      methodology: 'methodology: research design, data collection approach (SME surveys, pen-test data), ML model architecture, evaluation metrics. ~600 words.',
      findings:    'findings/results section with tables and analysis narrative. ~500 words.',
      discussion:  'discussion: implications for theory and practice, West Africa SME context, limitations, future work. ~500 words.',
      conclusion:  'conclusion: summary, contributions, recommendations for SMEs and policymakers. ~300 words.',
    }
    await streamClaude(
      `You are NEXUS PaperAI, an academic writing assistant for a PhD dissertation on "AI-Driven Cyber Risk Assessment for SMEs in Emerging Digital Markets" with focus on West Africa (Benin Republic, Ghana, Togo). Write in ${format.toUpperCase()} style. Be academic, rigorous, and cite relevant frameworks (NIST CSF, ISO 27001, MITRE ATT&CK, CVSSv3). Use hedging language appropriate for empirical research.`,
      `Write the ${section} section for a PhD paper on AI cyber risk assessment for West African SMEs.\nResearch context/notes from researcher: ${context}\nFormat: ${format.toUpperCase()}\nSection requirements: ${sectionGuide[section]}`,
      setDraft
    ).catch(e=>setDraft('Error: '+e.message))
    setLoading(false)
  }

  return (
    <div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'10px',marginBottom:'12px'}}>
        <div>
          <label style={S.label}>PAPER SECTION</label>
          <select style={S.select} value={section} onChange={e=>setSection(e.target.value)}>
            <option value="abstract">Abstract</option>
            <option value="intro">Introduction</option>
            <option value="litreview">Literature Review</option>
            <option value="methodology">Methodology</option>
            <option value="findings">Findings / Results</option>
            <option value="discussion">Discussion</option>
            <option value="conclusion">Conclusion</option>
          </select>
        </div>
        <div>
          <label style={S.label}>FORMAT STYLE</label>
          <select style={S.select} value={format} onChange={e=>setFormat(e.target.value)}>
            <option value="ieee">IEEE</option>
            <option value="acm">ACM</option>
            <option value="apa">APA</option>
            <option value="springer">Springer LNCS</option>
          </select>
        </div>
        <div style={{display:'flex',flexDirection:'column',justifyContent:'flex-end'}}>
          <Btn color={C.purple} disabled={loading||!context.trim()} onClick={generate} style={{width:'100%'}}>
            {loading?'◉ DRAFTING...':'▶ GENERATE DRAFT'}
          </Btn>
        </div>
      </div>
      <Field label="RESEARCH NOTES / KEY POINTS TO INCLUDE">
        <textarea style={{...S.textarea,minHeight:'100px'}} value={context} onChange={e=>setContext(e.target.value)} placeholder="e.g., My survey found 73% of Benin SMEs lack formal security policies. AI risk model achieved 89% accuracy on test set. Compare to NIST CSF adoption rates..." />
      </Field>
      {draft&&(
        <div style={{marginTop:'14px'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'8px'}}>
            <span style={{fontSize:'10px',letterSpacing:'2px',color:C.purple}}>◈ GENERATED DRAFT — {section.toUpperCase()}</span>
            <button onClick={()=>{navigator.clipboard?.writeText(draft)}} style={{fontSize:'10px',color:C.cyan,background:'transparent',border:`1px solid ${C.border}`,padding:'3px 10px',borderRadius:'3px',cursor:'pointer',fontFamily:'inherit'}}>COPY</button>
          </div>
          <div style={{background:'#020508',border:`1px solid ${C.border}`,borderRadius:'4px',padding:'16px',fontSize:'12px',lineHeight:'2',color:C.text,whiteSpace:'pre-wrap',maxHeight:'380px',overflowY:'auto'}}>
            {draft}
          </div>
        </div>
      )}
    </div>
  )
}

// Dataset Builder
function DatasetBuilder({ dataset, onAddRow, onExport, onClear }) {
  const [form, setForm] = useState({
    target:'', sector:'', country:'', orgSize:'', riskScore:'', findings:'', attackVector:'', notes:''
  })

  const add = () => {
    if (!form.target.trim()) return
    onAddRow?.({...form})
    setForm({target:'',sector:'',country:'',orgSize:'',riskScore:'',findings:'',attackVector:'',notes:''})
  }

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(dataset,null,2)],{type:'application/json'})
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `nexus_dataset_${Date.now()}.json`
    a.click()
  }

  return (
    <div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'10px',marginBottom:'10px'}}>
        {[
          ['target','Target/Case ID','target-001'],
          ['sector','Sector','west-africa-sme'],
          ['country','Country','Benin Republic'],
          ['orgSize','Org Size','micro'],
          ['riskScore','Risk Score','74'],
          ['attackVector','Primary Attack Vector','phishing'],
        ].map(([k,l,p])=>(
          <div key={k}>
            <label style={S.label}>{l}</label>
            <input style={S.input} placeholder={p} value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))} />
          </div>
        ))}
      </div>
      <Field label="FINDINGS SUMMARY">
        <input style={S.input} placeholder="e.g., No MFA, exposed admin panel, unpatched WordPress" value={form.findings} onChange={e=>setForm(f=>({...f,findings:e.target.value}))} />
      </Field>
      <Field label="NOTES">
        <input style={S.input} placeholder="Research notes..." value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} />
      </Field>
      <div style={{display:'flex',gap:'8px',marginTop:'12px'}}>
        <Btn color={C.green} onClick={add} disabled={!form.target.trim()}>+ ADD ROW</Btn>
        <Btn color={C.cyan} onClick={onExport}>⬇ EXPORT CSV</Btn>
        <Btn color={C.yellow} onClick={exportJson}>⬇ EXPORT JSON</Btn>
        <Btn color={C.textDim} onClick={onClear}>CLEAR DATASET</Btn>
      </div>

      <div style={{marginTop:'16px'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'8px'}}>
          <span style={{fontSize:'10px',letterSpacing:'2px',color:C.textDim}}>DATASET ({dataset.length} rows)</span>
        </div>
        <div style={{background:'#020508',border:`1px solid ${C.border}`,borderRadius:'4px',overflow:'auto',maxHeight:'260px'}}>
          {dataset.length===0&&<div style={{padding:'16px',color:C.textDim,fontSize:'12px'}}>No data yet. Add rows manually or they auto-populate from Risk Engine runs.</div>}
          {dataset.length>0&&(
            <table style={{width:'100%',borderCollapse:'collapse',fontSize:'11px'}}>
              <thead>
                <tr style={{background:'#080d18'}}>
                  {['Target','Sector','Country','Risk','Attack Vector','Findings','TS'].map(h=>(
                    <th key={h} style={{padding:'8px 10px',textAlign:'left',color:C.cyan,fontWeight:'600',letterSpacing:'1px',borderBottom:`1px solid ${C.border}`,fontSize:'9px'}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dataset.map((r,i)=>(
                  <tr key={i} style={{borderBottom:`1px solid ${C.border}22`}}>
                    <td style={{padding:'8px 10px',color:C.text}}>{r.target||'—'}</td>
                    <td style={{padding:'8px 10px',color:C.textDim}}>{r.sector||r.sector_ctx||'—'}</td>
                    <td style={{padding:'8px 10px',color:C.textDim}}>{r.country||'—'}</td>
                    <td style={{padding:'8px 10px',color:+r.riskScore>70?C.red:+r.riskScore>40?C.orange:C.green,fontWeight:'600'}}>{r.riskScore||r.computedRisk||'—'}</td>
                    <td style={{padding:'8px 10px',color:C.orange}}>{r.attackVector||'—'}</td>
                    <td style={{padding:'8px 10px',color:C.textDim,maxWidth:'180px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{r.findings||r.notes||'—'}</td>
                    <td style={{padding:'8px 10px',color:C.textDim,fontSize:'10px'}}>{r.ts?new Date(r.ts).toLocaleDateString():'—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}

// PDF Export
function PDFExport({ session }) {
  const [loading, setLoading] = useState(false)

  const exportPDF = async () => {
    setLoading(true)
    try {
      const { jsPDF } = await import('jspdf')
      const doc = new jsPDF()
      const now = new Date().toLocaleDateString()
      doc.setFillColor(4, 8, 15)
      doc.rect(0, 0, 210, 297, 'F')
      doc.setTextColor(0, 212, 255)
      doc.setFontSize(20)
      doc.text('NEXUS SECURITY', 20, 30)
      doc.setFontSize(11)
      doc.text('AI-Driven Cyber Risk Assessment Report', 20, 40)
      doc.setFontSize(9)
      doc.setTextColor(90, 122, 154)
      doc.text(`Generated: ${now} | PhD Research Platform`, 20, 50)
      doc.setDrawColor(30, 58, 95)
      doc.line(20, 55, 190, 55)
      doc.setTextColor(200, 216, 240)
      doc.setFontSize(10)
      let y = 70
      doc.setTextColor(0, 212, 255)
      doc.text('SESSION STATISTICS', 20, y); y+=10
      doc.setTextColor(200, 216, 240)
      doc.text(`Total Scans: ${session?.stats?.totalScans||0}`, 20, y); y+=7
      doc.text(`Threats Detected: ${session?.stats?.totalThreats||0}`, 20, y); y+=7
      doc.text(`Agent Runs: ${session?.stats?.totalAgentRuns||0}`, 20, y); y+=7
      doc.text(`Dataset Rows: ${session?.dataset?.length||0}`, 20, y); y+=15
      doc.setTextColor(0, 212, 255)
      doc.text('RECENT SCAN FINDINGS', 20, y); y+=10
      doc.setTextColor(200, 216, 240)
      const findings = session?.findings||[]
      if (findings.length===0) { doc.text('No scan findings recorded.', 20, y); y+=7 }
      findings.slice(0,5).forEach(f => {
        doc.text(`• ${f.target||'Unknown'} — Risk: ${f.riskScore||0}/100 | Critical: ${f.critical||0} High: ${f.high||0}`, 20, y)
        y+=7; if(y>270){doc.addPage();y=20}
      })
      y+=8
      doc.setTextColor(0, 212, 255)
      doc.text('RESEARCH CONTEXT', 20, y); y+=10
      doc.setTextColor(200, 216, 240)
      doc.text('Focus: AI-Driven Cyber Risk Assessment for SMEs in Emerging Digital Markets', 20, y); y+=7
      doc.text('Region: West Africa (Benin Republic, Ghana, Togo, The Gambia)', 20, y); y+=7
      doc.text('Researcher: Village Man (Jah Kodjo) | UniOulu ITEE PhD Candidate', 20, y); y+=15
      doc.setDrawColor(30, 58, 95)
      doc.line(20, y, 190, y); y+=8
      doc.setTextColor(90, 122, 154)
      doc.setFontSize(8)
      doc.text('Generated by NEXUS Security Research Platform v2.1 | For authorized academic research only', 20, y)
      doc.save(`nexus_report_${Date.now()}.pdf`)
    } catch(e) { alert('PDF export failed: '+e.message) }
    setLoading(false)
  }

  return (
    <div>
      <p style={{fontSize:'11px',color:C.textDim,lineHeight:'1.7',marginBottom:'16px'}}>
        Export a formatted PDF report of all session findings, risk scores, threat data, and research summary. One-click formatted PDF for thesis appendices and stakeholder deliverables.
      </p>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'12px',marginBottom:'16px'}}>
        {[
          {label:'Scan Findings', val:session?.findings?.length||0, color:C.red},
          {label:'Dataset Rows',  val:session?.dataset?.length||0,  color:C.cyan},
          {label:'Agent Runs',    val:session?.agentRuns?.length||0, color:C.purple},
        ].map(m=>(
          <div key={m.label} style={{background:'#020508',border:`1px solid ${C.border}`,borderRadius:'4px',padding:'14px',textAlign:'center'}}>
            <span style={{fontSize:'28px',fontWeight:'700',color:m.color,display:'block'}}>{m.val}</span>
            <span style={{fontSize:'9px',letterSpacing:'2px',color:C.textDim,display:'block',marginTop:'4px'}}>{m.label}</span>
          </div>
        ))}
      </div>
      <Btn color={C.red} disabled={loading} onClick={exportPDF}>{loading?'◉ EXPORTING...':'⬇ EXPORT PDF REPORT'}</Btn>
    </div>
  )
}

export default function ResearchLab({ session, onAddDatasetRow, onExportDataset, onClearDataset }) {
  const [subTab, setSubTab] = useState('paper')
  const tb=(id,label,active)=>(
    <button key={id} onClick={()=>setSubTab(id)} style={{padding:'6px 14px',fontSize:'10px',letterSpacing:'2px',cursor:'pointer',background:active?C.border:'transparent',color:active?C.cyan:C.textDim,border:`1px solid ${active?C.borderBright:'transparent'}`,borderRadius:'3px',fontFamily:'inherit'}}>
      {label}
    </button>
  )
  return (
    <div>
      <div style={{display:'flex',gap:'6px',marginBottom:'20px',flexWrap:'wrap'}}>
        {tb('paper','📝 PAPER DRAFT',subTab==='paper')}
        {tb('dataset','🗄 DATASET BUILDER',subTab==='dataset')}
        {tb('export','📄 PDF EXPORT',subTab==='export')}
      </div>
      {subTab==='paper'&&(
        <div style={S.grid2}>
          <div style={{...S.card,...S.fullWidth}}>
            <div style={S.cardHeader}><span style={S.cardTitle}>◈ RESEARCH PAPER DRAFT GENERATOR</span><span style={S.tag(C.purple)}>PhD TOOL</span></div>
            <p style={{fontSize:'11px',color:C.textDim,lineHeight:'1.7',marginBottom:'12px'}}>Feed your research notes and findings into Claude to auto-generate academic sections in IEEE/ACM/APA/Springer format. Massive thesis productivity tool.</p>
            <PaperDraftGen />
          </div>
        </div>
      )}
      {subTab==='dataset'&&(
        <div style={S.grid2}>
          <div style={{...S.card,...S.fullWidth}}>
            <div style={S.cardHeader}><span style={S.cardTitle}>◈ RESEARCH DATASET BUILDER</span><span style={S.tag(C.green)}>CSV / JSON</span></div>
            <p style={{fontSize:'11px',color:C.textDim,lineHeight:'1.7',marginBottom:'12px'}}>Build your PhD research dataset from scan findings and manual case entries. Auto-populates from Risk Engine runs. Export as CSV or JSON for analysis in Python/R.</p>
            <DatasetBuilder dataset={session?.dataset||[]} onAddRow={onAddDatasetRow} onExport={onExportDataset} onClear={onClearDataset} />
          </div>
        </div>
      )}
      {subTab==='export'&&(
        <div style={S.grid2}>
          <div style={{...S.card,...S.fullWidth}}>
            <div style={S.cardHeader}><span style={S.cardTitle}>◈ PDF REPORT EXPORT</span><span style={S.tag(C.red)}>THESIS READY</span></div>
            <PDFExport session={session} />
          </div>
        </div>
      )}
    </div>
  )
}
