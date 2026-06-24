# Sentinel AI

> **AI-Native Cyber Threat Intelligence Platform**

Sentinel AI is an explainable cyber threat intelligence platform designed to detect, investigate, and explain digital threats across suspicious messages, URLs, domains, screenshots, QR codes, documents, and threat-intelligence signals.

It combines deterministic security checks, LLM-powered reasoning, OSINT enrichment, and evidence-backed reporting to help users understand **what is dangerous, why it is dangerous, and what to do next.**

---

## Current Release — Sentinel Scan

The current Phase 1 release focuses on an intelligent threat-analysis engine for suspicious text, messages, emails, and URLs.

### Current Capabilities

- Detects phishing and credential-harvesting attempts
- Extracts URLs, email addresses, and phone numbers
- Detects urgency and social-engineering language
- Detects brand impersonation attempts
- Identifies OTP, payment, and account-blocking scams
- Uses LLM-powered cybersecurity reasoning
- Produces structured threat reports with:
  - Verdict and confidence
  - Threat type and severity
  - Technical explanation
  - Indicators of Compromise (IOCs)
  - MITRE ATT&CK mapping
  - Recommended actions
  - Educational guidance
- Provides a FastAPI backend with interactive Swagger documentation

---

## Threat Analysis Flow

```text
Suspicious Message / URL / Email
              │
              ▼
     Signal Extraction Engine
  URLs • Emails • Phone Numbers
              │
              ▼
    Security Heuristics Engine
Urgency • OTP Requests • Impersonation
              │
              ▼
       LLM Threat Reasoning
 Contextual Cybersecurity Analysis
              │
              ▼
      Explainable Threat Report
Verdict • IOCs • MITRE • Actions
```

---

## Platform Vision

Sentinel AI is being developed as a modular cyber threat intelligence ecosystem.

| Module | Purpose |
|---|---|
| **Sentinel Scan** | Analyze suspicious messages, emails, URLs, job offers, and payment scams |
| **Sentinel OSINT** | Enrich domains, URLs, and IPs with reputation and intelligence signals |
| **Sentinel Forensics** | Analyze communication evidence, headers, links, entities, and indicators |
| **Sentinel Vision** | Scan screenshots, QR codes, documents, and visual phishing attempts |
| **Sentinel SOC** | Analyst dashboard, scan history, charts, investigation timeline, and MITRE mapping |
| **Sentinel Intel** | Threat feeds, IOC intelligence, global activity insights, and community intelligence |
| **Sentinel Reports** | Generate professional CTI-style PDF investigation reports |
| **Sentinel Guard** | Browser extension, integrations, API, and proactive threat protection |

---

## Roadmap

- [x] Project architecture and FastAPI backend setup
- [x] Hybrid text-based threat analysis engine
- [x] URL, email, phone number, urgency, and impersonation extraction
- [x] LLM-powered phishing and scam reasoning
- [x] Structured explainable threat report
- [ ] Professional React threat scan console
- [ ] OSINT enrichment with domain, IP, and URL reputation signals
- [ ] Email, SMS, and URL forensic analysis
- [ ] Screenshot OCR and QR-code intelligence
- [ ] SOC dashboard with scan history and threat analytics
- [ ] Live threat feeds and global threat map
- [ ] CTI PDF report generator
- [ ] Chrome extension
- [ ] Community threat database and public API
- [ ] Deployment, documentation, and production hardening

---

## Tech Stack

### Backend

- Python
- FastAPI
- Pydantic
- Uvicorn
- Python Dotenv

### Intelligence Layer

- Rule-based security signal detection
- LLM-powered contextual analysis
- OpenRouter-compatible LLM integration
- MITRE ATT&CK-aligned reporting

### Planned Frontend

- React
- Vite
- Modern cybersecurity/SOC-inspired UI
- Data visualization and threat dashboards

---

## Project Structure

```text
sentinel-ai/
│
├── backend/
│   ├── core/
│   │   ├── analyzer.py      # Signal extraction and hybrid analysis orchestration
│   │   └── llm.py           # LLM threat reasoning integration
│   └── main.py              # FastAPI application and API routes
│
├── frontend/                # React application (in progress)
├── .gitignore
└── README.md
```

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Sentinel AI service information |
| `GET` | `/health` | Backend health check |
| `POST` | `/analyze` | Analyze suspicious text and return a full threat report |

### Example Request

```json
{
  "text": "Your bank account will be blocked today. Verify immediately at http://example-suspicious-link.xyz and enter your OTP."
}
```

### Example Analysis Output

```json
{
  "summary": {
    "verdict": "CRITICAL",
    "confidence": 100,
    "attack_type": "Phishing (Credential Harvesting)",
    "severity": "CRITICAL"
  },
  "verdict_color": "red"
}
```

---

## Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/Pranay-Kumar-02/sentinel-ai.git
cd sentinel-ai
```

### 2. Create and activate a virtual environment

```bash
python -m venv venv
```

**Windows PowerShell**

```powershell
venv\Scripts\Activate.ps1
```

### 3. Install dependencies

```bash
pip install fastapi "uvicorn[standard]" python-dotenv openai
```

### 4. Configure environment variables

Create `backend/.env`:

```env
OPENROUTER_API_KEY=your_api_key_here
```

> Never commit `.env` files or API keys to GitHub.

### 5. Run the backend

```bash
cd backend
uvicorn main:app --reload
```

Open API documentation:

```text
http://127.0.0.1:8000/docs
```

---

## Security and Privacy

- API keys are stored locally in environment variables and excluded from Git.
- Input size is limited to reduce abuse and unnecessary API usage.
- Sentinel AI is an educational and defensive cybersecurity project.
- Analysis results should support—not replace—official incident response, banking, or security-team guidance.

---

## Status

**Active Development — Phase 1**

Current focus: building the professional React threat scan console and connecting it to the live FastAPI analysis engine.

---

## Author

**Pranay Kumar**  
B.Tech CSE (Information Security)  
Building AI-powered cybersecurity and security-intelligence projects.