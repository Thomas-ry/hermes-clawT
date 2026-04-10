import { useCallback, useEffect, useRef, useState } from 'react'
import { useI18n } from '../i18n'

type ConfigShape = {
  model?: string
  agent?: {
    max_turns?: number
  }
  terminal?: {
    backend?: string
    timeout?: number
    cwd?: string
  }
}

export function SettingsPage() {
  const { language, setLanguage, t } = useI18n()
  const importInputRef = useRef<HTMLInputElement | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState<string | null>(null)
  const [config, setConfig] = useState<ConfigShape>({})

  const [model, setModel] = useState('')
  const [maxTurns, setMaxTurns] = useState('90')
  const [terminalBackend, setTerminalBackend] = useState('local')
  const [terminalTimeout, setTerminalTimeout] = useState('180')
  const [terminalCwd, setTerminalCwd] = useState('.')
  const configFieldCount = [
    model.trim() ? 1 : 0,
    maxTurns.trim() ? 1 : 0,
    terminalBackend.trim() ? 1 : 0,
    terminalTimeout.trim() ? 1 : 0,
    terminalCwd.trim() ? 1 : 0,
  ].reduce((sum, value) => sum + value, 0)

  function applyConfig(next: ConfigShape) {
    setConfig(next)
    setModel(String(next.model ?? ''))
    setMaxTurns(String(next.agent?.max_turns ?? 90))
    setTerminalBackend(String(next.terminal?.backend ?? 'local'))
    setTerminalTimeout(String(next.terminal?.timeout ?? 180))
    setTerminalCwd(String(next.terminal?.cwd ?? '.'))
  }

  function buildConfigDraft(): ConfigShape {
    return {
      ...config,
      model,
      agent: {
        ...(config.agent ?? {}),
        max_turns: Number(maxTurns || 90),
      },
      terminal: {
        ...(config.terminal ?? {}),
        backend: terminalBackend,
        timeout: Number(terminalTimeout || 180),
        cwd: terminalCwd,
      },
    }
  }

  const load = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const next = (await window.hermes.config.get()) as ConfigShape
      applyConfig(next)
    } catch (e) {
      setError(String(e))
    } finally {
      setLoading(false)
    }
  }, [])

  async function save() {
    try {
      setError(null)
      setSaved(null)
      const next = buildConfigDraft()
      await window.hermes.config.save(next as Record<string, unknown>)
      applyConfig(next)
      setSaved(t('settings.saved'))
    } catch (e) {
      setError(String(e))
    }
  }

  function exportConfig() {
    try {
      setError(null)
      setSaved(null)
      const next = buildConfigDraft()
      const blob = new Blob([`${JSON.stringify(next, null, 2)}\n`], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = 'clawT-config.json'
      anchor.click()
      URL.revokeObjectURL(url)
      setSaved(t('settings.exported'))
    } catch (e) {
      setError(String(e))
    }
  }

  async function importConfig(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    try {
      setError(null)
      setSaved(null)
      const raw = await file.text()
      const parsed = JSON.parse(raw) as ConfigShape
      applyConfig(parsed)
      setSaved(t('settings.importLoaded'))
    } catch (e) {
      setError(`${t('settings.importFailed')}: ${String(e)}`)
    } finally {
      event.target.value = ''
    }
  }

  useEffect(() => {
    load()
  }, [load])

  return (
    <div className="page-shell">
      <div className="page-header">
        <h2 className="page-title">{t('settings.title')}</h2>
        <p className="page-description">{t('settings.description')} <span className="ui-code">config.yaml</span>.</p>
      </div>

      {error ? <div className="ui-status-error">{error}</div> : null}
      {saved ? <div className="ui-status-success" style={{ marginTop: error ? 12 : 0 }}>{saved}</div> : null}

      <section className="ui-card" style={{ marginTop: 18, marginBottom: 18 }}>
        <div className="ui-card-body">
          <div className="ui-toolbar" style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <div>
              <h3 className="ui-card-title">{t('settings.overviewTitle')}</h3>
              <p className="ui-card-description">{t('settings.overviewDescription')}</p>
            </div>
            <div className="ui-toolbar">
              <span className="ui-pill">{t(`settings.languagePill|${language}`)}</span>
              <span className="ui-pill">{t(`settings.fieldCount|${configFieldCount}`)}</span>
            </div>
          </div>
        </div>
      </section>

      <div className="ui-grid ui-grid-two">
        <section className="ui-card">
          <div className="ui-card-body">
            <h3 className="ui-card-title">{t('settings.languageTitle')}</h3>
            <p className="ui-card-description">{t('settings.languageDescription')}</p>
            <label className="ui-label" style={{ marginTop: 18 }}>
              <div className="ui-label-text">{t('app.language')}</div>
              <select value={language} onChange={(e) => setLanguage(e.target.value as 'en' | 'zh')}>
                <option value="en">{t('app.english')}</option>
                <option value="zh">{t('app.chinese')}</option>
              </select>
            </label>
          </div>
        </section>

        <section className="ui-card">
          <div className="ui-card-body">
            <h3 className="ui-card-title">{t('settings.modelTitle')}</h3>
            <p className="ui-card-description">{t('settings.defaultModel')}</p>
            <label className="ui-label" style={{ marginTop: 18 }}>
              <div className="ui-label-text">{t('settings.defaultModel')}</div>
              <input value={model} onChange={(e) => setModel(e.target.value)} placeholder="openai/gpt-5.3-codex" />
            </label>
            <label className="ui-label">
              <div className="ui-label-text">{t('settings.maxTurns')}</div>
              <input value={maxTurns} onChange={(e) => setMaxTurns(e.target.value)} />
            </label>
          </div>
        </section>

        <section className="ui-card">
          <div className="ui-card-body">
            <h3 className="ui-card-title">{t('settings.terminalTitle')}</h3>
            <p className="ui-card-description">{t('settings.description')}</p>
            <label className="ui-label" style={{ marginTop: 18 }}>
              <div className="ui-label-text">{t('settings.backend')}</div>
              <select value={terminalBackend} onChange={(e) => setTerminalBackend(e.target.value)}>
                <option value="local">{t('settings.backendLocal')}</option>
                <option value="docker">{t('settings.backendDocker')}</option>
                <option value="ssh">{t('settings.backendSsh')}</option>
                <option value="modal">{t('settings.backendModal')}</option>
                <option value="daytona">{t('settings.backendDaytona')}</option>
                <option value="singularity">{t('settings.backendSingularity')}</option>
              </select>
            </label>
            <label className="ui-label">
              <div className="ui-label-text">{t('settings.timeout')}</div>
              <input value={terminalTimeout} onChange={(e) => setTerminalTimeout(e.target.value)} />
            </label>
            <label className="ui-label">
              <div className="ui-label-text">{t('settings.workingDirectory')}</div>
              <input value={terminalCwd} onChange={(e) => setTerminalCwd(e.target.value)} />
            </label>
          </div>
        </section>

        <section className="ui-card">
          <div className="ui-card-body">
            <h3 className="ui-card-title">clawT for Hermes Agent</h3>
            <p className="ui-card-description">{t('settings.portabilityDescription')}</p>
            <div className="ui-toolbar" style={{ marginTop: 18 }}>
              <button onClick={save} disabled={loading}>{t('settings.save')}</button>
              <button onClick={load} disabled={loading}>{t('settings.reload')}</button>
              <button onClick={exportConfig} disabled={loading}>{t('settings.export')}</button>
              <button onClick={() => importInputRef.current?.click()} disabled={loading}>{t('settings.import')}</button>
            </div>
            <div className="ui-meta" style={{ marginTop: 14 }}>
              {t('settings.importHint')}
            </div>
            <input
              ref={importInputRef}
              type="file"
              accept="application/json,.json"
              onChange={importConfig}
              style={{ display: 'none' }}
            />
          </div>
        </section>
      </div>
    </div>
  )
}
