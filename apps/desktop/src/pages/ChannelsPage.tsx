import { useEffect, useState } from 'react'
import { useI18n } from '../i18n'
import { channelCatalog } from '../lib/channelCatalog'

type EnvMap = Record<string, string>

function isSensitiveEnvKey(key: string): boolean {
  return /TOKEN|PASSWORD|SECRET/i.test(key)
}

export function ChannelsPage() {
  const { t } = useI18n()
  const [env, setEnv] = useState<EnvMap>({})
  const [draft, setDraft] = useState<EnvMap>({})
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [showSecrets, setShowSecrets] = useState(false)
  const configuredChannelCount = channelCatalog.filter((channel) =>
    channel.fields.some((field) => (draft[field.key] ?? '').trim().length > 0),
  ).length
  const visibleChannels = channelCatalog.filter((channel) => {
    if (!query.trim()) {
      return true
    }

    const haystack = [
      t(channel.titleKey),
      t(channel.descriptionKey),
      ...channel.fields.map((field) => `${field.key} ${t(field.labelKey)}`),
    ]
      .join(' ')
      .toLowerCase()

    return haystack.includes(query.trim().toLowerCase())
  })

  async function load() {
    try {
      setError(null)
      const current = await window.hermes.env.get()
      setEnv(current)
      setDraft(current)
    } catch (e) {
      setError(String(e))
    }
  }

  async function save() {
    try {
      setError(null)
      setSaved(null)
      const payload: Record<string, string | null | undefined> = {}
      for (const channel of channelCatalog) {
        for (const field of channel.fields) {
          payload[field.key] = draft[field.key]?.trim() ? draft[field.key] : null
        }
      }
      await window.hermes.env.set(payload)
      await window.hermes.gateway.restart()
      setSaved(t('channels.saved'))
      await load()
    } catch (e) {
      setError(String(e))
    }
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <div className="page-shell">
      <div className="page-header">
        <h2 className="page-title">{t('channels.title')}</h2>
        <p className="page-description">{t('channels.description')}</p>
      </div>

      {error ? <div className="ui-status-error">{error}</div> : null}
      {saved ? <div className="ui-status-success" style={{ marginTop: error ? 12 : 0 }}>{saved}</div> : null}

      <section className="ui-card" style={{ marginTop: 18, marginBottom: 18 }}>
        <div className="ui-card-body">
          <div className="ui-toolbar" style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <div>
              <h3 className="ui-card-title">{t('channels.overviewTitle')}</h3>
              <p className="ui-card-description">{t('channels.overviewDescription')}</p>
            </div>
            <div className="ui-toolbar">
              <span className="ui-pill">{t(`channels.totalCount|${channelCatalog.length}`)}</span>
              <span className="ui-pill">{t(`channels.configuredCount|${configuredChannelCount}`)}</span>
              <span className="ui-pill">{t(`channels.visibleCount|${visibleChannels.length}`)}</span>
            </div>
          </div>
        </div>
      </section>

      <div className="ui-toolbar" style={{ marginBottom: 18 }}>
        <label className="ui-label" style={{ minWidth: 240, marginBottom: 0 }}>
          <div className="ui-label-text">{t('channels.search')}</div>
          <input
            aria-label={t('channels.search')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('channels.searchPlaceholder')}
          />
        </label>
        <button onClick={() => setShowSecrets((current) => !current)}>
          {showSecrets ? t('channels.hideSecrets') : t('channels.showSecrets')}
        </button>
        <button onClick={save}>{t('channels.saveRestart')}</button>
        <button onClick={load}>{t('channels.reload')}</button>
      </div>

      <div className="ui-grid ui-grid-two">
        {visibleChannels.map((channel) => (
          <section key={channel.id} className="ui-card">
            <div className="ui-card-body">
              <h3 className="ui-card-title">{t(channel.titleKey)}</h3>
              <p className="ui-card-description">{t(channel.descriptionKey)}</p>
              <div className="ui-meta" style={{ marginTop: 10 }}>
                {t(`channels.channelConfigured|${channel.fields.some((field) => (draft[field.key] ?? '').trim().length > 0) ? t('channels.configured') : t('channels.notConfigured')}`)}
              </div>
              <div style={{ display: 'grid', gap: 12, marginTop: 18 }}>
                {channel.fields.map((field) => (
                  <label key={field.key} className="ui-label" style={{ marginBottom: 0 }}>
                    <div className="ui-label-text">{t(field.labelKey)}</div>
                    <div className="ui-meta" style={{ marginBottom: 6 }}>
                      {t('channels.envKey')}: <span className="ui-code">{field.key}</span>
                    </div>
                    <input
                      type={isSensitiveEnvKey(field.key) && !showSecrets ? 'password' : 'text'}
                      value={draft[field.key] ?? ''}
                      onChange={(e) => setDraft((prev) => ({ ...prev, [field.key]: e.target.value }))}
                      placeholder={field.placeholder}
                    />
                  </label>
                ))}
              </div>
            </div>
          </section>
        ))}
        {channelCatalog.length > 0 && visibleChannels.length === 0 ? (
          <section className="ui-card">
            <div className="ui-card-body">
              <div className="ui-status-error">{t('channels.noChannelsMatch')}</div>
            </div>
          </section>
        ) : null}
      </div>

      <section className="ui-card" style={{ marginTop: 18 }}>
        <div className="ui-card-body">
          <h3 className="ui-card-title">{t('channels.snapshot')}</h3>
          <pre
            className="ui-surface"
            style={{
              marginTop: 16,
              whiteSpace: 'pre-wrap',
              overflow: 'auto',
              maxHeight: 320,
              color: 'var(--text-secondary)',
            }}
          >
            {JSON.stringify(env, null, 2)}
          </pre>
        </div>
      </section>
    </div>
  )
}
