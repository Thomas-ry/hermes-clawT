export type UpdaterState = {
  available: boolean
  checking: boolean
  downloading: boolean
  downloaded: boolean
  version: string | null
  downloadedVersion: string | null
  progressPercent: number | null
  message: string
  error: string | null
  lastCheckedAt: string | null
}

export function createInitialUpdaterState(): UpdaterState {
  return {
    available: false,
    checking: false,
    downloading: false,
    downloaded: false,
    version: null,
    downloadedVersion: null,
    progressPercent: null,
    message: 'Updates not checked yet.',
    error: null,
    lastCheckedAt: null,
  }
}

export function mergeUpdaterState(
  current: UpdaterState,
  patch: Partial<UpdaterState>,
): UpdaterState {
  return {
    ...current,
    ...patch,
  }
}
