import { app, BrowserWindow } from 'electron'
import electronUpdater from 'electron-updater'
import { createInitialUpdaterState, mergeUpdaterState, type UpdaterState } from './updaterState'

const { autoUpdater } = electronUpdater

function broadcast(channel: string, payload: unknown) {
  for (const window of BrowserWindow.getAllWindows()) {
    window.webContents.send(channel, payload)
  }
}

export class ClawTUpdater {
  private state: UpdaterState = createInitialUpdaterState()
  private initialized = false

  private updateState(patch: Partial<UpdaterState>) {
    this.state = mergeUpdaterState(this.state, patch)
    broadcast('clawt.updater.state', this.state)
  }

  private wireEvents() {
    autoUpdater.on('checking-for-update', () => {
      this.updateState({
        checking: true,
        downloading: false,
        downloaded: false,
        progressPercent: null,
        error: null,
        message: 'Checking for updates…',
        lastCheckedAt: new Date().toISOString(),
      })
    })

    autoUpdater.on('update-available', (info) => {
      this.updateState({
        checking: false,
        available: true,
        version: info.version,
        downloaded: false,
        downloading: false,
        progressPercent: 0,
        error: null,
        message: `Update ${info.version} is available.`,
      })
    })

    autoUpdater.on('update-not-available', () => {
      this.updateState({
        checking: false,
        available: false,
        downloaded: false,
        downloading: false,
        progressPercent: null,
        error: null,
        message: 'You are on the latest version.',
      })
    })

    autoUpdater.on('download-progress', (progress) => {
      this.updateState({
        downloading: true,
        downloaded: false,
        progressPercent: progress.percent,
        error: null,
        message: `Downloading update… ${progress.percent.toFixed(1)}%`,
      })
    })

    autoUpdater.on('update-downloaded', (info) => {
      this.updateState({
        checking: false,
        downloading: false,
        downloaded: true,
        downloadedVersion: info.version,
        progressPercent: 100,
        error: null,
        message: `Update ${info.version} downloaded. Restart to install.`,
      })
    })

    autoUpdater.on('error', (error) => {
      this.updateState({
        checking: false,
        downloading: false,
        error: String(error?.message ?? error),
        message: 'Update check failed.',
      })
    })
  }

  init() {
    if (this.initialized) {
      return
    }

    this.initialized = true

    if (!app.isPackaged) {
      this.updateState({
        message: 'Auto-update is available only in packaged builds.',
      })
      return
    }

    autoUpdater.autoDownload = false
    autoUpdater.autoInstallOnAppQuit = true
    this.wireEvents()
  }

  getState(): UpdaterState {
    return this.state
  }

  async checkForUpdates() {
    if (!app.isPackaged) {
      this.updateState({
        message: 'Package the app first to test auto-update.',
      })
      return this.state
    }

    await autoUpdater.checkForUpdates()
    return this.state
  }

  async downloadUpdate() {
    if (!app.isPackaged) {
      throw new Error('Auto-update download is available only in packaged builds.')
    }

    await autoUpdater.downloadUpdate()
    return this.state
  }

  installUpdate() {
    if (!app.isPackaged) {
      throw new Error('Auto-update install is available only in packaged builds.')
    }

    autoUpdater.quitAndInstall()
    return { success: true }
  }
}
