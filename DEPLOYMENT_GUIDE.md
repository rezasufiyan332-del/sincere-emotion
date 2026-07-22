# Sincere Emotion - Production Deployment & Security Guide

## Project Status

### Completed Tasks
- [x] **TypeScript Build** - All type errors fixed (36+ errors resolved)
- [x] **Prisma Setup** - Database schema configured with proper migrations support
- [x] **Authentication System** - Complete auth with session management, 2FA support
- [x] **Error Handling** - Comprehensive API error handling with proper status codes
- [x] **Type Safety** - Full TypeScript support with validated inputs

### Project Architecture
- **Framework:** Next.js 16 with App Router
- **Database:** PostgreSQL with Prisma ORM
- **Auth:** Custom session-based auth (credentials + Google OAuth ready)
- **Payments:** Stripe integration for product purchases
- **Email:** Resend for transactional emails
- **Styling:** Tailwind CSS v4 with custom design tokens

---

## Production Deployment Checklist

### 1. Environment Setup
```bash
# Required Environment Variables - Must be set in production
DATABASE_URL=postgresql://...          # Neon PostgreSQL connection
DIRECT_URL=postgresql://...            # Direct connection for migrations
STRIPE_SECRET_KEY=sk_live_...          # Stripe production key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
AUTH_SECRET=<generate: openssl rand -base64 32>
GOOGLE_CLIENT_ID=...                   # From Google Cloud Console
GOOGLE_CLIENT_SECRET=...
RESEND_API_KEY=...                     # Email delivery
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
```

### 2. Database Deployment
```bash
# Before deployment, run migrations
npm run db:migrate      # Create/update database schema
npm run db:push         # Push schema to production DB
npm run db:seed         # Optional: seed initial products
```

### 3. Security Requirements

#### Password Hashing
- Uses bcryptjs with 12 salt rounds (industry standard)
- Passwords never logged or exposed in errors

#### Session Security
- httpOnly cookies (XSS protection)
- Secure flag in production (HTTPS only)
- SameSite=lax (CSRF protection)
- 30-day expiry with rotation on login

#### CORS & Headers
- X-Frame-Options: DENY (clickjacking protection)
- X-Content-Type-Options: nosniff (MIME sniffing protection)
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy: camera, microphone, geolocation disabled

#### Rate Limiting
- Login: 5 attempts per 15 minutes
- Register: 3 attempts per hour
- Per-IP enforcement via Redis (requires Upstash Redis)

#### Input Validation
- All API inputs validated with Zod schemas
- Email verification required for registration
- Password requirements: minimum security standards
- XSS prevention through React auto-escaping

### 4. Authentication Flow

#### Credentials Auth
1. User registers with email + password
2. Password hashed with bcryptjs (never stored plaintext)
3. Verification email sent (token expires in 24h)
4. Login rotates session (one active per user)
5. Session stored in httpOnly cookie + database

#### Google OAuth
1. User clicks "Sign in with Google"
2. Redirected to Google consent screen
3. User profile linked to account (or new account created)
4. Automatic email verification (Google emails trusted)

#### Two-Factor Authentication (2FA)
1. User enables 2FA in settings
2. Generates TOTP secret (scan with authenticator)
3. 10 backup codes provided for recovery
4. Required on login if enabled

### 5. API Security

#### Authentication Enforcement
- `requireAuth()` - Must be logged in
- `requireAdmin()` - Must have ADMIN role
- All protected routes checked in middleware

#### Audit Logging
- Admin actions logged to AuditLog table
- Tracks: who, what, when, target resource
- Useful for compliance and debugging

#### Error Responses
- Never expose sensitive details (DB errors hidden)
- Consistent error format with codes
- Development mode shows extra details

### 6. Payment Processing (Stripe)

#### Security Best Practices
- Never store credit card data (Stripe handles it)
- Webhook signature verification
- Payment session IDs for tracking
- Refund audit trail

#### Webhook Configuration
1. Add webhook endpoint in Stripe Dashboard
2. URL: `https://yourdomain.com/api/webhook`
3. Events: `charge.succeeded`, `charge.refunded`
4. Verify webhook signature (STRIPE_WEBHOOK_SECRET)

