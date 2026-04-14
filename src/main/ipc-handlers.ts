import { ipcMain, BrowserWindow, shell, screen } from 'electron';
import { IPC } from '../shared/ipc-channels';
import type { IpcResult, LinearIssueResult, CreateIssueInput, AddCommentInput, ScreenshotData, RecentSelections } from '../shared/types';
import { getApiKey, setApiKey, getEnabled, setEnabled, getRecentSelections, saveLastTeam, saveLastProject, saveRecentTicket } from '../services/store';
import { resetClient } from '../services/linear-client';
import { getTeams, getProjects, getWorkflowStates, getLabels, getMembers, searchIssues, getRecentIssues, createIssue, addCommentWithScreenshot } from '../services/linear-issues';
import { buildToastHtml } from './templates/toast';

let currentScreenshot: ScreenshotData | null = null;

export function setCurrentScreenshot(data: ScreenshotData | null): void {
  currentScreenshot = data;
}

export function registerIpcHandlers(): void {
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
}

function showToastWindow(title: string, body: string, url: string): void {
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

async function wrapAsync<T>(fn: () => Promise<T>): Promise<IpcResult<T>> {
  try {
    const data = await fn();
    return { success: true, data };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    return { success: false, error: message };
  }
}
