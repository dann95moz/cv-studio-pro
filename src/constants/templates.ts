import { CVData } from '../types/cv';

export const BLANK_MASTER_DATA = '';

export const BLANK_TARGET_JOB = '';

export const BLANK_TAILORED_CV = '';

export const BLANK_GAP_REPORT = '';

export const BLANK_CV_DATA: CVData = {
  name: '',
  title: '',
  contacts: [],
  summary: '',
  skillGroups: [],
  experience: [],
  projects: [],
  education: [],
  languages: [],
  sections: [],
};

export const DEMO_CV_DATA: CVData = {
  name: 'ALEX MORGAN',
  title: 'Senior Frontend Engineer – Core Payments Platform',
  contacts: [
    { type: 'location', label: 'San Francisco, CA' },
    { type: 'email', label: 'alex.morgan@example.com', url: 'mailto:alex.morgan@example.com' },
    { type: 'phone', label: '+1 415 555 0192' },
    { type: 'linkedin', label: 'LinkedIn', url: 'https://linkedin.com/in/alexmorgan-eng' },
    { type: 'github', label: 'GitHub', url: 'https://github.com/alexmorgan-eng' },
    { type: 'globe', label: 'Portfolio', url: 'https://alexmorgan.dev' },
  ],
  summary:
    'Senior Frontend Engineer with 6+ years of experience specialized in **TypeScript**, **React**, and **Microfrontends**, building resilient user experiences for high-volume transactions. Proven track record of cutting CI/CD build times by **50%**, reducing production runtime errors by **40%**, and architecting payment onboarding workflows handling over **$80M+ in transaction volume**.',
  skillGroups: [
    {
      category: 'Languages & Core Fundamentals',
      skills: ['TypeScript', 'JavaScript (ESNext)', 'Python', 'SQL', 'HTML5', 'CSS3', 'Core Web Vitals'],
    },
    {
      category: 'Frameworks, Architecture & Ecosystem',
      skills: ['React', 'Next.js', 'Webpack Module Federation', 'Node.js', 'Zustand', 'Redux', 'RESTful APIs'],
    },
    {
      category: 'Tooling, Testing, CI/CD & AI Integrations',
      skills: ['Jest', 'React Testing Library', 'Playwright', 'Vite', 'Docker', 'GitHub Actions CI/CD', 'AWS'],
    },
  ],
  experience: [
    {
      company: 'FinScale Technologies',
      role: 'Staff Frontend Engineer',
      date: 'Oct 2022 – Present',
      location: 'San Francisco, CA (Remote)',
      bullets: [
        '**Spearheaded** modular **Microfrontend Architecture** using **Webpack Module Federation**, reducing core bundle sizes by **45%** and accelerating cross-team deployments by **3.5x**.',
        '**Engineered** high-resilience payment onboarding flows with **TypeScript** and **React**, driving a **28% reduction in checkout drop-offs** across **$80M+ in annual payments**.',
        '**Standardized** automated testing with **Jest** and **Playwright**, boosting test coverage to **84%** and cutting production bug escapes by **40%**.',
      ],
    },
    {
      company: 'Nova Cloud Systems',
      role: 'Senior Frontend Engineer',
      date: 'Jan 2020 – Sep 2022',
      location: 'Austin, TX',
      bullets: [
        '**Architected** high-performance transactional dashboards with **React** and **Zustand**, maintaining **60 FPS** across 50,000+ live data streams.',
        '**Streamlined** automated CI/CD deployment pipelines, cutting build and test execution cycles by **52%**.',
        '**Standardized** accessibility standards across customer interfaces, achieving **100% WCAG 2.1 AA compliance**.',
      ],
    },
  ],
  projects: [],
  education: [
    '**B.S. in Computer Science** – University of California, Berkeley, 2019',
    '**AWS Certified Developer – Associate** – Amazon Web Services, 2023',
    '**Meta Certified Front-End Developer** – Meta, 2022',
  ],
  languages: [
    '**English:** Native',
    '**Spanish:** C1 – Professional Working Proficiency',
  ],
  sections: [],
};

