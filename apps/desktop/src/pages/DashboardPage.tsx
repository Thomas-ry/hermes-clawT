import { useTranslation } from 'react-i18next'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useGatewayStore } from '@/stores/gateway'
import { useSettingsStore } from '@/stores/settings'
import { toast } from 'sonner'
import {
  Play,
  Square,
  RotateCw,
  RefreshCw,
  Download,
  Install,
  Clock,
  Server,
} from 'lucide-react'
import { useEffect } from 'react'

export function DashboardPage() {
  const { t } = useTranslation('common')
  const gateway = useGatewayStore()
  const settings = useSettingsStore()

  useEffect(() => {
    gateway.init()
  }, [gateway])

  const isRunning = gateway.status === 'running'
  const statusColor = isRunning ? 'text-success' : gateway.status === 'error' ? 'text-destructive' : 'text-muted-foreground'
  const statusBg = isRunning ? 'bg-success/15' : 'bg-muted'

  async function handleAction(action: 'start' | 'stop' | 'restart' | 'check' | 'download' | 'install') {
    const actions: Record<string, () => Promise<void>> = {
      start: () => gateway.start(),
      stop: () => gateway.stop(),
      restart: () => gateway.restart(),
      check: () => window.hermes.updater.check() as unknown as Promise<void>,
      download: () => window.hermes.updater.download() as unknown as Promise<void>,
      install: () => window.hermes.updater.install() as unknown as Promise<void>,
    }
    try {
      await actions[action]()
      toast.success(`${action} success`)
    } catch (e) {
      toast.error(String(e))
    }
  }

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold">{t('dashboard.title')}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t('dashboard.description')}</p>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${statusBg}`}>
                <Server className={`h-5 w-5 ${statusColor}`} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t('dashboard.systemStatus')}</p>
                <p className={`text-sm font-semibold ${statusColor}`}>
                  {isRunning ? t('dashboard.gatewayRunning') : t('dashboard.gatewayStopped')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15">
                <span className="text-sm font-bold text-primary">{settings.language.toUpperCase()}</span>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t('settings.language')}</p>
                <p className="text-sm font-semibold">{settings.language === 'en' ? 'English' : '中文'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t('dashboard.lastChecked')}</p>
                <p className="text-sm font-semibold">{gateway.lastChecked ?? '—'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>{t('dashboard.quickActions')}</CardTitle>
          <CardDescription>Control Hermes Gateway directly</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant={isRunning ? 'outline' : 'default'}
              onClick={() => handleAction('start')}
              disabled={isRunning}
            >
              <Play className="h-3.5 w-3.5 mr-1" />
              {t('dashboard.start')}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleAction('stop')}
              disabled={!isRunning}
            >
              <Square className="h-3.5 w-3.5 mr-1" />
              {t('dashboard.stop')}
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleAction('restart')}>
              <RotateCw className="h-3.5 w-3.5 mr-1" />
              {t('dashboard.restart')}
            </Button>
            <Button size="sm" variant="outline" onClick={() => gateway.init()}>
              <RefreshCw className="h-3.5 w-3.5 mr-1" />
              {t('common.refresh')}
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleAction('check')}>
              <Download className="h-3.5 w-3.5 mr-1" />
              {t('dashboard.checkUpdates')}
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleAction('download')}>
              <Download className="h-3.5 w-3.5 mr-1" />
              {t('dashboard.downloadUpdate')}
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleAction('install')}>
              <Install className="h-3.5 w-3.5 mr-1" />
              {t('dashboard.restartInstall')}
            </Button>
          </div>

          {gateway.error && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
              {gateway.error}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Gateway Info */}
      {gateway.status !== 'unknown' && (
        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.systemStatus')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">{t('dashboard.port')}</p>
                <p className="font-mono font-semibold">{gateway.port ?? '—'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">{t('dashboard.version')}</p>
                <p className="font-mono font-semibold">{gateway.version ?? '—'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Status</p>
                <Badge variant={isRunning ? 'success' : 'destructive'}>{gateway.status}</Badge>
              </div>
              <div>
                <p className="text-muted-foreground">{t('dashboard.lastChecked')}</p>
                <p className="font-mono">{gateway.lastChecked ?? '—'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
