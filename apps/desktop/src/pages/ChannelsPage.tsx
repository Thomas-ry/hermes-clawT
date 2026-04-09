import { useEffect, useState } from 'react'

type EnvMap = Record<string, string>

type ChannelField = {
  key: string
  label: string
  placeholder?: string
}

type ChannelConfig = {
  title: string
  description: string
  fields: ChannelField[]
}

const CHANNELS: ChannelConfig[] = [
  {
    title: 'Telegram',
    description: 'Bot token, allowlist, and cron delivery target.',
    fields: [
      { key: 'TELEGRAM_BOT_TOKEN', label: 'Bot token', placeholder: '123456789:ABCdef...' },
      { key: 'TELEGRAM_ALLOWED_USERS', label: 'Allowed users', placeholder: '123456789,987654321' },
      { key: 'TELEGRAM_HOME_CHANNEL', label: 'Home channel', placeholder: '-1001234567890' },
    ],
  },
  {
    title: 'Discord',
    description: 'Bot token, allowlist, and default home channel.',
    fields: [
      { key: 'DISCORD_BOT_TOKEN', label: 'Bot token' },
      { key: 'DISCORD_ALLOWED_USERS', label: 'Allowed users', placeholder: '123456789012345678' },
      { key: 'DISCORD_HOME_CHANNEL', label: 'Home channel', placeholder: '123456789012345678' },
    ],
  },
  {
    title: 'Slack',
    description: 'Bot/app token pair and workspace allowlist.',
    fields: [
      { key: 'SLACK_BOT_TOKEN', label: 'Bot token', placeholder: 'xoxb-...' },
      { key: 'SLACK_APP_TOKEN', label: 'App token', placeholder: 'xapp-...' },
      { key: 'SLACK_ALLOWED_USERS', label: 'Allowed users', placeholder: 'U01234,U09876' },
      { key: 'SLACK_HOME_CHANNEL', label: 'Home channel', placeholder: 'C0123456789' },
    ],
  },
  {
    title: 'Signal',
    description: 'signal-cli HTTP bridge configuration.',
    fields: [
      { key: 'SIGNAL_HTTP_URL', label: 'HTTP URL', placeholder: 'http://127.0.0.1:8080' },
      { key: 'SIGNAL_ACCOUNT', label: 'Account', placeholder: '+1234567890' },
      { key: 'SIGNAL_ALLOWED_USERS', label: 'Allowed users', placeholder: '+1234567890,+0987654321' },
      { key: 'SIGNAL_HOME_CHANNEL', label: 'Home channel', placeholder: '+1234567890' },
    ],
  },
]

export function ChannelsPage() {
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
      for (const channel of CHANNELS) {
        for (const field of channel.fields) {
          payload[field.key] = draft[field.key]?.trim() ? draft[field.key] : null
        }
      }
      await window.hermes.env.set(payload)
      await window.hermes.gateway.restart()
      setSaved('Channels saved. Gateway restarted.')
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
      <h2>Channels</h2>
      <p style={{ opacity: 0.8, marginTop: 4 }}>
        Configure messaging integrations in Hermes env. Saving restarts the gateway so changes take effect immediately.
      </p>

      {error ? <pre style={{ color: '#ffb4b4', whiteSpace: 'pre-wrap' }}>{error}</pre> : null}
      {saved ? <div style={{ color: '#b7ffcc' }}>{saved}</div> : null}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
        {CHANNELS.map((channel) => (
          <section key={channel.title} style={{ background: 'rgba(255,255,255,0.04)', padding: 12, borderRadius: 12 }}>
            <h3 style={{ marginTop: 0 }}>{channel.title}</h3>
            <p style={{ opacity: 0.75, marginTop: 4 }}>{channel.description}</p>
            {channel.fields.map((field) => (
              <label key={field.key} style={{ display: 'block', marginBottom: 10 }}>
                <div style={{ fontSize: 12, opacity: 0.8 }}>{field.key}</div>
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
        <button onClick={save}>Save & Restart Gateway</button>
        <button onClick={load}>Reload</button>
      </div>

      <details style={{ marginTop: 16 }}>
        <summary style={{ cursor: 'pointer', opacity: 0.85 }}>Current env snapshot</summary>
        <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(env, null, 2)}</pre>
      </details>
    </div>
  )
}
