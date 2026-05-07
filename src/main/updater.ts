import { app, autoUpdater, dialog } from 'electron';
import type { UpdateInfo, UpdateState, UpdateStatus } from '../shared/types';
import { getAutoCheckForUpdates } from '../services/store';
import { fetchLatestUpdateInfo, GITHUB_REPO } from './update-check';

type InitOptions = {
  readonly showToast: (title: string, body: string, url: string) => void;
};

let initialized = false;
let feedConfigured = false;
let status: UpdateStatus = 'idle';
let currentInfo: UpdateInfo | null = null;
let lastError = '';
let lastCheckWasAutomatic = false;
let showToast: InitOptions['showToast'] | null = null;

function canUseNativeUpdater(): boolean {
  return process.platform === 'darwin' && app.isPackaged;
}

function configureFeed(): void {
  if (feedConfigured || !canUseNativeUpdater()) return;
  const url = `https://update.electronjs.org/${GITHUB_REPO}/darwin-${process.arch}/${app.getVersion()}`;
  autoUpdater.setFeedURL({ url });
  feedConfigured = true;
}

function toInfo(nextStatus: UpdateStatus): UpdateInfo {
  const fallbackUrl = `https://github.com/${GITHUB_REPO}/releases`;
  return {
    hasUpdate: currentInfo?.hasUpdate ?? false,
    currentVersion: app.getVersion(),
    latestVersion: currentInfo?.latestVersion ?? app.getVersion(),
    downloadUrl: currentInfo?.downloadUrl ?? fallbackUrl,
    releaseUrl: currentInfo?.releaseUrl ?? fallbackUrl,
    status: nextStatus,
    canInstall: nextStatus === 'ready' || (currentInfo?.hasUpdate === true && canUseNativeUpdater()),
    error: lastError || undefined,
  };
}

async function promptRestart(): Promise<void> {
  const latestVersion = currentInfo?.latestVersion;
  const { response } = await dialog.showMessageBox({
    type: 'info',
    title: 'Update ready',
    message: latestVersion ? `Linear Screenshot v${latestVersion} is ready to install.` : 'Linear Screenshot update is ready to install.',
    detail: 'Restart now to finish installing the update, or choose Later to keep working.',
    buttons: ['Restart & Install', 'Later'],
    defaultId: 0,
    cancelId: 1,
  });
  if (response === 0) autoUpdater.quitAndInstall();
}

export function initUpdater(options: InitOptions): void {
  if (initialized) return;
  initialized = true;
  showToast = options.showToast;
  configureFeed();

  autoUpdater.on('checking-for-update', () => {
    status = 'checking';
    lastError = '';
  });

  autoUpdater.on('update-available', () => {
    status = 'downloading';
    if (lastCheckWasAutomatic) {
      showToast?.('Update available', `Downloading v${currentInfo?.latestVersion ?? 'latest'} in the background`, '');
    }
  });

  autoUpdater.on('update-not-available', () => {
    status = 'not-available';
  });

  autoUpdater.on('update-downloaded', () => {
    status = 'ready';
    showToast?.('Update downloaded', 'Restart Linear Screenshot to finish installing', '');
    void promptRestart();
  });

  autoUpdater.on('error', (error) => {
    status = 'error';
    lastError = error.message;
    if (!lastCheckWasAutomatic) {
      void dialog.showMessageBox({
        type: 'error',
        title: 'Update failed',
        message: 'Linear Screenshot could not install the update.',
        detail: error.message,
      });
    }
  });
}

export async function checkForUpdates(options?: { readonly automatic?: boolean }): Promise<UpdateInfo> {
  lastCheckWasAutomatic = options?.automatic ?? false;
  status = 'checking';
  lastError = '';

  currentInfo = await fetchLatestUpdateInfo();
  if (!currentInfo.hasUpdate) {
    status = 'not-available';
    return toInfo(status);
  }

  if (!canUseNativeUpdater()) {
    status = 'unsupported';
    return toInfo(status);
  }

  configureFeed();
  status = 'downloading';
  autoUpdater.checkForUpdates();
  return toInfo(status);
}

export function getUpdateState(): UpdateState {
  return {
    status,
    autoCheckEnabled: getAutoCheckForUpdates(),
    currentVersion: app.getVersion(),
    latestVersion: currentInfo?.latestVersion,
    releaseUrl: currentInfo?.releaseUrl,
    canInstall: status === 'ready',
    canAutoUpdate: canUseNativeUpdater(),
    error: lastError || undefined,
  };
}

export async function startUpdateInstall(): Promise<UpdateInfo> {
  if (status === 'ready') {
    autoUpdater.quitAndInstall();
    return toInfo('ready');
  }
  return checkForUpdates({ automatic: false });
}
