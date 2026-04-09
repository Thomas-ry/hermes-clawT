export type HermesStatus = {
  runtime: {
    hermesHomeDir: string
    hermesInstallDir: string
    gatewayPort: number
  }
  gateway: unknown
}

export async function hermesStatus(): Promise<HermesStatus> {
  return (await window.hermes.status()) as HermesStatus
}

export async function hermesApiChat(params: { messages: Array<{ role: string; content: string }> }): Promise<string> {
  const body = JSON.stringify({
    model: 'hermes-agent',
    stream: false,
    messages: params.messages,
  })
  const res = await window.hermes.api.fetch({
    path: '/v1/chat/completions',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  })
  if (res.status < 200 || res.status >= 300) {
    throw new Error(`API error ${res.status}: ${res.body}`)
  }
  const parsed = JSON.parse(res.body) as {
    choices?: Array<{ message?: { content?: string } }>
  }
  return parsed.choices?.[0]?.message?.content ?? ''
}
