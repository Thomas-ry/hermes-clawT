import { Outlet } from 'react-router-dom'
import { TitleBar } from './TitleBar'
import { Sidebar } from './Sidebar'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Toaster } from 'sonner'

export function MainLayout() {
  return (
    <TooltipProvider>
      <div className="flex h-screen flex-col overflow-hidden bg-background">
        <TitleBar />
        <div className="flex min-h-0 flex-1 overflow-hidden">
          <Sidebar />
          <main className="min-h-0 flex-1 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
      <Toaster
        position="bottom-right"
        richColors
        closeButton
        toastOptions={{
          style: {
            background: 'var(--color-card)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-foreground)',
          },
        }}
      />
    </TooltipProvider>
  )
}
