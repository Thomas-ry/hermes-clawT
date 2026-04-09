import { useEffect, useState } from 'react'
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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState<string | null>(null)
  const [config, setConfig] = useState<ConfigShape>({})

  const [model, setModel] = useState('')
  const [maxTurns, setMaxTurns] = useState('90')
  const [terminalBackend, setTerminalBackend] = useState('local')
  const [terminalTimeout, setTerminalTimeout] = useState('180')
  const [terminalCwd, setTerminalCwd] = useState('.')

  async function load() {
    try {
      setLoading(true)
      setError(null)
      const next = (await window.hermes.config.get()) as ConfigShape
      setConfig(next)
      setModel(String(next.model ?? ''))
      setMaxTurns(String(next.agent?.max_turns ?? 90))
      setTerminalBackend(String(next.terminal?.backend ?? 'local'))
      setTerminalTimeout(String(next.terminal?.timeout ?? 180))
      setTerminalCwd(String(next.terminal?.cwd ?? '.'))
    } catch (e) {
      setError(String(e))
    } finally {
      setLoading(false)
    }
  }

  async function save() {
    try {
      setError(null)
      setSaved(null)
      const next: ConfigShape = {
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
      await window.hermes.config.save(next as Record<string, unknown>)
      setSaved(t('settings.saved'))
      setConfig(next)
    } catch (e) {
      setError(String(e))
    }
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <div style={{ maxWidth: 960 }}>
      <h2>{t('settings.title')}</h2>
      <p style={{ opacity: 0.8, marginTop: 4 }}>{t('settings.description')} <code>config.yaml</code>.</p>

      {error ? <pre style={{ color: '#ffb4b4', whiteSpace: 'pre-wrap' }}>{error}</pre> : null}
      {saved ? <div style={{ color: '#b7ffcc' }}>{saved}</div> : null}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
        <div style={{ background: 'rgba(255,255,255,0.04)', padding: 12, borderRadius: 12 }}>
          <h3 style={{ marginTop: 0 }}>{t('settings.languageTitle')}</h3>
          <p style={{ opacity: 0.8, marginTop: 4 }}>{t('settings.languageDescription')}</p>
          <label style={{ display: 'block', marginBottom: 10 }}>
            <div style={{ fontSize: 12, opacity: 0.8 }}>{t('app.language')}</div>
            <select value={language} onChange={(e) => setLanguage(e.target.value as 'en' | 'zh')} style={{ width: '100%' }}>
              <option value="en">{t('app.english')}</option>
              <option value="zh">{t('app.chinese')}</option>
            </select>
          </label>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.04)', padding: 12, borderRadius: 12 }}>
          <h3 style={{ marginTop: 0 }}>{t('settings.modelTitle')}</h3>
          <label style={{ display: 'block', marginBottom: 10 }}>
            <div style={{ fontSize: 12, opacity: 0.8 }}>{t('settings.defaultModel')}</div>
            <input
              value={model}
              onChange={(e) => setModel(e.target.value)}
              style={{ width: '100%' }}
              placeholder="openai/gpt-5.3-codex"
            />
          </label>
          <label style={{ display: 'block', marginBottom: 10 }}>
            <div style={{ fontSize: 12, opacity: 0.8 }}>{t('settings.maxTurns')}</div>
            <input value={maxTurns} onChange={(e) => setMaxTurns(e.target.value)} style={{ width: '100%' }} />
          </label>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.04)', padding: 12, borderRadius: 12 }}>
          <h3 style={{ marginTop: 0 }}>{t('settings.terminalTitle')}</h3>
          <label style={{ display: 'block', marginBottom: 10 }}>
            <div style={{ fontSize: 12, opacity: 0.8 }}>{t('settings.backend')}</div>
            <select value={terminalBackend} onChange={(e) => setTerminalBackend(e.target.value)} style={{ width: '100%' }}>
              <option value="local">local</option>
              <option value="docker">docker</option>
              <option value="ssh">ssh</option>
              <option value="modal">modal</option>
              <option value="daytona">daytona</option>
              <option value="singularity">singularity</option>
            </select>
          </label>
          <label style={{ display: 'block', marginBottom: 10 }}>
            <div style={{ fontSize: 12, opacity: 0.8 }}>{t('settings.timeout')}</div>
            <input value={terminalTimeout} onChange={(e) => setTerminalTimeout(e.target.value)} style={{ width: '100%' }} />
          </label>
          <label style={{ display: 'block', marginBottom: 10 }}>
            <div style={{ fontSize: 12, opacity: 0.8 }}>{t('settings.workingDirectory')}</div>
            <input value={terminalCwd} onChange={(e) => setTerminalCwd(e.target.value)} style={{ width: '100%' }} />
          </label>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
        <button onClick={save} disabled={loading}>{t('settings.save')}</button>
        <button onClick={load} disabled={loading}>{t('settings.reload')}</button>
      </div>
    </div>
  )
}
