import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useChatStore } from '@/stores/chat'
import { useGatewayStore } from '@/stores/gateway'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/input'
import { toast } from 'sonner'
import { Send, Trash2, Clock, Copy, RotateCw } from 'lucide-react'
import { cn } from '@/lib/utils'

function TypingDots() {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-typing-dot"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </span>
  )
}

function formatTime(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(date)
}

export function ChatPage() {
  const { t } = useTranslation()
  const chat = useChatStore()
  const gateway = useGatewayStore()
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chat.messages, chat.busy])

  const isRunning = gateway.status === 'running'

  async function handleSend() {
    const text = chat.draft.trim()
    if (!text || chat.busy) return
    chat.setDraft('')
    chat.setError(null)
    try {
      await chat.sendMessage(text)
    } catch (e) {
      toast.error(String(e))
    }
  }

  function copyMessage(content: string) {
    navigator.clipboard.writeText(content).then(() => toast.success(t('common:common.copied')))
  }

  return (
    <div className="flex flex-col h-full animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div>
          <h1 className="text-xl font-bold">{t('common:common.nav.chat')}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('common:chat.description')}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={isRunning ? 'success' : 'destructive'}>
            {isRunning ? '● ' : ''}{isRunning ? t('common:dashboard.gatewayRunning') : t('common:dashboard.gatewayStopped')}
          </Badge>
          <Button size="icon" variant="ghost" onClick={() => chat.setShowTimestamps(!chat.showTimestamps)} title={t('common:chat.showTimestamps')}>
            <Clock className={cn('h-4 w-4', chat.showTimestamps && 'text-primary')} />
          </Button>
          <Button size="icon" variant="ghost" onClick={() => { chat.clearMessages(); toast.info(t('common:chat.chatCleared')) }} title={t('common:chat.clearChat')}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {chat.messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-4xl mb-3">💬</div>
            <p className="text-muted-foreground">Start a conversation with Hermes</p>
          </div>
        )}

        {chat.messages.map((msg) => (
          <div key={msg.id} className={cn('flex flex-col', msg.role === 'user' ? 'items-end' : 'items-start')}>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant={msg.role === 'user' ? 'default' : msg.role === 'assistant' ? 'secondary' : 'muted'} className="text-xs">
                {msg.role === 'user' ? t('common:chat.user') : msg.role === 'assistant' ? t('common:chat.assistant') : t('common:chat.system')}
              </Badge>
              {chat.showTimestamps && (
                <span className="text-xs text-muted-foreground">{formatTime(msg.timestamp)}</span>
              )}
              {msg.role !== 'user' && (
                <button onClick={() => copyMessage(msg.content)} className="p-1 rounded hover:bg-accent transition-colors" title={t('common:chat.copyMessage')}>
                  <Copy className="h-3 w-3 text-muted-foreground" />
                </button>
              )}
            </div>
            <div
              className={cn(
                'max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
                msg.role === 'user' ? 'bg-primary/15 text-foreground rounded-tr-sm' : 'bg-card border border-border rounded-tl-sm'
              )}
              style={{ whiteSpace: 'pre-wrap' }}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {chat.busy && (
          <div className="flex items-start gap-2">
            <Badge variant="secondary" className="text-xs mt-1">{t('common:chat.assistant')}</Badge>
            <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-3">
              <TypingDots />
            </div>
          </div>
        )}

        {chat.error && (
          <div className="rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
            {chat.error}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-6 py-4 border-t border-border">
        <div className="flex gap-3">
          <Textarea
            ref={textareaRef}
            value={chat.draft}
            onChange={(e) => chat.setDraft(e.target.value)}
            placeholder={t('common:chat.placeholder')}
            className="min-h-[80px] resize-none"
            onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSend() }}
          />
          <div className="flex flex-col gap-2">
            <Button onClick={handleSend} disabled={chat.busy || !chat.draft.trim()}>
              <Send className="h-4 w-4 mr-1" />
              {t('common:chat.send')}
            </Button>
            <Button size="sm" variant="ghost" onClick={chat.retryLast} disabled={chat.busy || chat.messages.length === 0}>
              <RotateCw className="h-3.5 w-3.5 mr-1" />
              {t('common:chat.retry')}
            </Button>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-2">{t('common:chat.sendTip')}</p>
      </div>
    </div>
  )
}
