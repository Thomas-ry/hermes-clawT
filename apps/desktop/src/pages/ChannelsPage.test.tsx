import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { I18nProvider } from '../i18n'
import { ChannelsPage } from './ChannelsPage'

declare global {
  interface Window {
    hermes: {
      env: {
        get: ReturnType<typeof vi.fn>
        set: ReturnType<typeof vi.fn>
      }
      gateway: {
        restart: ReturnType<typeof vi.fn>
      }
    }
  }
}

describe('ChannelsPage', () => {
  beforeEach(() => {
    window.hermes = {
      env: {
        get: vi.fn(async () => ({
          TELEGRAM_BOT_TOKEN: 'telegram-secret',
          EMAIL_ADDRESS: 'ops@example.com',
          EMAIL_PASSWORD: 'mail-secret',
        })),
        set: vi.fn(async () => ({ success: true })),
      },
      gateway: {
        restart: vi.fn(async () => undefined),
      },
    } as Window['hermes']
  })

  afterEach(() => {
    cleanup()
  })

  it('filters channels by search query', async () => {
    render(
      <I18nProvider>
        <ChannelsPage />
      </I18nProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText('Telegram')).toBeInTheDocument()
      expect(screen.getByText('Email')).toBeInTheDocument()
    })

    fireEvent.change(screen.getByLabelText('Search'), {
      target: { value: 'mail' },
    })

    await waitFor(() => {
      expect(screen.getByText('Email')).toBeInTheDocument()
    })

    expect(screen.queryByText('Telegram')).not.toBeInTheDocument()
    expect(screen.getByText('Visible: 1')).toBeInTheDocument()
  })

  it('hides sensitive values by default and reveals them on demand', async () => {
    render(
      <I18nProvider>
        <ChannelsPage />
      </I18nProvider>,
    )

    await waitFor(() => {
      expect(screen.getByDisplayValue('telegram-secret')).toHaveAttribute('type', 'password')
    })

    fireEvent.click(screen.getByRole('button', { name: 'Show secrets' }))

    await waitFor(() => {
      expect(screen.getByDisplayValue('telegram-secret')).toHaveAttribute('type', 'text')
    })
  })
})
