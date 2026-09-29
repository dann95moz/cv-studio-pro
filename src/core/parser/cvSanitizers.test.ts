import { describe, it, expect } from 'vitest';
import {
  cleanPlaceOfOrigin,
  sanitizeLegalMetadata,
  extractAndStripEmbeddedAvailability,
} from './cvSanitizers';

describe('cvSanitizers', () => {
  describe('cleanPlaceOfOrigin', () => {
    it('strips simple origin prefixes in multiple languages', () => {
      expect(cleanPlaceOfOrigin('Place of Origin: Frutigen (BE)')).toBe('Frutigen (BE)');
      expect(cleanPlaceOfOrigin('Origin: Frutigen (BE)')).toBe('Frutigen (BE)');
      expect(cleanPlaceOfOrigin("Lieu d'origine: Frutigen (BE)")).toBe('Frutigen (BE)');
      expect(cleanPlaceOfOrigin('Heimatort: Bern (BE)')).toBe('Bern (BE)');
      expect(cleanPlaceOfOrigin('Lugar de origen: Ginebra (GE)')).toBe('Ginebra (GE)');
      expect(cleanPlaceOfOrigin('Originaire de Lausanne (VD)')).toBe('Lausanne (VD)');
    });

    it('strips stacked or nested duplicate origin prefixes iteratively', () => {
      expect(cleanPlaceOfOrigin('Place of Origin: Origin: Frutigen (BE)')).toBe('Frutigen (BE)');
      expect(cleanPlaceOfOrigin("Lieu d'origine : Originaire de : Frutigen (BE)")).toBe('Frutigen (BE)');
      expect(cleanPlaceOfOrigin('Heimatort: Origin: Zurich (ZH)')).toBe('Zurich (ZH)');
    });

    it('preserves clean city/canton values without modifying valid text', () => {
      expect(cleanPlaceOfOrigin('Frutigen (BE)')).toBe('Frutigen (BE)');
      expect(cleanPlaceOfOrigin('Zurich (ZH)')).toBe('Zurich (ZH)');
      expect(cleanPlaceOfOrigin('')).toBe('');
      expect(cleanPlaceOfOrigin(undefined)).toBe('');
    });
  });

  describe('sanitizeLegalMetadata', () => {
    it('does not populate undefined keys when properties are omitted', () => {
      const sanitized = sanitizeLegalMetadata({});
      expect(Object.keys(sanitized)).toEqual([]);
      expect(Object.keys(sanitized).length).toBe(0);
    });

    it('sanitizes legal fields and strips duplicate origin prefixes', () => {
      const sanitized = sanitizeLegalMetadata({
        placeOfOrigin: 'Place of Origin: Origin: Frutigen (BE)',
        workPermit: 'Switzerland citizen – Don’t require work permission – available now',
        availability: 'since December 2026',
      });

      expect(sanitized.placeOfOrigin).toBe('Frutigen (BE)');
      expect(sanitized.availability).toBe('since December 2026');
      expect(sanitized.workPermit?.toLowerCase()).not.toContain('available now');
    });
  });

  describe('extractAndStripEmbeddedAvailability', () => {
    it('detects and strips embedded availability phrases', () => {
      const res = extractAndStripEmbeddedAvailability(
        'Swiss Citizen – No permit required – available now'
      );
      expect(res.detectedAvailability).toBe('available now');
      expect(res.cleaned.toLowerCase()).not.toContain('available now');
    });
  });
});
