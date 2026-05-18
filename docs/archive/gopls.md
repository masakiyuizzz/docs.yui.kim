# gopls —— Go 语言服务器（Language Server）

> Go 官方 LSP 实现。编辑器（VS Code / Neovim / Emacs 等）通过 LSP 协议与 gopls 通信，获得智能编辑体验。
> 仓库：[github.com/golang/tools/tree/master/gopls](https://github.com/golang/tools/tree/master/gopls)
> 本机版本：v0.21.1（arm64，go/bin 安装）
> 官方文档：[go.dev/gopls](https://go.dev/gopls)

---

## 目录

1. [安装](#1-安装)
2. [工作原理](#2-工作原理)
3. [CLI 子命令](#3-cli-子命令)
4. [编辑器集成](#4-编辑器集成)
    - [VS Code](#41-vs-code)
    - [Neovim / Vim](#42-neovim--vim)
5. [配置项完整参考](#5-配置项完整参考)
6. [Diagnostics 分析器](#6-diagnostics-分析器)
7. [Code Lenses](#7-code-lenses)
8. [Inlay Hints](#8-inlay-hints)
9. [高级与性能优化](#9-高级与性能优化)
10. [Daemon 模式](#10-daemon-模式)
11. [故障排查](#11-故障排查)
12. [注意事项与陷阱](#12-注意事项与陷阱)

---

## 1. 安装

```bash
# Go install（推荐）
go install golang.org/x/tools/gopls@latest

# 安装后路径
ls -la ~/go/bin/gopls

# 验证版本
gopls version
# golang.org/x/tools/gopls v0.21.1

# 或指定版本
go install golang.org/x/tools/gopls@v0.20.0
```

**要求**：Go 1.23+（gopls v0.18+ 需要，旧版 gopls 支持更低版本）。

---

## 2. 工作原理

```
┌──────────────┐  LSP (JSON-RPC via stdio)  ┌──────────────┐
│  Editor       │ ←───────────────────────→ │  gopls        │
│  (VS Code /   │   hover / completion /   │  (language    │
│   Neovim /   │   definition / diag /    │   server)     │
│   Emacs)     │   refs / rename / lens   │              │
└──────────────┘                           └──────┬───────┘
                                                  │
                                         go/types   │   go list
                                         go/parser  │   go build
                                                  │
                                                  ▼
                                          ┌────────────────┐
                                          │ Go Toolchain    │
                                          │ + Module Cache  │
                                          └────────────────┘
```

- **LSP 协议**：gopls 是 language server，编辑器是 language client
- **通信**：stdio（Editor 启动 gopls 作为子进程，通过 stdin/stdout 的 JSON-RPC 通信）
- **核心库**：使用 `go/types` / `go/parser` / `go/ssa` 分析源码，不依赖外部 build
- **缓存**：分析结果缓存在文件系统（`$GOPATH/pkg/mod`、`$GOCACHE`），重启后复用

---

## 3. CLI 子命令

gopls 不仅可以作为 LSP server 运行，还提供 CLI 接口供脚本调用。

### 3.1 启动 LSP Server

```bash
# 作为 LSP server 运行（默认模式）
gopls serve

# 等价于直接运行 gopls（不带参数的 gopls 自动启动 serve）
gopls

# 指定日志文件
gopls serve -logfile /tmp/gopls.log

# 自动日志（按日期轮转）
gopls serve -logfile auto

# 监听 TCP 连接（而非 stdio，用于远程开发）
gopls serve -listen ":37374"

# Unix socket（推荐本机高性能通信）
gopls serve -listen "unix;/tmp/gopls.sock"

# 超时关闭（无客户端连接 N 分钟后自动退出）
gopls serve -listen.timeout 5m

# 开启 RPC trace
gopls serve -rpc.trace
```

### 3.2 代码格式化

```bash
# 格式化单个文件到 stdout
gopls format main.go
# 输出格式化后的内容到 stdout

# 写入文件（原地修改）
gopls format -w main.go

# 格式化 + 列出差异
gopls format -d main.go
# 显示 diff 格式差异

# 格式化 + 显示修改的文件列表
gopls format -l *.go
# 只列出需要修改的文件名
```

### 3.3 诊断检查

```bash
# 对指定文件运行诊断
gopls check main.go
# 输出类似 go vet 的结果

# 检查整个目录
gopls check ./...
```

### 3.4 导入管理

```bash
# 更新导入（等价 goimports）
gopls imports main.go     # 输出到 stdout
gopls imports -w main.go  # 写入文件
gopls imports -d main.go  # 显示 diff

# 用于替代 goimports
gopls imports -w *.go
```

### 3.5 定义与引用

```bash
# 查找定义位置
gopls definition main.go:25:10
# 输出：file.go:line:col:start-end

# JSON 格式输出
gopls definition -json main.go:25:10

# 查找引用
gopls references main.go:25:10

# 查找实现
gopls implementation main.go:15:5
```

### 3.6 重命名

```bash
# 测试重命名（不执行）
gopls prepare_rename main.go:25:10

# 执行重命名
gopls rename -w main.go:25:10 newName
# -w 表示写入文件；不加 -w 输出 diff
```

### 3.7 符号与导航

```bash
# 文件符号列表
gopls symbols main.go
# 输出：类型 函数 变量 等

# 工作区符号搜索
gopls workspace_symbol "ServeHTTP"

# 折叠范围（代码折叠）
gopls folding_ranges main.go

# 语义高亮
gopls semtok main.go

# 高亮（相同标识符）
gopls highlight main.go:25:10

# 文档链接
gopls links main.go

# 调用层次（谁调用谁）
gopls call_hierarchy main.go:25:10
```

### 3.8 代码操作

```bash
# 列出可用的代码操作
gopls codeaction -kind quickfix main.go:25:10

# 执行代码操作
gopls fix main.go
```

### 3.9 其他 CLI 命令

```bash
# 工作区统计
gopls stats
# 输出：文件数、包数、内存使用等

# 查看版本
gopls version

# 查看 API JSON
gopls api-json

# 查看集成软件许可证
gopls licenses
```

---

## 4. 编辑器集成

### 4.1 VS Code

安装 VS Code 的 [Go 扩展](https://marketplace.visualstudio.com/items?itemName=golang.go)，它会自动下载和管理 gopls。

```json
// settings.json
{
  // 启用 gopls（默认已启用）
  "go.useLanguageServer": true,

  // gopls 配置
  "gopls": {
    // 格式化
    "formatting.gofumpt": true,
    "formatting.local": "github.com/myrepo",

    // 代码补全
    "ui.completion.usePlaceholders": true,
    "ui.completion.completionBudget": "100ms",
    "ui.completion.matcher": "Fuzzy",

    // 诊断
    "staticcheck": true,
    "ui.diagnostic.staticcheck": true,
    "ui.diagnostic.staticcheck": true,
    "vulncheck": "Imports",

    // Inlay hints
    "hints": {
      "assignVariableTypes": true,
      "compositeLiteralFields": true,
      "compositeLiteralTypes": true,
      "constantValues": true,
      "functionTypeParameters": true,
      "parameterNames": true,
      "rangeVariableTypes": true
    },

    // Code lenses
    "ui.codelenses": {
      "generate": true,
      "run_govulncheck": true,
      "tidy": true,
      "upgrade_dependency": true,
      "vendor": true
    },

    // 导航
    "ui.navigation.importShortcut": "Both",
    "ui.semanticTokens": true,

    // 文档
    "ui.documentation.hoverKind": "FullDocumentation",
    "ui.documentation.linkTarget": "pkg.go.dev",

    // 分析器
    "ui.diagnostic.analyses": {
      "fieldalignment": false,
      "nilness": true,
      "unusedparams": true,
      "unusedwrite": true,
      "useany": true
    },

    // 构建
    "build.buildFlags": ["-tags=integration"],
    "build.env": {
      "GOFLAGS": "-mod=mod"
    }
  },

  // 保存时格式化
  "editor.formatOnSave": true,
  "[go]": {
    "editor.codeActionsOnSave": {
      "source.organizeImports": "explicit"
    }
  }
}
```

### 4.2 Neovim / Vim

使用 `nvim-lspconfig` 或直接配置。

```lua
-- nvim-lspconfig
local lspconfig = require('lspconfig')

lspconfig.gopls.setup({
  cmd = { 'gopls', 'serve' },
  filetypes = { 'go', 'gomod', 'gowork', 'gotmpl' },
  root_dir = lspconfig.util.root_pattern('go.work', 'go.mod', '.git'),
  settings = {
    gopls = {
      analyses = {
        unusedparams = true,
        nilness = true,
      },
      staticcheck = true,
      gofumpt = true,
      codelenses = {
        generate = true,
        tidy = true,
        upgrade_dependency = true,
        vendor = true,
      },
      hints = {
        assignVariableTypes = true,
        compositeLiteralFields = true,
        parameterNames = true,
      },
      semanticTokens = true,
      buildFlags = { '-tags=integration' },
    },
  },
  -- 保存时自动格式化 + 整理导入
  on_attach = function(client, bufnr)
    vim.api.nvim_create_autocmd('BufWritePre', {
      buffer = bufnr,
      callback = function()
        vim.lsp.buf.format({ async = false })
        vim.lsp.buf.code_action({
          context = { only = { 'source.organizeImports' } },
          apply = true,
        })
      end,
    })
  end,
})
```

**无插件直接配置**（Neovim 内置 LSP）：
```lua
vim.lsp.start({
  name = 'gopls',
  cmd = { 'gopls', 'serve' },
  root_dir = vim.fs.dirname(vim.fs.find({ 'go.mod', '.git' }, { upward = true })[1]),
})
```

---

## 5. 配置项完整参考

gopls 配置通过 LSP `workspace/configuration` 传递，在编辑器设置中以 JSON 对象形式指定。

### Build（构建）

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `buildFlags` | `[]string` | `[]` | 传递给 `go list` 等命令的 flag，常用于 `-tags` |
| `env` | `map[string]string` | `{}` | 额外环境变量 |
| `directoryFilters` | `[]string` | `["-**/node_modules"]` | 目录过滤，格式 `+path`/`-path`，支持 `**` |
| `templateExtensions` | `[]string` | `[]` | 模板文件扩展名 |
| `expandWorkspaceToModule` | `bool` | `true` | 将工作区扩展至整个 module |
| `standaloneTags` | `[]string` | `["ignore"]` | 独立 main 文件的 build tag |
| `workspaceFiles` | `[]string` | `[]` | 定义工作区的 glob 文件 |

```json
{
  "build.buildFlags": ["-tags=integration,debug"],
  "build.env": { "GOFLAGS": "-mod=vendor" },
  "build.directoryFilters": ["-", "+internal", "-internal/generated"]
}
```

### Formatting（格式化）

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `local` | `string` | `""` | 类似 `goimports -local`，将指定前缀的 import 分组在一起 |
| `gofumpt` | `bool` | `false` | 启用 [gofumpt](https://github.com/mvdan/gofumpt) 更严格的格式化 |

### UI — Completion（补全）

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `usePlaceholders` | `bool` | `false` | 函数参数补全时使用占位符 |
| `completionBudget` | `duration` | `"100ms"` | 补全延迟预算，超时减少搜索范围 |
| `matcher` | `enum` | `"Fuzzy"` | `CaseInsensitive` / `CaseSensitive` / `Fuzzy` |
| `experimentalPostfixCompletions` | `bool` | `true` | 后缀补全（如 `slice.sort!`） |
| `completeFunctionCalls` | `bool` | `true` | 自动补全函数调用括号 |

### UI — Diagnostic（诊断）

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `analyses` | `map[string]bool` | `{}` | 启用/禁用特定分析器 |
| `staticcheck` | `bool` | `false` | 启用 [staticcheck](https://staticcheck.io) |
| `annotations` | `map[enum]bool` | 全 true | 编译器优化细节注释（bounds/escape/inline/nil） |
| `vulncheck` | `enum` | `"Prompt"` | `"Off"` / `"Imports"` / `"Prompt"` |
| `diagnosticsDelay` | `duration` | `"1s"` | 诊断计算延迟 |
| `diagnosticsTrigger` | `enum` | `"Edit"` | `"Edit"`（输入时） / `"Save"`（保存时） |
| `analysisProgressReporting` | `bool` | `true` | 分析索引进度通知 |

### UI — Documentation（文档）

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `hoverKind` | `enum` | `"FullDocumentation"` | hover 信息级别 |
| `linkTarget` | `string` | `"pkg.go.dev"` | 文档链接目标域名 |
| `linksInHover` | `enum` | `true` | hover 中是否显示文档链接 |

### UI — InlayHint（内嵌提示）

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `hints` | `map[enum]bool` | `{}` | 启用/禁用各类 hint |

### UI — Navigation（导航）

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `importShortcut` | `enum` | `"Both"` | import 语句链接行为：`Both` / `Definition` / `Link` |
| `symbolMatcher` | `enum` | `"FastFuzzy"` | 符号搜索算法 |
| `symbolStyle` | `enum` | `"Dynamic"` | 符号样式 |
| `symbolScope` | `enum` | `"all"` | 符号搜索范围 |

### UI — 其他

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `semanticTokens` | `bool` | `false` | 发送语义 token 给客户端（语义高亮） |
| `codelenses` | `map[enum]bool` | 见下文 | 启用/禁用 code lens |
| `newGoFileHeader` | `bool` | `true` | 新建 Go 文件自动插入版权和 package |
| `renameMovesSubpackages` | `bool` | `false` | 重命名时移动子目录 |

---

## 6. Diagnostics 分析器

gopls 内置了丰富的静态分析器。通过 `analyses` 配置项启用/禁用。

### 常用分析器

| 分析器 | 说明 |
|--------|------|
| `asmdecl` | 汇编声明与 Go 声明不匹配 |
| `assign` | 检查无用赋值 |
| `atomic` | 检测 atomic 错误用法 |
| `bools` | 检查布尔表达式错误 |
| `buildtag` | 检查 build tag |
| `cgocall` | 检测可能的 cgo 误用 |
| `composites` | 检查无键复合字面量 |
| `copylocks` | 检测锁的复制 |
| `deepequalerrors` | 检查 `reflect.DeepEqual` 用于 error |
| `fieldalignment` | 检测可以优化的结构体字段排列（省内存） |
| `httpresponse` | 检查 HTTP response body 未关闭 |
| `loopclosure` | 检查循环变量捕获 |
| `lostcancel` | 检测 context cancel 遗漏 |
| `nilfunc` | 检测 nil 函数调用 |
| `nilness` | 检测 nil 解引用 |
| `printf` | 检查 printf 格式化 |
| `shadow` | 检测变量遮蔽 |
| `shift` | 检测移位操作溢出 |
| `stdmethods` | 检查标准接口方法签名 |
| `stringintconv` | 检测 string(int) 类型转换 |
| `structtag` | 检查结构体 tag 格式 |
| `testinggoroutine` | 检测在 goroutine 中使用 testing.T |
| `tests` | 检测测试常见错误 |
| `timeformat` | 检测 time.Format 调用错误 |
| `unmarshal` | 检测传入非指针给 Unmarshal/Decode |
| `unreachable` | 不可达代码 |
| `unsafeptr` | 检测 unsafe.Pointer 误用 |
| `unusedparams` | 未使用的函数参数 |
| `unusedresult` | 未使用的函数返回值 |
| `unusedwrite` | 未使用的写入 |

### 配置示例

```json
{
  "gopls": {
    "ui.diagnostic.analyses": {
      "fieldalignment": true,
      "nilness": true,
      "unusedparams": true,
      "unusedwrite": true,
      "shadow": true,
      "useany": true
    },
    "staticcheck": true
  }
}
```

### 编译器优化注解（annotations）

`"ui.diagnostic.annotations"` 控制在 Go 1.22+ 中编译器的优化决策注解：

| 注解 | 说明 |
|------|------|
| `"bounds"` | 边界检查消除 |
| `"escape"` | 逃逸分析结果 |
| `"inline"` | 内联决策 |
| `"nil"` | nil 检查 |

在 VS Code 中使用命令 `Go: Toggle compiler optimization details` 开关。

---

## 7. Code Lenses

Code Lens 是编辑器中的可点击提示（如 "run test"、"go generate"）。

| Lens | 说明 | 默认 |
|------|------|------|
| `generate` | `//go:generate` 指示符旁显示 "go generate" | ON |
| `regenerate_cgo` | CGO 文件旁显示重新生成 | ON |
| `run_govulncheck` | 运行漏洞扫描 | ON |
| `tidy` | `go.mod` 旁显示 "go mod tidy" | ON |
| `upgrade_dependency` | 依赖旁显示升级选项 | ON |
| `vendor` | `go.mod` 旁显示 "go mod vendor" | ON |

```json
{
  "gopls": {
    "ui.codelenses": {
      "generate": false,
      "run_govulncheck": false
    }
  }
}
```

---

## 8. Inlay Hints

内嵌提示在代码中显示推断的类型、参数名等信息。

### 可用 Hint

| Hint | 效果 |
|------|------|
| `assignVariableTypes` | `var x = 42` → `var x int = 42` |
| `compositeLiteralFields` | `S{a, b}` → `S{a: a, b: b}` |
| `compositeLiteralTypes` | `S{}` → `S[type]{}` |
| `constantValues` | 显示常量值 |
| `functionTypeParameters` | 显示泛型函数类型参数 |
| `parameterNames` | 显示函数调用参数名 |
| `rangeVariableTypes` | `for k, v := range` 显示类型 |

### 配置

```json
{
  "gopls": {
    "hints": {
      "assignVariableTypes": true,
      "compositeLiteralFields": true,
      "compositeLiteralTypes": true,
      "constantValues": true,
      "functionTypeParameters": true,
      "parameterNames": true,
      "rangeVariableTypes": true
    }
  }
}
```

---

## 9. 高级与性能优化

### 9.1 `.vscode/settings.json` 完整配置模板

```json
{
  "go.toolsManagement.autoUpdate": true,
  "go.useLanguageServer": true,
  "gopls": {
    "formatting.gofumpt": true,
    "formatting.local": "github.com/myorg",
    "ui.completion.usePlaceholders": true,
    "ui.completion.matcher": "Fuzzy",
    "ui.semanticTokens": true,
    "ui.diagnostic.staticcheck": true,
    "ui.diagnostic.analyses": {
      "shadow": true,
      "unusedparams": true,
      "nilness": true,
      "fieldalignment": false
    },
    "build.buildFlags": [],
    "build.env": {},
    "build.directoryFilters": [
      "-**/node_modules",
      "-**/vendor",
      "-**/.git"
    ],
    "vulncheck": "Imports"
  },
  "[go]": {
    "editor.formatOnSave": true,
    "editor.codeActionsOnSave": {
      "source.organizeImports": "explicit"
    }
  },
  "[gomod]": {
    "editor.formatOnSave": true,
    "editor.codeActionsOnSave": {
      "source.organizeImports": "explicit"
    }
  }
}
```

### 9.2 性能建议

| 策略 | 配置 |
|------|------|
| 限制工作区范围 | `"build.directoryFilters": ["-", "+internal"]` |
| 关闭庞大分析器 | `"staticcheck": false` |
| 关闭语义高亮 | `"ui.semanticTokens": false` |
| 保存时才诊断 | `"ui.diagnostic.diagnosticsTrigger": "Save"` |
| 增加诊断延迟 | `"ui.diagnostic.diagnosticsDelay": "2s"` |
| 缩小工作区模块 | `"build.expandWorkspaceToModule": false` |
| 减少补全预算 | `"ui.completion.completionBudget": "50ms"` |

### 9.3 大 workspace 优化

```json
{
  "gopls": {
    "build.expandWorkspaceToModule": false,
    "ui.diagnostic.staticcheck": false,
    "ui.diagnostic.analyses": {
      "unusedparams": false,
      "unusedwrite": false
    },
    "build.directoryFilters": [
      "-",
      "+cmd",
      "+internal",
      "+pkg"
    ]
  }
}
```

### 9.4 Go workspace（多模块）

```bash
# 创建 go.work 文件，gopls 自动识别
go work init
go work use ./module-a
go work use ./module-b

# gopls 看到 go.work 后自动将全部模块纳入工作区
```

---

## 10. Daemon 模式

gopls 支持 -remote 模式，一个 gopls 进程服务多个编辑器窗口，共享缓存。

```bash
# 启动 daemon（监听 localhost:37374）
gopls serve -listen "localhost:37374" -listen.timeout 10m

# 从编辑器中连接 daemon
# VS Code：在 settings.json 设置
"go.alternateTools": {
  "gopls": "/path/to/gopls-wrapper.sh"
}
```

其中 `gopls-wrapper.sh`:
```bash
#!/bin/bash
exec gopls -remote "localhost:37374" "$@"
```

**优势**：
- 多个编辑器窗口共享分析缓存
- 减少内存占用
- 分析结果跨窗口复用

---

## 11. 故障排查

```bash
# 1. 查看 gopls 版本
gopls version
go version -m $(which gopls) | grep 'mod '

# 2. 开启详细日志
gopls serve -logfile /tmp/gopls.log -rpc.trace
# 查看日志
tail -f /tmp/gopls.log

# 3. 在 VS Code 中开启 gopls 日志
# Cmd+Shift+P → "Go: Toggle gopls Trace"
# 日志输出到 Output 面板 → 选择 "gopls"

# 4. 查看 VS Code gopls 日志路径
# Output 面板 → 选择 "gopls (server)"

# 5. 重启 gopls
# VS Code: Cmd+Shift+P → "Go: Restart Language Server"

# 6. 重置 gopls 缓存
rm -rf ~/.cache/gopls/

# 7. 测试分析是否正确
gopls check ./...

# 8. 查看工作区统计
gopls stats
```

### 常见问题

| 症状 | 可能原因 | 解决 |
|------|----------|------|
| "No packages found" | 不在 Go module 中 | 运行 `go mod init` |
| 补全很慢 | 工作区太大 | 参考 §9.2 性能优化 |
| 内存占用高 | staticcheck 或大型 module | 关闭 staticcheck，缩小 directoryFilters |
| 诊断不更新 | 缓存问题 | `Go: Restart Language Server` |
| 导入不自动整理 | 编辑器设置 | `editor.codeActionsOnSave` 中启用 `source.organizeImports` |

---

## 12. 注意事项与陷阱

1. **必须处于 Go module 中**：gopls 依赖 `go.mod` 来理解项目结构。GOPATH 模式的项目需要 `go mod init`。

2. **gopls 版本与 Go 版本绑定**：新版 gopls 可能要求较新 Go 版本。`go install golang.org/x/tools/gopls@latest` 自动匹配。

3. **`go.sum` 变化时 gopls 自动更新**：添加依赖后 gopls 会感知 `go.sum` 变化并重新分析。

4. **配置项命名变化**：gopls settings 在 2023 年经历了大规模重构。旧配置项（如 `"analyses"`）现在需要加 `"ui.diagnostic."` 前缀。查看当前 API：`gopls api-json | jq '.Options.User[].Hierarchy'`。

5. **VS Code 中有两层设置**：`"go.*"` 是 Go 扩展设置，`"gopls"` 是 gopls LSP 设置。不要混淆。

6. **`GOPRIVATE` 影响文档链接**：设置了 `GOPRIVATE` 的模块在 hover 中不会显示文档链接。

7. **`-remote` 模式慎用**：daemon crash 会影响所有连接的编辑器。

8. **`fieldalignment` 分析器**：只是建议，不一定需要修改。过度对齐可能降低可读性。

9. **模板文件支持**：gopls 支持 Go template 语言特性（`.tmpl` 文件），需配置 `"build.templateExtensions": ["tmpl"]`。

10. **MCP 支持**（实验性）：gopls v0.18+ 支持 `-mcp.listen` 标志，将 gopls 作为 MCP（Model Context Protocol）服务器提供给 AI 编程助手使用。
