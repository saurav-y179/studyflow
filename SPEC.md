# Student Productivity Tracker - Specification

## Project Overview
- **Name**: StudyFlow - Student Productivity Tracker
- **Type**: Interactive Single Page Application (SPA)
- **Core Functionality**: Track daily study/work entries, visualize consistency via GitHub-style heatmap and momentum bar, with local LLM assistant for productivity insights
- **Target Users**: Students seeking to build consistent daily study habits

## Tech Stack
- React 19 + Vite
- Tailwind CSS
- LocalStorage for persistence
- Framer Motion for animations
- Local LLM integration (Ollama-compatible API)

## UI/UX Specification

### Color Palette
- **Background**: `#0D0D0D` (near black)
- **Surface**: `#1A1A1A` (card backgrounds)
- **Surface Elevated**: `#242424` (hover states)
- **Primary**: `#10B981` (emerald green - success/energy)
- **Primary Glow**: `#34D399` (lighter emerald)
- **Secondary**: `#6366F1` (indigo - accent)
- **Warning**: `#F59E0B` (amber - streak alerts)
- **Error**: `#EF4444` (red - missed days)
- **Text Primary**: `#F9FAFB` (white-ish)
- **Text Secondary**: `#9CA3AF` (muted gray)
- **Text Tertiary**: `#6B7280` (dimmer)
- **Border**: `#2D2D2D` (subtle borders)

### Heatmap Intensity Levels
- Level 0 (no activity): `#1A1A1A`
- Level 1 (partial): `#064E3B` (dark green)
- Level 2 (moderate): `#059669` (medium green)
- Level 3 (complete): `#10B981` (bright green)
- Level 4 (exceeded): `#34D399` (glowing green)

### Typography
- **Font Family**: 'Outfit' (headings), system-ui fallback
- **Heading 1**: 32px, font-weight 700
- **Heading 2**: 24px, font-weight 600
- **Heading 3**: 18px, font-weight 600
- **Body**: 14px, font-weight 400
- **Small**: 12px, font-weight 400
- **Mono**: 'JetBrains Mono' for data/numbers

### Spacing System
- Base unit: 4px
- xs: 4px, sm: 8px, md: 16px, lg: 24px, xl: 32px, 2xl: 48px

### Layout Structure
- **Header** (fixed top, 64px height): Logo, streak display, profile dropdown
- **Momentum Bar** (below header, 48px height): Full-width horizontal bar showing energy level
- **Main Content**: 
  - Left sidebar (280px): Navigation
  - Center (flex-1): Dynamic content area
  - Right panel (320px, collapsible): LLM assistant chat

### Responsive Breakpoints
- Mobile: < 768px (single column, bottom nav)
- Tablet: 768px - 1024px (two column)
- Desktop: > 1024px (full three column)

## Components

### 1. Header
- Logo (left): "StudyFlow" with lightning icon
- Streak badge (center): "🔥 X-day streak"
- Profile dropdown (right): Avatar, settings gear, logout

### 2. Momentum Bar
- Full-width horizontal bar
- Animated fill based on streak level
- Formula: `min(currentStreak / maxStreakGoal * 100, 100)`
- Max streak goal: 30 days (display as full bar)
- Color gradient: red → amber → green based on level
- Smooth 0.5s transition on value change
- Label: "Momentum" with percentage

### 3. Daily Submission Card
- Date display at top
- Two sections:
  - "What did you accomplish today?" (textarea)
  - "What will you do tomorrow?" (textarea + checkbox list from previous day)
- Submit button (prominent, emerald)
- Auto-save draft functionality

### 4. GitHub-style Contribution Grid
- 53 weeks x 7 days grid (past year)
- Each cell: 12x12px with 2px gap
- Day labels on left (Mon, Wed, Fri)
- Month labels on top
- Tooltip on hover: Date, completion status, task count
- Legend at bottom showing intensity levels

### 5. Dashboard Stats
- Cards showing:
  - Total active days (count)
  - Current streak (days)
  - Longest streak (days)
  - Average completion rate (%)

### 6. LLM Assistant Panel
- Floating expand button (bottom-right)
- Slide-in panel (400px width)
- Chat message bubbles (user: right-aligned, AI: left-aligned)
- Input field with send button
- Typing indicator during API calls

### 7. History List
- Scrollable list of past entries
- Each item: Date, preview of work, completion badges
- Click to expand full details
- Filter by date range

## Functionality Specification

### User Registration & Profile
- First-time user sees registration modal
- Fields: Name, daily goal (hours), focus areas (tags)
- Data stored in localStorage under key "studyflow_user"
- Editable via profile settings

### Daily Submission
- One submission per day (identified by date string YYYY-MM-DD)
- Store in localStorage as array under "studyflow_entries"
- Structure per entry:
  ```
  {
    date: "2025-05-05",
    completed: "Task 1, Task 2",
    planned: "Task A, Task B",
    completedTasks: ["Task A"],
    timestamp: 1714934400000,
    completionLevel: 0-4
  }
  ```
- Prevent multiple submissions same day (show edit mode if exists)

### Streak Calculation
- Define "streak day" as any day with submission OR next day has submission
- Reset on gap > 2 days (missed yesterday and today)
- Update streak on every submission

### Heatmap Generation
- Calculate activity intensity: 0-4 based on completion percentage
- Generate 53x7 grid data
- Map to calendar dates

### Momentum Bar Calculations
- Current momentum = (currentStreak / 30) * 100
- Decay: If no submission today, decrease 10% per day (min 0)
- Color mapping:
  - 0-30: #EF4444 (red)
  - 31-60: #F59E0B (amber)
  - 61-100: #10B981 (green)

### Task Continuity
- On load, if yesterday had planned tasks, show as checklist
- User checks off completed items
- Unchecked items auto-carry to new "planned" section

### LLM Integration
- Connect to localhost:11434 (Ollama default)
- Endpoint: /api/generate
- System prompt: "You are StudyFlow, a productivity assistant..."
- Context: Send recent entries, streak data
- Handle errors gracefully (show fallback message)

## Acceptance Criteria
1. ✓ User can register with name and goals
2. ✓ User can submit daily work and plan
3. ✓ Streak displays correctly (fire emoji + count)
4. ✓ Momentum bar animates smoothly
5. ✓ GitHub grid shows full year with correct dates
6. ✓ Hover on grid cells shows tooltip
7. ✓ Yesterday's planned tasks appear as checklist
8. ✓ Dashboard shows all stat cards
9. ✓ LLM assistant opens in floating panel
10. ✓ App is responsive on mobile
11. ✓ All data persists across page reloads
