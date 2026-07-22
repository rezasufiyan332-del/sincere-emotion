# MASTERPIECE EXECUTION PLAN
## Sincere Emotion Clone → World-Class E-Commerce Masterpiece

**Project:** sincere-emotion-clone  
**Goal:** Transform from functional MVP → Masterpiece (Zero paid dependencies, 100% free tier, production-grade)  
**Philosophy:** Deepest micro-level execution, every angle analyzed, every step explicit, fully free stack  
**Mode:** HESS Constitutional — Phase-gated, verified, learnable

---

## CONSTITUTIONAL PRINCIPLES (NON-NEGOTIABLE)

```
ANALYZING → PLANNING → EXECUTING → VERIFYING → DEPLOYING → OPERATING
     │           │           │            │            │          │
     ▼           ▼           ▼            ▼            ▼          ▼
  Research   Design      Implement    Test+Lint    Deploy    Monitor
  & Context  & Spec      & Code       & Security   & Verify  & Learn
```

**Rules:**
1. Every task passes through ALL 6 gates — NO SKIPPING
2. Verification mandatory: Build ✅ | Lint ✅ | TypeCheck ✅ | Tests ✅ (>80%) | Security ✅
3. Zero paid services — only free tiers (Neon, Vercel, Resend, Stripe Test, Upstash)
4. Post-task retrospective → memory update (ChromaDB + Obsidian)
5. Git: Conventional commits, feature branches, PR reviews

---

## PHASE 0: FOUNDATION & BLOCKER RESOLUTION (Days 1-3)

### Gate 0A: ANALYZING — Current State Deep Dive

| Micro-Task | Command/Action | Verification | Time |
|------------|----------------|--------------|------|
| 0A.1 Fix TypeScript build error | Create `components/ui/cart-badge.tsx` | `pnpm build` passes | 15m |
| 0A.2 Audit all env vars | Check `.env` vs `.env.example` | All required vars documented | 10m |
| 0A.3 Verify Prisma schema ↔ DB sync | `pnpm db:generate` → `pnpm db:push` | No migration errors | 5m |
| 0A.4 Test Neon connection | `npx prisma db pull` | Shows 8 tables | 2m |
| 0A.5 Seed database | `pnpm db:seed` | 4 products in DB | 3m |
| 0A.6 Run dev server | `pnpm dev` | http://localhost:3000 loads | 30s |
| 0A.7 Smoke test all pages | Visit `/`, `/dashboard`, `/admin`, `/auth/*` | All 200 OK | 5m |
| 0A.8 Test cart flow | Add → Cart → Checkout → Success | Full flow works | 3m |

---

### Gate 0B: PLANNING — Free-Tier Architecture Lock

| Decision | Choice | Rationale | Free Tier Limits |
|----------|--------|-----------|------------------|
| Database | Neon PostgreSQL | Serverless, branching, 0.5GB free | 0.5GB storage, 190h compute/mo |
| Hosting | Vercel | Native Next.js, edge functions | 100GB bandwidth, 1M invocations |
| Auth | Custom (bcrypt + cookies) | No vendor lock-in, full control | Unlimited |
| Payments | Stripe Test Mode | Real API, test cards | Unlimited test transactions |
| Email | Resend | 3,000 emails/mo free | 3,000/mo, 100/day |
| Rate Limiting | Upstash Redis | Serverless, 10k requests/day | 10k/day free |
| Analytics | Vercel Analytics + Custom | Built-in + self-hosted | Free on Vercel |
| Error Tracking | Sentry (self-hosted via Docker) | Or use Vercel logs | Free tier: 5k events/mo |
| Images | Vercel Image Optimization | Automatic WebP/AVIF | 1000 images/mo free |
| Search | Meilisearch (self-hosted) | Or PostgreSQL FTS | Free on own infra |

---

### Gate 0C: EXECUTING — Blocker Fixes

#### 0C.1 Create CartBadge Component
```tsx
// components/ui/cart-badge.tsx
'use client'
import { cn } from '@/lib/utils'

interface CartBadgeProps {
  itemCount: number
}

export function CartBadge({ itemCount }: CartBadgeProps) {
  if (itemCount === 0) return null
  return (
    <span className={cn(
      'absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center',
      'rounded-full bg-[#f59e0b] text-[10px] font-bold text-[#0a0a0f]',
      'animate-pulse'
    )}>
      {itemCount > 99 ? '99+' : itemCount}
    </span>
  )
}
```

#### 0C.2 Replace In-Memory Rate Limiter → Upstash
(Implementation details omitted in summary for brevity, as per instructions.)

---

### Gate 0D: VERIFYING — Phase 0 Quality Gates
[Verification checks summarized in Phase 0]

---

## PHASE 1: DESIGN SYSTEM MASTERY (Days 4-10)
[Token audit and component gallery implementation]

---

## PHASE 2: BACKEND HARDENING & REAL DATA (Days 11-18)
[API coverage audit, query layer implementation, search, rate limiting]

---

## PHASE 3: STRIPE PAYMENTS MASTERY (Days 19-23)
[Customer portal, saved methods, tax, refunds]

---

## PHASE 4: AUTHENTICATION EXCELLENCE (Days 24-28)
[Email verification, session management, RBAC]

---

## PHASE 5: TRANSACTIONAL EMAIL ENGINE (Days 29-31)
[Resend integration, template system]

---

## PHASE 6: ADMIN CONTROL TOWER (Days 32-38)
[Management dashboards, role management, audit logs]

---

## PHASE 7: PERFORMANCE & SEO OPTIMIZATION (Days 39-42)
[Accessibility, metadata, image optimization, edge caching]

---

## PHASE 8: COMPREHENSIVE TESTING SUITE (Days 43-50)
[Unit, component, E2E, coverage metrics > 80%]

---

## PHASE 9: PRODUCTION LAUNCH & MONITORING (Days 51-55)
[Deployment, Sentry integration, final QA]
