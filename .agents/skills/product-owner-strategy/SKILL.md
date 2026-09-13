---
name: product-owner-strategy
description: >-
  Use this skill when evaluating product feasibility, assessing user value vs. technical effort,
  identifying UX friction and drop-off points, prioritizing feature backlogs (RICE, ICE, Kano),
  writing structured user stories with acceptance criteria, or proposing high-impact feature innovations
  and functional improvements for CV Studio.
---

# Product Owner & Product Strategy Specialist Skill

This skill guides product discovery, strategic backlog prioritization, user friction analysis, functional evaluation, and feature specification for **CV Studio (mi-cv-engine)**.

---

## 1. Core PO Philosophy & Product Vision

### Product Vision
CV Studio is a **local-first, privacy-respecting, high-conversion ATS resume studio** that empowers candidates to create tailored, ATS-compliant, beautifully designed resumes with zero cloud vendor lock-in or telemetry leaks.

### Product Pillars & Non-Negotiables
1. **Privacy & Local-First by Default**: All user data, master CVs, and keys stay in the browser/local machine. No telemetry, tracking, or unsolicited cloud synchronization.
2. **Zero Friction & High Velocity**: Reduce the time and cognitive load required to turn a job vacancy into a targeted, interview-winning resume from 60 minutes to < 3 minutes.
3. **ATS Truth & Integrity**: Tailor ruthlessly for ATS keyword matching without hallucinating credentials, companies, or fabricating fake experience.
4. **Visual & Print Fidelity**: What you see in the Studio Preview is pixel-for-pixel what prints to A4 PDF.
5. **International Accessibility**: 100% multilingual readiness across all supported locales (`en`, `es`, `de`, `fr`, `it`).

---

## 2. Feature Evaluation & Prioritization Frameworks

When analyzing a proposed feature or improvement, apply these structured frameworks:

### A. RICE Scoring Matrix
Calculate the RICE score to objectively stack-rank backlog initiatives:
$$\text{RICE Score} = \frac{\text{Reach} \times \text{Impact} \times \text{Confidence}}{\text{Effort}}$$

- **Reach (R)**: Number of users/sessions impacted per month (e.g. 100% of tailoring sessions vs 10% niche CLI users).
- **Impact (I)**:
  - `3` = Massive (Directly solves primary pain point or unlocks new core workflow).
  - `2` = High (Significantly accelerates workflow or improves match rate).
  - `1` = Medium (Noticeable quality-of-life improvement).
  - `0.5` = Low (Minor cosmetic or minor edge case).
  - `0.25` = Minimal.
- **Confidence (C)**:
  - `100%` (High) = Supported by clear user friction evidence or technical validation.
  - `80%` (Medium) = Strong hypothesis with minor unknowns.
  - `50%` (Low) = Speculative idea requiring proof-of-concept.
- **Effort (E)**: Estimated implementation cost in relative story points / effort tiers (e.g., 1 = half-day, 2 = 1-2 days, 3 = 3-5 days, 5 = 1+ weeks).

### B. Value vs. Effort Matrix
Categorize features into four quadrants:
1. **Quick Wins (High Value, Low Effort)**: Implement immediately (e.g., 1-click copy tailored markdown, quick keyword tag insertion, keyboard shortcuts).
2. **Strategic Bets (High Value, High Effort)**: Plan carefully and design modularly (e.g., AI Cover Letter Generator, LinkedIn profile importer, interactive diff/version comparator).
3. **Fill-Ins (Low Value, Low Effort)**: Bundle with related maintenance (e.g., extra color palette presets, additional minor UI tooltips).
4. **Money Pits / Deprioritize (Low Value, High Effort)**: Discard or reshape (e.g., heavy backend multi-tenant cloud sync, non-standard bespoke template builders).

### C. Kano Model Analysis
- **Must-Haves (Basic)**: A4 PDF export without layout breaks, accurate keyword extraction, strict privacy protection.
- **Performance (Linear)**: AI synthesis speed, ATS score calibration accuracy, template variety.
- **Delighters (Excitement)**: Real-time keyword gap highlighter, 1-click tailored cover letter, AI interview prep question generator based on CV + job vacancy.

---

## 3. User Friction & Drop-Off Analysis Protocol

Audit the user journey across the 5 core studio milestones to detect and eliminate friction:

```text
[1. Onboarding & Master Data] ──► [2. Target Job Input] ──► [3. AI Tailoring & Tuning] ──► [4. Preview & Customization] ──► [5. Export & Tracker]
```

### Key Friction Questions by Milestone:
1. **Master CV Onboarding**:
   - *Friction*: Is the user forced to manually format raw Markdown from scratch?
   - *Solutions*: Guided profile builder form, JSON Resume import, PDF/Word paste extractor, sample templates.
