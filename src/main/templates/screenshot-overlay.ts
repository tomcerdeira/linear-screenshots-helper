export function buildScreenshotOverlayHtml(): string {
  return `<!DOCTYPE html>
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
#instructions {
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-family: -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 18px;
  text-align: center;
  pointer-events: none;
  text-shadow: 0 2px 8px rgba(0,0,0,0.7);
  z-index: 20;
}
#selection-border {
  position: absolute;
  border: 2px solid #5E6AD2;
  pointer-events: none;
  display: none;
  z-index: 15;
}
</style>
</head>
<body>
<img id="bg" />
<canvas id="overlay-canvas"></canvas>
<div id="selection-border"></div>
<div id="instructions">Click and drag to select a region<br><small>Press Escape to cancel</small></div>
<script>
const canvas = document.getElementById('overlay-canvas');
const ctx = canvas.getContext('2d');
const instructions = document.getElementById('instructions');
const selBorder = document.getElementById('selection-border');
let startX = 0, startY = 0;
let isDragging = false;
let currentRect = null;

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

// Expose a function for the main process to set the background image
window._setScreenshot = function(base64) {
  document.getElementById('bg').src = 'data:image/jpeg;base64,' + base64;
};
</script>
</body>
</html>`;
}
