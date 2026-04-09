/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

export type Language = 'en' | 'zh'

const LANGUAGE_STORAGE_KEY = 'clawt.language'

const translations = {
  en: {
    app: {
      brand: 'clawT',
      language: 'Language',
      english: 'English',
      chinese: '中文',
    },
    nav: {
      dashboard: 'Dashboard',
      chat: 'Chat',
      cron: 'Cron',
      skills: 'Skills',
      channels: 'Channels',
      settings: 'Settings',
      logs: 'Logs',
    },
    dashboard: {
      title: 'Dashboard',
      description: 'Hermes Gateway status + quick controls.',
      start: 'Start',
      stop: 'Stop',
      restart: 'Restart',
      refresh: 'Refresh',
      autoUpdateTitle: 'Auto Update',
      autoUpdateDescription: 'Check GitHub Releases, download available updates, then restart to install.',
      checkUpdates: 'Check updates',
      downloadUpdate: 'Download update',
      restartInstall: 'Restart & Install',
      updaterLoading: 'Loading updater status…',
    },
    chat: {
      title: 'Chat',
      description: 'Uses the local Hermes OpenAI-compatible API server via the Main process proxy.',
      thinking: 'Thinking…',
      placeholder: 'Type a message…',
      send: 'Send',
      tip: 'Tip: Press Cmd/Ctrl+Enter to send.',
    },
    cron: {
      title: 'Cron',
      description: 'Create, inspect, update, run, pause, and remove Hermes cron jobs.',
      createJob: 'Create Job',
      jobs: 'Jobs',
      selectedJob: 'Selected Job',
      name: 'Name',
      schedule: 'Schedule',
      deliver: 'Deliver',
      prompt: 'Prompt',
      promptPreview: 'Prompt preview',
      create: 'Create',
      creating: 'Creating…',
      refresh: 'Refresh',
      noJobs: 'No jobs yet.',
      skills: 'Skills',
      script: 'Script',
      repeat: 'Repeat',
      pausedReason: 'Paused reason',
      saveChanges: 'Save changes',
      saving: 'Saving…',
      runNow: 'Run now',
      resume: 'Resume',
      pause: 'Pause',
      delete: 'Delete',
      refreshOutputs: 'Refresh outputs',
      savedOutputs: 'Saved outputs',
      outputPreview: 'Output preview',
      noOutputs: 'No saved outputs for this job yet.',
      outputHint: 'Pick an output to preview it here.',
      pickJob: 'Pick a job to inspect or edit it.',
      none: 'none',
      defaultValue: 'default',
      scheduled: 'scheduled',
      next: 'next',
    },
    skills: {
      title: 'Skills',
      description: 'Browse installed skills, inspect their `SKILL.md`, and enable or disable them per surface.',
      scope: 'Scope',
      category: 'Category',
      optional: '(optional)',
      refresh: 'Refresh',
      categories: 'Categories',
      disabledInScope: 'Disabled in this scope',
      noCategories: 'No categories found.',
      skillsCount: 'Skills',
      noSkills: 'No skills found.',
      enabled: 'Enabled',
      disabled: 'Disabled',
      enableSkill: 'Enable skill',
      disableSkill: 'Disable skill',
      saving: 'Saving…',
      detail: 'Skill Detail',
      path: 'Path',
      files: 'Files',
      pickSkill: 'Pick a skill to view its details.',
      noContent: 'No content returned.',
      global: 'Global default',
      cli: 'CLI',
      telegram: 'Telegram',
      discord: 'Discord',
      slack: 'Slack',
      signal: 'Signal',
      whatsapp: 'WhatsApp',
      email: 'Email',
      matrix: 'Matrix',
    },
    channels: {
      title: 'Channels',
      description: 'Configure messaging integrations in Hermes env. Saving restarts the gateway so changes take effect immediately.',
      saveRestart: 'Save & Restart Gateway',
      reload: 'Reload',
      saved: 'Channels saved. Gateway restarted.',
      snapshot: 'Current env snapshot',
      telegramDescription: 'Bot token, allowlist, and cron delivery target.',
      discordDescription: 'Bot token, allowlist, and default home channel.',
      slackDescription: 'Bot/app token pair and workspace allowlist.',
      signalDescription: 'signal-cli HTTP bridge configuration.',
      whatsappDescription: 'QR-paired bridge mode and allowlist configuration.',
      emailDescription: 'Inbound mailbox plus default recipient for cron delivery.',
      matrixDescription: 'Homeserver-based chat with token or password login.',
    },
    settings: {
      title: 'Settings',
      description: 'Edit Hermes runtime settings stored in config.yaml.',
      languageTitle: 'Language',
      languageDescription: 'Choose the application display language. The selection is saved on this device.',
      runtimeTitle: 'Hermes Runtime',
      modelTitle: 'Model',
      defaultModel: 'Default model',
      maxTurns: 'Max turns',
      terminalTitle: 'Terminal',
      backend: 'Backend',
      timeout: 'Timeout (seconds)',
      workingDirectory: 'Working directory',
      save: 'Save',
      reload: 'Reload',
      saved: 'Settings saved.',
    },
    logs: {
      title: 'Logs',
      description: 'Live Hermes gateway stdout/stderr.',
      clear: 'Clear',
      resume: 'Resume',
      pause: 'Pause',
      empty: '(no logs yet)',
    },
  },
  zh: {
    app: {
      brand: 'clawT',
      language: '语言',
      english: 'English',
      chinese: '中文',
    },
    nav: {
      dashboard: '概览',
      chat: '对话',
      cron: '定时任务',
      skills: '技能',
      channels: '渠道',
      settings: '设置',
      logs: '日志',
    },
    dashboard: {
      title: '概览',
      description: '查看 Hermes Gateway 状态并进行快捷控制。',
      start: '启动',
      stop: '停止',
      restart: '重启',
      refresh: '刷新',
      autoUpdateTitle: '自动更新',
      autoUpdateDescription: '检查 GitHub Releases、下载可用更新，然后重启安装。',
      checkUpdates: '检查更新',
      downloadUpdate: '下载更新',
      restartInstall: '重启并安装',
      updaterLoading: '正在加载更新状态…',
    },
    chat: {
      title: '对话',
      description: '通过 Main 进程代理，使用本地 Hermes 的 OpenAI 兼容 API 服务。',
      thinking: '思考中…',
      placeholder: '输入消息…',
      send: '发送',
      tip: '提示：按 Cmd/Ctrl+Enter 发送。',
    },
    cron: {
      title: '定时任务',
      description: '创建、查看、修改、执行、暂停和删除 Hermes 定时任务。',
      createJob: '创建任务',
      jobs: '任务列表',
      selectedJob: '当前任务',
      name: '名称',
      schedule: '调度',
      deliver: '投递',
      prompt: '提示词',
      promptPreview: '提示词预览',
      create: '创建',
      creating: '创建中…',
      refresh: '刷新',
      noJobs: '还没有任务。',
      skills: '技能',
      script: '脚本',
      repeat: '重复',
      pausedReason: '暂停原因',
      saveChanges: '保存修改',
      saving: '保存中…',
      runNow: '立即执行',
      resume: '恢复',
      pause: '暂停',
      delete: '删除',
      refreshOutputs: '刷新输出',
      savedOutputs: '历史输出',
      outputPreview: '输出预览',
      noOutputs: '这个任务还没有保存输出。',
      outputHint: '选择一个输出文件后可在这里预览。',
      pickJob: '选择一个任务以查看或编辑。',
      none: '无',
      defaultValue: '默认',
      scheduled: '已调度',
      next: '下次',
    },
    skills: {
      title: '技能',
      description: '浏览已安装技能，查看 `SKILL.md` 内容，并按不同入口启用或禁用技能。',
      scope: '作用域',
      category: '分类',
      optional: '（可选）',
      refresh: '刷新',
      categories: '分类',
      disabledInScope: '当前作用域已禁用',
      noCategories: '没有找到分类。',
      skillsCount: '技能',
      noSkills: '没有找到技能。',
      enabled: '已启用',
      disabled: '已禁用',
      enableSkill: '启用技能',
      disableSkill: '禁用技能',
      saving: '保存中…',
      detail: '技能详情',
      path: '路径',
      files: '文件',
      pickSkill: '选择一个技能以查看详情。',
      noContent: '没有返回内容。',
      global: '全局默认',
      cli: 'CLI',
      telegram: 'Telegram',
      discord: 'Discord',
      slack: 'Slack',
      signal: 'Signal',
      whatsapp: 'WhatsApp',
      email: 'Email',
      matrix: 'Matrix',
    },
    channels: {
      title: '渠道',
      description: '配置 Hermes 环境变量中的消息渠道。保存后会自动重启 Gateway 立即生效。',
      saveRestart: '保存并重启 Gateway',
      reload: '重新加载',
      saved: '渠道配置已保存，Gateway 已重启。',
      snapshot: '当前环境变量快照',
      telegramDescription: '配置机器人 Token、允许列表和定时任务默认投递目标。',
      discordDescription: '配置机器人 Token、允许列表和默认 Home Channel。',
      slackDescription: '配置 Bot/App Token 以及工作区允许列表。',
      signalDescription: '配置 signal-cli HTTP bridge。',
      whatsappDescription: '配置 WhatsApp 配对模式和允许列表。',
      emailDescription: '配置收件邮箱以及定时任务默认发送地址。',
      matrixDescription: '配置 Matrix homeserver、访问凭证和默认房间。',
    },
    settings: {
      title: '设置',
      description: '编辑保存在 config.yaml 中的 Hermes 运行时配置。',
      languageTitle: '语言',
      languageDescription: '选择应用显示语言，设置会保存在当前设备上。',
      runtimeTitle: 'Hermes 运行时',
      modelTitle: '模型',
      defaultModel: '默认模型',
      maxTurns: '最大轮次',
      terminalTitle: '终端',
      backend: '后端',
      timeout: '超时（秒）',
      workingDirectory: '工作目录',
      save: '保存',
      reload: '重新加载',
      saved: '设置已保存。',
    },
    logs: {
      title: '日志',
      description: '实时查看 Hermes Gateway 的 stdout/stderr。',
      clear: '清空',
      resume: '继续',
      pause: '暂停',
      empty: '（暂无日志）',
    },
  },
} as const

interface TranslationTree {
  [key: string]: string | TranslationTree
}
type TranslationKey = string

function getNestedValue(tree: TranslationTree, key: TranslationKey): string {
  const value = key.split('.').reduce<unknown>((current, segment) => {
    if (typeof current !== 'object' || current === null || !(segment in current)) {
      return undefined
    }
    return (current as Record<string, unknown>)[segment]
  }, tree)

  return typeof value === 'string' ? value : key
}

export function readStoredLanguage(): Language {
  if (typeof window === 'undefined') {
    return 'en'
  }

  const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY)
  return stored === 'zh' ? 'zh' : 'en'
}

type I18nContextValue = {
  language: Language
  setLanguage: (language: Language) => void
  t: (key: TranslationKey) => string
}

const I18nContext = createContext<I18nContextValue | null>(null)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => readStoredLanguage())

  useEffect(() => {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language)
  }, [language])

  const value = useMemo<I18nContextValue>(() => {
    return {
      language,
      setLanguage,
      t: (key) => getNestedValue(translations[language], key),
    }
  }, [language])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider')
  }
  return context
}
