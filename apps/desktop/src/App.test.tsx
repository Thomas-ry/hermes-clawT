import { render, screen } from '@testing-library/react'
import { HashRouter } from 'react-router-dom'
import { beforeEach, test, expect } from 'vitest'
import { App } from './App'
import { I18nProvider } from './i18n'
import { ROUTER_FUTURE_FLAGS } from './lib/routerFuture'

beforeEach(() => {
  window.localStorage.removeItem('clawt.language')
})

test('renders navigation', () => {
  render(
    <I18nProvider>
      <HashRouter future={ROUTER_FUTURE_FLAGS}>
        <App />
      </HashRouter>
    </I18nProvider>,
  )
  expect(screen.getByRole('link', { name: 'Chat' })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Cron' })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Skills' })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Channels' })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Settings' })).toBeInTheDocument()
})
