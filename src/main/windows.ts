import { BrowserWindow, screen } from 'electron';
import path from 'node:path';

declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string;
declare const MAIN_WINDOW_VITE_NAME: string;

const POPUP_WIDTH = 660;
const POPUP_HEIGHT = 440;

const SETTINGS_WIDTH = 720;
const SETTINGS_WINDOW_HEIGHT = 620;
const SETTINGS_MIN_WIDTH = 600;
const SETTINGS_MIN_HEIGHT = 500;

let popupWindow: BrowserWindow | null = null;
let settingsWindow: BrowserWindow | null = null;

function loadRenderer(win: BrowserWindow, params?: Record<string, string>): void {
  const search = params ? `?${new URLSearchParams(params).toString()}` : '';
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    win.loadURL(`${MAIN_WINDOW_VITE_DEV_SERVER_URL}${search}`);
  } else {
    win.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
      search ? { search } : undefined,
    );
  }
}

export function createPopupWindow(options?: { height?: number }): BrowserWindow {
  if (popupWindow && !popupWindow.isDestroyed()) {
    popupWindow.focus();
    return popupWindow;
  }

  const cursorPoint = screen.getCursorScreenPoint();
  const display = screen.getDisplayNearestPoint(cursorPoint);
  const { x, y, width, height } = display.workArea;

  popupWindow = new BrowserWindow({
    x: Math.round(x + (width - POPUP_WIDTH) / 2),
    y: Math.round(y + (height - (options?.height ?? POPUP_HEIGHT)) / 2),
    width: POPUP_WIDTH,
    height: options?.height ?? POPUP_HEIGHT,
    show: false,
    frame: false,
    resizable: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    hasShadow: true,
    backgroundColor: '#1f2023',
    paintWhenInitiallyHidden: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  popupWindow.setAlwaysOnTop(true, 'screen-saver');

  loadRenderer(popupWindow);

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

export function createSettingsWindow(): BrowserWindow {
  if (settingsWindow && !settingsWindow.isDestroyed()) {
    if (settingsWindow.isMinimized()) settingsWindow.restore();
    settingsWindow.show();
    settingsWindow.focus();
    return settingsWindow;
  }

  settingsWindow = new BrowserWindow({
    width: SETTINGS_WIDTH,
    height: SETTINGS_WINDOW_HEIGHT,
    minWidth: SETTINGS_MIN_WIDTH,
    minHeight: SETTINGS_MIN_HEIGHT,
    show: false,
    frame: true,
    titleBarStyle: 'hiddenInset',
    resizable: true,
    minimizable: true,
    maximizable: true,
    skipTaskbar: false,
    alwaysOnTop: false,
    backgroundColor: '#1f2023',
    title: 'Linear Screenshot',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  loadRenderer(settingsWindow, { windowMode: 'standalone' });

  settingsWindow.on('closed', () => {
    settingsWindow = null;
  });

  return settingsWindow;
}

export function getSettingsWindow(): BrowserWindow | null {
  return settingsWindow && !settingsWindow.isDestroyed() ? settingsWindow : null;
}
