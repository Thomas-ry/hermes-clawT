import { describe, expect, it } from 'vitest'
import { getChatRoleLabel } from './chatRole'

describe('getChatRoleLabel', () => {
  const t = (key: string) => `translated:${key}`

  it('maps supported roles to i18n keys', () => {
    expect(getChatRoleLabel('user', t)).toBe('translated:chat.user')
    expect(getChatRoleLabel('assistant', t)).toBe('translated:chat.assistant')
    expect(getChatRoleLabel('system', t)).toBe('translated:chat.system')
  })
})
