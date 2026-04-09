import { ChildProcessWithoutNullStreams, spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { upsertEnvVars } from './envFile'
import type { HermesRuntimePaths } from './runtimePaths'

export type GatewayStatus =
  | { state: 'stopped' }
  | { state: 'starting'; port: number }
  | { state: 'running'; port: number; pid: number }
  | { state: 'error'; message: string }

export type GatewayLogLine = {
  ts: string
  stream: 'stdout' | 'stderr'
  line: string
}

export class HermesGatewayManager {
  #proc: ChildProcessWithoutNullStreams | null = null
  #status: GatewayStatus = { state: 'stopped' }
  #logSubscribers = new Set<(line: GatewayLogLine) => void>()
  #stdoutBuf = ''
  #stderrBuf = ''

  constructor(private readonly runtime: HermesRuntimePaths) {}

  status(): GatewayStatus {
    return this.#status
  }

  subscribeLogs(cb: (line: GatewayLogLine) => void): () => void {
    this.#logSubscribers.add(cb)
    return () => this.#logSubscribers.delete(cb)
  }

  async start(): Promise<GatewayStatus> {
    if (this.#proc) return this.#status

    const pythonExe = this.runtime.pythonExe
    const hermesInstallDir = this.runtime.hermesInstallDir

    if (!existsSync(pythonExe)) {
      this.#status = {
        state: 'error',
        message: `Bundled Hermes runtime missing Python executable: ${pythonExe}`,
      }
      return this.#status
    }

    // Ensure Hermes home exists + write required API server vars.
    const hermesEnvPath = path.join(this.runtime.hermesHomeDir, '.env')
    upsertEnvVars(hermesEnvPath, {
      API_SERVER_ENABLED: 'true',
      API_SERVER_HOST: '127.0.0.1',
      API_SERVER_PORT: String(this.runtime.gatewayPort),
      API_SERVER_KEY: this.runtime.apiKey,
    })

    this.#status = { state: 'starting', port: this.runtime.gatewayPort }

    const env = {
      ...process.env,
      HERMES_HOME: this.runtime.hermesHomeDir,
      // Ensure Hermes reads secrets from our per-app env file.
      // Hermes uses get_hermes_home() which respects HERMES_HOME.
      API_SERVER_ENABLED: 'true',
      API_SERVER_HOST: '127.0.0.1',
      API_SERVER_PORT: String(this.runtime.gatewayPort),
      API_SERVER_KEY: this.runtime.apiKey,
    }

    this.#proc = spawn(
      pythonExe,
      ['-m', 'hermes_cli.main', 'gateway', 'run'],
      {
        cwd: hermesInstallDir,
        env,
      },
    )

    this.#proc.stdout.setEncoding('utf8')
    this.#proc.stderr.setEncoding('utf8')

    this.#proc.stdout.on('data', (chunk: string) => {
      this.#stdoutBuf += chunk
      const parts = this.#stdoutBuf.split(/\r?\n/)
      this.#stdoutBuf = parts.pop() ?? ''
      for (const line of parts) this.#emit('stdout', line)
    })

    this.#proc.stderr.on('data', (chunk: string) => {
      this.#stderrBuf += chunk
      const parts = this.#stderrBuf.split(/\r?\n/)
      this.#stderrBuf = parts.pop() ?? ''
      for (const line of parts) this.#emit('stderr', line)
    })

    this.#proc.on('exit', (code, signal) => {
      const pid = this.#proc?.pid ?? 0
      this.#proc = null
      this.#stdoutBuf = ''
      this.#stderrBuf = ''
      this.#status = { state: 'stopped' }
      const reason = signal ? `signal ${signal}` : `code ${code ?? 'unknown'}`
      this.#emit('stderr', `Gateway exited (pid=${pid}, ${reason})`)
    })

    if (this.#proc.pid) {
      this.#status = { state: 'running', port: this.runtime.gatewayPort, pid: this.#proc.pid }
    } else {
      this.#status = { state: 'error', message: 'Failed to start gateway (no pid)' }
    }

    return this.#status
  }

  async stop(): Promise<GatewayStatus> {
    const proc = this.#proc
    if (!proc) {
      this.#status = { state: 'stopped' }
      return this.#status
    }

    this.#emit('stderr', 'Stopping gateway...')

    if (process.platform === 'win32') {
      proc.kill()
    } else {
      proc.kill('SIGINT')
    }

    this.#proc = null
    this.#status = { state: 'stopped' }
    return this.#status
  }

  async restart(): Promise<GatewayStatus> {
    await this.stop()
    return this.start()
  }

  #emit(stream: 'stdout' | 'stderr', line: string): void {
    const trimmed = line.trimEnd()
    if (!trimmed) return
    const payload: GatewayLogLine = {
      ts: new Date().toISOString(),
      stream,
      line: trimmed,
    }
    for (const cb of this.#logSubscribers) cb(payload)
  }
}
