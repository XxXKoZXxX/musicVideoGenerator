const { app, BrowserWindow, ipcMain, dialog, Menu, shell } = require('electron');
const path = require('path');
const fs = require('fs');

try {
  require('dotenv').config({ path: path.join(__dirname, '../.env') });
} catch (e) {}

// Check if running in development mode
const isDev = process.env.NODE_ENV === 'development' || process.argv.includes('--dev');
const DEV_PORT = process.env.PORT || 3220;

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
    title: 'Astraea - Secret Language & Cosmic Oracle Studio',
    backgroundColor: '#060814',
    show: true,
  });

  let retryCount = 0;
  const maxRetries = 10;

  mainWindow.webContents.on('did-fail-load', (_event, code, description, url) => {
    if (isDev && retryCount < maxRetries) {
      retryCount++;
      console.log(`Waiting for dev server at ${url}... (attempt ${retryCount}/${maxRetries})`);
      setTimeout(() => {
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.loadURL(`http://localhost:${DEV_PORT}`);
        }
      }, 1500);
    } else {
      dialog.showErrorBox('Astraea Studio', `Could not load ${url}\n\n${description} (${code})`);
    }
  });

  const buildPath = path.join(__dirname, '../build/index.html');
  const useBuild = fs.existsSync(buildPath) && !process.argv.includes('--dev');

  if (useBuild) {
    mainWindow.loadFile(buildPath);
  } else {
    mainWindow.loadURL(`http://localhost:${DEV_PORT}`);
  }

  mainWindow.show();

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

ipcMain.handle('get-sharing-urls', async () => {
  const os = require('os');
  let localIp = '127.0.0.1';
  try {
    const ifaces = os.networkInterfaces();
    for (const dev in ifaces) {
      for (const details of ifaces[dev]) {
        if (details.family === 'IPv4' && !details.internal) {
          localIp = details.address;
          break;
        }
      }
      if (localIp !== '127.0.0.1') break;
    }
  } catch (e) {}

  let publicUrl = '';
  try {
    const publicUrlPath = path.join(__dirname, '../public_url.txt');
    if (fs.existsSync(publicUrlPath)) {
      publicUrl = fs.readFileSync(publicUrlPath, 'utf8').trim();
    }
  } catch (e) {}

  return {
    localIp,
    wifiUrl: `http://${localIp}:3210`,
    publicUrl: publicUrl || '',
    localhostUrl: 'http://localhost:3210',
  };
});

