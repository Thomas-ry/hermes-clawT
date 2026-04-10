import { useEffect, useMemo, useState } from 'react'
import { EmptyState } from '../components/EmptyState'
import { TerminalIcon } from '../components/icons'
import { useI18n } from '../i18n'

type LogLine = { ts: string; stream: 'stdout' | 'stderr'; line: string }

export function LogsPage() {
  const { t } = useI18n()
  const [lines, setLines] = useState<LogLine[]>([])
  const [paused, setPaused] = useState(false)
  const stdoutCount = lines.filter((line) => line.stream === 'stdout').length
  const stderrCount = lines.filter((line) => line.stream === 'stderr').length

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

      <section className="ui-card" style={{ marginBottom: 18 }}>
        <div className="ui-card-body">
          <div className="ui-toolbar" style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <div>
              <h3 className="ui-card-title">{t('logs.overviewTitle')}</h3>
              <p className="ui-card-description">{t('logs.overviewDescription')}</p>
            </div>
            <span className="ui-pill">{paused ? t('logs.pausedState') : t('logs.liveState')}</span>
          </div>

          <div className="ui-stat-grid">
            <div className="ui-stat-card">
              <div className="ui-stat-content">
                <div className="ui-stat-label">{t('logs.totalLines')}</div>
                <div className="ui-stat-value">{lines.length}</div>
              </div>
            </div>
            <div className="ui-stat-card">
              <div className="ui-stat-content">
                <div className="ui-stat-label">{t('logs.stdout')}</div>
                <div className="ui-stat-value">{stdoutCount}</div>
              </div>
            </div>
            <div className="ui-stat-card">
              <div className="ui-stat-content">
                <div className="ui-stat-label">{t('logs.stderr')}</div>
                <div className="ui-stat-value">{stderrCount}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="ui-card">
        <div className="ui-card-body">
          <div className="ui-toolbar" style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <div className="ui-pill">{t(`logs.totalLinesLabel|${lines.length}`)}</div>
            <div className="ui-toolbar">
              <button onClick={() => setLines([])}>{t('logs.clear')}</button>
              <button onClick={() => setPaused((current) => !current)}>{paused ? t('logs.resume') : t('logs.pause')}</button>
            </div>
          </div>

          {text ? (
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
              {text}
            </pre>
          ) : (
            <EmptyState
              icon={<TerminalIcon width={20} height={20} />}
              title={t('logs.title')}
              description={paused ? t('logs.emptyPaused') : t('logs.empty')}
            />
          )}
        </div>
      </section>
    </div>
  )
}
