import { useEffect, useState } from 'react'
import { useI18n } from '../i18n'
import { channelCatalog } from '../lib/channelCatalog'

type EnvMap = Record<string, string>

export function ChannelsPage() {
  const { t } = useI18n()
  const [env, setEnv] = useState<EnvMap>({})
  const [draft, setDraft] = useState<EnvMap>({})
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState<string | null>(null)

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
    <div style={{ maxWidth: 1000 }}>
      <h2>{t('channels.title')}</h2>
      <p style={{ opacity: 0.8, marginTop: 4 }}>{t('channels.description')}</p>

      {error ? <pre style={{ color: '#ffb4b4', whiteSpace: 'pre-wrap' }}>{error}</pre> : null}
      {saved ? <div style={{ color: '#b7ffcc' }}>{saved}</div> : null}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
        {channelCatalog.map((channel) => (
          <section key={channel.id} style={{ background: 'rgba(255,255,255,0.04)', padding: 12, borderRadius: 12 }}>
            <h3 style={{ marginTop: 0 }}>{t(channel.titleKey)}</h3>
            <p style={{ opacity: 0.75, marginTop: 4 }}>{t(channel.descriptionKey)}</p>
            {channel.fields.map((field) => (
              <label key={field.key} style={{ display: 'block', marginBottom: 10 }}>
                <div style={{ fontSize: 12, opacity: 0.95 }}>{t(field.labelKey)}</div>
                <div style={{ fontSize: 11, opacity: 0.6, marginBottom: 4 }}>
                  {t('channels.envKey')}: {field.key}
                </div>
                <input
                  value={draft[field.key] ?? ''}
                  onChange={(e) => setDraft((prev) => ({ ...prev, [field.key]: e.target.value }))}
                  style={{ width: '100%' }}
                  placeholder={field.placeholder}
                />
              </label>
            ))}
          </section>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
        <button onClick={save}>{t('channels.saveRestart')}</button>
        <button onClick={load}>{t('channels.reload')}</button>
      </div>

      <details style={{ marginTop: 16 }}>
        <summary style={{ cursor: 'pointer', opacity: 0.85 }}>{t('channels.snapshot')}</summary>
        <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(env, null, 2)}</pre>
      </details>
    </div>
  )
}
