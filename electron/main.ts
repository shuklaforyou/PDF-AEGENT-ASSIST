import { app, BrowserWindow, Menu, MenuItem, nativeTheme, ipcMain } from 'electron';
import path from 'path';
import fs from 'fs';

// The built directory structure
process.env.DIST = path.join(__dirname, '../dist');
process.env.VITE_PUBLIC = app.isPackaged ? process.env.DIST : path.join(process.env.DIST, '../public');

let win: BrowserWindow | null;
const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL'];

let initialFilePath: string | null = null;

// macOS: intercept open-file (double-click in Finder, open-with, dock drop)
// This fires BEFORE the app is fully ready, so we just store the path.
// We send it to the renderer once the window finishes loading.
app.on('open-file', (event, filePath) => {
  event.preventDefault();
  initialFilePath = filePath;
  // If the window already exists and finished loading, send immediately
  if (win && !win.isDestroyed() && win.webContents.isLoading() === false) {
    win.webContents.send('open-pdf', filePath);
  }
  // Otherwise it will be delivered in did-finish-load below
});

function createWindow() {
  win = new BrowserWindow({
    title: 'PDF Agent Assist',
    icon: path.join(process.env.VITE_PUBLIC, 'icons', 'icon.icns'),
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 14, y: 14 },
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date()).toLocaleString());

    // Windows / Linux: pick up PDF path from process args
    if (process.platform !== 'darwin') {
      const fileArg = process.argv.find(arg => arg.toLowerCase().endsWith('.pdf'));
      if (fileArg) initialFilePath = fileArg;
    }

    // If open-file fired before the window was ready, deliver the path now
    if (initialFilePath) {
      win?.webContents.send('open-pdf', initialFilePath);
    }
  });

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(process.env.DIST, 'index.html'));
  }
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
    win = null;
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.whenReady().then(() => {
  // Register IPC handlers ONCE here — not inside createWindow() which
  // can be called multiple times (e.g. macOS dock activate event).
  ipcMain.handle('get-native-theme', () => nativeTheme.shouldUseDarkColors ? 'dark' : 'light');
  ipcMain.handle('set-native-theme', (_e, theme: 'light' | 'dark' | 'system') => {
    nativeTheme.themeSource = theme;
  });
  nativeTheme.on('updated', () => {
    win?.webContents.send('native-theme-changed', nativeTheme.shouldUseDarkColors ? 'dark' : 'light');
  });

  ipcMain.handle('get-initial-file', () => initialFilePath);
  
  ipcMain.handle('read-pdf-file', async (_e, filePath: string) => {
    try {
      const data = await fs.promises.readFile(filePath);
      return data; // returning Uint8Array / Buffer
    } catch (error) {
      console.error('Failed to read PDF file:', error);
      return null;
    }
  });

  createWindow();

  // Set macOS Dock icon explicitly (BrowserWindow.icon alone doesn't do it on macOS)
  if (process.platform === 'darwin') {
    const iconPath = path.join(process.env.VITE_PUBLIC!, 'icons', 'icon.png');
    try {
      app.dock.setIcon(iconPath);
    } catch (e) {
      console.warn('Could not set dock icon:', e);
    }
  }

  // Dev-only menu item: reset onboarding with Cmd+Shift+R
  if (VITE_DEV_SERVER_URL) {
    const menu = Menu.getApplicationMenu() || new Menu();
    const devMenu = new MenuItem({
      label: 'Dev',
      submenu: [
        {
          label: 'Reset Onboarding',
          accelerator: 'CmdOrCtrl+Shift+R',
          click: () => {
            win?.webContents.executeJavaScript(`
              localStorage.removeItem('GEMINI_CUSTOM_API_KEY');
              localStorage.removeItem('ONBOARDING_DISMISSED');
              location.reload();
            `);
          },
        },
        {
          label: 'Toggle DevTools',
          accelerator: 'CmdOrCtrl+Option+I',
          click: () => win?.webContents.toggleDevTools(),
        },
      ],
    });
    menu.append(devMenu);
    Menu.setApplicationMenu(menu);
  }
});
