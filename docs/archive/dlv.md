# dlv（Delve）—— Go 调试器

> Go 语言专用源码级调试器。理解 goroutine / channel / map / slice 等 Go 特有类型。
> 版本：1.26.2（本机 go/bin 安装）
> 仓库：[github.com/go-delve/delve](https://github.com/go-delve/delve)

---

## 目录

1. [安装](#1-安装)
2. [启动模式](#2-启动模式)
    - [debug —— 编译并调试源码](#21-debug--编译并调试源码)
    - [exec —— 调试编译好的二进制](#22-exec--调试编译好的二进制)
    - [attach —— 附加到运行中的进程](#23-attach--附加到运行中的进程)
    - [test —— 调试单元测试](#24-test--调试单元测试)
    - [trace —— 函数调用追踪](#25-trace--函数调用追踪)
    - [dap —— VS Code 集成](#26-dap--vs-code-集成)
    - [core —— 分析 core dump](#27-core--分析-core-dump)
    - [connect —— 连接远程调试服务器](#28-connect--连接远程调试服务器)
3. [断点操作](#3-断点操作)
4. [执行控制](#4-执行控制)
5. [变量查看与修改](#5-变量查看与修改)
6. [Goroutine 调试](#6-goroutine-调试)
7. [堆栈与调用链](#7-堆栈与调用链)
8. [全局选项](#8-全局选项)
9. [远程调试](#9-远程调试)
10. [VS Code 集成](#10-vs-code-集成)
11. [实战示例](#11-实战示例)
12. [命令速查表](#12-命令速查表)
13. [注意事项与陷阱](#13-注意事项与陷阱)

---

## 1. 安装

```bash
# Go install（推荐）
go install github.com/go-delve/delve/cmd/dlv@latest

# macOS Homebrew（本机安装方式）
brew install delve

# 验证
dlv version
# Delve Debugger
# Version: 1.26.2
```

**要求**：Go 1.22+（新版 dlv 要求较新的 Go 版本）。

**macOS 权限**：首次使用时 macOS 可能弹出"开发者工具"权限请求，需授权后才能调试其他进程。

---

## 2. 启动模式

### 2.1 debug —— 编译并调试源码

最常用的模式，自动编译最优调试版本并启动。

```bash
# 调试当前目录的 main 包
dlv debug

# 调试指定包
dlv debug ./cmd/server
dlv debug github.com/user/project/cmd/app

# 传参数给被调试程序（用 -- 分隔）
dlv debug ./cmd/server -- --port=8080 --config=dev.yml

# 指定 build flags
dlv debug --build-flags="-tags=integration -ldflags='-s -w'"

# 禁用 ASLR（地址空间随机化，便于复现）
dlv debug --disable-aslr

# 指定工作目录
dlv debug --wd /path/to/working/dir

# 带重定向
dlv debug -r stdin:/path/to/input.txt -r stdout:/path/to/output.txt
```

### 2.2 exec —— 调试编译好的二进制

```bash
# 先用优化关掉参数编译
go build -gcflags="all=-N -l" -o myapp ./cmd/myapp

# 调试
dlv exec ./myapp

# 传参数
dlv exec ./myapp -- --verbose --port=9090

# 如果不加 -gcflags="-N -l"，编译优化可能导致变量不可查看
# -N: 禁用优化
# -l: 禁用内联
```

**关键**：调试二进制文件务必用 `-gcflags="all=-N -l"` 编译，否则断不准、变量不可见。

### 2.3 attach —— 附加到运行中的进程

```bash
# 查看进程 PID
ps aux | grep myapp

# 附加到进程
dlv attach 12345

# 调试结束后进程退出
(dlv) continue     # 继续运行
(dlv) detach       # 断开调试，进程继续运行
(dlv) quit         # 退出调试器（进程收到 SIGTERM）
```

**detach vs quit**：
- `detach`：dlv 断开，进程继续独立运行
- `quit`：dlv 退出，目标进程被终止

### 2.4 test —— 调试单元测试

```bash
# 调试当前包的测试
dlv test

# 调试指定包的测试
dlv test ./pkg/mypackage

# 指定测试函数
dlv test ./pkg/mypackage -- -test.run TestSpecificFunc

# 进入后设置断点
(dlv) break TestMyFunc
(dlv) continue

# 查看可用的测试函数
(dlv) funcs test
(dlv) funcs Test.*
```

### 2.5 trace —— 函数调用追踪

追踪函数被调用的时机、参数和返回值，不进入交互式调试。

```bash
# 追踪 main 包的 main 函数
dlv trace main.main

# 追踪指定包的函数（用正则）
dlv trace ./pkg/mypackage MyFunc

# 追踪所有匹配的函数调用
dlv trace --test ./pkg/mypackage Test.*

# 显示调用栈
dlv trace -s 3 main.main     # 显示 3 层栈

# 显示时间戳
dlv trace --timestamp main.main

# 追踪子调用（深度 2 层）
dlv trace --follow-calls 2 main.main

# 附加到已有进程追踪
dlv trace -p 12345 main.Handler
```

**输出示例**：
```
> main.main() /path/to/main.go:15
  => (1.234ms)
> main.Handler() /path/to/handler.go:42 (called from main.main)
  => (567µs)
```

### 2.6 dap —— VS Code 集成

```bash
# 启动 DAP 服务器（VS Code 自动调用，一般无需手动）
dlv dap --listen=:12345

# 从 DAP 服务器主动连接客户端
dlv dap --client-addr=localhost:54321

# 记录日志（排查集成问题）
dlv dap --listen=:12345 --log --log-output=dap
```

### 2.7 core —— 分析 core dump

```bash
# 先让 Go 程序生成 core dump
GOTRACEBACK=crash ./myapp
ulimit -c unlimited

# 分析
dlv core ./myapp core.dump

# 进入后查看状态
(dlv) goroutines       # 所有 goroutine
(dlv) stack            # 当前栈
(dlv) goroutine 1      # 切换到 main goroutine
(dlv) locals           # 局部变量
```

### 2.8 connect —— 连接远程调试服务器

```bash
# 先启动 headless 调试服务器
dlv debug --headless --listen=:2345 --api-version=2

# 另一个终端连接
dlv connect :2345

# 通过 Unix socket
dlv connect unix:/tmp/dlv.sock
```

---

## 3. 断点操作

### 3.1 设置断点（break / b）

```bash
# 在指定行设置断点
(dlv) break main.go:25
(dlv) b main.go:25             # 简写

# 在函数上设置
(dlv) break main.main
(dlv) break mypackage.MyFunc

# 在方法上设置
(dlv) break (*MyType).MyMethod

# 在包级别设置
(dlv) break /path/to/file.go:50

# 设置临时断点（命中一次后自动删除）
(dlv) break main.go:25 --oneshot

# 设置条件断点
(dlv) break main.go:25
(dlv) condition 1 i > 100      # 只有 i > 100 时才触发
(dlv) condition 1 i%10 == 0 && s != ""
(dlv) break main.go:25 i > 100  # 一步到位

# 设置 tracepoint（不中断，只打印）
(dlv) trace main.go:25
(dlv) trace mypackage.MyFunc

# 设置 watchpoint（监控变量修改）
(dlv) watch myVar
(dlv) watch -size 8 *(*int)(0x1400000)  # 监控内存地址
```

### 3.2 管理断点

```bash
# 列出所有断点
(dlv) breakpoints
(dlv) bp                      # 简写

# 清除断点
(dlv) clear 1                 # 按编号
(dlv) clearall                # 清除所有
(dlv) clear main.go:25        # 按位置

# 启用/禁用
(dlv) toggle 1                # 切换断点 1 的启用/禁用状态
(dlv) on 1 print "hit!"       # 断点 1 触发时执行命令
(dlv) on 2 stack 3            # 断点 2 触发时打印 3 层栈
```

---

## 4. 执行控制

```bash
# 继续执行（直到下一个断点或程序结束）
(dlv) continue
(dlv) c                       # 简写

# 单步执行（step into：进入函数）
(dlv) step
(dlv) s

# 单步跳过（step over：不进入函数）
(dlv) next
(dlv) n

# 跳出当前函数（step out）
(dlv) stepout
(dlv) so

# 执行到指定行（类似临时断点 + continue）
(dlv) continue main.go:42

# 重启程序
(dlv) restart
(dlv) r

# 重新编译并重启
(dlv) rebuild

# 退出
(dlv) quit
(dlv) q

# 断连（detach，进程继续运行）
(dlv) detach

# 反向执行（需要录制模式，见 §4.1）
(dlv) rewind
```

### 4.1 录制与反向调试（rr）

```bash
# 安装 rr（Linux only）
# Ubuntu: sudo apt install rr

# 用 rr 录制
dlv debug --backend=rr

# 反向调试命令（录制模式下可用）
(dlv) rev step        # 反向单步
(dlv) rev next        # 反向跳过
(dlv) rev continue    # 回退到上一个断点
(dlv) rewind          # 回退
```

---

## 5. 变量查看与修改

### 5.1 查看变量

```bash
# 打印表达式
(dlv) print myVar
(dlv) p myVar

# 打印指针指向的值
(dlv) p *ptr

# 打印结构体字段
(dlv) p myStruct.Field

# 打印切片元素
(dlv) p mySlice[0]

# 打印 map 值
(dlv) p myMap["key"]

# 打印 goroutine 局部变量
(dlv) p -goroutine 3 myVar

# 打印所有局部变量
(dlv) locals

# 打印函数参数
(dlv) args

# 打印当前 package 的变量
(dlv) vars mypackage

# 打印寄存器
(dlv) regs

# 查看类型
(dlv) whatis myVar
(dlv) whatis mypackage.MyType

# 打印类型定义
(dlv) types mypackage

# 查看内存
(dlv) examinemem -fmt hex 0x1400000 64
(dlv) x -fmt string 0x1400000 100
```

### 5.2 修改变量

```bash
# 设置变量值
(dlv) set myVar = 42
(dlv) set mySlice[0] = "newvalue"
(dlv) set myStruct.Field = 999
```

### 5.3 display —— 自动化观察

```bash
# 每次程序停止时打印表达式
(dlv) display myVar
(dlv) display -a               # 显示所有 display 条目
(dlv) display -d 1             # 删除 display 条目 1
```

---

## 6. Goroutine 调试

```bash
# 列出所有 goroutine
(dlv) goroutines
(dlv) grs

# 显示 goroutine 带调用栈摘要
(dlv) goroutines -t

# 过滤 goroutine
(dlv) goroutines -g Running       # 运行中的
(dlv) goroutines -g User          # 用户创建的（非 runtime）
(dlv) goroutines -l               # 只显示当前帧

# 切换到指定 goroutine
(dlv) goroutine 5
(dlv) gr 5

# 示例流程：找到阻塞的 goroutine
(dlv) goroutines -t              # 先看全景
# Goroutine 42 - ... waiting ...
(dlv) goroutine 42               # 切换到阻塞的
(dlv) stack                      # 看调用栈，找到阻塞点

# 查看 goroutine 的栈帧列表
(dlv) stack -goroutine 7
```

---

## 7. 堆栈与调用链

```bash
# 显示当前 goroutine 的调用栈
(dlv) stack
(dlv) bt                        # 简写（backtrace）

# 限定栈深度
(dlv) stack 10                  # 只显示 10 层

# 全量栈（含 runtime 帧）
(dlv) stack -full

# 切换栈帧
(dlv) frame 2                   # 切换到第 2 帧
(dlv) frame 0                   # 回到顶部
(dlv) up                        # 上一帧
(dlv) down                      # 下一帧

# 查看所有 goroutine 的栈（定位死锁利器）
(dlv) grs -t
```

---

## 8. 全局选项

这些选项适用于所有子命令。

| 选项 | 说明 |
|------|------|
| `--backend <mode>` | 调试后端：`default` / `native` / `lldb` / `rr` |
| `--build-flags "<flags>"` | 传递给编译器的 flags，如 `-tags` `-mod=vendor` |
| `--check-go-version` | 检查 Go 版本兼容性（默认 true） |
| `--disable-aslr` | 禁用地址空间随机化 |
| `--log` | 启用调试服务器日志 |
| `--log-output <components>` | 逗号分隔的日志组件：`debugger` `gdbwire` `lldb` `dap` `fncall` `minidump` |
| `--log-dest <path>` | 日志输出文件或 fd |
| `-r, --redirect <rules>` | 目标进程的 stdin/stdout/stderr 重定向 |
| `--wd <dir>` | 设置工作目录 |
| `--init <file>` | 启动时执行的命令文件（connect 模式用） |
| `--headless` | headless 模式（配合 --listen） |
| `--listen <addr>` | 监听地址，前缀 `unix:` 使用 Unix socket |
| `--api-version <n>` | API 版本号（默认 2） |
| `--accept-multiclient` | 允许多个客户端连接 |

### 使用示例

```bash
# headless 模式（允许远程连接）
dlv debug --headless --listen=:2345 --api-version=2

# 带详细日志
dlv debug --headless --listen=:2345 --log --log-output=debugger

# 构建选项
dlv debug --build-flags="-tags=integration -mod=vendor -cover"

# 重定向
dlv debug -r stdin:./input.txt -r stdout:./output.log

# Unix socket
dlv debug --headless --listen=unix:/tmp/dlv.sock
```

---

## 9. 远程调试

### 9.1 在远程服务器上启动

```bash
# 服务器端
dlv debug --headless --listen=:2345 --api-version=2 --accept-multiclient

# 指定可执行文件
dlv exec --headless --listen=:2345 ./myapp
```

### 9.2 本地连接

```bash
# 方式一：dlv connect（命令行客户端）
dlv connect remote-server:2345

# 方式二：VS Code launch.json
```

### 9.3 通过 SSH 隧道

```bash
# 本地转发
ssh -L 2345:localhost:2345 user@remote-server

# 服务器端启动 dlv headless
dlv debug --headless --listen=:2345

# 本地连接
dlv connect :2345
```

---

## 10. VS Code 集成

### 10.1 launch.json 配置示例

```json
{
    "version": "0.2.0",
    "configurations": [
        {
            "name": "Launch Package",
            "type": "go",
            "request": "launch",
            "mode": "debug",
            "program": "${workspaceFolder}/cmd/server"
        },
        {
            "name": "Launch Binary",
            "type": "go",
            "request": "launch",
            "mode": "exec",
            "program": "${workspaceFolder}/bin/myapp",
            "args": ["--port=8080"]
        },
        {
            "name": "Attach to Process",
            "type": "go",
            "request": "attach",
            "mode": "local",
            "processId": 0
        },
        {
            "name": "Debug Tests",
            "type": "go",
            "request": "launch",
            "mode": "test",
            "program": "${workspaceFolder}/pkg/mypackage",
            "args": ["-test.run", "TestSpecificFunc"]
        },
        {
            "name": "Remote Debug",
            "type": "go",
            "request": "attach",
            "mode": "remote",
            "remotePath": "/home/user/project",
            "port": 2345,
            "host": "remote-server"
        }
    ]
}
```

### 10.2 dlv 配置（settings.json）

```json
{
    "go.delveConfig": {
        "debugAdapter": "dlv-dap",
        "showGlobalVariables": true,
        "substitutePath": []
    },
    "go.toolsManagement.autoUpdate": true
}
```

**快捷键对应**：
| VS Code | dlv 命令 |
|---------|----------|
| F5 → Continue | `continue` |
| F10 → Step Over | `next` |
| F11 → Step Into | `step` |
| Shift+F11 → Step Out | `stepout` |

---

## 11. 实战示例

### 示例 1：调试死锁

```bash
# 程序卡住不动，找出原因
dlv attach $(pgrep myapp)

(dlv) goroutines           # 列出所有 goroutine
# 看到两个 goroutine 在 waiting（chan receive）

(dlv) goroutine 42         # 切换到 goroutine 42
(dlv) stack                # 看调用栈，定位阻塞点
#   mypkg.Send() at handler.go:50
#   ← 可能是在等待 channel

(dlv) goroutine 58         # 切换到 goroutine 58
(dlv) stack
#   mypkg.Recv() at handler.go:72
#   ← 另一个在等待同一个 channel

# 结论：两个 goroutine 互相等待，典型的死锁
```

### 示例 2：调试 nil pointer panic

```bash
dlv debug ./cmd/server
(dlv) continue
# panic: runtime error: invalid memory address...

(dlv) stack
# mypkg.Process() at handler.go:30 (ptr is nil)
# mypkg.Handle() at handler.go:55
# main.main() at main.go:20

(dlv) frame 0              # 确保在 panic 帧
(dlv) locals
# ptr = (*MyStruct)(nil)   ← 找到了！ptr 是 nil
(dlv) p someFunction()
# 看哪个调用返回了 nil
```

### 示例 3：条件断点调试循环

```bash
dlv debug ./cmd/server
(dlv) break main.go:35
(dlv) condition 1 i > 100 && user.ID == "admin"
(dlv) continue
# 只有当 i > 100 且用户是 admin 时才停
```

### 示例 4：trace 函数调用性能

```bash
# 追踪 HTTP handler 的调用耗时
dlv trace --timestamp --follow-calls 1 myapp.HandleRequest

# 输出：
# 2025-01-15T14:23:05Z > myapp.HandleRequest() /handlers/http.go:20
# 2025-01-15T14:23:05Z   > myapp.validate() /handlers/http.go:30
# 2025-01-15T14:23:05Z   => (1.2ms)
# 2025-01-15T14:23:05Z => (3.5ms)
```

### 示例 5：调试单元测试失败

```bash
dlv test ./pkg/mypackage -- -test.run TestFailingFunc
(dlv) break TestFailingFunc
(dlv) continue
# 程序停在 TestFailingFunc 开头
(dlv) next                 # 逐行执行
(dlv) p someVar            # 检查变量
(dlv) p expectedResult
(dlv) p actualResult       # 发现不匹配
(dlv) set actualResult = expectedResult  # 临时修改，验证假设
(dlv) continue
```

### 示例 6：headless 模式 + curl 触发断点

```bash
# 终端 1：启动 debug server
dlv debug --headless --listen=:2345 --api-version=2 ./cmd/api

# 终端 2：连接
dlv connect :2345
(dlv) break main.HandleIndex
(dlv) continue

# 终端 3：发送请求
curl http://localhost:8080/

# 终端 2 停在断点处
(dlv) locals
# req = &http.Request{...}
# rw = http.ResponseWriter(...)
```

---

## 12. 命令速查表

### 启动命令

| 命令 | 说明 |
|------|------|
| `dlv debug [pkg]` | 编译并调试源码 |
| `dlv exec <binary>` | 调试编译好的二进制 |
| `dlv attach <pid>` | 附加到运行中进程 |
| `dlv test [pkg]` | 调试测试 |
| `dlv trace [pkg] regexp` | 追踪函数调用 |
| `dlv dap` | 启动 DAP 服务器（VS Code 用） |
| `dlv core <binary> <core>` | 分析 core dump |
| `dlv connect <addr>` | 连接远程调试器 |

### 运行控制

| 命令 | 简写 | 说明 |
|------|------|------|
| `continue` | `c` | 继续执行 |
| `step` | `s` | 单步进入 |
| `next` | `n` | 单步跳过 |
| `stepout` | `so` | 跳出函数 |
| `restart` | `r` | 重启程序 |
| `rebuild` | | 重新编译并重启 |
| `quit` | `q` | 退出 |
| `detach` | | 断开（进程继续） |

### 断点

| 命令 | 简写 | 说明 |
|------|------|------|
| `break <loc>` | `b` | 设置断点 |
| `breakpoints` | `bp` | 列出断点 |
| `clear <id>` | | 删除断点 |
| `clearall` | | 删除所有断点 |
| `condition <id> <expr>` | `cond` | 条件断点 |
| `toggle <id>` | | 切换启用/禁用 |
| `on <id> <cmd>` | | 命中断点时执行命令 |
| `trace <loc>` | | 设置 tracepoint |
| `watch <var>` | | 设置 watchpoint |

### 变量

| 命令 | 简写 | 说明 |
|------|------|------|
| `print <expr>` | `p` | 求值表达式 |
| `locals` | | 局部变量 |
| `args` | | 函数参数 |
| `vars <pkg>` | | 包变量 |
| `regs` | | 寄存器 |
| `set <var> = <val>` | | 修改变量 |
| `display <expr>` | | 添加监控表达式 |
| `display -a` | | 显示所有监控 |
| `display -d <n>` | | 删除监控 |
| `whatis <expr>` | | 查看类型 |
| `types <pkg>` | | 列出类型 |

### Goroutine

| 命令 | 简写 | 说明 |
|------|------|------|
| `goroutines` | `grs` | 列出所有 goroutine |
| `goroutine <id>` | `gr` | 切换 goroutine |
| `goroutines -t` | | 带栈摘要 |
| `goroutines -l` | | 只显示当前帧 |
| `goroutines -g User` | | 只显示用户创建的 |

### 堆栈

| 命令 | 简写 | 说明 |
|------|------|------|
| `stack` | `bt` | 调用栈 |
| `stack <n>` | | 限制 n 层 |
| `frame <n>` | | 切换栈帧 |
| `up` / `down` | | 上/下移动帧 |
| `stack -full` | | 全部帧 |

### 其他

| 命令 | 说明 |
|------|------|
| `disassemble` | 反汇编 |
| `examinemem` / `x` | 查看内存 |
| `funcs <regex>` | 按正则搜索函数 |
| `list <loc>` | 显示源代码 |
| `source` | 执行命令文件 |
| `help` / `h` | 帮助 |
| `config` | 配置 dlv |

---

## 13. 注意事项与陷阱

1. **编译优化必须关掉**：用 `dlv debug` 会自动关优化。手动 `dlv exec` 时务必 `go build -gcflags="all=-N -l"`，否则变量值显示 `<optimized out>`、断点位置不准。

2. **macOS 权限**：首次 attach 需要授权。Sysprefs → Privacy → Developer Tools → 添加 Terminal/iTerm。

3. **`dlv debug` 编译的是临时文件**：二进制不输出到当前目录，用 `dlv exec` 调试实际发布的二进制。

4. **test 模式下只测试当前包**：`dlv test` 默认编译当前包的测试二进制。用 `dlv test ./...` 会失败，需要指定具体包。

5. **`goroutines` 输出很多 runtime goroutine**：用 `goroutines -g User` 过滤只显示用户创建的。

6. **headless 模式需要 `--accept-multiclient`**：默认只接受一个客户端，多次连接需要此 flag。

7. **trace 输出到 stderr**：`dlv trace ... 2>&1` 或 `dlv trace --timestamp ... 2> trace.log`。

8. **反向调试（rr）仅 Linux**：macOS 不支持 rr 后端。需要 Linux 环境用 `--backend=rr`。

9. **attach 时要确保 Go 版本匹配**：Go 版本差异太大可能导致 attach 失败或变量解析错误。

10. **`dlv dap` vs `dlv debug --headless`**：`dlv dap` 是专门给 VS Code DAP 协议用的；`dlv debug --headless` 是通用的 headless 模式。

11. **`condition` 中的变量作用域**：条件表达式在当前断点的作用域内求值，不能引用其他函数的局部变量。

12. **`set` 修改后程序行为可能异常**：set 绕过了 Go 的类型安全，修改不当可能导致段错误。
