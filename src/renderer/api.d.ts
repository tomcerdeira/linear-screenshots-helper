import type { IpcResult, ScreenshotData, LinearTeam, LinearProject, LinearWorkflowState, LinearLabel, LinearUser, LinearIssueResult, CreateIssueInput, AddCommentInput, AddCommentBgInput, RecentSelections } from '../shared/types';

interface ElectronApi {
  getScreenshot(): Promise<IpcResult<ScreenshotData>>;
  getTeams(): Promise<IpcResult<LinearTeam[]>>;
  getProjects(): Promise<IpcResult<LinearProject[]>>;
  getWorkflowStates(teamId: string): Promise<IpcResult<LinearWorkflowState[]>>;
  getLabels(teamId: string): Promise<IpcResult<LinearLabel[]>>;
  getMembers(teamId: string): Promise<IpcResult<LinearUser[]>>;
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
  showToast(data: { title: string; body: string; url: string }): Promise<IpcResult>;
  createIssueBg(input: CreateIssueInput): Promise<IpcResult>;
  addCommentBg(input: AddCommentBgInput): Promise<IpcResult>;
}

declare global {
  interface Window {
    api: ElectronApi;
  }
}
