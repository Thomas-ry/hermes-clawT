import { useEffect, useState } from 'react'
import { hermesStatus } from '../lib/hermesClient'
import { useI18n } from '../i18n'

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
  const { t } = useI18n()
  const [status, setStatus] = useState<unknown>(null)
  const [updater, setUpdater] = useState<UpdaterStatus | null>(null)
  const [err, setErr] = useState<string | null>(null)

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

  return (
    <div style={{ maxWidth: 900 }}>
      <h2>{t('dashboard.title')}</h2>
      <p style={{ opacity: 0.8, marginTop: 4 }}>{t('dashboard.description')}</p>

      <div style={{ display: 'flex', gap: 12, margin: '12px 0 16px' }}>
        <button onClick={() => window.hermes.gateway.start().then(refresh).catch((e) => setErr(String(e)))}>{t('dashboard.start')}</button>
        <button onClick={() => window.hermes.gateway.stop().then(refresh).catch((e) => setErr(String(e)))}>{t('dashboard.stop')}</button>
        <button onClick={() => window.hermes.gateway.restart().then(refresh).catch((e) => setErr(String(e)))}>{t('dashboard.restart')}</button>
        <button onClick={refresh}>{t('dashboard.refresh')}</button>
      </div>

      {err ? (
        <pre style={{ color: '#ffb4b4', whiteSpace: 'pre-wrap' }}>{err}</pre>
      ) : null}

      <section style={{ background: 'rgba(255,255,255,0.04)', padding: 12, borderRadius: 12, marginBottom: 16 }}>
        <h3 style={{ marginTop: 0 }}>{t('dashboard.autoUpdateTitle')}</h3>
        <p style={{ opacity: 0.8, marginTop: 4 }}>{t('dashboard.autoUpdateDescription')}</p>
        <div style={{ display: 'flex', gap: 12, margin: '12px 0 16px', flexWrap: 'wrap' }}>
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
        <div style={{ background: 'rgba(255,255,255,0.03)', padding: 12, borderRadius: 12 }}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>{renderUpdaterStatus(updater)}</div>
          <div style={{ fontSize: 12, opacity: 0.75 }}>{t('dashboard.updateSource')}</div>
          <div style={{ fontSize: 12, opacity: 0.9, wordBreak: 'break-all' }}>https://thomas-ry.github.io/hermes-clawT/updates</div>
          {updater?.lastCheckedAt ? (
            <div style={{ fontSize: 12, opacity: 0.75, marginTop: 8 }}>
              {t('dashboard.lastChecked')}: {updater.lastCheckedAt}
            </div>
          ) : null}
          {(updater?.version || updater?.downloadedVersion) ? (
            <div style={{ fontSize: 12, opacity: 0.75, marginTop: 4 }}>
              {t('dashboard.versionInfo')}: {updater.downloadedVersion ?? updater.version}
            </div>
          ) : null}
          {updater?.error ? (
            <div style={{ color: '#ffb4b4', marginTop: 8, whiteSpace: 'pre-wrap' }}>{updater.error}</div>
          ) : null}
        </div>
      </section>

      <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 8 }}>{t('dashboard.gatewaySnapshot')}</div>
      <pre style={{ background: 'rgba(255,255,255,0.04)', padding: 12, borderRadius: 12, whiteSpace: 'pre-wrap' }}>
        {status ? JSON.stringify(status, null, 2) : t('dashboard.snapshotLoading')}
      </pre>
    </div>
  )
}
