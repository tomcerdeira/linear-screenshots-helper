export const SITE_URL = "https://www.linear.tickets";

export const REPO_URL = "https://github.com/tomcerdeira/linear-screenshots-helper";

// GitHub permanently redirects /releases/latest/download/<filename> to whatever
// asset of that exact name is attached to the latest published (non-draft,
// non-prerelease) release. Our release workflow uploads stable, arch-suffixed
// names (`LinearScreenshot-arm64.dmg` / `LinearScreenshot-x64.dmg`) so these
// URLs always resolve to the newest build.
export const DMG_ARM64_URL = `${REPO_URL}/releases/latest/download/LinearScreenshot-arm64.dmg`;
export const DMG_X64_URL = `${REPO_URL}/releases/latest/download/LinearScreenshot-x64.dmg`;

// Default points at Apple Silicon (the vast majority of modern Macs). The
// Intel build is offered as a secondary link in the UI.
export const DMG_DOWNLOAD_URL = DMG_ARM64_URL;

export const RELEASES_URL = `${REPO_URL}/releases`;
