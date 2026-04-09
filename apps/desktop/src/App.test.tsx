import { render, screen } from '@testing-library/react'
import { HashRouter } from 'react-router-dom'
import { test, expect } from 'vitest'
import { App } from './App'

test('renders navigation', () => {
  render(
    <HashRouter>
      <App />
    </HashRouter>,
  )
  expect(screen.getByRole('link', { name: 'Chat' })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Cron' })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Skills' })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Channels' })).toBeInTheDocument()
})
