# Readee - Early Reading Learning Platform

A comprehensive early reading platform built with Next.js and Supabase, featuring a structured learning path, practice sessions with spaced repetition, and a library of decodable stories for early readers (ages 4–8).

## Features

### 🎯 Learning Path (`/path`)
- Vertical progression through content units
- Track progress through lessons
- View completed lessons and scores
- Expandable units showing all available lessons

### 📚 Practice Engine (`/lesson/[lessonId]`)
- **4 Item Types:**
  - **Phoneme Tap**: Identify sounds in words
  - **Word Build**: Construct words from letters
  - **Multiple Choice**: Select correct answers
  - **Comprehension**: Reading comprehension questions
- Immediate feedback and retry logic
- Spaced repetition: ~60–70% new items + ~30–40% review items
- Progress tracking and scoring

### 📖 Story Library (`/library`)
- Decodable stories for early readers
- Stories unlock based on progress
- Grade-level indicators
- Rich metadata and descriptions

### 🎧 Story Reader (`/reader/[storyId]`)
- Page-by-page story rendering
- Word-by-word highlighting (simulated timing)
- Audio playback simulation
- Navigation between pages

### 🔐 Authentication
- Email/password authentication via Supabase
- Google OAuth integration
- Protected routes with authentication guards
- Profile management

## Tech Stack
- **Framework**: Next.js 16.1.6 (App Router)
- **UI**: React 19, Tailwind CSS v4
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **TypeScript**: Full type safety

## Quick Start

### Prerequisites
- Node.js 20+ and npm
- A Supabase account (create one at supabase.com)

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd readee-app2.0
npm install