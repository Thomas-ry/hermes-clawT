import { ipcRenderer, contextBridge } from 'electron'

type Unsubscribe = () => void

contextBridge.exposeInMainWorld('hermes', {
  status: () => ipcRenderer.invoke('hermes.status'),
  updater: {
    status: () => ipcRenderer.invoke('clawt.updater.status'),
    check: () => ipcRenderer.invoke('clawt.updater.check'),
    download: () => ipcRenderer.invoke('clawt.updater.download'),
    install: () => ipcRenderer.invoke('clawt.updater.install'),
    onState: (cb: (state: unknown) => void): Unsubscribe => {
      const listener = (_evt: unknown, state: unknown) => cb(state)
      ipcRenderer.on('clawt.updater.state', listener)
      return () => ipcRenderer.off('clawt.updater.state', listener)
    },
  },
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
    outputs: {
      list: (params: unknown) => ipcRenderer.invoke('hermes.cron.outputs.list', params),
      read: (params: unknown) => ipcRenderer.invoke('hermes.cron.outputs.read', params),
    },
  },
  skills: {
    categories: (params?: unknown) => ipcRenderer.invoke('hermes.skills.categories', params),
    list: (params?: unknown) => ipcRenderer.invoke('hermes.skills.list', params),
    view: (params: unknown) => ipcRenderer.invoke('hermes.skills.view', params),
    all: () => ipcRenderer.invoke('hermes.skills.all'),
    viewRaw: (params: unknown) => ipcRenderer.invoke('hermes.skills.viewRaw', params),
    disabled: {
      get: (params?: unknown) => ipcRenderer.invoke('hermes.skills.disabled.get', params),
      save: (params: unknown) => ipcRenderer.invoke('hermes.skills.disabled.save', params),
    },
  },
  env: {
    get: () => ipcRenderer.invoke('hermes.env.get'),
    set: (vars: unknown) => ipcRenderer.invoke('hermes.env.set', vars),
  },
})
