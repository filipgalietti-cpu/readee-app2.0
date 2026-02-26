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
* **Framework:** Next.js 15.1 (App Router)
* **Frontend:** React 19, Tailwind CSS v4
* **Backend/Auth:** Supabase (PostgreSQL)
* **Language:** TypeScript
* **Middleware:** Custom Auth Guards & Proxy Logic

---

## 🎯 Core Features

### 🛣️ Learning Path (`/path`)
Vertical unit progression that tracks mastery scores and dynamically unlocks content nodes based on student performance.

### 🧠 Practice Engine (`/lesson/[id]`)
Four specialized item types designed for phonemic awareness:
* **Phoneme Tap:** Sound identification.
* **Word Build:** Segmenting and blending.
* **Multiple Choice & Comprehension:** Contextual reading skills.

### 📖 Decodable Library & Reader
* **Library:** Stories unlocked via progress milestones with grade-level metadata.
* **Reader:** Page-by-page rendering with simulated word-timing and audio highlighting.

---

## 🏗️ Quick Start & Setup

### 1. Installation
```bash
git clone [https://github.com/filipgalietti-cpu/readee-app2.0.git](https://github.com/filipgalietti-cpu/readee-app2.0.git)
cd readee-app2.0
npm installVisit http://localhost:3000/test-connection to verify your database setup.

📂 Architecture Overview
app/: Next.js 15 App Router (Protected vs. Public Routes)

lib/: Core logic—Auth helpers, DB repositories, and Supabase clients.

proxy.ts: Critical authentication middleware for route protection.

supabase/: Database migrations and SQL schemas.

📜 Documentation & Security
Detailed guides on the system architecture and security protocols:

📋 Setup Guide

🏗️ Architecture Overview

🔒 Security Summary
