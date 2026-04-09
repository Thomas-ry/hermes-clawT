# clawT

Hermes Agent 的桌面可视化客户端（类似 ClawX 之于 OpenClaw）。

## 开发（本机）

前置：
- Node.js 22+
- pnpm 10+
- `uv`（用于构建内置 Hermes runtime）

```bash
pnpm install

# 可选：构建“电池内置”的 Hermes runtime（会下载/安装 Python 3.11 依赖，体积较大）
pnpm runtime:build

# 启动桌面端（开发模式）
pnpm dev
```

## 打包（本机）

```bash
pnpm runtime:build
pnpm package:mac     # 或 package:win / package:linux
```

## 运行时说明

- Hermes Gateway 由 Electron Main 进程托管（自动启动/重启），并启用本机 OpenAI 兼容 API server。
- UI 通过 Main 进程代理访问 `http://127.0.0.1:<port>/v1/...`，避免在渲染进程暴露 `API_SERVER_KEY`。
