# clawT

Hermes Agent 的桌面可视化客户端，目标是做成 “Hermes 版 ClawX”。

当前已经具备：
- Electron Main 托管 bundled Hermes Gateway
- Chat / Cron / Skills / Channels / Settings / Logs 页面
- 中英文界面切换（设置页持久化）
- 三平台打包脚手架
- 私有仓库 CI 构建工作流

## 开发（本机）

前置：
- Node.js 22+
- pnpm 10+
- `uv`（用于构建内置 Hermes runtime）

```bash
pnpm install

# 构建“电池内置”的 Hermes runtime（会下载/安装 Python 3.11 依赖，体积较大）
pnpm runtime:build

# 启动桌面端（开发模式）
pnpm dev
```

## 打包（本机）

```bash
pnpm icons:build
pnpm runtime:build
pnpm package:mac     # 或 package:win / package:linux
```

如果没有先执行 `pnpm runtime:build`，打包命令会直接失败并提示缺少 bundled runtime。

## 发布准备

### 图标与品牌

- 桌面端图标由 `scripts/generate-icons.py` 生成
- 产物会写到 `apps/desktop/build/icon.png`、`apps/desktop/build/icon.ico`、`apps/desktop/build/icon.icns`
- 开发模式窗口图标使用 `apps/desktop/public/clawt-icon.png`

### 版本策略

- 使用语义化版本：`MAJOR.MINOR.PATCH`
- `package.json` 与 `apps/desktop/package.json` 保持同版本
- 建议发布节奏：
  - `0.x`：快速迭代内部测试版
  - `1.0.0`：三平台安装包、签名链路、更新说明全部稳定后再发

### macOS 签名与公证

- `electron-builder` 会在检测到 Apple Developer 身份时自动尝试签名
- 推荐在 CI Secrets 配置：
  - `CSC_LINK`
  - `CSC_KEY_PASSWORD`
  - `APPLE_ID`
  - `APPLE_APP_SPECIFIC_PASSWORD`
  - `APPLE_TEAM_ID`
- 本地调试可先不签名；正式分发给普通用户前再开启签名和 notarization

### Windows / Linux

- Windows 安装包使用 NSIS，建议后续补充 `CSC_LINK` / EV 证书后再正式分发
- Linux 目前输出 `AppImage` 与 `deb`，适合内测和团队内部分发
- 如果要做自动更新，建议下一步补 `latest.yml` 分发托管和 release notes 生成

## CI 打包

GitHub Actions 工作流会：
- 安装 Node + pnpm + uv
- 构建 bundled Hermes runtime
- 按平台打包 `macOS / Windows / Linux`
- 上传 `apps/desktop/release/**` 产物

你也可以在 Actions 页面手动触发，并覆盖 Hermes 上游 commit/tag。

## 发布流程

### 方案 A：打 tag 自动发草稿 Release

```bash
git tag v0.1.1
git push origin v0.1.1
```

- `release.yml` 会在三平台构建产物
- 构建完成后自动创建 GitHub Draft Release
- 安装包和 blockmap 会自动挂到该 Release

### 方案 B：手动触发 Release Workflow

- 在 GitHub Actions 里运行 `release`
- 输入版本号，例如 `0.1.1`
- 可选覆盖 `hermes_ref`
- 工作流会临时同步版本号、构建三平台安装包并发布 Draft Release

### 当前限制

- macOS：本地可正常打包，但默认未签名
- Linux：需要完整 metadata，当前仓库已补齐
- Windows：建议优先在 GitHub Actions 的 `windows-latest` 上产包，最稳定

## 自动更新

- 桌面端已接入 `electron-updater`
- `Dashboard` 页面可以：
  - 检查更新
  - 下载更新
  - 重启并安装更新
- 打包配置已启用：
  - Windows `NSIS`
  - Linux `AppImage / deb`
  - macOS `dmg + zip`

### 当前注意事项

- 现在的更新源已切到 `generic provider`
- 默认更新地址是：`https://thomas-ry.github.io/hermes-clawT/updates`
- `release.yml` 会把 `latest*.yml`、安装包和 blockmap 部署到 GitHub Pages，供普通用户公开访问
- 同一个工作流还会生成 `release-notes.md`、`release-notes.json`、`latest.json`，用于更新公告和外部 changelog 展示
- 如果后面要换成 Cloudflare R2、S3 或自有 CDN，只需要改 `apps/desktop/electron-builder.json5` 里的 `publish.url`

### GitHub Pages 准备

- 在仓库 `Settings -> Pages` 中把发布源切到 `GitHub Actions`
- 首次运行 `release` 工作流后，会自动生成公开的 `/updates` 静态目录
- 桌面端自动更新会从这个公开地址拉取元数据，不再依赖私有 GitHub Release 凭证

## 运行时说明

- Hermes Gateway 由 Electron Main 进程托管（自动启动/重启），并启用本机 OpenAI 兼容 API server。
- UI 通过 Main 进程代理访问 `http://127.0.0.1:<port>/v1/...`，避免在渲染进程暴露 `API_SERVER_KEY`。
