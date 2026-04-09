import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { I18nProvider, readStoredLanguage, useI18n } from './i18n'

function Probe() {
  const { t, setLanguage } = useI18n()

  return (
    <div>
      <span>{t('nav.settings')}</span>
      <button onClick={() => setLanguage('zh')}>switch</button>
    </div>
  )
}

describe('i18n', () => {
  beforeEach(() => {
    window.localStorage.removeItem('clawt.language')
  })

  it('defaults to english when nothing is stored', () => {
    expect(readStoredLanguage()).toBe('en')
  })

  it('switches language and persists it', () => {
    render(
      <I18nProvider>
        <Probe />
      </I18nProvider>,
    )

    expect(screen.getByText('Settings')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'switch' }))
    expect(screen.getByText('设置')).toBeInTheDocument()
    expect(window.localStorage.getItem('clawt.language')).toBe('zh')
  })
})
