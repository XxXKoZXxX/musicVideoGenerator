const { app, BrowserWindow, ipcMain, dialog, Menu, shell } = require('electron');
const path = require('path');
const fs = require('fs');

// Check if running in development mode
const isDev = process.env.NODE_ENV === 'development' || process.argv.includes('--dev');

// Set FFmpeg path (assumes ffmpeg installed globally or in project)
// ffmpeg.setFfmpegPath(path.join(__dirname, '..', 'ffmpeg', 'ffmpeg.exe'));

// The GPU process crashes on this machine (STATUS_STACK_BUFFER_OVERRUN), which
// leaves the window painted black. Software rasterization renders correctly and
// still feeds canvas.captureStream() during export.
app.disableHardwareAcceleration();

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      enableRemoteModule: false,
      nodeIntegration: false,
    },
    title: 'MusicVid Studio',
    backgroundColor: '#0f0f0f',
    show: false,
  });

  mainWindow.webContents.on('did-fail-load', (_event, code, description, url) => {
    dialog.showErrorBox('MusicVid Studio', `Could not load ${url}\n\n${description} (${code})`);
  });

  const startUrl = isDev
    ? `http://localhost:${process.env.PORT || 3210}`
    : path.join(__dirname, '../build/index.html');

  if (isDev) {
    mainWindow.loadURL(startUrl);
  } else {
    mainWindow.loadFile(startUrl);
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }
}

function createMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        { role: 'quit' },
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'Project Folder',
          click: () => shell.openPath(path.join(__dirname, '..')),
        },
      ],
    },
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

app.whenReady().then(() => {
  createMenu();
  createWindow();
});

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

// IPC Handlers for video generation
ipcMain.handle('select-image', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile', 'multiSelections'],
    filters: [{ name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp'] }],
  });
  return result.filePaths;
});

ipcMain.handle('select-audio', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [{ name: 'Audio', extensions: ['mp3', 'wav', 'aac', 'flac', 'm4a', 'ogg'] }],
  });
  return result.filePaths[0] || null;
});

const MIME_TYPES = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.aac': 'audio/aac',
  '.flac': 'audio/flac',
  '.m4a': 'audio/mp4',
  '.ogg': 'audio/ogg',
};

// The renderer paints these into a canvas it then captures. Reading them here
// and inlining as data URLs keeps the canvas same-origin, since a tainted
// canvas makes captureStream() throw.
ipcMain.handle('read-file-data-url', async (event, filePath) => {
  try {
    const mime = MIME_TYPES[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
    const data = await fs.promises.readFile(filePath);
    return { dataUrl: `data:${mime};base64,${data.toString('base64')}` };
  } catch (error) {
    return { error: error.message };
  }
});

ipcMain.handle('save-video', async (event, { videoBuffer, filename }) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    defaultPath: filename,
    filters: [
      { name: 'Video Files', extensions: ['mp4', 'webm', 'mov', 'avi'] },
      { name: 'All Files', extensions: ['*'] },
    ],
  });

  if (!result.canceled) {
    const buffer = Buffer.from(videoBuffer);
    fs.writeFileSync(result.filePath, buffer);
    return { success: true, path: result.filePath };
  }
  return { success: false };
});
