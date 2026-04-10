import { useMemo, useState, useEffect, useRef } from 'react'
import { hermesApiChat } from '../lib/hermesClient'
import { useI18n } from '../i18n'
import { getChatRoleLabel, type ChatRole } from '../lib/chatRole'
import { useToast } from '../components/Toast'

type ChatMsg = { role: ChatRole; content: string; timestamp: Date }

function TypingIndicator() {
  return (
    <div style={{ display: 'flex', gap: 4, padding: '4px 0' }}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            background: 'var(--text-muted)',
            animation: `typingBounce 1.2s ease-in-out ${i * 0.15}s infinite`,
          }}
        />
      ))}
    </div>
  )
}

function formatTime(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(date)
}

export function ChatPage() {
  const { t } = useI18n()
  const { toast } = useToast()
  const [messages, setMessages] = useState<ChatMsg[]>([
    { role: 'system', content: 'You are Hermes Agent.', timestamp: new Date() },
  ])
  const [draft, setDraft] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showTimestamps, setShowTimestamps] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null)

  const visibleMessages = useMemo(() => messages.filter((m) => m.role !== 'system'), [messages])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, busy])

  async function send() {
    const text = draft.trim()
    if (!text || busy) return
    setDraft('')
    setError(null)
    const now = new Date()
    const nextMessages = [...messages, { role: 'user' as const, content: text, timestamp: now }]
    setMessages(nextMessages)
    setBusy(true)
    try {
      const reply = await hermesApiChat({ messages: nextMessages })
      setMessages([...nextMessages, { role: 'assistant', content: reply, timestamp: new Date() }])
    } catch (e) {
      setError(String(e))
      toast(String(e), 'error')
    } finally {
      setBusy(false)
    }
  }

  function copyMessage(content: string, idx: number) {
    navigator.clipboard.writeText(content).then(() => {
      setCopiedIdx(idx)
      toast(t('chat.copied'), 'success')
      setTimeout(() => setCopiedIdx(null), 1800)
    })
  }

  function clearChat() {
    setMessages([{ role: 'system', content: 'You are Hermes Agent.', timestamp: new Date() }])
    toast(t('chat.chatCleared'), 'info')
  }

  return (
    <div className="page-shell">
      <style>{`
        @keyframes typingBounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-6px); opacity: 1; }
        }
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .chat-msg-enter { animation: fadeSlideIn 0.22s ease forwards; }
      `}</style>

      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h2 className="page-title">{t('chat.title')}</h2>
            <p className="page-description">{t('chat.description')}</p>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button
              onClick={() => setShowTimestamps(!showTimestamps)}
              style={{ fontSize: '0.8rem', padding: '0.5rem 0.9rem', opacity: showTimestamps ? 1 : 0.65 }}
              title={t('chat.timestamp')}
            >
              🕐
            </button>
            <button onClick={clearChat} style={{ fontSize: '0.8rem', padding: '0.5rem 0.9rem' }}>
              {t('chat.clearChat')}
            </button>
          </div>
        </div>
      </div>

      <div className="ui-card">
        <div className="ui-card-body" style={{ display: 'grid', gap: 16 }}>
          <div
            className="ui-surface"
            style={{
              minHeight: 420,
              maxHeight: 'calc(100vh - 330px)',
              overflow: 'auto',
              display: 'grid',
              gap: 14,
              alignContent: 'start',
              padding: 18,
            }}
          >
            {visibleMessages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className="chat-msg-enter"
                style={{
                  display: 'grid',
                  gap: 6,
                  justifyItems: message.role === 'user' ? 'end' : 'start',
                }}
              >
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span className="ui-pill" style={{ fontSize: '0.72rem' }}>
                    {getChatRoleLabel(message.role, t)}
                  </span>
                  {showTimestamps && (
                    <span className="ui-meta" style={{ fontSize: '0.72rem' }}>
                      {formatTime(message.timestamp)}
                    </span>
                  )}
                  {message.role !== 'user' && (
                    <button
                      onClick={() => copyMessage(message.content, index)}
                      style={{
                        fontSize: '0.72rem',
                        padding: '2px 8px',
                        opacity: copiedIdx === index ? 1 : 0.5,
                        transition: 'opacity 0.15s',
                      }}
                      title={t('chat.copyMessage')}
                    >
                      {copiedIdx === index ? '✓' : '📋'}
                    </button>
                  )}
                </div>
                <div
                  style={{
                    maxWidth: '78%',
                    padding: '14px 18px',
                    borderRadius: 18,
                    background:
                      message.role === 'user'
                        ? 'linear-gradient(135deg, rgba(124,140,255,0.32), rgba(124,140,255,0.14))'
                        : 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    whiteSpace: 'pre-wrap',
                    lineHeight: 1.65,
                    fontSize: '0.95rem',
                  }}
                >
                  {message.content}
                </div>
              </div>
            ))}
            {busy && (
              <div style={{ display: 'grid', gap: 6, justifyItems: 'start' }}>
                <span className="ui-pill" style={{ fontSize: '0.72rem', width: 'fit-content' }}>
                  {getChatRoleLabel('assistant', t)}
                </span>
                <div
                  style={{
                    padding: '14px 18px',
                    borderRadius: 18,
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  <TypingIndicator />
                </div>
              </div>
            )}
            {error && (
              <div className="ui-status-error" style={{ borderRadius: 12, padding: '10px 14px' }}>
                {error}
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="ui-card-soft" style={{ padding: 14 }}>
            <div style={{ display: 'grid', gap: 12 }}>
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={t('chat.placeholder')}
                style={{ minHeight: 100, resize: 'vertical', borderRadius: 12 }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) send()
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <div className="ui-meta">{t('chat.tip')}</div>
                <button onClick={send} disabled={busy || !draft.trim()}>
                  {busy ? '…' : t('chat.send')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
