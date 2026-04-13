import { ipcMain, BrowserWindow } from 'electron';
import { IPC } from '../shared/ipc-channels';
import type { IpcResult, LinearTeam, LinearProject, LinearIssueResult, CreateIssueInput, AddCommentInput, ScreenshotData, RecentSelections } from '../shared/types';
import { getApiKey, setApiKey, getEnabled, setEnabled, getRecentSelections, saveLastTeam, saveLastProject, saveRecentTicket } from '../services/store';
import { resetClient } from '../services/linear-client';
import { getTeams, getProjects, searchIssues, getRecentIssues, createIssue, addCommentWithScreenshot } from '../services/linear-issues';

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
