import { BrowserWindow, desktopCapturer, screen } from 'electron';
import type { ScreenshotData } from '../shared/types';

const OVERLAY_HTML = `<!DOCTYPE html>
<html>
<head>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    cursor: crosshair;
    overflow: hidden;
    user-select: none;
    -webkit-user-select: none;
    width: 100vw;
    height: 100vh;
    position: relative;
    background: #000;
  }
  #bg {
    position: absolute;
    top: 0; left: 0;
    width: 100%; height: 100%;
    object-fit: cover;
    pointer-events: none;
  }
  #overlay-canvas {
    position: absolute;
    top: 0; left: 0;
    width: 100%; height: 100%;
    z-index: 5;
  }
  #selection-border {
    position: absolute;
    border: 2px solid #5E6AD2;
    pointer-events: none;
    display: none;
    z-index: 15;
  }
  #instructions {
    position: absolute;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    color: white;
    font-family: -apple-system, BlinkMacSystemFont, sans-serif;
    font-size: 16px;
    text-align: center;
    pointer-events: none;
    text-shadow: 0 1px 6px rgba(0,0,0,0.6);
    z-index: 20;
  }
  #size-label {
    position: absolute;
    color: white;
    font-family: -apple-system, BlinkMacSystemFont, sans-serif;
    font-size: 11px;
    background: rgba(0,0,0,0.6);
    padding: 2px 6px;
    border-radius: 4px;
    pointer-events: none;
    display: none;
    z-index: 20;
  }
</style>
</head>
<body>
<img id="bg" />
<canvas id="overlay-canvas"></canvas>
<div id="selection-border"></div>
<div id="size-label"></div>
<div id="instructions">Click and drag to select a region<br><small>Press Escape to cancel</small></div>
<script>
  const canvas = document.getElementById('overlay-canvas');
  const ctx = canvas.getContext('2d');
  const instructions = document.getElementById('instructions');
  const selBorder = document.getElementById('selection-border');
  const sizeLabel = document.getElementById('size-label');
  let startX = 0, startY = 0, isDragging = false, currentRect = null;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    drawOverlay();
  }

  function drawOverlay() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (currentRect) {
      ctx.clearRect(currentRect.x, currentRect.y, currentRect.w, currentRect.h);
    }
  }

  window.addEventListener('resize', resize);
  resize();

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') window.close();
  });

  document.addEventListener('mousedown', (e) => {
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    instructions.style.display = 'none';
    selBorder.style.display = 'block';
    sizeLabel.style.display = 'block';
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const x = Math.min(e.clientX, startX);
    const y = Math.min(e.clientY, startY);
    const w = Math.abs(e.clientX - startX);
    const h = Math.abs(e.clientY - startY);
    currentRect = { x, y, w, h };
    drawOverlay();
    selBorder.style.left = x + 'px';
    selBorder.style.top = y + 'px';
    selBorder.style.width = w + 'px';
    selBorder.style.height = h + 'px';
    sizeLabel.textContent = w + ' \\u00d7 ' + h;
    sizeLabel.style.left = (x + w + 8) + 'px';
    sizeLabel.style.top = (y + h + 8) + 'px';
  });

  document.addEventListener('mouseup', (e) => {
    if (!isDragging) return;
    isDragging = false;
    const x = Math.min(e.clientX, startX);
    const y = Math.min(e.clientY, startY);
    const w = Math.abs(e.clientX - startX);
    const h = Math.abs(e.clientY - startY);
    if (w < 10 || h < 10) { window.close(); return; }
    document.title = JSON.stringify({ x, y, width: w, height: h });
  });

  window._setScreenshot = function(base64) {
    document.getElementById('bg').src = 'data:image/jpeg;base64,' + base64;
  };
</script>
</body>
</html>`;



export async function captureScreenshot(): Promise<ScreenshotData | null> {
  const cursorPoint = screen.getCursorScreenPoint();
  const activeDisplay = screen.getDisplayNearestPoint(cursorPoint);
  const { bounds, scaleFactor } = activeDisplay;

  // Step 1: Capture the full screen BEFORE showing the overlay
  const sources = await desktopCapturer.getSources({
    types: ['screen'],
    thumbnailSize: {
      width: bounds.width * scaleFactor,
      height: bounds.height * scaleFactor,
    },
  });

  const source = sources.find(
    (s) => s.display_id === activeDisplay.id.toString(),
  ) ?? sources[0];

  if (!source) return null;

  const fullImage = source.thumbnail;
  const expectedW = bounds.width * scaleFactor;
  const expectedH = bounds.height * scaleFactor;
  const capturedImage =
    fullImage.getSize().width !== expectedW || fullImage.getSize().height !== expectedH
      ? fullImage.resize({ width: expectedW, height: expectedH })
      : fullImage;

  const screenshotBase64 = capturedImage.toJPEG(85).toString('base64');

  // Step 2: Show overlay with captured image as background
  return new Promise((resolve) => {
    const overlay = new BrowserWindow({
      x: bounds.x,
      y: bounds.y,
      width: bounds.width,
      height: bounds.height,
      show: false,
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

    overlay.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
    overlay.setAlwaysOnTop(true, 'screen-saver');
    overlay.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(OVERLAY_HTML)}`);

    let resolved = false;
    const safetyTimeout = setTimeout(() => finish(null), 30000);

    function finish(data: ScreenshotData | null) {
      if (resolved) return;
      resolved = true;
      clearTimeout(safetyTimeout);
      overlay.webContents.removeAllListeners('page-title-updated');
      if (!overlay.isDestroyed()) overlay.destroy();
      resolve(data);
    }

    overlay.webContents.once('did-finish-load', () => {
      // Inject the screenshot after HTML is ready
      overlay.webContents.executeJavaScript(
        `window._setScreenshot(${JSON.stringify(screenshotBase64)})`
      ).then(() => {
        overlay.show();
        overlay.focus();
      }).catch(() => finish(null));
    });

    overlay.on('closed', () => {
      if (!resolved) { resolved = true; resolve(null); }
    });

    overlay.webContents.on('page-title-updated', (_event, title) => {
      if (resolved || overlay.isDestroyed()) return;

      try {
        const rect = JSON.parse(title);
        const cropped = capturedImage.crop({
          x: Math.round(rect.x * scaleFactor),
          y: Math.round(rect.y * scaleFactor),
          width: Math.round(rect.width * scaleFactor),
          height: Math.round(rect.height * scaleFactor),
        });

        finish({
          dataUrl: cropped.toDataURL(),
          width: rect.width,
          height: rect.height,
          timestamp: Date.now(),
        });
      } catch {
        finish(null);
      }
    });
  });
}
