const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  selectImage: () => ipcRenderer.invoke('select-image'),
  selectImages: () => ipcRenderer.invoke('select-image'),
  selectAudio: () => ipcRenderer.invoke('select-audio'),
  readFileAsDataUrl: (filePath) => ipcRenderer.invoke('read-file-data-url', filePath),
  readFileDataUrl: (filePath) => ipcRenderer.invoke('read-file-data-url', filePath),
  saveVideo: (data) => ipcRenderer.invoke('save-video', data),
  getSharingUrls: () => ipcRenderer.invoke('get-sharing-urls'),
  onVideoProgress: (callback) => ipcRenderer.on('video-progress', callback),
  removeProgressListener: () => ipcRenderer.removeAllListeners('video-progress'),
});

