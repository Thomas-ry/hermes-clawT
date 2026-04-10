import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { I18nProvider } from '../i18n'
import { CronPage } from './CronPage'

declare global {
  interface Window {
    hermes: {
      cron: {
        list: ReturnType<typeof vi.fn>
        outputs: {
          list: ReturnType<typeof vi.fn>
          read: ReturnType<typeof vi.fn>
        }
        create: ReturnType<typeof vi.fn>
        update: ReturnType<typeof vi.fn>
        pause: ReturnType<typeof vi.fn>
        resume: ReturnType<typeof vi.fn>
        run: ReturnType<typeof vi.fn>
        remove: ReturnType<typeof vi.fn>
      }
    }
  }
}

describe('CronPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    window.hermes = {
      cron: {
        list: vi.fn(async () => ({
          jobs: [
            {
              job_id: 'job-1',
              name: 'Daily Status',
              schedule: 'every day at 09:00',
              prompt_preview: 'Write a short daily status note.',
              state: 'scheduled',
              deliver: ['local'],
            },
            {
              job_id: 'job-2',
              name: 'Paused Review',
              schedule: 'every monday at 10:00',
              prompt_preview: 'Review the skills backlog.',
              state: 'paused',
              deliver: ['local'],
              paused_reason: 'manual pause',
            },
          ],
        })),
        outputs: {
          list: vi.fn(async ({ job_id }: { job_id: string }) => ({
            files:
              job_id === 'job-1'
                ? [
                    { fileName: 'status-2026-04-10.md', path: '/tmp/status-2026-04-10.md' },
                    { fileName: 'risk-review-2026-04-10.md', path: '/tmp/risk-review-2026-04-10.md' },
                  ]
                : [],
          })),
          read: vi.fn(async ({ path }: { path: string }) => ({
            file: {
              content:
                path === '/tmp/risk-review-2026-04-10.md'
                  ? 'Risk review content'
                  : 'Daily status content',
            },
          })),
        },
        create: vi.fn(),
        update: vi.fn(),
        pause: vi.fn(),
        resume: vi.fn(),
        run: vi.fn(),
        remove: vi.fn(),
      },
    } as Window['hermes']
  })

  afterEach(() => {
    cleanup()
  })

  it('filters jobs by search query and state', async () => {
    render(
      <I18nProvider>
        <CronPage />
      </I18nProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText('Daily Status')).toBeInTheDocument()
      expect(screen.getByText('Paused Review')).toBeInTheDocument()
    })

    fireEvent.change(screen.getByLabelText('Search'), {
      target: { value: 'paused' },
    })

    await waitFor(() => {
      expect(screen.getByText('Paused Review')).toBeInTheDocument()
    })
    expect(screen.queryByText('Daily Status')).not.toBeInTheDocument()
    expect(screen.getByText('Visible: 1')).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('State'), {
      target: { value: 'paused' },
    })

    await waitFor(() => {
      expect(screen.getByText('Paused Review')).toBeInTheDocument()
    })
    expect(screen.queryByText('Daily Status')).not.toBeInTheDocument()
  })

  it('filters saved outputs and copies the selected preview', async () => {
    render(
      <I18nProvider>
        <CronPage />
      </I18nProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText('status-2026-04-10.md')).toBeInTheDocument()
      expect(screen.getByText('risk-review-2026-04-10.md')).toBeInTheDocument()
    })

    fireEvent.change(screen.getByLabelText('Output search'), {
      target: { value: 'risk' },
    })

    await waitFor(() => {
      expect(screen.getByText('risk-review-2026-04-10.md')).toBeInTheDocument()
    })

    expect(screen.queryByText('status-2026-04-10.md')).not.toBeInTheDocument()
    expect(screen.getByText('Visible outputs: 1')).toBeInTheDocument()

    fireEvent.click(screen.getByText('risk-review-2026-04-10.md'))

    await waitFor(() => {
      expect(screen.getByText('Risk review content')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: 'Copy output' }))

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('Risk review content')
    })
  })
})
