# Architecture — PUBLYQ
> Full-Stack Architecture Document | Version 1.0
> Author: Aria (Architect Agent) + Telmo Cerveira
> Date: 2026-03-12
> Based on: PRD-PUBLYQ v2.0
> Status: APPROVED — Ready for implementation

---

## 1. Architecture Overview

### System Summary
PUBLYQ é um SaaS de criação de conteúdo para Instagram, focado em PMEs portuguesas. O MVP tem 3 features: Brand DNA, Voice DNA e Carrossel Instagram.

### Architecture Style
**Monolith Modular** — Next.js App Router com separação clara por módulos. Não precisa de microserviços no MVP. Escala verticalmente no Vercel.

### Key Architectural Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Monolith vs Microservices | Monolith | MVP para 5 testers, sem necessidade de escala distribuída |
| SSR vs SPA | SSR (Next.js App Router) | SEO para landing, performance, padrão provado |
| Database | Supabase (PostgreSQL) | Já configurado, grátis, tipagem forte |
| Auth | Clerk | Já configurado, social login, webhooks |
| AI | Claude API (Anthropic) | Melhor voice matching, contexto longo |
| Deploy | Vercel | Next.js nativo, preview deploys, edge |
| State | Server-first (Supabase) | Clerk unsafeMetadata é frágil — Supabase é source of truth |
| Reuse | OPB Crew patterns | 80%+ código reutilizável, padrões testados em produção |

---

## 2. System Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                     PUBLYQ (publyq.ai)                  │
│                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌────────────────┐  │
│  │  Landing     │  │  Auth       │  │  Dashboard     │  │
│  │  Page        │  │  (Clerk)    │  │  (App)         │  │
│  │  /           │  │  /sign-in   │  │  /dashboard    │  │
│  │              │  │  /sign-up   │  │  /brand-dna    │  │
│  │  Waitlist    │  │             │  │  /voice-dna    │  │
│  │  Form        │  │             │  │  /carousel     │  │
│  └──────┬───────┘  └──────┬──────┘  └──────┬─────────┘  │
│         │                 │                │             │
│  ───────┴─────────────────┴────────────────┴──────────   │
│                    API Layer (Route Handlers)             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │/api/     │ │/api/     │ │/api/     │ │/api/     │   │
│  │waitlist  │ │brand-dna │ │voice-dna │ │carousel  │   │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘   │
│       │             │            │             │         │
│  ─────┴─────────────┴────────────┴─────────────┴──────   │
│                    Shared Services                        │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │Rate      │ │Validation│ │Audit     │ │Auth      │   │
│  │Limiter   │ │(Zod)     │ │Logger    │ │(Clerk)   │   │
│  └────┬─────┘ └──────────┘ └────┬─────┘ └──────────┘   │
│       │                         │                        │
│  ─────┴─────────────────────────┴─────────────────────   │
│                    External Services                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                │
│  │Supabase  │ │Claude    │ │Unsplash  │                │
│  │(Postgres)│ │API       │ │API       │                │
│  └──────────┘ └──────────┘ └──────────┘                │
└─────────────────────────────────────────────────────────┘
         │                              │
    ┌────┴────┐                    ┌────┴────┐
    │ Vercel  │                    │Clerk    │
    │ Deploy  │                    │Auth     │
    └─────────┘                    └─────────┘
