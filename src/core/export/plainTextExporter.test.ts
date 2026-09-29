import { describe, it, expect } from 'vitest';
import { generatePlainTextCv } from './plainTextExporter';
import { CVData } from '../../types/cv';

describe('plainTextExporter', () => {
  const mockCv: CVData = {
    name: 'Daniel Corredor Acosta',
    title: 'Frontend Engineer | UI Architecture & Scalable Web Systems',
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
    summary: 'Experienced frontend engineer specializing in React and Angular ecosystems.',
    sections: [
      { id: 'summary', type: 'summary', title: 'PROFESSIONAL SUMMARY' },
    ],
  };

  it('generates contact information row with location, email, phone, and linkedin', () => {
    const text = generatePlainTextCv(mockCv);

    expect(text).toContain('Geneva / Lausanne, Switzerland');
    expect(text).toContain('danielcasw@gmail.com');
    expect(text).toContain('+57 320 436 2076');
    expect(text).toContain('https://www.linkedin.com/in/daniel-corredor-acosta/');
  });

  it('exports Place of Origin cleanly without duplicate prefixes', () => {
    const textEn = generatePlainTextCv(mockCv);
    expect(textEn).toContain('Place of Origin: Frutigen (BE)');
    expect(textEn).not.toContain('Place of Origin: Origin:');

    const mockCvFr: CVData = {
      ...mockCv,
      language: 'fr',
    };
    const textFr = generatePlainTextCv(mockCvFr);
    expect(textFr).toContain("Lieu d'origine: Frutigen (BE)");
  });

  it('never leaks configuration comments or duplicate headers into plain text', () => {
    const mockWithConfig: CVData = {
      ...mockCv,
      summary: 'Summary text <!-- config:hiddenSections=references --> here.',
    };
    const text = generatePlainTextCv(mockWithConfig);
    expect(text).not.toContain('<!-- config:');
  });
});
