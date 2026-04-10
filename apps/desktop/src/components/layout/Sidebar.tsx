import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  MessageSquare,
  Clock,
  Puzzle,
  Network,
  Settings,
  PanelLeftClose,
  PanelLeft,
  Play,
  Square,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSettingsStore } from '@/stores/settings'
import { useGatewayStore } from '@/stores/gateway'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, labelKey: 'nav.dashboard' },
  { to: '/chat', icon: MessageSquare, labelKey: 'nav.chat' },
  { to: '/cron', icon: Clock, labelKey: 'nav.cron' },
  { to: '/skills', icon: Puzzle, labelKey: 'nav.skills' },
  { to: '/channels', icon: Network, labelKey: 'nav.channels' },
  { to: '/settings', icon: Settings, labelKey: 'nav.settings' },
] as const

export function Sidebar() {
  const sidebarCollapsed = useSettingsStore((s) => s.sidebarCollapsed)
  const setSidebarCollapsed = useSettingsStore((s) => s.setSidebarCollapsed)
  const gatewayStatus = useGatewayStore((s) => s.status)
  const startGateway = useGatewayStore((s) => s.start)
  const stopGateway = useGatewayStore((s) => s.stop)
  const isRunning = gatewayStatus === 'running'

  return (
    <aside
      className={cn(
        'flex flex-col border-r border-border bg-card transition-all duration-200',
        sidebarCollapsed ? 'w-14' : 'w-52'
      )}
    >
      {/* Gateway status pill */}
      <div className={cn('p-3 border-b border-border', sidebarCollapsed && 'px-2')}>
        {!sidebarCollapsed ? (
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'h-2 w-2 rounded-full',
                  isRunning ? 'bg-success animate-status-pulse' : 'bg-destructive'
                )}
              />
              <span className="text-xs text-muted-foreground">
                {isRunning ? 'Running' : 'Stopped'}
              </span>
            </div>
            {isRunning ? (
              <button
                onClick={() => stopGateway()}
                className="flex h-6 w-6 items-center justify-center rounded-md hover:bg-destructive/15 transition-colors"
                title="Stop"
              >
                <Square className="h-2.5 w-2.5 text-destructive" />
              </button>
            ) : (
              <button
                onClick={() => startGateway()}
                className="flex h-6 w-6 items-center justify-center rounded-md hover:bg-success/15 transition-colors"
                title="Start"
              >
                <Play className="h-2.5 w-2.5 text-success" />
              </button>
            )}
          </div>
        ) : (
          <button
            onClick={() => isRunning ? stopGateway() : startGateway()}
            className={cn(
              'flex h-6 w-full items-center justify-center rounded-md hover:bg-accent transition-colors',
              isRunning ? 'text-destructive' : 'text-success'
            )}
            title={isRunning ? 'Stop' : 'Start'}
          >
            {isRunning ? <Square className="h-2.5 w-2.5" /> : <Play className="h-2.5 w-2.5" />}
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {navItems.map(({ to, icon: Icon, labelKey }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors',
                'hover:bg-accent',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground',
                sidebarCollapsed && 'justify-center px-0'
              )
            }
          >
            <Icon className="h-4 w-4 shrink-0" />
            {!sidebarCollapsed && (
              <span className="truncate">{labelKey}</span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Collapse toggle */}
      <div className="p-2 border-t border-border">
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
        >
          {sidebarCollapsed ? (
            <PanelLeft className="h-4 w-4" />
          ) : (
            <>
              <PanelLeftClose className="h-4 w-4" />
              {!sidebarCollapsed && <span>Collapse</span>}
            </>
          )}
        </button>
      </div>
    </aside>
  )
}
