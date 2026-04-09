import { describe, expect, it } from 'vitest'
import { createInitialUpdaterState, mergeUpdaterState } from './updaterState'

describe('updaterState', () => {
  it('creates a neutral initial state', () => {
    expect(createInitialUpdaterState()).toEqual({
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
    })
  })

  it('merges patches immutably', () => {
    const initial = createInitialUpdaterState()
    const next = mergeUpdaterState(initial, {
      checking: true,
      message: 'Checking for updates…',
    })

    expect(next).toEqual({
      ...initial,
      checking: true,
      message: 'Checking for updates…',
    })
    expect(initial.checking).toBe(false)
  })
})
