import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, rmSync } from 'node:fs'
import path from 'node:path'

const repoRoot = path.resolve(process.cwd())

const HERMES_AGENT_GIT_URL = process.env.HERMES_AGENT_GIT_URL ?? 'https://github.com/NousResearch/hermes-agent.git'
const HERMES_AGENT_REF = process.env.HERMES_AGENT_REF ?? '18140199c3a1cbb658a2eeadf692ffb8b5d1626f'

const buildDir = path.join(repoRoot, '.runtime-build')
const hermesSrcDir = path.join(buildDir, 'hermes-agent')

// This directory is copied into the Electron app as an extraResource.
const outDir = path.join(repoRoot, 'apps', 'desktop', 'resources', 'hermes-agent')

function run(cmd, args, options = {}) {
  const result = spawnSync(cmd, args, { stdio: 'inherit', ...options })
  if (result.status !== 0) {
    throw new Error(`Command failed: ${cmd} ${args.join(' ')}`)
  }
}

function ensureCleanDir(dir) {
  rmSync(dir, { recursive: true, force: true })
  mkdirSync(dir, { recursive: true })
}

function main() {
  mkdirSync(buildDir, { recursive: true })

  if (!existsSync(hermesSrcDir)) {
    run('git', ['clone', '--depth', '1', HERMES_AGENT_GIT_URL, hermesSrcDir])
  }
  run('git', ['-C', hermesSrcDir, 'fetch', '--depth', '1', 'origin', HERMES_AGENT_REF])
  run('git', ['-C', hermesSrcDir, 'checkout', '--force', HERMES_AGENT_REF])

  // Create venv + install deps into hermesSrcDir/venv
  run('uv', ['python', 'install', '3.11'])
  run('uv', ['venv', 'venv', '--python', '3.11'], { cwd: hermesSrcDir })
  run('uv', ['sync', '--extra', 'all', '--locked'], {
    cwd: hermesSrcDir,
    env: { ...process.env, UV_PROJECT_ENVIRONMENT: path.join(hermesSrcDir, 'venv') },
  })

  // Copy runtime into the app resources folder.
  ensureCleanDir(path.dirname(outDir))
  rmSync(outDir, { recursive: true, force: true })
  mkdirSync(path.dirname(outDir), { recursive: true })

  // Use `tar` to preserve symlinks and permissions across platforms.
  const archive = path.join(buildDir, 'hermes-agent.tar')
  rmSync(archive, { force: true })
  run('tar', ['-cf', archive, '-C', buildDir, 'hermes-agent'])
  run('tar', ['-xf', archive, '-C', path.dirname(outDir)])

  const actualOut = path.join(path.dirname(outDir), 'hermes-agent')
  if (!existsSync(actualOut)) {
    throw new Error(`Expected output runtime missing: ${actualOut}`)
  }

  const meta = {
    git_url: HERMES_AGENT_GIT_URL,
    git_ref: HERMES_AGENT_REF,
    built_at: new Date().toISOString(),
    platform: process.platform,
    arch: process.arch,
  }
  const metaJson = JSON.stringify(meta, null, 2)
  run('node', ['-e', `require('fs').writeFileSync(${JSON.stringify(path.join(actualOut, 'BUNDLED_RUNTIME.json'))}, ${JSON.stringify(metaJson)})`])

  // eslint-disable-next-line no-console
  console.log(`✅ Hermes runtime built: ${actualOut}`)
}

main()
