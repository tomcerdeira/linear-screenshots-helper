export interface ScreenshotData {
  readonly dataUrl: string;
  readonly width: number;
  readonly height: number;
  readonly timestamp: number;
}

export interface AppConfig {
  readonly linearApiKey: string;
  readonly hotkey: string;
  readonly enabled: boolean;
}

export interface LinearTeam {
  readonly id: string;
  readonly name: string;
  readonly key: string;
}

export interface LinearProject {
  readonly id: string;
  readonly name: string;
  readonly icon: string | null;
}

export interface LinearWorkflowState {
  readonly id: string;
  readonly name: string;
  readonly type: string;
  readonly color: string;
}

export interface LinearLabel {
  readonly id: string;
  readonly name: string;
  readonly color: string;
}

export interface LinearUser {
  readonly id: string;
  readonly name: string;
  readonly displayName: string;
  readonly avatarUrl: string | null;
  readonly isMe?: boolean;
}

export interface LinearIssueResult {
  readonly id: string;
  readonly identifier: string;
  readonly title: string;
  readonly url: string;
}

export interface IpcResult<T = unknown> {
  readonly success: boolean;
  readonly data?: T;
  readonly error?: string;
}

export interface CreateIssueInput {
  readonly teamId: string;
  readonly projectId?: string;
  readonly stateId?: string;
  readonly priority?: number;
  readonly assigneeId?: string;
  readonly labelIds?: string[];
  readonly title: string;
  readonly description: string;
  readonly screenshotDataUrl: string;
  readonly additionalScreenshotDataUrls?: string[];
}

export interface AddCommentInput {
  readonly issueId: string;
  readonly comment: string;
  readonly screenshotDataUrl: string;
}

export interface AddCommentBgInput extends AddCommentInput {
  readonly issueIdentifier?: string;
  readonly issueTitle?: string;
  readonly issueUrl?: string;
}

export interface RecentSelections {
  readonly lastTeamId: string;
  readonly lastProjectId: string;
  readonly recentTickets: readonly LinearIssueResult[];
}

export interface UpdateInfo {
  readonly hasUpdate: boolean;
  readonly currentVersion: string;
  readonly latestVersion: string;
  readonly downloadUrl: string;
  readonly releaseUrl: string;
}
