import { app } from 'electron'
import path from 'node:path'

export type HermesRuntimePaths = {
  hermesHomeDir: string
  hermesInstallDir: string
  pythonExe: string
  gatewayPort: number
  apiKey: string
}

function pythonExeForInstall(installDir: string): string {
  if (process.platform === 'win32') {
    return path.join(installDir, 'venv', 'Scripts', 'python.exe')
  }
  return path.join(installDir, 'venv', 'bin', 'python')
}

function hermesInstallDir(): string {
  const fromEnv = process.env.HERMES_RUNTIME_DIR
  if (fromEnv && fromEnv.trim()) return fromEnv.trim()

  // Packaged app: electron-builder extraResources → process.resourcesPath/<to>
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'hermes-agent')
  }

  // Dev default: assume sibling checkout (common in local development).
  const devFallback = path.resolve(process.cwd(), '..', '..', '..', 'hermes-agent')
  return devFallback
}

function hermesHomeDir(): string {
  return path.join(app.getPath('userData'), 'hermes')
}

export function resolveHermesRuntimePaths(params: {
  gatewayPort: number
  apiKey: string
}): HermesRuntimePaths {
  const hermesInstallDirResolved = hermesInstallDir()
  return {
    hermesHomeDir: hermesHomeDir(),
    hermesInstallDir: hermesInstallDirResolved,
    pythonExe: pythonExeForInstall(hermesInstallDirResolved),
    gatewayPort: params.gatewayPort,
    apiKey: params.apiKey,
  }
}
