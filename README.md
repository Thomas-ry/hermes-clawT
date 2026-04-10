# clawT

> Hermes Agent 桌面可视化客户端 — 你的本地 AI 工作站

<p align="center">
  <img src="https://img.shields.io/badge/version-0.1.0-blue?style=flat-square" />
  <img src="https://img.shields.io/badge/platform-macOS%20%7C%20Windows%20%7C%20Linux-blue?style=flat-square" />
  <img src="https://img.shields.io/badge/Electron-4.0+-white?style=flat-square" />
  <img src="https://img.shields.io/badge/Node-22+-green?style=flat-square" />
</p>

clawT 是一个运行在本地桌面的 Hermes Agent 可视化外壳，目标是成为继 ClawX 之后 Hermes 的标准桌面客户端。

---

## ✨ 功能亮点

- 💬 **对话界面** — 本地 Chat 界面，支持消息复制、时间戳显示、打字动画、清空对话
- ⏰ **定时任务** — 可视化管理 Cron 任务，创建、暂停、运行、删除
- 🛠️ **技能市场** — 浏览、搜索、启用/禁用 Hermes 技能
- 📊 **仪表盘** — 实时状态指示（运行中/已停止）、快捷操作栏、更新管理
- 🌐 **频道管理** — 可视化配置 Hermes 通信频道
- ⚙️ **设置面板** — 模型配置、终端配置、导入/导出、界面语言（中/英）
- 🔄 **自动更新** — 检查更新、下载、重启安装一条龙
- 📝 **发布说明** — 直接从更新源加载最新 changelog
- 📤 **三平台打包** — macOS (dmg/zip)、Windows (NSIS)、Linux (AppImage/deb)

---

## 🚀 快速开始

### 前置依赖

- Node.js 22+
- pnpm 10+
- Python 3.11+ (`uv` 用于构建 Hermes runtime)

### 安装 & 开发

```bash
# 克隆仓库
git clone https://github.com/Thomas-ry/hermes-clawT.git
cd hermes-clawT

# 安装依赖
pnpm install

# 构建内置 Hermes runtime（首次需要，体积较大）
pnpm runtime:build

# 启动开发服务器
pnpm dev
```

### 打包安装包

```bash
# 图标生成（如需自定义）
pnpm icons:build

# 必须先构建 runtime
pnpm runtime:build

# 打包（选一个平台）
pnpm package:mac      # macOS
pnpm package:win      # Windows
pnpm package:linux    # Linux
```

产物在 `apps/desktop/release/` 目录下。

---

## 🏗️ 项目结构

```
hermes-clawT/
├── apps/desktop/          # Electron 桌面应用
│   ├── electron/          # Main 进程（Gateway 托管、IPC、API 代理）
│   │   └── hermes/        # Hermes Runtime 管理
│   ├── src/               # Renderer 进程（React）
│   │   ├── components/    # 通用组件（AppLayout、StatCard、Toast 等）
│   │   ├── pages/         # 页面（Dashboard / Chat / Cron / Skills / Channels / Settings / Logs）
│   │   ├── lib/            # 客户端工具函数
│   │   └── i18n.tsx        # 中英文国际化
│   └── electron-builder.json5  # 打包配置
├── scripts/               # 构建脚本
│   └── generate-icons.py  # 从 SVG 生成多平台图标
└── .github/
    └── workflows/         # CI 构建 & Release 工作流
```

### 技术栈

| 层次 | 技术 |
|------|------|
| 桌面框架 | Electron 4.0+ |
| 前端框架 | React 18 + TypeScript |
| 构建工具 | Vite |
| 路由 | React Router v6 |
| 样式 | 原生 CSS（深色主题） |
| 打包 | electron-builder |
| Runtime | Hermes Agent（bundled） |
| 更新 | electron-updater + GitHub Pages |

---

## 🌐 架构说明

```
┌─────────────────────────────────────┐
│          Renderer Process           │
│   React UI (Chat / Dashboard / ...)  │
│   通过 IPC 调用 Main 进程            │
└──────────────┬──────────────────────┘
               │ IPC
┌──────────────▼──────────────────────┐
│          Main Process              │
│  ┌──────────────────────────────┐   │
│  │   Hermes Gateway (bundled)   │   │
│  │   - OpenAI Compatible API    │   │
│  │   - Cron Scheduler           │   │
│  │   - Skills Engine            │   │
│  └──────────────────────────────┘   │
│  API Server Key 不暴露给 UI         │
└─────────────────────────────────────┘
```

Hermes Gateway 由 Electron Main 进程托管（自动启动/重启），UI 通过 Main 进程代理访问 `http://127.0.0.1:<port>/v1/...`，保证 API Key 安全。

---

## 📦 发布流程

### 打 Tag 自动触发

```bash
git tag v0.1.1
git push origin v0.1.1
```

GitHub Actions 会自动完成：构建三平台安装包 → 生成 Release Notes → 创建 Draft Release。

### 手动触发

在 GitHub Actions 页面运行 `release` workflow，输入版本号即可。

### 自动更新

- 更新源默认指向 `https://thomas-ry.github.io/hermes-clawT/updates`
- 打包配置已启用 GitHub Pages 静态托管
- 首次发布前在仓库 Settings → Pages → Source 设为 **GitHub Actions**

---

## 🔑 macOS 签名 & 公证

在 GitHub Actions Secrets 中配置：

| Key | 说明 |
|-----|------|
| `CSC_LINK` | Apple Developer 证书 |
| `CSC_KEY_PASSWORD` | 证书密码 |
| `APPLE_ID` | Apple ID |
| `APPLE_APP_SPECIFIC_PASSWORD` | 应用专用密码 |
| `APPLE_TEAM_ID` | Team ID |

本地调试默认不签名，正式分发前再开启。

---

## 🌍 国际化

界面支持 **简体中文** 和 **English**，在设置页一键切换，数据持久化到浏览器本地存储。

---

## 📄 License

MIT
