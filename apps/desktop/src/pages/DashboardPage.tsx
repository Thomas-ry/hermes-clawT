import { useEffect, useState } from 'react'
import { hermesStatus } from '../lib/hermesClient'
import { useI18n } from '../i18n'
import { StatCard } from '../components/StatCard'
import { ArrowCircleIcon, ClockIcon, ServerIcon } from '../components/icons'
import { fetchReleaseFeedSummary, PUBLIC_UPDATE_FEED_URL, type ReleaseFeedSummary } from '../lib/releaseFeed'
import { useToast } from '../components/Toast'

type UpdaterStatus = {
  status?: string
  available?: boolean
  checking?: boolean
  downloading?: boolean
  downloaded?: boolean
  version?: string | null
  downloadedVersion?: string | null
  progressPercent?: number | null
  error?: string | null
  lastCheckedAt?: string | null
}

type GatewayState = 'unknown' | 'running' | 'stopped'

function StatusDot({ running }: { running: boolean }) {
  return (
    <span
      style={{
        display: 'inline-block',
        width: 9,
        height: 9,
        borderRadius: '50%',
        background: running ? '#4ade80' : '#ff6b6b',
        boxShadow: running ? '0 0 8px #4ade80' : '0 0 8px #ff6b6b',
        marginRight: 6,
        animation: running ? 'statusPulse 2s ease-in-out infinite' : 'none',
      }}
    />
  )
}

