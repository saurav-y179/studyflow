# StudyFlow

StudyFlow is a local student productivity dashboard for planning study tasks, tracking daily completion, building streaks, and reviewing study momentum over time. It runs in your browser, saves your data locally, and is designed to be run from a cloned repository or a release bundle.

The app is designed for students who want one clear place to answer three questions every day:

- What should I finish today?
- What should I prepare for tomorrow?
- Am I staying consistent over time?

## What You Can Do With StudyFlow

- Create or edit a local study profile.
- Add tasks for today.
- Plan tasks for tomorrow.
- Mark today's tasks as complete.
- Let planned tasks roll into the next day automatically.
- Track current streak, longest streak, completion rate, active days, and momentum.
- View a year-style activity heatmap.
- Review recent history.
- Switch between the available UI versions.
- Chat with the Pikachu assistant using local, cloud, or basic offline responses.
- Start the whole app with a Windows `.bat` shortcut.

## Quick Start For Normal Users

If you only want to use the app on this computer, use the batch file shortcut:

1. Make sure Node.js is installed.
2. Open this project folder.
3. Double-click `Start StudyFlow.bat`.
4. Wait until the terminal shows the Vite local address.
5. Open `http://localhost:5173` in your browser.
6. Keep the terminal window open while using StudyFlow.
7. Press `Ctrl+C` in that terminal window when you want to stop the app.

The batch file runs the same command as `npm run dev`. It starts both the backend API server and the frontend development server.

## Easiest Download For Other Users

Yes: the easiest shareable version is a single release zip.

Create it with:

```bash
npm run release
```

This builds the app and creates:

```text
release/studyflow.zip
```

Upload that zip file to a GitHub Release. After that, users can download, install, and start StudyFlow from Windows PowerShell with one command:

```powershell
$url="https://github.com/YOUR-USER/YOUR-REPO/releases/latest/download/studyflow.zip"; iwr $url -OutFile studyflow.zip; Expand-Archive .\studyflow.zip -DestinationPath .\studyflow -Force; cd .\studyflow; npm install --omit=dev; npm start
```

Replace `YOUR-USER/YOUR-REPO` with the real GitHub repository path.

On macOS or Linux, the equivalent terminal command is:

```bash
curl -L -o studyflow.zip https://github.com/YOUR-USER/YOUR-REPO/releases/latest/download/studyflow.zip && unzip -o studyflow.zip -d studyflow && cd studyflow && npm install --omit=dev && npm start
```

The release app opens at:

```text
http://localhost:3001
```

People can also unzip the release manually, run `npm install --omit=dev`, and double-click `Start StudyFlow Release.bat`.

## Batch File Shortcut

The included `Start StudyFlow.bat` file is a Windows shortcut-style launcher for the project. It is useful because you do not have to open a terminal, change directories, and type commands every time.

What the batch file does:

1. Moves into the StudyFlow project folder automatically.
2. Runs `npm run dev`.
3. Starts the Express API server on `http://localhost:3001`.
4. Starts the Vite frontend on `http://localhost:5173`.
5. Prints the browser URL.
6. Keeps the terminal window open so the app can keep running.

Important notes:

- Do not close the batch file terminal while using the app.
- If the terminal closes, the local servers stop.
- If Windows asks which program should open the file, choose Command Prompt or Windows Terminal.
- You can right-click the `.bat` file and choose `Create shortcut` to place a shortcut on your desktop.
- If you move the project folder, create a new shortcut from the moved `.bat` file.

## First-Time Setup

Before using the batch file or npm scripts, install the project dependencies once.

```bash
npm install
```

After dependencies are installed, you can start StudyFlow whenever you want with either:

```bash
npm run dev
```

or by double-clicking:

```text
Start StudyFlow.bat
```

## Requirements

- Windows, macOS, or Linux for development.
- Node.js installed.
- npm installed with Node.js.
- A modern browser such as Chrome, Edge, Firefox, or Brave.

For the batch file shortcut, Windows is required because `.bat` files are Windows scripts.

### Node.js / npm (recommended)

StudyFlow uses modern ESM and recent dependencies. To avoid runtime issues, use a recent Node.js LTS release. Recommended:

- Node.js 18.x or later (LTS). Node 20+ is also supported.
- npm 9.x or later.

Check your versions:

```bash
node -v
npm -v
```

If you see syntax or module errors when running `npm run dev`, upgrade Node.js to an LTS version.

### Environment variables

StudyFlow supports a few optional environment variables you can set when running the server or the combined dev script.

- STUDYFLOW_API_KEY (optional): when set, the Express API will require this API key for requests. If unset, the API is open (development mode).
  - Linux / macOS (temporary in shell): `export STUDYFLOW_API_KEY=your-secret-key`
  - Windows PowerShell (temporary for session): `$env:STUDYFLOW_API_KEY = "your-secret-key"`
  - Windows (persistent): `setx STUDYFLOW_API_KEY "your-secret-key"`
  - When using an API key, provide it in requests via the `x-api-key` header or `?apiKey=` query parameter.

