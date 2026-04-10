import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ChatPage } from './ChatPage'
import { I18nProvider } from '../i18n'

vi.mock('../lib/hermesClient', () => ({
  hermesApiChat: vi.fn(),
}))

describe('ChatPage', () => {
  beforeEach(() => {
    window.localStorage.removeItem('clawt.language')
  })

  it('renders starter prompts and applies one to the composer', () => {
    render(
      <I18nProvider>
        <ChatPage />
      </I18nProvider>,
    )

    const starter = screen.getByRole('button', {
      name: 'Help me understand the current Hermes runtime and what I can do from this desktop app.',
    })

    fireEvent.click(starter)

    expect(screen.getByPlaceholderText('Type a message…')).toHaveValue(
      'Help me understand the current Hermes runtime and what I can do from this desktop app.',
    )
  })
})