export function DashboardPage() {
  const { language, t } = useI18n()
  const { toast } = useToast()
  const [status, setStatus] = useState<unknown>(null)
  const [updater, setUpdater] = useState<UpdaterStatus | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [releaseFeed, setReleaseFeed] = useState<ReleaseFeedSummary | null>(null)
  const [releaseFeedError, setReleaseFeedError] = useState<string | null>(null)
  const [releaseFeedLoading, setReleaseFeedLoading] = useState(false)
  const [gatewayState, setGatewayState] = useState<GatewayState>('unknown')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  async function refresh() {
    try {
      setErr(null)
      const nextStatus = await hermesStatus()
      setStatus(nextStatus)
      const updaterFromStatus = (nextStatus as { updater?: UpdaterStatus }).updater ?? null
      setUpdater(updaterFromStatus)
      const gw = (nextStatus as { gateway?: { running?: boolean } }).gateway
      setGatewayState(gw?.running ? 'running' : 'stopped')
    } catch (e) {
      setErr(String(e))
    }
  }

  useEffect(() => {
    refresh()
    const interval = setInterval(refresh, 8000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const unsubscribe = window.hermes.updater.onState((nextState) => {
      setUpdater(nextState as UpdaterStatus)
    })
    return unsubscribe
  }, [])

  async function doAction(action: string, fn: () => Promise<void>) {
    setActionLoading(action)
    try {
      await fn()
      await refresh()
      toast(`${action} success`, 'success')
    } catch (e) {
      toast(String(e), 'error')
    } finally {
      setActionLoading(null)
    }
  }

  function refreshReleaseFeed() {
    setReleaseFeedLoading(true)
    setReleaseFeedError(null)
    fetchReleaseFeedSummary()
      .then((summary) => setReleaseFeed(summary))
      .catch((error) => setReleaseFeedError(String(error)))
      .finally(() => setReleaseFeedLoading(false))
  }

  useEffect(() => {
    refreshReleaseFeed()
  }, [])

  function renderUpdaterStatus(current: UpdaterStatus | null): string {
    if (!current) return t('dashboard.updaterLoading')
    switch (current.status) {
      case 'idle': return t('dashboard.updateIdle')
      case 'dev-only': return t('dashboard.updateDevOnly')
      case 'packaged-required': return t('dashboard.updatePackagedRequired')
      case 'checking': return t('dashboard.updateChecking')
      case 'available': return `${t('dashboard.updateAvailable')} ${current.version ?? ''}`.trim()
      case 'not-available': return t('dashboard.updateNotAvailable')
      case 'downloading': return `${t('dashboard.updateDownloading')} ${current.progressPercent?.toFixed(1) ?? '0.0'}%`
      case 'downloaded': return `${t('dashboard.updateDownloaded')} ${current.downloadedVersion ?? current.version ?? ''}`.trim()
      case 'error': return `${t('dashboard.updateError')}${current.error ? `: ${current.error}` : ''}`
      default: return t('dashboard.updaterLoading')
    }
  }

  function renderReleaseCategory(category: string): string {
    switch (category) {
      case 'Features': return t('dashboard.releaseCategoryFeatures')
      case 'Fixes': return t('dashboard.releaseCategoryFixes')
      case 'Improvements': return t('dashboard.releaseCategoryImprovements')
      case 'Documentation & QA': return t('dashboard.releaseCategoryDocsQa')
      case 'Maintenance': return t('dashboard.releaseCategoryMaintenance')
      default: return t('dashboard.releaseCategoryOther')
    }
  }

  function formatPublishedAt(value?: string): string | null {
    if (!value) return null
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return value
    return new Intl.DateTimeFormat(language === 'zh' ? 'zh-CN' : 'en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(date)
  }

  const runtime = (status as { runtime?: { hermesHomeDir?: string; gatewayPort?: number } } | null)?.runtime
  const isRunning = gatewayState === 'running'

  return (
    <div className="page-shell">
      <style>{`
        @keyframes statusPulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 8px #4ade80; }
          50% { opacity: 0.6; box-shadow: 0 0 16px #4ade80; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.3s ease forwards; }
        .stat-card:hover { border-color: var(--border-strong); transform: translateY(-2px); }
        .stat-card { transition: all 0.2s ease; }
      `}</style>

      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h2 className="page-title">{t('dashboard.title')}</h2>
            <p className="page-description">{t('dashboard.description')}</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <StatusDot running={isRunning} />
            <span className="ui-pill" style={{ fontSize: '0.82rem' }}>
              {isRunning ? t('dashboard.running') : t('dashboard.stopped')}
            </span>
          </div>
        </div>
      </div>

      <div className="ui-stat-grid fade-up" style={{ marginBottom: 18 }}>
        <StatCard
          icon={<ServerIcon width={18} height={18} />}
          label={t('dashboard.systemStatus')}
          value={isRunning ? t('dashboard.running') : t('dashboard.stopped')}
          hint={`${t('dashboard.gatewayPort')}: ${runtime?.gatewayPort ?? '—'}`}
        />
        <StatCard
          icon={<ArrowCircleIcon width={18} height={18} />}
          label={t('dashboard.autoUpdateTitle')}
          value={renderUpdaterStatus(updater)}
          hint={updater?.version ?? t('dashboard.versionInfo')}
        />
        <StatCard
          icon={<ClockIcon width={18} height={18} />}
          label={t('dashboard.releaseNotesTitle')}
          value={releaseFeed?.version ?? '—'}
          hint={formatPublishedAt(releaseFeed?.publishedAt) ?? t('dashboard.releaseNotesLoading')}
        />
      </div>

      <div className="ui-card fade-up" style={{ marginBottom: 18 }}>
        <div className="ui-card-body">
          <h3 className="ui-card-title" style={{ marginBottom: 14 }}>{t('dashboard.quickActions')}</h3>
          <div className="ui-toolbar" style={{ gap: 10, flexWrap: 'wrap' }}>
            <button
              onClick={() => doAction('start', () => window.hermes.gateway.start())}
              disabled={actionLoading !== null}
              style={{ minWidth: 88 }}
            >
              {actionLoading === 'start' ? '…' : t('dashboard.start')}
            </button>
            <button
              onClick={() => doAction('stop', () => window.hermes.gateway.stop())}
              disabled={actionLoading !== null}
              style={{ minWidth: 88 }}
            >
              {actionLoading === 'stop' ? '…' : t('dashboard.stop')}
            </button>
            <button
              onClick={() => doAction('restart', () => window.hermes.gateway.restart())}
              disabled={actionLoading !== null}
              style={{ minWidth: 88 }}
            >
              {actionLoading === 'restart' ? '…' : t('dashboard.restart')}
            </button>
            <button onClick={refresh} disabled={actionLoading !== null}>
              {t('dashboard.refresh')}
            </button>
            <button
              onClick={() => doAction('check', () => window.hermes.updater.check())}
              disabled={actionLoading !== null}
            >
              {t('dashboard.checkUpdates')}
            </button>
            <button
              onClick={() => doAction('download', () => window.hermes.updater.download())}
              disabled={!updater?.available || actionLoading !== null}
            >
              {t('dashboard.downloadUpdate')}
            </button>
            <button
              onClick={() => doAction('install', () => window.hermes.updater.install())}
              disabled={!updater?.downloaded || actionLoading !== null}
            >
              {t('dashboard.restartInstall')}
            </button>
          </div>
        </div>
      </div>

      <div className="ui-grid ui-grid-two fade-up" style={{ animationDelay: '0.1s' }}>
        <section className="ui-card">
          <div className="ui-card-body">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <div>
                <h3 className="ui-card-title">{t('dashboard.autoUpdateTitle')}</h3>
                <p className="ui-card-description">{t('dashboard.autoUpdateDescription')}</p>
              </div>
              <span className="ui-pill">{renderUpdaterStatus(updater)}</span>
            </div>
            <div className="ui-surface" style={{ display: 'grid', gap: 12 }}>
              <div className="ui-meta">{t('dashboard.updateSource')}</div>
              <div className="ui-code" style={{ width: 'fit-content', maxWidth: '100%', wordBreak: 'break-all' }}>{PUBLIC_UPDATE_FEED_URL}</div>
              {updater?.lastCheckedAt ? <div className="ui-meta">{t('dashboard.lastChecked')}: {updater.lastCheckedAt}</div> : null}
              {(updater?.version || updater?.downloadedVersion) ? (
                <div className="ui-meta">{t('dashboard.versionInfo')}: {updater.downloadedVersion ?? updater.version}</div>
              ) : null}
              {updater?.error ? <div className="ui-status-error">{updater.error}</div> : null}
            </div>
          </div>
        </section>

        <section className="ui-card">
          <div className="ui-card-body">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <div>
                <h3 className="ui-card-title">{t('dashboard.releaseNotesTitle')}</h3>
                <p className="ui-card-description">{t('dashboard.releaseNotesDescription')}</p>
              </div>
              <button onClick={refreshReleaseFeed} disabled={releaseFeedLoading} style={{ fontSize: '0.82rem', padding: '0.5rem 0.9rem' }}>
                {releaseFeedLoading ? '…' : t('dashboard.releaseNotesRefresh')}
              </button>
            </div>
            <div className="ui-surface" style={{ display: 'grid', gap: 12 }}>
              <div className="ui-meta">{t('dashboard.updateSource')}</div>
              <div className="ui-code" style={{ width: 'fit-content', maxWidth: '100%', wordBreak: 'break-all' }}>{PUBLIC_UPDATE_FEED_URL}</div>
              {releaseFeed ? (
                <>
                  <div className="ui-pill">{t('dashboard.releaseVersion')}: {releaseFeed.version}</div>
                  {releaseFeed.previousTag ? <div className="ui-meta">{t('dashboard.previousVersion')}: {releaseFeed.previousTag}</div> : null}
                  {formatPublishedAt(releaseFeed.publishedAt) ? (
                    <div className="ui-meta">{t('dashboard.publishedAt')}: {formatPublishedAt(releaseFeed.publishedAt)}</div>
                  ) : null}
                  {releaseFeed.compareUrl ? (
                    <a href={releaseFeed.compareUrl} target="_blank" rel="noreferrer">{t('dashboard.compareLink')}</a>
                  ) : null}
                  <div style={{ display: 'grid', gap: 10, maxHeight: 220, overflow: 'auto' }}>
                    {releaseFeed.sections.map((section) => (
                      <div key={section.category} className="ui-card-soft" style={{ padding: 12 }}>
                        <div className="ui-card-title" style={{ fontSize: '0.88rem', marginBottom: 8 }}>{renderReleaseCategory(section.category)}</div>
                        <ul style={{ margin: 0, paddingLeft: 16, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                          {section.items.map((item) => (
                            <li key={`${section.category}-${item.hash}`} style={{ marginBottom: 4 }}>{item.summary}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                  <a href={`${PUBLIC_UPDATE_FEED_URL}/release-notes.md`} target="_blank" rel="noreferrer">{t('dashboard.openReleaseNotes')}</a>
                </>
              ) : releaseFeedError ? (
                <div className="ui-status-error">{t('dashboard.releaseNotesError')}: {releaseFeedError}</div>
              ) : (
                <div className="ui-meta">{t('dashboard.releaseNotesLoading')}</div>
              )}
            </div>
          </div>
        </section>
      </div>

      {err ? <div className="ui-status-error fade-up" style={{ marginTop: 18 }}>{err}</div> : null}

      <section className="ui-card fade-up" style={{ marginTop: 18, animationDelay: '0.2s' }}>
        <div className="ui-card-body">
          <h3 className="ui-card-title">{t('dashboard.gatewaySnapshot')}</h3>
          <p className="ui-card-description">{runtime?.gatewayPort ? `${t('dashboard.gatewayPort')}: ${runtime.gatewayPort}` : t('dashboard.snapshotLoading')}</p>
          <pre
            className="ui-surface"
            style={{
              marginTop: 16,
              whiteSpace: 'pre-wrap',
              overflow: 'auto',
              maxHeight: 280,
              color: 'var(--text-secondary)',
              fontSize: '0.85rem',
              borderRadius: 12,
              padding: 14,
            }}
          >
            {status ? JSON.stringify(status, null, 2) : t('dashboard.snapshotLoading')}
          </pre>
        </div>
      </section>
    </div>
  )
}
