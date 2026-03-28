# MindSpace 🧠
**An AI-Powered Mental Health Tracking & Analysis System**  
*Master of Science in Software Engineering — Pre-Proposal Defense Project*

---

## Overview

MindSpace is a full-stack web application that transforms passive journaling into an active, data-driven wellness tool. Users write journal entries; a custom-trained AI engine analyses the emotional tone of every entry in real time and visualises mood trends over time.

### The Problem It Solves
- **The Passive Trap** — Traditional journaling has no feedback loop. Entries sit dormant with no way to spot emotional triggers or long-term patterns.
- **The Analysis Gap** — Professional therapy is expensive and inaccessible for daily monitoring. MindSpace bridges the gap between simple logging and data-driven emotional analysis.

---

## Features

| Feature | Description |
|---|---|
| 🤖 AI Sentiment Analysis | Hybrid Naïve Bayes + VADER engine scores every entry −1.0 → +1.0 |
| 📈 Mood Visualisations | Interactive weekly & monthly Chart.js graphs |
| 🔐 JWT Authentication | Secure register/login with bcrypt-hashed passwords |
| 📝 Full Journal CRUD | Create, read, update, delete entries with inline editing |
| 🏷️ Mood Tags | User-selectable tags (gratitude, anxiety, calm, etc.) |
| 📊 Analytics Dashboard | Streak tracking, distribution charts, polarity tables |
| 🐳 Docker Ready | One-command deployment with Docker Compose |

---

## Technology Stack

### Frontend
| Technology | Purpose |
|---|---|
| **Next.js 14** (App Router) | React framework with SSR/CSR |
| **TypeScript** | Type safety across the codebase |
| **Tailwind CSS** | Utility-first styling |
| **Chart.js + react-chartjs-2** | Interactive mood graphs |
| **Axios** | HTTP client with JWT interceptors |
| **lucide-react** | Icon system |

### Backend
| Technology | Purpose |
|---|---|
| **Python 3.12** | Runtime |
| **FastAPI** | Async REST API framework |
| **Pydantic v2** | Request/response validation |
| **Motor (AsyncIO MongoDB)** | Async database driver |
| **Scikit-Learn** | Naïve Bayes classifier + TF-IDF |
| **VADER Sentiment** | Rule-based NLP validation |
| **python-jose** | JWT token generation & verification |
| **passlib[bcrypt]** | Password hashing |

### Database & DevOps
| Technology | Purpose |
|---|---|
| **MongoDB** (NoSQL) | Flexible document storage |
| **Docker + Docker Compose** | Containerised deployment |
| **GitHub Actions** | CI/CD pipeline (add your own workflows) |

---

## AI Module — Sentiment Analysis Engine

The AI engine uses a **hybrid approach** as described in the project proposal:

```
Text Input
    │
    ▼
Pre-processing (tokenisation, stopword removal, punctuation stripping)
    │
    ▼
TF-IDF Vectorisation (n-gram range 1–2, max 5000 features)
    │
    ▼
Primary: Naïve Bayes Classifier  ──────────┐
                                            ├──► Weighted Ensemble (60% NB + 40% VADER)
Secondary: VADER Rule-based Model ─────────┘
    │
    ▼
Polarity Score: −1.0 (Very Negative) → +1.0 (Very Positive)
Label: Positive | Neutral | Negative
Confidence score + emotion breakdown (pos/neu/neg ratios)
```

**References:**
- Hutto, C.J. & Gilbert, E.E. (2014). *VADER: A Parsimonious Rule-based Model for Sentiment Analysis.*
- Training data pattern based on **Sentiment140** (Twitter dataset) for robust polarity detection.

---

## Project Structure

```
mindspace/
├── docker-compose.yml
│
├── backend/                        # Python FastAPI
│   ├── main.py                     # App entry point, CORS, router registration
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── .env.example
│   ├── core/
│   │   ├── config.py               # Pydantic settings (reads .env)
│   │   ├── database.py             # Motor AsyncIO MongoDB connection
│   │   └── security.py             # JWT create/verify, bcrypt, auth dependency
│   ├── models/
│   │   └── schemas.py              # Pydantic request/response models
│   ├── routers/
│   │   ├── auth.py                 # POST /register, POST /login, GET /me
│   │   ├── journal.py              # Full CRUD for journal entries
│   │   └── analytics.py           # GET /summary — aggregated mood data
│   └── services/
│       └── sentiment.py            # Hybrid NB + VADER analysis engine
│
└── frontend/                       # Next.js 14 (App Router)
    ├── next.config.mjs
    ├── tailwind.config.js
    ├── tsconfig.json
    ├── Dockerfile
    ├── .env.local.example
    └── src/
        ├── app/
        │   ├── layout.tsx           # Root layout with Toaster
        │   ├── page.tsx             # Landing page
        │   ├── login/page.tsx       # Sign-in form
        │   ├── register/page.tsx    # Account creation
        │   ├── dashboard/page.tsx   # Main dashboard with stats + chart
        │   ├── journal/
        │   │   ├── page.tsx         # Entry list with search
        │   │   ├── new/page.tsx     # New Journal composer
        │   │   └── [id]/page.tsx    # Entry detail + inline edit
        │   └── analytics/page.tsx   # Full analytics with doughnut chart + table
        ├── components/
        │   ├── AppLayout.tsx        # Auth guard + Navbar wrapper
        │   ├── Navbar.tsx           # Top nav + mobile bottom nav
        │   ├── EntryCard.tsx        # Journal entry card with sentiment accent
        │   ├── SentimentBadge.tsx   # Polarity bar + emotion breakdown
        │   ├── MoodChart.tsx        # Chart.js line chart component
        │   └── StatCard.tsx         # Dashboard stat tile
        ├── hooks/
        │   └── useAuth.tsx          # Auth context (user state, login/logout)
        ├── lib/
        │   ├── api.ts               # Axios instance + all API calls
        │   └── utils.ts             # Formatting & colour helpers
        └── types/
            └── index.ts             # TypeScript interfaces
```

