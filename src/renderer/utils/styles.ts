// Shared className constants to eliminate duplication across components.
// All values use the design tokens defined in tailwind.config.js / shared/colors.js.

export const INPUT_CLASS = [
  'w-full rounded-md',
  'bg-surface-input border border-border',
  'text-content placeholder-content-ghost',
  'px-3 py-2 text-sm',
  'hover:border-border-hover',
  'focus:outline-none focus:border-linear-brand focus:ring-1 focus:ring-linear-brand',
  'transition-colors',
].join(' ');

export const TEXTAREA_CLASS = `${INPUT_CLASS} resize-none`;

export const BTN_PRIMARY_CLASS = [
  'px-4 py-1.5',
  'bg-linear-brand text-white rounded-full',
  'text-[13px] font-medium',
  'hover:bg-linear-brand-hover',
  'transition-colors',
  'disabled:opacity-35 disabled:cursor-not-allowed',
].join(' ');

export const BTN_GHOST_CLASS = [
  'text-content-ghost hover:text-content hover:bg-surface-input',
  'rounded transition-colors',
].join(' ');

export const BACK_LINK_CLASS = 'text-content-ghost hover:text-content text-sm transition-colors';
