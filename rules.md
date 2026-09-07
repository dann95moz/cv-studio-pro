# 📋 CV Generation & Tailoring Rules (rules.md)

This document defines the strict styling, formatting, content, and ATS optimization rules that the AI synthesizer **must rigorously follow** when generating any tailored CV.

---

## 1. 🚫 What NOT To Do (Strict Constraints)

- **No Sensitive Personal Information:**
  - ❌ Do NOT include headshots or photos (unless legally and explicitly mandated in specific regional jurisdictions).
  - ❌ Do NOT include birth date, age, marital status, gender, nationality, or religion.
  - ❌ Do NOT include national ID or passport numbers (National ID, SSN, Passport Number).
  - ❌ Do NOT include full residential street addresses. Use only `City, Country`.
- **No Empty Clichés or Buzzword Fluff:**
  - ❌ Avoid unsupported adjectives: *"passionate worker"*, *"results-driven team player"*, *"dynamic out-of-the-box thinker"*, *"adaptive developer"*.
  - ❌ Replace all subjective claims with concrete engineering achievements, percentages, and metrics.
- **No Passive Duty Descriptions:**
  - ❌ Do NOT write passive job duty lists (*"Responsible for developing APIs"*). Use strong active impact verbs (*"Architected RESTful microservices..."*).
- **No Graphic Elements That Break ATS:**
  - ❌ Do NOT use complex nested tables, multi-column floating boxes, skill percentage progress bars (*"Python 80%"* is meaningless to recruiters and ATS), or icons in place of text.
- **No Emojis in Document Headings or Content (Professional Executive Standard):**
  - ❌ NEVER include emojis or informal pictograms (🎯, 🛠️, 💼, 🚀, 🎓, 🌐, etc.) in section titles, bullet points, or role headers.
  - ✅ All section headings must be clean, professional text adhering to ATS and executive standards (e.g. `## PROFESSIONAL SUMMARY`, `## TECHNICAL SKILLS`, `## PROFESSIONAL EXPERIENCE`, `## EDUCATION & CERTIFICATIONS`, `## LANGUAGES`).
- **No Redundant Sections:**
  - ❌ Do NOT include *"References available upon request"*.
  - ❌ Do NOT list high schools or secondary education if higher university education exists.
- **No Over-Padded Role Bullets (Strict 3–4 Limit, NEVER 5+):**
  - ❌ NEVER generate 5 or more bullets under any single role. Outputting 5+ bullets causes visual clutter, dilutes achievement impact, and violates the single-page budget.
  - ✅ Strictly limit every role to **ideally 3 high-impact bullets (maximum 4 only if distinct, critical, and irreplaceable quantifiable metrics exist)**.
- **No Technology Bolding in Summary:**
  - ❌ NEVER bold technology names, tools, or frameworks in the Professional Summary (e.g. write Angular, React, NgRx, RxJS in plain unbolded text).
  - ✅ Bold ONLY the closing 2–3 quantitative metrics and percentages in the summary.
- **No Dummy or Hallucinated Contact Links:**
  - ❌ NEVER output dummy placeholder URLs (such as `https://github.com/candidate-profile` or example domains). Include GitHub, LinkedIn, or Portfolio URLs ONLY when they explicitly exist in `master-data.md`; omit if absent.
- **No Raw Long URLs (Short Descriptive Hyperlink Labels Only):**
  - ❌ NEVER render raw, long, or naked URLs (e.g. `https://cv-studio-olive.vercel.app/` or `https://github.com/...`) as visible text in the CV.
  - ✅ ALWAYS format web links with short, clean, descriptive Markdown labels, exactly as done for `[LinkedIn](url)` and `[GitHub](url)` (e.g. `[Live Demo](url)`, `[GitHub](url)`, `[Repository](url)`, `[Portfolio](url)`).
- **Zero Hallucination & Seniority Integrity (Strict SSOT):**
  - ❌ NEVER invent companies, job roles, dates, technologies, metrics, or certifications that are not present in `master-data.md`.
  - ❌ NEVER inflate or alter the candidate's seniority level (Senior, Lead, Staff, Principal) in the header or experience entries to match a higher-level vacancy posting.
  If master-data.md contains fewer than 2 verifiable quantitative metrics for a given role, use the metrics available and rely on scope/scale qualifiers (team size, technologies owned, system criticality) instead of fabricating numbers. Never pad a bullet with an invented percentage to satisfy the format.

---

## 2. ✅ Mandatory Standards & Structure

