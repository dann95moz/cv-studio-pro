import { describe, it, expect } from 'vitest';
import { computeParsedCv } from './selectors';
import { CvTranslationVariant, CVData } from '../types/cv';

describe('computeParsedCv', () => {
  it('guarantees contact details are preserved in English variant when English contacts are missing but French variant has them', () => {
    const frenchVariant: CvTranslationVariant = {
      language: 'fr',
      languageLabel: 'Français',
      cvMarkdown: `# DANIEL CORREDOR ACOSTA
Frontend Engineer | UI Architecture & Scalable Web Systems
Genève / Lausanne, Suisse | danielcasw@gmail.com | +57 320 436 2076 | LinkedIn: https://www.linkedin.com/in/daniel-corredor-acosta/
Nationalité: Suisse / Colombie

## PROFIL PROFESSIONNEL
Ingénieur frontend chevronné.
`,
      cvData: {
        name: 'DANIEL CORREDOR ACOSTA',
        title: 'Frontend Engineer | UI Architecture & Scalable Web Systems',
        contacts: [
          { type: 'location', label: 'Genève / Lausanne, Suisse' },
          { type: 'email', label: 'danielcasw@gmail.com', url: 'mailto:danielcasw@gmail.com' },
          { type: 'phone', label: '+57 320 436 2076' },
          { type: 'linkedin', label: 'LinkedIn', url: 'https://www.linkedin.com/in/daniel-corredor-acosta/' },
        ],
        sections: [],
      },
      updatedAt: new Date().toISOString(),
      isOutdated: false,
      baseMarkdownHash: 'hash',
      outdatedSections: [],
    };

    const englishVariant: CvTranslationVariant = {
      language: 'en',
      languageLabel: 'English',
      cvMarkdown: `# DANIEL CORREDOR ACOSTA
Frontend Engineer | UI Architecture & Scalable Web Systems
Nationality: Swiss / Colombian, no permit required | Work Permit: Switzerland citizen

## PROFESSIONAL SUMMARY
Seasoned frontend engineer.
`,
      cvData: {
        name: 'DANIEL CORREDOR ACOSTA',
        title: 'Frontend Engineer | UI Architecture & Scalable Web Systems',
        contacts: [], // Missing in English!
        sections: [],
      },
      updatedAt: new Date().toISOString(),
      isOutdated: false,
      baseMarkdownHash: 'hash',
      outdatedSections: [],
    };

    const result = computeParsedCv({
      currentBaseLanguage: 'fr',
      activeLanguage: 'en',
      cvMarkdown: frenchVariant.cvMarkdown,
      translations: {
        fr: frenchVariant,
        en: englishVariant,
      },
    });

    expect(result.name).toBe('DANIEL CORREDOR ACOSTA');
    expect(result.contacts).toBeDefined();
    expect(result.contacts.length).toBe(4);

    // Verify email, phone, and linkedin are preserved
    expect(result.contacts.find((c) => c.type === 'email')?.label).toBe('danielcasw@gmail.com');
    expect(result.contacts.find((c) => c.type === 'phone')?.label).toBe('+57 320 436 2076');
    expect(result.contacts.find((c) => c.type === 'linkedin')?.url).toContain('daniel-corredor-acosta');

    // Verify location is translated to English
    const loc = result.contacts.find((c) => c.type === 'location');
    expect(loc?.label).toBe('Geneva / Lausanne, Switzerland');
  });

  it('recovers contacts from masterData when base and variant markdown omit contact line', () => {
    const result = computeParsedCv({
      currentBaseLanguage: 'en',
      activeLanguage: 'en',
      masterData: `# Daniel Corredor Acosta
Frontend Developer
Email: danielcasw@gmail.com | Phone: +57 320 436 2076 | Location: Geneva / Lausanne, Switzerland | LinkedIn: https://www.linkedin.com/in/daniel-corredor-acosta/

## Summary
Experienced engineer.
`,
      cvMarkdown: `# DANIEL CORREDOR ACOSTA
Frontend Engineer

## PROFESSIONAL SUMMARY
Tailored summary.
`,
      activeCvData: {
        name: 'DANIEL CORREDOR ACOSTA',
        title: 'Frontend Engineer',
        contacts: [],
        sections: [],
      },
    });

    expect(result.contacts.length).toBeGreaterThanOrEqual(3);
    expect(result.contacts.some((c) => c.type === 'email')).toBe(true);
    expect(result.contacts.some((c) => c.type === 'phone')).toBe(true);
  });
});
