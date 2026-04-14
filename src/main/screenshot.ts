import { BrowserWindow, desktopCapturer, screen } from 'electron';
import type { ScreenshotData } from '../shared/types';
import { buildScreenshotOverlayHtml } from './templates/screenshot-overlay';

export async function captureScreenshot(): Promise<ScreenshotData | null> {
  const cursorPoint = screen.getCursorScreenPoint();
  const activeDisplay = screen.getDisplayNearestPoint(cursorPoint);
  const { bounds, scaleFactor } = activeDisplay;

  const sources = await desktopCapturer.getSources({
    types: ['screen'],
    thumbnailSize: {
      width: bounds.width * scaleFactor,
      height: bounds.height * scaleFactor,
    },
  });

  if (sources.length === 0) return null;

  const matchedSource = sources.find(
    (s) => s.display_id === activeDisplay.id.toString(),
  ) ?? sources[0];

  const fullImage = matchedSource.thumbnail;

  const expectedW = bounds.width * scaleFactor;
  const expectedH = bounds.height * scaleFactor;
  const capturedImage =
    fullImage.getSize().width !== expectedW || fullImage.getSize().height !== expectedH
      ? fullImage.resize({ width: expectedW, height: expectedH })
      : fullImage;

  // Convert to JPEG for smaller payload (PNG of a full retina screen can be 20MB+)
  const jpegBuffer = capturedImage.toJPEG(80);
  const screenshotBase64 = jpegBuffer.toString('base64');

  return new Promise((resolve) => {
    const overlay = new BrowserWindow({
      x: bounds.x,
      y: bounds.y,
      width: bounds.width,
      height: bounds.height,
      frame: false,
      transparent: false,
      alwaysOnTop: true,
      skipTaskbar: true,
      resizable: false,
      movable: false,
      focusable: true,
      hasShadow: false,
      backgroundColor: '#000000',
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
      },
    });

    // Don't use fullscreen or simpleFullscreen — they can freeze on macOS.
    // Instead, set the window to cover the full display bounds and use kiosk-like behavior.
    overlay.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
    overlay.setAlwaysOnTop(true, 'screen-saver');
    overlay.moveTop();

    // Minimal HTML shell — screenshot is injected AFTER load via executeJavaScript
    const overlayHtml = buildScreenshotOverlayHtml();

    overlay.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(overlayHtml)}`);

    // Safety timeout
    const safetyTimeout = setTimeout(() => {
      if (!overlay.isDestroyed()) overlay.close();
    }, 15000);

    overlay.webContents.on('did-finish-load', () => {
      // Inject the screenshot via JS after the page has loaded
      // This avoids embedding a huge base64 string in the URL itself
      overlay.webContents.executeJavaScript(
        `window._setScreenshot(${JSON.stringify(screenshotBase64)})`
      ).catch(() => {
        // If injection fails, close overlay
        if (!overlay.isDestroyed()) overlay.close();
      });
    });

    overlay.on('closed', () => {
      clearTimeout(safetyTimeout);
      resolve(null);
    });

    // Listen for blur — if user switches away, close the overlay
    overlay.on('blur', () => {
      // Small delay to avoid closing during initial focus settling
      setTimeout(() => {
        if (!overlay.isDestroyed() && !overlay.isFocused()) {
          overlay.close();
        }
      }, 200);
    });

    overlay.webContents.on('page-title-updated', (_event, title) => {
      try {
        const rect = JSON.parse(title);
        overlay.close();

        const cropped = capturedImage.crop({
          x: Math.round(rect.x * scaleFactor),
          y: Math.round(rect.y * scaleFactor),
          width: Math.round(rect.width * scaleFactor),
          height: Math.round(rect.height * scaleFactor),
        });

        resolve({
          dataUrl: cropped.toDataURL(),
          width: rect.width,
          height: rect.height,
          timestamp: Date.now(),
        });
      } catch {
        overlay.close();
        resolve(null);
      }
    });
  });
}
