# Contributing to clawT

Thanks for considering contributing.

## Before You Start

- Search existing issues and pull requests before opening a new one.
- For non-trivial changes, open an issue first so we can align on scope and direction.
- Keep pull requests focused. Small, reviewable changes land faster than broad refactors.

## Local Setup

Requirements:

- Node.js 22+
- pnpm 10+
- `uv` for building the bundled Hermes runtime

Install and run:

```bash
pnpm install
pnpm runtime:build
pnpm dev
```

## Validation

Please run these before opening a pull request:

```bash
pnpm lint
pnpm test
pnpm build
```

If your change affects packaging or runtime bundling, also verify the relevant platform package command locally if possible.

## Pull Request Guidelines

- Use a clear title and explain the user-facing impact.
- Link the relevant issue when available.
- Include screenshots or screen recordings for UI changes.
- Mention any follow-up work or known limitations.
- Do not include secrets, tokens, or personal local paths in commits, screenshots, or logs.

## Release and Versioning

- This project follows semantic versioning.
- Maintainers are responsible for release tags and published binaries.

## Scope Notes

- `apps/desktop` contains the Electron app and most user-facing code.
- `scripts/` contains build and release tooling.
- Bundled Hermes runtime artifacts should be generated, not committed manually.