- CORS_ORIGIN (optional): overrides the default CORS origin. Default is `http://localhost:5173`.
  - Example: `export CORS_ORIGIN=https://example.local`

- PORT (optional): overrides the API server port (default 3001). Example: `PORT=4000 npm run dev:server`.

## Running The App

### Option 1: Use The Windows Batch File

Double-click:

```text
Start StudyFlow.bat
```

Then open:

```text
http://localhost:5173
```

### Option 2: Use The Terminal

From the project folder:

```bash
npm run dev
```

This starts:

- Express API server: `http://localhost:3001`
- Vite frontend server: `http://localhost:5173`

Open the Vite frontend URL in your browser.

### Option 3: Run Only The Frontend

```bash
npm run dev:vite
```

This starts only Vite. The app can still fall back to browser storage, but file-backed sync through the local API will not be available.

### Option 4: Run Only The API Server

```bash
npm run dev:server
```

This starts only the Express server on `http://localhost:3001` (or the port set in PORT).

## How To Use StudyFlow

### 1. Open The Dashboard

Start the app and open `http://localhost:5173`.

On first launch, StudyFlow creates a default local profile so you can begin immediately. You can update the profile from the settings button in the top control bar.

### 2. Add Today's Tasks

Use the `Today's Tasks` panel to add tasks you want to finish today.

1. Type a task into the input at the bottom of the card.
2. Press `Enter` or click the plus button.
3. Repeat for each task.
4. Click the checkbox beside a task when it is complete.

StudyFlow automatically estimates task duration from the task text. For example, review-style tasks may receive a shorter estimate while mock tests or heavier study work may receive a longer estimate.

### 3. Plan Tomorrow's Work

Use the `Tomorrow's Plan` panel to prepare the next day.

1. Type a task into the tomorrow input.
2. Press `Enter` or click the plus button.
3. StudyFlow assigns a time slot when available.
4. StudyFlow also applies a simple tag such as `Focus`, `Study`, `Practice`, or `Test`.

This is the main habit loop of the app: finish today's work, then set up tomorrow before you stop.

### 4. Complete Tasks

Click a task checkbox in `Today's Tasks` when the task is done. Your completion percentage updates automatically.

A day counts toward streak progress when at least 80% of that day's tasks are complete.

### 5. Understand Planned And Locked Tasks

Tasks planned for tomorrow become part of the next day's task list. When a planned task rolls into today, it can be completed, but it may be locked from editing or deleting. This helps preserve the plan.

Tasks added directly today can usually be deleted on the same day.

### 6. Use The Sidebar

The left sidebar contains the main navigation:

- `Dashboard`: all main panels in one view.
- `Tasks`: today's tasks and tomorrow's plan.
- `Plan`: tomorrow planning plus recent history.
- `Analytics`: productivity overview and activity heatmap.

You can collapse the sidebar with the arrow button near the top.

### 7. Use The Top Control Bar

The top bar shows your streak progress and account controls.

Common controls:

- Streak meter: visual 30-day streak progress.
- Settings button: edit profile information.
- Version switcher: switch between the `Pikachu Blue` and `Scandinavian` layouts.
- Profile button: open profile menu and logout.

The current default layout is `Pikachu Blue`.

### 8. View Stats

The dashboard includes metrics such as:

- Current streak.
- Longest streak.
- Active days.
- Completion progress.
- Estimated focus time.
- Weekly productivity overview.

These numbers update from your saved task history.

### 9. Use The Activity Heatmap

The activity heatmap gives a year-style view of your study consistency. More completed work creates stronger activity levels. Use this view to notice streaks, gaps, and patterns in your routine.

### 10. Review History

The `History` panel shows recent study activity. It lists recent days with task counts and estimated focus time.

## Pikachu Assistant

StudyFlow includes a Pikachu-themed assistant called `Flow AI Pikachu`.

Open it by clicking `Ask Pikachu` in the sidebar.

The assistant has three modes:

- `Local LLM Inference`: connects to a local OpenAI-compatible server, usually at `http://localhost:8000`.
- `Cloud API`: connects to a cloud provider such as Groq using an API key.
- `Basic Responses`: uses simple offline responses with no external AI setup.

If the selected AI mode fails, StudyFlow automatically falls back to basic offline responses so the chat panel still works.

Inside the chat settings, the app links to:

- `/docs/ai-setup.html`
- `/docs/ai-setup.txt`

Those files explain the AI setup in more detail.

## Data Storage

StudyFlow uses two layers of storage:

1. Browser `localStorage` for fast local state.
2. JSON files in the `data/` folder when the Express API server is running.

The API server stores data in files such as:

- `data/profiles.json`
- `data/active.json`
- `data/entries_<profileId>.json`
- `data/promoted_<profileId>.json`
- `data/chat_<profileId>.json`

