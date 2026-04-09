import { useMemo, useState } from 'react'
import { hermesApiChat } from '../lib/hermesClient'
import { useI18n } from '../i18n'

type ChatMsg = { role: 'user' | 'assistant' | 'system'; content: string }

export function ChatPage() {
  const { t } = useI18n()
  const [messages, setMessages] = useState<ChatMsg[]>([
    { role: 'system', content: 'You are Hermes Agent.' },
  ])
  const [draft, setDraft] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const visibleMessages = useMemo(() => messages.filter((m) => m.role !== 'system'), [messages])

  async function send() {
    const text = draft.trim()
    if (!text || busy) return
    setDraft('')
    setError(null)
    const nextMessages = [...messages, { role: 'user', content: text } as const]
    setMessages(nextMessages)
    setBusy(true)
    try {
      const reply = await hermesApiChat({ messages: nextMessages })
      setMessages([...nextMessages, { role: 'assistant', content: reply }])
    } catch (e) {
      setError(String(e))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div style={{ height: '100%', display: 'grid', gridTemplateRows: 'auto 1fr auto', gap: 12 }}>
      <div>
        <h2>{t('chat.title')}</h2>
        <p style={{ opacity: 0.8, marginTop: 4 }}>{t('chat.description')}</p>
      </div>

      <div style={{ overflow: 'auto', padding: 12, borderRadius: 12, background: 'rgba(255,255,255,0.04)' }}>
        {visibleMessages.map((m, idx) => (
          <div key={idx} style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 12, opacity: 0.75 }}>{m.role.toUpperCase()}</div>
            <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.45 }}>{m.content}</div>
          </div>
        ))}
        {busy ? <div style={{ opacity: 0.7 }}>{t('chat.thinking')}</div> : null}
        {error ? <div style={{ color: '#ffb4b4', whiteSpace: 'pre-wrap' }}>{error}</div> : null}
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={t('chat.placeholder')}
          style={{ flex: 1, minHeight: 72, resize: 'vertical' }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) send()
          }}
        />
        <button onClick={send} disabled={busy || !draft.trim()}>
          {t('chat.send')}
        </button>
      </div>
      <div style={{ fontSize: 12, opacity: 0.7 }}>{t('chat.tip')}</div>
    </div>
  )
}
