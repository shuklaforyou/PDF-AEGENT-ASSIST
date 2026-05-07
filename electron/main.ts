import { app, BrowserWindow, Menu, MenuItem, nativeTheme, ipcMain } from 'electron';
import path from 'path';

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.js
// │
process.env.DIST = path.join(__dirname, '../dist');
process.env.VITE_PUBLIC = app.isPackaged ? process.env.DIST : path.join(process.env.DIST, '../public');

let win: BrowserWindow | null;
// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - SystemJS vite plugin
const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL'];

function createWindow() {
  win = new BrowserWindow({
    title: 'PDF Agent Assist',
    icon: path.join(process.env.VITE_PUBLIC, 'icons', 'icon.icns'),
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    titleBarStyle: 'hiddenInset',  // macOS: hides title text, keeps traffic lights
    trafficLightPosition: { x: 14, y: 14 },
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // Push message to Renderer-process on load.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date()).toLocaleString());
  });

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
    // Open DevTools automatically to help debug white screens
    win.webContents.openDevTools();
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(process.env.DIST, 'index.html'));
  }
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
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
