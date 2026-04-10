import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { I18nProvider } from '../i18n'
import { LogsPage } from './LogsPage'

type LogListener = (line: unknown) => void

declare global {
  interface Window {
    hermes: {
      gateway: {
        onLog: (cb: LogListener) => () => void
      }
    }
  }
}

describe('LogsPage', () => {
  const listeners = new Set<LogListener>()

  afterEach(() => {
    cleanup()
  })

  beforeEach(() => {
    listeners.clear()
    vi.clearAllMocks()
    window.hermes = {
      gateway: {
        onLog: (cb: LogListener) => {
          listeners.add(cb)
          return () => {
            listeners.delete(cb)
          }
        },
      },
    } as Window['hermes']
  })

  function emitLog(line: { ts: string; stream: 'stdout' | 'stderr'; line: string }) {
    act(() => {
      listeners.forEach((listener) => listener(line))
    })
  }

  it('filters buffered logs by keyword and stream', async () => {
    render(
      <I18nProvider>
        <LogsPage />
      </I18nProvider>,
    )

    emitLog({ ts: '2026-04-10T12:00:00Z', stream: 'stdout', line: 'gateway started successfully' })
    emitLog({ ts: '2026-04-10T12:00:01Z', stream: 'stderr', line: 'gateway failed to bind port' })

    fireEvent.change(screen.getByLabelText('Search'), {
      target: { value: 'failed' },
    })
    fireEvent.change(screen.getByLabelText('Stream'), {
      target: { value: 'stderr' },
    })

    await waitFor(() => {
      expect(screen.getByText(/gateway failed to bind port/i)).toBeInTheDocument()
    })

    expect(screen.queryByText(/gateway started successfully/i)).not.toBeInTheDocument()
    expect(screen.getByText('Visible lines: 1')).toBeInTheDocument()
  })

  it('copies only the currently visible logs', async () => {
    render(
      <I18nProvider>
        <LogsPage />
      </I18nProvider>,
    )

    emitLog({ ts: '2026-04-10T12:00:00Z', stream: 'stdout', line: 'gateway healthy' })
    emitLog({ ts: '2026-04-10T12:00:01Z', stream: 'stderr', line: 'gateway failed health check' })

    fireEvent.change(screen.getByLabelText('Search'), {
      target: { value: 'failed' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Copy visible logs' }))

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledTimes(1)
    })

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      '[2026-04-10T12:00:01Z] stderr gateway failed health check',
    )
  })
})
