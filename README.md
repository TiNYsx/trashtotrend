# From Trash to Trend - Event Stamp Collection App

A modern event stamp collection and quiz system built with Next.js, featuring staff QR scanning and customer engagement through interactive booths.

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 12+
- npm or pnpm

### Installation

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Start development server
npm run dev
```

Visit http://localhost:3000

## Key Features

### 👥 Customer Portal
- **Registration**: Dynamic registration forms with bilingual support
- **Stamps**: Stamps are added only after quizzes are completed, and the customer’s stamp grid updates live without page refresh.
- **Quizzes**: When staff scans a customer, the app will immediately redirect the customer to the appropriate quiz. Only after completing the quiz does the customer receive a stamp (answers can be wrong, just submit any response).
- **QR Code**: Unique QR code for each customer to present at booths
- **Bilingual**: Full support for English and Thai

### 👨‍💼 Staff Portal
- **QR Scanning**: Scan customer codes to record booth visits
- **Dashboard**: View event statistics and analytics
- **Booth Management**: Create and manage booth information
- **Customer Management**: View registered customers
- **Quiz Management**: Configure quiz questions for each booth
- **Registration Management**: Manage custom registration fields

## Database Setup

### 1. Create Database
```bash
# Using PostgreSQL CLI
createdb from_trash_to_trend
```

### 2. Set Environment Variables
Create a `.env.local` file:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/from_trash_to_trend
SESSION_SECRET=your-32-character-secret-key-here
NODE_ENV=production
```

### 3. Run Migrations
```bash
# Create tables
psql from_trash_to_trend < scripts/001-create-tables.sql

# Seed sample data
psql from_trash_to_trend < scripts/002-seed-data.sql
```

### 4. Default Admin Account
- **Username**: admin
- **Password**: admin123
- ⚠️ **Change password immediately after first login**

## Authentication

### Customer Flow
1. Register with email and password
2. Receive unique QR code
3. Login to view stamps and take quizzes

### Staff Flow
1. Login with staff credentials
2. Access admin dashboard
3. Scan customer QR codes at booths
4. Manage event content

## Project Structure

```
app/
├── api/                    # API Routes
│   ├── qr/refresh/        # QR token refresh endpoint
│   └── scan/              # Booth scan endpoint
├── login/                 # Customer login
├── register/              # Customer registration
├── stamps/                # Customer stamp collection
│   └── quiz/[boothId]/   # Quiz per booth
├── staff/                 # Staff portal
│   ├── login/            # Staff login
│   └── (admin)/          # Admin routes
│       ├── dashboard/    # Analytics dashboard
│       ├── scan/         # QR scanning interface
│       ├── booths/       # Booth management
│       ├── customers/    # Customer management
│       ├── quiz/         # Quiz management
│       └── registration/ # Field management

components/
├── customer/    # Customer-facing components
├── staff/       # Staff portal components
└── ui/          # Reusable UI components

lib/
├── auth.ts      # JWT sessions & auth logic
├── db.ts        # Database queries
├── i18n.ts      # Language translations
├── utils.ts     # Utilities
└── actions/     # Server actions
    ├── auth.ts
    ├── booths.ts
    ├── quiz.ts
    ├── quiz-submit.ts
    └── registration.ts

scripts/
├── 001-create-tables.sql  # Database schema
├── 002-seed-data.sql      # Sample data
└── generate-hash.mjs      # Password hash generator
```

## Key Technologies

- **Frontend**: React 19, Next.js 16
- **Styling**: Tailwind CSS 4, Radix UI
- **Database**: PostgreSQL
- **Auth**: JWT (jose), bcryptjs
- **QR**: html5-qrcode, qrcode
- **Animation**: Framer Motion
- **Forms**: React Hook Form, Zod
- **i18n**: Custom bilingual system

## Production Deployment

### Vercel
```bash
vercel
```

### Self-Hosted
```bash
# Build production bundle
npm run build

# Start server
npm start
```

### Environment Checklist
- [ ] DATABASE_URL configured
- [ ] SESSION_SECRET set (32+ chars)
- [ ] NODE_ENV=production
- [ ] Admin password changed
- [ ] SSL/TLS enabled

## Development

### Run Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Lint Code
```bash
npm run lint
```

## API Endpoints

### Public
- `POST /api/scan` - Record booth scan (requires staff auth)
- `POST /api/qr/refresh` - Refresh customer QR token

### Protected (require authentication)
- `/api/auth/*` - Authentication endpoints
- `/api/quiz/*` - Quiz management
- `/api/booths/*` - Booth management

## Troubleshooting

### Database Connection Issues
- Verify DATABASE_URL is correct
- Check PostgreSQL is running
- Ensure test user has permissions

### QR Scanner Not Working
- Check browser camera permissions
- Ensure HTTPS in production
- Try on a different browser

### Session/Auth Issues
- Verify SESSION_SECRET is set
- Clear browser cookies
- Check JWT expiration (24 hours)

## Support & Issues

For issues or feature requests, please document them clearly with:
1. Steps to reproduce
2. Expected behavior
3. Actual behavior
4. Environment details

## License

This project is part of a thesis exhibition. All rights reserved.
