# Deployment Checklist

## Pre-Deployment Tasks

### 1. Database Setup
- [ ] PostgreSQL installed and running
- [ ] Database `from_trash_to_trend` created
- [ ] Run migration: `scripts/001-create-tables.sql`
- [ ] Run seed data: `scripts/002-seed-data.sql`
- [ ] Test database connection

### 2. Environment Configuration
- [ ] Copy `.env.example` to `.env.local`
- [ ] Set `DATABASE_URL` with correct credentials
- [ ] Generate and set `SESSION_SECRET` (32+ random characters)
  ```bash
  # Use this command to generate a random secret:
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
- [ ] Set `NODE_ENV=production`

### 3. Verify Build
- [ ] Run `npm install` to ensure dependencies installed
- [ ] Run `npm run build` and verify no errors
- [ ] All 14 routes generated successfully
- [ ] No TypeScript errors

### 4. Security Hardening
- [ ] Change admin password from default `admin123`
  - Login to `/staff/login` with admin/admin123
  - Navigate to admin settings (when available)
  - Update password
- [ ] Ensure DATABASE_URL uses strong password
- [ ] Use unique SESSION_SECRET
- [ ] Enable HTTPS (required for camera access on non-localhost)
- [ ] Set secure cookie flags in production

### 5. Testing
- [ ] Test customer registration flow
- [ ] Test customer login
- [ ] Test staff login
- [ ] Test QR code generation
- [ ] Test QR scanning (on mobile with camera)
- [ ] Test quiz submission
- [ ] Test stamp collection
- [ ] Test language toggle

### 6. Performance
- [ ] Verify build size is optimized
- [ ] Check database query performance
- [ ] Monitor API response times
- [ ] Enable image optimization if adding images

### 7. Deployment Options

#### Option A: Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
# - DATABASE_URL
# - SESSION_SECRET
```

#### Option B: Self-Hosted / VPS
```bash
# Build application
npm run build

# Start production server
npm start
# or use PM2:
pm2 start "npm start" --name "ftt-app"
```

#### Option C: Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm ci
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### 8. Monitoring & Maintenance
- [ ] Set up error logging (Sentry, LogRocket, etc.)
- [ ] Monitor database performance
- [ ] Set up uptime monitoring
- [ ] Create backup strategy for database
- [ ] Document how to scale if needed

## Post-Deployment

### Daily Tasks
- [ ] Monitor error logs
- [ ] Check database performance
- [ ] Verify all features working

### Weekly Tasks
- [ ] Backup database
- [ ] Review analytics
- [ ] Check for security updates

### Monthly Tasks
- [ ] Update dependencies
- [ ] Review access logs
- [ ] Optimize slow queries

## Troubleshooting Guide

### Issue: "Cannot connect to database"
**Solution:**
- Verify DATABASE_URL is correct
- Check PostgreSQL service is running
- Test with: `psql $DATABASE_URL`

### Issue: "QR Scanner shows black screen"
**Solution:**
- Ensure HTTPS in production
- Check browser camera permissions
- Try different browser
- Clear browser cache

### Issue: "Auth cookie not persisting"
**Solution:**
- Verify SESSION_SECRET is set
- Check secure/sameSite cookie settings
- Clear browser cookies
- Verify NODE_ENV setting

### Issue: "Slow page loads"
**Solution:**
- Check database indexes
- Monitor API response times
- Review database query logs
- Consider caching strategies

## Feature Flags for Future Development

These can be added without breaking existing code:

```typescript
// lib/features.ts
export const FEATURES = {
  ADVANCED_ANALYTICS: false,
  MULTIPLE_EVENTS: false,
  STAFF_ROLES: false,
  CUSTOMER_FEEDBACK: false,
  LEADERBOARD: false,
  BADGES: false,
  SOCIAL_SHARING: false,
}
```

## Support Resources

- **Next.js Docs**: https://nextjs.org/docs
- **PostgreSQL Docs**: https://www.postgresql.org/docs
- **Vercel Docs**: https://vercel.com/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **React Docs**: https://react.dev

---

**Last Updated**: March 4, 2026
**Status**: All systems built and tested ✅
