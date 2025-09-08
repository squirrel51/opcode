<div align="center">
  <img src="src-tauri/icons/icon.png" alt="opcode Logo" width="120" height="120">

  <h1>opcode</h1>
  
  <p>
    <strong>一个强大的 Claude Code GUI 应用程序和工具包</strong>
  </p>
  <p>
    <strong>创建自定义代理、管理交互式 Claude Code 会话、运行安全的后台代理等等。</strong>
  </p>
  
  <p>
    <a href="#features"><img src="https://img.shields.io/badge/Features-✨-blue?style=for-the-badge" alt="Features"></a>
    <a href="#installation"><img src="https://img.shields.io/badge/Install-🚀-green?style=for-the-badge" alt="Installation"></a>
    <a href="#usage"><img src="https://img.shields.io/badge/Usage-📖-purple?style=for-the-badge" alt="Usage"></a>
    <a href="#development"><img src="https://img.shields.io/badge/Develop-🛠️-orange?style=for-the-badge" alt="Development"></a>
    <a href="https://discord.com/invite/KYwhHVzUsY"><img src="https://img.shields.io/badge/Discord-Join-5865F2?style=for-the-badge&logo=discord&logoColor=white" alt="Discord"></a>
  </p>
</div>

![457013521-6133a738-d0cb-4d3e-8746-c6768c82672c](https://github.com/user-attachments/assets/a028de9e-d881-44d8-bae5-7326ab3558b9)



https://github.com/user-attachments/assets/6bceea0f-60b6-4c3e-a745-b891de00b8d0



> [!TIP]
> **⭐ 为本仓库点赞，并在 X 上关注 [@getAsterisk](https://x.com/getAsterisk)，以抢先体验 `asteria-swe-v0`**。

> [!NOTE]
> 本项目不隶属于 Anthropic，也未获得其认可或赞助。Claude 是 Anthropic, PBC 的商标。这是一个使用 Claude 的独立开发者项目。

## 🌟 概述

**opcode** 是一个功能强大的桌面应用程序，它改变了您与 Claude Code 交互的方式。它使用 Tauri 2 构建，提供了一个美观的 GUI，用于管理您的 Claude Code 会话、创建自定义代理、跟踪使用情况等等。

将 opcode 视为您的 Claude Code 命令中心——它弥合了命令行工具与可视化体验之间的鸿沟，使 AI 辅助开发更加直观和高效。

## 📋 目录

- [🌟 概述](#-概述)
- [✨ 功能](#-功能)
- [🚀 新增功能](#-新增功能)
  - [🗂️ 项目与会话管理](#️-项目与会话管理)
  - [🤖 CC 代理](#-cc-代理)

  - [📊 使用情况分析仪表板](#-使用情况分析仪表板)
  - [🔌 MCP 服务器管理](#-mcp-服务器管理)
  - [⏰ 时间线与检查点](#-时间线与检查点)
  - [📝 CLAUDE.md 管理](#-claudemd-管理)
- [📖 使用方法](#-使用方法)
  - [入门](#入门)
  - [管理项目](#管理项目)
  - [创建代理](#创建代理)
  - [跟踪使用情况](#跟踪使用情况)
  - [使用 MCP 服务器](#使用-mcp-服务器)
- [🚀 安装](#-安装)
- [🔨 从源代码构建](#-从源代码构建)
- [🛠️ 开发](#️-开发)
- [🔒 安全](#-安全)
- [🤝 贡献](#-贡献)
- [📄 许可证](#-许可证)
- [🙏 致谢](#-致谢)

## ✨ 功能

### 🗂️ **项目与会话管理**
- **可视化项目浏览器**: 浏览 `~/.claude/projects/` 中所有 Claude Code 项目
- **会话历史**: 查看并恢复具有完整上下文的过往编码会话
- **智能搜索**: 使用内置搜索快速查找项目和会话
- **会话洞察**: 一目了然地查看首条消息、时间戳和会话元数据

### 🤖 **CC 代理**
- **自定义 AI 代理**: 创建具有自定义系统提示和行为的专用代理
- **代理库**: 构建一个用于不同任务的专用代理集合
- **后台执行**: 在单独的进程中运行代理以进行非阻塞操作
- **执行历史**: 跟踪所有代理运行，包括详细日志和性能指标

### 📊 **使用情况分析仪表板**
- **成本跟踪**: 实时监控您的 Claude API 使用情况和成本
- **令牌分析**: 按模型、项目和时间段进行详细分类
- **可视化图表**: 美观的图表显示使用趋势和模式
- **导出数据**: 导出使用数据用于会计和分析

### 🔌 **MCP 服务器管理**
- **服务器注册**: 从中央 UI 管理模型上下文协议服务器
- **轻松配置**: 通过 UI 添加服务器或从现有配置导入
- **连接测试**: 使用前验证服务器连接
- **Claude Desktop 导入**: 从 Claude Desktop 导入服务器配置

### ⏰ **时间线与检查点**
- **会话版本控制**: 在编码会话的任何时间点创建检查点
- **可视化时间线**: 使用分支时间线浏览会话历史
- **即时恢复**: 一键跳回任何检查点
- **分叉会话**: 从现有检查点创建新分支
- **差异查看器**: 精确查看检查点之间的变化

### 📝 **CLAUDE.md 管理**
- **内置编辑器**: 直接在应用程序内编辑 CLAUDE.md 文件
- **实时预览**: 实时查看 Markdown 渲染效果
- **项目扫描器**: 查找项目中所有 CLAUDE.md 文件
- **语法高亮**: 全面支持 Markdown 语法高亮

## 🚀 新增功能

**feat: 为核心 UI 组件实现全面的国际化 (i18n)**

此提交为多个核心 UI 组件引入了国际化 (i18n) 支持，使应用程序能够显示多语言文本，特别是英语和中文。

主要更改包括：
- 集成 react-i18next 进行语言管理。
- 对 StorageTab.tsx、ProxySettings.tsx、ProjectList.tsx 和 NFOCredits.tsx 组件进行国际化，将硬编码字符串替换为翻译键。
- 在 src/locales/en/translation.json 和 src/locales/zh/translation.json 中添加了新的翻译键及其对应的英文和中文翻译。
- 优化了 App.tsx 和 SlashCommandsManager.tsx 中的 i18n 设置，确保 useTranslation hook 的正确使用。
- 更新了 translation_summary.md 以反映已完成的 i18n 任务。
- 解决了与 i18n 集成相关的编译错误。

此功能通过提供语言本地化增强了用户体验，并为未来的语言扩展奠定了基础。

## 📖 使用方法

### 入门

1. **启动 opcode**: 安装后打开应用程序
2. **欢迎屏幕**: 选择 CC 代理或项目
3. **首次设置**: opcode 将自动检测您的 `~/.claude` 目录

### 管理项目

```
项目 → 选择项目 → 查看会话 → 恢复或开始新会话
```

- 点击任何项目以查看其会话
- 每个会话显示首条消息和时间戳
- 直接恢复会话或开始新会话

### 创建代理

```
CC 代理 → 创建代理 → 配置 → 执行
```

1. **设计您的代理**: 设置名称、图标和系统提示
2. **配置模型**: 选择可用的 Claude 模型
3. **设置权限**: 配置文件读/写和网络访问
4. **执行任务**: 在任何项目上运行您的代理

### 跟踪使用情况

```
菜单 → 使用情况仪表板 → 查看分析
```

- 按模型、项目和日期监控成本
- 导出数据用于报告
- 设置使用警报（即将推出）

### 使用 MCP 服务器

```
菜单 → MCP 管理器 → 添加服务器 → 配置
```

- 手动添加服务器或通过 JSON 添加
- 从 Claude Desktop 配置导入
- 使用前测试连接

## 🚀 安装

### 先决条件

- **Claude Code CLI**: 从 [Claude 官方网站](https://claude.ai/code) 安装

### 发布可执行文件即将发布

## 🔨 从源代码构建

### 先决条件

在从源代码构建 opcode 之前，请确保您已安装以下内容：

#### 系统要求

- **操作系统**: Windows 10/11, macOS 11+ 或 Linux (Ubuntu 20.04+)
- **内存**: 最低 4GB (推荐 8GB)
- **存储**: 至少 1GB 可用空间

#### 所需工具

1. **Rust** (1.70.0 或更高版本)
   ```bash
   # 通过 rustup 安装
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   ```

2. **Bun** (最新版本)
   ```bash
   # 安装 bun
   curl -fsSL https://bun.sh/install | bash
   ```

3. **Git**
   ```bash
   # 通常预装，如果未安装：
   # Ubuntu/Debian: sudo apt install git
   # macOS: brew install git
   # Windows: 从 https://git-scm.com 下载
   ```

4. **Claude Code CLI**
   - 从 [Claude 官方网站](https://claude.ai/code) 下载并安装
   - 确保 `claude` 在您的 PATH 中可用

#### 平台特定依赖项

**Linux (Ubuntu/Debian)**
```bash
# 安装系统依赖项
sudo apt update
sudo apt install -y \
  libwebkit2gtk-4.1-dev \
  libgtk-3-dev \
  libayatana-appindicator3-dev \
  librsvg2-dev \
  patchelf \
  build-essential \
  curl \
  wget \
  file \
  libssl-dev \
  libxdo-dev \
  libsoup-3.0-dev \
  libjavascriptcoregtk-4.1-dev
```

**macOS**
```bash
# 安装 Xcode 命令行工具
xcode-select --install

# 通过 Homebrew 安装额外依赖项 (可选)
brew install pkg-config
```

**Windows**
- 安装 [Microsoft C++ Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/)
- 安装 [WebView2](https://developer.microsoft.com/microsoft-edge/webview2/) (通常在 Windows 11 上预装)

### 构建步骤

1. **克隆仓库**
   ```bash
   git clone https://github.com/getAsterisk/opcode.git
   cd opcode
   ```

2. **安装前端依赖项**
   ```bash
   bun install
   ```

3. **构建应用程序**
   
   **用于开发 (带热重载)**
   ```bash
   bun run tauri dev
   ```
   
   **用于生产构建**
   ```bash
   # 构建应用程序
   bun run tauri build
   
   # 构建的可执行文件将位于：
   # - Linux: src-tauri/target/release/
   # - macOS: src-tauri/target/release/
   # - Windows: src-tauri/target/release/
   ```

4. **平台特定构建选项**
   
   **调试构建 (编译速度更快，二进制文件更大)**
   ```bash
   bun run tauri build --debug
   ```
   
   **macOS 通用二进制文件 (Intel + Apple Silicon)**
   ```bash
   bun run tauri build --target universal-apple-darwin
   ```

### 故障排除

#### 常见问题

1. **“cargo not found” 错误**
   - 确保 Rust 已安装且 `~/.cargo/bin` 在您的 PATH 中
   - 运行 `source ~/.cargo/env` 或重启您的终端

2. **Linux: “webkit2gtk not found” 错误**
   - 安装上面列出的 webkit2gtk 开发包
   - 在较新的 Ubuntu 版本上，您可能需要 `libwebkit2gtk-4.0-dev`

3. **Windows: “MSVC not found” 错误**
   - 安装支持 C++ 的 Visual Studio Build Tools
   - 安装后重启您的终端

4. **“claude command not found” 错误**
   - 确保 Claude Code CLI 已安装并在您的 PATH 中
   - 使用 `claude --version` 进行测试

5. **构建失败并出现“内存不足”**
   - 尝试使用较少的并行作业进行构建：`cargo build -j 2`
   - 关闭其他应用程序以释放内存

#### 验证您的构建

构建后，您可以验证应用程序是否正常工作：

```bash
# 直接运行构建的可执行文件
# Linux/macOS
./src-tauri/target/release/opcode

# Windows
./src-tauri/target/release/opcode.exe
```

### 构建产物

构建过程会创建多个产物：

- **可执行文件**: 主 opcode 应用程序
- **安装程序** (使用 `tauri build` 时):
  - `.deb` 包 (Linux)
  - `.AppImage` (Linux)
  - `.dmg` 安装程序 (macOS)
  - `.msi` 安装程序 (Windows)
  - `.exe` 安装程序 (Windows)

所有产物都位于 `src-tauri/target/release/`。

## 🛠️ 开发

### 技术栈

- **前端**: React 18 + TypeScript + Vite 6
- **后端**: Rust with Tauri 2
- **UI 框架**: Tailwind CSS v4 + shadcn/ui
- **数据库**: SQLite (通过 rusqlite)
- **包管理器**: Bun

### 项目结构

```
opcode/
├── src/                   # React 前端
│   ├── components/        # UI 组件
│   ├── lib/               # API 客户端与工具
│   └── assets/            # 静态资源
├── src-tauri/             # Rust 后端
│   ├── src/
│   │   ├── commands/      # Tauri 命令处理程序
│   │   ├── checkpoint/    # 时间线管理
│   │   └── process/       # 进程管理
│   └── tests/             # Rust 测试套件
└── public/                # 公共资源
```

### 开发命令

```bash
# 启动开发服务器
bun run tauri dev

# 仅运行前端
bun run dev

# 类型检查
bunx tsc --noEmit

# 运行 Rust 测试
cd src-tauri && cargo test

# 格式化代码
cd src-tauri && cargo fmt
```

## 🔒 安全

opcode 优先考虑您的隐私和安全：

1. **进程隔离**: 代理在单独的进程中运行
2. **权限控制**: 为每个代理配置文件和网络访问权限
3. **本地存储**: 所有数据都保留在您的机器上
4. **无遥测**: 不收集或跟踪任何数据
5. **开源**: 通过开源代码实现完全透明

## 🤝 贡献

我们欢迎贡献！请参阅我们的 [贡献指南](CONTRIBUTING.md) 了解详情。

### 贡献领域

- 🐛 错误修复和改进
- ✨ 新功能和增强
- 📚 文档改进
- 🎨 UI/UX 增强
- 🧪 测试覆盖
- 🌐 国际化

## 📄 许可证

本项目根据 AGPL 许可证授权 - 详情请参阅 [LICENSE](LICENSE) 文件。

## 🙏 致谢

- 使用 [Tauri](https://tauri.app/) 构建 - 用于构建桌面应用程序的安全框架
- Anthropic 的 [Claude](https://claude.ai)

---

<div align="center">
  <p>
    <strong>由 <a href="https://asterisk.so/">Asterisk</a> 团队倾情打造 ❤️</strong>
  </p>
  <p>
    <a href="https://github.com/getAsterisk/opcode/issues">报告 Bug</a>
    ·
    <a href="https://github.com/getAsterisk/opcode/issues">请求功能</a>
  </p>
</div>


## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=getAsterisk/opcode&type=Date)](https://www.star-history.com/#getAsterisk/opcode&Date)