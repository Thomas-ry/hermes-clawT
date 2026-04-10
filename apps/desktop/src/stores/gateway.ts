import { create } from 'zustand'

export type GatewayStatus = 'unknown' | 'starting' | 'running' | 'stopping' | 'stopped' | 'error'

interface GatewayState {
  status: GatewayStatus
  port: number | null
  version: string | null
  error: string | null
  lastChecked: string | null

  setStatus: (status: GatewayStatus) => void
  setPort: (port: number) => void
  setVersion: (version: string) => void
  setError: (error: string | null) => void
  setLastChecked: (time: string) => void
  init: () => Promise<void>
  start: () => Promise<void>
  stop: () => Promise<void>
  restart: () => Promise<void>
}

export const useGatewayStore = create<GatewayState>((set, get) => ({
  status: 'unknown',
  port: null,
  version: null,
  error: null,
  lastChecked: null,

  setStatus: (status) => set({ status }),
  setPort: (port) => set({ port }),
  setVersion: (version) => set({ version }),
  setError: (error) => set({ error }),
  setLastChecked: (lastChecked) => set({ lastChecked }),

  init: async () => {
    try {
      const status = await window.hermes.status()
      const s = status as { gateway?: { running?: boolean; port?: number }; runtime?: { version?: string } }
      set({
        status: s.gateway?.running ? 'running' : 'stopped',
        port: s.gateway?.port ?? null,
        version: s.runtime?.version ?? null,
        lastChecked: new Date().toLocaleTimeString(),
        error: null,
      })
    } catch (e) {
      set({ status: 'error', error: String(e) })
    }
  },

  start: async () => {
    set({ status: 'starting', error: null })
    try {
      await window.hermes.gateway.start()
      set({ status: 'running' })
      await get().init()
    } catch (e) {
      set({ status: 'error', error: String(e) })
    }
  },

  stop: async () => {
    set({ status: 'stopping', error: null })
    try {
      await window.hermes.gateway.stop()
      set({ status: 'stopped' })
    } catch (e) {
      set({ status: 'error', error: String(e) })
    }
  },

  restart: async () => {
    set({ status: 'starting', error: null })
    try {
      await window.hermes.gateway.restart()
      set({ status: 'running' })
      await get().init()
    } catch (e) {
      set({ status: 'error', error: String(e) })
    }
  },
}))
