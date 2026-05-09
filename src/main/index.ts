import { app, globalShortcut, systemPreferences, dialog, shell, ipcMain, nativeImage } from 'electron';
import path from 'node:path';
import { IPC } from '../shared/ipc-channels';
import started from 'electron-squirrel-startup';
import { createTray, updateTrayMenu } from './tray';
import { captureScreenshot } from './screenshot';
import { createPopupWindow, createSettingsWindow, getSettingsWindow } from './windows';
import { registerIpcHandlers, setCurrentScreenshot, addToScreenshotQueue, getScreenshotQueueCount, flushScreenshotQueue, snapshotScreenshotQueue, clearActiveQueueSnapshot, showToastWindow } from './ipc-handlers';
import { hasApiKey } from '../services/linear-client';
import { getEnabled, getHotkey, getCollectHotkey, getOpenQueueHotkey, getRecentSelections, getOnboardingComplete, setOnboardingComplete, getAutoCheckForUpdates, getLastPromptedUpdateVersion, setLastPromptedUpdateVersion } from '../services/store';
import { showOverlay, closeOverlay } from './overlay';
import { getTeams, getProjects, getWorkflowStates, getLabels, getMembers } from '../services/linear-issues';
import { initUpdater, checkForUpdates as runNativeUpdateCheck } from './updater';
import { fetchLatestUpdateInfo } from './update-check';

if (started) app.quit();

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
  onWelcome: () => openWelcome(),
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
  // Snapshot the live queue so renderer reads are idempotent (StrictMode-safe).
  // The snapshot is cleared when the popup closes.
  setCurrentScreenshot(null);
  snapshotScreenshotQueue();

  openPopup('queue');
  updateTrayMenu(trayCallbacks);
}

function clearQueue(): void {
  flushScreenshotQueue();
  updateTrayMenu(trayCallbacks);
}

function waitForRendererReady(popup: Electron.BrowserWindow, timeoutMs = 1500): Promise<void> {
  return new Promise((resolve) => {
    let done = false;
    const finish = (): void => {
      if (done) return;
      done = true;
      ipcMain.removeListener(IPC.RENDERER_READY, onSignal);
      resolve();
    };
    const onSignal = (event: Electron.IpcMainEvent): void => {
      if (event.sender === popup.webContents) finish();
    };
    ipcMain.on(IPC.RENDERER_READY, onSignal);
    popup.once('closed', finish);
    setTimeout(finish, timeoutMs);
  });
}

function fadeInWindow(win: Electron.BrowserWindow, durationMs = 120): void {
  // Caller is expected to have setOpacity(0) and show() the window already,
  // so the first visible frame is at opacity 0 — avoiding any flash.
  const steps = 8;
  const stepMs = durationMs / steps;
  let i = 0;
  const tick = (): void => {
    if (win.isDestroyed()) return;
    i++;
    win.setOpacity(Math.min(1, i / steps));
    if (i < steps) setTimeout(tick, stepMs);
  };
  setTimeout(tick, stepMs);
}

function openPopup(mode?: 'queue'): void {
  const popup = createPopupWindow();
  let ready = false;
  const dismiss = () => { if (ready && !popup.isDestroyed()) popup.close(); };
  showOverlay(dismiss);
  popup.on('closed', () => {
    closeOverlay();
    clearActiveQueueSnapshot();
    updateTrayMenu(trayCallbacks);
  });
  popup.webContents.once('did-finish-load', () => {
    if (mode === 'queue') {
      popup.webContents.send('mode', 'queue');
    }
  });
  void waitForRendererReady(popup).then(() => {
    if (popup.isDestroyed()) return;
    popup.setOpacity(0);
    popup.show();
    popup.focus();
    fadeInWindow(popup);
    setTimeout(() => {
      ready = true;
      popup.on('blur', dismiss);
    }, 200);
  });
}

function openWelcome(): void {
  setOnboardingComplete(false);
  openSettings();
}

function updateDockVisibility(): void {
  if (process.platform !== 'darwin') return;
  const settings = getSettingsWindow();
  if (settings) {
    void app.dock?.show();
  } else {
    app.dock?.hide();
  }
}

function openSettings(): void {
  setCurrentScreenshot(null);

  const win = createSettingsWindow();
  updateDockVisibility();

  win.webContents.once('did-finish-load', () => {
    win.webContents.send('navigate', 'settings');
  });

  win.once('closed', () => {
    updateDockVisibility();
  });

  void waitForRendererReady(win).then(() => {
    if (win.isDestroyed()) return;
    win.show();
    win.focus();
  });
}

// Keep backward compat — the old name was registerHotkey (singular)
function registerHotkey(): void {
  registerHotkeys();
}

function applyDockIcon(): void {
  if (process.platform !== 'darwin' || app.isPackaged) return;
  const iconPath = path.join(app.getAppPath(), 'assets', 'icon.png');
  const icon = nativeImage.createFromPath(iconPath);
  if (!icon.isEmpty()) app.dock?.setIcon(icon);
}

app.on('ready', () => {
  if (process.platform === 'darwin') {
    app.dock?.hide();
  }
  applyDockIcon();

  registerIpcHandlers({ onHotkeyChanged: registerHotkey });
  initUpdater({ showToast: showToastWindow });
  createTray(trayCallbacks);
  if (getEnabled()) registerHotkeys();
  prefetchData();
  scheduleUpdateCheck();

  if (!getOnboardingComplete()) {
    openSettings();
  }
});

const UPDATE_CHECK_STARTUP_DELAY_MS = 7_000;
const UPDATE_CHECK_INTERVAL_MS = 4 * 60 * 60 * 1000;

function runScheduledUpdateCheck(): void {
  if (getAutoCheckForUpdates()) {
    runNativeUpdateCheck({ automatic: true }).catch(() => {
      // Background checks should never interrupt capture flow.
    });
    return;
  }

  fetchLatestUpdateInfo().then((info) => {
    if (!info.hasUpdate || getLastPromptedUpdateVersion() === info.latestVersion) return;
    setLastPromptedUpdateVersion(info.latestVersion);
    showToastWindow(
      'Update available',
      `v${info.latestVersion} is available — open Settings to install`,
      '',
    );
  }).catch(() => {
    // Non-blocking disabled-auto prompt; ignore transient network failures.
  });
}

function scheduleUpdateCheck(): void {
  setTimeout(() => {
    runScheduledUpdateCheck();
    setInterval(runScheduledUpdateCheck, UPDATE_CHECK_INTERVAL_MS);
  }, UPDATE_CHECK_STARTUP_DELAY_MS);
}

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
