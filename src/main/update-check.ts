import { app } from 'electron';
import type { UpdateInfo } from '../shared/types';

export const GITHUB_REPO = 'tomcerdeira/linear-screenshots-helper';

export function compareVersions(current: string, latest: string): boolean {
  const parse = (v: string): number[] =>
    v.replace(/^v/, '').split(/[.\-+]/).map((s) => {
      const n = parseInt(s, 10);
      return Number.isFinite(n) ? n : 0;
    });
  const c = parse(current);
  const l = parse(latest);
  for (let i = 0; i < 3; i++) {
    if ((l[i] ?? 0) > (c[i] ?? 0)) return true;
    if ((l[i] ?? 0) < (c[i] ?? 0)) return false;
  }
  return false;
}

export async function fetchLatestUpdateInfo(): Promise<UpdateInfo> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  let res: Response;
  try {
    res = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`,
      { signal: controller.signal, headers: { 'Accept': 'application/vnd.github+json' } },
    );
  } catch (err) {
    clearTimeout(timeout);
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error('Update check timed out — please try again');
    }
    throw new Error('Could not reach GitHub');
  }
  clearTimeout(timeout);

  const currentVersion = app.getVersion();
  const releasesUrl = `https://github.com/${GITHUB_REPO}/releases`;

  if (res.status === 404) {
    return {
      hasUpdate: false,
      currentVersion,
      latestVersion: currentVersion,
      downloadUrl: releasesUrl,
      releaseUrl: releasesUrl,
      status: 'not-available',
      canInstall: false,
    };
  }
  if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);

  const release = await res.json() as {
    tag_name: string;
    html_url: string;
    assets: { browser_download_url: string; name: string }[];
  };
  const latestVersion = release.tag_name.replace(/^v/, '');

  const arch = process.arch;
  const archDmg = release.assets.find((a) => a.name.endsWith('.dmg') && a.name.includes(arch));
  const anyDmg = release.assets.find((a) => a.name.endsWith('.dmg'));
  const archZip = release.assets.find((a) => a.name.endsWith('.zip') && a.name.includes(arch));
  const anyZip = release.assets.find((a) => a.name.endsWith('.zip'));
  const downloadUrl =
    archZip?.browser_download_url
    ?? anyZip?.browser_download_url
    ?? archDmg?.browser_download_url
    ?? anyDmg?.browser_download_url
    ?? release.html_url;
  const hasUpdate = compareVersions(currentVersion, latestVersion);

  return {
    hasUpdate,
    currentVersion,
    latestVersion,
    downloadUrl,
    releaseUrl: release.html_url,
    status: hasUpdate ? 'available' : 'not-available',
    canInstall: false,
  };
}
