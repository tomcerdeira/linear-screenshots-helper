import { describe, it, expect } from 'vitest';

const { COLORS } = require('./colors.js');

const HEX_REGEX = /^#[0-9A-Fa-f]{6}$/;

describe('COLORS', () => {
  it('has all required top-level sections', () => {
    expect(COLORS.linear).toBeDefined();
    expect(COLORS.surface).toBeDefined();
    expect(COLORS.border).toBeDefined();
    expect(COLORS.content).toBeDefined();
    expect(COLORS.feedback).toBeDefined();
  });

  it('linear brand colors are valid hex', () => {
    expect(COLORS.linear.brand).toMatch(HEX_REGEX);
    expect(COLORS.linear.brandHover).toMatch(HEX_REGEX);
  });

  it('surface colors are valid hex', () => {
    expect(COLORS.surface.base).toMatch(HEX_REGEX);
    expect(COLORS.surface.raised).toMatch(HEX_REGEX);
    expect(COLORS.surface.input).toMatch(HEX_REGEX);
    expect(COLORS.surface.hover).toMatch(HEX_REGEX);
  });

  it('border colors are valid hex', () => {
    expect(COLORS.border.default).toMatch(HEX_REGEX);
    expect(COLORS.border.subtle).toMatch(HEX_REGEX);
    expect(COLORS.border.hover).toMatch(HEX_REGEX);
  });

  it('content colors are valid hex', () => {
    expect(COLORS.content.default).toMatch(HEX_REGEX);
    expect(COLORS.content.secondary).toMatch(HEX_REGEX);
    expect(COLORS.content.muted).toMatch(HEX_REGEX);
    expect(COLORS.content.ghost).toMatch(HEX_REGEX);
    expect(COLORS.content.placeholder).toMatch(HEX_REGEX);
  });

  it('feedback colors are valid hex', () => {
    expect(COLORS.feedback.success).toMatch(HEX_REGEX);
    expect(COLORS.feedback.error).toMatch(HEX_REGEX);
  });

  it('all values are strings (no undefined)', () => {
    function checkAll(obj, path = '') {
      for (const [key, val] of Object.entries(obj)) {
        const fullPath = path ? `${path}.${key}` : key;
        if (typeof val === 'object' && val !== null) {
          checkAll(val, fullPath);
        } else {
          expect(typeof val, `${fullPath} should be a string`).toBe('string');
        }
      }
    }
    checkAll(COLORS);
  });
});
