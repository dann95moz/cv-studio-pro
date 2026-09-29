import { describe, it, expect } from 'vitest';
import { mapDataToSlots } from './slot-mapper';
import { CVData } from '../types/cv';

describe('slot-mapper', () => {
  it('maps CVData to template slots preserving all candidate contacts and Swiss details', () => {
    const mockCv: CVData = {
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
      summary: 'Experienced software engineer.',
      sections: [{ id: 'summary', type: 'summary', title: 'PROFESSIONAL SUMMARY' }],
    };

    const slots = mapDataToSlots(mockCv, 'en');

    expect(slots.header).toBeDefined();
    expect(slots.header.name).toBe('Daniel Corredor Acosta');
    expect(slots.header.title).toBe('Frontend Engineer');
    expect(slots.header.placeOfOrigin).toBe('Frutigen (BE)');
    expect(slots.header.nationality).toBe('Swiss / Colombian, no permit required');

    expect(slots.header.contacts.length).toBe(4);
    expect(slots.header.contacts.some((c) => c.type === 'location')).toBe(true);
    expect(slots.header.contacts.some((c) => c.type === 'email')).toBe(true);
    expect(slots.header.contacts.some((c) => c.type === 'phone')).toBe(true);
    expect(slots.header.contacts.some((c) => c.type === 'linkedin')).toBe(true);
  });
});
