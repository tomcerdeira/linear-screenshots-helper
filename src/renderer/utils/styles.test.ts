import { describe, it, expect } from 'vitest';
import { INPUT_CLASS, TEXTAREA_CLASS, BTN_PRIMARY_CLASS, BTN_GHOST_CLASS, BACK_LINK_CLASS } from './styles';

describe('style constants', () => {
  it('INPUT_CLASS is a non-empty string', () => {
    expect(typeof INPUT_CLASS).toBe('string');
    expect(INPUT_CLASS.length).toBeGreaterThan(0);
  });

  it('INPUT_CLASS contains essential Tailwind classes', () => {
    expect(INPUT_CLASS).toContain('rounded-md');
    expect(INPUT_CLASS).toContain('bg-surface-input');
    expect(INPUT_CLASS).toContain('border');
    expect(INPUT_CLASS).toContain('text-sm');
    expect(INPUT_CLASS).toContain('focus:outline-none');
    expect(INPUT_CLASS).toContain('transition-colors');
  });

  it('TEXTAREA_CLASS extends INPUT_CLASS', () => {
    expect(TEXTAREA_CLASS).toContain(INPUT_CLASS);
  });

  it('TEXTAREA_CLASS adds resize-none', () => {
    expect(TEXTAREA_CLASS).toContain('resize-none');
  });

  it('BTN_PRIMARY_CLASS contains brand color and disabled state', () => {
    expect(BTN_PRIMARY_CLASS).toContain('bg-linear-brand');
    expect(BTN_PRIMARY_CLASS).toContain('text-white');
    expect(BTN_PRIMARY_CLASS).toContain('rounded-full');
    expect(BTN_PRIMARY_CLASS).toContain('disabled:opacity');
    expect(BTN_PRIMARY_CLASS).toContain('disabled:cursor-not-allowed');
  });

  it('BTN_GHOST_CLASS contains hover states', () => {
    expect(BTN_GHOST_CLASS).toContain('hover:');
    expect(BTN_GHOST_CLASS).toContain('transition-colors');
  });

  it('BACK_LINK_CLASS contains hover and transition', () => {
    expect(BACK_LINK_CLASS).toContain('hover:');
    expect(BACK_LINK_CLASS).toContain('transition-colors');
    expect(BACK_LINK_CLASS).toContain('text-sm');
  });

  it('no class string has leading or trailing spaces', () => {
    const classes = [INPUT_CLASS, TEXTAREA_CLASS, BTN_PRIMARY_CLASS, BTN_GHOST_CLASS, BACK_LINK_CLASS];
    for (const cls of classes) {
      expect(cls).toBe(cls.trim());
    }
  });

  it('no class string has double spaces', () => {
    const classes = [INPUT_CLASS, TEXTAREA_CLASS, BTN_PRIMARY_CLASS, BTN_GHOST_CLASS, BACK_LINK_CLASS];
    for (const cls of classes) {
      expect(cls).not.toContain('  ');
    }
  });
});
