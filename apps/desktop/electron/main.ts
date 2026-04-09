import { app, BrowserWindow } from 'electron'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import crypto from 'node:crypto'
import net from 'node:net'
import { registerIpcHandlers } from './ipc'
import { resolveHermesRuntimePaths } from './hermes/runtimePaths'
import { HermesGatewayManager } from './hermes/gatewayManager'
import { HermesPythonBridge } from './hermes/pythonBridge'
import { loadOrCreateApiServerKey } from './hermes/secrets'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, '..')

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let win: BrowserWindow | null

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.whenReady().then(async () => {
  async function pickPort(preferred: number): Promise<number> {
    const tryListen = (port: number) =>
      new Promise<boolean>((resolve) => {
        const server = net.createServer()
        server.once('error', () => resolve(false))
        server.listen(port, '127.0.0.1', () => {
          server.close(() => resolve(true))
        })
      })

    if (await tryListen(preferred)) return preferred

    // 0 lets the OS pick an available port
    return new Promise<number>((resolve, reject) => {
      const server = net.createServer()
      server.once('error', (err) => reject(err))
      server.listen(0, '127.0.0.1', () => {
        const address = server.address()
        if (typeof address === 'object' && address?.port) {
          const port = address.port
          server.close(() => resolve(port))
        } else {
          server.close(() => reject(new Error('Failed to allocate port')))
        }
      })
    })
  }

  const secretsPath = path.join(app.getPath('userData'), 'secrets.bin')
  const apiKey = loadOrCreateApiServerKey({
    secretsPath,
    generate: () => crypto.randomBytes(32).toString('base64url'),
  })

  const preferredPort = Number(process.env.HERMES_GATEWAY_PORT ?? '8642')
  const gatewayPort = await pickPort(preferredPort)

  const runtime = resolveHermesRuntimePaths({
    gatewayPort,
    apiKey,
  })
  const gateway = new HermesGatewayManager(runtime)
  const python = new HermesPythonBridge(runtime)

  registerIpcHandlers({ runtime, gateway, python })

  createWindow()

  gateway.subscribeLogs((line) => {
    for (const w of BrowserWindow.getAllWindows()) {
      w.webContents.send('hermes.gateway.log', line)
    }
  })

  // Auto-start the gateway on launch (like ClawX).
  // The UI still exposes manual start/stop controls.
  gateway.start().catch((err) => {
    for (const w of BrowserWindow.getAllWindows()) {
      w.webContents.send('hermes.gateway.log', {
        ts: new Date().toISOString(),
        stream: 'stderr',
        line: `Failed to start gateway: ${String(err)}`,
      })
    }
  })
})
