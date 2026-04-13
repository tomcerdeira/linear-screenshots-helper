import { app, globalShortcut, systemPreferences, dialog, shell } from 'electron';
import started from 'electron-squirrel-startup';
import { createTray } from './tray';
import { captureScreenshot } from './screenshot';
import { createPopupWindow } from './windows';
import { registerIpcHandlers, setCurrentScreenshot } from './ipc-handlers';
import { hasApiKey } from '../services/linear-client';
import { getEnabled, getHotkey } from '../services/store';

if (started) app.quit();

if (process.platform === 'darwin') {
  app.dock?.hide();
}

const SCREEN_SETTINGS_URL = 'x-apple.systempreferences:com.apple.preference.security?Privacy_ScreenCapture';

const trayCallbacks = {
  onCapture: () => handleCapture(),
  onSettings: () => openSettings(),
  onToggle: (enabled: boolean) => {
    if (enabled) registerHotkey();
    else globalShortcut.unregisterAll();
  },
};

function registerHotkey(): void {
  const hotkey = getHotkey();
  globalShortcut.unregisterAll();

  if (!globalShortcut.register(hotkey, handleCapture)) {
    dialog.showErrorBox(
      'Hotkey Registration Failed',
      `Could not register ${hotkey}. It may be in use by another application.`,
    );
  }
}

async function handleCapture(): Promise<void> {
  if (!getEnabled()) return;

  if (!hasApiKey()) {
    openSettings();
    return;
  }

  if (process.platform === 'darwin') {
    const status = systemPreferences.getMediaAccessStatus('screen');
    if (status !== 'granted') {
      const { response } = await dialog.showMessageBox({
        type: 'warning',
        title: 'Screen Recording Permission Required',
        message: 'Linear Screenshot needs Screen Recording permission.',
        detail: 'Go to System Settings > Privacy & Security > Screen Recording.',
        buttons: ['Open System Settings', 'Cancel'],
      });
      if (response === 0) shell.openExternal(SCREEN_SETTINGS_URL);
      return;
    }
  }

  const screenshot = await captureScreenshot();
  if (!screenshot) return;

  setCurrentScreenshot(screenshot);

  const popup = createPopupWindow();
  popup.webContents.once('did-finish-load', () => {
    popup.show();
    popup.focus();
  });
}

function openSettings(): void {
  setCurrentScreenshot(null);
  const popup = createPopupWindow();
  popup.webContents.once('did-finish-load', () => {
    popup.webContents.send('navigate', 'settings');
    popup.show();
    popup.focus();
  });
}

app.on('ready', () => {
  registerIpcHandlers();
  createTray(trayCallbacks);
  if (getEnabled()) registerHotkey();
});

app.on('will-quit', () => globalShortcut.unregisterAll());

app.on('window-all-closed', () => {
  // Tray app — don't quit when windows close
});
