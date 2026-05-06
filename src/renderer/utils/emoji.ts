import emojiMapData from './emoji-map.json';

const EMOJI_MAP = emojiMapData as Record<string, string>;

// Linear icon names that don't match standard emoji shortcodes
const LINEAR_ICON_MAP: Record<string, string> = {
  crystalball: 'crystal_ball',
  bowlingball: 'bowling',
  viewfinder: 'mag',
  feather: 'pen',
  mac: 'computer',
  chemist: 'test_tube',
  face: 'slightly_smiling_face',
  crane: 'construction',
  subscribe: 'inbox_tray',
};

// eslint-disable-next-line no-misleading-character-class
const EMOJI_REGEX = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F000}-\u{1FFFF}\u{200D}\u{20E3}\u{E0020}-\u{E007F}]/u;

function resolveShortcode(code: string): string | null {
  const lower = code.toLowerCase();
  const mapped = LINEAR_ICON_MAP[lower] ?? lower;
  return EMOJI_MAP[mapped] ?? null;
}

/**
 * Convert Linear project icon values to Unicode emoji.
 * Handles shortcodes (":rocket:"), plain words ("Rocket"), and passthrough Unicode.
 * Returns null for unresolvable values — never returns raw text.
 */
export function shortcodeToEmoji(input: string | null | undefined): string | null {
  if (!input) return null;
  if (EMOJI_REGEX.test(input)) return input;

  const shortcodeMatch = input.match(/^:([a-zA-Z0-9_+-]+):$/);
  if (shortcodeMatch) return resolveShortcode(shortcodeMatch[1]);

  return resolveShortcode(input.replace(/\s+/g, '_'));
}