export const DEMO_MASTER_DATA = `# ALEX MORGAN
**Senior Frontend Engineer | UI Architecture & High-Scale Systems**  
San Francisco, CA • alex.morgan@example.com • +1 415 555 0192  
[LinkedIn](https://linkedin.com/in/alexmorgan-eng) • [GitHub](https://github.com/alexmorgan-eng) • [Portfolio](https://alexmorgan.dev)

---

## 🎯 PROFESSIONAL SUMMARY & PITCH
Senior Frontend Engineer with 6+ years of experience specialized in architecting high-throughput web applications, microfrontends, and design systems using TypeScript, React, and Next.js. Proven track record of cutting CI/CD build times by 50%, eliminating 40% of runtime errors through strict type systems, and scaling checkout experiences processing over $80M in annualized transactions.

---

## 🛠️ MASTER TECH STACK & COMPETENCIES
- **Languages & Core Fundamentals:** TypeScript, JavaScript (ESNext), Python, SQL, HTML5, CSS3, Core Web Vitals
- **Frameworks & State Architecture:** React, Next.js, Node.js, Zustand, Redux Toolkit, React Query, RESTful APIs, GraphQL
- **Tooling, Testing, CI/CD & Cloud:** Vite, Webpack Module Federation, Jest, React Testing Library, Playwright, Docker, CI/CD, AWS

---

## 💼 CAREER HISTORY & KEY ACHIEVEMENTS

### **FinScale Technologies** | San Francisco, CA (Remote)
*Staff Frontend Engineer* | **Oct 2022 – Present**
- **Spearheaded** the architectural migration from a legacy monolithic SPA to a modular **Microfrontend Architecture** using **Webpack Module Federation**, reducing core bundle sizes by **45%** and accelerating team deployment frequency by **3.5x**.
- **Engineered** a real-time merchant onboarding portal with **TypeScript** and **React**, cutting onboarding drop-off by **28%** and supporting over **$80M+ in annual transaction volume**.
- **Standardized** automated testing across 4 feature squads by introducing **Jest** and **Playwright** end-to-end suites, raising test coverage from **38% to 84%** and cutting production bug escapes by **40%**.

---

### **Nova Cloud Systems** | Austin, TX
*Senior Frontend Engineer* | **Jan 2020 – Sep 2022**
- **Architected** high-performance data analytics dashboards using **React**, **Zustand**, and **Virtual Tables**, rendering 50,000+ real-time time-series records at a steady **60 FPS**.
- **Streamlined** CI/CD release pipelines with GitHub Actions and Docker, reducing build and verification times by **52%**.
- **Mentored** 6 junior and mid-level software engineers on Clean Code, design patterns, and accessibility standards (WCAG 2.1 AA).

---

## 🎓 EDUCATION & CERTIFICATIONS
- **B.S. in Computer Science** – University of California, Berkeley, 2019
- **AWS Certified Developer – Associate** – Amazon Web Services, 2023
- **Meta Certified Front-End Developer** – Meta, 2022

---

## 🌐 LANGUAGES
- **English:** Native
- **Spanish:** C1 – Professional Working Proficiency
`;

export const DEMO_TARGET_JOB = `Company: Stripe
Role: Senior Frontend Engineer – Core Payments Platform
Location: Remote (Americas / Global)
Job Link: https://stripe.com/jobs/senior-frontend-engineer

About Stripe:
Stripe is a financial infrastructure platform for businesses. Millions of companies—from the world’s largest enterprises to the most ambitious startups—use Stripe to accept payments, grow their revenue, and accelerate new business opportunities.

About the Role:
We are looking for a Senior Frontend Engineer to build resilient, ultra-fast web user experiences for our global payments platform. You will design modular UI components, optimize bundle sizes, and collaborate on mission-critical transactional workflows.

Key Responsibilities:
• Build performant, accessible web applications using TypeScript, React, and modern state architectures.
• Architect modular frontend components and microfrontends with zero runtime errors.
• Optimize CI/CD pipelines, automated testing (Jest/Vitest), and Core Web Vitals across high-traffic checkout flows.
• Partner closely with product managers, designers, and backend engineers to integrate high-throughput financial APIs.

Requirements & Qualifications:
• 5+ years of experience with React, TypeScript, and modern frontend ecosystems.
• Deep understanding of Webpack/Vite module federation, performance profiling, and state management (Zustand/Redux).
• Experience building responsive, accessible (WCAG), and localized web applications.
• Strong communication skills and a track record of delivering measurable engineering results (Google XYZ achievement formula).
`;

