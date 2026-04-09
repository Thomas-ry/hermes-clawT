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
      .map((line) => `[${line.ts}] ${line.stream === 'stdout' ? t('logs.stdout') : t('logs.stderr')} ${line.line}`)
      .join('\n')
  }, [lines, t])

  return (
    <div className="page-shell">
      <div className="page-header">
        <h2 className="page-title">{t('logs.title')}</h2>
        <p className="page-description">{t('logs.description')}</p>
      </div>

      <section className="ui-card">
        <div className="ui-card-body">
          <div className="ui-toolbar" style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <div className="ui-pill">{lines.length} lines</div>
            <div className="ui-toolbar">
              <button onClick={() => setLines([])}>{t('logs.clear')}</button>
              <button onClick={() => setPaused((current) => !current)}>{paused ? t('logs.resume') : t('logs.pause')}</button>
            </div>
          </div>

          <pre
            className="ui-surface"
            style={{
              margin: 0,
              minHeight: 420,
              maxHeight: 'calc(100vh - 280px)',
              overflow: 'auto',
              whiteSpace: 'pre-wrap',
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
            }}
          >
            {text || t('logs.empty')}
          </pre>
        </div>
      </section>
    </div>
  )
}
