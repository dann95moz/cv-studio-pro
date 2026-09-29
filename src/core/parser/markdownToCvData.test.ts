import { describe, it, expect } from 'vitest';
import { parseMarkdownToCvData } from './markdownToCvData';

describe('markdownToCvData', () => {
  it('correctly parses candidate name, title, contacts, and legal metadata from preamble', () => {
    const markdown = `# DANIEL CORREDOR ACOSTA
**Frontend Engineer | UI Architecture & Scalable Web Systems**

Geneva / Lausanne, Switzerland | danielcasw@gmail.com | +57 320 436 2076 | LinkedIn: https://www.linkedin.com/in/daniel-corredor-acosta/

Nationality: Swiss / Colombian, no permit required | Place of Origin: Frutigen (BE) | Availability: since december 2026

## PROFESSIONAL SUMMARY
Frontend Software Engineer with over 3 years of experience architecting and modernizing high-performance web applications.

## TECHNICAL SKILLS
- **Core Skills:** TypeScript, JavaScript, HTML5, CSS3
- **Tools:** Git, GitHub, Vite

## PROFESSIONAL EXPERIENCE
### Aval Digital Labs (ADL) | Bogotá, Colombia
**Frontend Developer** | Oct 2024 – Apr 2026
- Architected shell containers using Webpack Module Federation and Angular.
`;

    const data = parseMarkdownToCvData(markdown, 'en');

    // 1. Candidate Identity
    expect(data.name).toBe('DANIEL CORREDOR ACOSTA');
    expect(data.title).toBe('Frontend Engineer | UI Architecture & Scalable Web Systems');

    // 2. Contact Credentials (CRITICAL REGRESSION TEST)
    expect(data.contacts).toBeDefined();
    expect(data.contacts.length).toBeGreaterThanOrEqual(4);

    const location = data.contacts.find((c) => c.type === 'location');
    const email = data.contacts.find((c) => c.type === 'email');
    const phone = data.contacts.find((c) => c.type === 'phone');
    const linkedin = data.contacts.find((c) => c.type === 'linkedin');

    expect(location).toBeDefined();
    expect(location?.label).toBe('Geneva / Lausanne, Switzerland');

    expect(email).toBeDefined();
    expect(email?.label).toBe('danielcasw@gmail.com');
    expect(email?.url).toBe('mailto:danielcasw@gmail.com');

    expect(phone).toBeDefined();
    expect(phone?.label).toBe('+57 320 436 2076');

    expect(linkedin).toBeDefined();
    expect(linkedin?.url).toContain('linkedin.com/in/daniel-corredor-acosta');

    // 3. Legal & Swiss Metadata
    expect(data.nationality).toBe('Swiss / Colombian, no permit required');
    expect(data.placeOfOrigin).toBe('Frutigen (BE)');
    expect(data.availability).toBe('since december 2026');

    // 4. Ensure legal metadata NEVER leaks into contacts
    expect(data.contacts.some((c) => c.label.toLowerCase().includes('nationality'))).toBe(false);
    expect(data.contacts.some((c) => c.label.toLowerCase().includes('place of origin'))).toBe(false);
    expect(data.contacts.some((c) => c.label.toLowerCase().includes('availability'))).toBe(false);
  });

  it('parses markdown with bullet dividers (•) and markdown links', () => {
    const markdown = `# Alex Rivera
**Full Stack Architect**
Lausanne, Switzerland • [alex@example.com](mailto:alex@example.com) • +41 21 000 0000 • [LinkedIn](https://linkedin.com/in/alex-rivera)

Lieu d'origine : Lausanne (VD) • Nationalité : Suisse

## PROFIL PROFESSIONNEL
Architecte logiciel passionné.
`;

    const data = parseMarkdownToCvData(markdown, 'fr');
    expect(data.name).toBe('Alex Rivera');
    expect(data.title).toBe('Full Stack Architect');
    expect(data.placeOfOrigin).toBe('Lausanne (VD)');
    expect(data.nationality).toBe('Suisse');

    expect(data.contacts.length).toBe(4);
    expect(data.contacts[0].label).toBe('Lausanne, Switzerland');
    expect(data.contacts[1].label).toBe('alex@example.com');
  });

  it('strips configuration comments and never leaks them into parsed sections', () => {
    const markdown = `# Test User
Geneva, Switzerland | test@example.com

<!-- config:hiddenSections=references -->
<!-- config:hiddenDetails=drivingLicense -->

## PROFESSIONAL SUMMARY
Summary content here.

## REFERENCES
- References available on request
`;

    const data = parseMarkdownToCvData(markdown, 'en');
    expect(data.hiddenSections?.[0]).toBe('references');
    expect(data.hiddenDetails?.[0]).toBe('drivingLicense');

    // Check summary section content does not contain config comment
    const summarySec = data.sections.find((s) => s.type === 'summary');
    expect(summarySec).toBeDefined();
    expect(summarySec?.rawContent?.includes('config:')).toBe(false);
    expect(data.summary?.includes('config:')).toBe(false);
  });
});
