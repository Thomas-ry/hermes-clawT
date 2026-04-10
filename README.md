# clawT

`clawT` is a desktop client for `Hermes Agent`.

It packages a local Hermes runtime behind an Electron application and exposes the workflows that matter in daily use: chat, cron jobs, skills, channel configuration, runtime settings, logs, packaging, and update delivery.

[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](./LICENSE)
[![Build](https://github.com/Thomas-ry/hermes-clawT/actions/workflows/build.yml/badge.svg)](https://github.com/Thomas-ry/hermes-clawT/actions/workflows/build.yml)

## Overview

Most desktop wrappers for agent runtimes stop at “open a window around a local server”.

`clawT` takes a different approach:

- It treats `Hermes Agent` as the product surface, not as a hidden dependency.
- It bundles the runtime so non-CLI users can run Hermes locally with fewer moving parts.
- It gives common Hermes workflows first-class UI entry points instead of pushing everything through raw config files.

This is not a generic Electron shell and it is not intended to impersonate `ClawX`. It is a separate desktop client designed specifically for Hermes-driven work.

## Current Capabilities

- `Dashboard`: runtime status, gateway controls, auto-update controls, and release feed visibility
- `Chat`: local OpenAI-compatible Hermes chat routed through Electron Main
- `Cron`: create, inspect, filter, edit, run, pause, resume, and remove cron jobs
- `Skills`: inspect installed skills and enable or disable them per surface
- `Channels`: edit environment-backed channel integrations such as Telegram, Discord, Slack, Signal, WhatsApp, Email, and Matrix
- `Settings`: modify runtime defaults and import or export portable config snapshots
- `Logs`: stream gateway logs with search, stream filtering, and copyable visible output
- `Packaging`: build macOS, Windows, and Linux desktop artifacts from the same repository

## Architecture

At a high level, `clawT` is split into three parts:

1. `Electron Main`
   Starts and supervises the bundled Hermes Gateway, owns privileged runtime operations, and keeps secrets out of the renderer process.
2. `Preload + IPC`
   Exposes a narrow desktop API to the renderer for gateway control, config management, cron actions, log streaming, and update state.
3. `React Renderer`
   Implements the desktop UI for Hermes workflows using page-level views for chat, cron, skills, channels, settings, and logs.

Runtime requests from the UI are proxied through Electron Main instead of exposing the local Hermes API key directly in the browser context.

## Repository Layout

```text
apps/desktop/          Electron + React desktop application
scripts/               Runtime build, release asset generation, icon generation
.github/workflows/     CI build and release automation
README.md              Project overview and operator documentation
ROADMAP.md             Project direction and non-goals
CONTRIBUTING.md        Contribution workflow
SECURITY.md            Security disclosure guidance
```

## Local Development

### Requirements

- Node.js `22+`
- `pnpm 10+`
- `uv`

### Setup

```bash
pnpm install
pnpm runtime:build
pnpm dev
```

`pnpm runtime:build` prepares the bundled Hermes runtime used by the desktop shell. It downloads and assembles the runtime dependencies that are intentionally not committed to the repository.

## Common Commands

```bash
pnpm dev
pnpm lint
pnpm test
pnpm build
pnpm package:mac
pnpm package:win
pnpm package:linux
```

If you attempt to package without building the runtime first, packaging will fail by design.

## Packaging and Distribution

`clawT` is set up for desktop packaging across all three major platforms:

- macOS: `dmg` and `zip`
- Windows: `NSIS`
- Linux: `AppImage` and `deb`

Artifacts are emitted under `apps/desktop/release/`.

Icons are generated from `scripts/generate-icons.py` into:

- `apps/desktop/build/icon.png`
- `apps/desktop/build/icon.ico`
- `apps/desktop/build/icon.icns`

## Updates and Releases

The desktop client uses `electron-updater` with a `generic` provider.

Default update feed:

`https://thomas-ry.github.io/hermes-clawT/updates`

Release automation is handled by GitHub Actions:

- `build.yml`
  Runs on `main` pushes and pull requests, builds packages on macOS, Windows, and Linux, and uploads artifacts.
- `release.yml`
  Runs on version tags or manual dispatch, builds packaged artifacts, generates release metadata, deploys the update feed to GitHub Pages, and creates a draft GitHub Release.

To publish a tagged release:

```bash
git tag v0.1.1
git push origin v0.1.1
```

To publish a manual release:

1. Run the `release` workflow in GitHub Actions.
2. Provide a semantic version such as `0.1.1`.
3. Optionally override the upstream Hermes reference.

## Quality Gates

Before opening a pull request, run:

```bash
pnpm lint
pnpm test
pnpm build
```

If your change touches packaging, auto-update behavior, or runtime bundling, document what you validated and what you did not validate in the PR description.

## Security Notes

Before publishing code or release artifacts, verify:

- no `.env`, token, key, or local-machine path has been committed accidentally
- generated release artifacts and runtime caches remain ignored where appropriate
- screenshots, logs, and README examples do not expose credentials or private infrastructure details

Please report security issues through the process documented in [SECURITY.md](./SECURITY.md).

## Open Source Project Files

- [CONTRIBUTING.md](./CONTRIBUTING.md)
- [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md)
- [SECURITY.md](./SECURITY.md)
- [ROADMAP.md](./ROADMAP.md)
- [LICENSE](./LICENSE)

## Roadmap

Near-term work is focused on:

- stronger onboarding for first-time desktop users
- better visualization of Hermes runtime state and recovery paths
- richer Chat, Cron, and Skills workflows
- more polished public release and update operations

Longer-term intent and non-goals are documented in [ROADMAP.md](./ROADMAP.md).
