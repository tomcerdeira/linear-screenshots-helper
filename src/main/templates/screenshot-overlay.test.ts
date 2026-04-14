import { describe, it, expect } from 'vitest';
import { buildScreenshotOverlayHtml } from './screenshot-overlay';

describe('buildScreenshotOverlayHtml', () => {
  const html = buildScreenshotOverlayHtml();

  it('contains the overlay-canvas element', () => {
    expect(html).toContain('id="overlay-canvas"');
  });

  it('contains the selection-border element', () => {
    expect(html).toContain('id="selection-border"');
  });

  it('contains the instructions element', () => {
    expect(html).toContain('id="instructions"');
  });

  it('contains keydown Escape handler', () => {
    expect(html).toContain("if (e.key === 'Escape') window.close()");
  });

  it('contains the _setScreenshot function for injecting the background image', () => {
    expect(html).toContain('window._setScreenshot');
    expect(html).toContain('data:image/jpeg;base64,');
  });

  it('contains the bg image element', () => {
    expect(html).toContain('id="bg"');
  });

  it('returns valid HTML with DOCTYPE', () => {
    expect(html).toMatch(/^<!DOCTYPE html>/);
  });
});
