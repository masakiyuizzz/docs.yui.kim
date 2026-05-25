# Homebrew —— macOS（及 Linux）缺失的包管理器

> "The Missing Package Manager for macOS (or Linux)"
> 基于 Git + Ruby，支持 formula（源码编译）和 cask（预编译二进制）两种包形态。
> 版本：5.1.11 · ARM64 原生 · Ruby 4.0.4
> 官网：[brew.sh](https://brew.sh) · 源码：[github.com/Homebrew/brew](https://github.com/Homebrew/brew)

---

## 目录

1. [安装](#1-安装)
2. [目录结构详解](#2-目录结构详解)
3. [Terminology（术语）](#3-terminology术语)
4. [核心命令](#4-核心命令)
    - [安装与卸载](#41-安装与卸载)
    - [查询与搜索](#42-查询与搜索)
    - [更新与升级](#43-更新与升级)
    - [信息查看](#44-信息查看)
    - [清理与维护](#45-清理与维护)
5. [Cask（GUI 应用管理）](#5-caskgui-应用管理)
6. [Services（后台服务）](#6-services后台服务)
7. [Tap（第三方仓库）](#7-tap第三方仓库)
8. [Brew Bundle（声明式管理）](#8-brew-bundle声明式管理)
9. [Formula 编写基础](#9-formula-编写基础)
10. [Bottle（预编译包）](#10-bottle预编译包)
11. [环境变量](#11-环境变量)
12. [诊断与故障排查](#12-诊断与故障排查)
13. [高级场景](#13-高级场景)
14. [本机环境速查](#14-本机环境速查)
15. [命令速查表](#15-命令速查表)
16. [注意事项与陷阱](#16-注意事项与陷阱)

---

## 1. 安装

### macOS（本机）

```bash
# 一行安装
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

**前置**：Command Line Tools for Xcode。

```bash
# 如果未安装 CLT
xcode-select --install
```

**Apple Silicon（M 系列）**：安装后添加到 PATH：

```bash
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
eval "$(/opt/homebrew/bin/brew shellenv)"
```

**Intel Mac**：安装路径为 `/usr/local`。

```bash
echo 'eval "$(/usr/local/bin/brew shellenv)"' >> ~/.zprofile
```

### Linux

```bash
# Debian/Ubuntu
sudo apt-get install build-essential curl git

# Fedora/RHEL
sudo dnf groupinstall "Development Tools"
sudo dnf install curl git

# 安装 Homebrew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 添加到 PATH
test -d /home/linuxbrew/.linuxbrew && eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)"
```

### 验证与卸载

```bash
# 验证
brew --version
brew doctor

# 卸载
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/uninstall.sh)"
```

---

## 2. 目录结构详解

本机 Homebrew 5.1.11 安装在 `/opt/homebrew`（Apple Silicon 默认）。

```
/opt/homebrew/
├── bin/                     # 符号链接 → Cellar 中的实际文件
│   ├── brew                 # brew 命令本身
│   ├── node → ../Cellar/node@22/...
│   └── ...
│
├── Cellar/                  # 所有 formula 的实际安装位置
│   ├── bat/
│   │   └── 0.26.1/          # 一个 keg（特定版本）
│   └── ...
│
├── Caskroom/                # 所有 cask 的实际安装位置
│   └── visual-studio-code/
│       └── 1.x.x/
│
├── opt/                     # 指向当前活跃版本的符号链接
│   ├── bat → ../Cellar/bat/0.26.1
│   └── ...
│
├── Library/
│   ├── Homebrew/            # brew 自身的源码（Ruby）
│   ├── Taps/                # 本地克隆的 tap 仓库
│   │   ├── homebrew/
│   │   │   ├── core/        # Formula（JSON API 缓存）
│   │   │   └── cask/        # Cask 定义
│   │   └── koekeishiya/     # 第三方 tap（本机：yabai/skhd 用）
│   │       └── formulae/
│   └── ...
│
├── etc/                     # 配置文件
├── share/                   # 共享数据（man pages、locale 等）
├── var/                     # 日志、PID 等
└── Frameworks/              # macOS 框架
```

### 关键路径速查

| 路径 | 含义 | 获取命令 |
|------|------|----------|
| `/opt/homebrew` | prefix（安装根目录） | `brew --prefix` |
| `/opt/homebrew/Cellar` | Cellar（formula 安装位置） | `brew --cellar` |
| `/opt/homebrew/Caskroom` | Caskroom（cask 安装位置） | `brew --caskroom` |
| `/opt/homebrew/opt/<name>` | opt prefix（活跃版本链接） | |
| `~/Library/Caches/Homebrew` | 下载缓存 | `brew --cache` |
| `/opt/homebrew/Library/Taps` | tap 仓库 | |
| `/opt/homebrew/Library/Homebrew` | brew 自身源码 | `brew --repository` |

---

## 3. Terminology（术语）

Homebrew 有精确的术语体系，理解它们是复用文档的基础。

| 术语 | 说明 | 示例 |
|------|------|------|
| **formula** | Ruby 编写的包定义，从源码构建 | `/opt/homebrew/Library/Taps/homebrew/homebrew-core/Formula/f/foo.rb` |
| **cask** | 安装预编译二进制（通常 macOS GUI 应用） | `/opt/homebrew/Library/Taps/homebrew/homebrew-cask/Casks/b/bar.rb` |
| **prefix** | Homebrew 的安装根目录 | `/opt/homebrew` |
| **keg** | 某个 formula 特定版本的安装目录 | `/opt/homebrew/Cellar/foo/0.1` |
| **rack** | 包含一个 formula 所有版本的目录 | `/opt/homebrew/Cellar/foo` |
| **keg-only** | 不符号链接到 prefix 的 formula（避免冲突） | `node@22`、`openssl@3` |
| **opt prefix** | 指向活跃版本 keg 的符号链接 | `/opt/homebrew/opt/foo` |
| **Cellar** | 所有 rack 的集合 | `/opt/homebrew/Cellar` |
| **Caskroom** | 所有 cask 的集合 | `/opt/homebrew/Caskroom` |
| **tap** | formula / cask / 外部命令的 Git 仓库 | `homebrew/core`、`koekeishiya/formulae` |
| **bottle** | formula 的预编译二进制包 | 免除从源码编译 |
| **tab** | keg 的元信息（安装方式、依赖等） | `/opt/homebrew/Cellar/foo/0.1/INSTALL_RECEIPT.json` |
| **Brew Bundle** | `Brewfile` 的声明式管理 | 一键复现开发环境 |
| **Brew Services** | 管理后台服务 | `brew services start mysql` |
| **external command** | 非 Homebrew/brew 仓库定义的 brew 子命令 | |

---

## 4. 核心命令

### 4.1 安装与卸载

```bash
# 安装 formula
brew install wget
brew install node@22
brew install git-lfs

# 安装指定版本
brew install python@3.12

# 源码编译安装（不用 bottle）
brew install --build-from-source ffmpeg
brew install -s ffmpeg

# 安装 HEAD 版本（最新 git 主分支）
brew install --HEAD neovim

# 安装 cask（GUI 应用）
brew install --cask google-chrome
brew install --cask visual-studio-code

# 卸载
brew uninstall wget
brew uninstall --cask google-chrome

# 强制卸载（忽略依赖）
brew uninstall --force wget

# 卸载并删除所有依赖
brew uninstall --zap --cask docker

# 自动清理不再需要的依赖
brew autoremove
brew autoremove --dry-run      # 预览
```

### 4.2 查询与搜索

```bash
# 列出已安装
brew list                       # 所有 formula
brew list --formula            # 仅 formula
brew list --cask               # 仅 cask
brew list --versions           # 含版本号

# 搜索
brew search node
brew search /^git/              # 正则搜索
brew search --cask chrome       # 搜索 cask

# 浏览器打开 formula 主页
brew home wget

# 查看 formula 源码（Ruby）
brew edit wget
# 查看但不编辑
brew cat wget
```

### 4.3 更新与升级

```bash
# 更新 Homebrew 自身
brew update

# 升级所有 formula
brew upgrade

# 升级指定包
brew upgrade wget node@22

# 只查看可升级的列表
brew outdated
brew outdated --greedy          # 含 cask 和 auto-update 的应用

# 禁止某个包升级（pin）
brew pin node@22
brew unpin node@22
brew list --pinned              # 查看已 pin 的包

# 重置 update 的 Git 状态（出问题时用）
brew update-reset
```

### 4.4 信息查看

```bash
# 查看 formula 详情
brew info wget
brew info --json wget           # JSON 输出

# 查看依赖
brew deps wget
brew deps --tree wget           # 依赖树
brew deps --installed wget      # 已安装的依赖

# 反向依赖（谁依赖了它）
brew uses wget
brew uses --installed wget

# 查看 formula 的安装选项
brew options ffmpeg

# 查看描述
brew desc wget

# 显示 formula 文件路径
brew --prefix wget              # opt prefix
brew --cellar wget              # Cellar 路径

# 查看 leaves（被手动安装的顶层包）
brew leaves
```

### 4.5 清理与维护

```bash
# 清理旧版本和下载缓存
brew cleanup
brew cleanup --dry-run           # 预览
brew cleanup -s                  # 更彻底清理

# 清理指定 formula
brew cleanup wget

# 检查问题
brew doctor

# 检查缺失的依赖
brew missing

# 验证已安装包的完整性
brew readall

# 查看缓存大小
du -sh $(brew --cache)

# 链接 keg-only 的包
brew link node@22
brew link --overwrite --force node@22
brew unlink node@22
```

---

## 5. Cask（GUI 应用管理）

Cask 用于安装 macOS 原生 GUI 应用。

```bash
# 搜索
brew search --cask firefox

# 安装
brew install --cask google-chrome
brew install --cask visual-studio-code
brew install --cask docker

# 列出已安装的 cask
brew list --cask
brew list --cask --versions

# 升级 cask
brew upgrade --cask

# 卸载
brew uninstall --cask google-chrome
brew uninstall --zap --cask docker    # 同时删除配置文件

# 查看 cask 信息
brew info --cask google-chrome

# 强制重新安装
brew reinstall --cask google-chrome
```

---

## 6. Services（后台服务）

管理通过 Homebrew 安装的后台服务（如数据库、Web 服务器）。

```bash
# 列出所有服务
brew services list

# 启动服务
brew services start mysql
brew services start redis

# 停止
brew services stop mysql

# 重启
brew services restart mysql

# 设置为开机自启
brew services start mysql          # 默认含自启行为
brew services run mysql            # 启动但不注册自启

# 查看服务状态
brew services info mysql

# 清理无用的服务定义
brew services cleanup
```

---

## 7. Tap（第三方仓库）

Tap 是 formula / cask 的 Git 仓库。默认 tap 是 `homebrew/core` 和 `homebrew/cask`。

```bash
# 列出已添加的 tap
brew tap
# 本机：koekeishiya/formulae

# 添加第三方 tap
brew tap <user>/<repo>
# 例如：
brew tap hashicorp/tap

# GitHub 短名（自动推断 homebrew- 前缀）
brew tap user/repo
# 等价于 git clone https://github.com/user/homebrew-repo

# 从 tap 安装（含全名）
brew install hashicorp/tap/terraform

# 查看 tap 信息
brew tap-info <user>/<repo>

# 移除 tap
brew untap <user>/<repo>

# 创建自己的 tap
brew tap-new myuser/mytap
# 在 /opt/homebrew/Library/Taps/myuser/homebrew-mytap 创建模板

# 创建 formula 到 tap
brew create <url> --tap myuser/mytap
```

### Tap 目录结构

```
/opt/homebrew/Library/Taps/user/homebrew-repo/
├── Formula/           # 放 .rb formula 文件
├── Casks/             # 放 .rb cask 文件
├── cmd/               # 放外部命令脚本
└── .github/workflows/ # CI（自动构建 bottle）
```

---

## 8. Brew Bundle（声明式管理）

用 `Brewfile` 声明所有 Homebrew 依赖，一键复现开发环境。

### 创建 Brewfile

```bash
# 生成当前系统的 Brewfile
brew bundle dump

# 生成到指定文件
brew bundle dump --file=~/Brewfile

# 只包含 formula（不包含 cask）
brew bundle dump --formula

# 只包含 cask
brew bundle dump --cask

# 强制覆盖
brew bundle dump --force
```

### Brewfile 格式

```ruby
# Brewfile
tap "homebrew/cask"
tap "hashicorp/tap"

# Formula
brew "git"
brew "node@22"
brew "pnpm"
brew "ffmpeg"
brew "aria2"

# Cask
cask "google-chrome"
cask "visual-studio-code"
cask "docker"

# Mac App Store
mas "Xcode", id: 497799835

# 带参数
brew "mysql", restart_service: true
brew "openssl@3", link: false

# Whalebrew
whalebrew "whalebrew/wget"
```

### 使用 Brewfile

```bash
# 安装 Brewfile 中所有依赖
brew bundle install

# 指定 Brewfile
brew bundle install --file=~/my-Brewfile

# 检查 Brewfile 中的包状态
brew bundle check

# 列出 Brewfile 中所有条目
brew bundle list

# 清理 Brewfile 中不存在的包
brew bundle cleanup
brew bundle cleanup --force        # 实际执行删除
```

---

## 9. Formula 编写基础

Formula 是用 Ruby DSL 编写的包定义文件。

### 最小 Formula

```ruby
# hello.rb
class Hello < Formula
  desc "A simple hello world program"
  homepage "https://example.com"
  url "https://example.com/hello-1.0.tar.gz"
  sha256 "abc123..."               # SHA-256 checksum

  def install
    system "./configure", "--prefix=#{prefix}"
    system "make", "install"
  end

  test do
    system "#{bin}/hello", "--version"
  end
end
```

### 常用 DSL 方法

```ruby
class MyPkg < Formula
  desc "Package description"       # 一行描述
  homepage "https://..."           # 项目主页
  url "https://.../v1.0.tar.gz"   # 源码 URL
  sha256 "abc..."                  # SHA-256
  license "MIT"                    # 许可证
  version "1.2.3"                  # 版本号（可从 URL 推断则省略）

  # 依赖
  depends_on "cmake" => :build     # 构建时依赖
  depends_on "pkg-config" => :build
  depends_on "openssl@3"           # 运行时依赖
  depends_on :xcode               # macOS 特定
  depends_on :macos => :ventura   # 最低 macOS 版本

  # 资源（额外下载）
  resource "extra-data" do
    url "https://.../data.tar.gz"
    sha256 "def..."
  end

  # 冲突
  conflicts_with "other-pkg", because: "both install same binary"

  # keg-only：不链接到 prefix
  keg_only :provided_by_macos

  def install
    # ENV 设置
    ENV["CFLAGS"] = "..."

    # 通用安装模式
    system "./configure", "--prefix=#{prefix}", *std_configure_args
    system "make", "install"

    # 或 cmake
    system "cmake", "-S", ".", "-B", "build", *std_cmake_args
    system "cmake", "--build", "build"
    system "cmake", "--install", "build"

    # 安装额外资源
    resource("extra-data").stage { cp "data.bin", bin }

    # 手动复制文件
    bin.install "hello"
    lib.install Dir["lib/*.so"]
    man1.install "hello.1"
    share.install "docs"
  end

  test do
    system "#{bin}/hello", "--version"
  end
end
```

### 标准安装路径

```ruby
prefix       # /opt/homebrew/Cellar/mypkg/1.0
bin          # prefix/bin
lib          # prefix/lib
include      # prefix/include
share        # prefix/share
man1         # prefix/share/man/man1
doc          # prefix/share/doc
pkgshare     # prefix/share/mypkg  ← 推荐放额外数据
etc          # prefix/etc  ← 推荐放配置文件
var          # prefix/var
```

### 调试 Formula

```bash
# 创建 formula
brew create https://example.com/mypkg-1.0.tar.gz

# 交互式安装（停在每步）
brew install --debug --verbose mypkg
brew install -dv mypkg

# 只测试
brew test mypkg

# 审计 formula
brew audit --strict mypkg

# 查看 style
brew style mypkg
```

---

## 10. Bottle（预编译包）

Bottle 是 formula 的预编译二进制，由 Homebrew CI 自动构建。

```bash
# 查看是否使用 bottle
brew info wget | grep Bottle
# bottle : ✅ 表示可用预编译版本

# 强制源码编译（忽略 bottle）
brew install --build-from-source wget

# 为特定 macOS 版本构建 bottle
brew bottle --root-url=https://example.com/bottles mypkg.rb

# 输出 bottle 块到 stdout（用于贴入 formula）
brew bottle --merge --write mypkg.rb
```

**Bottle 在 formula 中的样子**：

```ruby
bottle do
  sha256 arm64_sequoia: "abc..."
  sha256 arm64_sonoma:   "def..."
  sha256 ventura:        "ghi..."
end
```

---

## 11. 环境变量

### 常用环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `HOMEBREW_PREFIX` | 安装前缀 | `/opt/homebrew` |
| `HOMEBREW_CELLAR` | Cellar 路径 | `/opt/homebrew/Cellar` |
| `HOMEBREW_CASK_OPTS` | brew install --cask 的默认参数 | `--appdir=/Applications` |
| `HOMEBREW_MAKE_JOBS` | 并行编译线程数 | CPU 核数 |
| `HOMEBREW_NO_AUTO_UPDATE` | 禁止 brew 命令前自动 update | 未设置 |
| `HOMEBREW_AUTO_UPDATE_SECS` | 自动 update 间隔（秒） | `86400`（24h） |
| `HOMEBREW_NO_INSTALL_CLEANUP` | 禁止安装后自动 cleanup | 未设置 |
| `HOMEBREW_NO_ENV_HINTS` | 禁用环境提示 | 未设置 |
| `HOMEBREW_NO_ANALYTICS` | 禁用分析 | 未设置 |
| `HOMEBREW_BUNDLE_FILE` | Brewfile 路径 | 当前目录 `Brewfile` |
| `HOMEBREW_BAT_THEME` | `brew cat` 语法高亮主题 | 无 |
| `HOMEBREW_EDITOR` | 编辑 formula 用的编辑器 | `$EDITOR` |
| `HOMEBREW_GITHUB_API_TOKEN` | GitHub API token（提升 API 频率限制） | 无 |
| `HOMEBREW_CURLRC` | 启用 curl 的 `.curlrc` | 未设置 |
| `HOMEBREW_FORBID_PACKAGES_FROM_PATHS` | 禁止从本地路径安装 | 未设置 |
| `HOMEBREW_DOWNLOAD_CONCURRENCY` | 下载并发数 | 5 |

### 本机当前配置

```bash
# 查看当前环境
brew --env

# 查看所有配置
brew config
# 本机：
# HOMEBREW_VERSION: 5.1.11
# HOMEBREW_PREFIX: /opt/homebrew
# HOMEBREW_BAT_THEME: Dracula
# HOMEBREW_DOWNLOAD_CONCURRENCY: 20
# HOMEBREW_MAKE_JOBS: 10
```

---

## 12. 诊断与故障排查

### 基础检查

```bash
# 全面诊断
brew doctor

# 检查配置
brew config

# 检查特定包的文件完整性
brew readall

# 检查缺失依赖
brew missing

# 查看安装日志
brew gist-logs wget             # 上传日志到 GitHub Gist
brew log wget                   # 查看 git log
```

### 常见问题与解决

| 问题 | 诊断 | 解决 |
|------|------|------|
| 安装很慢 | 在源码编译 | `brew info pkg` 看是否有 bottle |
| 链接失败 | 另一个版本已链接 | `brew unlink pkg && brew link pkg` |
| 找不到包 | 未 tap 或拼写错误 | `brew search pkg` |
| brew 命令很慢 | 自动 update | `HOMEBREW_NO_AUTO_UPDATE=1 brew ...` |
| 缓存过大 | 旧版本堆积 | `brew cleanup -s` |
| 依赖冲突 | 多版本同时存在 | `brew doctor` 诊断 |
| 权限错误 | prefix 权限问题 | `sudo chown -R $(whoami) $(brew --prefix)` |
| Git 仓库损坏 | update 失败 | `brew update-reset` |

---

## 13. 高级场景

### 13.1 多版本共存

```bash
# 安装多版本（keg-only 的自动不链接）
brew install node@20
brew install node@22

# 切换到不同版本
brew unlink node@20
brew link --overwrite --force node@22
# 或直接使用完整路径
/opt/homebrew/opt/node@20/bin/node script.js
```

### 13.2 迁移到新 Mac

```bash
# 旧 Mac：导出
brew bundle dump --file=~/mac-setup/Brewfile
cp ~/mac-setup/Brewfile ~/mac-setup/   # 同步到云或 U 盘

# 新 Mac：安装 Homebrew 后
brew bundle install --file=~/mac-setup/Brewfile
```

### 13.3 CI/CD 中使用

```yaml
# GitHub Actions
- name: Set up Homebrew
  run: |
    brew update
    brew install node@22 pnpm
```

### 13.4 锁定版本（避免意外升级）

```bash
# pin 不允许 brew upgrade 升级
brew pin node@22

# 查看已 pin 的包
brew list --pinned

# 仍可手动强制升级
brew upgrade --ignore-pinned node@22
```

### 13.5 分析统计控制

```bash
# 查看当前分析状态
brew analytics state

# 关闭分析
brew analytics off

# 开启分析
brew analytics on
```

---

## 14. 本机环境速查

| 项目 | 值 |
|------|-----|
| **Homebrew 版本** | 5.1.11 |
| **架构** | ARM64 (Apple Silicon) |
| **操作系统** | macOS 26.3.1 |
| **安装路径** | `/opt/homebrew` |
| **Ruby 版本** | 4.0.4 (portable-ruby) |
| **已装 formula** | 54 |
| **已装 cask** | 4 |
| **第三方 tap** | `koekeishiya/formulae` |
| **下载并发** | 20 |
| **编译并行** | 10 核 |
| **bat 主题** | Dracula |

---

## 15. 命令速查表

### 包管理

| 命令 | 说明 |
|------|------|
| `brew install <pkg>` | 安装 formula |
| `brew install --cask <pkg>` | 安装 cask |
| `brew uninstall <pkg>` | 卸载 |
| `brew reinstall <pkg>` | 重新安装 |
| `brew upgrade` | 升级所有 |
| `brew upgrade <pkg>` | 升级指定包 |
| `brew update` | 更新 Homebrew 自身 |
| `brew outdated` | 列出可升级包 |
| `brew pin <pkg>` | 禁止升级 |
| `brew unpin <pkg>` | 解除禁止 |
| `brew autoremove` | 自动删除无用依赖 |

### 查询

| 命令 | 说明 |
|------|------|
| `brew search <text>` | 搜索 |
| `brew info <pkg>` | 详细信息 |
| `brew list` | 已安装 formula 列表 |
| `brew list --cask` | 已安装 cask 列表 |
| `brew list --versions` | 含版本 |
| `brew leaves` | 顶层包（手动安装） |
| `brew deps <pkg>` | 依赖列表 |
| `brew deps --tree <pkg>` | 依赖树 |
| `brew uses <pkg>` | 反向依赖 |
| `brew desc <pkg>` | 描述 |
| `brew home <pkg>` | 打开主页 |
| `brew cat <pkg>` | 查看 formula 源码 |

### 维护

| 命令 | 说明 |
|------|------|
| `brew doctor` | 诊断 |
| `brew cleanup` | 清理旧版本 |
| `brew missing` | 检查缺失依赖 |
| `brew link <pkg>` | 符号链接 |
| `brew unlink <pkg>` | 取消链接 |
| `brew update-reset` | 重置 Git 仓库 |

### 高级

| 命令 | 说明 |
|------|------|
| `brew tap <user/repo>` | 添加第三方 tap |
| `brew untap <user/repo>` | 移除 tap |
| `brew tap-info` | tap 信息 |
| `brew services list` | 服务列表 |
| `brew services start/stop/restart <svc>` | 服务控制 |
| `brew bundle dump` | 生成 Brewfile |
| `brew bundle install` | 从 Brewfile 安装 |
| `brew edit <pkg>` | 编辑 formula |
| `brew create <url>` | 新建 formula |
| `brew --prefix` | 显示 prefix |
| `brew --cellar` | 显示 Cellar |
| `brew --cache` | 显示缓存路径 |
| `brew config` | 显示配置 |
| `brew --env` | 显示环境变量 |
| `brew commands` | 列出所有命令 |
| `brew analytics` | 分析控制 |

---

## 16. 注意事项与陷阱

1. **不要用 sudo**：Homebrew 设计为不需要 root 权限。如果遇到权限问题，用 `sudo chown -R $(whoami) $(brew --prefix)` 修复。

2. **Apple Silicon 路径是 `/opt/homebrew`**：与 Intel Mac 的 `/usr/local` 不同。脚本中避免硬编码路径，用 `brew --prefix` 获取。

3. **keg-only 的包不会自动符号链接**：如 `node@22`、`openssl@3`。需手动 `brew link` 或使用完整路径 `/opt/homebrew/opt/<pkg>/bin/...`。

4. **brew update 在命令前自动运行**：如果觉得慢，设 `HOMEBREW_NO_AUTO_UPDATE=1`，或调大 `HOMEBREW_AUTO_UPDATE_SECS`。

5. **bottle 可能不支持旧 macOS**：在太旧的系统上可能需要源码编译（`brew install -s pkg`）。

6. **`brew link --overwrite` 是危险的**：会覆盖已存在的文件。只在确认不会破坏系统时使用。

7. **formula 版本锁定用 pin 而非手动改链接**：`brew pin node@22` 防止 `brew upgrade` 自动升级。

8. **Brewfile 中的依赖顺序无关**：`brew bundle` 会自动解析依赖关系，不需要手动排序。

9. **第三方 tap 的包不受 Homebrew CI 验证**：质量参差不齐，优先用 `homebrew/core` 中的包。

10. **cask 安装的 GUI 应用通常自带自动更新**：如 Chrome、VS Code。可用 `brew upgrade --cask --greedy` 也行，但可能与应用内更新冲突。

11. **`brew cleanup` 保留最新版本**：默认只删除旧版本。查看可清理的内容：`brew cleanup --dry-run`。

12. **Homebrew 5.x 的 formula 使用 JSON API**：不再需要本地 clone `homebrew/core` Git 仓库，大大减少 `brew update` 时间。
