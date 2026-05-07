import type { IpcResult, ScreenshotData, LinearTeam, LinearProject, LinearWorkflowState, LinearLabel, LinearUser, LinearIssueResult, CreateIssueInput, AddCommentInput, AddCommentBgInput, RecentSelections, UpdateInfo, UpdateState } from '../shared/types';

interface ElectronApi {
  getScreenshot(): Promise<IpcResult<ScreenshotData>>;
  getScreenshotQueue(): Promise<IpcResult<ScreenshotData[]>>;
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
  getHotkey(): Promise<IpcResult<string>>;
  setHotkey(hotkey: string): Promise<IpcResult>;
  getCollectHotkey(): Promise<IpcResult<string>>;
  setCollectHotkey(hotkey: string): Promise<IpcResult>;
  getOpenQueueHotkey(): Promise<IpcResult<string>>;
  setOpenQueueHotkey(hotkey: string): Promise<IpcResult>;
  openSettings(): Promise<void>;
  closeWindow(): Promise<IpcResult>;
  getRecentSelections(): Promise<IpcResult<RecentSelections>>;
  saveLastTeam(teamId: string): Promise<IpcResult>;
  saveLastProject(projectId: string): Promise<IpcResult>;
  saveRecentTicket(ticket: LinearIssueResult): Promise<IpcResult>;
  showToast(data: { title: string; body: string; url: string }): Promise<IpcResult>;
  createIssueBg(input: CreateIssueInput): Promise<IpcResult>;
  addCommentBg(input: AddCommentBgInput): Promise<IpcResult>;
  checkForUpdates(): Promise<IpcResult<UpdateInfo>>;
  getUpdateState(): Promise<IpcResult<UpdateState>>;
  startUpdateInstall(): Promise<IpcResult<UpdateInfo>>;
  getAppVersion(): Promise<IpcResult<string>>;
  openExternal(url: string): Promise<IpcResult>;
  getAutoCheckForUpdates(): Promise<IpcResult<boolean>>;
  setAutoCheckForUpdates(enabled: boolean): Promise<IpcResult>;
  getOnboardingComplete(): Promise<IpcResult<boolean>>;
  setOnboardingComplete(complete: boolean): Promise<IpcResult>;
  signalReady(): void;
}

declare global {
  interface Window {
    api: ElectronApi;
  }
}
