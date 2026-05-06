# StudyFlow

<div align="center">

![StudyFlow Logo](./src/assets/hero.png)

**A focused productivity tracker for students who want to build consistent daily study habits.**

[Get Started](#getting-started) • [Features](#features) • [Tech Stack](#tech-stack)

</div>

---

## Download & Setup

### 1. Clone the repository

```bash
git clone https://github.com/saurav-y179/studyflow.git
cd studyflow
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start the development server

```bash
npm run dev
```

The app will open at `http://localhost:5173`

### 4. Build for production

```bash
npm run build
```

The built files will be in the `dist/` folder - you can deploy these to any static hosting service (Netlify, Vercel, GitHub Pages, etc.).

### 5. Preview production build locally

```bash
npm run preview
```

## Features

- Daily task planning with separate sections for today and tomorrow.
- Automatic rollover for unfinished planned tasks.
- Streak, completion, active-day, and longest-streak metrics.
- Year-long activity heatmap with completion intensity levels.
- Local history view for reviewing previous study sessions.
- Optional local LLM assistant for study insights when a compatible API is running.
- Browser-only persistence through `localStorage`.

## Tech Stack

- React 19
- Vite
- Tailwind CSS
- Framer Motion
- Lucide React
- date-fns

## Getting Started

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Create a production build:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Available Scripts

- `npm run dev` starts the local Vite development server.
- `npm run build` creates a production build in `dist`.
- `npm run preview` serves the production build locally.
- `npm run lint` runs ESLint across the project.

## Local Data

StudyFlow stores user profile details, task entries, streak data, and rollover state in the browser's `localStorage`. Clearing browser storage or using the logout action removes the local data for the app.

## Optional LLM Assistant

The assistant is designed to call a local API at `http://localhost:8000`. The core tracking experience works without that service; assistant responses are only available when a compatible local endpoint is running.

## Project Structure

```text
src/
  components/        Reusable UI sections and feature components
  components/layout/ Shared layout and modal wrappers
  hooks/             StudyFlow state and app lifecycle logic
  utils/             Local storage and date helpers
  main.jsx           React entry point
```
