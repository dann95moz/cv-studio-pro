# 🚀 CV Studio & Tailor Engine (v1.0)

<div align="center">

[![React 19](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![TypeScript 5.7](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite 6](https://img.shields.io/badge/Vite-6.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![Material UI 9](https://img.shields.io/badge/MUI-v9-007FFF?style=for-the-badge&logo=mui&logoColor=white)](https://mui.com)
[![i18n](https://img.shields.io/badge/i18n-5%20Languages-10B981?style=for-the-badge&logo=i18next&logoColor=white)](#-internationalization-i18n---5-locales)
[![Privacy](https://img.shields.io/badge/Privacy-100%25%20Local--First-8B5CF6?style=for-the-badge&logo=shield&logoColor=white)](#-core-capabilities--feature-matrix)
[![License: MIT](https://img.shields.io/badge/License-MIT-F59E0B?style=for-the-badge)](LICENSE)

<p align="center">
  <strong>Multiply your interviews by tailoring your resume in seconds.</strong><br>
  An intelligent, local-first ATS resume studio designed to tailor career histories to target job openings with quantifiable Google XYZ-formula bullets, real-time quality audits, in-place live hot editing, an integrated Kanban job tracker, and pixel-perfect 1-page A4 PDF exports.
</p>

[✨ Live Features](#-core-capabilities--feature-matrix) • [🏛️ Architecture](#️-system-architecture) • [🚀 Quick Start](#-quick-start--usage) • [🎨 Templates & Themes](#-visual-themes-reference-7) • [🌐 Internationalization](#-internationalization-i18n---5-locales) • [📦 Deployment](#-cloud-deployment-vercel)

</div>

---

## 🌟 Why CV Studio?

Traditional resume builders lock your data in proprietary cloud databases, charge recurring subscriptions, and produce generic resumes that fail automated **Applicant Tracking Systems (ATS)** screening.

**CV Studio** is engineered as a privacy-respecting, local-first power tool for engineers, leaders, and ambitious professionals:
- 🔒 **100% Privacy & Local-First:** Your data, master profile, API keys, and job applications never leave your browser or local machine.
- 🎯 **ATS Integrity & Zero Hallucinations:** Strictly preserves the candidate's single source of truth (SSOT). Adapts phrasing and highlights relevant skills without fabricating fake credentials.
- ⚡ **Sub-Second Tailoring:** Transform a job vacancy into an ATS-calibrated, interview-winning resume in < 60 seconds.
- 📄 **What You See Is What Prints:** Visual A4/Letter page boundary guides, dynamic pixel measurement, and 1-click **Magic Auto-Fit** ensure your resume never splits awkwardly across 2 pages.

---

## ✨ Core Capabilities & Feature Matrix

| Feature | Description | Status |
| :--- | :--- | :---: |
| 🗂️ **Local PDF & File Importer** | 100% client-side parser that extracts career history from PDF, .md, or .txt directly in-browser. 
| 🧙 **3-Step Guided Wizard** | Visual guided profile form + raw Markdown editor with real-time bi-directional synchronization. 
| 🤖 **Multi-Provider AI Strategies** | Supports Local AI (Ollama/LM Studio), Google Gemini, Groq, OpenAI (GPT-4o/o3-mini), Anthropic Claude, & OpenRouter. 
| ✍️ **Live Hot Editing & Selection Bubble** | Click any bullet or text directly on the rendered A4 canvas to edit, format (`Ctrl+B`, `Ctrl+I`, highlight), or regenerate with AI. 
| 📊 **Interactive Kanban Pipeline** | Full recruitment pipeline board (Wishlist, Applied, Interview, Offer) with version linking, metrics & analytics. 
| 🔍 **ATS  Gap Audit Engine** | 6-dimension scoring matrix (1-10), Google XYZ formula compliance, keyword cloud, and 1-click action levers. 
| 🎨 **7 Engineered ATS Templates** | 7 layout themes (Modern Tech, Executive, Minimal ATS, Two-Column, Designer, Formal Legal, Academic Research). 
| 🌈 **10 Curated Palettes + Custom HEX** | WCAG AA compliant color themes with dark/light mode and custom brand color picker. 
| 🌐 **5-Language Internationalization** | Complete multilingual UI with instant locale switching (`English`, `Español`, `Deutsch`, `Français`, `Italiano`). 
| 🖨️ **Dual PDF Export Engine** | Direct 1-click in-browser vector PDF generator + headless Puppeteer CLI with sub-millimeter margins. 

---

## 🏛️ System Architecture

The engine is engineered around strict software design principles (**SOLID**, **DRY**, **Separation of Concerns**) and clean layer decoupling:

```mermaid
flowchart TB
    subgraph SSOT["📦 Single Source of Truth & Inputs"]
        MD["master-data.md<br>(Read-Only Career History)"]
        TJ["target-job.md<br>(Target Job Posting)"]
        RL["rules.md<br>(ATS & Google XYZ Formula Rules)"]
    end

    subgraph STATE["🧠 Sliced State Management (Zustand v5)"]
        STORE["useResumeStore<br>(cvDataSlice | designSlice | aiSlice | uiSlice | historySlice)"]
    end

    subgraph AI["🤖 AI Synthesis & Tailoring Layer (Strategy Pattern)"]
        PB["Prompt Builder<br>(ATS Directives & Keyword Mapping)"]
        STRAT{"Provider Strategy"}
        GEM["Google Gemini<br>(Flash / Pro)"]
        GROQ["Groq<br>(Llama 3.3 / DeepSeek R1)"]
        OAI["OpenAI / Claude / OpenRouter"]
        OLLAMA["Local Ollama / LM Studio"]
        REGEN["Single-Bullet AI Regenerator<br>(Zero-Hallucination Micro-Agent)"]
    end

    subgraph CORE["⚙️ Core Parser & AST Transformation"]
        PARSER["Markdown AST Parser & Slot Mapper"]
        CVAST["Normalized CVData AST<br>(Header, Summary, Experience, Skills, Education)"]
        AUDIT["Quality & ATS Audit Engine<br>(6 Dimensions, 1-10 Scores & Gap Analysis)"]
    end

    subgraph RENDER["🎨 Design System & Visual Renderer"]
        REGISTRY["Template Registry (7 ATS Templates)"]
        PALETTES["Palette System (10 Curated + Custom HEX)"]
        TYPO["Typography & Density Tokens<br>(Inter, Outfit, Serif, Mono | Compact, Standard, Spacious)"]
        ICONS["Zero-Dependency Vector SVGs<br>(Lucide/Feather Style for ATS)"]
        LIVE["Live Hot Edit Provider & Selection Bubble"]
        CVR["CVRenderer Component<br>(Dynamic CSS Custom Properties)"]
    end

    subgraph TARGETS["🖥️ Dual Export Targets & Pipeline"]
        STUDIO["CV Studio Web (Vite + React 19)<br>3-Step Wizard, Split Editor & Live A4 Height Calibration"]
        KANBAN["Recruitment Kanban Pipeline<br>Drag & Drop Applications Tracker"]
        PUPPETEER["Headless CLI SSR (Puppeteer)<br>Static Markup + Auto-Fit Scaling + Vector PDF"]
    end

    MD & TJ & RL --> STORE
    STORE --> PB
    PB --> STRAT
    STRAT --> GEM & GROQ & OAI & OLLAMA
    GEM & GROQ & OAI & OLLAMA --> STORE
    STORE --> PARSER
    PARSER --> CVAST
    CVAST --> AUDIT
    CVAST --> LIVE
    LIVE --> CVR
    REGISTRY & PALETTES & TYPO & ICONS --> CVR
    CVR --> STUDIO
    CVR --> PUPPETEER
    STUDIO --> KANBAN
    STUDIO --> REGEN
```

---

## 📁 Project Directory Layout

```text
customs-CVs/
├── master-data.md               # 🗂️ Master career dossier (SSOT: Projects, metrics, stack)
├── rules.md                     # 📜 ATS rules, STAR/Google XYZ formula & writing constraints
├── target-job.md                # 🎯 Active job posting requirements and company details
├── outputs/                     # 📤 Generated tailored CVs, Gap Reports, and vector PDFs
├── prompts/                     # 🤖 Standalone AI prompt templates
├── src/
│   ├── app/                     # Main Application root & layout orchestrator (App.tsx)
│   ├── cli/                     # CLI orchestrator and interactive wizard (index.ts, commands)
│   ├── components/              # Universal React components (CVRenderer, Icons, Slots)
│   │   ├── landing/             # Welcome & Onboarding view
│   │   ├── feedback/            # User feedback modal & rating system
│   │   ├── slots/               # Reusable atomic CV content slots (Header, Experience, etc.)
│   │   └── studio/              # CV Studio Web UI
│   │       ├── ai/              # Quick AI configuration & model testing modals
│   │       ├── audit/           # Quality audit cards & interactive improvement modals
│   │       ├── common/          # Shared components (LanguageSelector, StudioNavbar, etc.)
│   │       ├── history/         # Kanban board, application cards, statistics header
│   │       ├── preview/         # Preview toolbar, nav rail, side panels & live edit bubble
│   │       ├── profile/         # Guided profile assistant form & delegated section cards
│   │       ├── settings/        # AI credentials, synthesis rules & community credits
│   │       └── tailor/          # AI model selector & page budget selector
│   ├── constants/               # Curated palettes, typography tokens, and project links
│   ├── core/                    # Core business logic & services
│   │   ├── ai/                  # AI Strategy pattern, prompt builder & bullet regenerator
│   │   ├── parser/              # Markdown AST parser, serializer & slot mapper
│   │   ├── audit-engine.ts      # 6-dimension quality & ATS audit evaluator
│   │   ├── pdf-extractor.ts     # 100% Client-side local PDF parser (pdfjs)
│   │   ├── browser-pdf-generator.ts # In-browser direct vector PDF generator (html2canvas/jsPDF)
│   │   └── cli-pdf-generator.ts     # CLI & Node.js Puppeteer PDF compiler
│   ├── hooks/                   # Custom stateful hooks (useFileUploader, usePrintPdf, etc.)
│   ├── i18n/                    # i18next configuration & 5 JSON locale directories
│   ├── store/                   # Sliced Zustand store (cvData, design, ai, ui, history)
│   ├── styles/                  # Clean vanilla CSS design tokens (tokens, preview, print)
│   ├── templates/               # 7 Professional CV visual templates & template registry
│   ├── theme/                   # Centralized design tokens (colors, dimensions, MUI theme)
│   └── types/                   # Strict TypeScript interfaces & shared domain types
├── index.html                   # CV Studio Web entry point with OpenGraph SEO meta
├── package.json                 # Scripts and dependency declarations
└── vite.config.ts               # Vite server configuration
```

---

## 🚀 Quick Start & Usage

### 1. Interactive Studio Web UI (Recommended)

Start the local development server with instant Hot Module Reloading (HMR):
```bash
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

### 2. Interactive Terminal Wizard (CLI)

Prefer the terminal? Run the guided interactive CLI:
```bash
npm run wizard
# or
npm run cli
```
Guides you step-by-step through selecting markdown files from `outputs/`, applying templates/palettes, and tailoring resumes.

---

### 3. Compile PDFs via Headless CLI (`npm run pdf`)

```bash
# Export the most recent CV in outputs/ to PDF
npm run pdf

# Export a specific CV file
npm run pdf outputs/CV_Jane_Doe_Stripe.md

# Export with custom template and palette flags
npm run pdf outputs/CV_Jane_Doe_Stripe.md -- --theme modern-tech --palette modern-indigo --font outfit --density compact --pages 1

# Batch-compile all Markdown files in outputs/ to PDF
npm run pdf:all
```

---

### 4. AI Tailoring via Terminal (`npm run generate`)

```bash
# Standard tailoring for a company
npm run generate "Stripe"

# Tailoring with custom 1-page budget and styling parameters
npm run generate "Google" -- --theme executive --palette corporate-blue --pages 1
```

---

### 5. Automated Quality & ATS Audit (`npm run audit`)

Evaluates the CV against recruiter standards, Google XYZ formula, action verbs, and keyword coverage:
```bash
npm run audit outputs/CV_Jane_Doe_Stripe.md
```
Outputs an executive 1-10 scorecard and gap report in `outputs/`.

---

## 🎨 Visual Themes Reference (7)

| Theme ID | Category | Layout | Recommended Roles | Description |
| :--- | :--- | :--- | :--- | :--- |
| `modern-tech` | Tech & Engineering | Single Column | Software Engineers, Cloud/DevOps, Tech Leads | Stripe/Linear inspired style with monospace badges & dense stack |
| `executive` | Leadership | Two Column (Banner) | C-Level, VPs, Directors, Management Consultants | Corporate Navy top banner with initials monogram box |
| `minimal-ats` | Universal ATS | ATS Linear | Workday, Taleo, Greenhouse enterprise screening | Zero-distraction linear monochrome for 100% parser accuracy |
| `two-column` | General Tech | Two Column (Sidebar) | Full-Stack Devs, Architects, Technical Leaders | High-contrast right sidebar with geometric monogram card |
| `designer-uiux` | Creative & Product | Two Column (Pastel) | Product Designers, UI/UX Specialists, Frontend Devs | Soft tinted card header with editorial asymmetric flow |
| `formal-legal` | Legal & Finance | Single Column (Serif) | Attorneys, Corporate Counsel, Investment Bankers | Prestigious classical serif typography and formal division rules |
| `academic-research` | Science & R&D | Two Column (Dual-Tone)| Research Scientists, PhDs, Engineering Managers | Dark charcoal sidebar with avatar badge and research layout |

---

## 🌈 Curated Color Palettes Reference (10)

All palettes meet **WCAG AA contrast** requirements and ensure body copy remains deep charcoal/black (`#0f172a` / `#1e293b`) for 100% ATS readability:

| Palette ID | Primary HEX | Best Suited Industry / Vibe |
| :--- | :--- | :--- |
| `corporate-blue` | `#2563eb` | Tech, Enterprise, Engineering, Cloud & Security (Default) |
| `accent-teal` | `#0d9488` | Fintech, Product Management, Growth & High-growth Startups |
| `editorial-black` | `#0f172a` | High-contrast monochrome, timeless, executive & 100% ATS clean |
| `minimal-slate` | `#64748b` | Refined cool steel neutral grey for minimalist technical roles |
| `modern-indigo` | `#6366f1` | Linear / Stripe inspired electric accent for modern SaaS |
| `executive-burgundy`| `#9f1239` | Leadership, Corporate Strategy, Private Equity & Legal |
| `forest-green` | `#16a34a` | Climate tech, Sustainability, Life Sciences & Healthcare |
| `warm-amber` | `#d97706` | Client Success, Operations, Media, Consulting & Architecture |
| `creative-coral` | `#ea580c` | UI/UX Design, Content Strategy & Consumer Product teams |
| `custom` | `--color "#HEX"` | Any bespoke company brand color passed via CLI or UI |

---

## 🌐 Internationalization (i18n) - 5 Locales

CV Studio includes built-in internationalization across **5 major languages** with 100% key synchronization across all 10 domain namespaces:

- 🇺🇸 **English (`en`)** — Default / Baseline
- 🇪🇸 **Español (`es`)**
- 🇩🇪 **Deutsch (`de`)**
- 🇫🇷 **Français (`fr`)**
- 🇮🇹 **Italiano (`it`)**

Locale is automatically detected from the browser and can be toggled in real time via the navbar language selector.

---

## 📦 Cloud Deployment (Vercel)

Deploy CV Studio to **Vercel** with zero server costs:

1. Push your repository to GitHub.
2. Open [Vercel Dashboard](https://vercel.com) and click **"Add New Project"**.
3. Select your repository. Vercel automatically detects the build configuration:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Click **Deploy**. Your studio will be live with instant global CDN delivery.

---

## 🛡️ Code Quality & Verification

Run strict TypeScript typechecking:
```bash
npm run typecheck
```

Build the optimized Vite production bundle:
```bash
npm run build
```

Bundle the standalone CLI executable:
```bash
npm run build:cli
```

---

## 📄 License

MIT License © 2026 Daniel Corredor. Built with passion for engineers, designers, and leaders crafting bespoke career narratives.`, `target-job.md`, `.env`, and git configs, publishing only the compiled binary and themes.*

---

## 🛡️ Quality & Verification

Verify the entire codebase anytime using TypeScript's strict type checker:
```bash
npm run typecheck
```
Build the production web bundle:
```bash
npm run build
```

---

## 📄 License
MIT License. Built for engineers and leaders crafting bespoke career narratives.
