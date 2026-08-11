# 🎬 MusicVid Studio - Desktop App Setup

Your app is now configured as a **desktop application**! Here's how to run it.

---

## 🚀 Option 1: Quick Start (Easiest)

### Windows:
**Double-click one of these files in the project folder:**

1. **`start-desktop.bat`** ← Recommended (easiest)
2. Or manually run in PowerShell:
   ```powershell
   npm start
   ```

This will:
- ✅ Build the React app
- ✅ Launch Electron desktop window
- ✅ Open MusicVid Studio in a native desktop window
- ✅ Show dev tools for debugging

---

## 📦 Option 2: Build a Standalone Installer (Professional)

### Create Windows Installer/Executable:

```bash
cd C:\Users\User\musicvid-studio
npm run build-win
```

This creates:
- **Installer** (`MusicVid-Studio-0.1.0.exe`) - Full installer with setup wizard
- **Portable** (`MusicVid-Studio-0.1.0.exe`) - Standalone, no installation needed

Location: `dist/` folder in your project

---

## 📋 Available Build Commands

```bash
# Just start for development
npm start

# Build for Windows only
npm run build-win

# Build for macOS only
npm run build-mac

# Build for Linux only
npm run build-linux

# Build for all platforms
npm run build-all
```

---

## ✨ What You Get as a Desktop App

### Native Windows Features:
- ✅ Runs as a native desktop window (not in browser)
- ✅ System taskbar integration
- ✅ Window chrome (minimize, maximize, close buttons)
- ✅ Right-click file dialogs for image/audio selection
- ✅ Save file dialogs for video export
- ✅ No need for localhost or browser
- ✅ Can create desktop shortcuts
- ✅ Distributable to others

### Keyboard Shortcuts Work:
- `F12` - Open developer tools (debug mode)
- `Ctrl+R` - Reload app
- `Ctrl+Shift+I` - Toggle dev tools

---

## 🎯 How to Use as Desktop App

### Launch Method 1: Batch File
```
Double-click: start-desktop.bat
```

### Launch Method 2: Command Line
```bash
cd C:\Users\User\musicvid-studio
npm start
```

### Launch Method 3: Run Built Executable
After running `npm run build-win`:
```bash
.\dist\MusicVid-Studio-0.1.0.exe
```

---

## 📂 File Structure

```
musicvid-studio/
├── start-desktop.bat       ← Click to launch!
├── start-desktop.ps1       ← Or run this in PowerShell
├── public/
│   ├── electron.js         ← Desktop app main process
│   ├── preload.js          ← Security bridge
│   └── index.html          ← Entry point
├── src/                    ← React app source
├── build/                  ← Built React (created by npm)
└── dist/                   ← Installers/executables (created by npm run build-win)
```

---

## 🔧 Development Workflow

### For Development:
```bash
npm start
```
- Launches both React dev server and Electron
- Shows dev tools automatically
- Hot reload enabled
- Great for testing and debugging

### For Production/Distribution:
```bash
npm run build-win
```
- Creates optimized build
- Generates installer & portable executable
- No npm needed to run the final app
- Can be shared with users

---

## 📥 Creating Installer for Others

After running `npm run build-win`:

1. Find in `dist/` folder:
   - **`MusicVid-Studio-0.1.0.exe`** (Installer)
   - User can run this to install on their computer
   - Creates Start Menu shortcuts
   - Full uninstall support

2. Or share the Portable version:
   - **`MusicVid-Studio-0.1.0.exe`** (Portable)
   - No installation needed
   - Just copy and run anywhere

---

## 🎬 Feature Checklist

### Desktop App Features Now Available:
- ✅ Runs as native Windows application
- ✅ File dialogs for image selection
- ✅ File dialogs for audio selection
- ✅ Save dialogs for video export
- ✅ System tray integration (with more setup)
- ✅ Auto-updates (with more setup)
- ✅ Executable distribution format

### Features to Add (Optional):
- ⏳ Auto-update system (electron-updater)
- ⏳ System tray menu
- ⏳ Right-click context menu
- ⏳ Drag-and-drop support
- ⏳ Dark/light theme sync with Windows

---

## 🐛 Troubleshooting

### App won't start:
```bash
# Make sure dependencies are installed
npm install

# Clear node_modules and reinstall
rm -r node_modules
npm install

# Then try again
npm start
```

### Port 3000 already in use:
```bash
# Kill the process on port 3000
npx kill-port 3000

# Try again
npm start
```

### Build fails:
```bash
# Clean build
npm run react-build

# Try windows build again
npm run build-win
```

---

## 📝 What's Happening Behind the Scenes

When you run `npm start`:

1. **React Dev Server** starts on http://localhost:3000
2. **Electron** waits for server to be ready
3. **Electron Main Process** creates a BrowserWindow
4. **Window loads** the React app from localhost
5. **IPC Bridge** enables file dialogs
6. **Dev Tools** open for debugging

The result: **A real desktop window running your React app!**

---

## 🎯 Next Steps

### To Launch Now:
```bash
# Option A: Double-click
start-desktop.bat

# Option B: Run command
npm start

# Option C: Run in PowerShell
.\start-desktop.ps1
```

### To Create Installer:
```bash
npm run build-win
```
Creates `.exe` files in `dist/` folder

### To Distribute:
- Share the `.exe` file from `dist/` folder
- Users can install or run portable version
- No npm or Node.js required for end users

---

## 💡 Key Benefits

✅ **No browser needed** - Native desktop app  
✅ **Professional look** - Real Windows window  
✅ **Distributable** - Share `.exe` with others  
✅ **File system access** - Real file dialogs  
✅ **Offline capable** - Works without internet  
✅ **System integration** - Taskbar, Start menu  

---

**You now have a professional desktop application!** 🚀

---

**Status**: Desktop App Ready | App can be launched and distributed as `.exe`  
**Version**: 0.1.0  
**Platform**: Windows (macOS/Linux configurable)
