/* @vitest-environment node */
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { EventEmitter } from 'node:events'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { ChildProcessWithoutNullStreams } from 'node:child_process'
import { HermesGatewayManager } from './gatewayManager'

const { mockSpawn } = vi.hoisted(() => ({
  mockSpawn: vi.fn(),
}))

vi.mock('node:child_process', async (importOriginal) => {
  const actual = await importOriginal<typeof import('node:child_process')>()
  return {
    ...actual,
    spawn: mockSpawn,
  }
})

class FakeStream extends EventEmitter {
  setEncoding(): this {
    return this
  }
}

class FakeChildProcess extends EventEmitter {
  readonly stdout = new FakeStream()
  readonly stderr = new FakeStream()
  readonly kill = vi.fn()

  constructor(readonly pid: number) {
    super()
  }
}

function createProc(pid: number): ChildProcessWithoutNullStreams {
  return new FakeChildProcess(pid) as unknown as ChildProcessWithoutNullStreams
}

const tempDirs: string[] = []

function createRuntime() {
  const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), 'clawt-gateway-'))
  tempDirs.push(rootDir)

  const hermesHomeDir = path.join(rootDir, 'home')
  const hermesInstallDir = path.join(rootDir, 'install')
  const pythonExe = path.join(rootDir, 'bin', 'python')

  fs.mkdirSync(hermesHomeDir, { recursive: true })
  fs.mkdirSync(hermesInstallDir, { recursive: true })
  fs.mkdirSync(path.dirname(pythonExe), { recursive: true })
  fs.writeFileSync(pythonExe, '#!/usr/bin/env python3\n')

  return {
    pythonExe,
    hermesInstallDir,
    hermesHomeDir,
    gatewayPort: 8642,
    apiKey: 'secret',
  }
}

describe('HermesGatewayManager', () => {
  afterEach(() => {
    while (tempDirs.length) {
      fs.rmSync(tempDirs.pop()!, { recursive: true, force: true })
    }
  })

  beforeEach(() => {
    mockSpawn.mockReset()
  })

  it('waits for the old gateway process to exit before restarting', async () => {
    const firstProc = createProc(101)
    const secondProc = createProc(202)
    mockSpawn.mockReturnValueOnce(firstProc).mockReturnValueOnce(secondProc)

    const manager = new HermesGatewayManager(createRuntime())

    await manager.start()

    const restartPromise = manager.restart()
    await Promise.resolve()

    expect(mockSpawn).toHaveBeenCalledTimes(1)
    expect(manager.status()).toEqual({ state: 'stopping', port: 8642 })
    expect((firstProc as unknown as FakeChildProcess).kill).toHaveBeenCalledWith('SIGINT')

    ;(firstProc as unknown as FakeChildProcess).emit('exit', 0, null)

    await expect(restartPromise).resolves.toEqual({
      state: 'running',
      port: 8642,
      pid: 202,
    })
    expect(mockSpawn).toHaveBeenCalledTimes(2)
  })

  it('logs the exiting process pid even after stop clears internal state', async () => {
    const proc = createProc(777)
    mockSpawn.mockReturnValue(proc)

    const manager = new HermesGatewayManager(createRuntime())

    const logLines: string[] = []
    manager.subscribeLogs((line) => {
      logLines.push(line.line)
    })

    await manager.start()
    const stopPromise = manager.stop()
    ;(proc as unknown as FakeChildProcess).emit('exit', 0, null)
    await stopPromise

    expect(logLines).toContain('Stopping gateway...')
    expect(logLines).toContain('Gateway exited (pid=777, code 0)')
  })
})
