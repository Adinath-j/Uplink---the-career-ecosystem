# UPLINK — Official Public Landing Page

> **The official public-facing marketing and product presentation website for UPLINK: Unified Campus Career & Professional Ecosystem.**

---

## 1. Overview

The `landing/` directory contains the complete, production-ready public landing page for **UPLINK**. Built as an independent Next.js 15 application, it showcases the UPLINK platform, communicates its core value proposition to students, recruiters, and educational institutions, demonstrates verified mobile application capabilities, and provides a direct entry point for downloading the Android APK.

### Key Principles

- **Editorial + Immersive Hybrid:** Balances professional engineering rigor (inspired by Linear, Stripe, and Apple) with purposeful, high-performance micro-interactions.
- **Product Truthfulness:** Every showcased screen, metric, and feature directly mirrors the actual React Native student mobile application implementation. No fabricated testimonials, fake student counts, or mock partnership logos.
- **Autonomous Architecture:** Completely decoupled from the `mobile/` React Native workspace. It maintains its own `package.json`, TypeScript configuration, Tailwind configuration, and build pipeline.

---

## 2. Technology Stack

| Layer | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Framework** | [Next.js](https://nextjs.org/) (App Router) | `15.1.7` | Hybrid static generation, Edge runtime OG generation, route optimization |
| **UI Library** | [React](https://react.dev/) | `^19.0.0` | Declarative UI components & server components |
| **Language** | [TypeScript](https://www.typescriptlang.org/) | `^5.7.3` | Strict type safety across components and config |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) | `^3.4.17` | Utility-first styling with custom design tokens (`uplink` palette) |
| **Iconography** | [Lucide React](https://lucide.dev/) | `^0.475.0` | Consistent 24px/20px geometric outline vector icons |
| **Smooth Scroll** | [Lenis](https://lenis.darkroom.engineering/) | `^1.1.20` | Native-feeling momentum scroll with accessibility fallbacks |
| **Motion** | [GSAP](https://gsap.com/) & [@gsap/react](https://gsap.com/resources/React/) | `^3.12.7` | High-fidelity scroll-triggered entrance choreography |
| **Typography** | `next/font/google` (Manrope) | Auto | Variable font loading with zero layout shift (CLS: 0) |

---

## 3. Directory & Component Architecture

```text
landing/
├── public/
│   ├── brand/
│   │   ├── logo.svg              # Primary brand mark with wordmark
│   │   └── logo-icon.svg         # Geometric circuit U-icon
│   ├── images/
│   │   ├── hero-circuit.svg      # Subtle background circuit topology
│   │   └── grid-pattern.svg      # Architectural grid overlay
│   └── screenshots/              # Faithful vector mockups of mobile screens
│       ├── discover-feed.svg     # Discover header, categories, featured card, notices
│       ├── explore-jobs.svg      # Explore Opportunities, pills, verified job cards
│       ├── qa-feed.svg           # Q&A feed, 4 sub-tabs, Same-Doubt pill
│       └── mentors-feed.svg      # Find Mentors, domain chips, mentor cards
├── src/
│   ├── app/
│   │   ├── globals.css           # Tailwind directives, Lenis styles, reduced-motion rules
│   │   ├── layout.tsx            # Root layout: metadata, viewport, JSON-LD Schema.org, Header/Footer
│   │   ├── opengraph-image.tsx   # Dynamic 1200x630 Edge-rendered OpenGraph social card
│   │   ├── page.tsx              # Assembles all 8 narrative sections in order
│   │   ├── robots.ts             # Search engine crawling directives
│   │   └── sitemap.ts            # XML sitemap generation
│   ├── components/
│   │   ├── animation/
│   │   │   └── SmoothScrollProvider.tsx # Lenis + GSAP ticker unified loop with motion check
│   │   ├── navigation/
│   │   │   ├── Header.tsx        # Sticky header with glassmorphism and mobile drawer
│   │   │   └── Footer.tsx        # Structured footer with ecosystem, tech, and legal links
│   │   ├── product/
│   │   │   ├── PhoneMockup.tsx   # Realistic titanium smartphone bezel with status bar
│   │   │   └── ProductShowcaseInteractive.tsx # 4-screen interactive switcher
│   │   └── ui/
│   │       ├── Badge.tsx         # Pill badge with color variants
│   │       ├── Button.tsx        # Accessible button with micro-interactions
│   │       ├── Container.tsx     # Centered responsive container (max-w-7xl)
│   │       └── SectionHeading.tsx# Reusable section title, eyebrow, and description
│   ├── config/
│   │   └── site.ts               # Centralized navigation, features, ecosystem, and tech specs
│   ├── lib/
│   │   ├── gsap.ts               # SSR-safe GSAP and ScrollTrigger registration
│   │   └── utils.ts              # Class name merging utility (clsx + tailwind-merge)
│   └── sections/
│       ├── Hero.tsx              # Section 1: Headline, primary CTAs, live phone preview
│       ├── Problem.tsx           # Section 2: 5 campus placement friction points + solution
│       ├── Ecosystem.tsx         # Section 3: 4 core pillars (Discovery, Track, Learn, Guide)
│       ├── Features.tsx          # Section 4: 8 verified mobile capabilities with badges
│       ├── ProductShowcase.tsx   # Section 5: Interactive 4-screen mobile walkthrough
│       ├── HowItWorks.tsx        # Section 6: 4-step student onboarding journey
│       ├── Technology.tsx        # Section 7: Mobile & planned backend architecture cards
│       └── FinalCTA.tsx          # Section 8: Download APK call to action with fallback
├── .env.example                  # Environment variable template
├── next.config.ts                # Next.js compiler & image optimization config
├── postcss.config.js             # PostCSS Tailwind processor
├── tailwind.config.ts            # Theme tokens, colors, shadows, and animations
└── tsconfig.json                 # Strict TypeScript configuration with `@/*` aliases
```

---

## 4. Narrative Sections

The single-page experience guides visitors through 8 structured narrative sections:

1. **Hero (`#hero`):**
   - Brand eyebrow: *"The Unified Campus Career Ecosystem"*.
   - Headline: *"Where Campus Talent Connects With Real Opportunities."*
   - Clear calls-to-action: "Download Android App" (smooth anchor or APK link) and "Explore Platform".
   - Device hero showcasing the **Discover Home** screen inside a photorealistic smartphone bezel with floating status indicators.
2. **The Campus Problem (`#problem`):**
   - Highlights 5 real pain points: Disorganized Notices, Opaque Applications, Academic Silos, Gatekept Mentorship, and Resume Friction.
   - Contrasting solution card demonstrating UPLINK's unified approach.
3. **The Four Pillars / Ecosystem (`#ecosystem`):**
   - **Discover:** Verified internships, campus notices, hackathons, and certifications.
   - **Track:** 5-stage transparent application lifecycle pipeline.
   - **Learn:** Structured academic Q&A with peer verification and "Same-Doubt" ranking.
   - **Guide:** Verified alumni directory with 1-on-1 mentorship session requests.
4. **Verified Capabilities (`#features`):**
   - 8 product feature cards detailing real mobile implementations: Dual-Mode Applications, Strict 4-Tab Bottom Bar, Instant Query Search, Same-Doubt Escalation, Profile Completion Engine, Work-Mode Filtering, In-Memory Caching, and Privacy-First Mentorship.
5. **Interactive Product Showcase (`#showcase`):**
   - An interactive tabbed interface allowing visitors to switch between the 4 core mobile screens:
     1. **Discover Feed:** Campus announcements and featured opportunities.
     2. **Explore Opportunities:** Filterable listings across 10 career categories.
     3. **Campus Q&A:** Topic-tagged peer knowledge repository.
     4. **Find Mentors:** Industry seniors and alumni directory.
6. **How It Works (`#how-it-works`):**
   - 4-step walkthrough: Profile Setup → Verified Discovery → One-Tap Application → Knowledge & Mentorship.
7. **Technology & Engineering (`#technology`):**
   - Transparent breakdown of current and planned architecture:
     - **Mobile Client:** React Native 0.88, React 19, TypeScript, Zustand, React Navigation, React Native Paper, Lucide Icons.
     - **Planned Core Backend:** Spring Boot 3, Java 17+, PostgreSQL (Supabase), Spring Security with stateless JWT, Flyway migrations.
     - **API Boundary:** Strict OpenAPI contracts with seamless mock-to-live client switching.
8. **Final CTA & APK Access (`#download`):**
   - Direct download button for the standalone Android APK.
   - Displays dynamic file size and architecture badge (`Universal APK (arm64-v8a / armeabi-v7a)`).
   - Graceful fallback: If no APK URL is configured, switches to a disabled *"Android Release Coming Soon"* state with release instructions.

---

## 5. Getting Started & Local Development

### Prerequisites

- **Node.js:** `v18.18.0` or higher (Node 20+ recommended)
- **Package Manager:** `npm` (v9+)

### Installation

Navigate to the `landing/` directory and install dependencies:

```powershell
cd C:\dev\Uplink\landing
npm install
```

### Environment Configuration

Copy the example environment file:

```powershell
cp .env.example .env.local
```

Configure the environment variables in `.env.local`:

```env
# Base URL for canonical tags, sitemap, and Open Graph previews
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Direct URL to the hosted Android APK file (optional)
# Example: https://github.com/your-username/uplink/releases/download/v1.0.0/app-release.apk
NEXT_PUBLIC_ANDROID_DOWNLOAD_URL=
```

### Running the Development Server

```powershell
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. The page supports Fast Refresh for instant UI updates.

### Code Quality & Verification

Run ESLint:

```powershell
npm run lint
```

Run TypeScript compilation check:

```powershell
npx tsc --noEmit
```

### Production Build & Local Preview

```powershell
# Create an optimized static build
npm run build

# Start the production server locally
npm run start
```

---

## 6. Animation & Interaction Architecture

### Smooth Scrolling (Lenis)

Lenis provides smooth momentum scrolling across desktop browsers. It is integrated via `SmoothScrollProvider.tsx`:

- **Unified Ticker Loop:** Lenis is tied directly into GSAP's `gsap.ticker.add()` callback, ensuring there are no competing `requestAnimationFrame` loops or scroll jitter.
- **Accessibility:** Automatically checks `window.matchMedia('(prefers-reduced-motion: reduce)')`. When reduced motion is preferred, Lenis is completely bypassed, and animations fallback to instantaneous transitions.

### GSAP ScrollTrigger Integration

- All entrance animations use GSAP `ScrollTrigger` with `once: true` to prevent repetitive layout calculations during upward scrolling.
- Elements utilize CSS `will-change: transform, opacity` during transitions and automatically clean up after completion to minimize GPU memory retention.

---

## 7. SEO, Metadata & Core Web Vitals

### Search Engine Optimization (SEO)

- **Semantic HTML5:** Strict hierarchy (`<header>`, `<main>`, `<section>`, `<article>`, `<nav>`, `<footer>`) with descriptive `aria-label` attributes and accessible focus rings.
- **Metadata:** Dynamic metadata defined in `layout.tsx` with title templates, comprehensive description, keywords, Open Graph, and Twitter card tags.
- **Open Graph Image:** Dynamically generated via Next.js Edge runtime in `src/app/opengraph-image.tsx` (1200x630 pixel social banner with brand typography and geometric icon).
- **Crawlers:** Automatically generated `robots.txt` (`src/app/robots.ts`) and `sitemap.xml` (`src/app/sitemap.ts`).
- **Structured Data:** Embedded Schema.org JSON-LD structured data (`SoftwareApplication` + `Organization`) for rich search engine snippets.

### Core Web Vitals Performance

- **Zero Cumulative Layout Shift (CLS):** Phone mockups use a fixed aspect ratio container (`aspect-[9/19.5]`) with explicit min-height to guarantee zero layout shifting while SVG vector assets load.
- **Font Optimization:** `Manrope` is loaded via `next/font/google` using the `variable` font configuration, self-hosted at build time with CSS `font-display: swap`.
- **First Load JS:** Optimized to only ~125 kB total first-load JavaScript across shared chunks.

---

## 8. Android APK Distribution Guide

The landing page features a download button in the navigation header, hero section, and final CTA section.

### How the Download Button Operates

1. **When `NEXT_PUBLIC_ANDROID_DOWNLOAD_URL` is set:**
   - The button renders as an active link pointing to the APK download file.
   - Displays a download icon and subtitle: *"Download Android APK (v1.0.0)"*.
   - Automatically sets `download` and `rel="noopener noreferrer"` attributes.
2. **When `NEXT_PUBLIC_ANDROID_DOWNLOAD_URL` is empty (default):**
   - The button automatically displays a fallback state: *"Android Release Coming Soon"*.
   - Clicking smoothly scrolls the visitor to the `#download` section where release notes and building instructions are provided.

### Recommended APK Hosting Options

1. **GitHub Releases (Recommended):**
   - Create a GitHub Release in your repository.
   - Attach the compiled signed release APK: `mobile/android/app/build/outputs/apk/release/app-release.apk`.
   - Copy the direct release asset URL and set it as `NEXT_PUBLIC_ANDROID_DOWNLOAD_URL`.
2. **Public Cloud Storage (Supabase / S3 / Cloudflare R2):**
   - Upload the APK to a public storage bucket.
   - Configure public read permissions and set the public CDN link in `.env.local`.

---

## 9. Deployment Guide

### Vercel (Recommended Zero-Config Deployment)

1. Push your code to your Git provider (GitHub, GitLab, or Bitbucket).
2. Import the project into the [Vercel Dashboard](https://vercel.com/new).
3. Set the **Root Directory** to `landing`.
4. In **Environment Variables**, add:
   - `NEXT_PUBLIC_SITE_URL`: Your custom production domain (e.g. `https://uplink.campus.edu`).
   - `NEXT_PUBLIC_ANDROID_DOWNLOAD_URL`: The direct link to your hosted release APK.
5. Click **Deploy**. Vercel will automatically compile, optimize, and deploy the application to its global Edge network.

### Docker / Standalone Node.js Server

To deploy as a standalone Node server:

1. In `landing/next.config.ts`, set `output: 'standalone'`.
2. Build the project: `npm run build`.
3. Copy `.next/standalone`, `.next/static`, and `public/` to your target host.
4. Run with `node server.js`.

