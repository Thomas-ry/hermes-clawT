import { useEffect, useState } from 'react'

type EnvMap = Record<string, string>

export function ChannelsPage() {
  const [env, setEnv] = useState<EnvMap>({})
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState<string | null>(null)

  const [telegramBotToken, setTelegramBotToken] = useState('')
  const [telegramAllowedUsers, setTelegramAllowedUsers] = useState('')
  const [telegramHomeChannel, setTelegramHomeChannel] = useState('')

  async function load() {
    try {
      setError(null)
      const current = await window.hermes.env.get()
      setEnv(current)
      setTelegramBotToken(current.TELEGRAM_BOT_TOKEN ?? '')
      setTelegramAllowedUsers(current.TELEGRAM_ALLOWED_USERS ?? '')
      setTelegramHomeChannel(current.TELEGRAM_HOME_CHANNEL ?? '')
    } catch (e) {
      setError(String(e))
    }
  }

  async function saveTelegram() {
    try {
      setError(null)
      setSaved(null)
      await window.hermes.env.set({
        TELEGRAM_BOT_TOKEN: telegramBotToken || null,
        TELEGRAM_ALLOWED_USERS: telegramAllowedUsers || null,
        TELEGRAM_HOME_CHANNEL: telegramHomeChannel || null,
      })
      await window.hermes.gateway.restart()
      setSaved('Saved. Gateway restarted.')
      await load()
    } catch (e) {
      setError(String(e))
    }
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <div style={{ maxWidth: 900 }}>
      <h2>Channels</h2>
      <p style={{ opacity: 0.8, marginTop: 4 }}>
        Configure messaging channels (starting with Telegram). Values are written to Hermes env and the gateway is restarted.
      </p>

      {error ? <pre style={{ color: '#ffb4b4', whiteSpace: 'pre-wrap' }}>{error}</pre> : null}
      {saved ? <div style={{ color: '#b7ffcc' }}>{saved}</div> : null}

      <div style={{ background: 'rgba(255,255,255,0.04)', padding: 12, borderRadius: 12, marginTop: 16 }}>
        <h3 style={{ marginTop: 0 }}>Telegram</h3>
        <label style={{ display: 'block', marginBottom: 10 }}>
          <div style={{ fontSize: 12, opacity: 0.8 }}>TELEGRAM_BOT_TOKEN</div>
          <input
            value={telegramBotToken}
            onChange={(e) => setTelegramBotToken(e.target.value)}
            style={{ width: '100%' }}
            placeholder="123456789:ABCdef..."
          />
        </label>
        <label style={{ display: 'block', marginBottom: 10 }}>
          <div style={{ fontSize: 12, opacity: 0.8 }}>TELEGRAM_ALLOWED_USERS</div>
          <input
            value={telegramAllowedUsers}
            onChange={(e) => setTelegramAllowedUsers(e.target.value)}
            style={{ width: '100%' }}
            placeholder="123456789,987654321"
          />
        </label>
        <label style={{ display: 'block', marginBottom: 10 }}>
          <div style={{ fontSize: 12, opacity: 0.8 }}>TELEGRAM_HOME_CHANNEL (optional)</div>
          <input
            value={telegramHomeChannel}
            onChange={(e) => setTelegramHomeChannel(e.target.value)}
            style={{ width: '100%' }}
            placeholder="-1001234567890"
          />
        </label>
        <button onClick={saveTelegram}>Save & Restart Gateway</button>
        <details style={{ marginTop: 12 }}>
          <summary style={{ cursor: 'pointer', opacity: 0.85 }}>Current env snapshot</summary>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(env, null, 2)}</pre>
        </details>
      </div>
    </div>
  )
}
