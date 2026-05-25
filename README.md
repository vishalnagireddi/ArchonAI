# AI System Design Generator (ArchonAI)

NeoArchitect.AI is a modern, high-performance, and deployable production-grade web application designed for software engineers and systems architects. Users enter prompts like *"Design a scalable Netflix video system"* or *"Design an Uber-like ride-hailing system"*, and the AI generates complete architectural specifications alongside beautiful, interactive **Mermaid.js topology diagrams**.

This repository is built using a **Clean Architecture** pattern to remain modular, fast, and easy to deploy.


- **Prompt Input**: Highly interactive UI with rapid-fill quick-suggest pills for popular FAANG systems.
- **Structured AI Generation**: Exhaustive architectural output targeting Overview, Microservices, Databases, API contracts, Caching, Scaling, Cybersecurity, Operations/Monitoring, and Infrastructure.
- **Mermaid.js Integrations**: Auto-generated, dynamic system diagrams rendered on the client with full copy-to-clipboard and SVG download capabilities.
- **Persistent DB History**: All architectural specifications are stored in PostgreSQL using SQLAlchemy Async ORM.
- **Modern Dashboard Design**: A dark-mode dashboard featuring frosted-glass elements, text glows, and custom micro-animations.
- **Containerized Dev & Ops**: Fully dockerized backend and frontend setups utilizing Docker Compose.

---

# Technology Stack & Rationale

| Layer | Technology | Rationale |
| :--- | :--- | :--- |
| **Frontend** | **Next.js 14 (App Router)** | Provides high-speed React rendering, search-engine optimization, modern styling wrappers, and robust layout boundaries. |
| **Styling** | **Tailwind CSS** | Clean utilities, harmony-driven HSL palettes, and customized dark-mode glassmorphic layouts. |
| **Diagrams**| **Mermaid.js** | Text-to-diagram rendering directly inside the browser, allowing the LLM to output pure, maintainable text charts. |
| **Backend** | **FastAPI (Python)** | High performance, native async-await endpoint loops, automatic Swagger/OpenAPI docs generation, and simple Pydantic inputs. |
| **AI Orchestration** | **LangChain & Groq** | Integrates ChatGroq LLM chains (`llama-3.3-70b-specdec`). Uses `with_structured_output` to strictly guarantee responses match our DB schemas. |
| **Database** | **PostgreSQL** | Industry-standard relational data-store. Used here to persist prompts, created timestamps, and parsed JSON design objects. |
| **ORM / Driver** | **SQLAlchemy + Asyncpg** | Completely asynchronous DB connections to avoid thread blocking under load. |
| **Containerization** | **Docker & Docker Compose** | Wraps database, Python servers, and NextJS assets to ensure identical environments on dev and prod. |

---

## 📁 Repository Structure

```text
ai-system-design-generator/
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── routes.py       # API routers (/generate, /history, /history/{id})
│   │   ├── core/
│   │   │   └── config.py       # Pydantic env configurations and asyncpg adapters
│   │   ├── database/
│   │   │   └── database.py     # Async engine sessions and connection generators
│   │   ├── models/
│   │   │   └── history.py      # SQLAlchemy DesignHistory mapping
│   │   ├── schemas/
│   │   │   └── design.py       # Pydantic schemas for request-response serialization
│   │   ├── services/
│   │   │   └── ai_service.py   # LangChain client with Llama-70B model fallbacks
│   │   ├── prompts/
│   │   │   └── templates.py    # Strict system-architect prompt specifications
│   │   └── main.py             # App instantiation, CORS, and lifecycles
│   ├── requirements.txt        # Python pip dependencies
│   ├── Dockerfile              # Light slim-python stage runner
│   └── .env.example            # Environment variables placeholder
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── globals.css     # Design tokens, custom scrollbars, animations
│   │   │   ├── layout.tsx      # Global layouts, SEO metadata headers
│   │   │   ├── page.tsx        # Stateful generator page (Home)
│   │   │   └── history/
│   │   │       ├── page.tsx    # List showing historical submissions
│   │   │       └── [id]/page.tsx # Dynamic path detailing past diagrams
│   │   ├── components/
│   │   │   ├── Navbar.tsx      # Glassmorphism branding header
│   │   │   ├── PromptInput.tsx # Search bar with suggestions
│   │   │   ├── LoadingSpinner.tsx # Tech spinner rotating witty dev text
│   │   │   ├── MermaidRenderer.tsx # Interactive client-side Mermaid engine
│   │   │   └── ArchitectureCard.tsx # Beautiful tabbed layout with custom icons
│   │   └── lib/
│   │       └── api.ts          # Axios-like custom client for backend hooks
│   ├── package.json            # Node JS scripts and dependencies
│   ├── Dockerfile              # Multi-stage standalone NextJS builder
│   ├── tailwind.config.ts      # Extended themes and animations
│   └── tsconfig.json           # TS configurations and path mappings
│
├── docker-compose.yml          # Container composer
└── README.md                   # Setup and operations guide
```

