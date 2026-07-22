# Sincere Emotion - Complete Production Roadmap

## Vision
Real e-commerce business — digital healing guides for attachment styles & relationship psychology. Stripe payments, real backend, professional unique design, full test coverage.

---

## PHASE 0: Cleanup & Foundation (Day 1-3)

### Goal: Clean slate, working dev environment

### Tasks:
- [ ] Delete 14 dead component files (~2,062 lines)
  - `header.tsx`, `hero.tsx`, `products.tsx`, `testimonials.tsx`, `faq.tsx`
  - `trust-section.tsx`, `email-signup.tsx`
  - `modern-hero.tsx`, `modern-products.tsx`, `modern-testimonials.tsx`, `modern-faq.tsx`
  - `masterpiece-hero.tsx`, `masterpiece-products.tsx`, `masterpiece-testimonials.tsx`
- [ ] Remove 6 unused npm packages (three, gsap, lottie-react, @react-three/*, @floating-ui)
- [ ] Consolidate product data — single source of truth in `lib/products.ts`
- [ ] Consolidate testimonials data — single source in `lib/testimonials.ts`
- [ ] Consolidate FAQ data — single source in `lib/faq.ts`
- [ ] Fix `next.config.mjs` — remove `ignoreBuildErrors` and `unoptimized: true`
- [ ] Fix order ID collision — use UUID instead of `Date.now()`
- [ ] Fix copyright year to dynamic `new Date().getFullYear()`
- [ ] Remove hardcoded false stats (50K+, 4.9★, etc.)
- [ ] Delete `100X_UPGRADE_SUMMARY.md`, `LEVEL_10_MASTERPIECE.md`, `MODERNIZATION.md`, `PSYCHOLOGICAL_REDESIGN.md`, `MICRO_POLISH_FINAL.md`
- [ ] Fix `useInViewport` hook — object dependency bug
- [ ] Setup `.env.local` with required env vars template
- [ ] Run `pnpm build` — must pass with 0 errors

### Deliverable: Clean, minimal codebase that builds without errors

---

## PHASE 1: Design System & Full Redesign (Day 4-10)

### Goal: Professional, unique design — not AI-generated look

### 1A. Design System (Day 4-5)
- [ ] Create proper design token system in `globals.css`
  - Color palette (primary, secondary, accent, neutrals, semantic)
  - Typography scale (display, h1-h6, body, caption)
  - Spacing scale (4px base unit)
  - Border radius tokens
  - Shadow system
  - Animation timing tokens
- [ ] Fix glass utility — dark mode support
- [ ] Remove unused CSS custom properties
- [ ] Create `components/ui/` properly:
  - Button (variants: primary, secondary, ghost, outline, destructive)
  - Input (with label, error state)
  - Card (elevated, flat, interactive)
  - Modal/Dialog
  - Badge
  - Toast
  - Skeleton loader
  - Select/Dropdown
  - Tabs

### 1B. Page Redesign (Day 6-9)
- [ ] **Header**: Sticky, minimal, professional
  - Logo (real branding, not placeholder)
  - Navigation with active states
  - Cart icon with count badge
  - Mobile hamburger menu
  - No glassmorphism (looks AI-generated)
- [ ] **Hero**: Clean, impactful, conversion-focused
  - Strong headline + subheadline
  - Single clear CTA
  - Social proof (real metrics or remove)
  - No floating orbs or mouse parallax
- [ ] **Products**: Grid with real product images
  - Clean card design
  - Consistent pricing display
  - "Add to Cart" with clear feedback
  - No 3D tilt effects
- [ ] **Testimonials**: Authentic, believable
  - Real-looking reviews (or get real ones)
  - No fabricated metrics
  - Simple carousel or grid
- [ ] **FAQ**: Clean accordion
  - No glassmorphism
  - Proper keyboard navigation
- [ ] **CTA**: Conversion-focused
  - Clear value proposition
  - Single action
- [ ] **Footer**: Professional
  - Real links (About, Contact, Privacy, Terms)
  - Social media links
  - Newsletter signup (real)
  - Dynamic copyright year

### 1C. Responsive Design (Day 10)
- [ ] Mobile-first approach
- [ ] Test on 320px, 768px, 1024px, 1440px breakpoints
- [ ] Touch-friendly interactions
- [ ] Proper spacing on all screen sizes

### Deliverable: Unique, professional design system + all pages redesigned

---

## PHASE 2: Backend - API Routes + Database (Day 11-18)

### Goal: Real data persistence, server-side logic

### 2A. Database Setup (Day 11-12)
- [ ] Choose database:
  - **Option A**: Neon PostgreSQL (recommended — serverless, free tier)
  - **Option B**: Supabase (PostgreSQL + auth built-in)
  - **Option C**: PlanetScale (MySQL, serverless)
- [ ] Design schema:
  ```
  users: id, email, name, password_hash, created_at
  products: id, name, description, price, original_price, image, features, created_at
  orders: id, user_id, items, total, status, payment_id, created_at
  email_subscribers: id, email, source, subscribed_at
  ```
- [ ] Setup Prisma ORM
- [ ] Run migrations
- [ ] Seed database with products

### 2B. API Routes (Day 13-16)
- [ ] `POST /api/products` — List products (with pagination)
- [ ] `GET /api/products/[id]` — Get single product
- [ ] `POST /api/orders` — Create order
- [ ] `GET /api/orders/[id]` — Get order details
- [ ] `POST /api/newsletter` — Subscribe to newsletter
- [ ] `GET /api/health` — Health check endpoint

### 2C. Data Layer (Day 17-18)
- [ ] Create `lib/db.ts` — Prisma client singleton
- [ ] Create `lib/validations.ts` — Zod schemas for all inputs
- [ ] Create `lib/errors.ts` — Custom error classes
- [ ] Create middleware for error handling
- [ ] Add rate limiting to API routes
- [ ] Remove localStorage stores (replace with API calls)

### Deliverable: Working API routes with database persistence

---

## PHASE 3: Stripe Payment Integration (Day 19-23)

### Goal: Real payment processing

### Tasks:
- [ ] Setup Stripe account + get API keys
- [ ] Install `stripe` and `@stripe/stripe-js`
- [ ] Create Stripe product + price in dashboard
- [ ] `POST /api/checkout` — Create Stripe Checkout Session
- [ ] `POST /api/webhook` — Handle Stripe webhooks
  - `checkout.session.completed` → Mark order paid
  - `payment_intent.payment_failed` → Handle failure
- [ ] Create checkout page (`/checkout`)
- [ ] Payment success page (`/checkout/success`)
- [ ] Payment failure page (`/checkout/failure`)
- [ ] Remove fake payment form (checkout-modal.tsx)
- [ ] Add Stripe Elements for card input (if doing embedded)
- [ ] Test with Stripe test cards

### Deliverable: Working Stripe payment flow

---

## PHASE 4: Authentication & User Accounts (Day 24-28)

### Goal: User signup/login, order history

### Tasks:
- [ ] Install `next-auth` (Auth.js) or `clerk`
- [ ] Setup auth providers:
  - Email + Password (with bcrypt)
  - Google OAuth (optional)
- [ ] Create auth pages:
  - `/auth/login`
  - `/auth/register`
  - `/auth/forgot-password`
- [ ] Create user dashboard:
  - `/dashboard` — Order history
  - `/dashboard/profile` — Edit profile
- [ ] Protect routes (middleware)
- [ ] Link orders to users
- [ ] Session management

### Deliverable: Working authentication system

---

## PHASE 5: Email System + Notifications (Day 29-32)

### Goal: Transactional emails

### Tasks:
- [ ] Choose email provider:
  - **Resend** (recommended — simple, modern)
  - **SendGrid** (popular, free tier)
  - **AWS SES** (cheapest at scale)
- [ ] Create email templates:
  - Order confirmation
  - Welcome email (after signup)
  - Newsletter welcome
- [ ] Send emails on:
  - Successful purchase
  - User registration
  - Newsletter signup
- [ ] Add email preferences (unsubscribe)

### Deliverable: Working email notifications

---

## PHASE 6: Admin Dashboard (Day 33-38)

### Goal: Manage products, orders, customers

### Tasks:
- [ ] Create admin layout with sidebar
- [ ] `/admin` — Dashboard overview (stats, charts)
- [ ] `/admin/products` — CRUD products
- [ ] `/admin/orders` — View/manage orders
- [ ] `/admin/customers` — View customers
- [ ] `/admin/newsletter` — View subscribers
- [ ] Role-based access (admin only)
- [ ] Protect admin routes

### Deliverable: Working admin panel

---

## PHASE 7: SEO, Performance & Accessibility (Day 39-42)

### Goal: Production-grade quality

### Tasks:
- [ ] Add `generateMetadata()` to all pages
- [ ] Create `app/sitemap.ts`
- [ ] Create `app/robots.ts`
- [ ] Add Open Graph images
- [ ] Add structured data (JSON-LD for products)
- [ ] Optimize images (WebP, proper sizes)
- [ ] Add loading.tsx and error.tsx for all routes
- [ ] Fix all accessibility issues:
  - Add aria-labels to all buttons
  - Add id/htmlFor associations on forms
  - Keyboard navigation for all interactive elements
  - Screen reader testing
- [ ] Add `prefers-reduced-motion` support
- [ ] Lighthouse score target: 90+ all categories

### Deliverable: SEO-optimized, accessible, performant site

---

## PHASE 8: Testing - Full Coverage (Day 43-50)

### Goal: 80%+ test coverage, confidence in code

### Tasks:
- [ ] Setup Vitest + React Testing Library
- [ ] Unit Tests:
  - All Zustand stores (cart, order, email, ui)
  - Validation functions
  - Utility functions
  - Price calculations
- [ ] Component Tests:
  - All UI components (Button, Input, Card, etc.)
  - All page components (Hero, Products, etc.)
  - Cart sidebar interactions
  - Checkout flow (mocked)
- [ ] Integration Tests:
  - API routes (with mocked DB)
  - Auth flow
  - Payment flow (with Stripe test mode)
- [ ] E2E Tests (Playwright):
  - Full purchase flow
  - User registration + login
  - Admin dashboard access
- [ ] Setup CI (GitHub Actions):
  - Run tests on push
  - Lint on push
  - Type check on push

### Deliverable: Comprehensive test suite

---

## PHASE 9: Production Deploy & Monitoring (Day 51-55)

### Goal: Live, monitored, production-ready

### Tasks:
- [ ] Setup Vercel project
- [ ] Configure environment variables
- [ ] Setup custom domain
- [ ] Configure SSL
- [ ] Setup Vercel Analytics
- [ ] Setup Sentry (error tracking)
- [ ] Setup uptime monitoring
- [ ] Configure caching strategy
- [ ] Load testing (basic)
- [ ] Security audit
- [ ] Final QA pass

### Deliverable: Live production site

---

## Environment Variables Required

```env
# Database
DATABASE_URL=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Auth
NEXTAUTH_SECRET=
NEXTAUTH_URL=

# Email
RESEND_API_KEY=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Tech Stack (Final)

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, React 19, TypeScript |
| Styling | Tailwind CSS v4 |
| Animations | Framer Motion (minimal, purposeful) |
| State | Zustand (client) + Server Components |
| Database | PostgreSQL (Neon) |
| ORM | Prisma |
| Payments | Stripe |
| Auth | NextAuth.js (Auth.js) |
| Email | Resend |
| Testing | Vitest + RTL + Playwright |
| Deploy | Vercel |
| Monitoring | Vercel Analytics + Sentry |

---

## Success Criteria

- [ ] Lighthouse: 90+ all categories
- [ ] Test Coverage: 80%+
- [ ] Zero TypeScript errors
- [ ] All pages responsive (320px → 1440px)
- [ ] Stripe test payments working
- [ ] Email delivery working
- [ ] Admin dashboard functional
- [ ] SEO score: 90+
- [ ] WCAG 2.1 AA compliance

---

## Estimated Timeline: 55 working days (~8 weeks)

| Phase | Days | Cumulative |
|-------|------|------------|
| Phase 0: Cleanup | 3 | 3 |
| Phase 1: Design | 7 | 10 |
| Phase 2: Backend | 8 | 18 |
| Phase 3: Payments | 5 | 23 |
| Phase 4: Auth | 5 | 28 |
| Phase 5: Email | 4 | 32 |
| Phase 6: Admin | 6 | 38 |
| Phase 7: SEO/Perf | 4 | 42 |
| Phase 8: Testing | 8 | 50 |
| Phase 9: Deploy | 5 | 55 |
