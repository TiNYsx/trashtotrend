# HOOP - From Trash to Trend

A modern interactive exhibition platform supporting the "From Trash to Trend" event, focused on the circular economy of aluminium.

## Theme

**From Trash to Trend** - When something once seen as worthless gets transformed into something valuable.

## Key Features

### User Journey

```
Pre-event → Event Day → Post-event
   ↓           ↓            ↓
Quiz    →  Register  →  Survey
Ice Bath    Checkpoints   Reward
```

### 1. Personality Quiz

- 5 personality types: Creator, Explorer, Observer, Player, Resetter
- 5 questions, one per page with progress bar
- Results recommend personalized activities

### 2. Ice Bath Registration

- Limited capacity (configurable)
- Time-based states: Closed → Open → Full
- First-come-first-served system

### 3. Event Registration

- Mandatory pre-survey (8 questions, 1-5 scale)
- Unique QR code generation
- Registration data collection

### 4. 7-Checkpoint Progress System

1. Entry (can submission)
2. Social Post
3. Hidden Can Puzzle
4. Hoop the Can Game
5. Art Showcase
6. Note Loop
7. Workshop

### 5. Survey System

- Pre + Post surveys with 8 identical questions
- Measures perception, knowledge, behavior change
- Links to user via QR ID

### 6. Reward System

- Unlocks after all checkpoints + post-survey
- QR verification at reward counter

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS 4 with custom dark theme
- **Database**: PostgreSQL
- **Auth**: JWT (jose), bcryptjs
- **Animations**: Framer Motion
- **QR**: html5-qrcode, qrcode

## Quick Start

```bash
# Install dependencies
npm install

# Set up database
psql -U postgres -d your_database -f scripts/001-create-tables.sql
psql -U postgres -d your_database -f scripts/002-seed-data.sql

# Configure environment
cp .env.example .env.local
# Edit .env.local with your DATABASE_URL and SESSION_SECRET

# Run development
npm run dev

# Build for production
npm run build
```

## Environment Variables

```env
DATABASE_URL=postgresql://user:password@localhost:5432/hoop_db
SESSION_SECRET=your-32-character-secret-key
NODE_ENV=production
NEXT_PUBLIC_BASE_URL=https://your-domain.com
```

## Default Admin

- Username: `admin`
- Password: `admin123`
- ⚠️ Change password immediately after first login

## Pages

| Route | Description |
|-------|-------------|
| `/` | Home page with HOOP branding |
| `/quiz` | Personality quiz |
| `/quiz/result` | Quiz results |
| `/ice-bath` | Ice bath registration |
| `/about` | About HOOP |
| `/event/register` | Event registration with pre-survey |
| `/login` | User login |
| `/dashboard` | User dashboard with progress |
| `/survey/pre` | Pre-event survey |
| `/survey/post` | Post-event survey |
| `/staff/login` | Staff login |
| `/staff/dashboard` | Staff admin panel |
| `/staff/scan` | QR checkpoint scanner |

## Database Schema

### Users

- Registration info, QR token, quiz type
- Survey completion flags
- Checkpoint progress tracking

### Checkpoints

- 7 configurable checkpoints
- Slug-based identification
- Duplicate prevention per user

### Surveys

- Pre/post responses linked to user
- 1-5 scale scoring
- Research-ready data

## Design System

- **Theme**: Cool dark mode with teal/cyan accents
- **Effects**: Glows, gradients, floating particles
- **Animations**: Smooth transitions, progress indicators
- **Typography**: Space Grotesk for display text

## TODO

- **Markdown Support**: Add a markdown support and re-design the "About Us" part on setting page.
- **Rework Quiz**: Add pre/post test setting + Add manual options-personality linking.
- **Registeration Check**: Need to check if the email is used or not - right now the email can re-use.

## License

Part of thesis exhibition. All rights reserved.
