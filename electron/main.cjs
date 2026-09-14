const { app, BrowserWindow, ipcMain, Menu } = require('electron')
const path = require('node:path')
const { autoUpdater } = require('electron-updater')

/**
 * Auto-update via GitHub Releases:
 *  - one installer ever; after that electron-updater downloads diffs
 *    from https://github.com/Soomakee/R6-Setups/releases
 *  - checks on launch and every 6 hours, downloads in the background,
 *    applies on restart (user-initiated or on quit).
 */

let mainWindow = null

function sendStatus(status) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('update:status', status)
  }
}

function setUpdaterLogger() {
  autoUpdater.logger = console
  autoUpdater.autoDownload = true
  autoUpdater.autoInstallOnAppQuit = true
}

function registerUpdater() {
  autoUpdater.on('checking-for-update', () => {
    sendStatus({ state: 'checking' })
  })
  autoUpdater.on('update-available', (info) => {
    sendStatus({ state: 'available', version: info.version })
  })
  autoUpdater.on('update-not-available', (info) => {
    sendStatus({ state: 'up-to-date', version: info.version })
  })
  autoUpdater.on('download-progress', (progress) => {
    sendStatus({
      state: 'downloading',
      percent: Math.round(progress.percent),
      bytesPerSecond: progress.bytesPerSecond,
    })
  })
  autoUpdater.on('update-downloaded', (info) => {
    sendStatus({ state: 'ready', version: info.version })
  })
  autoUpdater.on('error', (error) => {
    sendStatus({
      state: 'error',
      message: error == null ? 'unknown error' : (error.message || String(error)),
    })
  })
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 840,
    minWidth: 940,
    minHeight: 620,
    backgroundColor: '#0b0e14',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  Menu.setApplicationMenu(null)

  const devUrl = process.env.VITE_DEV_SERVER_URL
  if (devUrl) {
    mainWindow.loadURL(devUrl)
    mainWindow.webContents.openDevTools({ mode: 'detach' })
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.whenReady().then(() => {
  createWindow()

  ipcMain.handle('update:check', async () => {
    try {
      const result = await autoUpdater.checkForUpdates()
      const version = result && result.update && result.update.version
      return { ok: true, version }
    } catch (error) {
      return { ok: false, error: error == null ? 'unknown' : (error.message || String(error)) }
    }
  })

  ipcMain.handle('update:install', () => {
    autoUpdater.quitAndInstall()
  })

  ipcMain.handle('update:get-current-version', () => app.getVersion())

  setUpdaterLogger()
  registerUpdater()

  // Check shortly after launch, then every 6 hours.
  setTimeout(() => {
    autoUpdater.checkForUpdates().catch(() => {})
  }, 3000)
  setInterval(() => {
    autoUpdater.checkForUpdates().catch(() => {})
  }, 6 * 60 * 60 * 1000)

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
