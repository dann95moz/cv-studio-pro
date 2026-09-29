import { describe, it, expect } from 'vitest';
import { extractTranslatedCv } from './cv-translator';

describe('cv-translator', () => {
  const fallbackMarkdown = `# Daniel Corredor Acosta
**Frontend Engineer | Architecture UI & Systèmes Web Scalables**

Genève / Lausanne, Suisse | danielcasw@gmail.com | +57 320 436 2076 | LinkedIn: https://www.linkedin.com/in/daniel-corredor-acosta/

Nationalité: Suisse / Colombienne, aucun permis requis | Lieu d'origine: Frutigen (BE) | Disponibilité: Dès décembre 2026

## PROFIL PROFESSIONNEL
Frontend Software Engineer avec plus de 3 ans d'expérience.
`;

  it('restores contacts from fallback markdown when LLM outputs JSON without contacts', () => {
    const rawLlmJson = JSON.stringify({
      cvData: {
        name: 'Daniel Corredor Acosta',
        title: 'Frontend Engineer | UI Architecture & Scalable Web Systems',
        summary: 'Frontend Software Engineer with over 3 years of experience.',
        skills: [{ category: 'Core Skills', skills: ['TypeScript', 'React'] }],
        experience: [],
        projects: [],
        education: [],
        // contacts intentionally omitted by LLM
      },
    });

    const result = extractTranslatedCv(rawLlmJson, fallbackMarkdown, 'en');

    expect(result.cvData.contacts).toBeDefined();
    expect(result.cvData.contacts.length).toBe(4);
    expect(result.cvData.contacts.some((c) => c.type === 'email')).toBe(true);
    expect(result.cvData.contacts.find((c) => c.type === 'email')?.label).toBe('danielcasw@gmail.com');
    expect(result.cvMarkdown).toContain('danielcasw@gmail.com');
  });

  it('restores contacts from fallback markdown when LLM outputs pure markdown without contacts', () => {
    const rawLlmMarkdown = `# Daniel Corredor Acosta
**Frontend Engineer | UI Architecture & Scalable Web Systems**

Nationality: Swiss / Colombian, no permit required | Place of Origin: Frutigen (BE) | Availability: since December 2026

## PROFESSIONAL SUMMARY
Frontend Software Engineer with over 3 years of experience.
`;

    const result = extractTranslatedCv(rawLlmMarkdown, fallbackMarkdown, 'en');

    expect(result.cvData.contacts).toBeDefined();
    expect(result.cvData.contacts.length).toBe(4);
    expect(result.cvData.contacts.some((c) => c.type === 'email')).toBe(true);
    expect(result.cvData.contacts.find((c) => c.type === 'email')?.label).toBe('danielcasw@gmail.com');
    expect(result.cvMarkdown).toContain('danielcasw@gmail.com');
  });
});
