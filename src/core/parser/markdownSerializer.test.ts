import { describe, it, expect } from 'vitest';
import { serializeCvDataToMarkdown } from './markdownSerializer';
import { parseMarkdownToCvData } from './markdownToCvData';
import { CVData } from '../../types/cv';

describe('markdownSerializer', () => {
  it('serializes CVData to Markdown with clean contacts and Swiss legal metadata', () => {
    const original: CVData = {
      name: 'Daniel Corredor Acosta',
      title: 'Frontend Engineer',
      language: 'en',
      contacts: [
        { type: 'location', label: 'Geneva / Lausanne, Switzerland' },
        { type: 'email', label: 'danielcasw@gmail.com', url: 'mailto:danielcasw@gmail.com' },
        { type: 'phone', label: '+57 320 436 2076' },
        { type: 'linkedin', label: 'LinkedIn', url: 'https://www.linkedin.com/in/daniel-corredor-acosta/' },
      ],
      nationality: 'Swiss / Colombian, no permit required',
      placeOfOrigin: 'Frutigen (BE)',
      availability: 'since December 2026',
      summary: 'Frontend engineer with modern web architecture expertise.',
      sections: [{ id: 'summary', type: 'summary', title: 'PROFESSIONAL SUMMARY' }],
    };

    const markdown = serializeCvDataToMarkdown(original, 'en');

    expect(markdown).toContain('# Daniel Corredor Acosta');
    expect(markdown).toContain('**Frontend Engineer**');
    expect(markdown).toContain('Geneva / Lausanne, Switzerland');
    expect(markdown).toContain('danielcasw@gmail.com');
    expect(markdown).toContain('Frutigen (BE)');

    // Round-trip bi-directional verification
    const roundTripped = parseMarkdownToCvData(markdown, 'en');
    expect(roundTripped.name).toBe(original.name);
    expect(roundTripped.title).toBe(original.title);
    expect(roundTripped.placeOfOrigin).toBe(original.placeOfOrigin);
    expect(roundTripped.contacts.length).toBe(4);
    expect(roundTripped.contacts[0].label).toBe('Geneva / Lausanne, Switzerland');
  });
});
