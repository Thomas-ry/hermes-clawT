import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Theme = 'dark' | 'light' | 'system'
export type Language = 'en' | 'zh'

interface SettingsState {
  theme: Theme
  language: Language
  startMinimized: boolean
  launchAtStartup: boolean
  gatewayAutoStart: boolean
  gatewayPort: number
  sidebarCollapsed: boolean
  devModeUnlocked: boolean
  setupComplete: boolean
  autoCheckUpdate: boolean
  autoDownloadUpdate: boolean
  updateChannel: 'stable' | 'beta' | 'dev'

  setTheme: (theme: Theme) => void
  setLanguage: (language: Language) => void
  setStartMinimized: (v: boolean) => void
  setLaunchAtStartup: (v: boolean) => void
  setGatewayAutoStart: (v: boolean) => void
  setGatewayPort: (port: number) => void
  setSidebarCollapsed: (v: boolean) => void
  setDevModeUnlocked: (v: boolean) => void
  markSetupComplete: () => void
  setAutoCheckUpdate: (v: boolean) => void
  setAutoDownloadUpdate: (v: boolean) => void
  setUpdateChannel: (channel: 'stable' | 'beta' | 'dev') => void
  resetSettings: () => void
}

const defaults = {
  theme: 'dark' as Theme,
  language: 'en' as Language,
  startMinimized: false,
  launchAtStartup: false,
  gatewayAutoStart: true,
  gatewayPort: 7890,
  sidebarCollapsed: false,
  devModeUnlocked: false,
  setupComplete: false,
  autoCheckUpdate: true,
  autoDownloadUpdate: false,
  updateChannel: 'stable' as const,
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...defaults,

      setTheme: (theme) => {
        set({ theme })
        const root = window.document.documentElement
        root.classList.remove('light', 'dark')
        if (theme === 'system') {
          root.classList.add(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
        } else {
          root.classList.add(theme)
        }
      },

      setLanguage: (language) => set({ language }),
      setStartMinimized: (startMinimized) => set({ startMinimized }),
      setLaunchAtStartup: (launchAtStartup) => set({ launchAtStartup }),
      setGatewayAutoStart: (gatewayAutoStart) => set({ gatewayAutoStart }),
      setGatewayPort: (gatewayPort) => set({ gatewayPort }),
      setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
      setDevModeUnlocked: (devModeUnlocked) => set({ devModeUnlocked }),
      markSetupComplete: () => set({ setupComplete: true }),
      setAutoCheckUpdate: (autoCheckUpdate) => set({ autoCheckUpdate }),
      setAutoDownloadUpdate: (autoDownloadUpdate) => set({ autoDownloadUpdate }),
      setUpdateChannel: (updateChannel) => set({ updateChannel }),
      resetSettings: () => set(defaults),
    }),
    { name: 'clawt-settings' },
  ),
)
