import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import { App } from './App'
import { I18nProvider } from './i18n'
import { ROUTER_FUTURE_FLAGS } from './lib/routerFuture'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <I18nProvider>
      <HashRouter future={ROUTER_FUTURE_FLAGS}>
        <App />
      </HashRouter>
    </I18nProvider>
  </React.StrictMode>,
)
