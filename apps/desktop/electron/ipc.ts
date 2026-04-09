import { ipcMain } from 'electron'
import type { HermesGatewayManager } from './hermes/gatewayManager'
import type { HermesPythonBridge } from './hermes/pythonBridge'
import type { HermesRuntimePaths } from './hermes/runtimePaths'
import { apiProxyFetch } from './hermes/apiProxy'
import { readEnvVars, upsertEnvVars } from './hermes/envFile'
import path from 'node:path'

export function registerIpcHandlers(deps: {
  runtime: HermesRuntimePaths
  gateway: HermesGatewayManager
  python: HermesPythonBridge
}): void {
  ipcMain.handle('hermes.status', async () => {
    return {
      runtime: {
        hermesHomeDir: deps.runtime.hermesHomeDir,
        hermesInstallDir: deps.runtime.hermesInstallDir,
        gatewayPort: deps.runtime.gatewayPort,
      },
      gateway: deps.gateway.status(),
    }
  })

  ipcMain.handle('hermes.gateway.start', async () => deps.gateway.start())
  ipcMain.handle('hermes.gateway.stop', async () => deps.gateway.stop())
  ipcMain.handle('hermes.gateway.restart', async () => deps.gateway.restart())

  ipcMain.handle('hermes.api.fetch', async (_evt, req) => apiProxyFetch(deps.runtime, req))

  ipcMain.handle('hermes.env.get', async () => {
    const envPath = path.join(deps.runtime.hermesHomeDir, '.env')
    return readEnvVars(envPath)
  })

  ipcMain.handle('hermes.env.set', async (_evt, vars) => {
    const envPath = path.join(deps.runtime.hermesHomeDir, '.env')
    upsertEnvVars(envPath, vars ?? {})
    return { success: true }
  })

  ipcMain.handle('hermes.config.get', async () => {
    return deps.python.callJson({
      module: 'hermes_cli.config',
      fn: 'load_config',
    })
  })

  ipcMain.handle('hermes.config.save', async (_evt, params) => {
    return deps.python.callJson({
      module: 'hermes_cli.config',
      fn: 'save_config',
      kwargs: { config: params },
    })
  })

  ipcMain.handle('hermes.cron.list', async (_evt, params) => {
    return deps.python.callJson({
      module: 'tools.cronjob_tools',
      fn: 'cronjob',
      kwargs: { action: 'list', ...(params ?? {}) },
    })
  })

  ipcMain.handle('hermes.cron.create', async (_evt, params) => {
    return deps.python.callJson({
      module: 'tools.cronjob_tools',
      fn: 'cronjob',
      kwargs: { action: 'create', ...(params ?? {}) },
    })
  })

  ipcMain.handle('hermes.cron.update', async (_evt, params) => {
    return deps.python.callJson({
      module: 'tools.cronjob_tools',
      fn: 'cronjob',
      kwargs: { action: 'update', ...(params ?? {}) },
    })
  })

  ipcMain.handle('hermes.cron.pause', async (_evt, params) => {
    return deps.python.callJson({
      module: 'tools.cronjob_tools',
      fn: 'cronjob',
      kwargs: { action: 'pause', ...(params ?? {}) },
    })
  })

  ipcMain.handle('hermes.cron.resume', async (_evt, params) => {
    return deps.python.callJson({
      module: 'tools.cronjob_tools',
      fn: 'cronjob',
      kwargs: { action: 'resume', ...(params ?? {}) },
    })
  })

  ipcMain.handle('hermes.cron.run', async (_evt, params) => {
    return deps.python.callJson({
      module: 'tools.cronjob_tools',
      fn: 'cronjob',
      kwargs: { action: 'run', ...(params ?? {}) },
    })
  })

  ipcMain.handle('hermes.cron.remove', async (_evt, params) => {
    return deps.python.callJson({
      module: 'tools.cronjob_tools',
      fn: 'cronjob',
      kwargs: { action: 'remove', ...(params ?? {}) },
    })
  })

  ipcMain.handle('hermes.skills.categories', async (_evt, params) => {
    return deps.python.callJson({
      module: 'tools.skills_tool',
      fn: 'skills_categories',
      kwargs: params ?? {},
    })
  })

  ipcMain.handle('hermes.skills.list', async (_evt, params) => {
    return deps.python.callJson({
      module: 'tools.skills_tool',
      fn: 'skills_list',
      kwargs: params ?? {},
    })
  })

  ipcMain.handle('hermes.skills.view', async (_evt, params) => {
    return deps.python.callJson({
      module: 'tools.skills_tool',
      fn: 'skill_view',
      kwargs: params ?? {},
    })
  })
}
