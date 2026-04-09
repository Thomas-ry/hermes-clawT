import { describe, expect, it } from 'vitest'
import { channelCatalog } from './channelCatalog'

describe('channelCatalog', () => {
  it('keeps stable channel ids for all supported surfaces', () => {
    expect(channelCatalog.map((channel) => channel.id)).toEqual([
      'telegram',
      'discord',
      'slack',
      'signal',
      'whatsapp',
      'email',
      'matrix',
    ])
  })

  it('uses translation keys instead of hard-coded field labels', () => {
    for (const channel of channelCatalog) {
      expect(channel.titleKey.startsWith('channels.')).toBe(true)
      expect(channel.descriptionKey.startsWith('channels.')).toBe(true)
      for (const field of channel.fields) {
        expect(field.labelKey.startsWith('channels.')).toBe(true)
      }
    }
  })
})
