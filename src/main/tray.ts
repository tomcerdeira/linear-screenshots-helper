import { Tray, Menu, nativeImage, app } from 'electron';
import { getEnabled, setEnabled } from '../services/store';

const ICON_SIZE = 16;
const ICON_RADIUS_SQ = 36;
const ICON_CENTER = 7.5;
const LINEAR_PURPLE = { r: 94, g: 106, b: 210 };

let tray: Tray | null = null;

type TrayCallbacks = {
  readonly onToggle: (enabled: boolean) => void;
  readonly onSettings: () => void;
  readonly onCapture: () => void;
  readonly onOpenQueue?: () => void;
  readonly onClearQueue?: () => void;
  readonly getQueueCount?: () => number;
};

export function createTray(callbacks: TrayCallbacks): Tray {
  const icon = nativeImage.createFromBuffer(createTrayIconBuffer());
  icon.setTemplateImage(true);

  tray = new Tray(icon);
  tray.setToolTip('Linear Screenshot');
  updateTrayMenu(callbacks);

  return tray;
}

export function updateTrayMenu(callbacks: TrayCallbacks): void {
  if (!tray) return;

  const enabled = getEnabled();
  const queueCount = callbacks.getQueueCount?.() ?? 0;

  const menuItems: Electron.MenuItemConstructorOptions[] = [
    {
      label: 'Capture Screenshot',
      accelerator: 'CommandOrControl+Shift+L',
      click: callbacks.onCapture,
      enabled,
    },
  ];

  if (queueCount > 0) {
    menuItems.push({
      label: `Open Issue (${queueCount} screenshot${queueCount > 1 ? 's' : ''} queued)`,
      click: callbacks.onOpenQueue!,
      enabled: true,
    });
    menuItems.push({
      label: 'Clear Queue',
      click: callbacks.onClearQueue!,
      enabled: true,
    });
  }

  tray.setContextMenu(Menu.buildFromTemplate([
    ...menuItems,
    { type: 'separator' },
    {
      label: enabled ? 'Disable' : 'Enable',
      click: () => {
        const next = !getEnabled();
        setEnabled(next);
        callbacks.onToggle(next);
        updateTrayMenu(callbacks);
      },
    },
    { label: 'Settings...', click: callbacks.onSettings },
    { type: 'separator' },
    { label: 'Quit', click: () => app.quit() },
  ]));

  // Update title to show queue count
  tray.setTitle(queueCount > 0 ? `${queueCount}` : '');
}

function createTrayIconBuffer(): Buffer {
  const canvas = Buffer.alloc(ICON_SIZE * ICON_SIZE * 4);

  for (let y = 0; y < ICON_SIZE; y++) {
    for (let x = 0; x < ICON_SIZE; x++) {
      const idx = (y * ICON_SIZE + x) * 4;
      const inCircle =
        Math.pow(x - ICON_CENTER, 2) + Math.pow(y - ICON_CENTER, 2) < ICON_RADIUS_SQ;

      if (inCircle) {
        canvas[idx] = LINEAR_PURPLE.r;
        canvas[idx + 1] = LINEAR_PURPLE.g;
        canvas[idx + 2] = LINEAR_PURPLE.b;
        canvas[idx + 3] = 255;
      } else {
        canvas[idx + 3] = 0;
      }
    }
  }

  return nativeImage.createFromBuffer(canvas, { width: ICON_SIZE, height: ICON_SIZE }).toPNG();
}
