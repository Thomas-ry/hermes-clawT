# clawT Desktop App

This directory contains the Electron desktop application for `clawT`.

## Responsibilities

The desktop app is responsible for:

- booting and supervising the bundled Hermes runtime
- exposing a safe IPC surface to the renderer
- rendering the React-based desktop UI
- integrating desktop-only concerns such as packaging, updates, and local log streaming

## Structure

```text
electron/        Electron Main, preload, IPC handlers, runtime helpers
src/             React renderer pages, components, client helpers, tests
build/           Generated desktop icons used by electron-builder
public/          Static assets for development and packaging
```

## Development

Run from the repository root in most cases:

```bash
pnpm dev
pnpm lint
pnpm test
pnpm build
```

If you want to work from this directory directly:

```bash
pnpm dev
pnpm lint
pnpm test
pnpm build
```

## Packaging

The desktop package scripts expect the bundled Hermes runtime to already exist.

From the repository root:

```bash
pnpm runtime:build
pnpm package:mac
pnpm package:win
pnpm package:linux
```

## Notes

- Renderer code should not access Hermes secrets directly.
- Hermes API requests should continue to flow through Electron Main and preload-exposed APIs.
- UI changes should be validated with `lint`, `test`, and `build` before packaging changes are considered complete.
