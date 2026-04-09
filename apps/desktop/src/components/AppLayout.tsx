import { NavLink, Outlet } from 'react-router-dom'
import './appLayout.css'

const NAV_ITEMS: Array<{ to: string; label: string }> = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/chat', label: 'Chat' },
  { to: '/cron', label: 'Cron' },
  { to: '/skills', label: 'Skills' },
  { to: '/channels', label: 'Channels' },
  { to: '/settings', label: 'Settings' },
  { to: '/logs', label: 'Logs' },
]

export function AppLayout() {
  return (
    <div className="hc-root">
      <aside className="hc-sidebar">
        <div className="hc-brand">clawT</div>
        <nav className="hc-nav">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `hc-nav-item ${isActive ? 'active' : ''}`}
            >
              {item.label}
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
