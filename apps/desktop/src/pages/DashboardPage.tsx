import { useEffect, useState } from 'react'
import { hermesStatus } from '../lib/hermesClient'

export function DashboardPage() {
  const [status, setStatus] = useState<unknown>(null)
  const [err, setErr] = useState<string | null>(null)

  async function refresh() {
    try {
      setErr(null)
      setStatus(await hermesStatus())
    } catch (e) {
      setErr(String(e))
    }
  }

  useEffect(() => {
    refresh()
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

      <pre style={{ background: 'rgba(255,255,255,0.04)', padding: 12, borderRadius: 12, whiteSpace: 'pre-wrap' }}>
        {status ? JSON.stringify(status, null, 2) : 'Loading...'}
      </pre>
    </div>
  )
}
