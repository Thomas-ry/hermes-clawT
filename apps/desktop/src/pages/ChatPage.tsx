import { useMemo, useState } from 'react'
import { hermesApiChat } from '../lib/hermesClient'
import { EmptyState } from '../components/EmptyState'
import { ChatIcon } from '../components/icons'
import { useI18n } from '../i18n'
import { getChatRoleLabel, type ChatRole } from '../lib/chatRole'

type ChatMsg = { role: ChatRole; content: string }

export function ChatPage() {
  const { t } = useI18n()
  const [messages, setMessages] = useState<ChatMsg[]>([
    { role: 'system', content: 'You are Hermes Agent.' },
  ])
  const [draft, setDraft] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const visibleMessages = useMemo(() => messages.filter((message) => message.role !== 'system'), [messages])
  const starterPrompts = [
    t('chat.starterPromptArchitecture'),
    t('chat.starterPromptCron'),
    t('chat.starterPromptSkills'),
  ]

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

  function clearConversation() {
    setMessages([{ role: 'system', content: 'You are Hermes Agent.' }])
    setDraft('')
    setError(null)
  }

  function applyStarterPrompt(prompt: string) {
    setDraft(prompt)
    setError(null)
  }

  return (
    <div className="page-shell chat-page-shell">
      <div className="page-header">
        <h2 className="page-title">{t('chat.title')}</h2>
        <p className="page-description">{t('chat.description')}</p>
      </div>

      <div className="ui-card chat-page-card">
        <div className="ui-card-body chat-page-body">
          <div className="chat-toolbar">
            <div className="ui-toolbar">
              <span className="ui-pill">{t('chat.localGateway')}</span>
              <span className="ui-pill">{t(`chat.sessionCount|${visibleMessages.length}`)}</span>
            </div>
            <button onClick={clearConversation} disabled={busy || visibleMessages.length === 0}>
              {t('chat.clearConversation')}
            </button>
          </div>

          <div
            className="ui-surface chat-message-surface"
          >
            {visibleMessages.length === 0 ? (
              <>
                <EmptyState
                  icon={<ChatIcon width={20} height={20} />}
                  title={t('chat.emptyTitle')}
                  description={t('chat.emptyDescription')}
                />
                <section className="chat-starter-section" aria-label={t('chat.starterTitle')}>
                  <div className="chat-starter-header">
                    <div className="ui-card-title">{t('chat.starterTitle')}</div>
                    <div className="ui-meta">{t('chat.tip')}</div>
                  </div>
                  <div className="chat-starter-grid">
                    {starterPrompts.map((prompt) => (
                      <button
                        key={prompt}
                        type="button"
                        className="chat-starter-button"
                        onClick={() => applyStarterPrompt(prompt)}
                        disabled={busy}
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </section>
              </>
            ) : (
              visibleMessages.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  style={{
                    display: 'grid',
                    gap: 8,
                    justifyItems: message.role === 'user' ? 'end' : 'start',
                  }}
                >
                  <span className="ui-pill">{getChatRoleLabel(message.role, t)}</span>
                  <div
                    style={{
                      maxWidth: '78%',
                      padding: '14px 16px',
                      borderRadius: 18,
                      background:
                        message.role === 'user'
                          ? 'linear-gradient(180deg, rgba(124, 140, 255, 0.28), rgba(124, 140, 255, 0.14))'
                          : 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      whiteSpace: 'pre-wrap',
                      lineHeight: 1.6,
                    }}
                  >
                    {message.content}
                  </div>
                </div>
              ))
            )}
            {busy ? <div className="ui-meta">{t('chat.thinking')}</div> : null}
            {error ? <div className="ui-status-error">{error}</div> : null}
          </div>

          <div className="ui-card-soft chat-composer-card">
            <div className="chat-composer-grid">
              <textarea
                className="chat-composer-textarea"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={t('chat.placeholder')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) send()
                }}
              />
              <div className="chat-composer-footer">
                <div className="ui-meta">{t('chat.tip')}</div>
                <button onClick={send} disabled={busy || !draft.trim()}>
                  {t('chat.send')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
