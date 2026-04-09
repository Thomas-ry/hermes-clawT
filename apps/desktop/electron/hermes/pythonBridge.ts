import { spawnSync } from 'node:child_process'
import type { HermesRuntimePaths } from './runtimePaths'

type PythonCall = {
  module: string
  fn: string
  kwargs?: Record<string, unknown>
}

function encodeBase64(input: string): string {
  return Buffer.from(input, 'utf8').toString('base64')
}

function decodeJson<T>(text: string): T {
  return JSON.parse(text) as T
}

export class HermesPythonBridge {
  constructor(private readonly runtime: HermesRuntimePaths) {}

  callJson<T>(call: PythonCall): T {
    const payload = encodeBase64(JSON.stringify(call))
    const code = `
import base64, json, sys, importlib
call = json.loads(base64.b64decode(sys.argv[1]).decode("utf-8"))
mod = importlib.import_module(call["module"])
fn = getattr(mod, call["fn"])
kwargs = call.get("kwargs") or {}
out = fn(**kwargs)
sys.stdout.write(out if isinstance(out, str) else json.dumps(out, ensure_ascii=False))
`
    const res = spawnSync(
      this.runtime.pythonExe,
      ['-c', code, payload],
      {
        cwd: this.runtime.hermesInstallDir,
        env: {
          ...process.env,
          HERMES_HOME: this.runtime.hermesHomeDir,
        },
        encoding: 'utf8',
        maxBuffer: 10 * 1024 * 1024,
      },
    )
    if (res.status !== 0) {
      const stderr = (res.stderr ?? '').toString()
      const stdout = (res.stdout ?? '').toString()
      throw new Error(`Python call failed (status=${res.status}): ${stderr || stdout}`)
    }
    return decodeJson<T>((res.stdout ?? '').toString())
  }
}