If the API server is unavailable, the app can still work from browser storage. For best persistence across browser sessions and profiles, run the full app with `npm run dev` or `Start StudyFlow.bat`.

## Logout And Profiles

Logout clears the active session marker, but it does not intentionally delete all saved study data. The saved profiles and task entries remain available in local storage or the `data/` folder depending on how you started the app.

Use settings to update the current profile.

## Production Build

Create a production build:

```bash
npm run build
```

The built frontend files are written to:

```text
dist/
```

Preview the production build locally:

```bash
npm run preview
```

Run the Express server against the built app:

```bash
npm start
```

When `dist/` exists, `server.js` can serve the built frontend and the API from the same Express server.

Create a shareable release zip:

```bash
npm run release
```

The zip is written to:

```text
release/studyflow.zip
```

This release bundle is meant for normal users. It includes the built `dist/` frontend, the Express server, package metadata, docs, and a production launcher batch file. It does not include `node_modules` to keep the zip small — users should run `npm install --omit=dev` after extracting on their machine if the release is not fully bundled.

## Available Scripts

| Command | What it does |
| --- | --- |
| `npm install` | Installs project dependencies. |
| `npm run dev` | Starts both the Express API server and Vite frontend. |
| `npm run dev:vite` | Starts only the Vite frontend. |
| `npm run dev:server` | Starts only the Express API server. |
| `npm run build` | Builds the frontend into `dist/`. |
| `npm run release` | Builds the app and creates a single release zip in `release/`. |
| `npm run preview` | Previews the production frontend build locally. |
| `npm start` | Starts the Express server. |
| `npm run lint` | Runs ESLint on the project. |
| `npm test` | Runs the Vitest test suite once. |
| `npm run test:watch` | Runs Vitest in watch mode. |

## Project Structure

```text
.
+-- Start StudyFlow.bat       Windows launcher shortcut
+-- Start StudyFlow Release.bat
+-- RELEASE.md                Release zip install instructions
+-- scripts/
|   +-- create-release.ps1    Builds the single release zip
+-- dev.js                    Starts API server and Vite together
+-- server.js                 Express API server and production static server
+-- data/                     Local JSON data files
+-- public/                   Static assets and AI setup docs
+-- src/
|   +-- main.jsx              React entry point and version selection
|   +-- AppV1.jsx             T2 layout
|   +-- v3/                   T3 dashboard layout and components
|   +-- components/           Shared components
|   +-- hooks/                App state hooks
|   +-- utils/                Storage, date, streak, and sync helpers
+-- package.json              Scripts and dependencies
+-- vite.config.js            Vite configuration
```

**How it fits together:** The dev script (`npm run dev`) runs `dev.js` which starts the Express API server (`server.js`) and a local Vite dev server concurrently. The frontend (Vite) communicates with the local API (default port 3001) for file-backed persistence when available; otherwise it falls back to browser localStorage.

## Troubleshooting

### The Batch File Opens And Immediately Closes

Run `npm install` first. If dependencies are missing, the start command may fail.

You can also open a terminal in the project folder and run:

```bash
npm run dev
```

This will show the full error.

### `npm` Is Not Recognized

Install Node.js from the official Node.js website, then close and reopen your terminal.

### The Browser Cannot Open `localhost:5173`

Make sure the terminal running StudyFlow is still open. The app only works while the local server process is running.

### Port `5173` Or `3001` Is Already In Use

Another app may already be using the same port. Close the other app or stop the old StudyFlow terminal window. You can also override the API port by setting the `PORT` environment variable before starting the server.

### Data Does Not Appear After Restarting

Start StudyFlow with `npm run dev` or `Start StudyFlow.bat` so the API server can sync data with the `data/` folder. Also avoid clearing browser site data unless you intentionally want to remove saved profiles.

### API Returns `401 Unauthorized` After Enabling API Key

If you set `STUDYFLOW_API_KEY` the server will require the same key for API requests. Provide the key in the `x-api-key` header or `?apiKey=` query parameter. To test in a browser, you can append `?apiKey=your-key` to the `/api/sync/<profileId>` call or use a REST client and set the `x-api-key` header.

### CORS Issues

If you run the frontend from a different origin than `http://localhost:5173`, set `CORS_ORIGIN` to allow that origin before starting the server.

### The AI Assistant Does Not Answer From A Real Model

Check the assistant settings:

- For local AI, confirm the local model server is running at the configured host.
- For cloud AI, confirm the API key is correct.
- If the connection fails, StudyFlow falls back to basic offline responses.

## Tech Stack

- React 19
- Vite
- Tailwind CSS
- Express
- Framer Motion
- Lucide React
- date-fns
- Vitest

## Notes For Deployment

StudyFlow is primarily designed as a local personal productivity app. You can deploy the static `dist/` frontend to a static hosting provider, but the included Express API writes to local JSON files and is not intended for multi-user production without replacing file storage with a proper database and adding authentication.

For public deployment, replace the local file-based storage with a proper database and authentication layer.
