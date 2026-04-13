import { BrowserWindow, screen } from 'electron';
import path from 'node:path';

declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string;
declare const MAIN_WINDOW_VITE_NAME: string;

const POPUP_WIDTH = 440;
const POPUP_HEIGHT = 520;

let popupWindow: BrowserWindow | null = null;

export function createPopupWindow(): BrowserWindow {
  if (popupWindow && !popupWindow.isDestroyed()) {
    popupWindow.focus();
    return popupWindow;
  }

  const cursorPoint = screen.getCursorScreenPoint();
  const display = screen.getDisplayNearestPoint(cursorPoint);
  const { x, y, width, height } = display.workArea;

  popupWindow = new BrowserWindow({
    x: Math.round(x + (width - POPUP_WIDTH) / 2),
    y: Math.round(y + (height - POPUP_HEIGHT) / 2),
    width: POPUP_WIDTH,
    height: POPUP_HEIGHT,
    frame: false,
    resizable: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    hasShadow: true,
    vibrancy: 'popover',
    visualEffectState: 'active',
    roundedCorners: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    popupWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    popupWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
    );
  }

  popupWindow.on('closed', () => {
    popupWindow = null;
  });

  return popupWindow;
}

export function closePopupWindow(): void {
  if (popupWindow && !popupWindow.isDestroyed()) {
    popupWindow.close();
    popupWindow = null;
  }
}
