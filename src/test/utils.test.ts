import { describe, it, expect } from 'vitest';
import { convertNumerals } from '../assets/utils';

describe('convertNumerals', () => {
  describe('Latin to Arabic conversion (language: "ar")', () => {
    it('converts simple integers', () => {
      expect(convertNumerals('123', 'ar')).toBe('١٢٣');
    });

    it('converts numbers with decimal points to Arabic with comma', () => {
      expect(convertNumerals('123.45', 'ar')).toBe('١٢٣,٤٥');
    });

    it('converts numbers with commas to Arabic with Arabic comma', () => {
      expect(convertNumerals('1,234', 'ar')).toBe('١،٢٣٤');
    });

    it('handles mixed strings by only converting numerals and separators', () => {
      expect(convertNumerals('Price: 100$', 'ar')).toBe('Price: ١٠٠$');
    });

    it('does not change already converted Arabic numerals', () => {
      expect(convertNumerals('١٢٣', 'ar')).toBe('١٢٣');
    });
  });

  describe('Arabic to Latin conversion (language: "en" or "fr")', () => {
    it('converts Arabic numerals to Latin (en)', () => {
      expect(convertNumerals('١٢٣', 'en')).toBe('123');
    });

    it('converts Arabic numerals to Latin (fr)', () => {
      expect(convertNumerals('١٢٣', 'fr')).toBe('123');
    });

    it('converts Arabic commas to Latin points (decimal)', () => {
      expect(convertNumerals('١٢٣,٤٥', 'en')).toBe('123.45');
    });

    it('converts Arabic separator to Latin comma', () => {
      expect(convertNumerals('١،٢٣٤', 'en')).toBe('1,234');
    });

    it('does not change already converted Latin numerals', () => {
      expect(convertNumerals('123', 'en')).toBe('123');
    });
  });

  describe('Edge cases and language handling', () => {
    it('is case-insensitive for the language parameter', () => {
      expect(convertNumerals('123', 'AR')).toBe('١٢٣');
      expect(convertNumerals('١٢٣', 'EN')).toBe('123');
    });

    it('returns the original string for unsupported languages', () => {
      expect(convertNumerals('123', 'es')).toBe('123');
    });

    it('handles empty strings', () => {
      expect(convertNumerals('', 'ar')).toBe('');
    });

    it('handles strings with no numerals', () => {
      expect(convertNumerals('Hello', 'ar')).toBe('Hello');
    });
  });
});
