import { getLinearClient } from './linear-client';
import { uploadScreenshot } from './linear-upload';
import { dataUrlToBuffer } from './buffer';
import type { LinearTeam, LinearProject, LinearIssueResult, CreateIssueInput } from '../shared/types';

const SEARCH_LIMIT = 10;
const PROJECT_LIMIT = 50;

export async function getTeams(): Promise<LinearTeam[]> {
  const client = getLinearClient();
  const teams = await client.teams();
  return teams.nodes.map((team) => ({
    id: team.id,
    name: team.name,
    key: team.key,
  }));
}

export async function getProjects(): Promise<LinearProject[]> {
  const client = getLinearClient();
  const projects = await client.projects({ first: PROJECT_LIMIT });
  return projects.nodes.map((project) => ({
    id: project.id,
    name: project.name,
    icon: project.icon ?? null,
  }));
}

export async function searchIssues(query: string): Promise<LinearIssueResult[]> {
  const client = getLinearClient();
  const results = await client.searchIssues(query, { first: SEARCH_LIMIT });
  return results.nodes.map(toIssueResult);
}

export async function getRecentIssues(): Promise<LinearIssueResult[]> {
  const client = getLinearClient();
  const viewer = await client.viewer;
  const assigned = await viewer.assignedIssues({
    first: SEARCH_LIMIT,
    orderBy: 'updatedAt' as never,
  });
  return assigned.nodes.map(toIssueResult);
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

function toIssueResult(node: { id: string; identifier: string; title: string; url: string }): LinearIssueResult {
  return {
    id: node.id,
    identifier: node.identifier,
    title: node.title,
    url: node.url,
  };
}
