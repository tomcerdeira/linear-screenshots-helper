# Linear Screenshots Helper

A lightweight menu bar app that lets you capture screenshots and instantly create or update [Linear](https://linear.app) tickets.

## Features

- **Global hotkey** (`Cmd+Shift+L`) to capture a region of any screen
- **Create new tickets** with team, project, title, and description
- **Attach to existing tickets** via search or quick-attach from recent list
- **Multi-monitor support** — captures whichever screen your cursor is on
- **Remembers your selections** — last used team/project, recently created tickets
- **Dark mode UI** matching Linear's aesthetic
- **Encrypted API key storage** via macOS Keychain / Windows DPAPI

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

> **macOS:** The app will ask for Screen Recording permission on first use. Grant it in System Settings > Privacy & Security > Screen Recording.

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

### Release

Push a version tag to trigger the GitHub Actions release workflow:

```bash
npm version patch   # or minor / major
git push --follow-tags
```

This builds for macOS (arm64 + x64), Windows, and Linux, then creates a draft GitHub Release with all artifacts attached. Go to the [Releases](https://github.com/tomcerdeira/linear-screenshots-helper/releases) page to review and publish.

## Architecture

```
src/
  main/           # Electron main process
    index.ts        # App lifecycle, tray, global hotkey
    screenshot.ts   # Screen capture + region selection overlay
    windows.ts      # Popup window management
    tray.ts         # System tray icon + menu
    ipc-handlers.ts # IPC bridge (main <-> renderer)
    preload.ts      # Context bridge for renderer
  services/        # Business logic (no Electron imports)
    linear-client.ts  # Linear SDK wrapper
    linear-issues.ts  # Create/search issues, comments, uploads
    linear-upload.ts  # File upload via Linear's presigned URL flow
    store.ts          # Encrypted settings persistence
  renderer/        # React UI
    components/     # ActionPicker, NewTicketForm, ExistingTicketSearch, etc.
    hooks/          # useAsyncData, useIssueSearch, useRecentSelections, etc.
  shared/          # Types and IPC channel constants
```

## Tech Stack

- [Electron](https://www.electronjs.org/) + [Electron Forge](https://www.electronforge.io/)
- [React](https://react.dev/) + [Tailwind CSS](https://tailwindcss.com/)
- [@linear/sdk](https://github.com/linear/linear) for the Linear API
- [Vite](https://vitejs.dev/) for bundling
- [electron-store](https://github.com/sindresorhus/electron-store) for encrypted persistence

## License

MIT
