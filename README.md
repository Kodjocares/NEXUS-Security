# ⬡ NEXUS Security Research Platform v2.1

> **AI-Driven Cyber Risk Assessment for SMEs in Emerging Digital Markets**  
> PhD Research Platform — UniOulu ITEE Faculty

![Version](https://img.shields.io/badge/version-2.1.0-00d4ff?style=flat-square)
![React](https://img.shields.io/badge/React-18-61dafb?style=flat-square&logo=react)
![Vite](https://img.shields.io/badge/Vite-5-646cff?style=flat-square&logo=vite)
![Claude](https://img.shields.io/badge/Claude-Sonnet_4-9966ff?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-00ff88?style=flat-square)
![Research](https://img.shields.io/badge/PhD-Research_Tool-ff8800?style=flat-square)

---

## Overview

NEXUS is a full-stack AI-powered cybersecurity research platform built for PhD-level research on **cyber risk in West African SME digital markets** (Benin Republic, Ghana, Togo, The Gambia). It combines offensive reconnaissance, defensive threat detection, autonomous AI pentesting agents, an SME risk scoring engine, and academic research tooling — all powered by Claude Sonnet via the Anthropic API.

**Research Context:**
> *"AI-Driven Cyber Risk Assessment for SMEs in Emerging Digital Markets"*  
> Proposed doctoral research — UniOulu ITEE | Researcher:(Village Man)

---

## Features

### ⚔ Offensive Module
| Feature | Description |
|---------|-------------|
| **AI Recon Engine** | Passive OSINT — DNS, WHOIS, Shodan, CVE/NVD, subdomain enum, cloud exposure |
| **Kill Chain Visualizer** | Interactive Lockheed Martin kill chain mapped to MITRE ATT&CK tactics |
| **AI Payload Generator** | SQLi, XSS, SSRF, XXE, LFI, RCE payload documentation for lab research |
| **Social Engineering Sim** | WhatsApp, spear-phishing, vishing scenarios for West African SME personas |
| **Risk Scoring** | Automated CVSS-calibrated risk score with critical/high/medium breakdown |
| **Claude AI Analysis** | PhD-grade threat analysis framed around West African digital market context |

### 🛡 Defensive Module
| Feature | Description |
|---------|-------------|
| **SIEM Dashboard** | Real-time event stream with severity filtering and IOC correlation |
| **Log Threat Analysis** | Paste raw logs → AI detects threats with confidence scores + MITRE mapping |
| **Threat Intel Feed** | Brute force, SQLi, webshell, exfiltration, C2 beacon pattern detection |
| **IR Playbooks** | AI-generated NIST-aligned incident response playbooks for SME capacity |
| **Claude Threat Report** | Kill chain reconstruction, MITRE ATT&CK mapping, remediation roadmap |

### 🤖 AI Pentest Agent
| Feature | Description |
|---------|-------------|
| **6-Phase Autonomous Pipeline** | Recon → Scanning → Enumeration → Exploitation → Post-Exploit → Reporting |
| **MITRE ATT&CK Mapping** | Each phase tagged with tactic IDs (TA0043, TA0007, TA0002, TA0004, etc.) |
| **Multi-Agent Debate Mode** | Two Claude agents argue offensive vs defensive perspectives |
| **NL Query Interface** | Ask natural language questions about session findings |
| **Context Presets** | West African SME, Fintech, E-commerce, NGO |
| **Final Report Synthesis** | PhD-grade executive pentest report with CVSS scores and remediation roadmap |

### 📊 Risk Engine
| Feature | Description |
|---------|-------------|
| **8-Factor Risk Model** | Weighted scoring: Patch Mgmt, Access Controls, Backup, Training, Network Seg, IR, Encryption, Vendor Risk |
| **SHAP-Style Feature Charts** | Horizontal bar chart showing per-factor risk contribution |
| **West Africa Market Dashboard** | Radar + bar comparison: Benin, Ghana, Togo, Gambia, Nigeria, Senegal |
| **AI Risk Intelligence Report** | Critical weakness ID, ROI-prioritized remediation, market-specific amplifiers |

### 🔬 Research Lab
| Feature | Description |
|---------|-------------|
| **Paper Draft Generator** | Auto-generates Abstract, Intro, Lit Review, Methodology, Findings in IEEE/ACM/APA format |
| **Dataset Builder** | Accumulates findings from all modules into structured CSV/JSON |
| **PDF Report Export** | One-click formatted PDF for thesis appendices and client deliverables |
| **Session Persistence** | All findings persist in localStorage across browser sessions |

---

## Architecture

```
nexus-security/
├── public/favicon.svg
├── src/
│   ├── api/
│   │   └── claude.js          # Anthropic API client (streaming + multi-turn)
│   ├── components/
│   │   └── UI.jsx             # Terminal, Card, RiskBar, MetricCard, Btn, AIOutput
│   ├── hooks/
│   │   └── useSession.js      # Session persistence (localStorage)
│   ├── modules/
│   │   ├── OffensiveTool.jsx  # Recon + kill chain + payload gen + social eng
│   │   ├── DefensiveTool.jsx  # SIEM + log analysis + threat intel + IR playbooks
│   │   ├── AgentTool.jsx      # Autonomous pentest agent + debate + NL query
│   │   ├── RiskEngine.jsx     # SME risk scoring + SHAP charts + market dashboard
│   │   └── ResearchLab.jsx    # Paper draft gen + dataset builder + PDF export
│   ├── App.jsx                # Root — header, stats bar, tab routing
│   ├── index.css              # Global styles + animations
│   ├── main.jsx               # React entry point
│   └── theme.js               # Design tokens (C = colors, S = shared styles)
├── index.html
├── vite.config.js
├── package.json
├── .env.example
└── .gitignore
```

---

## Quick Start

### Prerequisites
- Node.js 18+
- Anthropic API key → [console.anthropic.com](https://console.anthropic.com)

### Install & Run

```bash
git clone https://github.com/yourusername/nexus-security.git
cd nexus-security
npm install
cp .env.example .env        # Add your VITE_ANTHROPIC_API_KEY
npm run dev                  # Opens at http://localhost:3000
```

### Production Build

```bash
npm run build
npm run preview
```

---

## Environment Variables

```env
# .env (copy from .env.example)
VITE_ANTHROPIC_API_KEY=sk-ant-your-key-here
VITE_GDRIVE_MCP_URL=https://drivemcp.googleapis.com/mcp/v1   # optional
VITE_NOTION_MCP_URL=https://mcp.notion.com/mcp                # optional
```

> **Security Note:** The API key is used client-side in development. For production, proxy requests through a backend server (Express/FastAPI) to keep the key server-side.

---

## Module Usage

### Offensive Recon
1. Enter domain → select scope → **LAUNCH RECON**
2. Review terminal output and AI threat analysis
3. **PAYLOADS** tab → generate research-grade attack payloads
4. **SOCIAL ENG** tab → simulate WhatsApp/phishing scenarios for West African personas
5. **KILL CHAIN** tab → interactive MITRE ATT&CK kill chain visualization

### Defensive / Sentinel
1. Paste raw logs (Apache, nginx, firewall, SIEM) → **ANALYZE THREATS**
2. Review threat cards (type, IP, severity, confidence %)
3. Read Claude threat intelligence report with kill chain reconstruction
4. **SIEM** sub-tab → live event stream simulation
5. **IR PLAYBOOKS** → AI-generated NIST-aligned response procedures

### Pentest Agent
1. Enter target + context → **LAUNCH AUTONOMOUS AGENT**
2. Watch 6 phases run sequentially (each driven by Claude)
3. Expand any phase to read its detailed AI output
4. **DEBATE MODE** → offensive Claude vs defensive Claude dual-analysis
5. **NL QUERY** → ask "what's the highest risk vector for a Cotonou fintech?"

### Risk Engine
1. Set sector + org size → adjust 8 maturity sliders → **RUN AI RISK ANALYSIS**
2. Read SHAP-style feature importance chart
3. **MARKET DASHBOARD** → compare Benin/Ghana/Togo/Gambia risk profiles
4. Findings auto-populate the Research Lab dataset

### Research Lab
1. **PAPER DRAFT** → input your research notes → generate IEEE/ACM sections
2. **DATASET** → view all accumulated findings → Export CSV for Python/R
3. **PDF EXPORT** → formatted report with session summary for thesis appendices

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite 5 |
| AI Engine | Claude Sonnet (claude-sonnet-4-20250514) |
| Charts | Recharts |
| PDF Export | jsPDF + jsPDF-AutoTable |
| State | React hooks + localStorage |
| Font | JetBrains Mono |

---

## Ethical & Legal Notice

> **This platform is built exclusively for authorized academic research, controlled lab pentesting, and security awareness training.**

- All offensive recon modules **simulate** findings — no live exploitation occurs
- Social engineering scenarios are for **defensive awareness training** documentation only  
- Payload generation is for **academic vulnerability documentation** only
- Never run against systems you do not own or have explicit written permission to test
- The researcher takes full responsibility for appropriate and ethical use

---

## Roadmap

- [ ] Backend proxy for production API key security (FastAPI recommended)
- [ ] Google Drive / Notion export via Anthropic MCP
- [ ] Live CVE/NVD API integration
- [ ] OWASP Top 10 2021 overlay mapping
- [ ] French language support (Francophone West Africa)
- [ ] Docker containerisation + docker-compose
- [ ] Mobile-responsive layout
- [ ] Offline mode with cached AI responses

---

## Citation

If you use NEXUS in your research, please cite:

```bibtex
@software{nexus_security_2025,
  author    = {villageman},
  title     = {NEXUS Security Research Platform: AI-Driven Cyber Risk Assessment for SMEs},
  year      = {2025},
  publisher = {GitHub},
  url       = {https://github.com/yourusername/nexus-security}
}
```

---

## License

MIT License — free to use, modify, and distribute for research and educational purposes.

---

## Author

**Village**  

---

*NEXUS Security Research Platform v2.1 — Powered by Claude Sonnet + React + Vite*
