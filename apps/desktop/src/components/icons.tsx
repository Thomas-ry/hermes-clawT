import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement>

function BaseIcon({ children, ...props }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  )
}

export function DashboardIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M4 13h6V5H4zM14 19h6v-8h-6zM14 5h6v4h-6zM4 19h6v-2H4z" />
    </BaseIcon>
  )
}

export function ChatIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M5 6.5A2.5 2.5 0 0 1 7.5 4h9A2.5 2.5 0 0 1 19 6.5v6A2.5 2.5 0 0 1 16.5 15H11l-4 4v-4H7.5A2.5 2.5 0 0 1 5 12.5z" />
    </BaseIcon>
  )
}

export function ClockIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4l2.5 2.5" />
    </BaseIcon>
  )
}

export function SparklesIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="m12 3 1.4 3.6L17 8l-3.6 1.4L12 13l-1.4-3.6L7 8l3.6-1.4z" />
      <path d="m18 14 .8 2.2L21 17l-2.2.8L18 20l-.8-2.2L15 17l2.2-.8z" />
      <path d="m6 14 .9 1.6L8.5 17l-1.6.9L6 19.5l-.9-1.6L3.5 17l1.6-.9z" />
    </BaseIcon>
  )
}

export function LinkIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M10 13a5 5 0 0 0 7.07 0l1.41-1.41A5 5 0 0 0 11.4 4.5L10 5.91" />
      <path d="M14 11a5 5 0 0 0-7.07 0L5.5 12.41A5 5 0 0 0 12.57 19.5L14 18.09" />
    </BaseIcon>
  )
}

export function SettingsIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="m12 3 1.2 2.2 2.5.4-.9 2.3 1.7 1.8-1.7 1.8.9 2.3-2.5.4L12 17l-1.2-2.2-2.5-.4.9-2.3L7.5 9.3l1.7-1.8-.9-2.3 2.5-.4z" />
      <circle cx="12" cy="10.5" r="2.5" />
    </BaseIcon>
  )
}

export function TerminalIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M4 6.5h16v11H4z" />
      <path d="m7.5 10 2 2-2 2M12 14h4" />
    </BaseIcon>
  )
}

export function ArrowCircleIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M9 12h6" />
      <path d="m12 9 3 3-3 3" />
    </BaseIcon>
  )
}

export function ServerIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <rect x="3" y="4" width="18" height="4" rx="1" />
      <rect x="3" y="10" width="18" height="4" rx="1" />
      <rect x="3" y="16" width="18" height="4" rx="1" />
      <circle cx="7" cy="6" r="0.8" fill="currentColor" />
      <circle cx="7" cy="12" r="0.8" fill="currentColor" />
      <circle cx="7" cy="18" r="0.8" fill="currentColor" />
    </BaseIcon>
  )
}
