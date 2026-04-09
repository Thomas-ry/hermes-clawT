import { ipcRenderer, contextBridge } from 'electron'

type Unsubscribe = () => void

contextBridge.exposeInMainWorld('hermes', {
  status: () => ipcRenderer.invoke('hermes.status'),
  gateway: {
    start: () => ipcRenderer.invoke('hermes.gateway.start'),
    stop: () => ipcRenderer.invoke('hermes.gateway.stop'),
    restart: () => ipcRenderer.invoke('hermes.gateway.restart'),
    onLog: (cb: (line: unknown) => void): Unsubscribe => {
      const listener = (_evt: unknown, line: unknown) => cb(line)
      ipcRenderer.on('hermes.gateway.log', listener)
      return () => ipcRenderer.off('hermes.gateway.log', listener)
    },
  },
  api: {
    fetch: (req: unknown) => ipcRenderer.invoke('hermes.api.fetch', req),
  },
  config: {
    get: () => ipcRenderer.invoke('hermes.config.get'),
    save: (config: unknown) => ipcRenderer.invoke('hermes.config.save', config),
  },
  cron: {
    list: (params?: unknown) => ipcRenderer.invoke('hermes.cron.list', params),
    create: (params: unknown) => ipcRenderer.invoke('hermes.cron.create', params),
    update: (params: unknown) => ipcRenderer.invoke('hermes.cron.update', params),
    pause: (params: unknown) => ipcRenderer.invoke('hermes.cron.pause', params),
    resume: (params: unknown) => ipcRenderer.invoke('hermes.cron.resume', params),
    run: (params: unknown) => ipcRenderer.invoke('hermes.cron.run', params),
    remove: (params: unknown) => ipcRenderer.invoke('hermes.cron.remove', params),
  },
  skills: {
    categories: (params?: unknown) => ipcRenderer.invoke('hermes.skills.categories', params),
    list: (params?: unknown) => ipcRenderer.invoke('hermes.skills.list', params),
    view: (params: unknown) => ipcRenderer.invoke('hermes.skills.view', params),
  },
  env: {
    get: () => ipcRenderer.invoke('hermes.env.get'),
    set: (vars: unknown) => ipcRenderer.invoke('hermes.env.set', vars),
  },
})
