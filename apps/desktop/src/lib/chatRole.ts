export type ChatRole = 'user' | 'assistant' | 'system'

export function getChatRoleLabel(role: ChatRole, t: (key: string) => string): string {
  switch (role) {
    case 'user':
      return t('chat.user')
    case 'assistant':
      return t('chat.assistant')
    case 'system':
      return t('chat.system')
    default:
      return role
  }
}
