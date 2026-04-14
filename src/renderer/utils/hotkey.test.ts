import { describe, it, expect } from 'vitest';
import { formatHotkeyForDisplay, keyEventToAccelerator } from './hotkey';

function mockKeyEvent(overrides: Partial<{
  metaKey: boolean; ctrlKey: boolean; altKey: boolean; shiftKey: boolean; key: string;
}>) {
  return {
    metaKey: false,
    ctrlKey: false,
    altKey: false,
    shiftKey: false,
    key: '',
    ...overrides,
  };
}

describe('formatHotkeyForDisplay', () => {
  it('replaces CommandOrControl with platform key', () => {
    const result = formatHotkeyForDisplay('CommandOrControl+L');
    // In Node.js (test env), navigator is undefined → IS_MAC is false → "Ctrl"
    expect(result).toContain('Ctrl');
    expect(result).toContain('L');
  });

  it('replaces + with spaced separator', () => {
    const result = formatHotkeyForDisplay('Shift+L');
    expect(result).toBe('Shift + L');
  });

  it('handles multiple modifiers', () => {
    const result = formatHotkeyForDisplay('CommandOrControl+Shift+L');
    expect(result).toContain(' + ');
    expect(result).toContain('Shift');
    expect(result).toContain('L');
  });

  it('handles empty string', () => {
    expect(formatHotkeyForDisplay('')).toBe('');
  });

  it('handles single key', () => {
    expect(formatHotkeyForDisplay('F5')).toBe('F5');
  });
});

describe('keyEventToAccelerator', () => {
  it('converts Cmd+L to accelerator', () => {
    const result = keyEventToAccelerator(mockKeyEvent({ metaKey: true, key: 'l' }));
    expect(result).toBe('CommandOrControl+L');
  });

  it('converts Ctrl+L (no meta) to accelerator', () => {
    const result = keyEventToAccelerator(mockKeyEvent({ ctrlKey: true, key: 'l' }));
    expect(result).toBe('CommandOrControl+L');
  });

  it('converts Cmd+Shift+L to accelerator', () => {
    const result = keyEventToAccelerator(mockKeyEvent({ metaKey: true, shiftKey: true, key: 'l' }));
    expect(result).toBe('CommandOrControl+Shift+L');
  });

  it('converts Alt+Cmd+Shift+L to accelerator', () => {
    const result = keyEventToAccelerator(mockKeyEvent({ metaKey: true, altKey: true, shiftKey: true, key: 'l' }));
    expect(result).toBe('CommandOrControl+Alt+Shift+L');
  });

  it('returns null for modifier-only key (Meta)', () => {
    expect(keyEventToAccelerator(mockKeyEvent({ metaKey: true, key: 'Meta' }))).toBeNull();
  });

  it('returns null for modifier-only key (Shift)', () => {
    expect(keyEventToAccelerator(mockKeyEvent({ shiftKey: true, key: 'Shift' }))).toBeNull();
  });

  it('returns null for modifier-only key (Control)', () => {
    expect(keyEventToAccelerator(mockKeyEvent({ ctrlKey: true, key: 'Control' }))).toBeNull();
  });

  it('returns null for modifier-only key (Alt)', () => {
    expect(keyEventToAccelerator(mockKeyEvent({ altKey: true, key: 'Alt' }))).toBeNull();
  });

  it('returns null for single key without modifier', () => {
    expect(keyEventToAccelerator(mockKeyEvent({ key: 'a' }))).toBeNull();
  });

  it('uppercases single-character keys', () => {
    const result = keyEventToAccelerator(mockKeyEvent({ metaKey: true, key: 'k' }));
    expect(result).toBe('CommandOrControl+K');
  });

  it('maps ArrowUp to Up', () => {
    const result = keyEventToAccelerator(mockKeyEvent({ metaKey: true, key: 'ArrowUp' }));
    expect(result).toBe('CommandOrControl+Up');
  });

  it('maps ArrowDown to Down', () => {
    const result = keyEventToAccelerator(mockKeyEvent({ metaKey: true, key: 'ArrowDown' }));
    expect(result).toBe('CommandOrControl+Down');
  });

  it('maps Enter to Return', () => {
    const result = keyEventToAccelerator(mockKeyEvent({ metaKey: true, key: 'Enter' }));
    expect(result).toBe('CommandOrControl+Return');
  });

  it('maps Escape to Escape', () => {
    const result = keyEventToAccelerator(mockKeyEvent({ metaKey: true, key: 'Escape' }));
    expect(result).toBe('CommandOrControl+Escape');
  });

  it('maps Tab to Tab', () => {
    const result = keyEventToAccelerator(mockKeyEvent({ metaKey: true, key: 'Tab' }));
    expect(result).toBe('CommandOrControl+Tab');
  });

  it('maps space to Space', () => {
    const result = keyEventToAccelerator(mockKeyEvent({ metaKey: true, key: ' ' }));
    expect(result).toBe('CommandOrControl+Space');
  });

  it('passes through F-keys', () => {
    const result = keyEventToAccelerator(mockKeyEvent({ metaKey: true, key: 'F5' }));
    expect(result).toBe('CommandOrControl+F5');
  });

  it('does not duplicate CommandOrControl when both meta and ctrl', () => {
    const result = keyEventToAccelerator(mockKeyEvent({ metaKey: true, ctrlKey: true, key: 'l' }));
    expect(result).toBe('CommandOrControl+L');
  });
});