---

## Getting Started

### Prerequisites
- **Docker & Docker Compose** (recommended) — or Node.js 20+ and Python 3.12+

### Option A — Docker Compose (Recommended)

```bash
# 1. Clone the repo
git clone <your-repo-url> mindspace
cd mindspace

# 2. Copy env files
cp backend/.env.example backend/.env
cp frontend/.env.local.example frontend/.env.local

# 3. Edit backend/.env — set a strong SECRET_KEY
#    Edit frontend/.env.local — set NEXT_PUBLIC_API_URL if needed

# 4. Launch everything
docker compose up --build

# App will be live at:
#   Frontend:  http://localhost:3000
#   Backend:   http://localhost:8000
#   API Docs:  http://localhost:8000/docs
```

### Option B — Local Development

**Backend:**
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy and configure env
cp .env.example .env
# Edit .env — set MONGODB_URL and SECRET_KEY

# Run
uvicorn main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend

# Install dependencies
npm install

# Copy and configure env
cp .env.local.example .env.local
# Edit .env.local — NEXT_PUBLIC_API_URL=http://localhost:8000

# Run
npm run dev
```

**MongoDB:** Make sure MongoDB is running on `mongodb://localhost:27017`  
(or use `docker run -d -p 27017:27017 mongo:7`)

---

## API Reference

Full interactive docs available at `http://localhost:8000/docs` (Swagger UI).

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | — | Register new user |
| POST | `/api/auth/login` | — | Login, get JWT |
| GET | `/api/auth/me` | ✅ | Get current user |
| GET | `/api/journal/` | ✅ | List entries (paginated) |
| POST | `/api/journal/` | ✅ | Create entry + run AI analysis |
| GET | `/api/journal/{id}` | ✅ | Get single entry |
| PATCH | `/api/journal/{id}` | ✅ | Update entry (re-analyses sentiment) |
| DELETE | `/api/journal/{id}` | ✅ | Delete entry |
| GET | `/api/analytics/summary` | ✅ | Full analytics summary |

---

## Project Roadmap (from Proposal)

| Phase | Timeline | Deliverable |
|---|---|---|
| Phase 1 | Wk 1–2 | Setup & UI/UX Design |
| Phase 2 | Wk 3–5 | Core Dev (Auth, Journal CRUD) |
| Phase 3 | Wk 6–7 | AI Integration (Sentiment Engine) |
| Phase 4 | Wk 8–9 | DevOps (Docker, GitHub Actions) |
| Phase 5 | Wk 10 | Final Defense |

---

## Feasibility Analysis

- **Technical** — Scikit-Learn, React/Next.js, and FastAPI are mature, well-documented libraries. Complexity is manageable within the semester timeframe.
- **Economic** — 100% open-source technologies. Zero licensing costs. Deployable to free-tier cloud services (Render, Railway, Vercel).
- **Operational** — Web-based platform requires no installation. Intuitive UI ensures accessibility for non-technical users.

---

## Literature References

1. Pennebaker, J. W. (1997). *Writing about Emotional Experiences as a Therapeutic Process.*
2. Hutto, C.J. & Gilbert, E.E. (2014). *VADER: A Parsimonious Rule-based Model for Sentiment Analysis.*
3. Calvo, R. A., et al. (2017). *The Oxford Handbook of Affective Computing.*

---

## Security Notes

- All passwords hashed with **bcrypt** (via passlib)
- Authentication via **JWT (HS256)** — tokens expire after 7 days
- Each user can only access their own journal entries (enforced at DB query level)
- CORS restricted to `http://localhost:3000` in development — update `allow_origins` in `main.py` for production

---

*MindSpace — MS Software Engineering Pre-Proposal Defense*
# MIND-SPACE
