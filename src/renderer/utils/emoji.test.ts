import { describe, it, expect } from 'vitest';
import { shortcodeToEmoji } from './emoji';

describe('shortcodeToEmoji', () => {
  describe('null/undefined handling', () => {
    it('returns null for null input', () => {
      expect(shortcodeToEmoji(null)).toBeNull();
    });

    it('returns null for undefined input', () => {
      expect(shortcodeToEmoji(undefined)).toBeNull();
    });

    it('returns null for empty string', () => {
      expect(shortcodeToEmoji('')).toBeNull();
    });
  });

  describe('Unicode emoji passthrough', () => {
    it('passes through rocket emoji', () => {
      expect(shortcodeToEmoji('🚀')).toBe('🚀');
    });

    it('passes through check mark', () => {
      expect(shortcodeToEmoji('✅')).toBe('✅');
    });

    it('passes through compound emoji', () => {
      expect(shortcodeToEmoji('👨‍💻')).toBe('👨‍💻');
    });
  });

  describe('shortcode format (:name:)', () => {
    it('converts :rocket: to emoji', () => {
      const result = shortcodeToEmoji(':rocket:');
      expect(result).toBe('🚀');
    });

    it('converts :email: to emoji', () => {
      const result = shortcodeToEmoji(':email:');
      expect(result).not.toBeNull();
    });

    it('converts :arrows_clockwise: to emoji', () => {
      const result = shortcodeToEmoji(':arrows_clockwise:');
      expect(result).not.toBeNull();
    });

    it('returns null for unknown shortcode', () => {
      expect(shortcodeToEmoji(':totally_fake_code:')).toBeNull();
    });
  });

  describe('plain word format (Linear icon names)', () => {
    it('converts Rocket to emoji', () => {
      expect(shortcodeToEmoji('Rocket')).toBe('🚀');
    });

    it('converts Robot to emoji', () => {
      expect(shortcodeToEmoji('Robot')).toBe('🤖');
    });

    it('converts Cookie to emoji', () => {
      expect(shortcodeToEmoji('Cookie')).toBe('🍪');
    });

    it('converts Mountain to emoji', () => {
      expect(shortcodeToEmoji('Mountain')).not.toBeNull();
    });
  });

  describe('Linear-specific icon map', () => {
    it('converts CrystalBall to crystal ball emoji', () => {
      expect(shortcodeToEmoji('CrystalBall')).toBe('🔮');
    });

    it('converts BowlingBall to bowling emoji', () => {
      expect(shortcodeToEmoji('BowlingBall')).toBe('🎳');
    });

    it('converts Mac to computer emoji', () => {
      expect(shortcodeToEmoji('Mac')).toBe('💻');
    });

    it('converts Chemist to test tube emoji', () => {
      expect(shortcodeToEmoji('Chemist')).toBe('🧪');
    });

    it('converts Crane to construction emoji', () => {
      expect(shortcodeToEmoji('Crane')).toBe('🚧');
    });

    it('converts ViewFinder to magnifying glass emoji', () => {
      expect(shortcodeToEmoji('ViewFinder')).toBe('🔍');
    });
  });

  describe('never returns raw text', () => {
    it('returns null for unresolvable plain words', () => {
      expect(shortcodeToEmoji('SomeRandomWord')).toBeNull();
    });

    it('returns null for partial matches', () => {
      expect(shortcodeToEmoji('NotAnEmoji')).toBeNull();
    });
  });
});