2. **Target Job Analysis**:
   - *Friction*: Does the user have to read the entire job post to know what keywords are missing?
   - *Solutions*: Auto-extracted keyword chips with 1-click toggle, required vs bonus skill classification.
3. **AI Tailoring**:
   - *Friction*: Does the user know what the AI changed or why? Is there anxiety over fabricated facts?
   - *Solutions*: Real-time diff visualizer, integrity audit badges, Google XYZ formula compliance score.
4. **Preview & Styling**:
   - *Friction*: Does the page break awkwardly across 2 pages? Is mobile preview difficult to read?
   - *Solutions*: Responsive auto-fit canvas zoom, visual A4 page-break guides, real-time font/spacing sliders.
5. **Export & Tracking**:
   - *Friction*: Does the user lose track of which CV was sent to which company?
   - *Solutions*: 1-click application history logger with company name, salary range, interview status, and snapshot markdown.

### Key Product Heuristics for Frictionless UI:
- **Zero Redundant Action Clutter (Single Canonical Home)**:
  - Never scatter duplicate triggers for the same action across multiple toolbars and menus. If an action already has a dedicated permanent home (e.g. "Mis Postulaciones" in the fixed bottom navigation bar, or "Sincronizar QR" in Step 1 Profile), omit it from general settings sheets to preserve cognitive focus and progressive disclosure.
- **Eradication of Placeholder / Wireframe Subtitles**:
  - Eliminate generic boilerplate subtitles that merely paraphrase the headline (e.g. "¿Cómo querés empezar tu perfil?" followed by "Elegí una opción para continuar"). Subtitles must either provide tangible decision-making value (e.g. duration or expected outcome) or be removed entirely to deliver a refined, confident product experience.
- **Single Touch Target per Choice in Mobile Workflows**:
  - Never fragment an onboarding choice into separate dropzones, internal nested buttons, or drag-and-drop text on touch screens. The entire row must serve as a single, tactile touch target that directly launches the file picker or next step.

---

## 4. Standard Feature Specification (PRD / User Story)

When defining a new feature or improvement, structure the proposal using this template:

```markdown
### 📌 Feature: [Feature Name]

#### 1. Problem Statement & User Pain
- **User Problem**: [Describe the specific pain, friction, or bottleneck]
- **Target Persona**: [Job seeker, Career switcher, Freelancer, International applicant]

#### 2. Value Proposition & Hypothesis
- **Hypothesis**: By providing [Solution], users will achieve [Outcome], reducing friction in [Workflow Step].
- **Prioritization Score**: RICE Score: `XX` (R: X, I: X, C: X%, E: X) | Category: [Quick Win / Strategic Bet]

#### 3. User Stories & Acceptance Criteria
- **User Story**: *As a [user type], I want to [action/capability], so that [tangible benefit].*

**Acceptance Criteria (Gherkin / Checklist)**:
- [ ] **Given** [initial state / context]
- [ ] **When** [user performs action]
- [ ] **Then** [expected system response / outcome]

#### 4. Technical Feasibility & Constraints Checklist
- [ ] **Local-First / Privacy**: No external backend leaks; persists in browser storage/Zustand slice.
- [ ] **Design System Compliance**: Strict use of MUI theme tokens, `RADIUS_TOKENS.full` on buttons/chips, responsive `xs`/`sm`/`md` layouts.
- [ ] **i18n Parity**: All new UI strings localized across 5 languages (`en`, `es`, `de`, `fr`, `it`).
- [ ] **Performance**: Minimal re-renders, lightweight bundle impact, instant UI response.

#### 5. Success Metrics / KPIs
- [e.g., Reduction in tailoring time from 4 mins to 90 seconds]
- [e.g., Increase in user ATS match score by +15 points]
```

---

## 5. Proactive Feature Ideation & Innovation Radar

When acting as Product Owner, proactively evaluate and propose high-impact features from the CV Studio Innovation Radar:

1. **Cover Letter Synthesizer**: 1-click generation of a matching, tailored cover letter using the same master data + job post context.
2. **Smart Diff & Version Comparator**: Visual split-view highlighting additions, omissions, and reformulated bullet points between Master CV and Tailored CV.
3. **Interactive ATS Gap Checklist**: Interactive checklist in the preview screen allowing users to check off required skills with 1-click insertion into the CV summary or experience section.
4. **Interview Prep Generator**: AI-powered interview question simulator based on the tailored CV and target job description (e.g. "Explain how you achieved X at Company Y").
5. **Multi-Format Importer/Exporter**: Import from JSON Resume, export to Plain Text ATS format, Markdown, or clean DOCX.
6. **Smart Tone & Length Presets**: Quick toggles for "Concise (1-Page Strict)", "Technical / Senior", "Executive / Leadership", or "Academic / Extended".
