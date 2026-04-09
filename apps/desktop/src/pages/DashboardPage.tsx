import { useEffect, useState } from 'react'
import { hermesStatus } from '../lib/hermesClient'

type UpdaterStatus = {
  available?: boolean
  checking?: boolean
  downloading?: boolean
  downloaded?: boolean
  version?: string | null
  downloadedVersion?: string | null
  progressPercent?: number | null
  message?: string
  error?: string | null
  lastCheckedAt?: string | null
}

export function DashboardPage() {
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

  return (
    <div style={{ maxWidth: 900 }}>
      <h2>Dashboard</h2>
      <p style={{ opacity: 0.8, marginTop: 4 }}>Hermes Gateway status + quick controls.</p>

      <div style={{ display: 'flex', gap: 12, margin: '12px 0 16px' }}>
        <button onClick={() => window.hermes.gateway.start().then(refresh).catch((e) => setErr(String(e)))}>Start</button>
        <button onClick={() => window.hermes.gateway.stop().then(refresh).catch((e) => setErr(String(e)))}>Stop</button>
        <button onClick={() => window.hermes.gateway.restart().then(refresh).catch((e) => setErr(String(e)))}>Restart</button>
        <button onClick={refresh}>Refresh</button>
      </div>

      {err ? (
        <pre style={{ color: '#ffb4b4', whiteSpace: 'pre-wrap' }}>{err}</pre>
      ) : null}

      <section style={{ background: 'rgba(255,255,255,0.04)', padding: 12, borderRadius: 12, marginBottom: 16 }}>
        <h3 style={{ marginTop: 0 }}>Auto Update</h3>
        <p style={{ opacity: 0.8, marginTop: 4 }}>
          Check GitHub Releases, download available updates, then restart to install.
        </p>
        <div style={{ display: 'flex', gap: 12, margin: '12px 0 16px', flexWrap: 'wrap' }}>
          <button onClick={() => window.hermes.updater.check().catch((e) => setErr(String(e)))}>Check updates</button>
          <button
            onClick={() => window.hermes.updater.download().catch((e) => setErr(String(e)))}
            disabled={!updater?.available || updater?.downloading || updater?.downloaded}
          >
            Download update
          </button>
          <button
            onClick={() => window.hermes.updater.install().catch((e) => setErr(String(e)))}
            disabled={!updater?.downloaded}
          >
            Restart & Install
          </button>
        </div>
        <pre style={{ background: 'rgba(255,255,255,0.03)', padding: 12, borderRadius: 12, whiteSpace: 'pre-wrap', margin: 0 }}>
          {JSON.stringify(updater ?? { message: 'Loading updater status…' }, null, 2)}
        </pre>
      </section>

      <pre style={{ background: 'rgba(255,255,255,0.04)', padding: 12, borderRadius: 12, whiteSpace: 'pre-wrap' }}>
        {status ? JSON.stringify(status, null, 2) : 'Loading...'}
      </pre>
    </div>
  )
}
