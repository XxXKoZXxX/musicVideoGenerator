const { app, BrowserWindow, ipcMain, dialog, Menu } = require('electron');

const path = require('path');
const fs = require('fs');

try {
  require('dotenv').config({ path: path.join(__dirname, '../.env') });
} catch (e) {}

const isDev = process.env.NODE_ENV === 'development' || process.argv.includes('--dev');
const DEV_PORT = process.env.PORT || 3220;

app.disableHardwareAcceleration();

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 960,
    minWidth: 1024,
    minHeight: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      enableRemoteModule: false,
      nodeIntegration: false,
    },
    title: 'Astraea Cinema DoP & AI Vocal Cloner Studio (Standalone 4K)',
    backgroundColor: '#060913',
    show: true,
  });

  let retryCount = 0;
  const maxRetries = 10;

  mainWindow.webContents.on('did-fail-load', (_event, code, description, url) => {
    if (isDev && retryCount < maxRetries) {
      retryCount++;
      console.log(`Waiting for musicvid dev server at ${url}... (attempt ${retryCount}/${maxRetries})`);
      setTimeout(() => {
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.loadURL(`http://localhost:${DEV_PORT}?app=musicvid`);
        }
      }, 1500);
    } else {
      console.error(`Failed to load ${url}: ${code} - ${description}`);
    }
  });

  if (isDev) {
    mainWindow.loadURL(`http://localhost:${DEV_PORT}?app=musicvid`);
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    mainWindow.loadFile(path.join(__dirname, '../build/index.html'), {
      query: { app: 'musicvid' },
    });
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  buildMenu();
}

function buildMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Export 4K Master Video',
          accelerator: 'CmdOrCtrl+E',
          click: () => {
            if (mainWindow) mainWindow.webContents.send('trigger-export');
          },
        },
        { type: 'separator' },
        { role: 'quit' },
      ],
    },
    {
      label: 'Studio View',
      submenu: [
        {
          label: 'AI Music Video Creator',
          accelerator: 'CmdOrCtrl+1',
          click: () => {
            if (mainWindow) mainWindow.webContents.send('navigate-view', 'musicvid-wizard');
          },
        },
        {
          label: 'AI Character & 3D Actor Studio',
          accelerator: 'CmdOrCtrl+2',
          click: () => {
            if (mainWindow) mainWindow.webContents.send('navigate-view', 'characterStudio');
          },
        },
        {
          label: 'AI Vocal Cloner & Autotune',
          accelerator: 'CmdOrCtrl+3',
          click: () => {
            if (mainWindow) mainWindow.webContents.send('navigate-view', 'vocal');
          },
        },
        { type: 'separator' },
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// IPC Handlers
ipcMain.handle('select-image', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [
      { name: 'Images & Video Clips', extensions: ['jpg', 'jpeg', 'png', 'webp', 'mp4', 'webm', 'mov'] },
    ],
  });
  if (result.canceled || result.filePaths.length === 0) return null;
  return result.filePaths[0];
});

ipcMain.handle('select-images', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile', 'multiSelections'],
    filters: [
      { name: 'Images & Video Clips', extensions: ['jpg', 'jpeg', 'png', 'webp', 'mp4', 'webm', 'mov'] },
    ],
  });
  if (result.canceled || result.filePaths.length === 0) return [];
  return result.filePaths;
});

ipcMain.handle('select-audio', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [{ name: 'Audio Tracks', extensions: ['mp3', 'wav', 'ogg', 'm4a', 'flac', 'aac'] }],
  });
  if (result.canceled || result.filePaths.length === 0) return null;
  return result.filePaths[0];
});

ipcMain.handle('read-file-as-data-url', async (_event, filePath) => {
  try {
    const ext = path.extname(filePath).toLowerCase();
    const mimeMap = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp',
      '.mp4': 'video/mp4',
      '.webm': 'video/webm',
      '.mp3': 'audio/mpeg',
      '.wav': 'audio/wav',
    };
    const mime = mimeMap[ext] || 'application/octet-stream';
    const buffer = fs.readFileSync(filePath);
    return `data:${mime};base64,${buffer.toString('base64')}`;
  } catch (err) {
    console.error('Error reading file:', err);
    throw err;
  }
});

ipcMain.handle('save-video', async (_event, videoDataUrl, defaultName = 'Astraea_Master_Music_Video.webm') => {
  try {
    const { filePath } = await dialog.showSaveDialog(mainWindow, {
      defaultPath: defaultName,
      filters: [{ name: 'WebM Video', extensions: ['webm'] }, { name: 'MP4 Video', extensions: ['mp4'] }],
    });

    if (!filePath) return { success: false, cancelled: true };

    const base64Data = videoDataUrl.replace(/^data:video\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    fs.writeFileSync(filePath, buffer);
    return { success: true, filePath };
  } catch (err) {
    console.error('Error saving video file:', err);
    return { success: false, error: err.message };
  }
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
