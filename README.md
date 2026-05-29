# InterviewLens — AI Interview Practice Platform

A complete, production-ready AI-powered interview preparation web application.

---

## Features

- 🎤 Voice recording with Whisper AI transcription (Groq)
- ⌨️ Text mode fallback
- ⚡ Instant feedback after every answer
- 📊 Scores: Confidence, Communication, Technical
- 🎯 7 interview types: HR, Technical, Coding, Data Analyst, AI/ML, ServiceNow, Custom
- 📈 Dashboard with trends, radar charts, skill analytics
- 📄 Full report with PDF export
- 🧠 Optional Claude AI enhanced feedback
- 💾 Guest mode — no login required, sessions saved locally
- 🌙 Dark/Light mode
- 📱 Fully responsive

---

## Project Structure

```
interviewlens/
├── frontend/          # React + Vite app
│   ├── src/
│   │   ├── pages/     # Landing, Login, Dashboard, Setup, InterviewRoom, Report
│   │   ├── components/
│   │   ├── context/   # AppContext (global state)
│   │   ├── hooks/     # useRecorder
│   │   ├── data/      # questions.js (100+ questions)
│   │   ├── utils/     # analysis.js (scoring engine)
│   │   └── styles/
│   └── package.json
└── backend/           # FastAPI (optional)
    ├── main.py
    └── requirements.txt
```

---

## Quick Start (Frontend Only)

The frontend works completely standalone without the backend.

### Requirements
- Node.js 18+
- Chrome or Edge browser (for voice recording)

### Run

```bash
cd frontend
npm install
npm run dev
```

Open: http://localhost:3000

---

## API Keys Setup

On first use, you'll be prompted for:

### Groq API Key (required for voice mode)
- Free tier available
- Sign up: https://console.groq.com
- Get key: https://console.groq.com/keys
- Used for: Whisper Large v3 speech transcription

### Anthropic API Key (optional — enhanced AI feedback)
- Enhances analysis with Claude's language understanding
- Get key: https://console.anthropic.com/keys

Keys are stored in your browser's `localStorage` only.

---

## Run Backend (Optional)

The backend provides a REST API for server-side analysis.

```bash
cd backend
pip install -r requirements.txt
python main.py
```

API runs at: http://localhost:8000
Docs at: http://localhost:8000/docs

---

## Deployment

### Frontend — Vercel (free)

```bash
cd frontend
npm run build
# Deploy dist/ folder to Vercel
```

Or connect your GitHub repo to Vercel for auto-deploy.

### Frontend — Netlify (free)

```bash
cd frontend
npm run build
# Drag dist/ folder to Netlify
```

### Backend — Render (free)

1. Push backend/ to GitHub
2. Create a new Web Service on Render
3. Build command: `pip install -r requirements.txt`
4. Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, React Router v6 |
| Charts | Recharts |
| PDF Export | jsPDF + jsPDF-AutoTable |
| Speech | Groq Whisper Large v3 (via API) |
| AI Feedback | Anthropic Claude Sonnet (optional) |
| Backend | FastAPI + Uvicorn |
| State | React Context + localStorage |
| Styling | Plain CSS with CSS variables |

---

## Browser Support

| Browser | Voice | Text |
|---------|-------|------|
| Chrome ✅ | ✅ | ✅ |
| Edge ✅ | ✅ | ✅ |
| Firefox | ⚠ Limited | ✅ |
| Safari | ⚠ Limited | ✅ |

---

## Interview Types & Questions

| Type | Questions |
|------|-----------|
| HR | 25+ behavioral & situational |
| Technical | 22+ CS fundamentals & system design |
| Coding | 15+ algorithms & data structures |
| Data Analyst | 20+ SQL, stats, analytics |
| AI/ML | 16+ ML concepts & production |
| ServiceNow | 13+ ITSM & platform |
| Custom Role | 14+ general professional |

---

## Analysis Engine

The scoring engine is **rule-based and runs entirely in the browser** — no paid API required for basic analysis.

Scoring factors:
- **Confidence**: Filler words, weak starters, answer length, speaking pace
- **Communication**: Sentence structure, grammar patterns, examples used, word count
- **Technical**: Question relevance, specific indicators, answer depth

Optional Claude enhancement boosts scores with deeper language understanding when an API key is provided.

---

## License

MIT — Free to use and deploy.
