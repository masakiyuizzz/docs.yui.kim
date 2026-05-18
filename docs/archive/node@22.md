# node@22 —— Node.js 22 LTS

> JavaScript 运行时。V8 12.4 + libuv 1.51。首批内置 WebSocket 客户端、require(ESM)、`glob()`、Maglev 编译器的版本。
> 代码名 "Jod"，LTS 至 2027 年 4 月。
> 版本：22.22.3（本机 Homebrew keg-only 安装），npm 11.6.2
> 官网：[nodejs.org](https://nodejs.org) · API：[nodejs.org/docs/latest-v22.x/api](https://nodejs.org/docs/latest-v22.x/api/)

---

## 目录

1. [安装与多版本管理](#1-安装与多版本管理)
2. [Node.js 22 新特性](#2-nodejs-22-新特性)
    - [require() 加载 ESM](#21-require-加载-esm)
    - [WebSocket 客户端](#22-websocket-客户端)
    - [fs.glob / fs.globSync](#23-fsglob--fsglobsync)
    - [node --run](#24-node---run)
    - [node --watch 稳定化](#25-node---watch-稳定化)
    - [V8 12.4 新语言特性](#26-v8-124-新语言特性)
    - [Maglev 即时编译器](#27-maglev-即时编译器)
    - [Stream highWaterMark 提升](#28-stream-highwatermark-提升)
    - [AbortSignal 性能优化](#29-abortsignal-性能优化)
3. [node CLI 命令与选项](#3-node-cli-命令与选项)
4. [npm 核心命令速览](#4-npm-核心命令速览)
5. [Node.js 版本管理与 LTS 路线图](#5-nodejs-版本管理与-lts-路线图)
6. [核心模块速查](#6-核心模块速查)
7. [实战示例](#7-实战示例)
8. [注意事项与陷阱](#8-注意事项与陷阱)

---

## 1. 安装与多版本管理

### 1.1 本机 Homebrew 安装

```bash
# 安装 Node.js 22
brew install node@22

# 由于已安装其他版本，node@22 标记为 keg-only
# 不会自动链接到 /usr/local/bin
# 路径：
ls /opt/homebrew/opt/node@22/bin/
# node  npm  npx  corepack
```

### 1.2 使用 Homebrew 版本

```bash
# 方式一：用完整路径
/opt/homebrew/opt/node@22/bin/node script.js

# 方式二：临时添加到 PATH 最前面
export PATH="/opt/homebrew/opt/node@22/bin:$PATH"
node --version  # v22.22.3

# 方式三：brew link（会覆盖 PATH 中其他版本）
brew link --overwrite --force node@22
node --version  # v22.22.3
# 用完切回
brew unlink node@22
```

### 1.3 本机版本环境信息

| 组件 | 版本 |
|------|------|
| Node.js | 22.22.3 (Homebrew) |
| npm | 11.6.2 |
| libuv | 1.51.0 |
| OpenSSL | 3.5.4 |
| V8 系列 | 12.4 ~ 12.7 |
| zlib | 1.3.1 |
| 依赖 | brotli, c-ares, icu4c, libnghttp2/3, simdjson, sqlite, zstd |

---

## 2. Node.js 22 新特性

### 2.1 require() 加载 ESM

Node.js 22 最大的变化之一：CommonJS 代码可以直接 `require()` 同步 ESM 模块。

```js
// ===== ESM 模块 (lib.mjs) =====
export const greeting = 'Hello'
export function sayHi(name) {
  return `${greeting}, ${name}!`
}
export default { greeting, sayHi }

// ===== CommonJS 模块 (app.cjs) =====
const { greeting, sayHi } = require('./lib.mjs')
console.log(sayHi('World'))  // Hello, World!

// 默认导出通过 .default 访问
const lib = require('./lib.mjs')
console.log(lib.default.greeting)  // Hello
```

**条件限制**：
- ESM 模块**不能**包含 top-level await
- 必须是完全同步的模块图
- Node 22.12.0 起默认启用，早期 22.x 需 `--experimental-require-module`

```js
// ❌ 这不行（top-level await）
// async-lib.mjs
const data = await fetch('https://api.example.com/config')
export const config = data
// require('./async-lib.mjs') → ERR_REQUIRE_ASYNC_MODULE
```

### 2.2 WebSocket 客户端

浏览器兼容的 WebSocket API 直接内置，无需 `ws` 库。

```js
const ws = new WebSocket('wss://echo.websocket.org')

ws.addEventListener('open', () => {
  console.log('已连接')
  ws.send('Hello WebSocket!')
})

ws.addEventListener('message', (event) => {
  console.log('收到:', event.data)
})

ws.addEventListener('close', (event) => {
  console.log('已关闭:', event.code, event.reason)
})

ws.addEventListener('error', (error) => {
  console.error('错误:', error.message)
})
```

> 注意：内置 WebSocket 是**客户端**实现。作为 WebSocket **服务器**仍需 `ws` 库的 `WebSocketServer`。

### 2.3 fs.glob / fs.globSync

原生文件模式匹配，不再需要 `glob` npm 包。

```js
import { glob, globSync } from 'node:fs'

// 异步匹配（返回 AsyncIterator）
for await (const path of glob('src/**/*.ts')) {
  console.log(path)
}

// 一次性收集
const files = await Array.fromAsync(glob('**/*.{js,ts}'))

// 同步版本
const filesSync = globSync('*.json', {
  exclude: ['node_modules/**'],
})

// 高级用法：自定义排除 + Dirent
for await (const entry of glob('**/*', {
  exclude: (path) => path.includes('node_modules'),
  withFileTypes: true,
})) {
  const type = entry.isDirectory() ? '📁' : '📄'
  console.log(`${type} ${entry.name}`)
}
```

### 2.4 node --run

直接运行 `package.json` 脚本，比 `npm run` 更快（跳过 npm 开销）。

```bash
node --run dev
node --run build
node --run test

# 传递参数
node --run test -- --watch --coverage
```

| 特性 | `node --run` | `npm run` |
|------|-------------|-----------|
| 启动速度 | ⚡ 极快 | 🐢 较慢 |
| pre/post 脚本 | ❌ 不执行 | ✅ 自动执行 |
| lifecycle hooks | ❌ | ✅ |
| 适用 | 快速开发迭代 | CI/CD、完整构建 |

### 2.5 node --watch 稳定化

文件变动自动重启，0 依赖替代 nodemon。

```bash
node --watch server.js
node --watch-path=src --watch-path=config server.js
node --watch --run dev
```

### 2.6 V8 12.4 新语言特性

**Set 方法**：

```js
const a = new Set([1, 2, 3, 4])
const b = new Set([3, 4, 5, 6])

a.union(b)              // Set {1,2,3,4,5,6}
a.intersection(b)       // Set {3,4}
a.difference(b)         // Set {1,2}
a.symmetricDifference(b) // Set {1,2,5,6}
a.isSubsetOf(b)         // false
a.isSupersetOf(new Set([1, 2])) // true
```

**Iterator Helpers**：

```js
// 链式惰性操作，无中间数组
const result = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  .values()
  .filter(n => n % 2 === 0)
  .map(n => n * 10)
  .take(3)
  .toArray()
// [20, 40, 60]  —— 只创建了 1 个数组
```

**Array.fromAsync**：

```js
async function* asyncGen() {
  yield await fetch('/api/1').then(r => r.json())
  yield await fetch('/api/2').then(r => r.json())
}
const results = await Array.fromAsync(asyncGen())
```

### 2.7 Maglev 即时编译器

V8 的中间层 JIT，在 ARM64 Mac 上默认启用。对 CLI 脚本有 5%~15% 性能提升。

### 2.8 Stream highWaterMark 提升

默认缓冲区从 16KB → 64KB，减少 I/O 系统调用。内存敏感场景可手动调回：

```js
import { setDefaultHighWaterMark } from 'node:stream'
setDefaultHighWaterMark(16 * 1024)
```

### 2.9 AbortSignal 性能优化

`AbortSignal` 创建效率提升 ~2x，显著加快大型项目中 fetch 和测试运行器性能。

---

## 3. node CLI 命令与选项

### 3.1 基本执行

```bash
node app.js                    # 运行脚本
node -e "console.log(1+1)"     # 代码片段
node -                         # stdin 输入
node                           # REPL
node --check app.js            # 只检查语法不执行
```

### 3.2 监视与开发

```bash
node --watch app.js
node --watch-path=src app.js
node --run dev
```

### 3.3 调试

```bash
node --inspect app.js                       # 默认 127.0.0.1:9229
node --inspect-brk app.js                   # 首行暂停
node --inspect=0.0.0.0:9229 app.js         # 允许远程
```

### 3.4 性能诊断

```bash
node --cpu-prof app.js                      # CPU profiling
node --heap-prof app.js                     # heap snapshot
node --trace-gc app.js                      # GC 追踪
node --max-old-space-size=4096 app.js      # 堆 4GB
node --report-on-fatalerror app.js          # 崩溃报告
```

### 3.5 环境变量

```bash
NODE_ENV=production node app.js
NODE_OPTIONS="--max-old-space-size=4096" node app.js
NODE_DEBUG=http,net,module node app.js
```

### 3.6 Node 22 新增 CLI

```bash
# .env 自动加载（22.7+）
# 项目根目录创建 .env 即可
# 关闭：node --no-experimental-detect-module app.js

# SQLite（实验性）
node --experimental-sqlite app.js
```

---

## 4. npm 核心命令速览

Node 22 捆绑 npm 11.x。

```bash
npm init -y                    # 初始化
npm install                    # 安装所有
npm install <pkg>              # 生产依赖
npm install -D <pkg>          # 开发依赖
npm ci                         # CI 严格安装
npm update                     # 更新
npm outdated                   # 检查过期
npm uninstall <pkg>            # 卸载
npm run <script>               # 运行脚本
npm test / npm start           # 简写
npm audit                      # 安全审计
npm audit fix                  # 自动修复
npm publish                    # 发布
npm cache clean --force        # 清理缓存
```

---

## 5. Node.js 版本管理与 LTS 路线图

### 5.1 LTS 时间线

| 版本 | 代号 | 发布时间 | LTS 开始 | 结束支持 |
|------|------|----------|----------|----------|
| Node 18 | Hydrogen | 2022.04 | 2022.10 | **2025.04** ✅ 已结束 |
| Node 20 | Iron | 2023.04 | 2023.10 | **2026.04** |
| Node 22 | Jod | 2024.04 | 2024.10 | **2027.04** |
| Node 24 | - | 2025.04 | 2025.10 | **2028.04** |

**偶数版本 → LTS，奇数版本 → 实验性**

### 5.2 版本差异速查

| 特性 | Node 18 | Node 20 | Node 22 |
|------|---------|---------|---------|
| require(ESM) | ❌ | ❌ 实验性 | ✅ |
| WebSocket 客户端 | ❌ | ❌ 实验性 | ✅ |
| glob / globSync | ❌ | ❌ | ✅ |
| node --run | ❌ | ❌ | ✅ 实验性 |
| node --watch | 实验性 | 实验性 | ✅ 稳定 |
| .env 自动加载 | ❌ | ❌ | ✅ 22.7+ |
| Set 方法 | ❌ | ❌ | ✅ |
| Iterator helpers | ❌ | ❌ | ✅ |
| Array.fromAsync | ❌ | ❌ | ✅ |
| node:sqlite | ❌ | ❌ | ✅ 实验性 |
| 测试运行器 | 实验性 | 稳定 | ✅ |
| Maglev 编译器 | ❌ | ❌ | ✅ 默认 |

---

## 6. 核心模块速查

| 模块 | 用途 | 备注 |
|------|------|------|
| `node:fs` / `node:fs/promises` | 文件系统 | 含 glob/globSync (22+) |
| `node:path` | 路径操作 | |
| `node:http` / `node:https` | HTTP 客户端/服务器 | |
| `node:crypto` | 加密/哈希 | |
| `node:stream` | 流 | highWaterMark 64KB (22+) |
| `node:buffer` | 二进制 | |
| `node:child_process` | 子进程 | |
| `node:worker_threads` | 工作线程 | |
| `node:net` | TCP 套接字 | |
| `node:os` | 系统信息 | |
| `node:process` | 进程控制 | |
| `node:url` | URL 解析 | |
| `node:util` | 工具函数 | |
| `node:events` | 事件发射器 | |
| `node:assert` | 断言 | |
| `node:test` | 内置测试 | 22+ 稳定 |
| `node:sqlite` | 内置 SQLite | 22+ 实验性 |
| `node:perf_hooks` | 性能测量 | |

推荐使用 `node:` 前缀区分内置模块与第三方包：

```js
import fs from 'node:fs/promises'
import http from 'node:http'
```

---

## 7. 实战示例

### 示例 1：WebSocket 实时数据

```js
const ws = new WebSocket('wss://stream.example.com/data')

ws.addEventListener('message', (event) => {
  const data = JSON.parse(event.data)
  console.log(`[${data.type}] ${data.payload}`)
})

ws.addEventListener('close', () => {
  setTimeout(() => { /* 重连逻辑 */ }, 5000)
})
```

### 示例 2：require(ESM) 渐进迁移

```js
// 旧 CommonJS 代码直接引用 ESM 新包
const { glob } = require('./new-glob-wrapper.mjs')  // ✅ 可行

// new-glob-wrapper.mjs
import { glob } from 'node:fs'
export { glob }
```

### 示例 3：fs.glob 构建脚本

```js
import { globSync } from 'node:fs'
import { rm, mkdir } from 'node:fs/promises'

await rm('./dist', { recursive: true, force: true })
await mkdir('./dist')

const files = globSync('src/**/*.ts', {
  exclude: ['src/**/*.test.ts', 'src/**/__tests__/**'],
})
console.log(`Found ${files.length} source files`)
```

### 示例 4：node --run + --watch 开发

```json
// package.json
{
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc",
    "test": "node --test --experimental-test-coverage"
  }
}
```

```bash
node --run dev
node --watch --run dev
node --run test
```

### 示例 5：原生测试运行器

```js
import { describe, it, before, after, mock } from 'node:test'
import assert from 'node:assert/strict'

describe('Math', () => {
  it('should add', () => {
    assert.strictEqual(1 + 1, 2)
  })

  it('should mock', () => {
    const fn = mock.fn(() => 'hello')
    assert.strictEqual(fn(), 'hello')
    assert.strictEqual(fn.mock.calls.length, 1)
  })
})
```

```bash
node --test
node --test --test-name-pattern="Math*"
```

---

## 8. 注意事项与陷阱

1. **Homebrew node@22 是 keg-only**：PATH 中有其他版本时 `node` 不会指向 22。用完整路径或 `brew link --overwrite`。

2. **WebSocket 只有客户端**：内置 `WebSocket` 是客户端实现，服务器仍需 `ws` 库。

3. **require(ESM) 不能含 top-level await**：会抛出 `ERR_REQUIRE_ASYNC_MODULE`。

4. **`node --run` 不执行 lifecycle scripts**：不会执行 `prebuild`/`postbuild`，需要时继续用 npm/pnpm。

5. **`--watch` 不监视 node_modules**：默认排除，需额外用 `--watch-path`。

6. **require() ESM 默认导出差异**：`export default` 通过 `.default` 访问，与 `import` 不同。

7. **旧 API 弃用警告**：`createCipher`/`createDecipher` 在 Node 22 中运行时弃用，下个大版本移除。使用 `createCipheriv`/`createDecipheriv`。

8. **C++ addon 兼容性**：少数 native addon 可能未适配 V8 12.x 的 API 变化，升级前检查 CI。

9. **Corepack 内置**：Node 22 默认含 corepack，可直接在 `package.json` 声明 `"packageManager": "pnpm@10.x"`。
