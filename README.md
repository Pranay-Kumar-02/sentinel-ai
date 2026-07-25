# Sentinel AI

**India's first open-source, AI-native Cyber Threat Intelligence platform.**

[![Python](https://img.shields.io/badge/Python-3.12-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Backend-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Three.js](https://img.shields.io/badge/Three.js-3D%20Engine-black?logo=three.js&logoColor=white)](https://threejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](#license)

Sentinel AI fuses LLM reasoning, real-time OSINT automation, and MITRE ATT&CK intelligence into a single platform, built for the people enterprise security tools were never priced for: students, independent analysts, small teams, and anyone who wants to understand a threat instead of just trusting a black box.

---

## Why This Exists

Real cyber threat intelligence is expensive. Platforms like CrowdStrike Falcon, built for enterprises with six- and seven-figure security budgets, aggregate exactly the kind of signal — live indicators of compromise, cross-verified reputation data, behavioral analysis — that would help almost anyone make a better decision about a suspicious link, email, or file. Almost nobody outside a funded organization gets to use tools built to that standard. A student learning security gets textbooks and toy datasets. An independent analyst gets whatever free-tier scraps individual services offer, one at a time, with no synthesis between them. A regular person who receives a suspicious WhatsApp message about their bank account has essentially no tool at all beyond their own instinct.

Sentinel AI is an attempt to close that gap, not by building a smaller, worse version of an enterprise product, but by building toward the same standard of rigor with a different set of constraints: no budget, no team, and a genuine commitment to the data being real. Every threat shown on this platform's live feed is a real, currently active malicious URL. Every verdict is the product of independent reasoning cross-checked against actual evidence, not a single model's opinion presented with false confidence.

## How It Works

At the center of Sentinel AI is a simple idea: no single source should get to decide a verdict alone. When something is submitted for analysis, it's evaluated on two independent tracks that are then reconciled, not just concatenated.

The first track is an LLM-driven reasoning engine, prompted specifically for threat analysis rather than general conversation, which reads the actual content, language patterns, urgency tactics, and structural signals of what it's given and produces a verdict, a confidence score, and a plain-language explanation.

The second track is a real OSINT investigation, detailed feature by feature below.

These two tracks are then combined through a severity-ranked escalation system: the final verdict is always the more severe of the two findings, computed the same consistent way across every part of the platform, rather than each feature quietly implementing its own slightly different logic. If either track finds something serious, the platform doesn't average that away or let a calmer secondary signal soften a genuine warning.

The result is a platform that behaves less like a single AI model wearing a security-themed skin, and more like an actual analyst workflow: gather independent evidence, weigh it honestly, and only then commit to a verdict.

---

## Threat Scanner

**What it does:** Accepts any message, URL, email fragment, or general text and runs it through the full two-track analysis engine, returning a verdict, a confidence score, the likely attack type, a MITRE ATT&CK technique mapping, and a plain-language explanation of the reasoning behind the assessment.

**Why it matters:** Phishing and scam messages are the single most common attack vector reaching ordinary people directly — over SMS, WhatsApp, and email — and most people have no way to independently verify whether something is a scam beyond gut instinct. A tool that explains *why* something is suspicious, rather than just issuing a red or green light, teaches the person using it to recognize the next attack themselves, which matters more than any single verdict.

**How it's different:** Most "check if this is phishing" tools fall into one of two failure modes. Either they're simple keyword blocklists that miss any attack phrased slightly differently than what's already in the list, or they're a pure LLM wrapper with no independent verification, capable of confidently hallucinating a verdict with no real evidence behind it. Sentinel AI's Threat Scanner requires two genuinely independent evidence streams — LLM reasoning about the content itself, and OSINT verification of any URLs or domains mentioned — to agree before committing to a severity level, with the actual escalation logic visible and consistent rather than a black box.

---

## OSINT Recon

**What it does:** Runs a deep investigation on any URL or domain, aggregating results across five independent signal sources into one coherent, transparently-scored risk assessment.

**Why it matters as a whole:** No individual security check is reliable on its own. Any single source — even a good one — has blind spots, and a phishing site smart enough to evade one check often sails past it looking completely clean. Aggregation is what makes OSINT actually useful instead of just one more opinion to distrust.

### VirusTotal Integration
Aggregates the verdicts of 70+ independent antivirus and threat-detection engines on a given URL. No single antivirus engine catches everything — different engines specialize in different malware families, use different heuristics, and update their signatures on different schedules. Cross-referencing dozens of them simultaneously is dramatically more reliable than trusting any one. Most free consumer tools show a user the opinion of exactly one checker; Sentinel synthesizes many into a single score.

### WHOIS & Domain Age Analysis
Extracts real domain registration data and calculates exactly how old a domain is. Domain age is one of the strongest and hardest-to-fake phishing signals that exists: attackers register a domain, run a campaign for a few days or weeks, and abandon it — they cannot retroactively age a domain to make it look established. Most consumer-facing tools either don't surface domain age at all, or bury it in a raw WHOIS text dump that a non-technical user has no way to interpret. Sentinel translates it directly into a plain risk rating.

### IP Geolocation & Infrastructure Analysis
Resolves the real IP address behind a domain and checks whether it's hidden behind a VPN, proxy, or generic cloud/datacenter hosting — a common pattern used to obscure the true operator of a malicious site. Legitimate, established businesses tend to have stable, identifiable infrastructure; infrastructure actively working to obscure itself is a meaningful, if imperfect, signal worth surfacing rather than ignoring.

### Google Safe Browsing
Checks a URL directly against Google's own blocklist of confirmed malicious sites — the same list that protects billions of Chrome users in real time. If Google has already flagged something as dangerous, that is about as strong an independent signal as exists anywhere. Many lightweight security tools skip this entirely.

### Typosquatting Detection
Detects brand impersonation through near-identical lookalike domains — the classic technique of registering something like a domain that swaps a lowercase "l" for a capital "I", or embeds a real brand name inside an otherwise unrelated domain. This is one of the single most common phishing techniques in active use, especially against Indian users through SBI, HDFC, Paytm, and UIDAI lookalikes. The detector is built with word-boundary-aware matching specifically engineered to avoid false positives — an earlier, naive version of this exact detector would have flagged the word "Coca-Cola" as impersonating the ride-hailing brand "Ola," simply because "ola" appears as a substring. That kind of bug quietly destroys user trust the first time it fires incorrectly, so getting the matching logic genuinely right, not just approximately right, was treated as a real priority.

---

## Forensics Lab

**What it does:** Accepts screenshots, QR codes, PDF files, and DOCX documents, extracts every piece of text and every embedded URL from them, and feeds all of it back into the same threat analysis pipeline the rest of the platform uses.

**Why it matters:** Modern scams increasingly arrive as *images* rather than plain text — a screenshot of a fake "bank alert," a WhatsApp-forwarded image of a fraudulent notice — specifically because text-based spam and phishing filters that scan message content are blind to anything embedded in a picture. If the actual threat is a photograph, a text-only scanner never sees it at all. OCR extraction closes that entire blind spot.

QR code phishing, often called "quishing," is a fast-growing attack category built around a specific weakness: a QR code's actual destination is not human-readable before scanning it. Fake parking-fine QR codes and fake payment QR codes both rely on this. Sentinel decodes the underlying URL and analyzes it *before* a user would ever have to visit it blind.

PDF and DOCX analysis closes another common gap: invoice fraud and malicious document attachments remain one of the most effective Business Email Compromise vectors precisely because most people trust attachments more than they trust plain-text links.

---

## Email Analyzer

**What it does:** Performs full technical forensics on raw email source, including headers — SPF, DKIM, and DMARC authentication validation, hop-chain tracing across every mail server the message actually passed through, Business Email Compromise pattern detection, and display-name spoofing analysis.

**Why it matters:** Email remains one of the most common initial access vectors in real-world breaches, and the reason it stays effective is that most email clients show a user a friendly, human-readable "From: Your Bank" without ever surfacing the actual technical authentication result behind it.

**SPF, DKIM, and DMARC** are the real cryptographic and DNS-based mechanisms that determine whether a mail server was actually authorized to send email on behalf of a given domain. Almost no ordinary user has ever seen this data directly, even though it is the single most reliable technical signal available for detecting a spoofed sending domain. Surfacing it in plain language is one of the highest-leverage things this feature does.

**Hop-chain tracing** reconstructs the real path a message took through mail servers on its way to the inbox, which can reveal a mismatch between an email's claimed origin and its actual technical route — something a spoofed "From" address alone will never show.

**Business Email Compromise detection** targets a specific, financially devastating attack category: fraudulent "urgent wire transfer" requests that impersonate an executive or vendor, an attack pattern responsible for billions of dollars in real annual losses precisely because it targets organizational trust rather than technical vulnerabilities.

**Display-name spoofing detection** catches a genuinely common trick where an attacker sets the visible sender name to something trusted, like "PayPal Support," while the actual underlying email address is completely unrelated. Most email clients prominently display only the friendly name and hide the real address by default, which is exactly what makes this technique so durable.

---

## Live Intelligence

**What it does:** Renders a real-time, three-dimensional visualization of active global cyber threats, built on genuine geographic coordinates rather than approximated or randomized positions, with animated attack-path arcs reflecting real detections as they happen.

**Why it matters:** Reading a static "top 10 threats this week" list is abstract. Watching real, currently active attacks appear continuously across an actual globe, at their actual locations, communicates the scale and constancy of the threat landscape in a way a list never will — and that shift in understanding is itself a form of security awareness.

**How it's different:** Virtually every "live cyberattack map" most people have encountered — the well-known Kaspersky and Norse-style visualizations — is built either on fully simulated, decorative data, or on licensed enterprise honeypot networks completely unavailable to an independent developer. Sentinel AI's version is built entirely on a legitimately free, real data source, meaning every point on the globe corresponds to an actual reported malicious URL, not a random number generator dressed up to look impressive.

---

## AI Copilot

**What it does:** Provides a persistent AI assistant available throughout the platform, built specifically to explain what a detected threat actually means, why it was flagged, and what a user should understand about the broader attack pattern it belongs to.

**Why it matters:** A raw verdict — "DANGEROUS, 87% confidence" — with no explanation doesn't build understanding. It just asks for trust. People need to know *why* something is dangerous in order to recognize the next, slightly different version of the same attack on their own, rather than needing to run every future message through a tool forever.

**How it's different:** Most security tools are pure verdict-delivery machines: a red or green light and nothing more. Sentinel treats explanation as a first-class feature in its own right, not an afterthought bolted onto a results screen.

---

## Breach Monitor

**What it does:** Checks real-world exposure across known data breaches, surfacing whether a user's information has already appeared in a prior leak.

**Why it matters:** Threat detection alone only protects someone from *new* attacks. It says nothing about whether their information has already been compromised in the past. Breach monitoring answers a genuinely different, equally important question — "has this already happened to me?" — which changes what precautions actually make sense: password resets, enabling stronger two-factor authentication, and heightened vigilance around accounts tied to an exposed identity.

---

## The Verdict Engine

This isn't a standalone feature so much as the architecture underneath every other one, and it deserves to be understood on its own terms.

Every analysis path in Sentinel AI — the Threat Scanner, the Forensics Lab, the Email Analyzer — independently produces its own findings, and all of them get reconciled through the same severity-ranked escalation logic: SAFE, UNKNOWN, SUSPICIOUS, DANGEROUS, CRITICAL, with the final verdict always taking the most severe result found anywhere in the analysis, computed identically every time rather than through separate, subtly inconsistent logic scattered across different endpoints.

Just as importantly, the platform's confidence scoring is honest about its own limitations. If an OSINT signal source is unavailable — an API key not configured, a request that failed — that check does not silently get treated as "ran and came back clean." It's explicitly excluded from the score, and the platform's reported confidence drops to reflect exactly how much of the full picture it actually gathered. A SAFE verdict built on five independently verified sources and a SAFE verdict built on two are not presented as equally certain, because they aren't.

---

## Technology

The frontend is built in React with Vite, styled with Tailwind CSS, and animated with a combination of Framer Motion for component-level interaction and GSAP for scroll-driven choreography. The live threat visualization is built directly on Three.js, using react-globe.gl as a foundation with custom shader work for real-time lighting and post-processing bloom.

The backend runs on FastAPI with Python 3.12, fully asynchronous throughout via httpx, so multiple external intelligence checks can run concurrently rather than blocking on each other one at a time. LLM reasoning is served through OpenRouter, which routes each request across multiple underlying models rather than depending on a single provider.

Document intelligence is handled by Tesseract for OCR, pyzbar for QR code decoding, PyMuPDF for PDF parsing, and python-docx for Word document extraction.

## Getting Started

Clone the repository, then set up each half of the platform independently.

**Backend**

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create a `.env` file inside `backend/` with the following, all of which have free tiers generous enough for full development use:

```
OPENROUTER_API_KEY=your_key_here
VIRUSTOTAL_API_KEY=your_key_here
GOOGLE_SAFE_BROWSING_KEY=your_key_here
URLHAUS_AUTH_KEY=your_key_here
```

Then start the server:

```bash
python -m uvicorn main:app --reload
```

The API is now running at `http://localhost:8000`, with interactive documentation available at `http://localhost:8000/docs`.

**Frontend**

```bash
cd frontend
npm install
npm run dev
```

The application is now running at `http://localhost:5174`.

## What's Next

The LLM analysis engine, OSINT recon, file forensics, email forensics, live threat feed, three-dimensional visualization, breach monitoring, and typosquatting detection are all built and functional today. Ahead: a personal security score, an attack surface monitor, a CVE explorer, a full investigation workspace for tracking ongoing analyses over time, a browser extension, a public API for other developers to build against, and eventually a community-contributed threat intelligence network, where every user's scan makes the platform smarter for everyone else's.

## Contributing

Sentinel AI is under active, independent development, and issues, suggestions, and pull requests are genuinely welcome. The long-term intent is for this to grow into something community-maintained, not remain a single person's project indefinitely.

## License

MIT. Use it, modify it, build on it.

## Author

Pranay Kumar, B.Tech Computer Science, VIT Vellore, Batch 2024–2028.
[github.com/Pranay-Kumar-02](https://github.com/Pranay-Kumar-02)