export const DEMO_TAILORED_CV = `# ALEX MORGAN
**Senior Frontend Engineer – Core Payments Platform**  
San Francisco, CA • alex.morgan@example.com • +1 415 555 0192  
[LinkedIn](https://linkedin.com/in/alexmorgan-eng) • [GitHub](https://github.com/alexmorgan-eng) • [Portfolio](https://alexmorgan.dev)

---

## PROFESSIONAL SUMMARY
Senior Frontend Engineer with 6+ years of experience specialized in **TypeScript**, **React**, and **Microfrontends**, building resilient user experiences for high-volume transactions. Proven track record of cutting CI/CD build times by **50%**, reducing production runtime errors by **40%**, and architecting payment onboarding workflows handling over **$80M+ in transaction volume**.

---

## TECHNICAL SKILLS
- **Languages & Core Fundamentals:** TypeScript, JavaScript (ESNext), Python, SQL, HTML5, CSS3, Core Web Vitals
- **Frameworks, Architecture & Ecosystem:** React, Next.js, Webpack Module Federation, Node.js, Zustand, Redux, RESTful APIs
- **Tooling, Testing, CI/CD & AI Integrations:** Jest, React Testing Library, Playwright, Vite, Docker, GitHub Actions CI/CD, AWS

---

## PROFESSIONAL EXPERIENCE

### **FinScale Technologies** | San Francisco, CA (Remote)
*Staff Frontend Engineer* | Oct 2022 – Present
- **Spearheaded** modular **Microfrontend Architecture** using **Webpack Module Federation**, reducing core bundle sizes by **45%** and accelerating cross-team deployments by **3.5x**.
- **Engineered** high-resilience payment onboarding flows with **TypeScript** and **React**, driving a **28% reduction in checkout drop-offs** across **$80M+ in annual payments**.
- **Standardized** automated testing with **Jest** and **Playwright**, boosting test coverage to **84%** and cutting production bug escapes by **40%**.

---

### **Nova Cloud Systems** | Austin, TX
*Senior Frontend Engineer* | Jan 2020 – Sep 2022
- **Architected** high-performance transactional dashboards with **React** and **Zustand**, maintaining **60 FPS** across 50,000+ live data streams.
- **Streamlined** automated CI/CD deployment pipelines, cutting build and test execution cycles by **52%**.
- **Standardized** accessibility standards across customer interfaces, achieving **100% WCAG 2.1 AA compliance**.

---

## EDUCATION & CERTIFICATIONS
- **B.S. in Computer Science** – University of California, Berkeley, 2019
- **AWS Certified Developer – Associate** – Amazon Web Services, 2023
- **Meta Certified Front-End Developer** – Meta, 2022

---

## LANGUAGES
- **English:** Native
- **Spanish:** C1 – Professional Working Proficiency
`;

export const DEMO_GAP_REPORT = `# MATCHING & TAILORING STRATEGY REPORT (Gap Analysis)
- **Target Company:** Stripe
- **Target Role:** Senior Frontend Engineer – Core Payments Platform
- **Estimated Match Score:** 94/100
- **Critical Integrated Keywords:** [TypeScript, React, Microfrontends, Webpack Module Federation, Core Web Vitals, Jest, CI/CD, Zustand]
- **Strategic Alignment Narrative:** The candidate demonstrates strong senior-level alignment with Stripe's payments platform requirements. Prior experience architecting microfrontends with Webpack Module Federation and building transaction workflows processing $80M+ directly addresses the job posting. Quantitative engineering achievements and strong CI/CD optimization history provide compelling evidence of technical ownership.
- **Identified Gaps & Mitigation:** The target job description highlights deep payment processing integrations and international localized flows. While the candidate has solid experience in merchant onboarding and scale, specific card network protocol details can be highlighted during technical interview rounds by drawing parallels to high-throughput financial dashboards.
`;

