import Store from 'electron-store';
import { safeStorage } from 'electron';
import type { AppConfig, LinearIssueResult, RecentSelections } from '../shared/types';

const MAX_RECENT_TICKETS = 5;

interface StoredTicket {
  id: string;
  identifier: string;
  title: string;
  url: string;
}

interface StoreSchema {
  encryptedApiKey: string;
  enabled: boolean;
  hotkey: string;
  collectHotkey: string;
  openQueueHotkey: string;
  lastTeamId: string;
  lastProjectId: string;
  recentTickets: StoredTicket[];
  onboardingComplete: boolean;
  autoCheckForUpdates: boolean;
  lastPromptedUpdateVersion: string;
}

const store = new Store<StoreSchema>({
  defaults: {
    encryptedApiKey: '',
    enabled: true,
    hotkey: 'CommandOrControl+Shift+L',
    collectHotkey: 'Alt+CommandOrControl+Shift+L',
    openQueueHotkey: 'CommandOrControl+Shift+Return',
    lastTeamId: '',
    lastProjectId: '',
    recentTickets: [],
    onboardingComplete: false,
    autoCheckForUpdates: true,
    lastPromptedUpdateVersion: '',
  },
});

export function getApiKey(): string {
  const encrypted = store.get('encryptedApiKey');
  if (!encrypted) return '';

  try {
    return safeStorage.decryptString(Buffer.from(encrypted, 'base64'));
  } catch {
    return '';
  }
}

export function setApiKey(apiKey: string): void {
  if (!apiKey) {
    store.set('encryptedApiKey', '');
    return;
  }
  store.set('encryptedApiKey', safeStorage.encryptString(apiKey).toString('base64'));
}

export function getEnabled(): boolean {
  return store.get('enabled');
}

export function setEnabled(enabled: boolean): void {
  store.set('enabled', enabled);
}

export function getHotkey(): string {
  return store.get('hotkey');
}

export function setHotkey(hotkey: string): void {
  store.set('hotkey', hotkey);
}

export function getCollectHotkey(): string {
  return store.get('collectHotkey');
}

export function setCollectHotkey(hotkey: string): void {
  store.set('collectHotkey', hotkey);
}

export function getOpenQueueHotkey(): string {
  return store.get('openQueueHotkey');
}

export function setOpenQueueHotkey(hotkey: string): void {
  store.set('openQueueHotkey', hotkey);
}

export function getConfig(): AppConfig {
  return {
    linearApiKey: getApiKey(),
    hotkey: getHotkey(),
    enabled: getEnabled(),
  };
}

export function getRecentSelections(): RecentSelections {
  return {
    lastTeamId: store.get('lastTeamId'),
    lastProjectId: store.get('lastProjectId'),
    recentTickets: store.get('recentTickets'),
  };
}

export function saveLastTeam(teamId: string): void {
  store.set('lastTeamId', teamId);
}

export function saveLastProject(projectId: string): void {
  store.set('lastProjectId', projectId);
}

export function saveRecentTicket(ticket: LinearIssueResult): void {
  const current = store.get('recentTickets');
  const filtered = current.filter((t) => t.id !== ticket.id);
  const updated = [ticket, ...filtered].slice(0, MAX_RECENT_TICKETS);
  store.set('recentTickets', updated);
}

export function getOnboardingComplete(): boolean {
  return store.get('onboardingComplete');
}

export function setOnboardingComplete(complete: boolean): void {
  store.set('onboardingComplete', complete);
}

export function getAutoCheckForUpdates(): boolean {
  return store.get('autoCheckForUpdates');
}

export function setAutoCheckForUpdates(enabled: boolean): void {
  store.set('autoCheckForUpdates', enabled);
}

export function getLastPromptedUpdateVersion(): string {
  return store.get('lastPromptedUpdateVersion');
}

export function setLastPromptedUpdateVersion(version: string): void {
  store.set('lastPromptedUpdateVersion', version);
}
