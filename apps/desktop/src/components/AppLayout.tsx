import { NavLink, Outlet } from 'react-router-dom'
import { useI18n } from '../i18n'
import './appLayout.css'

const NAV_ITEMS: Array<{ to: string; labelKey: string }> = [
  { to: '/dashboard', labelKey: 'nav.dashboard' },
  { to: '/chat', labelKey: 'nav.chat' },
  { to: '/cron', labelKey: 'nav.cron' },
  { to: '/skills', labelKey: 'nav.skills' },
  { to: '/channels', labelKey: 'nav.channels' },
  { to: '/settings', labelKey: 'nav.settings' },
  { to: '/logs', labelKey: 'nav.logs' },
]

export function AppLayout() {
  const { t } = useI18n()

  return (
    <div className="hc-root">
      <aside className="hc-sidebar">
        <div className="hc-brand">{t('app.brand')}</div>
        <nav className="hc-nav">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `hc-nav-item ${isActive ? 'active' : ''}`}
            >
              {t(item.labelKey)}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="hc-main">
        <Outlet />
      </main>
    </div>
  )
}
