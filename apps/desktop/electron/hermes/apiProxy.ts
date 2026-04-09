import type { HermesRuntimePaths } from './runtimePaths'

export type ApiProxyRequest = {
  path: string
  method: string
  headers?: Record<string, string>
  body?: string
}

export type ApiProxyResponse = {
  status: number
  headers: Record<string, string>
  body: string
}

export async function apiProxyFetch(runtime: HermesRuntimePaths, req: ApiProxyRequest): Promise<ApiProxyResponse> {
  const url = new URL(`http://127.0.0.1:${runtime.gatewayPort}${req.path}`)
  const headers: Record<string, string> = {
    ...(req.headers ?? {}),
    Authorization: `Bearer ${runtime.apiKey}`,
    'Content-Type': req.headers?.['Content-Type'] ?? 'application/json',
  }
  const res = await fetch(url, {
    method: req.method,
    headers,
    body: req.body,
  })
  const text = await res.text()
  const outHeaders: Record<string, string> = {}
  res.headers.forEach((value, key) => {
    outHeaders[key] = value
  })
  return {
    status: res.status,
    headers: outHeaders,
    body: text,
  }
}
