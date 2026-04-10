import { expect, vi } from 'vitest'
import * as matchers from '@testing-library/jest-dom/matchers'

expect.extend(matchers)

const store = new Map<string, string>()

if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => {
        store.set(key, value)
      },
      removeItem: (key: string) => {
        store.delete(key)
      },
      clear: () => {
        store.clear()
      },
    },
    configurable: true,
  })

  Object.defineProperty(navigator, 'clipboard', {
    value: {
      writeText: vi.fn(async () => undefined),
    },
    configurable: true,
  })
}