### A. Content Budget & Visual Page Fit (A4 Full-Page Fill)
- **1-Page Target (Junior / Mid / Senior <6 years experience):**
  - Generate **ideally 3 high-impact bullets per role (maximum 4; NEVER 5 or more)**, prioritizing bullets with quantifiable metrics and direct alignment to `target-job.md`. Do not alter seniority level or job title from the source data under any circumstance.
  - Word budget: **420 to 480 total words** (filling 80% to 90% of an A4 sheet harmoniously).
  - Professional Summary: 3–4 impactful lines ending with concrete metrics.
  - Technical Skills: Exactly 3 strategic high-density categories.
  - Professional Experience: 2–3 roles with **ideally 3 bullets per role (max 4, never 5+)** (Google XYZ format).
  - Education & Certifications: University degrees and relevant verified certifications with issuer and year, formatted in a strict vertical column (one bullet per degree/certification). NEVER combine multiple certifications into a single inline line with pipes or commas. Select **strictly 3 to 5 (ideally 4) certifications** most relevant to `target-job.md`. ❌ NEVER output 6 or more certifications under any circumstance. Prioritize high-signal technical credentials and omit introductory/generic courses (e.g. basic Git or generic documentation courses) when higher-signal credentials exist.
  - Languages: Standardized proficiency levels (CEFR: Native, B2, C1, C2).
- **2-Page Target (Lead / Staff / Director +7 years experience):**
  - Professional Experience: 3–4 roles with **strictly 3 to 4 bullets per role (never 5+)**.
  - Word budget: **750 to 850 total words** completing 2 full pages.

### B. High-Impact Executive Summary (Zero-Fluff Rule)
- **Structure (3 to 4 lines maximum):**
  1. **Identity & Seniority:** `[Target Role Title] with [X]+ years of experience specialized in [Core Domain / Key Technologies].`
  2. **Technical Alignment:** Direct architectural connection addressing the core requirements in `target-job.md`.
  3. **Mandatory Closing Impact Metrics:** Must conclude with 2–3 verified quantitative metrics from `master-data.md` (e.g., *"Proven track record of cutting Jenkins CI/CD pipeline build times by 50%, reducing production runtime errors by 40% through TypeScript migrations, and accelerating feature delivery cycles by 35%."*).
  - **Summary Bolding Restriction:** Apply bold formatting only to the closing quantitative metrics in the summary — do not bold technology names or domain terms here, since they're already emphasized in the Technical Skills section below.

### C. Header & Contact Information (Headline Alignment Boundary)
- **Headline Alignment Boundary:** The headline subtitle under the candidate's name may incorporate domain/technology keywords from `target-job.md` (e.g., "Angular", "Front-End", "React") but must **NEVER copy a seniority qualifier (Senior/Lead/Staff/Principal)** from the job posting unless that exact qualifier appears in `master-data.md`'s own Primary Professional Title or held job titles. If the target role implies a higher seniority than the candidate's source data, align only on domain/technology terms — e.g., `"Frontend Engineer | Angular & TypeScript Specialist"` — never on the seniority level.
- **Strategic GitHub / Portfolio Curation:** Include GitHub/portfolio links only when explicitly present in `master-data.md`. Never invent dummy URLs. Omit if absent.

### D. Technical Leadership & Active Ownership Verbs
- **Replace passive phrasing:** Instead of *"mentored junior developers"*, use proactive leadership verbs:
  - *Leadership & Ownership:* **Spearheaded, Led, Standardized, Orchestrated, Established, Mentored.**
  - *Example:* *"Led technical upskilling and codebase onboarding for junior frontend engineers on TypeScript and Clean Code standards, accelerating feature delivery cycles by 35%."*
  - *Architecture & Engineering:* **Architected, Engineered, Refactored, Modernized, Deployed.**
  - *Optimization:* **Streamlined, Reduced, Accelerated, Scaled, Eliminated.**
- **Spanish CV Verb Standard (Mandatory Infinitive):** When writing or translating CVs in Spanish, all verbs initiating an experience or project bullet point MUST be in the **infinitive form** (*Liderar, Diseñar, Implementar, Refactorizar, Optimizar, Estandarizar, Dirigir, Desarrollar, Reducir, Acelerar*). ❌ NEVER use past tense / pretérito (*"Lideró"*, *"Lideré"*, *"Diseñó"*, *"Diseñé"*, *"Implementó"*).

### E. Universal 3-Category Skills Architecture
- Regardless of role or discipline (Frontend, Backend, Fullstack, Data, DevOps,
  Mobile, QA, Product, Design, Marketing, etc.), group core competencies into
  **exactly 3 strategic categories relevant to the candidate's domain**, derived
  from `master-data.md` and `target-job.md` — not from a fixed engineering-only
  taxonomy. Choose the 3 categories that best represent the candidate's actual
  expertise clusters.
  - *Example (Software Engineering):* Languages & Core Fundamentals /
    Frameworks, Architecture & Ecosystem / Tooling, Testing, CI/CD & AI
    Integrations.
  - *Example (Product Management):* Product Strategy & Discovery /
    Analytics & Experimentation / Stakeholder & Cross-Functional Leadership.
  - *Example (Design):* Design Systems & Tooling / UX Research & Testing /
    Cross-Functional Collaboration.
