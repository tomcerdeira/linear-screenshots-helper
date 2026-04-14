# Linear Screenshots Helper

## Overview
Electron menu-bar app that captures screenshots and creates/attaches them to Linear tickets. Built with Electron Forge + Vite + React 19 + Tailwind 3 + TipTap.

## Quick Start
- `npm start` — run in dev mode
- `npm test` — run all tests (must pass before any PR)
- `npm run test:watch` — watch mode during development
- `npm run lint` — check for lint issues
- `npm run make` — build distributable
- `npx tsc --noEmit` — type check

## Architecture

### Main Process (`src/main/`)
- `index.ts` — app lifecycle, tray, global hotkey, overlay management
- `screenshot.ts` — static screen capture + region selection overlay (capture first, then show overlay)
- `windows.ts` — popup window management
- `tray.ts` — system tray icon + context menu
- `overlay.ts` — fullscreen dim overlay with click-to-dismiss
- `ipc-handlers.ts` — IPC bridge between main and renderer, multi-screenshot queue management
- `preload.ts` — context bridge for renderer
- `templates/` — HTML templates for toast notifications and screenshot overlay

### Renderer (`src/renderer/`)
- `App.tsx` — root component, view routing
- `components/CreateIssueView.tsx` — main Linear-style issue creation form
- `components/ExistingTicketSearch.tsx` — attach screenshot to existing issue
- `components/Dropdown.tsx` — custom dropdown with keyboard nav, search, portal
- `components/RichTextEditor.tsx` — TipTap-based markdown editor with bubble menu
- `components/MetadataPill.tsx` — status/priority/assignee/label pill selectors
- `components/LinearIcons.tsx` — Linear-matching SVG icons (status circles, priority bars)
- `hooks/` — data fetching hooks (useAsyncData pattern)
- `utils/emoji.ts` — Linear icon shortcode to emoji conversion
- `utils/hotkey.ts` — hotkey formatting and keyboard event to accelerator conversion
- `utils/styles.ts` — shared className constants (INPUT_CLASS, BTN_PRIMARY_CLASS, etc.)

### Services (`src/services/`)
- `linear-client.ts` — Linear SDK singleton
- `linear-issues.ts` — CRUD operations + cached fetchers
- `linear-upload.ts` — file upload via presigned URL
- `cache.ts` — TTL cache with stale-while-revalidate
- `store.ts` — encrypted settings persistence (electron-store + safeStorage)
- `buffer.ts` — data URL to Buffer conversion

### Shared (`src/shared/`)
- `types.ts` — all TypeScript interfaces
- `ipc-channels.ts` — IPC channel name constants
- `colors.js` — single source of truth for all color hex values

## Conventions

### Colors
- Renderer components use Tailwind token classes (e.g. `bg-surface-input`, `text-linear-brand`). The tokens are defined in `tailwind.config.js`, sourced from `src/shared/colors.js`. Main process HTML templates import hex values from `src/shared/colors.js` directly.
- Never hardcode hex values in components

### Styles
- Shared className constants live in `src/renderer/utils/styles.ts`
- Use `INPUT_CLASS`, `TEXTAREA_CLASS`, `BTN_PRIMARY_CLASS`, `BTN_GHOST_CLASS`, `BACK_LINK_CLASS`

### Types
- All interfaces in `src/shared/types.ts`
- Use `readonly` on all interface properties
- No `any` — use `unknown` and narrow
- IPC channels defined in `src/shared/ipc-channels.ts`

### Testing
- Tests are co-located with source files as `*.test.ts`
- Use Vitest (`npm test`)
- Test pure logic only (cache, buffer, emoji, templates, sorting)
- All tests must pass before committing

### IPC Pattern
- Renderer calls `window.api.methodName()` (defined in `src/renderer/api.d.ts`)
- Preload exposes methods via `contextBridge` (defined in `src/main/preload.ts`)
- Main process registers handlers in `src/main/ipc-handlers.ts`
- Background operations use `*Bg` variants (fire-and-forget with toast notification)

### Features
- Multi-screenshot collect mode: queue multiple screenshots before opening the issue form
- Customizable hotkeys (capture, collect, open queue) in settings
- Image paste support in TipTap rich text editor
- Tab navigation through metadata pills

### Keyboard Shortcuts
- `Cmd+Shift+L` — capture screenshot (global, customizable)
- `Alt+Cmd+Shift+L` — collect screenshot to queue (global, customizable)
- `Cmd+Shift+Enter` — open issue with queued screenshots (global, customizable)
- `Cmd+Enter` — submit form
- `Escape` — close popup/dropdown
- `S` / `P` / `A` / `L` / `I` / `E` — status/priority/assignee/labels/assign-to-me/attach-to-existing (when not in input)
- `Tab` — navigate between fields and pills

## Common Pitfalls
- TipTap `@tiptap/react/menus` subpath export needs a type declaration in `src/renderer/types/tiptap-menus.d.ts`
- Main process HTML templates (toast, overlay) cannot use React — they are raw HTML strings
- `electron-store` requires `safeStorage` for encrypting the API key
- The popup window is `transparent: false` with extra height for dropdown overflow
- Keyboard shortcuts must check `el.isContentEditable` to avoid firing in the rich text editor
- The screenshot overlay uses a static capture approach (capture full screen first, then show overlay for region selection). Live transparent overlays have compositor issues on macOS.
