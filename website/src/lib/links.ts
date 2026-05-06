export const SITE_URL = "https://www.linear.tickets";

export const REPO_URL = "https://github.com/tomcerdeira/linear-screenshots-helper";

// GitHub permanently redirects /releases/latest/download/<filename> to whatever
// asset of that exact name is attached to the latest published (non-draft,
// non-prerelease) release. The DMG name is stable across releases, so this URL
// always resolves to the newest build.
export const DMG_DOWNLOAD_URL = `${REPO_URL}/releases/latest/download/LinearScreenshot.dmg`;