---

## 📡 API Documentation (Swagger)

FastAPI automatically generates an interactive API playground at `http://localhost:8000/docs`.

### 1. Generate System Design
- **Endpoint**: `POST /generate`
- **Request Body**:
  ```json
  {
    "prompt": "Design scalable Netflix architecture"
  }
  ```
- **Response**: `201 Created`
  ```json
  {
    "id": 1,
    "prompt": "Design scalable Netflix architecture",
    "created_at": "2026-05-18T16:00:00Z",
    "response": {
      "title": "Scalable Netflix Video Streaming Architecture",
      "overview": "Netflix requires high availability...",
      "services": [
        { "name": "Auth Service", "responsibility": "Handles auth" }
      ],
      "database": "Cassandra for user metadata...",
      "api_design": "POST /api/v1/auth ...",
      "scalability": "Horizontal scaling...",
      "security": "OAuth 2.0...",
      "caching": "Redis...",
      "monitoring": "Prometheus & Grafana...",
      "deployment": "Dockerized containers...",
      "mermaid_diagram": "graph TD\nUser --> API_Gateway"
    }
  }
  ```

### 2. Fetch System Design Registry
- **Endpoint**: `GET /history`
- **Response**: `200 OK`
  - Returns a list of all historical generation entries, ordered newest first.

### 3. Fetch Specific Registry Entry
- **Endpoint**: `GET /history/{id}`
- **Response**: `200 OK`
  - Returns detailed JSON for the specific design ID. Returns `404 Not Found` if missing.

---

## ⚙️ Environment Variables Setup

Create a `.env` file in the **root** folder (or inside `/backend` for local python running):

```env
# Groq Key (Register at console.groq.com to get your key instantly for free)
GROQ_API_KEY=gsk_your_groq_api_key_here

# Database URI (Use db inside Docker Compose, localhost for local pip development)
DATABASE_URL=postgresql+asyncpg://postgres:postgrespassword@db:5432/system_design_generator
```

For the frontend, the API endpoint can be configured using:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 🏃 Local Run Instructions

### Option A: Using Docker (Recommended - One Command)
Ensure you have Docker and Docker Compose installed.

1. Clone or download the repository.
2. In the root directory, create a `.env` file containing your `GROQ_API_KEY`.
3. Run the following command:
   ```bash
   docker-compose up --build
   ```
4. Access the applications:
   - **Frontend Dashboard**: `http://localhost:3000`
   - **Backend API Docs**: `http://localhost:8000/docs`

---

### Option B: Without Docker (Traditional Local Dev)

#### 1. Spin up PostgreSQL
Ensure you have a PostgreSQL database running locally and configure `DATABASE_URL` in your `.env`.

#### 2. Run Backend (FastAPI)
1. Navigate to the `/backend` folder:
   ```bash
   cd backend
   ```
2. Create a virtual environment and activate it:
   ```bash
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the backend:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

#### 3. Run Frontend (Next.js)
1. Open a new terminal window and navigate to `/frontend`:
   ```bash
   cd frontend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Start the local server:
   ```bash
   npm run dev
   ```
4. Open `http://localhost:3000` in your web browser.

---

## 🌐 Production Deployment Guide

### 1. Backend (FastAPI) on Render
1. Sign up on **Render** (Free tier available).
2. Create a **PostgreSQL Database** service on Render and copy its **External Database URL**.
3. Create a **Web Service** on Render:
   - **Repository**: Connect your GitHub repository.
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3` or `Docker` (Using `Docker` is easiest as it automatically reads our Dockerfile).
   - **Start Command (if using Python 3)**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Add **Environment Variables** in Render Settings:
   - `GROQ_API_KEY`: `gsk_your_key`
   - `DATABASE_URL`: Add your Render PostgreSQL database URL. (FastAPI automatically transforms `postgresql://` into `postgresql+asyncpg://` on startup).

### 2. Frontend (Next.js) on Vercel
1. Sign up on **Vercel** (Free tier available).
2. Create a **New Project** and import your repository.
3. Configure the build options:
   - **Framework Preset**: `Next.js`
   - **Root Directory**: `frontend`
4. Add **Environment Variables** in Vercel:
   - `NEXT_PUBLIC_API_URL`: Paste the URL of your deployed Render Web Service (e.g., `https://your-backend.onrender.com`).
5. Click **Deploy**. Vercel will build the Next.js app and deploy it on an edge server.
