# Linear Screenshots Helper

A lightweight macOS menu-bar app that lets you capture screenshots and instantly create or attach them to [Linear](https://linear.app) tickets — without ever leaving the keyboard.

> Website: [linear.tickets](https://www.linear.tickets/) (or see the local landing page in [`website/`](./website))

## Features

- **Global hotkey** to capture a region of any screen, with native macOS capture for instant, consistent latency
- **Customizable hotkeys** for capture, collect-to-queue, and open-with-queue (configurable in Settings)
- **Multi-screenshot collect mode** — queue several screenshots before opening the issue form so they're all attached to the same ticket
- **Create new tickets** with team, project, status, priority, assignee, labels, title and rich text description
- **Attach to existing tickets** via search or one-click attach from your recent list
- **Rich text editor** — TipTap-based markdown editor with bubble menu (bold, italic, code, links, lists, blockquote)
- **Paste images** directly into the description (auto-uploaded to Linear)
- **Toast notifications** for background ticket creation (fire-and-forget workflow)
- **Click-outside-to-dismiss** — dim overlay that closes the popup on click
- **Recent ticket memory** — last used team / project / labels and recently created tickets are remembered
- **Multi-monitor support** — captures whichever screen your cursor is on
- **Standalone Settings window** with a redesigned, compact layout
- **Onboarding welcome flow** the first time you launch (also available any time from the tray's _Welcome Guide_)
- **Native auto-update** — silent background downloads with a "Restart & Install" prompt; manual "Check for updates" in Settings
- **Encrypted API key storage** via macOS Keychain (`safeStorage`)
- **Dark mode UI** matching Linear's aesthetic

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd+Shift+L` | Capture screenshot and open the issue form (global, customizable) |
| `Alt+Cmd+Shift+L` | Capture and add to the queue without opening the form (global, customizable) |
| `Cmd+Shift+Enter` | Open the issue form with all queued screenshots (global, customizable) |
| `Cmd+Enter` | Submit form |
| `Escape` | Close popup / cancel capture / close dropdown |
| `Tab` | Navigate between fields and metadata pills |
| `S` / `P` / `A` / `L` | Open status / priority / assignee / labels selector |
| `I` | Assign to me |
| `E` | Switch to "attach to existing" view |

> Single-key shortcuts (`S`, `P`, `A`, `L`, `I`, `E`) only fire when focus is not in a text input or the rich text editor.

## Download

Head to the [Releases](https://github.com/tomcerdeira/linear-screenshots-helper/releases) page and grab the build for your Mac:

| Platform | File |
|----------|------|
| macOS (Apple Silicon, M1/M2/M3/M4) | `LinearScreenshot-darwin-arm64-*.dmg` or `.zip` |
| macOS (Intel) | `LinearScreenshot-darwin-x64-*.dmg` or `.zip` |

> Linux/Windows builds are not currently published. The Forge config supports them — see [`forge.config.ts`](./forge.config.ts) — so you can `npm run make` locally if you need them.

## Setup

1. Open the app — a tray icon appears in your menu bar (the dock is intentionally hidden)
2. The first launch shows a short welcome guide that walks you through the API key and hotkey
3. Or, click the tray icon → **Settings...** at any time to:
   - Paste your Linear API key (generate one at [linear.app/settings/account/security](https://linear.app/settings/account/security))
   - Customize the three global hotkeys
   - Toggle the app on/off
   - Toggle automatic update checks and run a manual "Check for updates"
4. The tray menu also exposes _Capture Screenshot_, _Welcome Guide_, _Enable/Disable_, and _Quit_
5. Press `Cmd+Shift+L` to capture your first screenshot

> **First-run permissions:** macOS will prompt for **Screen Recording** permission. Grant it in System Settings → Privacy & Security → Screen Recording, then re-launch the app.

> **Gatekeeper:** Releases are signed and notarized when run from CI with valid Apple Developer credentials. If you grab an unsigned build (e.g. a local `npm run make`), macOS may show "is damaged" or "unidentified developer". Clear the quarantine attribute with:
>
> ```bash
> xattr -cr /Applications/Linear\ Screenshot.app
> ```

## Usage

1. Press `Cmd+Shift+L` — the screen dims with a crosshair
2. Click and drag to select a region (Escape to cancel)
3. A popup appears with your screenshot. From there you can:
   - **Recent tickets** — one-click attach to a ticket you recently used
   - **Create new ticket** — pick team, project, status, priority, assignee, labels, write a title and description
   - **Search other tickets** — find any ticket by title or identifier and attach
4. Submit — the screenshot is uploaded to Linear and embedded in the ticket. The popup closes immediately and you get a toast confirming success (with a link to the ticket)

### Collect mode

Want a single ticket with multiple screenshots? Use the collect hotkey (`Alt+Cmd+Shift+L` by default):

1. Press the collect hotkey to capture each region — a small toast confirms the queue size
2. Press the open-queue hotkey (`Cmd+Shift+Enter` by default) when you're ready
3. The form opens with all queued screenshots; submit once and they're all attached

## Development

### Prerequisites

- Node.js 20+ (CI uses 22)
- npm

### Run locally

```bash
npm install
npm start
```

`npm run start:fresh` resets the onboarding state so you can re-trigger the welcome flow.

### Build distributable

```bash
npm run make
```

Output goes to `out/make/`.

### Type check / lint / test

```bash
npx tsc --noEmit
npm run lint
npm test           # single run
npm run test:watch # watch mode
```

Tests are co-located with source files as `*.test.ts` and use [Vitest](https://vitest.dev/).

## Release

Releases are produced by the [`Release`](./.github/workflows/release.yml) GitHub Actions workflow on any pushed tag matching `v*`. The workflow runs on `macos-latest` for both `arm64` and `x64`, signs and notarizes with the Apple Developer credentials stored in repository secrets, and uploads `.zip` and `.dmg` artifacts (with arch-suffixed filenames so both architectures coexist on the same release) to a draft GitHub Release.

In-app updates are powered by Electron's native [`autoUpdater`](https://www.electronjs.org/docs/latest/api/auto-updater) against the [`update.electronjs.org`](https://update.electronjs.org/) feed for `tomcerdeira/linear-screenshots-helper`, so each published GitHub Release becomes available to existing installs automatically.

To cut a release:

```bash
npm version patch     # or minor / major — bumps package.json and creates the tag
git push --follow-tags
```

Then go to the [Releases](https://github.com/tomcerdeira/linear-screenshots-helper/releases) page, review the auto-generated notes, and publish the draft.

Required repository secrets for signing/notarization:

- `APPLE_CERTIFICATE` — base64-encoded `.p12` of the Developer ID Application certificate
- `APPLE_CERTIFICATE_PASSWORD` — password for the `.p12`
- `APPLE_ID` — Apple ID email
- `APPLE_ID_PASSWORD` — app-specific password for that Apple ID
- `APPLE_TEAM_ID` — Apple Developer Team ID

## Architecture

```
src/
  main/                # Electron main process
    index.ts             # App lifecycle, tray, global hotkeys, popup orchestration
    screenshot.ts        # Native screen capture (screencapture on macOS) + region-selection overlay
    windows.ts           # Popup + standalone Settings window factories
    tray.ts              # System tray icon + context menu
    overlay.ts           # Per-display dim overlay (click-outside-to-dismiss)
    ipc-handlers.ts      # IPC bridge + multi-screenshot queue management
    preload.ts           # Context bridge exposing the typed `window.api`
    update-check.ts      # GitHub releases lookup + version comparison
    updater.ts           # Native Electron autoUpdater wiring (download + install prompt)
    templates/           # Raw HTML templates for toast and capture overlay
  services/            # Pure business logic (no Electron imports)
    linear-client.ts     # Linear SDK singleton
    linear-issues.ts     # Create / search issues, comments, with cached fetchers
    linear-upload.ts     # File upload via Linear's presigned-URL flow
    cache.ts             # TTL cache with stale-while-revalidate
    store.ts             # Encrypted settings persistence (electron-store + safeStorage)
    buffer.ts            # Data URL → Buffer conversion
  renderer/            # React UI (Vite + Tailwind)
    App.tsx              # Root component, view routing
    components/          # CreateIssueView, ExistingTicketSearch, Dropdown, RichTextEditor,
                         # MetadataPill, LinearIcons, SettingsView, WelcomeView,
                         # TeamPicker, ProjectPicker, ScreenshotPreview, …
    hooks/               # useAsyncData, useScreenshot, useIssueSearch, …
    utils/               # emoji.ts, hotkey.ts, styles.ts (shared className constants)
    styles/globals.css   # Tailwind layer + custom rules (TipTap, scrollbar, …)
  shared/              # Cross-process modules
    types.ts             # All TypeScript interfaces (readonly props, no `any`)
    ipc-channels.ts      # IPC channel name constants
    colors.js            # Single source of truth for color hex values (CJS so Tailwind can require it)
website/               # Marketing landing page (separate Next.js project)
.github/workflows/     # Release workflow
forge.config.ts        # Electron Forge config (makers, publishers, fuses, signing)
```

## Tech Stack

- [Electron](https://www.electronjs.org/) + [Electron Forge](https://www.electronforge.io/) (Vite plugin, Fuses, GitHub publisher)
- [React 19](https://react.dev/) + [Tailwind CSS 3](https://tailwindcss.com/) + [Framer Motion](https://www.framer.com/motion/)
- [TipTap](https://tiptap.dev/) for the rich-text description editor
- [@linear/sdk](https://github.com/linear/linear) for the Linear API
- [Vite](https://vitejs.dev/) for bundling, [Vitest](https://vitest.dev/) for testing
- [electron-store](https://github.com/sindresorhus/electron-store) + [`safeStorage`](https://www.electronjs.org/docs/latest/api/safe-storage) for encrypted persistence

## License

MIT
