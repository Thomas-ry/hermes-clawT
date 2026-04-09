export type ChannelFieldDefinition = {
  key: string
  labelKey: string
  placeholder?: string
}

export type ChannelDefinition = {
  id: string
  titleKey: string
  descriptionKey: string
  fields: ChannelFieldDefinition[]
}

export const channelCatalog: ChannelDefinition[] = [
  {
    id: 'telegram',
    titleKey: 'channels.telegram',
    descriptionKey: 'channels.telegramDescription',
    fields: [
      { key: 'TELEGRAM_BOT_TOKEN', labelKey: 'channels.botToken', placeholder: '123456789:ABCdef...' },
      { key: 'TELEGRAM_ALLOWED_USERS', labelKey: 'channels.allowedUsers', placeholder: '123456789,987654321' },
      { key: 'TELEGRAM_HOME_CHANNEL', labelKey: 'channels.homeChannel', placeholder: '-1001234567890' },
    ],
  },
  {
    id: 'discord',
    titleKey: 'channels.discord',
    descriptionKey: 'channels.discordDescription',
    fields: [
      { key: 'DISCORD_BOT_TOKEN', labelKey: 'channels.botToken' },
      { key: 'DISCORD_ALLOWED_USERS', labelKey: 'channels.allowedUsers', placeholder: '123456789012345678' },
      { key: 'DISCORD_HOME_CHANNEL', labelKey: 'channels.homeChannel', placeholder: '123456789012345678' },
    ],
  },
  {
    id: 'slack',
    titleKey: 'channels.slack',
    descriptionKey: 'channels.slackDescription',
    fields: [
      { key: 'SLACK_BOT_TOKEN', labelKey: 'channels.botToken', placeholder: 'xoxb-...' },
      { key: 'SLACK_APP_TOKEN', labelKey: 'channels.appToken', placeholder: 'xapp-...' },
      { key: 'SLACK_ALLOWED_USERS', labelKey: 'channels.allowedUsers', placeholder: 'U01234,U09876' },
      { key: 'SLACK_HOME_CHANNEL', labelKey: 'channels.homeChannel', placeholder: 'C0123456789' },
    ],
  },
  {
    id: 'signal',
    titleKey: 'channels.signal',
    descriptionKey: 'channels.signalDescription',
    fields: [
      { key: 'SIGNAL_HTTP_URL', labelKey: 'channels.httpUrl', placeholder: 'http://127.0.0.1:8080' },
      { key: 'SIGNAL_ACCOUNT', labelKey: 'channels.account', placeholder: '+1234567890' },
      { key: 'SIGNAL_ALLOWED_USERS', labelKey: 'channels.allowedUsers', placeholder: '+1234567890,+0987654321' },
      { key: 'SIGNAL_HOME_CHANNEL', labelKey: 'channels.homeChannel', placeholder: '+1234567890' },
    ],
  },
  {
    id: 'whatsapp',
    titleKey: 'channels.whatsapp',
    descriptionKey: 'channels.whatsappDescription',
    fields: [
      { key: 'WHATSAPP_ENABLED', labelKey: 'channels.enabled', placeholder: 'true' },
      { key: 'WHATSAPP_MODE', labelKey: 'channels.mode', placeholder: 'self-chat or bot' },
      { key: 'WHATSAPP_ALLOWED_USERS', labelKey: 'channels.allowedUsers', placeholder: '15551234567,*' },
    ],
  },
  {
    id: 'email',
    titleKey: 'channels.email',
    descriptionKey: 'channels.emailDescription',
    fields: [
      { key: 'EMAIL_ADDRESS', labelKey: 'channels.emailAddress', placeholder: 'hermes@example.com' },
      { key: 'EMAIL_PASSWORD', labelKey: 'channels.password' },
      { key: 'EMAIL_IMAP_HOST', labelKey: 'channels.imapHost', placeholder: 'imap.gmail.com' },
      { key: 'EMAIL_SMTP_HOST', labelKey: 'channels.smtpHost', placeholder: 'smtp.gmail.com' },
      { key: 'EMAIL_ALLOWED_USERS', labelKey: 'channels.allowedSenders', placeholder: 'alice@example.com,bob@example.com' },
      { key: 'EMAIL_HOME_ADDRESS', labelKey: 'channels.homeAddress', placeholder: 'you@example.com' },
    ],
  },
  {
    id: 'matrix',
    titleKey: 'channels.matrix',
    descriptionKey: 'channels.matrixDescription',
    fields: [
      { key: 'MATRIX_HOMESERVER', labelKey: 'channels.homeserver', placeholder: 'https://matrix.example.org' },
      { key: 'MATRIX_ACCESS_TOKEN', labelKey: 'channels.accessToken' },
      { key: 'MATRIX_USER_ID', labelKey: 'channels.userId', placeholder: '@bot:matrix.example.org' },
      { key: 'MATRIX_ALLOWED_USERS', labelKey: 'channels.allowedUsers', placeholder: '@you:matrix.org,@ops:matrix.org' },
      { key: 'MATRIX_HOME_ROOM', labelKey: 'channels.homeRoom', placeholder: '!abc123:matrix.org' },
    ],
  },
]
