export {}

declare global {
  interface Window {
    hermes: {
      status: () => Promise<unknown>
      updater: {
        status: () => Promise<unknown>
        check: () => Promise<unknown>
        download: () => Promise<unknown>
        install: () => Promise<unknown>
        onState: (cb: (state: unknown) => void) => () => void
      }
      gateway: {
        start: () => Promise<unknown>
        stop: () => Promise<unknown>
        restart: () => Promise<unknown>
        onLog: (cb: (line: unknown) => void) => () => void
      }
      api: {
        fetch: (req: unknown) => Promise<{ status: number; headers: Record<string, string>; body: string }>
      }
      config: {
        get: () => Promise<Record<string, unknown>>
        save: (config: Record<string, unknown>) => Promise<{ success: true }>
      }
      cron: {
        list: (params?: unknown) => Promise<unknown>
        create: (params: unknown) => Promise<unknown>
        update: (params: unknown) => Promise<unknown>
        pause: (params: unknown) => Promise<unknown>
        resume: (params: unknown) => Promise<unknown>
        run: (params: unknown) => Promise<unknown>
        remove: (params: unknown) => Promise<unknown>
        outputs: {
          list: (params: unknown) => Promise<unknown>
          read: (params: unknown) => Promise<unknown>
        }
      }
      skills: {
        categories: (params?: unknown) => Promise<unknown>
        list: (params?: unknown) => Promise<unknown>
        view: (params: unknown) => Promise<unknown>
        all: () => Promise<unknown>
        viewRaw: (params: unknown) => Promise<unknown>
        disabled: {
          get: (params?: unknown) => Promise<unknown>
          save: (params: unknown) => Promise<unknown>
        }
      }
      env: {
        get: () => Promise<Record<string, string>>
        set: (vars: Record<string, string | null | undefined>) => Promise<{ success: true }>
      }
    }
  }
}
