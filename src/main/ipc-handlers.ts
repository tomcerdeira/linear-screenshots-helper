import { ipcMain, BrowserWindow, shell, screen, app } from 'electron';
import { IPC } from '../shared/ipc-channels';
import type { IpcResult, LinearIssueResult, CreateIssueInput, AddCommentInput, ScreenshotData, RecentSelections, UpdateInfo } from '../shared/types';
import { getApiKey, setApiKey, getEnabled, setEnabled, getHotkey, setHotkey, getCollectHotkey, setCollectHotkey, getOpenQueueHotkey, setOpenQueueHotkey, getRecentSelections, saveLastTeam, saveLastProject, saveRecentTicket } from '../services/store';
import { resetClient } from '../services/linear-client';
import { getTeams, getProjects, getWorkflowStates, getLabels, getMembers, searchIssues, getRecentIssues, createIssue, addCommentWithScreenshot } from '../services/linear-issues';
import { buildToastHtml } from './templates/toast';

let currentScreenshot: ScreenshotData | null = null;
const screenshotQueue: ScreenshotData[] = [];

export function setCurrentScreenshot(data: ScreenshotData | null): void {
  currentScreenshot = data;
}

export function addToScreenshotQueue(data: ScreenshotData): void {
  screenshotQueue.push(data);
}

export function getScreenshotQueueCount(): number {
  return screenshotQueue.length;
}

export function flushScreenshotQueue(): ScreenshotData[] {
  const items = [...screenshotQueue];
  screenshotQueue.length = 0;
  return items;
}

let onHotkeyChanged: ((hotkey: string) => void) | null = null;

export function registerIpcHandlers(callbacks?: { onHotkeyChanged?: (hotkey: string) => void }): void {
  onHotkeyChanged = callbacks?.onHotkeyChanged ?? null;
  ipcMain.handle(IPC.GET_SCREENSHOT_QUEUE, (): IpcResult<ScreenshotData[]> => {
    return { success: true, data: flushScreenshotQueue() };
  });

  ipcMain.handle(IPC.GET_QUEUE_COUNT, (): IpcResult<number> => {
    return { success: true, data: screenshotQueue.length };
  });

  ipcMain.handle(IPC.GET_SCREENSHOT, (): IpcResult<ScreenshotData> => {
    if (!currentScreenshot) {
      return { success: false, error: 'No screenshot available' };
    }
    return { success: true, data: currentScreenshot };
  });

  ipcMain.handle(IPC.GET_TEAMS, () => wrapAsync(() => getTeams()));
  ipcMain.handle(IPC.GET_PROJECTS, () => wrapAsync(() => getProjects()));
  ipcMain.handle(IPC.GET_WORKFLOW_STATES, (_e, teamId: string) => wrapAsync(() => getWorkflowStates(teamId)));
  ipcMain.handle(IPC.GET_LABELS, (_e, teamId: string) => wrapAsync(() => getLabels(teamId)));
  ipcMain.handle(IPC.GET_MEMBERS, (_e, teamId: string) => wrapAsync(() => getMembers(teamId)));
  ipcMain.handle(IPC.SEARCH_ISSUES, (_e, query: string) => wrapAsync(() => searchIssues(query)));
  ipcMain.handle(IPC.GET_RECENT_ISSUES, () => wrapAsync(() => getRecentIssues()));
  ipcMain.handle(IPC.CREATE_ISSUE, (_e, input: CreateIssueInput) => wrapAsync(() => createIssue(input)));

  ipcMain.handle(IPC.ADD_COMMENT, (_e, input: AddCommentInput) =>
    wrapAsync(() => addCommentWithScreenshot(input.issueId, input.comment, input.screenshotDataUrl)),
  );

  ipcMain.handle(IPC.GET_API_KEY, (): IpcResult<string> => {
    const key = getApiKey();
    const masked = key ? `${key.slice(0, 8)}...${key.slice(-4)}` : '';
    return { success: true, data: masked };
  });

  ipcMain.handle(IPC.SET_API_KEY, (_e, key: string): IpcResult => {
    setApiKey(key);
    resetClient();
    return { success: true };
  });

  ipcMain.handle(IPC.GET_ENABLED, (): IpcResult<boolean> => {
    return { success: true, data: getEnabled() };
  });

  ipcMain.handle(IPC.SET_ENABLED, (_e, enabled: boolean): IpcResult => {
    setEnabled(enabled);
    return { success: true };
  });

  ipcMain.handle(IPC.GET_HOTKEY, (): IpcResult<string> => {
    return { success: true, data: getHotkey() };
  });

  ipcMain.handle(IPC.SET_HOTKEY, (_e, hotkey: string): IpcResult => {
    setHotkey(hotkey);
    if (onHotkeyChanged) onHotkeyChanged(hotkey);
    return { success: true };
  });

  ipcMain.handle(IPC.GET_COLLECT_HOTKEY, (): IpcResult<string> => {
    return { success: true, data: getCollectHotkey() };
  });

  ipcMain.handle(IPC.SET_COLLECT_HOTKEY, (_e, hotkey: string): IpcResult => {
    setCollectHotkey(hotkey);
    if (onHotkeyChanged) onHotkeyChanged(hotkey);
    return { success: true };
  });

  ipcMain.handle(IPC.GET_OPEN_QUEUE_HOTKEY, (): IpcResult<string> => {
    return { success: true, data: getOpenQueueHotkey() };
  });

  ipcMain.handle(IPC.SET_OPEN_QUEUE_HOTKEY, (_e, hotkey: string): IpcResult => {
    setOpenQueueHotkey(hotkey);
    if (onHotkeyChanged) onHotkeyChanged(hotkey);
    return { success: true };
  });

  ipcMain.handle(IPC.CLOSE_WINDOW, (event): IpcResult => {
    BrowserWindow.fromWebContents(event.sender)?.close();
    return { success: true };
  });

  ipcMain.handle(IPC.GET_RECENT_SELECTIONS, (): IpcResult<RecentSelections> => {
    return { success: true, data: getRecentSelections() };
  });

  ipcMain.handle(IPC.SAVE_LAST_TEAM, (_e, teamId: string): IpcResult => {
    saveLastTeam(teamId);
    return { success: true };
  });

  ipcMain.handle(IPC.SAVE_LAST_PROJECT, (_e, projectId: string): IpcResult => {
    saveLastProject(projectId);
    return { success: true };
  });

  ipcMain.handle(IPC.SAVE_RECENT_TICKET, (_e, ticket: LinearIssueResult): IpcResult => {
    saveRecentTicket(ticket);
    return { success: true };
  });

  ipcMain.handle(IPC.SHOW_TOAST, (_e, { title, body, url }: { title: string; body: string; url: string }): IpcResult => {
    showToastWindow(title, body, url);
    return { success: true };
  });

  ipcMain.handle(IPC.CREATE_ISSUE_BG, (_e, input: CreateIssueInput): IpcResult => {
    createIssue(input).then((issue) => {
      saveRecentTicket(issue);
      showToastWindow('Issue created', `${issue.identifier} — ${issue.title}`, issue.url);
    }).catch((err) => {
      const msg = err instanceof Error ? err.message : 'Failed to create issue';
      showToastWindow('Error', msg, '');
    });
    return { success: true };
  });

  ipcMain.handle(IPC.ADD_COMMENT_BG, (_e, input: AddCommentInput & { issueIdentifier?: string; issueTitle?: string; issueUrl?: string }): IpcResult => {
    const displayName = input.issueIdentifier
      ? `${input.issueIdentifier} — ${input.issueTitle ?? ''}`
      : input.issueId;

    addCommentWithScreenshot(input.issueId, input.comment, input.screenshotDataUrl).then(() => {
      showToastWindow('Screenshot attached', displayName, input.issueUrl ?? '');
    }).catch((err) => {
      const msg = err instanceof Error ? err.message : 'Failed to attach screenshot';
      showToastWindow('Error', msg, '');
    });
    return { success: true };
  });

  ipcMain.handle(IPC.GET_APP_VERSION, (): IpcResult<string> => {
    return { success: true, data: app.getVersion() };
  });

  ipcMain.handle(IPC.CHECK_FOR_UPDATES, () => wrapAsync(() => checkForUpdates()));

  ipcMain.handle(IPC.OPEN_EXTERNAL, (_e, url: string): IpcResult => {
    shell.openExternal(url);
    return { success: true };
  });
}

