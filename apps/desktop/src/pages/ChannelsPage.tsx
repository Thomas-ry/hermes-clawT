import { useEffect, useState } from 'react'
import { useI18n } from '../i18n'

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
  {
    title: 'WhatsApp',
    description: 'QR-paired bridge mode and allowlist configuration.',
    fields: [
      { key: 'WHATSAPP_ENABLED', label: 'Enabled', placeholder: 'true' },
      { key: 'WHATSAPP_MODE', label: 'Mode', placeholder: 'self-chat or bot' },
      { key: 'WHATSAPP_ALLOWED_USERS', label: 'Allowed users', placeholder: '15551234567,*' },
    ],
  },
  {
    title: 'Email',
    description: 'Inbound mailbox plus default recipient for cron delivery.',
    fields: [
      { key: 'EMAIL_ADDRESS', label: 'Email address', placeholder: 'hermes@example.com' },
      { key: 'EMAIL_PASSWORD', label: 'Password / app password' },
      { key: 'EMAIL_IMAP_HOST', label: 'IMAP host', placeholder: 'imap.gmail.com' },
      { key: 'EMAIL_SMTP_HOST', label: 'SMTP host', placeholder: 'smtp.gmail.com' },
      { key: 'EMAIL_ALLOWED_USERS', label: 'Allowed senders', placeholder: 'alice@example.com,bob@example.com' },
      { key: 'EMAIL_HOME_ADDRESS', label: 'Home address', placeholder: 'you@example.com' },
    ],
  },
  {
    title: 'Matrix',
    description: 'Homeserver-based chat with token or password login.',
    fields: [
      { key: 'MATRIX_HOMESERVER', label: 'Homeserver', placeholder: 'https://matrix.example.org' },
      { key: 'MATRIX_ACCESS_TOKEN', label: 'Access token' },
      { key: 'MATRIX_USER_ID', label: 'User ID', placeholder: '@bot:matrix.example.org' },
      { key: 'MATRIX_ALLOWED_USERS', label: 'Allowed users', placeholder: '@you:matrix.org,@ops:matrix.org' },
      { key: 'MATRIX_HOME_ROOM', label: 'Home room', placeholder: '!abc123:matrix.org' },
    ],
  },
]

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
      for (const channel of CHANNELS) {
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
        {CHANNELS.map((channel) => (
          <section key={channel.title} style={{ background: 'rgba(255,255,255,0.04)', padding: 12, borderRadius: 12 }}>
            <h3 style={{ marginTop: 0 }}>{channel.title}</h3>
            <p style={{ opacity: 0.75, marginTop: 4 }}>
              {channel.title === 'Telegram'
                ? t('channels.telegramDescription')
                : channel.title === 'Discord'
                  ? t('channels.discordDescription')
                  : channel.title === 'Slack'
                    ? t('channels.slackDescription')
                    : channel.title === 'Signal'
                      ? t('channels.signalDescription')
                      : channel.title === 'WhatsApp'
                        ? t('channels.whatsappDescription')
                        : channel.title === 'Email'
                          ? t('channels.emailDescription')
                          : channel.title === 'Matrix'
                            ? t('channels.matrixDescription')
                            : channel.description}
            </p>
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
