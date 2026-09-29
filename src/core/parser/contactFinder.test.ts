import { describe, it, expect } from 'vitest';
import {
  localizeContactItem,
  extractContactsFromFullText,
  findCandidateContacts,
  enrichContactList,
  injectContactsIntoMarkdownPreamble,
} from './contactFinder';
import { ContactItem, CVData, CvTranslationVariant } from '../../types/cv';

describe('contactFinder', () => {
  describe('localizeContactItem', () => {
    it('translates location strings to English correctly', () => {
      const item: ContactItem = {
        type: 'location',
        label: 'Genève / Lausanne, Suisse',
      };
      const localized = localizeContactItem(item, 'en');
      expect(localized.label).toBe('Geneva / Lausanne, Switzerland');
    });

    it('translates location strings to Spanish correctly', () => {
      const item: ContactItem = {
        type: 'location',
        label: 'Geneva / Lausanne, Switzerland',
      };
      const localized = localizeContactItem(item, 'es');
      expect(localized.label).toBe('Ginebra / Lausanne, Suiza');
    });

    it('leaves non-location contacts completely untouched', () => {
      const item: ContactItem = {
        type: 'email',
        label: 'danielcasw@gmail.com',
        url: 'mailto:danielcasw@gmail.com',
      };
      const localized = localizeContactItem(item, 'en');
      expect(localized.label).toBe('danielcasw@gmail.com');
      expect(localized.url).toBe('mailto:danielcasw@gmail.com');
    });
  });

  describe('extractContactsFromFullText', () => {
    it('extracts email, phone, and linkedin from unstructured body text', () => {
      const text = `
## PERSONAL INFORMATION
Reach out at danielcasw@gmail.com or by mobile +57 320 436 2076.
Professional profile available at https://www.linkedin.com/in/daniel-corredor-acosta/ and github.com/danielcasw.
`;
      const contacts = extractContactsFromFullText(text);

      expect(contacts.some((c) => c.type === 'email' && c.label === 'danielcasw@gmail.com')).toBe(true);
      expect(contacts.some((c) => c.type === 'phone' && c.label.includes('+57 320 436 2076'))).toBe(true);
      expect(contacts.some((c) => c.type === 'linkedin' && c.url?.includes('daniel-corredor-acosta'))).toBe(true);
      expect(contacts.some((c) => c.type === 'github' && c.url?.includes('danielcasw'))).toBe(true);
    });

    it('extracts contacts from piped line format', () => {
      const text = `Geneva / Lausanne, Switzerland | danielcasw@gmail.com | +57 320 436 2076 | LinkedIn: https://www.linkedin.com/in/daniel-corredor-acosta/`;
      const contacts = extractContactsFromFullText(text);

      expect(contacts.length).toBe(4);
      expect(contacts.find((c) => c.type === 'location')?.label).toBe('Geneva / Lausanne, Switzerland');
      expect(contacts.find((c) => c.type === 'email')?.label).toBe('danielcasw@gmail.com');
      expect(contacts.find((c) => c.type === 'phone')?.label).toBe('+57 320 436 2076');
      expect(contacts.find((c) => c.type === 'linkedin')?.url).toContain('linkedin.com/in/daniel-corredor-acosta');
    });
  });

  describe('findCandidateContacts & enrichContactList', () => {
    it('recovers contacts for English variant from sibling French translation when English contacts are empty', () => {
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

      const emptyEnglishData: CVData = {
        name: 'DANIEL CORREDOR ACOSTA',
        title: 'Frontend Engineer | UI Architecture & Scalable Web Systems',
        contacts: [], // Missing!
        sections: [],
      };

      const pool = findCandidateContacts({
        activeCvData: emptyEnglishData,
        translations: { fr: frenchVariant },
      });

      expect(pool.length).toBe(4);
      expect(pool.some((c) => c.type === 'email')).toBe(true);

      const enriched = enrichContactList(emptyEnglishData.contacts, pool, 'en');
      expect(enriched.length).toBe(4);

      // Verify location was automatically localized to English
      const loc = enriched.find((c) => c.type === 'location');
      expect(loc?.label).toBe('Geneva / Lausanne, Switzerland');

      const email = enriched.find((c) => c.type === 'email');
      expect(email?.label).toBe('danielcasw@gmail.com');
    });

    it('injects contacts into markdown preamble when absent', () => {
      const markdown = `# DANIEL CORREDOR ACOSTA
Frontend Engineer | UI Architecture & Scalable Web Systems
Nationality: Swiss / Colombian, no permit required | Work Permit: Switzerland citizen

## PROFESSIONAL SUMMARY
Expert frontend engineer.
`;
      const contacts: ContactItem[] = [
        { type: 'location', label: 'Geneva / Lausanne, Switzerland' },
        { type: 'email', label: 'danielcasw@gmail.com', url: 'mailto:danielcasw@gmail.com' },
        { type: 'phone', label: '+57 320 436 2076' },
        { type: 'linkedin', label: 'LinkedIn', url: 'https://www.linkedin.com/in/daniel-corredor-acosta/' },
      ];

      const healed = injectContactsIntoMarkdownPreamble(markdown, contacts);
      expect(healed).toContain('danielcasw@gmail.com');
      expect(healed).toContain('+57 320 436 2076');
      expect(healed).toContain('Geneva / Lausanne, Switzerland');
      expect(healed.indexOf('danielcasw@gmail.com')).toBeLessThan(healed.indexOf('## PROFESSIONAL SUMMARY'));
    });
  });
});