```

---

## 3. Project Structure

```
publyq/
├── app/
│   ├── layout.tsx                 ← Root layout (PT, Space Grotesk)
│   ├── page.tsx                   ← Landing page (✅ existe)
│   ├── globals.css                ← Brand colors + Tailwind (✅ existe)
│   │
│   ├── (auth)/
│   │   ├── sign-in/[[...sign-in]]/page.tsx
│   │   └── sign-up/[[...sign-up]]/page.tsx
│   │
│   ├── (dashboard)/
│   │   ├── layout.tsx             ← Dashboard layout (sidebar + nav)
│   │   ├── dashboard/page.tsx     ← Hub central (progresso + atalhos)
│   │   ├── brand-dna/page.tsx     ← Step 1: Brand DNA
│   │   ├── voice-dna/page.tsx     ← Step 2: Voice DNA
│   │   └── carousel/page.tsx      ← Step 3: Carrossel Instagram
│   │
│   └── api/
│       ├── waitlist/route.ts      ← POST waitlist (✅ existe)
│       ├── brand-dna/route.ts     ← POST/GET brand DNA
│       ├── voice-dna/route.ts     ← POST/GET voice DNA
│       ├── carousel/route.ts      ← POST generate carousel
│       ├── unsplash/route.ts      ← GET proxy Unsplash
│       └── webhooks/
│           └── clerk/route.ts     ← Sync user data
│
├── components/
│   ├── landing/
│   │   └── WaitlistForm.tsx       ← Form da waitlist
│   ├── brand-dna/
│   │   └── BrandDNAAssessment.tsx ← UI do Brand DNA (questionário)
│   ├── voice-dna/
│   │   └── VoiceDNAAssessment.tsx ← UI do Voice DNA (8 perguntas)
│   ├── carousel/
│   │   ├── CarouselGenerator.tsx  ← UI principal (4 passos)
│   │   ├── SlidePreview.tsx       ← Preview de cada slide
│   │   └── UnsplashPicker.tsx     ← Busca de imagens
│   ├── dashboard/
│   │   └── ProgressPipeline.tsx   ← Pipeline visual (3 passos)
│   └── ui/
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Card.tsx
│       └── Loading.tsx
│
├── lib/
│   ├── supabase/
│   │   ├── server.ts              ← createServerClient (service_role)
│   │   ├── user-profiles.ts       ← CRUD profiles + progress
│   │   ├── rate-limit.ts          ← DB-based rate limiter
│   │   ├── audit.ts               ← Fire-and-forget audit log
│   │   └── types.ts               ← TypeScript types
│   ├── validators/
│   │   └── index.ts               ← All Zod schemas
│   ├── prompts/
│   │   ├── brand-dna.ts           ← System prompt Brand DNA
│   │   ├── voice-dna.ts           ← System prompt Voice DNA
│   │   └── carousel.ts            ← System prompt Carrossel (247 linhas base)
│   ├── config/
│   │   └── admins.ts              ← SUPER_ADMINS + BETA_USERS
│   └── utils/
│       └── helpers.ts             ← Utility functions
│
├── middleware.ts                   ← Clerk auth + beta access
├── tailwind.config.ts
├── next.config.ts
├── tsconfig.json
├── package.json
├── .env.local                      ← Secrets (Supabase, Clerk, Claude, Unsplash)
└── .gitignore
```

---

## 4. Data Architecture

### Database Schema (Supabase PostgreSQL)

```sql
-- ========================================
-- TABLE 1: user_profiles (source of truth)
-- ========================================
CREATE TABLE user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clerk_id TEXT UNIQUE NOT NULL,          -- user_xxxxxxx
  email TEXT NOT NULL,
  name TEXT,

  -- Pipeline progress
  brand_dna_complete BOOLEAN DEFAULT FALSE,
  voice_dna_complete BOOLEAN DEFAULT FALSE,

  -- Brand colors (for carousel)
  brand_bg TEXT DEFAULT '#0A0E1A',
  brand_surface TEXT DEFAULT '#111827',
  brand_accent TEXT DEFAULT '#BFD64B',
  brand_text TEXT DEFAULT '#F0ECE4',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- TABLE 2: brand_profiles (Brand DNA data)
-- ========================================
CREATE TABLE brand_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL,           -- clerk_id

  -- Brand DNA fields
  brand_name TEXT,
  mission TEXT,
  values JSONB,                           -- ["valor1", "valor2", ...]
  target_audience TEXT,
  positioning TEXT,
  personality JSONB,                      -- {tone, energy, formality}
  differentiator TEXT,

  -- AI-generated profile
  brand_dna_output JSONB,                 -- Full AI analysis

  version INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- TABLE 3: voice_profiles (Voice DNA data)
-- ========================================
CREATE TABLE voice_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL,           -- clerk_id

  -- User answers (8 questions)
  answers JSONB NOT NULL,

  -- AI-generated Voice DNA
  voice_dna JSONB,                        -- {arquetipo, tom, vocabulario, frases, regras}

  version INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- TABLE 4: generated_carousels