- Render each category as a single dense line with comma-separated items.

### F. Google XYZ Achievement Formula
Each experience bullet point must follow the **Google XYZ Formula** ($\text{"Accomplished [X] as measured by [Y] by doing [Z]"}$):
- **Action Verb:**
  - *For English CVs:* Strong past-tense action verb (*Architected, Spearheaded, Refactored, Streamlined*).
  - *For Spanish CVs:* **ALWAYS in the infinitive form** (*Diseñar, Liderar, Implementar, Refactorizar, Optimizar, Reducir, Acelerar*). ❌ NEVER in the past tense (*Diseñó, Implementó, Desarrollé*).
- **Challenge / Technical Context:** The engineering problem or architectural initiative.
- **Action / Implementation:** The modern stack, design pattern, or migration applied.
- **Quantitative Result:** Clear percentage or business/engineering metric achieved.
- **Preserve Relational Verbs & Technology Transitions:** When `master-data.md` describes a technology transition (e.g., *"migrated from X to Y"*, *"replaced X with Y"*, *"refactored from X to Y"*, *"shifted from X to Y"*), preserve that directional relationship in the bullet. ❌ NEVER flatten it into *"using X and Y"* as if both were used simultaneously.
- **Strict Bullet Count Cap (Ideally 3, Maximum 4, Never 5+):** Every role must feature **ideally 3 high-impact bullets (max 4)**. If `master-data.md` contains 5+ raw notes or achievements for a role, select and synthesize only the top 3 with the strongest metrics and direct relevance to `target-job.md`. Never output 5 or more bullets under a single role.
- **Cross-Role Redundancy Check:** Before finalizing, cross-check bullets across all included roles: if two bullets from different roles emphasize the same technical theme (e.g., both about CI/CD optimization), keep only the strongest/most quantified instance and select a different achievement angle for the other role.

### G. Strategic Keyword & Impact Bolding (The 6-Second Recruiter Hook)
- **Recruiter Visual Anchors:** Recruiters and hiring managers spend an average of 6–8 seconds scanning a CV. To immediately seize attention and maximize reading speed:
  - **In Professional Experience Bullets:**
    - **Bold Core Matching Tech:** Strategically apply Markdown bolding (`**Keyword**`) to 1–2 primary matching technical terms per bullet (e.g., `**TypeScript**`, `**Angular**`, `**Webpack Module Federation**`, `**NgRx**`, `**Zustand**`, `**AWS**`).
    - **Bold Quantitative Metrics & Results:** Apply Markdown bolding to all key percentages and numerical gains (e.g., `**50% reduction in CI/CD pipeline build times**`, `**40% decrease in runtime errors**`, `**35% faster cross-team feature delivery**`).
    - **Rule of Balance:** Limit bold highlights to **1 to 3 impactful items per bullet** so the document remains clean, sophisticated, and easy to read without feeling cluttered.
  - **In Professional Summary (Strict Bolding Restriction):**
    - Apply Markdown bolding **exclusively to the closing 2–3 quantitative metrics/percentages**.
    - ❌ Do NOT apply bold formatting to technologies, frameworks, or buzzwords in the summary (e.g. write Angular, React, NgRx, RxJS in normal plain text), since skills are already prominently grouped in the Technical Skills section.

---

## 3. ATS Optimization & Formatting Consistency

- **Keyword Integration:** Seamlessly incorporate high-priority skills, methodologies (CI/CD, Microfrontends, Agile), and tooling explicitly mentioned in `target-job.md`.
- **Natural Keyword Integration (No Verbatim Copying):**
  - Integrate `target-job.md` keywords and terminology naturally into the
    candidate's own achievements and phrasing.
  - ❌ Never copy phrases verbatim from the job posting into the CV — this
    reads as keyword-stuffing to both recruiters and modern ATS semantic
    matching, and can flag as low-effort or automated.
  - ✅ Rephrase the underlying skill or requirement in the candidate's own
    voice, backed by their actual experience from `master-data.md`.
- **Target Role Title Alignment:** Align the sub-header title to the target role while maintaining factual career accuracy.
- **Strict Date Fidelity (SSOT):**
  - Copy exact start and end dates from `master-data.md` (e.g., `Oct 2024 – Apr 2026`).
  - **Never assume "Present"** automatically if an explicit end month/year is provided. Only use "Present" if `master-data.md` explicitly specifies "Present".
  - Standard date format: `Mon YYYY – Mon YYYY` (e.g., `Oct 2024 – Apr 2026` or `Jul 2022 – Oct 2024`).
