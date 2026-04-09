import { chmodSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

type EnvLine =
  | { kind: 'kv'; key: string; value: string }
  | { kind: 'raw'; text: string }

function parseEnv(content: string): EnvLine[] {
  const lines = content.split(/\r?\n/)
  return lines.map((line) => {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) return { kind: 'raw', text: line }
    const eq = line.indexOf('=')
    if (eq === -1) return { kind: 'raw', text: line }
    const key = line.slice(0, eq).trim()
    const value = line.slice(eq + 1)
    if (!key) return { kind: 'raw', text: line }
    return { kind: 'kv', key, value }
  })
}

function serializeEnv(lines: EnvLine[]): string {
  return lines
    .map((line) => {
      if (line.kind === 'raw') return line.text
      return `${line.key}=${line.value}`
    })
    .join('\n')
    .replace(/\n?$/, '\n')
}

export function readEnvVars(envPath: string): Record<string, string> {
  const existing = existsSync(envPath) ? readFileSync(envPath, 'utf8') : ''
  const parsed = parseEnv(existing)
  const out: Record<string, string> = {}
  for (const line of parsed) {
    if (line.kind === 'kv') out[line.key] = line.value
  }
  return out
}

export function upsertEnvVars(envPath: string, vars: Record<string, string | null | undefined>): void {
  const dir = path.dirname(envPath)
  mkdirSync(dir, { recursive: true })

  const existing = existsSync(envPath) ? readFileSync(envPath, 'utf8') : ''
  const parsed = parseEnv(existing)
  const lines = parsed.slice()

  const indexByKey = new Map<string, number>()
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i]
    if (line.kind === 'kv') indexByKey.set(line.key, i)
  }

  for (const [key, maybeValue] of Object.entries(vars)) {
    const value = maybeValue ?? null
    const idx = indexByKey.get(key)
    if (value === null) {
      if (idx !== undefined) {
        lines[idx] = { kind: 'raw', text: `# ${key}=` }
      }
      continue
    }
    if (idx !== undefined) {
      const prev = lines[idx]
      if (prev.kind === 'kv') lines[idx] = { kind: 'kv', key, value }
      continue
    }
    lines.push({ kind: 'kv', key, value })
  }

  writeFileSync(envPath, serializeEnv(lines), 'utf8')
  try {
    chmodSync(envPath, 0o600)
  } catch {
    // ignore on platforms that don't support chmod
  }
}
