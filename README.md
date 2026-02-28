# Readee 2.0 🐰
### Common Core Aligned Literacy Platform
**Built with Next.js 15, React 19, and Supabase**

Readee is a full-stack reading comprehension engine designed for early learners (ages 4–8). It maps interactive learning to **Common Core ELA standards**, utilizing a data-driven "Snake Path" to build student reading confidence.

---

## 👨‍💻 The Engineering Perspective
As a developer transitioning from a **Professional Accounting** background, I built Readee with a focus on **Logical Rigor** and **Data Integrity**. My goal was to move from auditing financial systems to architecting educational ones.

* **Algorithmic Learning:** Engineered a spaced repetition engine (70% new / 30% review) to optimize memory retention.
* **Strict Type Safety:** Leveraged TypeScript to ensure "Zero-Error" data flow across the Practice Engine.
* **System Stability:** Implemented robust environment validation and middleware guards to handle authentication state across the App Router.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 15 (App Router) |
| **Frontend** | React 19, Tailwind CSS v4 |
| **Backend / Auth** | Supabase (PostgreSQL) |
| **Language** | TypeScript 5 |
| **State Management** | Zustand 5 |
| **Animations** | Framer Motion 12 |
| **Audio** | Howler.js 2 |
| **Validation** | Zod 4 |
| **Email** | Resend |
| **AI** | Google Cloud AI Platform |
| **Middleware** | Custom Auth Guards & Proxy Logic |

---

## 🗺️ App Content Overview

### 🔓 Public Routes
| Route | Description |
|---|---|
| `/` | Landing page |
| `/login` | Email / Google OAuth sign-in |
| `/signup` | Account registration |
| `/reset-password` | Password reset flow |
| `/about` | About the platform |
| `/library` | Public decodable story library |
| `/teachers` | Teacher-facing landing page |
| `/contact-us` | Support / contact form |
| `/privacy-policy` | Privacy policy |
| `/terms-of-service` | Terms of service |
| `/auth/callback` | Supabase OAuth callback handler |
| `/logout` | Session sign-out |

### 🔐 Protected Routes (require authentication)
| Route | Description |
|---|---|
| `/dashboard` | Main hub — streaks, progress, quick actions |
| `/lesson/[id]` | Practice engine for a specific lesson |
| `/practice` | Practice session handler & routing |
| `/assessment` | Skill evaluation & mastery tracking |
| `/stories` | Decodable reader (page-by-page with audio) |
| `/roadmap` | Learning milestones & achievement map |
| `/analytics` | Student progress & performance metrics |
| `/question-bank` | Curated question library |
| `/question-audit` | Question quality review tool |
| `/word-bank` | Vocabulary & phonemic-awareness content |
| `/carrot-rewards` | Carrot currency balance & history |
| `/shop` | Cosmetic rewards marketplace |
| `/leaderboard` | Competitive rankings (global / classroom) |
| `/feedback` | In-app feedback submission |
| `/settings` | Account preferences |
| `/upgrade` | Premium feature paywall |

### 🔌 API Routes
| Route | Description |
|---|---|
| `/api/content/units` | Fetch learning units |
| `/api/content/lessons` | Fetch lessons for a unit |
| `/api/content/items` | Fetch practice items for a lesson |
| `/api/progress/[childId]` | Get child's progress data |
| `/api/progress/update` | Record lesson progress |
| `/api/stories` | List stories from the library |
| `/api/stories/[id]` | Get a single story |
| `/api/library` | Library metadata |
| `/api/carrots/purchase` | Redeem carrots for a shop item |
| `/api/leaderboard` | Leaderboard data |
| `/api/onboarding/complete` | Mark onboarding finished |
| `/api/signups` | Waitlist / signup tracking |
| `/api/promo/redeem` | Redeem promo codes |
| `/api/waitlist` | Waitlist management |
| `/api/admin/reset-premium` | Admin: reset premium status |
| `/api/test-connection` | Verify database connectivity |

---

## 🎯 Core Features

### 🛣️ Learning Path (`/roadmap`)
Vertical unit progression that tracks mastery scores and dynamically unlocks content nodes based on student performance.

### 🧠 Practice Engine (`/lesson/[id]`)
Four specialized item types designed for phonemic awareness:
* **Phoneme Tap:** Sound identification.
* **Word Build:** Segmenting and blending.
* **Multiple Choice:** Contextual answer selection.
* **Reading Comprehension:** Passage-based reading skills.

### 📖 Decodable Library & Reader
* **Library (`/library`):** Stories unlocked via progress milestones with grade-level metadata.
* **Reader (`/stories`):** Page-by-page rendering with simulated word-timing and audio highlighting.

### 🎮 Gamification & Rewards
* **Carrot Rewards (`/carrot-rewards`):** In-app currency earned through correct answers and streaks.
* **Streak Fire:** Daily session streaks with XP multipliers.
* **Mystery Box:** Surprise reward mechanism triggered by milestones.
* **Shop (`/shop`):** Spend carrots on cosmetic unlocks.
* **Leaderboard (`/leaderboard`):** Global and classroom-level rankings.

### 📊 Analytics (`/analytics`)
Real-time progress tracking, mastery scores per skill, and historical performance charts.

### 🎓 Assessment (`/assessment`)
Adaptive skill evaluation that feeds into the learning path to place students at the right difficulty level.

---

## 📂 Architecture Overview

```
readee-app2.0/
├── app/                    # Next.js App Router
│   ├── (protected)/        # Auth-gated pages
│   ├── (public)/           # Login, signup, reset-password
│   ├── _components/        # Global shared components & React contexts
│   ├── components/         # Feature-specific components (practice, auth, ui)
│   ├── api/                # API route handlers
│   ├── data/               # Static JSON content files
│   └── [public pages]/     # about, library, teachers, contact-us, etc.
├── lib/
│   ├── db/repositories/    # Database access layer (Supabase)
│   ├── schemas/            # Zod type-safe validation schemas
│   ├── stores/             # Zustand global state stores
│   ├── supabase/           # Supabase client factories & auth helpers
│   ├── assessment/         # Assessment scoring logic
│   ├── audio/              # Howler.js audio management
│   ├── carrots/            # Gamification / rewards logic
│   ├── motion/             # Framer Motion animation configs
│   └── word-bank/          # Phonemic awareness content helpers
├── supabase/
│   ├── migrations/         # Incremental SQL schema migrations (001–016)
│   └── config.toml         # Supabase local dev config
├── public/                 # Static assets (icons, audio, logos)
└── scripts/                # Content generation scripts (audio, images)
```

### Key Supabase Migrations
| Migration | Description |
|---|---|
| `001_initial_schema` | Core tables: users, children, progress |
| `003_learning_content` | Units, lessons, practice items |
| `005_seed_data` | Initial content seed |
| `008_assessments` | Assessment tracking tables |
| `011_paywall` | Premium / subscription gating |
| `013_carrots_and_shop` | Carrot currency & shop items |
| `015_promo_codes` | Promotional code support |
| `016_question_audit` | Question quality audit trail |

---

## 🏗️ Quick Start & Setup

### 1. Installation
```bash
git clone https://github.com/filipgalietti-cpu/readee-app2.0.git
cd readee-app2.0
npm install
```

### 2. Environment Variables
```bash
cp .env.example .env.local
```
Set the following in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

### 3. Run Development Server
```bash
npm run dev        # http://localhost:3000
```

### 4. Other Commands
```bash
npm run build      # Production build
npm start          # Start production server
npm run lint       # Run ESLint
```

### 5. Verify Database Connection
Visit `http://localhost:3000/api/test-connection` to confirm your Supabase connection is working.