export function showToastWindow(title: string, body: string, url: string): void {
  const TOAST_WIDTH = 360;
  const TOAST_HEIGHT = 96;
  const MARGIN = 16;
  const DURATION = 4500;

  const cursorPoint = screen.getCursorScreenPoint();
  const display = screen.getDisplayNearestPoint(cursorPoint);
  const { x, y, width, height } = display.workArea;

  const toast = new BrowserWindow({
    x: x + width - TOAST_WIDTH - MARGIN,
    y: y + height - TOAST_HEIGHT - MARGIN,
    width: TOAST_WIDTH,
    height: TOAST_HEIGHT,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    movable: false,
    focusable: false,
    hasShadow: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  toast.setVisibleOnAllWorkspaces(true);
  toast.setIgnoreMouseEvents(false);

  const html = buildToastHtml(title, body, url, DURATION);

  toast.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);

  toast.webContents.setWindowOpenHandler(({ url: targetUrl }) => {
    shell.openExternal(targetUrl);
    return { action: 'deny' };
  });

  setTimeout(() => {
    if (!toast.isDestroyed()) toast.close();
  }, DURATION + 500);
}

const GITHUB_REPO = 'tomcerdeira/linear-screenshots-helper';

function compareVersions(current: string, latest: string): boolean {
  const parse = (v: string) => v.replace(/^v/, '').split('.').map(Number);
  const c = parse(current);
  const l = parse(latest);
  for (let i = 0; i < 3; i++) {
    if ((l[i] ?? 0) > (c[i] ?? 0)) return true;
    if ((l[i] ?? 0) < (c[i] ?? 0)) return false;
  }
  return false;
}

async function checkForUpdates(): Promise<UpdateInfo> {
  const res = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/releases/latest`);
  if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);

  const release = await res.json() as { tag_name: string; html_url: string; assets: { browser_download_url: string; name: string }[] };
  const latestVersion = release.tag_name.replace(/^v/, '');
  const currentVersion = app.getVersion();

  const dmgAsset = release.assets.find((a: { name: string }) => a.name.endsWith('.dmg'));
  const zipAsset = release.assets.find((a: { name: string }) => a.name.endsWith('.zip'));
  const downloadUrl = dmgAsset?.browser_download_url ?? zipAsset?.browser_download_url ?? release.html_url;

  return {
    hasUpdate: compareVersions(currentVersion, latestVersion),
    currentVersion,
    latestVersion,
    downloadUrl,
    releaseUrl: release.html_url,
  };
}

async function wrapAsync<T>(fn: () => Promise<T>): Promise<IpcResult<T>> {
  try {
    const data = await fn();
    return { success: true, data };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    return { success: false, error: message };
  }
}
