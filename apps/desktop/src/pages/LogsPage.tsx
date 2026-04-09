import { useEffect, useMemo, useState } from 'react'
import { useI18n } from '../i18n'

type LogLine = { ts: string; stream: 'stdout' | 'stderr'; line: string }

export function LogsPage() {
  const { t } = useI18n()
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
      .map((l) => `[${l.ts}] ${l.stream === 'stdout' ? t('logs.stdout') : t('logs.stderr')} ${l.line}`)
      .join('\n')
  }, [lines, t])

  return (
    <div style={{ maxWidth: 1100 }}>
      <h2>{t('logs.title')}</h2>
      <p style={{ opacity: 0.8, marginTop: 4 }}>{t('logs.description')}</p>

      <div style={{ display: 'flex', gap: 12, marginTop: 12, alignItems: 'center' }}>
        <button onClick={() => setLines([])}>{t('logs.clear')}</button>
        <button onClick={() => setPaused((p) => !p)}>{paused ? t('logs.resume') : t('logs.pause')}</button>
      </div>

      <pre style={{ marginTop: 12, background: 'rgba(255,255,255,0.04)', padding: 12, borderRadius: 12, whiteSpace: 'pre-wrap' }}>
        {text || t('logs.empty')}
      </pre>
    </div>
  )
}
