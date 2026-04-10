import { useEffect, useMemo, useState } from 'react'
import { EmptyState } from '../components/EmptyState'
import { TerminalIcon } from '../components/icons'
import { useI18n } from '../i18n'

type LogLine = { ts: string; stream: 'stdout' | 'stderr'; line: string }

export function LogsPage() {
  const { t } = useI18n()
  const [lines, setLines] = useState<LogLine[]>([])
  const [paused, setPaused] = useState(false)
  const [query, setQuery] = useState('')
  const [streamFilter, setStreamFilter] = useState<'all' | 'stdout' | 'stderr'>('all')
  const [copied, setCopied] = useState<string | null>(null)
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

  const visibleLines = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return lines.filter((line) => {
      if (streamFilter !== 'all' && line.stream !== streamFilter) {
        return false
      }

      if (!normalizedQuery) {
        return true
      }

      return `${line.ts} ${line.stream} ${line.line}`.toLowerCase().includes(normalizedQuery)
    })
  }, [lines, query, streamFilter])

  const visibleText = useMemo(() => {
    return visibleLines.map((line) => `[${line.ts}] ${line.stream} ${line.line}`).join('\n')
  }, [visibleLines])

  async function copyVisibleLogs() {
    try {
      await navigator.clipboard.writeText(visibleText)
      setCopied(t('logs.copied'))
    } catch (error) {
      setCopied(`${t('logs.copyFailed')}: ${String(error)}`)
    }
  }

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
              <label className="ui-label" style={{ minWidth: 220, marginBottom: 0 }}>
                <div className="ui-label-text">{t('logs.search')}</div>
                <input
                  aria-label={t('logs.search')}
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={t('logs.searchPlaceholder')}
                />
              </label>
              <label className="ui-label" style={{ minWidth: 160, marginBottom: 0 }}>
                <div className="ui-label-text">{t('logs.streamFilter')}</div>
                <select
                  aria-label={t('logs.streamFilter')}
                  value={streamFilter}
                  onChange={(event) => setStreamFilter(event.target.value as 'all' | 'stdout' | 'stderr')}
                >
                  <option value="all">{t('logs.allStreams')}</option>
                  <option value="stdout">{t('logs.stdout')}</option>
                  <option value="stderr">{t('logs.stderr')}</option>
                </select>
              </label>
              <button onClick={copyVisibleLogs} disabled={!visibleText}>
                {t('logs.copyVisible')}
              </button>
              <button onClick={() => setLines([])}>{t('logs.clear')}</button>
              <button onClick={() => setPaused((current) => !current)}>{paused ? t('logs.resume') : t('logs.pause')}</button>
            </div>
          </div>

          <div className="ui-toolbar" style={{ marginBottom: 18 }}>
            <div className="ui-pill">{t(`logs.visibleLinesLabel|${visibleLines.length}`)}</div>
            {query ? <div className="ui-meta">{t('logs.activeQuery')}: {query}</div> : null}
            {copied ? <div className="ui-status-success" style={{ padding: '8px 12px' }}>{copied}</div> : null}
          </div>

          {visibleText ? (
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
              {visibleText}
            </pre>
          ) : (
            <EmptyState
              icon={<TerminalIcon width={20} height={20} />}
              title={t('logs.title')}
              description={lines.length > 0 ? t('logs.emptyFiltered') : paused ? t('logs.emptyPaused') : t('logs.empty')}
            />
          )}
        </div>
      </section>
    </div>
  )
}
