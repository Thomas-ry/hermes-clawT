import { safeStorage } from 'electron'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

type SecretsFile = {
  apiServerKey?: string
}

function readJsonIfExists(filePath: string): SecretsFile {
  if (!existsSync(filePath)) return {}
  try {
    const raw = readFileSync(filePath)
    const decoded = safeStorage.isEncryptionAvailable()
      ? safeStorage.decryptString(raw)
      : raw.toString('utf8')
    return JSON.parse(decoded) as SecretsFile
  } catch {
    return {}
  }
}

function writeJson(filePath: string, data: SecretsFile): void {
  mkdirSync(path.dirname(filePath), { recursive: true })
  const text = JSON.stringify(data, null, 2)
  const bytes = safeStorage.isEncryptionAvailable()
    ? safeStorage.encryptString(text)
    : Buffer.from(text, 'utf8')
  writeFileSync(filePath, bytes)
}

export function loadOrCreateApiServerKey(params: { secretsPath: string; generate: () => string }): string {
  const existing = readJsonIfExists(params.secretsPath)
  if (existing.apiServerKey && existing.apiServerKey.trim()) return existing.apiServerKey

  const key = params.generate()
  writeJson(params.secretsPath, { ...existing, apiServerKey: key })
  return key
}
