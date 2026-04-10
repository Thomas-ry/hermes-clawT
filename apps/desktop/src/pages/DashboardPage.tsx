import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { hermesStatus } from '../lib/hermesClient'
import { useI18n } from '../i18n'
import { StatCard } from '../components/StatCard'
import { ArrowCircleIcon, ClockIcon, DashboardIcon } from '../components/icons'
import { fetchReleaseFeedSummary, PUBLIC_UPDATE_FEED_URL, type ReleaseFeedSummary } from '../lib/releaseFeed'

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

export function DashboardPage() {
  const { language, t } = useI18n()
  const [status, setStatus] = useState<unknown>(null)
  const [updater, setUpdater] = useState<UpdaterStatus | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [releaseFeed, setReleaseFeed] = useState<ReleaseFeedSummary | null>(null)
  const [releaseFeedError, setReleaseFeedError] = useState<string | null>(null)
  const [releaseFeedLoading, setReleaseFeedLoading] = useState(false)

  async function refresh() {
    try {
      setErr(null)
      const nextStatus = await hermesStatus()
      setStatus(nextStatus)
      const updaterFromStatus = (nextStatus as { updater?: UpdaterStatus }).updater ?? null
      setUpdater(updaterFromStatus)
    } catch (e) {
      setErr(String(e))
    }
  }

  useEffect(() => {
    refresh()
    const unsubscribe = window.hermes.updater.onState((nextState) => {
      setUpdater(nextState as UpdaterStatus)
    })
    return unsubscribe
  }, [])

  function refreshReleaseFeed() {
    setReleaseFeedLoading(true)
    setReleaseFeedError(null)
    fetchReleaseFeedSummary()
      .then((summary) => {
        setReleaseFeed(summary)
      })
      .catch((error) => {
        setReleaseFeedError(String(error))
      })
      .finally(() => {
        setReleaseFeedLoading(false)
      })
  }

  useEffect(() => {
    refreshReleaseFeed()
  }, [])

  function renderUpdaterStatus(current: UpdaterStatus | null): string {
    if (!current) {
      return t('dashboard.updaterLoading')
    }

    switch (current.status) {
      case 'idle':
        return t('dashboard.updateIdle')
      case 'dev-only':
        return t('dashboard.updateDevOnly')
      case 'packaged-required':
        return t('dashboard.updatePackagedRequired')
      case 'checking':
        return t('dashboard.updateChecking')
      case 'available':
        return `${t('dashboard.updateAvailable')} ${current.version ?? ''}`.trim()
      case 'not-available':
        return t('dashboard.updateNotAvailable')
      case 'downloading':
        return `${t('dashboard.updateDownloading')} ${current.progressPercent?.toFixed(1) ?? '0.0'}%`
      case 'downloaded':
        return `${t('dashboard.updateDownloaded')} ${current.downloadedVersion ?? current.version ?? ''}`.trim()
      case 'error':
        return `${t('dashboard.updateError')}${current.error ? `: ${current.error}` : ''}`
      default:
        return t('dashboard.updaterLoading')
    }
  }

  function renderReleaseCategory(category: string): string {
    switch (category) {
      case 'Features':
        return t('dashboard.releaseCategoryFeatures')
      case 'Fixes':
        return t('dashboard.releaseCategoryFixes')
      case 'Improvements':
        return t('dashboard.releaseCategoryImprovements')
      case 'Documentation & QA':
        return t('dashboard.releaseCategoryDocsQa')
      case 'Maintenance':
        return t('dashboard.releaseCategoryMaintenance')
      default:
        return t('dashboard.releaseCategoryOther')
    }
  }

  function renderGatewayState(): string {
    const gatewayState = (status as { gateway?: { state?: string } } | null)?.gateway?.state
    switch (gatewayState) {
      case 'running':
        return t('dashboard.gatewayRunning')
      case 'starting':
        return t('dashboard.gatewayStarting')
      case 'stopping':
        return t('dashboard.gatewayStopping')
      case 'error':
        return t('dashboard.gatewayError')
      default:
        return t('dashboard.gatewayStopped')
    }
  }

  function formatPublishedAt(value?: string): string | null {
    if (!value) return null
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return value
    return new Intl.DateTimeFormat(language === 'zh' ? 'zh-CN' : 'en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date)
  }

  const runtime = (status as { runtime?: { hermesHomeDir?: string; gatewayPort?: number } } | null)?.runtime

  return (
    <div className="page-shell">
      <div className="page-header">
        <h2 className="page-title">{t('dashboard.title')}</h2>
        <p className="page-description">{t('dashboard.description')}</p>
      </div>

      <section className="dashboard-hero">
        <div className="dashboard-hero-copy">
          <span className="ui-pill">{t('dashboard.heroEyebrow')}</span>
          <h3 className="dashboard-hero-title">{t('dashboard.heroTitle')}</h3>
          <p className="dashboard-hero-description">{t('dashboard.heroDescription')}</p>
          <div className="ui-toolbar">
            <button onClick={refresh}>{t('dashboard.refresh')}</button>
            <button onClick={() => window.hermes.gateway.restart().then(refresh).catch((e) => setErr(String(e)))}>
              {t('dashboard.restart')}
            </button>
          </div>
        </div>

        <div className="dashboard-hero-side">
          <div className="dashboard-callout">
            <div className="dashboard-callout-label">{t('dashboard.heroStatusLabel')}</div>
            <div className="dashboard-callout-value">{renderGatewayState()}</div>
            <div className="dashboard-callout-meta">
              {runtime?.gatewayPort
                ? `${t('dashboard.gatewayPort')}: ${runtime.gatewayPort}`
                : t('dashboard.snapshotLoading')}
            </div>
          </div>
          <div className="dashboard-callout">
            <div className="dashboard-callout-label">{t('dashboard.heroWorkflowLabel')}</div>
            <div className="dashboard-callout-meta">{t('dashboard.heroWorkflowDescription')}</div>
          </div>
        </div>
      </section>

      <div className="ui-stat-grid" style={{ marginBottom: 18 }}>
        <StatCard
          icon={<DashboardIcon width={18} height={18} />}
          label={t('dashboard.gatewayStatusTitle')}
          value={renderGatewayState()}
          hint={runtime?.gatewayPort ? `${t('dashboard.gatewayPort')}: ${runtime.gatewayPort}` : t('dashboard.snapshotLoading')}
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

      <section className="ui-card" style={{ marginBottom: 18 }}>
        <div className="ui-card-body">
          <div className="ui-toolbar" style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <div>
              <h3 className="ui-card-title">{t('dashboard.quickStartTitle')}</h3>
              <p className="ui-card-description">{t('dashboard.quickStartDescription')}</p>
            </div>
          </div>
          <div className="dashboard-quick-grid">
            <Link to="/chat" className="dashboard-quick-link">
              <div className="dashboard-quick-title">{t('dashboard.quickChatTitle')}</div>
              <div className="dashboard-quick-description">{t('dashboard.quickChatDescription')}</div>
            </Link>
            <Link to="/cron" className="dashboard-quick-link">
              <div className="dashboard-quick-title">{t('dashboard.quickCronTitle')}</div>
              <div className="dashboard-quick-description">{t('dashboard.quickCronDescription')}</div>
            </Link>
            <Link to="/skills" className="dashboard-quick-link">
              <div className="dashboard-quick-title">{t('dashboard.quickSkillsTitle')}</div>
              <div className="dashboard-quick-description">{t('dashboard.quickSkillsDescription')}</div>
            </Link>
          </div>
        </div>
      </section>

      <div className="ui-grid ui-grid-two">
        <section className="ui-card">
          <div className="ui-card-body">
            <div className="ui-toolbar" style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <div>
                <h3 className="ui-card-title">{t('dashboard.autoUpdateTitle')}</h3>
                <p className="ui-card-description">{t('dashboard.autoUpdateDescription')}</p>
              </div>
              <span className="ui-pill">{renderUpdaterStatus(updater)}</span>
            </div>

            <div className="ui-toolbar" style={{ marginBottom: 18 }}>
              <button onClick={() => window.hermes.gateway.start().then(refresh).catch((e) => setErr(String(e)))}>{t('dashboard.start')}</button>
              <button onClick={() => window.hermes.gateway.stop().then(refresh).catch((e) => setErr(String(e)))}>{t('dashboard.stop')}</button>
              <button onClick={() => window.hermes.gateway.restart().then(refresh).catch((e) => setErr(String(e)))}>{t('dashboard.restart')}</button>
              <button onClick={refresh}>{t('dashboard.refresh')}</button>
            </div>

            <div className="ui-surface" style={{ display: 'grid', gap: 12 }}>
              <div className="ui-toolbar">
                <button onClick={() => window.hermes.updater.check().catch((e) => setErr(String(e)))}>{t('dashboard.checkUpdates')}</button>
                <button
                  onClick={() => window.hermes.updater.download().catch((e) => setErr(String(e)))}
                  disabled={!updater?.available || updater?.downloading || updater?.downloaded}
                >
                  {t('dashboard.downloadUpdate')}
                </button>
                <button
                  onClick={() => window.hermes.updater.install().catch((e) => setErr(String(e)))}
                  disabled={!updater?.downloaded}
                >
                  {t('dashboard.restartInstall')}
                </button>
              </div>
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
            <div className="ui-toolbar" style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <div>
                <h3 className="ui-card-title">{t('dashboard.releaseNotesTitle')}</h3>
                <p className="ui-card-description">{t('dashboard.releaseNotesDescription')}</p>
              </div>
              <button onClick={refreshReleaseFeed} disabled={releaseFeedLoading}>
                {releaseFeedLoading ? t('dashboard.releaseNotesRefreshing') : t('dashboard.releaseNotesRefresh')}
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
                  <div style={{ display: 'grid', gap: 12 }}>
                    {releaseFeed.sections.map((section) => (
                      <div key={section.category} className="ui-card-soft" style={{ padding: 14 }}>
                        <div className="ui-card-title" style={{ fontSize: '0.95rem', marginBottom: 8 }}>{renderReleaseCategory(section.category)}</div>
                        <ul style={{ margin: 0, paddingLeft: 18, color: 'var(--text-secondary)' }}>
                          {section.items.map((item) => (
                            <li key={`${section.category}-${item.hash}-${item.summary}`} style={{ marginBottom: 6 }}>
                              <span>{item.summary}</span>
                              <span className="ui-meta"> ({item.hash}, {item.author})</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                  <a href={`${PUBLIC_UPDATE_FEED_URL}/release-notes.md`} target="_blank" rel="noreferrer">
                    {t('dashboard.openReleaseNotes')}
                  </a>
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

      {err ? <div className="ui-status-error" style={{ marginTop: 18 }}>{err}</div> : null}

      <section className="ui-card" style={{ marginTop: 18 }}>
        <div className="ui-card-body">
          <h3 className="ui-card-title">{t('dashboard.gatewaySnapshot')}</h3>
          <p className="ui-card-description">
            {runtime?.gatewayPort ? `${t('dashboard.gatewayPort')}: ${runtime.gatewayPort}` : t('dashboard.snapshotLoading')}
          </p>
          <pre
            className="ui-surface"
            style={{
              marginTop: 16,
              whiteSpace: 'pre-wrap',
              overflow: 'auto',
              maxHeight: 320,
              color: 'var(--text-secondary)',
            }}
          >
            {status ? JSON.stringify(status, null, 2) : t('dashboard.snapshotLoading')}
          </pre>
        </div>
      </section>
    </div>
  )
}
