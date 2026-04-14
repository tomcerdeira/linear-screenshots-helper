import { getLinearClient } from './linear-client';
import { uploadScreenshot } from './linear-upload';
import { dataUrlToBuffer } from './buffer';
import { cached } from './cache';
import { PaginationOrderBy } from '@linear/sdk';
import type { LinearTeam, LinearProject, LinearWorkflowState, LinearLabel, LinearUser, LinearIssueResult, CreateIssueInput } from '../shared/types';

const SEARCH_LIMIT = 10;
const PROJECT_LIMIT = 50;

export function getTeams(): Promise<LinearTeam[]> {
  return cached('teams', async () => {
    const client = getLinearClient();
    const teams = await client.teams();
    return teams.nodes.map((team) => ({
      id: team.id,
      name: team.name,
      key: team.key,
    }));
  });
}

export function getProjects(): Promise<LinearProject[]> {
  return cached('projects', async () => {
    const client = getLinearClient();
    const projects = await client.projects({ first: PROJECT_LIMIT });
    return projects.nodes.map((project) => ({
      id: project.id,
      name: project.name,
      icon: project.icon ?? null,
    }));
  });
}

export const STATE_TYPE_ORDER: Record<string, number> = {
  backlog: 0,
  unstarted: 1,
  started: 2,
  completed: 3,
  cancelled: 4,
};

export function sortWorkflowStates<T extends { type: string }>(states: T[]): T[] {
  return [...states].sort((a, b) =>
    (STATE_TYPE_ORDER[a.type] ?? 99) - (STATE_TYPE_ORDER[b.type] ?? 99),
  );
}

export function getWorkflowStates(teamId: string): Promise<LinearWorkflowState[]> {
  return cached(`states:${teamId}`, async () => {
    const client = getLinearClient();
    const team = await client.team(teamId);
    const states = await team.states();
    const mapped = states.nodes.map((state) => ({
      id: state.id,
      name: state.name,
      type: state.type,
      color: state.color,
    }));
    return sortWorkflowStates(mapped);
  });
}

export function getLabels(teamId: string): Promise<LinearLabel[]> {
  return cached(`labels:${teamId}`, async () => {
    const client = getLinearClient();
    const team = await client.team(teamId);
    const labels = await team.labels();
    return labels.nodes
      .map((label) => ({
        id: label.id,
        name: label.name,
        color: label.color,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  });
}

export function getMembers(teamId: string): Promise<LinearUser[]> {
  return cached(`members:${teamId}`, async () => {
    const client = getLinearClient();
    const [team, viewer] = await Promise.all([
      client.team(teamId),
      client.viewer,
    ]);
    const members = await team.members();
    const viewerId = viewer.id;

    const mapped = members.nodes.map((member) => ({
      id: member.id,
      name: member.name,
      displayName: member.displayName,
      avatarUrl: member.avatarUrl ?? null,
      isMe: member.id === viewerId,
    }));

    // Current user first, then alphabetical
    return [
      ...mapped.filter((m) => m.isMe),
      ...mapped.filter((m) => !m.isMe).sort((a, b) => a.displayName.localeCompare(b.displayName)),
    ];
  });
}

export function getRecentIssues(): Promise<LinearIssueResult[]> {
  return cached('recentIssues', async () => {
    const client = getLinearClient();
    const viewer = await client.viewer;
    const assigned = await viewer.assignedIssues({
      first: SEARCH_LIMIT,
      orderBy: PaginationOrderBy.UpdatedAt,
    });
    return assigned.nodes.map(toIssueResult);
  });
}

export async function searchIssues(query: string): Promise<LinearIssueResult[]> {
  // Search is never cached — always live
  const client = getLinearClient();
  const results = await client.searchIssues(query, { first: SEARCH_LIMIT });
  return results.nodes.map(toIssueResult);
}

export async function createIssue(input: CreateIssueInput): Promise<LinearIssueResult> {
  const client = getLinearClient();
  const assetUrl = await uploadScreenshotFromDataUrl(input.screenshotDataUrl);

  const description = input.description
    ? `${input.description}\n\n![screenshot](${assetUrl})`
    : `![screenshot](${assetUrl})`;

  const result = await client.createIssue({
    teamId: input.teamId,
    title: input.title,
    description,
    ...(input.projectId ? { projectId: input.projectId } : {}),
    ...(input.stateId ? { stateId: input.stateId } : {}),
    ...(input.priority !== undefined ? { priority: input.priority } : {}),
    ...(input.assigneeId ? { assigneeId: input.assigneeId } : {}),
    ...(input.labelIds?.length ? { labelIds: input.labelIds } : {}),
  });

  if (!result.success) {
    throw new Error('Failed to create issue in Linear');
  }

  const issue = await result.issue;
  if (!issue) {
    throw new Error('Issue created but could not be retrieved');
  }

  return toIssueResult(issue);
}

export async function addCommentWithScreenshot(
  issueId: string,
  comment: string,
  screenshotDataUrl: string,
): Promise<{ success: boolean }> {
  const client = getLinearClient();
  const assetUrl = await uploadScreenshotFromDataUrl(screenshotDataUrl);

  const body = comment
    ? `${comment}\n\n![screenshot](${assetUrl})`
    : `![screenshot](${assetUrl})`;

  const result = await client.createComment({ issueId, body });
  return { success: result.success };
}

async function uploadScreenshotFromDataUrl(dataUrl: string): Promise<string> {
  const buffer = dataUrlToBuffer(dataUrl);
  return uploadScreenshot(buffer, `screenshot-${Date.now()}.png`);
}

export function toIssueResult(node: { id: string; identifier: string; title: string; url: string }): LinearIssueResult {
  return {
    id: node.id,
    identifier: node.identifier,
    title: node.title,
    url: node.url,
  };
}
