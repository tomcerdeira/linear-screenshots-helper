import { app, globalShortcut, systemPreferences, dialog, shell } from 'electron';
import started from 'electron-squirrel-startup';
import { createTray, updateTrayMenu } from './tray';
import { captureScreenshot } from './screenshot';
import { createPopupWindow } from './windows';
import { registerIpcHandlers, setCurrentScreenshot, addToScreenshotQueue, getScreenshotQueueCount, flushScreenshotQueue, showToastWindow } from './ipc-handlers';
import { hasApiKey } from '../services/linear-client';
import { getEnabled, getHotkey, getCollectHotkey, getOpenQueueHotkey, getRecentSelections } from '../services/store';
import { showOverlay, closeOverlay } from './overlay';
import { getTeams, getProjects, getWorkflowStates, getLabels, getMembers } from '../services/linear-issues';

if (started) app.quit();

if (process.platform === 'darwin') {
  app.dock?.hide();
}

const SCREEN_SETTINGS_URL = 'x-apple.systempreferences:com.apple.preference.security?Privacy_ScreenCapture';

const trayCallbacks = {
  onCapture: () => handleCapture(),
  onSettings: () => openSettings(),
  onToggle: (enabled: boolean) => {
    if (enabled) registerHotkeys();
    else globalShortcut.unregisterAll();
  },
  onOpenQueue: () => openIssueWithQueue(),
  onClearQueue: () => clearQueue(),
  getQueueCount: () => getScreenshotQueueCount(),
};

function registerHotkeys(): void {
  const hotkey = getHotkey();
  globalShortcut.unregisterAll();

  // Main hotkey: capture + open (or open with queue if items queued)
  if (!globalShortcut.register(hotkey, handleCapture)) {
    dialog.showErrorBox(
      'Hotkey Registration Failed',
      `Could not register ${hotkey}. It may be in use by another application.`,
    );
  }

  // Collect mode hotkey
  const collectHotkey = getCollectHotkey();
  globalShortcut.register(collectHotkey, handleCollectCapture);

  // Open queue hotkey
  const openQueueHotkey = getOpenQueueHotkey();
  globalShortcut.register(openQueueHotkey, () => {
    if (getScreenshotQueueCount() > 0) openIssueWithQueue();
  });
}

async function checkScreenPermission(): Promise<boolean> {
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
      return false;
    }
  }
  return true;
}

async function handleCapture(): Promise<void> {
  if (!getEnabled()) return;
  if (!hasApiKey()) { openSettings(); return; }
  if (!(await checkScreenPermission())) return;

  const screenshot = await captureScreenshot();
  if (!screenshot) return;

  setCurrentScreenshot(screenshot);
  openPopup();
}

async function handleCollectCapture(): Promise<void> {
  if (!getEnabled()) return;
  if (!hasApiKey()) { openSettings(); return; }
  if (!(await checkScreenPermission())) return;

  const screenshot = await captureScreenshot();
  if (!screenshot) return;

  addToScreenshotQueue(screenshot);
  updateTrayMenu(trayCallbacks);

  const count = getScreenshotQueueCount();
  showToastWindow(
    'Screenshot queued',
    `${count} screenshot${count > 1 ? 's' : ''} collected \u2014 press capture hotkey to open issue`,
    '',
  );
}

function openIssueWithQueue(): void {
  // The queue items will be fetched by the renderer via GET_SCREENSHOT_QUEUE
  // Set currentScreenshot to null so the renderer knows to check the queue
  setCurrentScreenshot(null);

  openPopup('queue');
  updateTrayMenu(trayCallbacks);
}

function clearQueue(): void {
  flushScreenshotQueue();
  updateTrayMenu(trayCallbacks);
}

function openPopup(mode?: 'queue'): void {
  const popup = createPopupWindow();
  let ready = false;
  const dismiss = () => { if (ready && !popup.isDestroyed()) popup.close(); };
  showOverlay(dismiss);
  popup.on('closed', () => {
    closeOverlay();
    updateTrayMenu(trayCallbacks);
  });
  popup.webContents.once('did-finish-load', () => {
    if (mode === 'queue') {
      popup.webContents.send('mode', 'queue');
    }
    popup.show();
    popup.focus();
    setTimeout(() => {
      ready = true;
      popup.on('blur', dismiss);
    }, 200);
  });
}

function openSettings(): void {
  setCurrentScreenshot(null);

  const popup = createPopupWindow({ height: 560 });
  let ready = false;
  const dismiss = () => { if (ready && !popup.isDestroyed()) popup.close(); };
  showOverlay(dismiss);
  popup.on('closed', () => closeOverlay());
  popup.webContents.once('did-finish-load', () => {
    popup.webContents.send('navigate', 'settings');
    popup.show();
    popup.focus();
    setTimeout(() => {
      ready = true;
      popup.on('blur', dismiss);
    }, 200);
  });
}

// Keep backward compat — the old name was registerHotkey (singular)
function registerHotkey(): void {
  registerHotkeys();
}

app.on('ready', () => {
  registerIpcHandlers({ onHotkeyChanged: registerHotkey });
  createTray(trayCallbacks);
  if (getEnabled()) registerHotkeys();
  prefetchData();
});

function prefetchData(): void {
  if (!hasApiKey()) return;

  getTeams().catch(() => { /* prefetch — errors are non-fatal */ });
  getProjects().catch(() => { /* prefetch — errors are non-fatal */ });

  const { lastTeamId } = getRecentSelections();
  if (lastTeamId) {
    getWorkflowStates(lastTeamId).catch(() => { /* prefetch — errors are non-fatal */ });
    getLabels(lastTeamId).catch(() => { /* prefetch — errors are non-fatal */ });
    getMembers(lastTeamId).catch(() => { /* prefetch — errors are non-fatal */ });
  }
}

app.on('will-quit', () => globalShortcut.unregisterAll());

app.on('window-all-closed', () => {
  // Tray app — don't quit when windows close
});
