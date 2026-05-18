# pnpm —— 高性能、节省磁盘的 Node.js 包管理器

> Fast, disk space efficient package manager. 使用内容寻址存储 + 硬链接，消除 `node_modules` 冗余。
> 版本：10.33.0（本机 Homebrew 安装）
> 官网：[pnpm.io](https://pnpm.io) · GitHub：[github.com/pnpm/pnpm](https://github.com/pnpm/pnpm)

---

## 目录

1. [安装](#1-安装)
2. [pnpm vs npm vs yarn 深度对比](#2-pnpm-vs-npm-vs-yarn-深度对比)
3. [核心命令](#3-核心命令)
4. [依赖管理高级操作](#4-依赖管理高级操作)
5. [运行脚本与 dlx](#5-运行脚本与-dlx)
6. [审核与检查](#6-审核与检查)
7. [Monorepo 配置](#7-monorepo-配置)
8. [Workspace 协议](#8-workspace-协议)
9. [Catalogs（统一版本）](#9-catalogs统一版本)
10. [过滤（Filter）](#10-过滤filter)
11. [实用配置](#11-实用配置)
12. [实战：从零搭建 pnpm Monorepo](#12-实战从零搭建-pnpm-monorepo)
13. [常用命令速查表](#13-常用命令速查表)
14. [注意事项与陷阱](#14-注意事项与陷阱)

---

## 1. 安装

```bash
# macOS Homebrew（本机安装方式）
brew install pnpm

# npm（使用现有 Node.js）
npm install -g pnpm

# 官方安装脚本（macOS / Linux）
curl -fsSL https://get.pnpm.io/install.sh | sh -

# Corepack（Node.js 16+ 内置）
corepack enable pnpm
corepack prepare pnpm@latest --activate

# Windows (PowerShell)
iwr https://get.pnpm.io/install.ps1 -useb | iex

# 验证
pnpm --version
# 10.33.0
```

---

## 2. pnpm vs npm vs yarn 深度对比

### 2.1 核心架构差异

```
npm (扁平 node_modules)          yarn (扁平 node_modules)         pnpm (硬链接 + 符号链接)
─────────────────────────        ─────────────────────────        ──────────────────────────
node_modules/                    node_modules/                    node_modules/
├── express/     ← 完整副本       ├── express/     ← 完整副本       ├── express → .pnpm/e@4.x/   ← 符号链接
├── lodash/      ← 重复副本       ├── lodash/      ← 重复副本       ├── .pnpm/                   ← 虚拟存储
├── debug/       ← 幽灵依赖       ├── debug/       ← 幽灵依赖       │   ├── express@4.x/
│   ...                          │   ...                          │   │   └── node_modules/
└── node_modules/                └── node_modules/                │   │       └── debug → ../../../d@4.x/  ← 硬链接指向全局 store
    └── ...      ← 深层嵌套           └── ...      ← 扁平          │   ├── lodash@4.17.21/       ← 硬链接指向全局 store
                                                                  │   └── debug@4.x/            ← 硬链接指向全局 store
每个项目独立存储完整副本            每个项目独立存储完整副本         ┌── 全局 Content-Addressable Store ──┐
→ 磁盘占用大                      → 磁盘占用大                    │  ~/.pnpm-store/v3/                  │
→ 幽灵依赖问题                    → 幽灵依赖问题                  │  每个包每个版本只存一次             │
→ 安装慢                         → 安装快（并行）                └──────────────────────────────────┘
                                                                  → 磁盘占用极小（跨项目共享）
                                                                  → 无幽灵依赖（严格隔离）
                                                                  → 安装极快（只需建链接）
```

### 2.2 性能数据对比

**典型中大型项目（真实 benchmark）**：

| 指标 | pnpm | yarn v1 | npm |
|------|------|---------|-----|
| **冷安装速度** | 12s | 19s | 24s |
| **热安装速度** | 2s | 3s | 5s |
| **Monorepo 磁盘占用** | 320MB | 480MB | 550MB |
| **内存消耗（安装时）** | 180MB | 160MB | 210MB |
| **幽灵依赖** | ❌ 无 | ⚠️ 有 | ⚠️ 有 |
| **依赖分身** | ❌ 无 | ⚠️ 有 | ⚠️ 有 |

### 2.3 特性矩阵

| 特性 | pnpm | npm | yarn v1 | yarn Berry |
|------|------|-----|---------|------------|
| Lockfile | `pnpm-lock.yaml` | `package-lock.json` | `yarn.lock` | `yarn.lock` |
| Workspaces | ✅ 原生优秀 | ✅ v7+ 功能弱 | ✅ 成熟 | ✅ 支持 |
| 严格依赖隔离 | ✅ 默认 | ❌ | ❌ | ✅ (PnP) |
| 内容寻址存储 | ✅ | ❌ | ❌ | ✅ (PnP) |
| 安装速度 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| 磁盘效率 | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ |
| Plug'n'Play | ❌ | ❌ | ❌ | ✅ |
| 离线模式 | ✅ | ⚠️ 有限 | ✅ | ✅ |
| Node.js 版本管理 | ✅ 内置 | ❌ | ❌ | ❌ |
| 生态兼容性 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| Catalogs | ✅ | ❌ | ❌ | ❌ |
| `overrides` | ✅ | ✅ | ✅ (resolutions) | ✅ |
| patch 依赖 | ✅ | ❌ | ❌ | ✅ |

### 2.4 何时选择哪个

| 场景 | 推荐 | 原因 |
|------|------|------|
| 新项目 | **pnpm** | 最佳性能/空间效率/严格依赖 |
| Monorepo | **pnpm** | 原生 Catalogs、Workspace 协议、过滤命令 |
| 最大兼容性 | **npm** | Node.js 内置，零额外依赖 |
| 使用 PnP | **yarn Berry** | 唯一成熟的 PnP 实现 |
| 旧项目已有 yarn.lock | **yarn v1** | 避免迁移成本 |

---

## 3. 核心命令

### 3.1 安装依赖

```bash
# 安装所有依赖
pnpm install
pnpm i              # 简写

# 安装为生产依赖（默认）
pnpm add lodash
pnpm add lodash@4.17.21

# 安装为开发依赖
pnpm add -D typescript @types/node
pnpm add --save-dev vitest

# 安装为全局依赖
pnpm add -g pnpm
pnpm add -g typescript ts-node

# 安装为可选依赖
pnpm add -O chokidar

# 从 workspace 安装
pnpm add -w eslint       # 安装到 workspace 根

# production 模式（跳过 devDependencies）
pnpm install --prod
NODE_ENV=production pnpm install
```

### 3.2 更新与删除

```bash
# 交互式更新（推荐）
pnpm update -i
pnpm update -i -L          # 包含最新版本（忽略 semver）

# 更新所有依赖到最新 semver 范围
pnpm update
pnpm up

# 更新特定包
pnpm up lodash react

# 更新到 latest
pnpm up --latest
pnpm up -L

# 删除依赖
pnpm remove lodash
pnpm rm lodash
pnpm uninstall lodash

# 删除后自动从 package.json 移除
pnpm rm lodash       # 同时删除 node_modules + package.json 条目
```

### 3.3 安装选项

```bash
# 忽略 scripts（安全/快速）
pnpm install --ignore-scripts

# 无 frozen lockfile（允许更新 lockfile）
pnpm install --no-frozen-lockfile

# 严格模式（CI 推荐）
pnpm install --frozen-lockfile
# 如果 pnpm-lock.yaml 与 package.json 不匹配，安装失败而非自动更新

# 离线模式
pnpm install --offline

# 首选离线
pnpm install --prefer-offline

# 强制重新下载
pnpm install --force
```

---

## 4. 依赖管理高级操作

### 4.1 链接本地包

```bash
# 将本地包链接到当前项目
pnpm link ../my-local-package

# 全局链接（先在该包中运行）
cd ~/dev/my-library
pnpm link --global
# 然后在目标项目
cd ~/dev/my-project
pnpm link --global my-library

# 取消链接
pnpm unlink my-library
```

### 4.2 pnpm patch（修改依赖源码）

```bash
# 创建 patch
pnpm patch lodash@4.17.21
# → 在临时目录中打开 lodash 源码让你编辑
# 编辑完成后：
pnpm patch-commit /tmp/user/.../lodash
# → 在 package.json 中生成 pnpm.patchedDependencies 条目

# package.json 结果：
# "pnpm": {
#   "patchedDependencies": {
#     "lodash@4.17.21": "patches/lodash@4.17.21.patch"
#   }
# }

# 此后每次 pnpm install 自动应用 patch
```

### 4.3 overrides（覆盖依赖版本）

```json
// package.json
{
  "pnpm": {
    "overrides": {
      "lodash": "4.17.21",
      "react": "$react",                    // 使用项目中安装的 react 版本
      "bar>chalk": "5.0.0"                  // 只覆盖 bar 下的 chalk
    }
  }
}
```

### 4.4 别名导入

```bash
# 用别名安装包
pnpm add my-react@npm:react@18.2.0
# package.json: "my-react": "npm:react@18.2.0"
# import React from 'my-react'
```

### 4.5 仓库导入

```bash
# 从 Git 安装
pnpm add github:user/repo
pnpm add git+https://github.com/user/repo.git#branch

# 从本地 tarball
pnpm add ./my-package-1.0.0.tgz
```

---

## 5. 运行脚本与 dlx

### 5.1 运行脚本

```bash
# 运行 package.json scripts
pnpm run dev
pnpm dev               # 简写（对非冲突命令名有效）
pnpm run build

# 传递参数
pnpm run test -- --watch

# 列出所有脚本
pnpm run

# 顺序运行多个
pnpm run /^lint:.*/     # 运行所有以 lint: 开头的脚本

# 并行运行多个
pnpm --parallel -r run build
```

### 5.2 dlx（等价 npx）

```bash
# 临时执行一个包（不安装到项目）
pnpm dlx create-react-app my-app
pnpm dlx tsx script.ts
pnpm dlx prisma init

# 等价于
pnpm create react-app my-app
pnpm create next-app my-site --typescript
```

### 5.3 exec

```bash
# 在项目上下文中执行 shell 命令
pnpm exec eslint .
pnpm exec ts-node script.ts
```

---

## 6. 审核与检查

### 6.1 audit（安全审计）

```bash
# 检查安全漏洞
pnpm audit

# JSON 输出
pnpm audit --json

# 只检查生产依赖
pnpm audit --prod

# 只检查特定级别
pnpm audit --audit-level high
# low / moderate / high / critical

# 自动修复（谨慎使用）
pnpm audit --fix
```

### 6.2 outdated（检查过期）

```bash
# 检查过期依赖
pnpm outdated

# 更详细
pnpm outdated --long

# JSON 格式
pnpm outdated --json

# 全局包
pnpm outdated -g
```

### 6.3 list / why

```bash
# 列出依赖树
pnpm list
pnpm ls
pnpm ls --depth 2       # 限制深度

# 查看为什么安装了某个包
pnpm why lodash
pnpm why -r lodash       # workspace 递归
```

### 6.4 store（全局存储管理）

```bash
# 查看 store 路径
pnpm store path
# ~/.pnpm-store/v3

# 查看 store 大小
pnpm store status

# 清理未引用的包（回收空间）
pnpm store prune

# 验证 store 完整性
pnpm store verify
```

---

## 7. Monorepo 配置

### 7.1 pnpm-workspace.yaml

```yaml
# pnpm-workspace.yaml（放置于仓库根目录）

packages:
  # 直接子目录中的包
  - 'apps/*'

  # packages/ 子目录中的所有包
  - 'packages/*'

  # components/ 任意深度子目录的所有包
  - 'components/**'

  # 排除测试目录
  - '!**/test/**'

  # 排除示例目录
  - '!**/examples/**'
```

**典型的目录结构**：

```
my-monorepo/
├── pnpm-workspace.yaml      ← workspace 定义
├── package.json              ← root package（private: true）
├── pnpm-lock.yaml            ← 统一的 lockfile
├── .npmrc                    ← 项目级 pnpm 配置
│
├── apps/
│   ├── web/                  ← Next.js app
│   │   └── package.json
│   └── api/                  ← Express API
│       └── package.json
│
├── packages/
│   ├── ui/                   ← 共享 UI 组件库
│   │   └── package.json
│   ├── utils/                ← 共享工具函数
│   │   └── package.json
│   ├── types/                ← 共享 TypeScript 类型
│   │   └── package.json
│   ├── eslint-config/        ← 共享 ESLint 配置
│   │   └── package.json
│   └── tsconfig/             ← 共享 tsconfig
│       └── package.json
│
└── tools/                    ← 内部工具
    └── scripts/
        └── package.json
```

### 7.2 Root package.json

```json
{
  "name": "my-monorepo",
  "private": true,
  "scripts": {
    "dev": "pnpm --parallel -r run dev",
    "build": "pnpm -r run build",
    "lint": "pnpm -r run lint",
    "test": "pnpm -r run test",
    "clean": "pnpm -r exec rm -rf dist node_modules",
    "typecheck": "pnpm -r run typecheck"
  },
  "devDependencies": {
    "turbo": "^2.0.0",
    "typescript": "^5.5.0"
  },
  "engines": {
    "node": ">=18",
    "pnpm": ">=10"
  },
  "packageManager": "pnpm@10.33.0"
}
```

### 7.3 跨包依赖声明

```json
// apps/web/package.json
{
  "name": "@myorg/web",
  "dependencies": {
    "@myorg/ui": "workspace:*",       // 引用 workspace 包（发布时自动替换为版本号）
    "@myorg/utils": "workspace:^",
    "react": "catalog:"               // 使用 catalog 中定义的版本
  }
}
```

```json
// packages/ui/package.json
{
  "name": "@myorg/ui",
  "version": "0.1.0",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "dependencies": {
    "@myorg/utils": "workspace:*"
  },
  "peerDependencies": {
    "react": "catalog:"
  }
}
```

### 7.4 Workspace 命令

```bash
# 在所有 workspace 包中执行命令
pnpm -r run build              # 递归执行 build
pnpm --recursive run lint

# 并行执行
pnpm --parallel -r run dev

# 按拓扑顺序执行
pnpm -r --filter "./packages/**" run build
# 按依赖顺序（被依赖的先构建）

# 列出 workspace 包
pnpm list -r --depth 0
pnpm ls -r --depth 0 --json

# 对 workspace 添加依赖
pnpm add -w turbo              # 添加到 root
pnpm add react --filter @myorg/web   # 添加到特定包
```

---

## 8. Workspace 协议

用于声明依赖为 workspace 内部包，防止意外从 npm registry 安装。

### 8.1 协议语法

```json
{
  "dependencies": {
    // 任意版本（发布时替换为精确版本）
    "@myorg/ui": "workspace:*",
    // → 发布后变成："@myorg/ui": "1.5.0"

    // 语义化版本范围
    "@myorg/utils": "workspace:^",
    // → 发布后变成："@myorg/utils": "^1.5.0"

    "@myorg/types": "workspace:~",
    // → 发布后变成："@myorg/types": "~1.5.0"

    // 精确版本范围
    "@myorg/api": "workspace:^1.5.0",
    // → 发布后保持："@myorg/api": "^1.5.0"

    // 特定版本
    "@myorg/old": "workspace:1.2.3",
    // → 发布后保持："@myorg/old": "1.2.3"
  }
}
```

### 8.2 别名引用

```json
{
  "dependencies": {
    // 以别名引用 workspace 包
    "legacy-ui": "workspace:@myorg/ui@*"
    // → 发布后变成："legacy-ui": "npm:@myorg/ui@1.5.0"
  }
}
```

### 8.3 相对路径引用

```json
{
  "dependencies": {
    // 通过相对路径引用（适用于非标准布局）
    "@myorg/ui": "workspace:../packages/ui"
  }
}
```

### 8.4 linkWorkspacePackages 策略

```bash
# 在 .npmrc 中设置
# true（默认）：自动链接符合 semver 的 workspace 包
# false：只有显式使用 workspace: 协议的才链接
link-workspace-packages=true
```

---

## 9. Catalogs（统一版本）

Catalogs 是 pnpm 10.x 的特性，在 `pnpm-workspace.yaml` 中集中管理依赖版本。

### 9.1 基础 Catalog

```yaml
# pnpm-workspace.yaml
packages:
  - 'apps/*'
  - 'packages/*'

catalog:
  # 单个 catalog（等价于 catalog: default）
  react: ^19.0.0
  react-dom: ^19.0.0
  typescript: ^5.5.0
  next: ^15.0.0
  vite: ^6.0.0
```

在 package.json 中使用：

```json
{
  "dependencies": {
    "react": "catalog:",
    "react-dom": "catalog:",
    "next": "catalog:"
  },
  "devDependencies": {
    "typescript": "catalog:"
  }
}
```

### 9.2 命名 Catalogs

```yaml
# pnpm-workspace.yaml
packages:
  - 'apps/*'
  - 'packages/*'

catalogs:
  # 默认 catalog
  default:
    typescript: ^5.5.0
    prettier: ^3.3.0

  # React 18 版本组
  react18:
    react: ^18.3.0
    react-dom: ^18.3.0
    '@types/react': ^18.3.0
    '@types/react-dom': ^18.3.0

  # React 19 版本组
  react19:
    react: ^19.0.0
    react-dom: ^19.0.0
    '@types/react': ^19.0.0
    '@types/react-dom': ^19.0.0

  # 工具链
  tooling:
    eslint: ^9.0.0
    vite: ^6.0.0
    vitest: ^3.0.0
```

```json
// packages/legacy-app/package.json
{
  "dependencies": {
    "react": "catalog:react18",
    "react-dom": "catalog:react18"
  }
}

// apps/new-app/package.json
{
  "dependencies": {
    "react": "catalog:react19",
    "react-dom": "catalog:react19"
  }
}
```

### 9.3 Catalog 的优势

- **单一事实来源**：所有包的版本在一个文件中管理
- **批量升级**：修改 yaml 一个值，所有使用 `catalog:` 的包同步升级
- **版本分组**：命名 catalog 实现不同策略的版本组
- **对齐工具链**：确保所有包的 ESLint / TypeScript / Vite 版本一致

---

## 10. 过滤（Filter）

pnpm 提供强大的 `--filter` 选项，选择性操作 workspace 中的包。

```bash
# 语法
pnpm <command> --filter <selector>
pnpm <command> -F <selector>
```

### 10.1 按包名过滤

```bash
# 精确匹配
pnpm -F @myorg/web build
pnpm -F "@myorg/*" build            # 所有 @myorg scope 下的包

# 通配符
pnpm -F "*utils*" build             # 名称包含 "utils"
pnpm -F "@myorg/ui*" build          # @myorg 下 ui 开头的包

# 多选
pnpm -F @myorg/web -F @myorg/api build
```

### 10.2 按依赖关系过滤

```bash
# 包 + 其所有依赖（依赖树向下）
pnpm -F @myorg/web... build
# 构建 web 及 web 依赖的所有包

# 包 + 其所有被依赖者（依赖树向上）
pnpm -F ...@myorg/utils build
# 构建所有依赖 utils 的包（+ utils 本身）

# 包的自依赖（不含被依赖者）
pnpm -F "@myorg/web^..." build
# 构建 web 及其依赖，但不构建依赖 web 的包

# 排除特定包
pnpm -F "@myorg/*" --! @myorg/legacy build
```

### 10.3 按目录过滤

```bash
# 按路径
pnpm -F "./packages/*" build
pnpm -F "{packages,apps}/**" build

# 按变更（需要 git）
pnpm -F "[origin/main]" build       # 自 main 分支以来变更的包
pnpm -F "[HEAD~1]" build            # 自上一个 commit 以来变更的包
```

### 10.4 常用过滤组合

```bash
# CI 中只构建变更影响的包
pnpm -F "...[origin/main]" build

# 运行所有包的 lint
pnpm -r lint

# 只构建某个 app 及其依赖
pnpm -F "@myorg/web..." build

# 测试被某个库变更影响的所有消费者
pnpm -F "...@myorg/utils" test

# 按拓扑顺序执行（确保依赖先构建）
pnpm -r --topological build
```

---

## 11. 实用配置

### 11.1 .npmrc 常用配置

```ini
# ~/.npmrc 或 项目 .npmrc

# 严格的 peer dependencies
strict-peer-dependencies=true

# 自动安装 peers
auto-install-peers=true

# 使用 workspace 链接
link-workspace-packages=true

# 忽略 workspace root 的检查（root 不需要私有）
ignore-workspace-root-check=false

# 提升（shamefully-hoist）所有依赖到根 node_modules
# 默认 false，只有需要兼容老旧工具时开启
shamefully-hoist=false

# 公共提升模式（提升指定包）
public-hoist-pattern[]=*types*
public-hoist-pattern[]=*eslint*

# Node.js 版本管理
use-node-version=20.11.0

# 存储路径
store-dir=~/.pnpm-store/v3

# 注册源
registry=https://registry.npmjs.org

# shell 模拟器（win32 用）
script-shell=bash
```

### 11.2 package.json 字段

```json
{
  "packageManager": "pnpm@10.33.0",     // 强制 pnpm 版本（Corepack）
  "engines": {
    "node": ">=18",
    "pnpm": ">=10"
  },
  "pnpm": {
    "overrides": {
      "lodash": "4.17.21"
    },
    "patchedDependencies": {
      "lodash@4.17.21": "patches/lodash@4.17.21.patch"
    },
    "onlyBuiltDependencies": ["sharp", "esbuild"]
  }
}
```

### 11.3 交互式命令

```bash
# 交互式更新依赖
pnpm update -i

# 交互式升级到最新
pnpm update -i -L
```

---

## 12. 实战：从零搭建 pnpm Monorepo

### 12.1 初始化

```bash
# 1. 创建目录
mkdir my-monorepo && cd my-monorepo

# 2. 初始化 root
pnpm init
# 修改 package.json → "private": true

# 3. 设置 pnpm 版本
echo 'packageManager: pnpm@10.33.0' >> package.json

# 4. 配置 workspace
cat > pnpm-workspace.yaml << 'EOF'
packages:
  - 'apps/*'
  - 'packages/*'
  - 'tools/*'

catalog:
  typescript: ^5.5.0

catalogs:
  react19:
    react: ^19.0.0
    react-dom: ^19.0.0
    '@types/react': ^19.0.0
    '@types/react-dom': ^19.0.0
EOF

# 5. 创建目录结构
mkdir -p apps/web apps/api
mkdir -p packages/ui packages/utils packages/types
mkdir -p packages/eslint-config packages/tsconfig
mkdir -p tools/scripts

# 6. 创建 .npmrc
cat > .npmrc << 'EOF'
strict-peer-dependencies=false
auto-install-peers=true
link-workspace-packages=deep
EOF

# 7. 初始化各子包
cd packages/utils && pnpm init && cd ../..
cd packages/types && pnpm init && cd ../..
cd packages/ui && pnpm init && cd ../..
cd packages/eslint-config && pnpm init && cd ../..
cd packages/tsconfig && pnpm init && cd ../..
cd apps/web && pnpm init && cd ../..
cd apps/api && pnpm init && cd ../..
cd tools/scripts && pnpm init && cd ../..
```

### 12.2 设置子包 name 和依赖

```bash
# 设置 scoped 名称
for dir in packages/*/ apps/*/ tools/*/; do
  cd "$dir"
  npm pkg set name="@myorg/$(basename $dir)"
  npm pkg set version="0.0.1"
  cd - > /dev/null
done
```

### 12.3 安装共享依赖

```bash
# root 级别工具
pnpm add -w turbo typescript @types/node

# packages/utils 工具依赖
pnpm add -F @myorg/utils lodash
pnpm add -F @myorg/utils -D vitest

# packages/ui 组件库
pnpm add -F @myorg/ui react catalog:react19
pnpm add -F @myorg/ui @myorg/utils@workspace:* @myorg/types@workspace:*

# apps/web 安装 Next.js
pnpm add -F @myorg/web next catalog:react19
pnpm add -F @myorg/web @myorg/ui@workspace:* @myorg/utils@workspace:*

# apps/api Express
pnpm add -F @myorg/api express
pnpm add -F @myorg/api -D @types/express
```

### 12.4 添加 turbo.json（可选但推荐）

```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": [".env"],
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^build"]
    },
    "test": {
      "dependsOn": ["build"]
    },
    "typecheck": {
      "dependsOn": ["^build"]
    }
  }
}
```

### 12.5 日常命令

```bash
# 所有包安装依赖
pnpm install

# 开发模式（并行启动所有 dev server）
pnpm -r --parallel run dev

# 构建
pnpm run build                 # turbo 构建（推荐）
pnpm -r run build              # 递归构建

# 添加依赖给特定包
pnpm add -F @myorg/web zod

# 升级所有 catalog 中的 react19
# 1. 修改 pnpm-workspace.yaml 中 react19 的版本
# 2. pnpm install  # 自动更新 lockfile

# 发布 workspace 包
pnpm -r publish --access public
```

### 12.6 CI/CD 配置

```yaml
# .github/workflows/ci.yml
steps:
  - uses: actions/checkout@v4

  - uses: pnpm/action-setup@v4
    with:
      version: 10

  - uses: actions/setup-node@v4
    with:
      node-version: 20
      cache: 'pnpm'

  - run: pnpm install --frozen-lockfile

  - run: pnpm run build

  - run: pnpm run lint

  - run: pnpm run test
```

---

## 13. 常用命令速查表

### 依赖管理

| 命令 | 说明 |
|------|------|
| `pnpm install` / `pnpm i` | 安装所有依赖 |
| `pnpm add <pkg>` | 添加生产依赖 |
| `pnpm add -D <pkg>` | 添加开发依赖 |
| `pnpm add -g <pkg>` | 全局安装 |
| `pnpm add -O <pkg>` | 可选依赖 |
| `pnpm add -w <pkg>` | 安装到 workspace root |
| `pnpm add <pkg> -F <target>` | 安装到指定 workspace 包 |
| `pnpm update` / `pnpm up` | 更新依赖 |
| `pnpm update -i` | 交互式更新 |
| `pnpm update --latest` | 更新到 latest |
| `pnpm remove <pkg>` / `pnpm rm` | 删除依赖 |
| `pnpm install --frozen-lockfile` | CI 严格安装 |
| `pnpm install --prod` | 只安装生产依赖 |

### 工作区操作

| 命令 | 说明 |
|------|------|
| `pnpm -r run <script>` | 递归运行脚本 |
| `pnpm --parallel -r run <script>` | 并行运行 |
| `pnpm -r list --depth 0` | 列出所有 workspace 包 |
| `pnpm -F <filter> <cmd>` | 过滤执行 |
| `pnpm -F <pkg>... <cmd>` | 包及其依赖 |
| `pnpm -F ...<pkg> <cmd>` | 依赖该包的所有包 |
| `pnpm -F "[origin/main]" <cmd>` | 变更包 |
| `pnpm -r exec <cmd>` | 在每个包中执行 shell 命令 |

### 检查与审计

| 命令 | 说明 |
|------|------|
| `pnpm audit` | 安全审计 |
| `pnpm outdated` | 过期检查 |
| `pnpm list` / `pnpm ls` | 列出依赖 |
| `pnpm why <pkg>` | 查看依赖原因 |
| `pnpm store path` | 查看 store 路径 |
| `pnpm store prune` | 清理 store |
| `pnpm store status` | store 状态 |

### 运行与工具

| 命令 | 说明 |
|------|------|
| `pnpm run <script>` | 运行脚本 |
| `pnpm dlx <cmd>` | 临时执行（等价 npx） |
| `pnpm create <template>` | 快速创建项目 |
| `pnpm exec <cmd>` | 项目上下文执行 |
| `pnpm link` | 链接本地包 |
| `pnpm patch <pkg>` | 修改依赖源码 |
| `pnpm patch-commit <path>` | 提交 patch |

### 配置

| 命令 | 说明 |
|------|------|
| `pnpm config list` | 列出配置 |
| `pnpm config get <key>` | 获取配置 |
| `pnpm config set <key> <val>` | 设置配置 |
| `pnpm self-update` | 更新 pnpm 本身 |

---

## 14. 注意事项与陷阱

1. **幽灵依赖不再可用**：pnpm 严格隔离，`require('debug')` 会失败除非 `debug` 在 `package.json` 中显式声明。如果老旧代码依赖幽灵依赖，用 `pnpm why <pkg>` 找到实际使用者后添加。

2. **shamefully-hoist 不应滥用**：`shamefully-hoist=true` 把依赖提升到根 `node_modules`，解决兼容问题但破坏严格隔离。仅在工具链不支持 pnpm 的临时方案中使用。

3. **Electron / React Native 注意**：某些原生模块或打包工具可能不完全兼容 pnpm 的符号链接结构，需要 `public-hoist-pattern` 或 `shamefully-hoist` 辅助。

4. **`strict-peer-dependencies` 可能很吵**：设为 `true` 后未满足的 peer dependency 会阻止安装。新项目推荐开启，旧项目迁移时可暂时关闭。

5. **`pnpm-lock.yaml` 是唯一真相**：提交到 Git。合并冲突时可以用 `pnpm install --no-frozen-lockfile` 重置。

6. **Corepack 管理 pnpm 版本**：在 `package.json` 中设置 `"packageManager": "pnpm@10.33.0"` 后，运行 `corepack enable` 可自动使用正确版本。

7. **Catalogs 是 10.x 特性**：旧版 pnpm 不支持 catalog，需要使用 `overrides` 或手动管理。

8. **`workspace:*` 发布时自动替换**：本地开发时 `workspace:*` 引用本地包，`pnpm publish` 时自动替换为实际版本号。如果发布后仍有 `workspace:` 残留，检查是否使用了非标准的 publish 流程。

9. **`-r` 和 `--filter` 的组合顺序**：`pnpm -r --filter @myorg/web build` 的 `-r` 可能多余，`-F` 已经限定了范围。直接用 `pnpm -F @myorg/web build` 即可。

10. **多个 workspace 包共享 devServer 端口**：`pnpm -r --parallel run dev` 并行启动多个 dev server，确保它们配置了不同的端口。

11. **pnpm overrides vs npm overrides**：pnpm 的 overrides 语法比 npm 更强大，支持 `$pkgname` 引用。但格式与 npm/yarn 不完全兼容，迁移时需调整。

12. **Store 路径跨项目共享**：默认 `~/.pnpm-store/v3` 在所有项目间共享，这是 pnpm 磁盘效率的核心。可以用 `store-dir` 配置项自定义路径。
