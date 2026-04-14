const IS_MAC = typeof navigator !== 'undefined' && navigator.userAgent.includes('Mac');

export function formatHotkeyForDisplay(accelerator: string): string {
  return accelerator
    .replace('CommandOrControl', IS_MAC ? 'Cmd' : 'Ctrl')
    .replace('Command', 'Cmd')
    .replace('Control', 'Ctrl')
    .replace('Shift', 'Shift')
    .replace('Alt', IS_MAC ? 'Option' : 'Alt')
    .replace('Option', IS_MAC ? 'Option' : 'Alt')
    .replace(/\+/g, ' + ');
}

const SPECIAL_KEYS: Record<string, string> = {
  ArrowUp: 'Up',
  ArrowDown: 'Down',
  ArrowLeft: 'Left',
  ArrowRight: 'Right',
  Backspace: 'Backspace',
  Delete: 'Delete',
  Enter: 'Return',
  Escape: 'Escape',
  Tab: 'Tab',
  ' ': 'Space',
};

const MODIFIER_KEYS = new Set(['Meta', 'Control', 'Alt', 'Shift']);

export function keyEventToAccelerator(e: {
  readonly metaKey: boolean;
  readonly ctrlKey: boolean;
  readonly altKey: boolean;
  readonly shiftKey: boolean;
  readonly key: string;
}): string | null {
  const parts: string[] = [];

  if (e.metaKey) parts.push('CommandOrControl');
  if (e.ctrlKey && !e.metaKey) parts.push('CommandOrControl');
  if (e.altKey) parts.push('Alt');
  if (e.shiftKey) parts.push('Shift');

  if (MODIFIER_KEYS.has(e.key)) return null;

  const special = SPECIAL_KEYS[e.key];
  if (special) {
    parts.push(special);
  } else if (e.key.length === 1) {
    parts.push(e.key.toUpperCase());
  } else {
    parts.push(e.key);
  }

  if (parts.length < 2) return null;

  return parts.join('+');
}
