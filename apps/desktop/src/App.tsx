import { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { MainLayout } from './components/layout/MainLayout'
import { DashboardPage } from './pages/DashboardPage'
import { ChatPage } from './pages/ChatPage'
import { CronPage } from './pages/CronPage'
import { SkillsPage } from './pages/SkillsPage'
import { ChannelsPage } from './pages/ChannelsPage'
import { SettingsPage } from './pages/SettingsPage'
import { LogsPage } from './pages/LogsPage'
import { ErrorBoundary } from './components/ErrorBoundary'
import { useGatewayStore } from './stores/gateway'

function AppContent() {
  const init = useGatewayStore((s) => s.init)

  useEffect(() => { init() }, [init])

  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<ChatPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/cron" element={<CronPage />} />
        <Route path="/skills" element={<SkillsPage />} />
        <Route path="/channels" element={<ChannelsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/logs" element={<LogsPage />} />
      </Route>
    </Routes>
  )
}

export function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  )
}