### 7. Monitoring & Logging

#### Key Metrics to Monitor
- Authentication success/failure rates
- API response times (target: <200ms)
- Database connection pool usage
- Session validity and cleanup
- Stripe webhook success rates
- Email delivery rates

#### Recommended Services
- Sentry for error tracking (optional - env: SENTRY_DSN)
- Upstash Redis for rate limiting
- Vercel Analytics for performance metrics
- Database monitoring via Neon dashboard

### 8. Deployment Steps (to Vercel)

```bash
# 1. Push code to GitHub
git add .
git commit -m "Production deployment"
git push origin main

# 2. In Vercel Dashboard
# - Connect GitHub repository
# - Add environment variables (see Environment Setup above)
# - Deploy

# 3. Database Migration
npm run db:migrate -- --name production_deployment
```

### 9. Post-Deployment Verification

```bash
# Check health endpoint
curl https://yourdomain.com/api/health

# Verify database connection
# - Try logging in
# - Check /dashboard shows user data
# - Place test order

# Test email delivery
# - Complete registration
# - Check verification email received

# Test payments
# - Use Stripe test card: 4242 4242 4242 4242
# - Complete checkout flow
```

### 10. Monitoring After Launch

#### Daily Checks
- Error logs in Sentry/console
- Failed payment processing
- Email delivery issues
- Database connectivity

#### Weekly Reviews
- Auth success/failure trends
- Most common API errors
- Performance metrics
- Storage usage growth

#### Monthly Maintenance
- Review audit logs for suspicious activity
- Update dependencies for security patches
- Database backup verification
- Cost analysis (Stripe, Neon, etc.)

---

## Critical Files & Their Role

### Authentication
- `lib/auth.ts` - Core auth functions, session management
- `lib/auth-config.ts` - NextAuth configuration (Google OAuth)
- `middleware.ts` - Route protection and security headers
- `app/api/auth/*` - Auth API endpoints

### Database
- `prisma/schema.prisma` - Data model and relationships
- `lib/prisma.ts` - Prisma client singleton
- `prisma/seed.ts` - Database initialization

### API Security
- `lib/errors.ts` - Error handling and API responses
- `lib/validations.ts` - Zod schemas for input validation
- `lib/rate-limit.ts` - Rate limiting logic

### Payment Processing
- `lib/stripe.ts` - Stripe client initialization
- `app/api/checkout/route.ts` - Checkout session creation
- `app/api/webhook/route.ts` - Stripe webhook handler

---

## Troubleshooting

### Build Issues
- Clear `.next` folder: `rm -rf .next`
- Regenerate Prisma client: `npm run db:generate`
- Check NODE_ENV is not 'production' during development

### Database Connection
- Verify DATABASE_URL and DIRECT_URL in environment
- Connection string must end with `?sslmode=require`
- Test via: `prisma db execute --stdin`

### Authentication Failures
- Check session-token cookie is httpOnly
- Verify SESSION_EXPIRY_DAYS hasn't been reached
- Look for rate limit blocks in logs

### Stripe Integration
- Webhook endpoints need STRIPE_WEBHOOK_SECRET
- Test cards: 4242 4242 4242 4242 (success)
- Verify signature before processing webhook

---

## Performance Optimization

### Database Optimization
- Indexes on frequently queried fields (email, userId)
- Connection pooling via Neon adapter
- Query optimization for large datasets

### API Response Caching
- Static pages pre-rendered at build time
- Dynamic routes cached where appropriate
- Use ISR (Incremental Static Regeneration) for products

### Frontend Optimization
- Image optimization via Next.js Image component
- Code splitting and lazy loading
- CSS minification via Tailwind

---

## Rollback Plan

If deployment causes critical issues:

```bash
# Revert to previous git commit
git revert HEAD
git push origin main

# Or use Vercel dashboard to redeploy previous build
# Settings > Deployments > Select previous version
```

---

## Support & Resources

- Neon Database: https://neon.tech/docs
- Prisma: https://www.prisma.io/docs
- Stripe: https://stripe.com/docs/api
- Next.js: https://nextjs.org/docs
- Vercel: https://vercel.com/docs
