import { useEffect, useMemo, useState } from 'react'

type LogLine = { ts: string; stream: 'stdout' | 'stderr'; line: string }

export function LogsPage() {
  const [lines, setLines] = useState<LogLine[]>([])
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    const unsub = window.hermes.gateway.onLog((raw) => {
      if (paused) return
      const parsed = raw as LogLine
      setLines((prev) => {
        const next = [...prev, parsed]
        return next.length > 800 ? next.slice(next.length - 800) : next
      })
    })
    return () => unsub()
  }, [paused])

  const text = useMemo(() => {
    return lines
      .map((l) => `[${l.ts}] ${l.stream.toUpperCase()} ${l.line}`)
      .join('\n')
  }, [lines])

  return (
    <div style={{ maxWidth: 1100 }}>
      <h2>Logs</h2>
      <p style={{ opacity: 0.8, marginTop: 4 }}>Live Hermes gateway stdout/stderr.</p>

      <div style={{ display: 'flex', gap: 12, marginTop: 12, alignItems: 'center' }}>
        <button onClick={() => setLines([])}>Clear</button>
        <button onClick={() => setPaused((p) => !p)}>{paused ? 'Resume' : 'Pause'}</button>
      </div>

      <pre style={{ marginTop: 12, background: 'rgba(255,255,255,0.04)', padding: 12, borderRadius: 12, whiteSpace: 'pre-wrap' }}>
        {text || '(no logs yet)'}
      </pre>
    </div>
  )
}
