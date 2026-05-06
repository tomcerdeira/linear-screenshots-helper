import { BrowserWindow, desktopCapturer, screen, nativeImage } from 'electron';
import { execFile } from 'child_process';
import { promises as fs } from 'fs';
import * as os from 'os';
import * as path from 'path';
import type { ScreenshotData } from '../shared/types';

const OVERLAY_HTML = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
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

  document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    window.close();
  });

  document.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return;
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

  window._setScreenshot = function(url) {
    document.getElementById('bg').src = url;
  };
</script>
</body>
</html>`;

let overlayHtmlPathPromise: Promise<string> | null = null;
function getOverlayHtmlPath(): Promise<string> {
  if (overlayHtmlPathPromise) return overlayHtmlPathPromise;
  overlayHtmlPathPromise = (async () => {
    const p = path.join(os.tmpdir(), `lsh-overlay-${process.pid}.html`);
    await fs.writeFile(p, OVERLAY_HTML, 'utf8');
    return p;
  })();
  return overlayHtmlPathPromise;
}

function tmpCapturePath(): string {
  return path.join(
    os.tmpdir(),
    `lsh-capture-${Date.now()}-${Math.random().toString(36).slice(2)}.png`,
  );
}

async function captureMacRegion(bounds: Electron.Rectangle, outPath: string): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    execFile(
      '/usr/sbin/screencapture',
      ['-x', '-R', `${bounds.x},${bounds.y},${bounds.width},${bounds.height}`, outPath],
      { timeout: 10000 },
      (err) => (err ? reject(err) : resolve()),
    );
  });
}

async function captureWithDesktopCapturer(
  activeDisplay: Electron.Display,
  outPath: string,
): Promise<void> {
  const { bounds, scaleFactor } = activeDisplay;
  const sources = await desktopCapturer.getSources({
    types: ['screen'],
    thumbnailSize: {
      width: bounds.width * scaleFactor,
      height: bounds.height * scaleFactor,
    },
  });
  const source =
    sources.find((s) => s.display_id === activeDisplay.id.toString()) ?? sources[0];
  if (!source) throw new Error('No screen source available');

  let image = source.thumbnail;
  const expectedW = bounds.width * scaleFactor;
  const expectedH = bounds.height * scaleFactor;
  if (image.getSize().width !== expectedW || image.getSize().height !== expectedH) {
    image = image.resize({ width: expectedW, height: expectedH });
  }
  await fs.writeFile(outPath, image.toPNG());
}

async function captureDisplayToFile(
  activeDisplay: Electron.Display,
  outPath: string,
): Promise<void> {
  if (process.platform === 'darwin') {
    try {
      await captureMacRegion(activeDisplay.bounds, outPath);
      return;
    } catch {
      // Fall through to Electron's API if the native binary fails for any reason
    }
  }
  await captureWithDesktopCapturer(activeDisplay, outPath);
}

export async function captureScreenshot(): Promise<ScreenshotData | null> {
  const cursorPoint = screen.getCursorScreenPoint();
  const activeDisplay = screen.getDisplayNearestPoint(cursorPoint);
  const { bounds, scaleFactor } = activeDisplay;

  const tmpPng = tmpCapturePath();

  // Kick off capture and overlay window setup in parallel — the dominant
  // latency source (screen capture) no longer blocks window creation/HTML load.
  const capturePromise = captureDisplayToFile(activeDisplay, tmpPng);

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
      // Local-only, ephemeral overlay; relax so the file:// page can load the
      // file:// backdrop image written to a separate temp path.
      webSecurity: false,
    },
  });

  overlay.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  overlay.setAlwaysOnTop(true, 'screen-saver');

  const loadPromise = getOverlayHtmlPath().then((htmlPath) => overlay.loadFile(htmlPath));

  return new Promise((resolve) => {
    let resolved = false;
    let tmpCleaned = false;
    const safetyTimeout = setTimeout(() => finish(null), 30000);

    const cleanupTmp = (): void => {
      if (tmpCleaned) return;
      tmpCleaned = true;
      fs.unlink(tmpPng).catch(() => {
        /* best-effort */
      });
    };

    function finish(data: ScreenshotData | null): void {
      if (resolved) return;
      resolved = true;
      clearTimeout(safetyTimeout);
      overlay.webContents.removeAllListeners('page-title-updated');
      if (!overlay.isDestroyed()) overlay.destroy();
      cleanupTmp();
      resolve(data);
    }

    Promise.all([capturePromise, loadPromise])
      .then(async () => {
        if (resolved || overlay.isDestroyed()) return;
        const fileUrl = `file://${tmpPng}`;
        try {
          // Set the src AND wait for the <img> to actually decode/paint
          // before showing the window — prevents a black flash on appear.
          await overlay.webContents.executeJavaScript(
            `(function(){
              const img = document.getElementById('bg');
              img.src = ${JSON.stringify(fileUrl)};
              return new Promise((res) => {
                if (img.complete && img.naturalWidth > 0) return res();
                img.onload = () => res();
                img.onerror = () => res();
              });
            })()`,
          );
          if (resolved || overlay.isDestroyed()) return;
          overlay.show();
          overlay.focus();
        } catch {
          finish(null);
        }
      })
      .catch(() => finish(null));

    overlay.on('closed', () => {
      if (!resolved) {
        resolved = true;
        clearTimeout(safetyTimeout);
        cleanupTmp();
        resolve(null);
      }
    });

    overlay.webContents.on('page-title-updated', (_event, title) => {
      if (resolved || overlay.isDestroyed()) return;

      void (async () => {
        try {
          const rect = JSON.parse(title);
          const buf = await fs.readFile(tmpPng);
          const captured = nativeImage.createFromBuffer(buf);
          const cropped = captured.crop({
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
      })();
    });
  });
}