- **Certifications & Education Format (Strict Column Rule):**
  - Always list each university degree and each certification as its own individual bullet point on a separate line (forming a clean vertical column).
  - ❌ Do NOT combine multiple certifications into a single inline line separated by pipes `|` or commas (e.g. NEVER output `- **Certifications:** Cert 1 | Cert 2`).
  - ✅ Format: `- **[Certification Name]** – [Issuer], [Year]`.
- **Language Uniformity & Regional Verb Standards:**
  - Generate the CV in the same language as target-job.md. If the job posting's language cannot be reliably detected, default to English. Section headers (PROFESSIONAL SUMMARY, etc.) must also be translated accordingly — never mixed languages within the same document.
  - **Spanish CV Verb Standard (Infinitive Mandatory):** When writing or translating a CV in Spanish, all experience and project bullet points MUST begin with verbs in the **infinitive** form (*Diseñar, Desarrollar, Implementar, Coordinar, Optimizar, Liderar, Reducir, Refactorizar*). ❌ NEVER use past tense / pretérito (*Diseñó, Implementó, Desarrollé*).
- **Optional Projects & Extras Selection:**
  - Items in the candidate's optional "Projects & Extras" pool (personal
    projects, publications, volunteer work, talks, awards, etc.) are **not
    included automatically or in full**.
  - Select only the items most relevant to `target-job.md`, using the same
    relevance criteria applied to Professional Experience bullets.
  - If none of the pool items are relevant to the target role, omit the
    section entirely rather than padding the CV with unrelated content.
  - Never fabricate or expand details beyond what the candidate provided for
    each item — the same Zero Hallucination / Strict SSOT rule applies here.
- **Short Descriptive Hyperlink Labels for Projects & Live Demos:**
  - For projects with live applications or repositories, format the title line using clean, concise Markdown hyperlinks with short descriptive labels:
    `### **[Project Name]** | [Live Demo](https://...) • [GitHub](https://...)`
  - ❌ NEVER paste full naked/raw URLs into project subheadings, company lines, or bullet text.
---

## 4. 📊 Quality Audit & Scoring Standard (Quality Report)

Every CV generation or evaluation can produce a comprehensive Quality Audit Report formatted according to the following executive headhunter standards:

### A. Mandatory 7-Pillar Scoring Table
A Markdown table evaluating each key dimension on a strict **1.0 to 10.0 scale**:

| Section | Score (1-10) | Diagnostic & Assessment Criteria |
| :--- | :---: | :--- |
| **Header & Contact Information** | [Score] | Clarity, direct links (LinkedIn, Email, Phone), omission of sensitive personal data (DNI/SSN/Address), and strategic GitHub curation. |
| **Professional Summary** | [Score] | Length (3–4 dense lines), zero fluff/clichés, technical alignment with target role, and mandatory closing quantitative metrics. |
| **Technical Skills** | [Score] | Universal 3-category high-density architecture, direct relevance to target job, and zero unverified technologies (strict SSOT). |
| **Professional Experience** | [Score] | Google XYZ achievement formula, active technical leadership verbs, verifiable impact metrics, and zero thematic redundancy across roles. |
| **Education & Certifications** | [Score] | University degrees, analytical/transferable context lines for non-traditional degrees, and curated technical certifications. |
| **Languages** | [Score] | Standardized CEFR proficiency (Native, B2, C1, C2) with professional working capability. |
| **Overall Structure & Legibility** | [Score] | Strict 1-page A4 fit (80%–90% harmonious fill / 420–480 words), clean Markdown hierarchy, and 100% ATS parseability. |

### B. Action Plan for Scores Below 9.0 (`< 9.0/10`)
For **any section scoring strictly below 9.0/10**, the audit report must explicitly outline:
1. **Identified Gap / Missing Information:** The exact data points, metrics, or credentials missing from `master-data.md` or the CV.
2. **Recommended Action:** Concrete bullet points, rephrasing, or structural adjustments required to reach a **10/10**.

### C. Strategic Levers for Top-Tier Excellence (The 10/10 Ceiling)
To bridge the gap from a solid 8.5–9.0 narrative to a top 5% candidate profile:
1. **Verifiable Public Artifacts (Featured Projects):** Include 1–2 public projects with live demo and GitHub repository links to convert private enterprise narrative into verifiable proof.
2. **Business & User-Facing Impact:** Complement internal engineering metrics (build times, error rates) with direct product metrics (conversion rates, transaction volume, churn reduction, customer onboarding speed).
3. **Scale & Context Magnitude:** Anchor engineering achievements with volume context (MAU, transactions processed per month, cross-functional team size).
