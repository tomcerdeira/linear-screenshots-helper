import { Tray, Menu, nativeImage, app } from 'electron';
import path from 'node:path';
import { getEnabled, setEnabled } from '../services/store';

let tray: Tray | null = null;

type TrayCallbacks = {
  readonly onToggle: (enabled: boolean) => void;
  readonly onSettings: () => void;
  readonly onCapture: () => void;
  readonly onOpenQueue?: () => void;
  readonly onClearQueue?: () => void;
  readonly getQueueCount?: () => number;
  readonly onWelcome?: () => void;
};

function getTrayIconPath(): string {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'trayTemplate.png');
  }
  return path.join(app.getAppPath(), 'assets', 'trayTemplate.png');
}

export function createTray(callbacks: TrayCallbacks): Tray {
  const icon = nativeImage.createFromPath(getTrayIconPath());
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
    { label: 'Welcome Guide', click: callbacks.onWelcome },
    { type: 'separator' },
    { label: 'Quit', click: () => app.quit() },
  ]));

  // Update title to show queue count
  tray.setTitle(queueCount > 0 ? `${queueCount}` : '');
}
