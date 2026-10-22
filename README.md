# LearnTrack — Intelligent Learning Progress Tracking & Skill Development

LearnTrack is an intelligent learning progress tracking and personalized skill development platform designed for students and developers to manage roadmaps, track study sessions, maintain consistency streaks, and analyze skill gaps.

## 🚀 Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, React Router v6, Recharts, Lucide Icons, Axios, React Hot Toast
- **Backend Architecture**: Spring Boot, Spring Security (JWT), Spring Data JPA, PostgreSQL
- **AI Microservice**: Python, FastAPI, Role-Skill Evaluation Engine

## 📂 Project Structure

```text
LearnTrack/
├── frontend/
│   ├── src/
│   │   ├── api/             # Axios configuration
│   │   ├── components/      # UI components (common, dashboard, layout, roadmap)
│   │   ├── context/         # AuthContext
│   │   ├── hooks/           # useAuth hook
│   │   ├── pages/           # Dashboard, Roadmaps, Sessions, Goals, Analytics, Achievements, AI Insights, Profile
│   │   └── utils/           # Helper utilities
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## 🛠️ Getting Started

### Prerequisites
- Node.js (v18+) & npm

### Running the Frontend
```bash
cd frontend
npm install
npm run dev
```

The application will be running at `http://localhost:5173/`.
