# Linear Screenshots Helper

A lightweight menu bar app that lets you capture screenshots and instantly create or update [Linear](https://linear.app) tickets.

## Features

- **Global hotkey** (`Cmd+Shift+L`) to capture a region of any screen
- **Create new tickets** with team, project, title, and rich text description
- **Attach to existing tickets** via search or quick-attach from recent list
- **Rich text editor** — TipTap-based markdown editor with bubble menu (bold, italic, code, links)
- **Keyboard shortcuts** for every action — navigate the entire UI without touching the mouse
- **Toast notifications** for background issue creation (fire-and-forget workflow)
- **Click-outside-to-dismiss** — click anywhere outside the popup to close it
- **Metadata selectors** — status, priority, assignee, project, and labels via pill selectors
- **Recent ticket memory** — last used team/project and recently created tickets are remembered
- **Multi-monitor support** — captures whichever screen your cursor is on
- **Dark mode UI** matching Linear's aesthetic
- **Encrypted API key storage** via macOS Keychain / Windows DPAPI

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd+Shift+L` | Capture screenshot (global) |
| `Cmd+Enter` | Submit form |
| `Escape` | Close popup / cancel capture / close dropdown |
| `S` | Open status selector |
| `P` | Open priority selector |
| `A` | Open assignee selector |
| `L` | Open labels selector |
| `I` | Assign to me |

> **Note:** Single-key shortcuts (`S`, `P`, `A`, `L`, `I`) only fire when focus is not in a text input or the rich text editor.

## Download

Head to the [Releases](https://github.com/tomcerdeira/linear-screenshots-helper/releases) page and download the latest version for your platform:

| Platform | File |
|----------|------|
| macOS (Apple Silicon) | `Linear.Screenshot-darwin-arm64-*.zip` |
| macOS (Intel) | `Linear.Screenshot-darwin-x64-*.zip` |
| Windows | `linear-screenshot-*-Setup.exe` |
| Linux (deb) | `linear-screenshot_*_amd64.deb` |
| Linux (rpm) | `linear-screenshot-*.x86_64.rpm` |

## Setup

1. Open the app — a tray icon appears in your menu bar
2. Right-click the tray icon and select **Settings**
3. Paste your Linear API key (generate one at [linear.app/settings/api](https://linear.app/settings/api))
4. Press `Cmd+Shift+L` to capture your first screenshot

> **macOS Gatekeeper:** Since the app is not notarized with an Apple Developer certificate, macOS will show an "is damaged" or "unidentified developer" warning. To fix this, run the following after extracting:
>
> ```bash
> xattr -cr /path/to/LinearScreenshot.app
> ```
>
> Then open it normally. You'll also need to grant **Screen Recording** permission on first use (System Settings > Privacy & Security > Screen Recording).

## Usage

1. Press `Cmd+Shift+L` — the screen dims with a crosshair cursor
2. Click and drag to select a region (press `Escape` to cancel)
3. A popup appears with your screenshot:
   - **Recent tickets** — one-click attach to a ticket you recently used
   - **Create New Ticket** — pick team, project, add title and description
   - **Search Other Tickets** — find any ticket by title or identifier
4. Submit — the screenshot is uploaded to Linear and embedded in the ticket

## Development

### Prerequisites

- Node.js 20+
- npm

### Run locally

```bash
npm install
npm start
```

### Build distributable

```bash
npm run make
```

Output goes to `out/make/`.

## Testing

```bash
npm test            # single run
npm run test:watch  # watch mode
```

Tests are co-located with source files as `*.test.ts` and use [Vitest](https://vitest.dev/).

## Release

Push a version tag to trigger the GitHub Actions release workflow:

```bash
npm version patch   # or minor / major
git push --follow-tags
```

This builds for macOS (arm64 + x64), Windows, and Linux, then creates a draft GitHub Release with all artifacts attached. Go to the [Releases](https://github.com/tomcerdeira/linear-screenshots-helper/releases) page to review and publish.

## Architecture

```
src/
  main/              # Electron main process
    index.ts           # App lifecycle, tray, global hotkey, overlay management
    screenshot.ts      # Screen capture + region selection overlay
    windows.ts         # Popup window management
    tray.ts            # System tray icon + context menu
    overlay.ts         # Fullscreen dim overlay (click-outside-to-dismiss)
    ipc-handlers.ts    # IPC bridge (main <-> renderer)
    preload.ts         # Context bridge for renderer
    templates/         # HTML templates for toast notifications and screenshot overlay
  services/          # Business logic (no Electron imports)
    linear-client.ts   # Linear SDK wrapper
    linear-issues.ts   # Create/search issues, comments, uploads
    linear-upload.ts   # File upload via Linear's presigned URL flow
    cache.ts           # TTL cache with stale-while-revalidate
    store.ts           # Encrypted settings persistence
    buffer.ts          # Data URL to Buffer conversion
  renderer/          # React UI
    components/        # CreateIssueView, ExistingTicketSearch, Dropdown, RichTextEditor, MetadataPill, LinearIcons
    hooks/             # useAsyncData, useIssueSearch, useRecentSelections, etc.
    utils/             # emoji.ts (icon shortcodes), styles.ts (shared className constants)
  shared/            # Types and constants
    types.ts           # All TypeScript interfaces
    ipc-channels.ts    # IPC channel name constants
    colors.js          # Single source of truth for all color hex values
```

## Tech Stack

- [Electron](https://www.electronjs.org/) + [Electron Forge](https://www.electronforge.io/)
- [React 19](https://react.dev/) + [Tailwind CSS 3](https://tailwindcss.com/)
- [TipTap](https://tiptap.dev/) for rich text editing
- [@linear/sdk](https://github.com/linear/linear) for the Linear API
- [Vite](https://vitejs.dev/) for bundling
- [Vitest](https://vitest.dev/) for testing
- [electron-store](https://github.com/sindresorhus/electron-store) for encrypted persistence

## License

MIT
