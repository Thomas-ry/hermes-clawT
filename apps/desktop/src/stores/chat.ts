import { create } from 'zustand'

export type ChatRole = 'user' | 'assistant' | 'system'

export interface ChatMessage {
  id: string
  role: ChatRole
  content: string
  timestamp: Date
}

interface ChatState {
  messages: ChatMessage[]
  draft: string
  busy: boolean
  error: string | null
  showTimestamps: boolean
  streamingContent: string

  setDraft: (draft: string) => void
  setBusy: (busy: boolean) => void
  setError: (error: string | null) => void
  setShowTimestamps: (v: boolean) => void
  setStreamingContent: (content: string) => void

  addMessage: (msg: Omit<ChatMessage, 'id'>) => void
  clearMessages: () => void
  sendMessage: (text: string) => Promise<void>
  retryLast: () => Promise<void>
}

let msgId = 0

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  draft: '',
  busy: false,
  error: null,
  showTimestamps: false,
  streamingContent: '',

  setDraft: (draft) => set({ draft }),
  setBusy: (busy) => set({ busy }),
  setError: (error) => set({ error }),
  setShowTimestamps: (showTimestamps) => set({ showTimestamps }),
  setStreamingContent: (streamingContent) => set({ streamingContent }),

  addMessage: (msg) =>
    set((state) => ({
      messages: [...state.messages, { ...msg, id: String(++msgId) }],
    })),

  clearMessages: () => {
    set({ messages: [], streamingContent: '', error: null })
  },

  sendMessage: async (text) => {
    const { messages, addMessage } = get()
    const now = new Date()

    // Add user message
    addMessage({ role: 'user', content: text, timestamp: now })
    set({ draft: '', busy: true, error: null, streamingContent: '' })

    try {
      const allMessages = [
        ...messages.map((m) => ({ role: m.role, content: m.content })),
        { role: 'user' as const, content: text },
      ]

      const reply = await window.hermes.api.fetch({
        path: '/v1/chat/completions',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'hermes-agent', stream: false, messages: allMessages }),
      })

      if (reply.status < 200 || reply.status >= 300) {
        throw new Error(`API error ${reply.status}: ${reply.body}`)
      }

      const parsed = JSON.parse(reply.body) as {
        choices?: Array<{ message?: { content?: string } }>
      }
      const content = parsed.choices?.[0]?.message?.content ?? ''

      addMessage({ role: 'assistant', content, timestamp: new Date() })
    } catch (e) {
      set({ error: String(e) })
    } finally {
      set({ busy: false, streamingContent: '' })
    }
  },

  retryLast: async () => {
    const { messages } = get()
    const lastUser = [...messages].reverse().find((m) => m.role === 'user')
    if (lastUser) {
      // Remove the last assistant message if exists
      set((state) => ({
        messages: state.messages.filter(
          (m, i, arr) => !(i === arr.length - 1 && m.role === 'assistant'),
        ),
      }))
      await get().sendMessage(lastUser.content)
    }
  },
}))
