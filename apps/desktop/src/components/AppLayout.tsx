import { NavLink, Outlet } from 'react-router-dom'
import { useI18n } from '../i18n'
import { ArrowCircleIcon, ChatIcon, ClockIcon, DashboardIcon, LinkIcon, SettingsIcon, SparklesIcon, TerminalIcon } from './icons'
import './appLayout.css'

const NAV_ITEMS: Array<{ to: string; labelKey: string; icon: React.ReactNode }> = [
  { to: '/dashboard', labelKey: 'nav.dashboard', icon: <DashboardIcon width={18} height={18} /> },
  { to: '/chat', labelKey: 'nav.chat', icon: <ChatIcon width={18} height={18} /> },
  { to: '/cron', labelKey: 'nav.cron', icon: <ClockIcon width={18} height={18} /> },
  { to: '/skills', labelKey: 'nav.skills', icon: <SparklesIcon width={18} height={18} /> },
  { to: '/channels', labelKey: 'nav.channels', icon: <LinkIcon width={18} height={18} /> },
  { to: '/settings', labelKey: 'nav.settings', icon: <SettingsIcon width={18} height={18} /> },
  { to: '/logs', labelKey: 'nav.logs', icon: <TerminalIcon width={18} height={18} /> },
]

export function AppLayout() {
  const { t } = useI18n()

  return (
    <div className="hc-root">
      <aside className="hc-sidebar">
        <div className="hc-brand">{t('app.brand')}</div>
        <div className="hc-brand-meta">
          <span className="ui-pill">{t('app.sidebarMode')}</span>
          <span className="ui-pill">{t('app.sidebarRuntime')}</span>
        </div>
        <nav className="hc-nav">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `hc-nav-item ${isActive ? 'active' : ''}`}
            >
              <span className="hc-nav-icon">{item.icon}</span>
              <span>{t(item.labelKey)}</span>
            </NavLink>
          ))}
        </nav>
        <div className="hc-sidebar-footer">
          <span className="ui-pill">
            <ArrowCircleIcon width={14} height={14} />
            {t('app.sidebarRuntime')}
          </span>
        </div>
      </aside>
      <main className="hc-main">
        <Outlet />
      </main>
    </div>
  )
}
