import type { IpcResult, ScreenshotData, LinearTeam, LinearProject, LinearIssueResult, CreateIssueInput, AddCommentInput, RecentSelections } from '../shared/types';

interface ElectronApi {
  getScreenshot(): Promise<IpcResult<ScreenshotData>>;
  getTeams(): Promise<IpcResult<LinearTeam[]>>;
  getProjects(): Promise<IpcResult<LinearProject[]>>;
  searchIssues(query: string): Promise<IpcResult<LinearIssueResult[]>>;
  getRecentIssues(): Promise<IpcResult<LinearIssueResult[]>>;
  createIssue(input: CreateIssueInput): Promise<IpcResult<LinearIssueResult>>;
  addComment(input: AddCommentInput): Promise<IpcResult<{ success: boolean }>>;
  getApiKey(): Promise<IpcResult<string>>;
  setApiKey(key: string): Promise<IpcResult>;
  getEnabled(): Promise<IpcResult<boolean>>;
  setEnabled(enabled: boolean): Promise<IpcResult>;
  openSettings(): Promise<void>;
  closeWindow(): Promise<IpcResult>;
  getRecentSelections(): Promise<IpcResult<RecentSelections>>;
  saveLastTeam(teamId: string): Promise<IpcResult>;
  saveLastProject(projectId: string): Promise<IpcResult>;
  saveRecentTicket(ticket: LinearIssueResult): Promise<IpcResult>;
}

declare global {
  interface Window {
    api: ElectronApi;
  }
}
