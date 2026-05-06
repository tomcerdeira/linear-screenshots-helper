import { BrowserWindow, screen } from 'electron';

let overlays: BrowserWindow[] = [];
let onDismiss: (() => void) | null = null;

export function showOverlay(dismissCallback: () => void): void {
  closeOverlay();
  onDismiss = dismissCallback;

  const displays = screen.getAllDisplays();

  for (const display of displays) {
    const { x, y, width, height } = display.bounds;

    const overlay = new BrowserWindow({
      x,
      y,
      width,
      height,
      show: false,
      frame: false,
      transparent: true,
      alwaysOnTop: true,
      skipTaskbar: true,
      resizable: false,
      movable: false,
      focusable: true,
      hasShadow: false,
      paintWhenInitiallyHidden: true,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
      },
    });

    overlay.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
    overlay.setAlwaysOnTop(true, 'normal');
    overlay.once('ready-to-show', () => {
      if (!overlay.isDestroyed()) overlay.showInactive();
    });

    const html = `<!DOCTYPE html>
<html><head><style>
  * { margin: 0; padding: 0; }
  body {
    background: rgba(0, 0, 0, 0.4);
    width: 100vw; height: 100vh;
    cursor: default;
    opacity: 0;
    animation: fadeIn 100ms ease-out forwards;
  }
  @keyframes fadeIn { to { opacity: 1; } }
</style></head>
<body>
<script>
  document.body.addEventListener('mousedown', () => {
    document.title = 'dismiss';
  });
</script>
</body></html>`;

    overlay.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);

    overlay.webContents.on('page-title-updated', () => {
      if (onDismiss) onDismiss();
    });

    overlays.push(overlay);
  }
}

export function closeOverlay(): void {
  onDismiss = null;
  for (const overlay of overlays) {
    if (!overlay.isDestroyed()) overlay.close();
  }
  overlays = [];
}
