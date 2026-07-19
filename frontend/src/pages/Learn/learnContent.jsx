// ─────────────────────────────────────────────────────────────────────────────
// SENTINEL AI — Learn content (tiered)
// 11 topics, each with FOUR depth levels (Newbie/Beginner/Intermediate/
// Experienced) — same topic, escalating depth, not repeated content.
// Quiz questions are difficulty-tagged (1-4) rather than duplicated per
// tier: each tier unlocks questions up to its own difficulty ceiling.
// ─────────────────────────────────────────────────────────────────────────────

export const TIERS = [
    { id: "newbie", label: "Newbie", icon: "🌱", desc: "Explain it simply, from zero" },
    { id: "beginner", label: "Beginner", icon: "📘", desc: "I know the basics already" },
    { id: "intermediate", label: "Intermediate", icon: "⚙️", desc: "Give me the technical detail" },
    { id: "experienced", label: "Experienced", icon: "🎯", desc: "Attacker & defender depth" },
];

const TIER_ORDER = ["newbie", "beginner", "intermediate", "experienced"];

export const TOPICS = [
    {
        id: "phishing",
        title: "Phishing",
        icon: "🎣",
        tool: { name: "Threat Scanner", path: "/scanner" },
        summary: "The single most common way people get scammed online.",
        content: {
            newbie: {
                hook: "Imagine someone dresses up as a delivery person just to get inside your house. Phishing is the online version of that.",
                body: "Someone pretends to be your bank, a shop, or someone you trust, and sends you a message to trick you into giving away private information or clicking something bad.",
                action: "If a message asks you to click a link or share a password/OTP urgently, stop and ask a family member first.",
            },
            beginner: {
                sections: [
                    { heading: "The core trick", body: "Phishing is when someone impersonates a trusted source — your bank, a delivery company, your workplace — to trick you into giving up sensitive information or clicking something harmful. It almost always relies on one thing: making you act before you think." },
                    { heading: "The tells", body: "Urgency (\"your account will be suspended in 24 hours\"), generic greetings (\"Dear Customer\"), a sender address that's close-but-not-quite right, and requests for your password, OTP, or payment details. Real organizations essentially never ask for these over email or SMS." },
                    { heading: "The one habit that stops most of it", body: "Before clicking anything, ask: did I expect this message? If your \"bank\" emails about a problem you didn't cause, open your banking app or website directly instead of clicking the link." },
                ],
            },
            intermediate: {
                sections: [
                    { heading: "How attackers pick their targets", body: "Modern phishing is rarely random. Attackers scrape email lists from old breaches or company websites, then send templated messages at scale — sometimes personalized with a real name or employer pulled from public sources (OSINT)." },
                    { heading: "Detecting it technically", body: "Look past the display name at the actual sender address, hover (don't click) over links to preview the real destination URL, and confirm the domain matches the organization exactly — not just \"looks similar.\"" },
                ],
            },
            experienced: {
                sections: [
                    { heading: "MITRE ATT&CK mapping", body: "Phishing sits under Initial Access (T1566), with sub-techniques for spearphishing via attachment (T1566.001), link (T1566.002), and third-party service (T1566.003) — the sub-technique shapes what defensive telemetry actually catches it." },
                    { heading: "Defender's lens", body: "Effective defense layers email authentication enforcement (SPF/DKIM/DMARC), URL rewriting/sandboxing at the gateway, and user reporting funnels. Technical controls reduce volume, but a well-crafted spearphish will occasionally land — which is why post-click detection (EDR, anomalous auth alerts) matters as much as prevention." },
                ],
            },
        },
        quiz: [
            { difficulty: 1, question: "A message says \"urgent: click now or lose your account.\" This is a sign of:", options: ["Good customer service", "Trying to rush you into acting", "Nothing unusual", "A software update"], correctIndex: 1, explain: "Urgency is the #1 phishing trick — it stops you from thinking carefully.", hint: "Think about how it makes you feel — calm, or rushed?" },
            { difficulty: 1, question: "Real banks ask for your OTP over SMS to \"verify\" you.", options: ["True", "False"], correctIndex: 1, explain: "Banks never need your OTP — you're the only one who should know it." },
            { difficulty: 2, question: "The safest way to check a suspicious \"account problem\" email is to:", options: ["Click the link and see", "Reply asking questions", "Open the company's app/website directly yourself", "Forward it to a friend"], correctIndex: 2, explain: "Going in through your own bookmark or app sidesteps the fake link entirely." },
            { difficulty: 3, question: "Which detail is the strongest technical signal something's phishing?", options: ["The message has a typo", "The display name matches a company you know", "The actual sender domain doesn't match the real company's domain", "The message is long"], correctIndex: 2, explain: "Display names can say anything — the real domain behind it is what matters." },
            { difficulty: 4, question: "Phishing delivered via a trusted third-party service (like a shared-doc link) maps to which MITRE sub-technique?", options: ["T1566.001", "T1566.002", "T1566.003", "T1598"], correctIndex: 2, explain: "T1566.003 specifically covers phishing delivered via a legitimate third-party service." },
        ],
    },
    {
        id: "smishing",
        title: "SMS Scams (Smishing)",
        icon: "📱",
        tool: { name: "Is This Safe?", path: "/easy" },
        summary: "India-specific SMS scams — KYC, courier fees, lottery fraud.",
        content: {
            newbie: {
                hook: "Imagine a stranger calls your phone pretending to be your bank — smishing is that, but by text message.",
                body: "Smishing is a scam text pretending to be your bank, a delivery company, or the government, trying to get you to click a link or share private details.",
                action: "Never click links in unexpected SMS about KYC, prizes, or blocked accounts — check with the real company directly.",
            },
            beginner: {
                sections: [
                    { heading: "Why SMS scams work so well", body: "Text messages feel more personal and urgent than email, and India's heavy reliance on real SMS bank alerts makes fake ones blend in easily." },
                    { heading: "Common patterns in India", body: "Fake KYC update warnings, fake courier/customs fee demands, fake electricity disconnection notices, and \"you've won a prize\" messages are extremely common — most use shortened or unusual domains (.tk, .ml, .xyz) instead of a bank's real website." },
                    { heading: "What to do", body: "Don't click the link. If worried, open your bank's official app directly, or call the number printed on your physical bank card — never a number given in the suspicious text." },
                ],
            },
            intermediate: {
                sections: [
                    { heading: "Shortened links and redirect chains", body: "Scam SMS often use URL shorteners specifically to hide the true destination until the last moment, sometimes chaining through multiple redirects to evade basic link-scanning filters." },
                    { heading: "SIM-swap adjacent risk", body: "Some smishing campaigns aren't just after credentials — they're reconnaissance for SIM-swap fraud, gathering enough personal detail via a fake \"KYC update\" form to later convince a telecom provider to port your number." },
                ],
            },
            experienced: {
                sections: [
                    { heading: "Infrastructure patterns", body: "Bulk smishing campaigns typically rely on disposable, freshly-registered domains and abused bulk-SMS gateways — domain age and sender reputation are strong, automatable detection signals." },
                    { heading: "Defensive angle", body: "Telecom-level SMS filtering matched against known scam sender-ID patterns, combined with client-side heuristics (any SMS pairing a shortened link with financial-urgency language), catches most campaigns before user interaction." },
                ],
            },
        },
        quiz: [
            { difficulty: 1, question: "A text says your electricity will be cut off in 2 hours unless you pay now. This is most likely:", options: ["A real emergency", "A smishing scam using urgency"], correctIndex: 1, explain: "Would your real electricity provider text you with a 2-hour deadline?" },
            { difficulty: 1, question: "It's safe to click a link in an SMS if the message looks official.", options: ["True", "False"], correctIndex: 1, explain: "Looking official is exactly what scam texts are designed to do." },
            { difficulty: 2, question: "The safest way to check a bank SMS alert is to:", options: ["Reply to the text", "Click the link and look around", "Open your bank's app directly", "Call the number in the text"], correctIndex: 2, explain: "Never trust a number or link provided inside the suspicious message itself." },
            { difficulty: 3, question: "Why do scammers often use link shorteners in smishing texts?", options: ["To save character space only", "To hide the real destination domain", "Because SMS requires it", "To make texts load faster"], correctIndex: 1, explain: "Shorteners obscure the true, often suspicious, destination until the last click." },
            { difficulty: 4, question: "A fake \"KYC update\" smishing campaign asking for extra personal detail may actually be reconnaissance for:", options: ["Just spam", "SIM-swap fraud preparation", "A software update", "Nothing, it's harmless"], correctIndex: 1, explain: "Extra personal detail can later help an attacker impersonate you to port your number." },
        ],
    },
    {
        id: "vishing",
        title: "Voice Phishing (Vishing)",
        icon: "📞",
        tool: null,
        summary: "Scam phone calls impersonating police, banks, or tech support.",
        content: {
            newbie: {
                hook: "A scammer can call you pretending to be police, a bank officer, or tech support — that's a vishing call.",
                body: "Vishing uses a real phone call to pressure you into paying money or sharing private information, often by pretending to be an authority figure.",
                action: "Real police or bank officials never demand gift-card payment or immediate action on a call. Hang up and call back using an official number if unsure.",
            },
            beginner: {
                sections: [
                    { heading: "Why a voice feels more convincing", body: "A live, authoritative-sounding voice creates pressure that text or email doesn't — scammers exploit this by impersonating police, tax officials, or bank fraud departments." },
                    { heading: "Classic patterns", body: "Threats of arrest for a \"tax violation,\" demands to pay via gift cards or wire transfer, and fake \"your card has been used fraudulently, confirm your OTP\" calls are extremely common." },
                    { heading: "What to do", body: "No real government agency or bank demands immediate gift-card payment or your OTP over a call. Hang up, and call the organization back using a number you look up yourself." },
                ],
            },
            intermediate: {
                sections: [
                    { heading: "Caller ID spoofing", body: "Vishing calls frequently spoof caller ID to display a legitimate-looking, even real, bank number — caller ID alone cannot be trusted as proof of identity." },
                    { heading: "Social engineering escalation", body: "Skilled vishing often starts low-pressure (a \"routine verification call\") before escalating to urgent demands once some trust or information has already been extracted. The escalation pattern itself is a red flag." },
                ],
            },
            experienced: {
                sections: [
                    { heading: "Voice cloning convergence", body: "Vishing increasingly overlaps with AI voice-cloning — a cloned voice of a real executive or family member raises the bar for verification well beyond \"does this sound like them.\"" },
                    { heading: "Organizational defense", body: "Callback verification via a pre-established out-of-band channel, and codeword systems for high-value requests (wire transfers, credential resets), are the standard mitigation against both classic and AI-assisted vishing." },
                ],
            },
        },
        quiz: [
            { difficulty: 1, question: "Someone calls claiming to be police, demanding an immediate fine paid via gift cards. This is:", options: ["Normal police procedure", "A scam"], correctIndex: 1, explain: "Real police never collect fines via gift cards over a phone call." },
            { difficulty: 1, question: "Caller ID showing your bank's real number proves the call is genuinely from your bank.", options: ["True", "False"], correctIndex: 1, explain: "Caller ID can be spoofed to display any number, including real ones." },
            { difficulty: 2, question: "If a caller claiming to be your bank asks for your OTP, you should:", options: ["Give it if they sound official", "Never share it, no matter how official they sound", "Ask them to call back later", "Give half of it"], correctIndex: 1, explain: "No legitimate caller ever needs your OTP." },
            { difficulty: 3, question: "A vishing call that starts calm before suddenly escalating to urgent demands is using:", options: ["Random luck", "A deliberate trust-then-pressure pattern", "Bad call center training", "Nothing notable"], correctIndex: 1, explain: "Building initial trust before the real ask is a known social engineering technique." },
            { difficulty: 4, question: "The best defense against a spoofed executive voice requesting an urgent wire transfer is:", options: ["Trusting the voice since it sounds right", "Out-of-band callback verification via a known number", "Asking them to repeat the request", "Complying quickly to avoid trouble"], correctIndex: 1, explain: "Verification through a channel the attacker doesn't control defeats even a perfect voice clone." },
        ],
    },
    {
        id: "typosquatting",
        title: "Fake Websites (Typosquatting)",
        icon: "🔤",
        tool: { name: "Typosquat Watchdog", path: "/typosquat" },
        summary: "Lookalike domains — and the padlock myth that fools people.",
        content: {
            newbie: {
                hook: "Imagine a fake shop opens right next door with almost the exact same name as a real one, hoping you walk in by mistake. Typosquatting is that, for websites.",
                body: "Scammers register web addresses that look almost like a real company's — one letter different — hoping you won't notice before typing in your password.",
                action: "Always look closely at the website address before logging in anywhere, especially right after clicking a link.",
            },
            beginner: {
                sections: [
                    { heading: "What typosquatting is", body: "Scammers register domains that look almost identical to a real one — swapping a letter (amaz0n.com), adding one (arnazon.com), or using a different ending (amazon-support.net) — hoping you won't notice at a glance." },
                    { heading: "The padlock doesn't mean \"safe\"", body: "A big misconception: HTTPS or a padlock icon means a site is legitimate. It doesn't — it only means the connection is encrypted. Scam sites can and do have valid HTTPS certificates." },
                    { heading: "How to actually check", body: "Read the domain character by character before entering any information, especially on a login or payment page. When in doubt, type the address yourself or use a saved bookmark." },
                ],
            },
            intermediate: {
                sections: [
                    { heading: "Common substitution patterns", body: "Character swaps that look alike (rn for m, 1 for l), added hyphens, extra words, and alternate TLDs (.net instead of .com) are the most common patterns — automated tools can generate thousands of brand variants in seconds." },
                    { heading: "Detecting it technically", body: "Edit-distance comparison against known legitimate domains, combined with checking domain registration age (typosquat domains are usually very recently registered), is how automated detectors — including this platform's Typosquat Watchdog — actually flag suspicious lookalikes." },
                ],
            },
            experienced: {
                sections: [
                    { heading: "Beyond visual similarity", body: "Homoglyph attacks using Unicode characters that render identically to Latin letters (Cyrillic 'а' vs Latin 'a') can defeat naive string-comparison detection entirely — proper detection needs Unicode normalization before comparison." },
                    { heading: "Defensive posture for organizations", body: "Proactive defensive domain registration, combined with monitoring Certificate Transparency logs for new certificates issued on lookalike domains, gives early warning before a typosquat campaign goes live." },
                ],
            },
        },
        quiz: [
            { difficulty: 1, question: "\"g00gle.com\" (with zeros instead of o's) is an example of:", options: ["A safe mirror site", "Typosquatting"], correctIndex: 1, explain: "Character substitution mimicking real letters is a classic typosquatting technique." },
            { difficulty: 1, question: "A padlock icon next to a website address means the site is definitely trustworthy.", options: ["True", "False"], correctIndex: 1, explain: "The padlock only means the connection is encrypted — not who owns the site." },
            { difficulty: 2, question: "The safest way to visit your bank's website is to:", options: ["Click the link in an email", "Search for it and click the first result", "Type the address yourself or use a saved bookmark", "Ask a chatbot for the link"], correctIndex: 2, explain: "This sidesteps both fake links and manipulated search results entirely." },
            { difficulty: 3, question: "What's a strong automated signal that a lookalike domain might be a typosquat?", options: ["It has a professional logo", "It was registered very recently", "It loads quickly", "It has a long URL"], correctIndex: 1, explain: "Typosquat domains are typically registered shortly before a campaign launches." },
            { difficulty: 4, question: "A domain using a Cyrillic 'а' that looks identical to a Latin 'a' is an example of:", options: ["A rendering bug", "A homoglyph attack", "A CDN issue", "Normal internationalization"], correctIndex: 1, explain: "Homoglyphs exploit visually-identical characters from different alphabets." },
        ],
    },
    {
        id: "qr-codes",
        title: "QR Code Safety",
        icon: "🔳",
        tool: { name: "QR Safe Scanner", path: "/qrscanner" },
        summary: "A QR code can point anywhere — you can't tell until you scan it.",
        content: {
            newbie: {
                hook: "A QR code is like a locked box — you can't see what's inside until you scan it.",
                body: "Scanning a QR code takes you to a website instantly, but you can't tell where it leads just by looking at the pattern.",
                action: "Always check the link preview your phone shows before opening it, and be extra careful with QR codes in public places.",
            },
            beginner: {
                sections: [
                    { heading: "Why QR codes are risky by design", body: "A QR code is just a container for a link — one pointing to a real site looks identical to one pointing to a scam site. This gap is exactly what \"quishing\" (QR phishing) exploits." },
                    { heading: "Where it shows up", body: "Fake stickers pasted over real parking-meter or menu QR codes, unsolicited QR codes in messages, and QR \"payment\" codes that are actually collect-requests rather than pay-to-merchant codes." },
                    { heading: "How to stay safe", body: "Most phone cameras show a preview of the destination URL before opening it — always check that preview. Be extra cautious with QR codes in public places, since they can be physically swapped." },
                ],
            },
            intermediate: {
                sections: [
                    { heading: "UPI-specific QR risk (India)", body: "Fraudulent \"collect request\" QR codes are a distinct India-specific scam: scanning one doesn't receive money — approving it can authorize a payment OUT of your account. Always check whether a prompt is asking you to pay or confirm receiving before approving anything." },
                    { heading: "Physical tampering", body: "Because QR stickers are physical objects, attackers can print and paste a malicious sticker directly over a legitimate one — inspect for signs of sticker-over-sticker before scanning in public." },
                ],
            },
            experienced: {
                sections: [
                    { heading: "Payload considerations", body: "Beyond simple URL redirection, QR codes can encode WiFi credentials, contact cards, or app-specific deep links directly — the risk surface isn't limited to phishing pages alone." },
                    { heading: "Detection approach", body: "A robust QR scanner should decode and display the full destination before navigation, flag newly-registered domains, and specifically parse UPI deep link parameters to distinguish a payment request from a collect request." },
                ],
            },
        },
        quiz: [
            { difficulty: 1, question: "Can you tell where a QR code leads just by looking at the pattern?", options: ["Yes", "No"], correctIndex: 1, explain: "The destination is invisible until you actually scan it." },
            { difficulty: 1, question: "A QR sticker on a parking meter looks like it's placed over another sticker.", options: ["This is normal, ignore it", "This could mean the real code was covered by a scam code"], correctIndex: 1, explain: "Physical tampering of QR stickers is a real, documented scam pattern." },
            { difficulty: 2, question: "A UPI \"collect request\" QR code, when approved, actually:", options: ["Sends money to you", "Can authorize a payment OUT of your account", "Does nothing", "Only works for merchants"], correctIndex: 1, explain: "Collect requests ask permission to pull money, not receive it." },
            { difficulty: 3, question: "Beyond web links, QR codes can also encode:", options: ["Only phone numbers", "WiFi credentials and app-specific deep links", "Nothing else", "Only images"], correctIndex: 1, explain: "QR codes are a general-purpose data container, not just for URLs." },
            { difficulty: 4, question: "A robust QR scanner should specifically parse UPI deep link parameters to distinguish:", options: ["Colors used", "A payment request from a collect request", "File size", "Nothing important"], correctIndex: 1, explain: "This distinction is exactly what determines whether scanning costs you money." },
        ],
    },
    {
        id: "breaches",
        title: "Data Breaches",
        icon: "🗄️",
        tool: { name: "Personal Dashboard", path: "/dashboard" },
        summary: "Why an old, forgotten breach can still hurt you today.",
        content: {
            newbie: {
                hook: "Imagine a shop's customer list gets stolen — a data breach is that, but for websites and apps.",
                body: "A company you used gets hacked, and your information leaks out, even though you did nothing wrong yourself.",
                action: "If you hear about a breach, change that password right away, especially if you used it anywhere else too.",
            },
            beginner: {
                sections: [
                    { heading: "What a breach actually is", body: "A data breach happens when a company's systems are compromised and user data — emails, passwords, sometimes payment info — is exposed or stolen. This isn't about anything you did; it's a failure on the company's end." },
                    { heading: "Why it matters even years later", body: "The real danger is password reuse. If you used the same password on the breached site and, say, your email, an attacker who has that password can try it everywhere." },
                    { heading: "What to actually do", body: "Change that password immediately, and everywhere else you reused it. Turn on two-factor authentication (2FA) wherever it's offered." },
                ],
            },
            intermediate: {
                sections: [
                    { heading: "Credential stuffing", body: "Breached password lists get automatically tested (\"stuffed\") against many other websites by bots, since so many people reuse passwords — this is why one small, forgotten breach can compromise an unrelated important account today." },
                    { heading: "What k-anonymity checking actually does", body: "Modern breach-checking tools never send your actual password anywhere — they hash it locally and send only the first few characters of the hash, so the service can check for a match without ever seeing your real password." },
                ],
            },
            experienced: {
                sections: [
                    { heading: "Breach data lifecycle", body: "Breached credentials typically circulate privately for weeks or months before appearing in public dumps — by the time a breach is publicly searchable, targeted attackers may have already used the freshest data." },
                    { heading: "Beyond password rotation", body: "For high-value accounts, rotating the password alone isn't sufficient — reviewing active sessions/tokens and checking for unauthorized OAuth app grants matters, since a breach may have already resulted in persistent access via a token rather than just a password." },
                ],
            },
        },
        quiz: [
            { difficulty: 1, question: "If a website you used years ago gets breached, is it still worth worrying about?", options: ["No, it's too old to matter", "Yes, especially if you reused that password anywhere"], correctIndex: 1, explain: "Old, reused passwords remain a real risk indefinitely." },
            { difficulty: 1, question: "A data breach happening is usually the user's fault.", options: ["True", "False"], correctIndex: 1, explain: "A breach is a failure of the company's security, not the user's." },
            { difficulty: 2, question: "The single biggest reason a breach becomes dangerous is:", options: ["The company going out of business", "Password reuse across other sites", "Slow internet", "None of these"], correctIndex: 1, explain: "Reuse is what turns one breach into many compromised accounts." },
            { difficulty: 3, question: "Automatically testing breached passwords against many other sites is called:", options: ["Password spraying", "Credential stuffing", "Data laundering", "Session hijacking"], correctIndex: 1, explain: "Credential stuffing is the automated reuse-testing of leaked credentials." },
            { difficulty: 4, question: "Beyond changing a password after a breach, what else should a high-value account owner check?", options: ["Nothing else is needed", "Active sessions, tokens, and OAuth app grants", "Their WiFi router brand", "Their screen brightness"], correctIndex: 1, explain: "A breach may grant persistent access beyond just the password itself." },
        ],
    },
    {
        id: "email-bec",
        title: "Email Red Flags & BEC",
        icon: "📧",
        tool: { name: "Email Analyzer", path: "/email" },
        summary: "SPF/DKIM/DMARC explained simply, plus how business email fraud works.",
        content: {
            newbie: {
                hook: "A scam email pretends to be your boss or a company you trust, asking you to do something you normally wouldn't.",
                body: "Fake emails try to look official but are actually from a stranger trying to trick you into sending money or information.",
                action: "If an email urgently asks for money, gift cards, or passwords — even from someone you \"know\" — call them directly to confirm first.",
            },
            beginner: {
                sections: [
                    { heading: "SPF, DKIM, DMARC — in plain terms", body: "These are checks email servers use to verify a sender is really who they claim — think caller ID verification for email. When these fail, it's a strong sign the email is spoofed." },
                    { heading: "Human-level red flags", body: "A \"reply-to\" address that doesn't match the sender, urgent financial requests, and unexpected attachments — even from someone you know, since accounts get compromised too." },
                    { heading: "One important update", body: "Poor grammar used to be a reliable red flag. It's less reliable now — AI tools let scammers write fluent, polished messages. Judge the request, not just the writing quality." },
                ],
            },
            intermediate: {
                sections: [
                    { heading: "Business Email Compromise (BEC)", body: "BEC targets organizations specifically — attackers impersonate a CEO or finance officer to request an urgent wire transfer or gift-card purchase, often timed around when the real executive is traveling and hard to reach." },
                    { heading: "Why BEC bypasses spam filters", body: "BEC emails often contain no links or attachments at all — just a short, plausible text request — meaning traditional malware/link filters have nothing to flag, making human verification the primary defense." },
                ],
            },
            experienced: {
                sections: [
                    { heading: "Account takeover vs. spoofing", body: "BEC can originate from a genuinely compromised mailbox (passing all authentication checks, since it IS the real account) or from a spoofed lookalike domain — distinguishing these matters, since a compromised-account BEC needs incident response, not just user awareness." },
                    { heading: "Process-level defense", body: "The most effective BEC mitigation is a mandatory out-of-band verification step (a phone call to a known number) for any payment change request, regardless of how legitimate the email appears." },
                ],
            },
        },
        quiz: [
            { difficulty: 1, question: "An email from your \"boss\" urgently asks you to buy gift cards right now. This is:", options: ["Normal for busy bosses", "A likely BEC scam"], correctIndex: 1, explain: "Legitimate urgent requests for gift cards essentially never happen." },
            { difficulty: 1, question: "A scam email always contains a suspicious link or attachment.", options: ["True", "False"], correctIndex: 1, explain: "Many BEC scams are plain text — no link needed, which is what makes them hard to filter." },
            { difficulty: 2, question: "SPF, DKIM, and DMARC are best described as:", options: ["Spam folder settings", "Ways to verify a sender's email is legitimate", "Encryption standards", "Attachment scanners"], correctIndex: 1, explain: "They're sender-authentication checks, not content scanners." },
            { difficulty: 3, question: "Why is BEC particularly hard for spam filters to catch?", options: ["It uses too many links", "It's often just a plain-text request with no links or attachments", "It's always in a foreign language", "It uses old email addresses"], correctIndex: 1, explain: "No link or attachment means nothing for a traditional filter to flag." },
            { difficulty: 4, question: "The most effective defense against a fraudulent wire-transfer request via email is:", options: ["A stronger spam filter", "Mandatory out-of-band phone verification for payment changes", "Ignoring all urgent emails", "Longer passwords"], correctIndex: 1, explain: "A process-based check beats trying to spot fraud by reading tone alone." },
        ],
    },
    {
        id: "deepfakes",
        title: "Deepfakes & AI Voice Scams",
        icon: "🎭",
        tool: null,
        summary: "AI-cloned voices and video are now a real, growing scam vector.",
        content: {
            newbie: {
                hook: "Imagine a video or voice recording of someone that looks and sounds completely real — but was faked by a computer. That's a deepfake.",
                body: "AI can now clone a voice convincingly, and scammers use this to pretend to be someone you trust, like a family member asking for emergency money.",
                action: "If you get an urgent, unusual money request by voice or video — even from someone who sounds like family — hang up and call them back on their known number.",
            },
            beginner: {
                sections: [
                    { heading: "What a deepfake actually is", body: "Deepfakes use AI to generate realistic fake video or audio of a real person. Modern voice cloning needs only a short sample of someone's real voice — sometimes just seconds from a public video — to generate convincing fake speech." },
                    { heading: "How it's used to scam people", body: "The most common pattern is a fake emergency call: a cloned voice of a relative claiming to be in trouble and urgently needing money, designed to trigger panic before you can verify." },
                    { heading: "How to protect yourself", body: "Establish a family codeword that only real family would know, to confirm identity during any unexpected emergency call. If in doubt, hang up and call the person back directly." },
                ],
            },
            intermediate: {
                sections: [
                    { heading: "Technical tells (imperfect, but useful)", body: "Real-time deepfake video can still show artifacts around lighting consistency or lip-sync mismatch — but quality improves constantly, so behavioral verification matters more than spotting technical flaws." },
                    { heading: "Voice cloning threshold", body: "Modern cloning tools can produce a convincing fake from remarkably little source audio, meaning anyone with public video or voice content online is a potential target — not just public figures." },
                ],
            },
            experienced: {
                sections: [
                    { heading: "Threat landscape shift", body: "Deepfakes are converging with vishing and BEC — a cloned executive voice used in a fraudulent wire-transfer call defeats \"does this sound like them\" entirely, forcing a shift toward process-based, not perception-based, verification." },
                    { heading: "Organizational mitigation", body: "The same out-of-band callback and codeword approach used against classic vishing remains effective against deepfakes specifically because it verifies through a channel the attacker doesn't control, rather than judging authenticity in the moment." },
                ],
            },
        },
        quiz: [
            { difficulty: 1, question: "Can AI now create a fake video or voice recording that sounds like a real person?", options: ["No, that's science fiction", "Yes, this is a real and growing risk"], correctIndex: 1, explain: "Voice cloning and deepfake video are real, accessible technology today." },
            { difficulty: 1, question: "A phone call from a voice that sounds exactly like your relative is 100% proof it's really them.", options: ["True", "False"], correctIndex: 1, explain: "Voice cloning can now defeat this kind of judgment call." },
            { difficulty: 2, question: "The best family-level defense against a fake emergency call is:", options: ["Sending money quickly to be safe", "A pre-agreed codeword only real family would know", "Asking them to prove it's them", "Ignoring all calls"], correctIndex: 1, explain: "A codeword can't be guessed or cloned the way a voice can." },
            { difficulty: 3, question: "Modern voice cloning tools typically need how much source audio for a convincing fake?", options: ["Hours of recording", "Sometimes just seconds from public content", "A professional studio session", "It's not possible from short clips"], correctIndex: 1, explain: "Even brief public audio can be enough source material today." },
            { difficulty: 4, question: "Why does out-of-band callback verification defeat deepfake-based fraud specifically?", options: ["It doesn't, deepfakes are undetectable", "It verifies through a channel the attacker doesn't control", "It's slower, which discourages scammers", "It requires video, which deepfakes can't do"], correctIndex: 1, explain: "Verification independent of the suspicious channel itself is the key." },
        ],
    },
    {
        id: "cve",
        title: "What Is a CVE?",
        icon: "🛡️",
        tool: { name: "CVE Pulse", path: "/cve" },
        summary: "The public catalog of known software security flaws.",
        content: {
            newbie: {
                hook: "Software has bugs, and some bugs are dangerous security holes. A CVE is the official \"name tag\" given to each known one.",
                body: "When researchers find a serious flaw in software, it gets a public ID (like CVE-2024-12345) and a severity score, so everyone knows how urgent it is to fix.",
                action: "This is why \"update your apps\" matters — updates often fix these exact documented holes.",
            },
            beginner: {
                sections: [
                    { heading: "The basics", body: "CVE stands for Common Vulnerabilities and Exposures — a public, standardized catalog of known security flaws in software, each given an ID so defenders everywhere can track it." },
                    { heading: "The severity score", body: "Each CVE typically gets a CVSS score from 0–10 indicating how severe it is — how easy it is to exploit, and how much damage it could do." },
                    { heading: "Why this matters to you", body: "\"Update your software\" isn't nagging — it's how these known, cataloged flaws get patched. An unpatched CVE is a documented instruction manual for attackers." },
                ],
            },
            intermediate: {
                sections: [
                    { heading: "CVSS scoring in more detail", body: "The score factors in how the flaw is exploited (remotely vs. requiring local access), how much skill it takes, and what an attacker gains — a 9+ remote, low-skill, full-control flaw is about as urgent as it gets." },
                    { heading: "Patch timing matters", body: "The period right after a CVE is publicly disclosed but before most systems are patched is historically when exploitation spikes." },
                ],
            },
            experienced: {
                sections: [
                    { heading: "CVE vs. exploit availability", body: "A high CVSS score doesn't automatically mean active exploitation — tracking whether a working public exploit exists (or evidence of in-the-wild use, as tracked by CISA's KEV catalog) is what shifts a CVE from theoretical to urgent." },
                    { heading: "Vulnerability management at scale", body: "Effective vulnerability management prioritizes by exploitability and asset exposure, not CVSS score alone — a critical CVE on an isolated internal system is a lower practical priority than a medium-severity CVE on an internet-facing service." },
                ],
            },
        },
        quiz: [
            { difficulty: 1, question: "A CVE is:", options: ["A type of computer virus", "A public ID for a documented software security flaw"], correctIndex: 1, explain: "CVE = Common Vulnerabilities and Exposures — the catalog entry, not the flaw itself acting maliciously." },
            { difficulty: 1, question: "Ignoring software update notifications is generally harmless.", options: ["True", "False"], correctIndex: 1, explain: "Updates frequently patch specific, documented, publicly known flaws." },
            { difficulty: 2, question: "The CVSS score range runs from:", options: ["0 to 10", "0 to 100", "1 to 5", "A to F"], correctIndex: 0, explain: "0–10, with higher meaning more severe." },
            { difficulty: 3, question: "A CVSS score factors in all of these EXCEPT:", options: ["How remotely exploitable it is", "How much skill it takes to exploit", "The software's marketing budget", "What an attacker gains from it"], correctIndex: 2, explain: "Marketing has nothing to do with technical severity scoring." },
            { difficulty: 4, question: "What actually shifts a high-CVSS CVE from theoretical to urgent-priority?", options: ["Just the score alone", "Evidence of a working exploit or active in-the-wild use", "The age of the CVE", "Nothing, all CVEs are equally urgent"], correctIndex: 1, explain: "Real exploitation evidence (like CISA's KEV catalog tracks) is the practical urgency signal." },
        ],
    },
    {
        id: "osint",
        title: "What Others Can Find About You",
        icon: "🌐",
        tool: { name: "OSINT Recon", path: "/osint" },
        summary: "Open-source intelligence — how public info gets pieced together.",
        content: {
            newbie: {
                hook: "OSINT just means information anyone can find publicly about you online — your old posts, photos, or public profiles.",
                body: "Even without hacking anything, someone can learn a lot about you from what's already public, and use it to make a scam feel more convincing.",
                action: "Every so often, check your social media privacy settings and think about what's visible to strangers.",
            },
            beginner: {
                sections: [
                    { heading: "What OSINT means", body: "Open-Source Intelligence is any information gathered from publicly available sources — social media posts, old forum accounts, public records, even metadata hidden in photos. None of it is \"hacking\" — it's information already made public." },
                    { heading: "How it's used against people", body: "A scammer researching you via OSINT can craft a phishing message mentioning your real employer or city — making a fake message feel personally credible." },
                    { heading: "Practical steps", body: "Periodically review your social media privacy settings, and be mindful that even old, forgotten accounts can still be part of your visible footprint today." },
                ],
            },
            intermediate: {
                sections: [
                    { heading: "Aggregation is the real risk", body: "No single public post is usually dangerous alone — the risk comes from aggregating many small details (workplace, city, relatives' names, routine) into a profile that makes a targeted scam far more convincing." },
                    { heading: "Metadata beyond the obvious", body: "Photos can carry embedded location metadata even when the caption reveals nothing, and professional profiles often reveal exact tools/systems used at a workplace — valuable reconnaissance for a targeted attack." },
                ],
            },
            experienced: {
                sections: [
                    { heading: "OSINT in the attack lifecycle", body: "OSINT typically feeds the reconnaissance phase of a targeted attack (MITRE's Reconnaissance tactic, TA0043) — gathering details later used to craft a convincing spearphish or vishing pretext." },
                    { heading: "Defensive OSINT", body: "Organizations increasingly run OSINT sweeps against themselves — checking what's discoverable about employees and infrastructure — specifically to reduce this attack surface before an adversary finds it first." },
                ],
            },
        },
        quiz: [
            { difficulty: 1, question: "Is information gathered from public social media considered \"hacking\"?", options: ["Yes", "No, it's still legally public information"], correctIndex: 1, explain: "OSINT relies entirely on already-public sources — the risk is in how it's used, not how it's obtained." },
            { difficulty: 1, question: "A single old public post is usually harmless on its own.", options: ["True — the real risk is combining many small details", "False, one post always ruins everything"], correctIndex: 0, explain: "Aggregation across many small details is what creates real risk." },
            { difficulty: 2, question: "A scam message mentioning your real employer feels more convincing because:", options: ["It's always true", "Specific accurate details increase perceived credibility", "Employers leak data directly", "It doesn't actually help scammers"], correctIndex: 1, explain: "Personalization is exactly why OSINT-fed scams work better than generic ones." },
            { difficulty: 3, question: "Beyond the caption, what else can a public photo reveal?", options: ["Nothing else", "Embedded location metadata", "The photographer's mood", "Nothing, photos are safe"], correctIndex: 1, explain: "Metadata can leak location even when the visible content doesn't." },
            { difficulty: 4, question: "OSINT gathering typically maps to which phase of a targeted attack?", options: ["Reconnaissance", "Exfiltration", "Persistence", "Impact"], correctIndex: 0, explain: "It's information-gathering before the actual attack begins." },
        ],
    },
    {
        id: "passwords",
        title: "Strong Password Habits",
        icon: "🔑",
        tool: { name: "Personal Dashboard", path: "/dashboard" },
        summary: "Why length beats complexity, and the habit that matters most.",
        content: {
            newbie: {
                hook: "A password is like a key to your house — the same key shouldn't open every door you own.",
                body: "Using one password everywhere means if a scammer gets it from one place, they can get into everything else too.",
                action: "Try to use a different password for your important accounts, especially email and banking.",
            },
            beginner: {
                sections: [
                    { heading: "Length beats complexity", body: "Modern guidance (including from NIST) favors long passphrases over short, complex-looking passwords. \"correct-horse-battery-staple\" style phrases are both easier to remember and harder to crack." },
                    { heading: "The habit that matters most", body: "Never reuse the same password across sites. A single breach at any one site means every account sharing that password is now at risk." },
                    { heading: "Make it effortless", body: "A password manager generates and remembers unique passwords for every site. Combined with two-factor authentication (2FA), this covers the large majority of real-world account compromise scenarios." },
                ],
            },
            intermediate: {
                sections: [
                    { heading: "Password managers, practically", body: "A password manager generates and autofills a unique, long password per site — the only password you need to remember well is the one master password protecting the manager itself." },
                    { heading: "2FA methods aren't equal", body: "App-based authenticator codes or hardware security keys are meaningfully stronger than SMS-based 2FA, since SMS can be intercepted via SIM-swap fraud." },
                ],
            },
            experienced: {
                sections: [
                    { heading: "Credential hygiene at the account-graph level", body: "Real-world compromise often isn't about cracking a strong password directly — it's pivoting through a graph of accounts: a weak, reused password on a forgotten site becomes the entry to an email account, which becomes the recovery path into everything else." },
                    { heading: "Passkeys and the future", body: "Passkey (FIDO2/WebAuthn) authentication removes the shared-secret password model entirely — a device-bound cryptographic key can't be phished or reused across a breach the way a traditional password can." },
                ],
            },
        },
        quiz: [
            { difficulty: 1, question: "Is it safe to use the same password for every website?", options: ["Yes, it's easier to remember", "No, one breach can compromise every account using it"], correctIndex: 1, explain: "Reuse turns one breach into many compromised accounts." },
            { difficulty: 1, question: "A longer, memorable phrase is generally weaker than a short password full of symbols.", options: ["True", "False"], correctIndex: 1, explain: "Length matters more than symbol complexity for real cracking resistance." },
            { difficulty: 2, question: "What's the single biggest password mistake that leads to real account takeovers?", options: ["Using a password manager", "Reusing the same password across multiple sites", "Making passwords too long", "Writing a password down at home"], correctIndex: 1, explain: "Reuse remains the #1 factor in real-world account compromise." },
            { difficulty: 3, question: "Which 2FA method is generally weakest against SIM-swap attacks?", options: ["Authenticator app codes", "SMS-based codes", "Hardware security keys", "Passkeys"], correctIndex: 1, explain: "SMS delivery can be intercepted if a number is ported via SIM-swap fraud." },
            { difficulty: 4, question: "Passkeys (FIDO2/WebAuthn) improve on traditional passwords mainly because:", options: ["They're shorter", "They remove the shared-secret model, resisting phishing and reuse", "They're free", "They work without a device"], correctIndex: 1, explain: "No shared secret means nothing to phish or leak in a breach the same way." },
        ],
    },
];

export function questionsForTier(quiz, tierId) {
    const tierIndex = TIER_ORDER.indexOf(tierId);
    const maxDifficulty = tierIndex + 1; // newbie->1, beginner->2, intermediate->3, experienced->4
    return quiz.filter((q) => q.difficulty <= maxDifficulty);
}

export function getLearnProgress() {
    try {
        return JSON.parse(localStorage.getItem("sentinel_learn_progress") ?? "{}");
    } catch {
        return {};
    }
}

export function markTopicComplete(topicId, tierId, score, total) {
    const progress = getLearnProgress();
    progress[topicId] = { completed: true, tier: tierId, score, total, completedAt: new Date().toISOString() };
    localStorage.setItem("sentinel_learn_progress", JSON.stringify(progress));
    return progress;
}

export function getSelectedTier() {
    return localStorage.getItem("sentinel_learn_tier") ?? "beginner";
}

export function setSelectedTier(tierId) {
    localStorage.setItem("sentinel_learn_tier", tierId);
}