-- ========================================
CREATE TABLE generated_carousels (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,

  topic TEXT NOT NULL,
  slides JSONB NOT NULL,                  -- [{headline, body, imagePrompt}]
  keywords TEXT[],
  palette JSONB,                          -- {bg, surface, accent, text}

  status TEXT DEFAULT 'draft',            -- draft, exported, published
  exported_at TIMESTAMPTZ,

  deleted_at TIMESTAMPTZ,                 -- Soft delete
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- TABLE 5: waitlist (✅ já existe)
-- ========================================
-- waitlist (id, email, nome, created_at)

-- ========================================
-- TABLE 6: rate_limits
-- ========================================
CREATE TABLE rate_limits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- TABLE 7: audit_log
-- ========================================
CREATE TABLE audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT,
  action TEXT NOT NULL,
  metadata JSONB,
  success BOOLEAN DEFAULT TRUE,
  error_msg TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- RLS: Block all direct access
-- ========================================
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_carousels ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "block_direct_access" ON user_profiles USING (false);
CREATE POLICY "block_direct_access" ON brand_profiles USING (false);
CREATE POLICY "block_direct_access" ON voice_profiles USING (false);
CREATE POLICY "block_direct_access" ON generated_carousels USING (false);
CREATE POLICY "block_direct_access" ON rate_limits USING (false);
CREATE POLICY "block_direct_access" ON audit_log USING (false);

-- ========================================
-- INDEXES
-- ========================================
CREATE INDEX idx_user_profiles_clerk ON user_profiles(clerk_id);
CREATE INDEX idx_brand_profiles_user ON brand_profiles(user_id);
CREATE INDEX idx_voice_profiles_user ON voice_profiles(user_id);
CREATE INDEX idx_carousels_user ON generated_carousels(user_id);
CREATE INDEX idx_carousels_user_status ON generated_carousels(user_id, status) WHERE deleted_at IS NULL;
CREATE INDEX idx_rate_limits_user_endpoint ON rate_limits(user_id, endpoint, created_at);
```

### Data Flow

```
USER → Clerk Auth → middleware.ts (gate)
  │
  ├── Brand DNA:
  │   User answers → POST /api/brand-dna → Claude API → brand_profiles
  │   → user_profiles.brand_dna_complete = true
  │
  ├── Voice DNA:
  │   User answers → POST /api/voice-dna → Claude API → voice_profiles
  │   → user_profiles.voice_dna_complete = true
  │
  └── Carousel:
      REQUIRES: brand_dna_complete AND voice_dna_complete
      User topic → POST /api/carousel
        → Fetch brand_profiles + voice_profiles
        → Claude API (brand + voice + topic → slides)
        → generated_carousels
        → Client renders → html-to-image → ZIP export
```

---

## 5. API Design

### Routes

| Method | Route | Auth | Rate Limit | Description |
|--------|-------|------|------------|-------------|
| POST | `/api/waitlist` | Public | 5/day (IP) | Add email to waitlist |
| POST | `/api/brand-dna` | Clerk | 5/day | Generate/save Brand DNA |
| GET | `/api/brand-dna` | Clerk | - | Get user's Brand DNA |
| POST | `/api/voice-dna` | Clerk | 5/day | Generate/save Voice DNA |
| GET | `/api/voice-dna` | Clerk | - | Get user's Voice DNA |
| POST | `/api/carousel` | Clerk | 20/day | Generate carousel |
| GET | `/api/carousel` | Clerk | - | List user's carousels |
| GET | `/api/unsplash` | Clerk | 50/day | Search Unsplash images |
| POST | `/api/webhooks/clerk` | Webhook | - | Sync user on sign-up |

### API Pattern (all routes follow this)

```typescript
export async function POST(request: NextRequest) {
  // 1. Auth check
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // 2. Rate limit (DB-based, serverless-safe)
  const limit = await checkAndConsumeRateLimit(userId, "endpoint");
  if (!limit.allowed) return NextResponse.json(
    { error: "Rate limit exceeded", remaining: 0 }, { status: 429 }
  );

  // 3. Input validation (Zod v4)
  const body = await request.json();
  const result = Schema.safeParse(body);
  if (!result.success) return NextResponse.json(
    { error: result.error.issues[0].message }, { status: 400 }
  );

  try {
    // 4. Business logic
    const data = await processRequest(result.data, userId);

    // 5. Fire-and-forget: audit + persist
    logAudit({ userId, action: "endpoint_name", metadata: { ... } });

    return NextResponse.json({ data });
  } catch (error) {
    console.error("API error:", error);
    logAudit({ userId, action: "endpoint_name", success: false, errorMsg: String(error) });
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
```

---

## 6. Frontend Architecture

### Component Hierarchy

```
RootLayout (layout.tsx)
  ├── LandingPage (page.tsx) — public
  │   └── WaitlistForm
  │
  ├── AuthPages (Clerk)
  │   ├── SignIn
  │   └── SignUp
  │
  └── DashboardLayout (dashboard/layout.tsx) — protected
      ├── Sidebar (nav between steps)
      ├── ProgressPipeline (visual progress bar)
      │
      ├── DashboardPage — hub with progress + shortcuts
      │
      ├── BrandDNAPage
      │   └── BrandDNAAssessment (multi-step form)
      │       ├── Step indicators
      │       ├── Question cards
      │       ├── AI processing state
      │       └── Result display
      │
      ├── VoiceDNAPage
      │   └── VoiceDNAAssessment (8 questions)
      │       ├── Question flow
      │       ├── AI generation
      │       └── Voice profile card
      │
      └── CarouselPage
          └── CarouselGenerator (4-step wizard)
              ├── Step 1: Topic input
              ├── Step 2: AI generates slides
              ├── Step 3: Image selection (Unsplash)
              ├── Step 4: Colors + Export
              └── SlidePreview (per slide)
```

### State Management
- **Server state:** Supabase (source of truth)
- **Client state:** React useState/useReducer (form state only)
- **No Redux, no Zustand** — overkill para MVP
- **Pattern:** Fetch on page load → local state for editing → save to server on submit

### Pipeline Gating (client-side)

```typescript
// Dashboard checks progress from Supabase
const progress = await getUserProgress(userId);

// Gate access
if (!progress.brand_dna_complete) {
  // Show: "Complete Brand DNA first"
  // Only Brand DNA page accessible
}
if (!progress.voice_dna_complete) {
  // Show: "Complete Voice DNA first"
  // Brand DNA done, Voice DNA accessible, Carousel locked
}
if (progress.voice_dna_complete) {
  // All pages accessible
  // Carousel generator enabled
}
```

---

## 7. Security Architecture

### Layers

```
Layer 1: Clerk (Authentication)
  → Email/password + Google sign-in
  → JWT tokens
  → Middleware protection on all /dashboard routes

Layer 2: Middleware (Authorization)
  → Beta access check (BETA_USERS array)
  → Redirect unauthorized to /#waitlist

Layer 3: API Routes (Authorization + Validation)
  → auth() check on every protected route
  → Zod validation on all inputs
  → Rate limiting per user per endpoint

Layer 4: Supabase (Database)
  → RLS: USING(false) on all tables
  → service_role key server-only
  → All access through API routes

Layer 5: External APIs
  → Claude API key server-only
  → Unsplash key server-only
  → No secrets exposed to client
```

### Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
CLERK_WEBHOOK_SECRET=whsec_...

# AI
ANTHROPIC_API_KEY=sk-ant-...

# Unsplash
UNSPLASH_ACCESS_KEY=...

# URLs
NEXT_PUBLIC_APP_URL=https://publyq.ai
```

---

## 8. Performance Architecture

### Targets

| Metric | Target | How |
|--------|--------|-----|
| LCP (Largest Contentful Paint) | <2.5s | SSR + optimized fonts |
| FID (First Input Delay) | <100ms | Minimal client JS |
| CLS (Cumulative Layout Shift) | <0.1 | Fixed layouts, no layout shifts |
| Carousel generation | <60s | Streaming response + loading states |
| Page transitions | <300ms | Next.js prefetching |

### Optimization Strategy
1. **SSR for landing page** — Fast first paint, SEO
2. **Client components only where needed** — Forms, interactive elements
3. **Image optimization** — Next.js Image component for Unsplash images
4. **Font optimization** — next/font for Space Grotesk (no CLS)
5. **Lazy loading** — Carousel export (html-to-image + JSZip) loaded on demand

---

## 9. Deployment Architecture

```
GitHub (trcerveira/publyq)
  │
  ├── Push to master
  │   └── Vercel auto-deploy → publyq.ai (production)
  │
  ├── Push to any branch
  │   └── Vercel preview deploy → publyq-xxx.vercel.app
  │
  └── Environment
      ├── Production: publyq.ai (Vercel)
      ├── Preview: auto-generated URLs
      └── Local: localhost:3000
```

### Infrastructure
- **Hosting:** Vercel (serverless, Next.js native)
- **Database:** Supabase (shared instance with OPB Crew for now)
- **CDN:** Vercel Edge Network (automatic)
- **DNS:** publyq.ai → Vercel (A record + CNAME)
- **SSL:** Automatic via Vercel

---

## 10. Module Reuse Map (OPB Crew → PUBLYQ)

| OPB Crew File | PUBLYQ File | Reuse % | Changes |
|---------------|-------------|---------|---------|
| `components/voz-dna/VozDNAAssessment.tsx` | `components/voice-dna/VoiceDNAAssessment.tsx` | 90% | Rename PT→EN file, keep PT UI text |
| `app/api/voz-dna/route.ts` | `app/api/voice-dna/route.ts` | 85% | Adapt schema, same pattern |
| `components/machine/DesignMachine.tsx` | `components/carousel/CarouselGenerator.tsx` | 70% | Simplify UI, keep 4-step flow |
| `components/machine/SlidePreview.tsx` | `components/carousel/SlidePreview.tsx` | 95% | Minor style tweaks |
| `components/machine/UnsplashPicker.tsx` | `components/carousel/UnsplashPicker.tsx` | 100% | Copy as-is |
| `app/api/generate-carousel/route.ts` | `app/api/carousel/route.ts` | 80% | Adapt prompts, same validation |
| `lib/prompts/carousel-premium.ts` | `lib/prompts/carousel.ts` | 75% | Adapt for PUBLYQ brand context |
| `lib/supabase/server.ts` | `lib/supabase/server.ts` | 100% | Copy as-is |
| `lib/supabase/rate-limit.ts` | `lib/supabase/rate-limit.ts` | 100% | Copy as-is |
| `lib/supabase/audit.ts` | `lib/supabase/audit.ts` | 100% | Copy as-is |
| `lib/validators/index.ts` | `lib/validators/index.ts` | 60% | New schemas for PUBLYQ |
| `middleware.ts` | `middleware.ts` | 90% | Same pattern, different routes |
| `lib/config/admins.ts` | `lib/config/admins.ts` | 100% | Same users for now |
| `app/api/unsplash/route.ts` | `app/api/unsplash/route.ts` | 100% | Copy as-is |

**NEW files (não existem no OPB Crew):**
- `components/brand-dna/BrandDNAAssessment.tsx` — Novo questionário Brand DNA
- `app/api/brand-dna/route.ts` — Nova API Brand DNA
- `lib/prompts/brand-dna.ts` — Novo system prompt Brand DNA
- `components/dashboard/ProgressPipeline.tsx` — Pipeline visual 3 passos
- `app/(dashboard)/layout.tsx` — Dashboard layout com sidebar

---

## 11. Rate Limits

| Endpoint | Limit | Rationale |
|----------|-------|-----------|
| `brand-dna` | 5/day | AI-intensive, one-time setup |
| `voice-dna` | 5/day | AI-intensive, one-time setup |
| `carousel` | 20/day | Core feature, batch creation |
| `unsplash` | 50/day | Lightweight proxy |
| `waitlist` | 5/day (IP) | Public, spam prevention |

---

## 12. Error Handling Strategy

```
Client Error (4xx)
  → 400: Zod validation failure → show field-level errors
  → 401: Not authenticated → redirect /sign-in
  → 403: Not in beta → redirect /#waitlist
  → 409: Duplicate (waitlist) → show "já estás na lista"
  → 429: Rate limit → show "tenta amanhã" + remaining count

Server Error (5xx)
  → 500: Internal → show "erro interno, tenta novamente"
  → Log to audit_log (fire-and-forget)
  → Console.error for Vercel logs

AI Error (Claude API)
  → Timeout → retry once, then show error
  → Invalid response → validation + retry
  → Rate limit → queue or show "sistema ocupado"
```

---

## 13. Implementation Order (MVP)

```
DAY 1 (Tomorrow — 2026-03-13):
  ├── 1. Create Next.js project (fresh, not copy OPB Crew)
  ├── 2. Install deps (clerk, supabase, anthropic, tailwind)
  ├── 3. Copy shared libs (supabase/, validators/, config/)
  ├── 4. Setup Clerk auth (sign-in, sign-up, middleware)
  ├── 5. Create DB tables (Supabase SQL Editor)
  ├── 6. Brand DNA module (API + component)
  ├── 7. Voice DNA module (API + component — copy + adapt)
  ├── 8. Carousel module (API + component — copy + adapt)
  ├── 9. Dashboard with pipeline progress
  └── 10. Deploy to Vercel (publyq.ai)

WEEK 1-2 (Polish + Test):
  ├── Share with 5 testers
  ├── Collect feedback
  ├── Iterate (Kaizen!)
  └── Fix bugs
```

---

## 14. Constraints & Trade-offs

| Constraint | Trade-off | Acceptable Because |
|------------|-----------|-------------------|
| Same Supabase instance | Data isolation risk | Cost €0, MVP only, separate tables |
| No tests in MVP | Quality risk | 5 testers, manual testing, iterate fast |
| html-to-image for export | Lower quality than Figma | Works, ship now, upgrade later |
| No auto-publish | Manual copy-paste | MVP validates content quality first |
| Hardcoded beta list | Not scalable | 5 testers, upgrade when needed |
| No Kaizen Loop in MVP | Missing moat feature | Content quality first, Kaizen P1 |

---

*ARCH-PUBLYQ v1.0 — 2026-03-12*
*"Arquitectura simples para lançar amanhã."*
*— Aria, arquitetando o futuro*
