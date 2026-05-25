# Go —— 编译快、并发简单的系统语言

> Rob Pike、Ken Thompson、Robert Griesemer 设计，2009 年发布，目前最新稳定版为 Go 1.26。
> 官网：[go.dev](https://go.dev) · 文档：[pkg.go.dev](https://pkg.go.dev)
> 线上体验：[go.dev/play](https://go.dev/play)

> **为什么写这份文档**：Go 的官方文档（Effective Go、语言规范）把每个知识点都讲到了，但对新手冷冰冰的，尤其对"这个命令到底干了什么、文件之间什么关系"讲得很散。本文将按**从零搭建项目 → 日常开发 → 深入特性**的线索组织，大量终端命令示例，让你在 CLI 里一步步跑起来。

---

## 目录

1. [Go 是什么](#1-go-是什么)
2. [安装与验证](#2-安装与验证)
3. [go mod 与 go sum 彻底搞懂](#3-go-mod-与-go-sum-彻底搞懂)
4. [终端操作速查：go 命令全解](#4-终端操作速查go-命令全解)
5. [项目结构惯例](#5-项目结构惯例)
6. [包与导入](#6-包与导入)
7. [变量与声明](#7-变量与声明)
8. [数据类型](#8-数据类型)
9. [函数](#9-函数)
10. [控制流](#10-控制流)
11. [struct 与方法](#11-struct-与方法)
12. [接口 interface](#12-接口-interface)
13. [错误处理](#13-错误处理)
14. [并发：goroutine 与 channel](#14-并发goroutine-与-channel)
15. [标准库精选](#15-标准库精选)
16. [测试与基准测试](#16-测试与基准测试)
17. [工具链进阶](#17-工具链进阶)
18. [实用代码片段](#18-实用代码片段)
19. [常见陷阱与最佳实践](#19-常见陷阱与最佳实践)

---

## 1. Go 是什么

```
Go 的定位：

  Python   ——  开发快，运行慢，部署麻烦（要装解释器）
  C/C++    ——  运行快，开发慢，编译慢，内存管理痛苦
   Java    ——  介于中间，但 JVM 太重，启动慢

  Go       ——  开发快（语法简洁）+ 运行快（编译为机器码）+ 部署爽（单二进制文件）
```

**Go 最适合的场景**：

- 后端 API 服务（HTTP REST / gRPC）
- CLI 命令行工具
- 网络中间件（代理、网关）
- 分布式系统 / 微服务
- DevOps 工具（Docker、Kubernetes、Terraform 都是 Go 写的）
- 高性能场景（需要并发但不想要 C 的痛苦）

**Go 不太适合的场景**：

- 桌面 GUI（生态弱）
- 游戏引擎
- 操作系统内核（可以但有更好的选择）
- 复杂的泛型 / 函数式编程（有泛型但 API 不激进）

---

## 2. 安装与验证

```bash
# macOS
brew install go

# 或从 go.dev/dl 下载 pkg 安装包

# 验证
go version
# go version go1.26.2 darwin/arm64

# Go 环境变量
go env

# 最重要的几个环境变量
go env GOPATH     # 全局模块缓存和工作空间的目录，默认 ~/go
go env GOROOT     # Go 自身安装目录，brew 安装在 /opt/homebrew/Cellar/go/.../libexec
go env GOMODCACHE # 下载的依赖缓存位置，默认 $GOPATH/pkg/mod
go env GOPROXY    # 模块代理（拉包时走这里），默认 https://proxy.golang.org,direct
go env GOPRIVATE  # 哪些模块是私有的，不走代理
go env GONOSUMDB  # 哪些模块不校验 checksum

# 查看所有环境变量的值
go env GOMODCACHE GOPATH GOROOT
```

---

## 3. go mod 与 go sum 彻底搞懂

这是新手最困惑的地方，花一整节讲透。

### 3.1 一句话比喻

```
go.mod  =  grocery list（购物清单）  —— "我需要这些包，版本分别是"
go.sum  =  receipt（购物小票）       —— "我买到的包 SHA256 分别长这样，防止被调包"
```

### 3.2 go.mod 就是你的"购物清单"

```bash
# 创建新项目时生成 go.mod
go mod init github.com/你的用户名/项目名

# 示例
go mod init github.com/alice/myapp
```

执行后生成：

```
myapp/
└── go.mod
```

```go
// go.mod 长这样：
module github.com/alice/myapp   // ← 你项目的"身份证号"，全局唯一的模块路径

go 1.26                           // ← 最低 Go 版本
```

当你 `import` 了一个外部包，运行 `go build` 或 `go mod tidy` 后：

```go
module github.com/alice/myapp

go 1.26

require (
    github.com/gin-gonic/gin v1.10.0       // 直接依赖
    github.com/lib/pq        v1.10.9
)

require (
    golang.org/x/net   v0.34.0  // indirect  // 间接依赖（gin 引用了它）
    golang.org/x/text  v0.21.0  // indirect
)
```

**关键点**：

- `require` 区块：你的项目用到的依赖和版本号
- `// indirect`：不是你直接 import 的，是你的依赖的依赖
- **版本号语义**：`v1.10.0` = `v<主版本>.<次版本>.<补丁版本>`。Go 强制语义版本。
- `v0.x.x`：表示不稳定 API。`v1.x.x`：表示 API 稳定。
- `/v2` 后缀：如果一个大版本（如 v2）API 不兼容 v1，模块路径要加 `/v2`：`github.com/foo/bar/v2`。

### 3.3 go.sum 就是你的"购物小票"

这不是锁文件！Go 没有像 `package-lock.json` 一样的锁文件。`go.sum` 的作用是**防篡改**。

```
github.com/gin-gonic/gin v1.10.0 h1:NK89KunrKMzB2B7V+dDteqBXsEoKBPOQTfSq4pD/qs=
github.com/gin-gonic/gin v1.10.0/go.mod h1:wm9mZAHp2ThB5PXTcTmzLRBnZX5hX4pBPEUH+O/JWA=
```

每一行是一个 SHA256 哈希：
- 第一行 `h1:` —— 整个模块 zip 包的哈希
- 第二行 `go.mod` —— 该模块的 go.mod 文件的哈希

**作用**：当你（或同事）`go mod download` 时，Go 会对比下载到的代码的哈希和 `go.sum` 里的哈希是否一致。不一致 → 拒绝使用，防止：
- 依赖作者偷偷改了代码（即使版本号没变）
- 中间人攻击
- 代理被污染

### 3.4 日常 mod 操作（最重要！）

```bash
# ===== 初始化项目 =====
go mod init github.com/alice/myapp
# 生成 go.mod

# ===== 添加依赖 =====
# 方式 1：直接在代码里写 import，然后跑 build
import "github.com/gin-gonic/gin"
go build
# Go 会自动下载 gin 并更新 go.mod 和 go.sum

# 方式 2：用 go get 显式添加（推荐，更可控）
go get github.com/gin-gonic/gin
go get github.com/gin-gonic/gin@v1.10.0    # 指定版本
go get github.com/gin-gonic/gin@latest     # 最新版本
go get github.com/gin-gonic/gin@v1.11.0-rc.1  # 预发布版本

# ===== 删除不再使用的依赖 =====
# 如果删掉了代码里的 import，go mod tidy 会清理
go mod tidy
# 这个命令会：
#   1. 添加所有代码里用到了但 go.mod 里没写的依赖
#   2. 删除 go.mod 里写了的但代码里没用的依赖
#   3. 更新 go.sum
# 建议每次修改 import 后都跑一下

# ===== 查看依赖树 =====
go mod graph           # 打印所有依赖关系（输出很多）
go mod why 包名        # 为什么需要这个包？
go mod why golang.org/x/text
# 输出：
# # golang.org/x/text
# github.com/alice/myapp
# github.com/gin-gonic/gin
# golang.org/x/text
# 就是说：你的项目 → gin → text

# ===== 升级依赖 =====
go get -u ./...                   # 升级所有直接和间接依赖到最新小版本
go get -u=patch ./...             # 只升级补丁版本（最安全）
go get github.com/gin-gonic/gin@latest  # 升某个特定包到最新

# ===== vendor（离线模式） =====
go mod vendor
# 把所有依赖源码下载到项目里的 vendor/ 目录
# 好处：CI 构建不需要外网，完全自包含
# 你一般不需要，但知道有这个命令

# ===== 验证 =====
go mod verify
# 验证下载的依赖是否和 go.sum 一致
# 如果输出 "all modules verified" 就是好的
```

### 3.5 常见 mod 问题

```bash
# Q: 下载不动？
# A: 换个代理
go env -w GOPROXY=https://goproxy.cn,direct
# goproxy.cn 是国内镜像（七牛），direct 表示代理用不了时直连

# Q: 公司内部私有仓库拉不下？
go env -w GOPRIVATE=github.com/mycompany/*
# 私有仓库不走代理，不做 checksum 验证

# Q: go.mod 里有 replace 是什么？
# 在 go.mod 里写：
replace github.com/original/pkg => ../local-fork
# 用于本地开发：把远程包临时指向你本地的 fork

# Q: 为什么我 import 了包，go build 显示找不到？
# 没有自动添加到 go.mod？跑一下 go mod tidy
```

---

## 4. 终端操作速查：go 命令全解

### 4.1 编译与运行

```bash
# ===== go run —— 编译 + 运行（用于开发调试） =====
go run main.go
go run .                     # 运行当前包（目录下所有 .go 文件）

# ===== go build —— 只编译，不运行 =====
go build                     # 编译当前包，生成二进制文件（目录名）
go build main.go             # 编译指定文件
go build -o myapp .          # 指定输出文件名
go build -o bin/ ./cmd/...   # 编译 cmd/ 下所有子包

# ===== 交叉编译 —— 在 macOS 上编译 Linux 或 Windows 程序 =====
GOOS=linux GOARCH=amd64 go build -o myapp-linux .
GOOS=windows GOARCH=amd64 go build -o myapp.exe .
GOOS=darwin GOARCH=arm64 go build -o myapp-mac .
# 常用组合：
#   GOOS:    linux / darwin / windows
#   GOARCH:  amd64 / arm64

# ===== go install —— 编译并安装到 $GOPATH/bin =====
go install .
go install github.com/user/tool@latest   # 安装远程工具
# 安装完后可以直接在终端用命令运行（前提 $GOPATH/bin 在 PATH 里）
```

### 4.2 依赖管理（复习）

```bash
go mod init <module-path>     # 初始化模块
go mod tidy                   # 清理和更新依赖（最常用的维护命令）
go get <package>              # 添加依赖
go get <package>@<version>    # 添加指定版本
go get -u ./...               # 升级全部
go mod graph                  # 依赖树
go mod why <package>          # 为什么需要此依赖
go mod verify                 # 校验 go.sum 是否一致
go mod vendor                 # 离线化依赖到 vendor/
go mod download               # 只下载依赖（不编译），CI 里用
go mod edit -go 1.26          # 修改 go 版本号
go mod edit -replace A=B      # 添加 replace 指令
```

### 4.3 代码质量与格式化

```bash
# ===== go fmt —— 自动格式化（全 Go 社区统一的代码风格） =====
go fmt ./...                  # 格式化当前目录和所有子包
# Go 没有"代码风格之争"，fmt 把所有人拉到同一页

# ===== go vet —— 静态分析，找可疑代码 =====
go vet ./...
# 会检查：不可达代码、Printf 参数不匹配、无用的赋值等

# ===== golangci-lint —— 更全面的 linter（推荐） =====
brew install golangci-lint
golangci-lint run ./...       # 会检查 50+ 规则
```

### 4.4 测试

```bash
# ===== go test =====
go test ./...                           # 跑所有包的测试
go test -v ./...                        # 显示详细输出
go test -run TestFoo ./...              # 只跑名字匹配 "TestFoo" 的测试
go test -run "TestFoo|TestBar" ./...    # 用正则匹配
go test -count=1 ./...                  # 禁用缓存（默认缓存通过的测试）
go test -cover ./...                    # 显示测试覆盖率
go test -coverprofile=coverage.out ./... # 输出覆盖率文件
go tool cover -html=coverage.out        # 在浏览器看覆盖率可视化

# ===== 基准测试 =====
go test -bench=. ./...                  # 运行所有基准测试
go test -bench=. -benchmem ./...        # 同时显示每次操作的内存分配
go test -bench=. -count=5 ./...         # 跑 5 次以稳定结果

# ===== 竞态检测 =====
go test -race ./...                     # 检测数据竞争（非常重要！）
# -race 会让测试变慢，但能救你的命
```

### 4.5 文档与工具

```bash
# ===== go doc —— 在终端直接看文档 =====
go doc fmt.Println                # 查看 Println 的文档
go doc net/http                  # 查看 net/http 包的文档
go doc -all os/signal            # 查看整个包的所有导出符号
go doc -src fmt.Println          # 直接看源码！

# ===== go tool —— 各种辅助工具 =====
go tool compile main.go          # 手动编译（底层）
go tool link                      # 链接器
go tool pprof                     # 性能分析
go tool trace                     # 追踪分析
go tool cover                     # 覆盖率工具

# ===== 查看环境信息 =====
go env GOMODCACHE GOPATH GOROOT
go env -w GOPROXY=https://goproxy.cn,direct   # 设置环境变量
```

### 4.6 杂项

```bash
# 查看 Go 版本
go version

# 查看所有支持的目标系统和架构
go tool dist list

# 清理构建缓存
go clean -cache

# 清理 mod 缓存
go clean -modcache

# 下载当前项目的所有依赖（但不编译）
go mod download

# 升级 Go 到最新版本
go install golang.org/dl/go1.26@latest
go1.26 download
```

---

## 5. 项目结构惯例

### 5.1 最小项目

```
myapp/
├── go.mod
├── go.sum
└── main.go
```

```go
// main.go
package main          // 可执行程序的包名必须是 main

import "fmt"

func main() {         // 入口函数必须是 main
    fmt.Println("Hello, Go!")
}
```

### 5.2 标准结构（多年社区惯例）

```
myapp/
├── go.mod
├── go.sum
│
├── cmd/                    # 可执行程序入口（可能有多个）
│   └── myapp/
│       └── main.go         # package main
│
├── internal/               # 私有库（别的模块不能 import）
│   ├── handler/
│   │   └── user.go
│   └── service/
│       └── auth.go
│
├── pkg/                    # 公共库（别的模块可以 import）
│   └── validator/
│       └── email.go
│
├── api/                    # API 定义（OpenAPI / gRPC proto 等）
│   └── myapp/v1/
│       └── myapp.proto
│
├── configs/                # 配置文件模板
│   └── config.yaml
│
├── migrations/             # 数据库迁移文件
│   └── 001_create_users.sql
│
└── docs/                   # 文档
    └── README.md
```

**关键约定**：

- `cmd/` — 一个入口 = 一个子目录。比如 `cmd/server/`、`cmd/worker/`、`cmd/cli/`。每个子目录只有一个 `main.go`，逻辑极简，只做初始化然后调用 `internal/` 的代码。
- `internal/` — Go 编译器强制限制：其他模块不能 import 你 `internal/` 下的包。保护内部实现细节。
- `pkg/` — 愿意被外部使用的公共库。
- **Go 不要 `src/` 目录**。项目根目录就是模块根。

---

## 6. 包与导入

### 6.1 包名规则

```go
// 一个目录 = 一个包
// 目录下所有 .go 文件的 package 声明必须相同

// user.go
package user        // ← 包名尽量用目录名（不要下划线、不要驼峰）

// 文件组织
// user/
//   user.go        ← package user（类型定义）
//   user_test.go   ← package user_test（测试，允许不同包名）
//   service.go     ← package user（方法逻辑）
//   helper.go      ← package user（辅助函数）
// 都是 package user，但一个包太大就拆目录
```

### 6.2 导入语法

```go
import (
    // 标准库
    "fmt"
    "net/http"

    // 第三方库
    "github.com/gin-gonic/gin"

    // 你自己项目的包
    "github.com/alice/myapp/internal/handler"
)

// 导入时重命名
import (
    myhttp "github.com/alice/myapp/pkg/http"  // 原名冲突时用别名
    _ "github.com/lib/pq"                     // 只执行 init()，不用其他
)
```

### 6.3 大写 = 导出（PascalCase）

Go 用大写字母决定可见性——没有 public/private 关键字。

```go
package user

var MaxAge = 150        // 大写开头 → 公开（其他包可以访问）
var minAge = 0          // 小写开头 → 私有（只能本包内使用）

type User struct {      // 公开类型
    Name string         // 公开字段
    email string        // 私有字段
}

func NewUser() User {}  // 公开函数
func validate() {}      // 私有函数
```

---

## 7. 变量与声明

```go
// ===== 方式 1：var 声明（有初始值时类型可省略） =====
var name string = "Alice"
var age int = 25
var isAdmin bool          // 零值：false

// ===== 方式 2：短声明 :=（函数内专用，最常用） =====
name := "Alice"           // 类型自动推断
age := 25
count, err := doSomething()  // 多返回值直接接

// ===== 方式 3：批量声明 =====
var (
    host     string = "localhost"
    port     int    = 8080
    debug    bool   = true
)

// ===== 零值（未初始化时的默认值） =====
var i int       // 0
var f float64   // 0.0
var b bool      // false
var s string    // ""（空字符串，不是 nil！）
var p *int      // nil
var arr [3]int  // [0, 0, 0]

// ===== 常量 =====
const PI = 3.14159
const (
    StatusOK    = 200
    StatusError = 500
)

// iota —— 常量的枚举生成器
type Status int

const (
    Draft Status = iota    // 0
    Published              // 1
    Archived               // 2
)

// iota 进阶用法
const (
    _  = 1 << (10 * iota)  // 跳过第一个
    KB                      // 1024
    MB                      // 1048576
    GB                      // 1073741824
)
```

---

## 8. 数据类型

### 8.1 基本类型

```go
// ===== 整数 =====
var i int           // 32 位系统 32 位，64 位系统 64 位
var i8 int8         // -128 ~ 127
var i16 int16
var i32 int32
var i64 int64
var u uint          // 无符号
var u8 uint8        // 0 ~ 255（别名 byte）

// ===== 浮点数 =====
var f32 float32
var f64 float64     // 默认

// ===== 布尔 =====
var ok bool

// ===== 字符串（不可变） =====
var s string = "hello"
```

### 8.2 数组与切片

```go
// ===== 数组 —— 定长，类型包括长度 =====
var arr [3]int = [3]int{1, 2, 3}
arr2 := [...]int{1, 2, 3}   // 让编译器数长度
// [3]int 和 [4]int 是不同的类型！

// ===== 切片 —— 动态长度的"数组视图"（99% 时间用这个） =====
var s []int                   // nil 切片，len=0
s := []int{1, 2, 3}          // 初始化
s := make([]int, 3)           // make(类型, 长度) → [0, 0, 0]
s := make([]int, 3, 5)        // make(类型, 长度, 容量)

// 切片操作
s = append(s, 4, 5, 6)        // 追加元素（可能触发扩容）
s = append(s, s2...)           // 合并两个切片

// 子切片
sub := s[1:3]                 // [2, 3]（索引 1 到 2，不含 3）
sub := s[:3]                  // 前 3 个
sub := s[1:]                  // 索引 1 到末尾

// 复制
dst := make([]int, len(src))
copy(dst, src)

// 遍历
for i, v := range items {
    fmt.Println(i, v)
}
for _, v := range items {     // 不需要索引时用 _ 丢弃
    fmt.Println(v)
}
```

### 8.3 Map

```go
// 创建
m := make(map[string]int)           // 空 map（可写入）
var m map[string]int                // nil map（读返回零值，写会 panic！）
// ⚠️ nil map 不能赋值，一定要 make

m := map[string]int{
    "a": 1,
    "b": 2,
}

// 读写
m["c"] = 3
v := m["a"]             // 1
v := m["z"]             // 0（键不存在返回零值）

// 判断键是否存在（推荐）
v, ok := m["z"]
if ok {
    fmt.Println("存在:", v)
}

// 删除
delete(m, "a")

// 遍历（顺序不确定！）
for k, v := range m {
    fmt.Println(k, v)
}
```

---

## 9. 函数

### 9.1 基本语法

```go
// 函数声明
func add(a int, b int) int {
    return a + b
}

// 相同类型的参数可以简写
func add(a, b int) int {
    return a + b
}

// 多返回值（Go 的特色，用于返回错误）
func divide(a, b float64) (float64, error) {
    if b == 0 {
        return 0, errors.New("division by zero")
    }
    return a / b, nil
}

// 调用
result, err := divide(10, 0)
if err != nil {
    fmt.Println("出错:", err)
    return
}
fmt.Println("结果:", result)

// 命名返回值（在函数体内可直接赋值）
func split(sum int) (x, y int) {
    x = sum * 4 / 9
    y = sum - x
    return   // "裸 return"，返回命名返回值当前值
}
// ⚠️ 命名返回值在短函数里方便，但长函数里反而降低可读性
```

### 9.2 可变参数

```go
func sum(nums ...int) int {
    total := 0
    for _, n := range nums {
        total += n
    }
    return total
}

sum(1, 2, 3)         // 6
sum(5, 5, 5, 5)      // 20
```

### 9.3 函数作为值

```go
// 函数是一等公民，可以赋值、当参数、当返回值
type Transform func(int) int

func apply(nums []int, fn Transform) []int {
    result := make([]int, len(nums))
    for i, n := range nums {
        result[i] = fn(n)
    }
    return result
}

double := func(n int) int { return n * 2 }
apply([]int{1, 2, 3}, double)  // [2, 4, 6]
```

### 9.4 defer —— 延迟执行（清扫资源专用）

```go
func readFile(path string) error {
    f, err := os.Open(path)
    if err != nil {
        return err
    }
    defer f.Close()    // ← 函数返回前一定会执行（类似 finally）

    // 读文件...
    return nil
}

// defer 按 LIFO 顺序执行（后进先出，像叠盘子）
defer fmt.Println("1")
defer fmt.Println("2")
defer fmt.Println("3")
// 输出：3, 2, 1
```

---

## 10. 控制流

### 10.1 if

```go
// Go 的 if 不需要括号
if score >= 90 {
    fmt.Println("A")
} else if score >= 60 {
    fmt.Println("C")
} else {
    fmt.Println("F")
}

// if 前可以跟短声明（变量作用域仅在 if-else 块）
if err := doSomething(); err != nil {
    return err
}
// err 在这个 if 外不存在

if v, ok := m["key"]; ok {
    fmt.Println(v)
}
```

### 10.2 switch

```go
// Go 的 switch 不会 fall-through（不需要 break）
switch os := runtime.GOOS; os {
case "darwin":
    fmt.Println("macOS")
case "linux":
    fmt.Println("Linux")
default:
    fmt.Printf("%s\n", os)
}

// 不带表达式的 switch（替代长的 if-else 链）
t := time.Now()
switch {
case t.Hour() < 12:
    fmt.Println("上午")
case t.Hour() < 17:
    fmt.Println("下午")
default:
    fmt.Println("晚上")
}

// fallthrough（显式要求穿透，极少用）
switch v {
case 1:
    fmt.Println("1")
    fallthrough
case 2:
    fmt.Println("1 或 2")
}
```

### 10.3 for

```go
// Go 只有 for 一种循环（没有 while、do-while）

// 经典 C 风格
for i := 0; i < 10; i++ {
    fmt.Println(i)
}

// while 风格（去掉分号）
i := 0
for i < 10 {
    fmt.Println(i)
    i++
}

// 无限循环
for {
    // ... 用 break 退出
}

// range 遍历
nums := []int{1, 2, 3}
for i, v := range nums {
    fmt.Println(i, v)
}

for _, v := range nums {   // 丢索引
    fmt.Println(v)
}
```

---

## 11. struct 与方法

### 11.1 struct 定义与使用

```go
// 定义结构体
type User struct {
    ID        int
    Name      string
    Email     string
    createdAt time.Time  // 小写 = 包内私有
}

// 字面量创建
u := User{
    ID:    1,
    Name:  "Alice",
    Email: "alice@example.com",
}

u2 := User{2, "Bob", "bob@x.com", time.Now()}  // 按位置（字段多时不好读，不推荐）

// 访问
u.Name = "Alice Yang"
fmt.Println(u.Name)

// 匿名结构体（一次性用）
config := struct {
    Host string
    Port int
}{
    Host: "localhost",
    Port: 8080,
}
```

### 11.2 方法（接收者函数）

```go
// Go 没有 class，但可以在任意（当前包内的）类型上定义方法

type User struct {
    Name  string
    Email string
}

// 值接收者：不会修改原 struct
func (u User) DisplayName() string {
    return strings.ToUpper(u.Name)
}

// 指针接收者：可以修改原 struct
func (u *User) SetName(name string) {
    u.Name = name
}

// 使用
u := User{Name: "alice"}
fmt.Println(u.DisplayName())  // "ALICE"
u.SetName("Bob")
fmt.Println(u.Name)           // "Bob"

// 规则：
//   只读取 → 值接收者
//   要修改 → 指针接收者
//   一致性 → 一个类型的方法尽量统一用指针接收者
```

### 11.3 构造函数（惯例：NewXxx）

```go
// Go 没有构造函数，惯例是写 NewXxx 函数
func NewUser(name, email string) *User {
    return &User{
        Name:  name,
        Email: email,
    }
}

// 需要初始化时校验
func NewUser(name, email string) (*User, error) {
    if name == "" {
        return nil, errors.New("name is required")
    }
    return &User{Name: name, Email: email}, nil
}
```

### 11.4 嵌入（替代继承）

```go
type Animal struct {
    Name string
}

func (a Animal) Speak() string {
    return "..."
}

type Dog struct {
    Animal               // 嵌入（不是继承！）
    Breed string
}

// 方法提升：Dog 可以直接调用 Animal 的方法
d := Dog{Animal: Animal{Name: "Buddy"}, Breed: "Golden"}
d.Speak()               // "..."（提升的方法）
d.Name                  // "Buddy"（提升的字段）

// 覆盖（重写）
func (d Dog) Speak() string {
    return "Woof!"
}
d.Speak()               // "Woof!"

// Dog 实现了 Animal 所有方法的接口吗？
// 不。嵌入是组合，不是继承。类型系统不认为 Dog 是 Animal 的子类型。
```

---

## 12. 接口 interface

Go 的接口是**隐式实现**——不需要声明 "implements"，你只要有对应的方法就算实现了。

### 12.1 接口定义与实现

```go
// 定义接口
type Writer interface {
    Write([]byte) (int, error)
}

type Closer interface {
    Close() error
}

// 嵌入式接口（组合多个接口）
type ReadWriteCloser interface {
    Reader
    Writer
    Closer
}

// 实现 —— 不需要写 implements，方法签名匹配就行
type MyFile struct {
    // ...
}

func (f MyFile) Write(data []byte) (int, error) { /* ... */ return 0, nil }
func (f MyFile) Close() error { /* ... */ return nil }

// MyFile 同时实现了 Writer 和 Closer（自动的！）

// 使用接口
func save(w Writer, data []byte) error {
    _, err := w.Write(data)
    return err
}

f := MyFile{}
save(f, []byte("hello"))  // 传 MyFile 给 Writer 参数
```

### 12.2 空接口与 any

```go
// interface{} 可以接受任意类型的值
// Go 1.18+ 可以用 any 代替（完全等价）
func describe(v any) {
    fmt.Printf("类型: %T, 值: %v\n", v, v)
}

describe(42)          // 类型: int, 值: 42
describe("hello")     // 类型: string, 值: hello
```

### 12.3 类型断言与类型 switch

```go
func printValue(v any) {
    // 类型断言：v.(Type)
    s, ok := v.(string)
    if ok {
        fmt.Println("字符串:", s)
        return
    }

    i, ok := v.(int)
    if ok {
        fmt.Println("整数:", i)
        return
    }

    fmt.Println("未知类型")
}

// 更好的写法：类型 switch
func printValue(v any) {
    switch val := v.(type) {
    case string:
        fmt.Println("字符串:", val)
    case int:
        fmt.Println("整数:", val)
    case bool:
        fmt.Println("布尔:", val)
    default:
        fmt.Printf("未知类型: %T\n", val)
    }
}
```

### 12.4 常见标准库接口

```go
// 只要你的类型实现了这些接口，就可以用于这些标准库功能

// Stringer — 定义如何打印（fmt 会用）
type Stringer interface {
    String() string
}

// error — 所有错误类型都实现这个接口
type error interface {
    Error() string
}

// Reader — 可读取
type Reader interface {
    Read(p []byte) (n int, err error)
}

// Writer — 可写入
type Writer interface {
    Write(p []byte) (n int, err error)
}
```

---

## 13. 错误处理

Go 没有 try-catch。错误就是普通的值，通过返回值传递。

### 13.1 基本模式

```go
func fetchUser(id int) (*User, error) {
    if id <= 0 {
        return nil, fmt.Errorf("invalid user id: %d", id)
    }

    user, err := db.QueryUser(id)
    if err != nil {
        return nil, fmt.Errorf("fetch user %d: %w", id, err)
        //                                        ↑ %w 包装错误，保留原始错误链
    }

    return user, nil
}

// 调用方检查
user, err := fetchUser(0)
if err != nil {
    fmt.Println("出错:", err)
    return
}
fmt.Println(user.Name)
```

### 13.2 自定义错误类型

```go
// sentinel error —— 包级别的预定义错误（用于调用方判断）
var (
    ErrNotFound   = errors.New("not found")
    ErrPermission = errors.New("permission denied")
)

// 自定义错误结构体（携带更多信息）
type ValidationError struct {
    Field string
    Value any
    Rule  string
}

func (e *ValidationError) Error() string {
    return fmt.Sprintf("validation failed on %s: %v (rule: %s)", e.Field, e.Value, e.Rule)
}

// 调用方判断错误类型
var valErr *ValidationError
if errors.As(err, &valErr) {
    fmt.Println("字段:", valErr.Field)
}

if errors.Is(err, ErrNotFound) {
    fmt.Println("未找到")
}
```

### 13.3 error 的最佳实践

```go
// ✅ 好的写法
func process() error { return nil }

// ❌ 不要传 error 作为最后一个输出同时还有别的返回值——可以，但惯例是 error 放最后
// ✅ 这是 OK 的
func process() (result int, err error) { ... }

// ✅ 别吞掉错误
data, _ := fetchData()   // ❌ 用 _ 丢弃错误，出了事不知道怎么死的

// ✅ 尽早 return，减少缩进
func doSomething() error {
    _, err := step1()
    if err != nil {
        return err         // ← 尽早返回
    }

    _, err = step2()
    if err != nil {
        return err
    }

    return nil
}
```

---

## 14. 并发：goroutine 与 channel

### 14.1 goroutine —— 轻量级"线程"

```go
// 加 go 关键字就启动新 goroutine
go doSomething()

// 示例
func main() {
    go func() {
        fmt.Println("来自 goroutine")
    }()

    fmt.Println("来自 main")
    time.Sleep(100 * time.Millisecond)  // 等一下 goroutine（临时）
}
// ⚠️ main 退出时所有 goroutine 立即终止，所以上面 sleep 是必要的
// 生产环境用 sync.WaitGroup 或 channel 等待
```

### 14.2 channel —— goroutine 之间通信

```go
// 创建 channel
ch := make(chan int)        // 无缓冲 channel（发送和接收必须配对）
ch := make(chan int, 10)    // 有缓冲 channel（最多存 10 个）

// 发送与接收
ch <- 42        // 发送
v := <-ch       // 接收

// 关闭 channel
close(ch)
// 关闭后：接收方还能读到剩余数据，读完拿到零值 + ok=false

// 接收时检测是否关闭
v, ok := <-ch
if !ok {
    fmt.Println("channel 已关闭")
}

// 遍历 channel（直到关闭）
for v := range ch {
    fmt.Println(v)
}
```

### 14.3 经典并发模式

```go
// ===== 模式 1：生产者-消费者 =====
func producer(ch chan<- int) {     // 只能发送
    for i := 0; i < 5; i++ {
        ch <- i
    }
    close(ch)
}

func consumer(ch <-chan int) {     // 只能接收
    for v := range ch {
        fmt.Println("收到:", v)
    }
}

ch := make(chan int, 5)
go producer(ch)
consumer(ch)

// ===== 模式 2：select 多路复用 =====
select {
case msg := <-ch1:
    fmt.Println("来自 ch1:", msg)
case msg := <-ch2:
    fmt.Println("来自 ch2:", msg)
case <-time.After(1 * time.Second):
    fmt.Println("超时")
default:
    fmt.Println("没有消息")
}

// ===== 模式 3：WaitGroup —— 等待一组 goroutine 完成 =====
var wg sync.WaitGroup

for i := 0; i < 5; i++ {
    wg.Add(1)
    go func(n int) {
        defer wg.Done()   // 完成时计数减 1
        fmt.Println(n)
    }(i)
}

wg.Wait()   // 阻塞直到计数归零
fmt.Println("全部完成")
```

### 14.4 并发控制（context）

```go
// context 用于传递取消信号、超时、截止时间——几乎每个服务端 Go 代码都用
func worker(ctx context.Context, id int) {
    for {
        select {
        case <-ctx.Done():
            fmt.Printf("worker %d 退出: %v\n", id, ctx.Err())
            return
        default:
            fmt.Printf("worker %d 工作中...\n", id)
            time.Sleep(500 * time.Millisecond)
        }
    }
}

// 使用
ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
defer cancel()   // 确保资源释放

go worker(ctx, 1)
go worker(ctx, 2)

<-ctx.Done()
fmt.Println("done")
```

---

## 15. 标准库精选

Go 的标准库极其丰富，这里按使用频率列出。

### 15.1 命令行与输入输出

```go
import (
    "bufio"        // 缓冲 I/O，逐行读取
    "flag"         // 命令行参数解析
    "fmt"          // 格式化 I/O
    "os"           // 操作系统接口：文件、环境变量、进程
    "path/filepath" // 文件路径操作
)

// flag 示例：命令行参数
var name string
var age int
flag.StringVar(&name, "name", "Guest", "your name")
flag.IntVar(&age, "age", 0, "your age")
flag.Parse()
fmt.Printf("Hello, %s (%d)\n", name, age)
// 运行：go run . -name Alice -age 25

// 读取文件
data, err := os.ReadFile("input.txt")

// 逐行读取
f, _ := os.Open("file.txt")
scanner := bufio.NewScanner(f)
for scanner.Scan() {
    line := scanner.Text()
    fmt.Println(line)
}

// 获取环境变量
home := os.Getenv("HOME")
```

### 15.2 时间

```go
import "time"

now := time.Now()
fmt.Println(now.Format("2006-01-02 15:04:05"))   // Go 的时间格式用这个特定时刻！
// 2006-01-02 15:04:05 代表 2006年1月2日 3时4分5秒 MST时区

t := time.Date(2025, 1, 15, 0, 0, 0, 0, time.UTC)
t.Add(24 * time.Hour)           // 加一天
t.Sub(now)                      // 时间差

timer := time.NewTimer(3 * time.Second)
<-timer.C                       // 等待 3 秒

ticker := time.NewTicker(500 * time.Millisecond)
for t := range ticker.C {
    fmt.Println(t)
}
ticker.Stop()
```

### 15.3 字符串

```go
import "strings"

strings.Contains("hello", "ll")       // true
strings.HasPrefix("hello", "he")      // true
strings.Split("a,b,c", ",")           // ["a", "b", "c"]
strings.Join([]string{"a","b"}, ",")  // "a,b"
strings.ReplaceAll("abac", "a", "x")  // "xbxc"
strings.ToUpper("hello")              // "HELLO"
strings.TrimSpace("  hi  ")           // "hi"
```

### 15.4 编码

```go
import "encoding/json"

// 结构体 → JSON
data, _ := json.Marshal(user)

// 美化
data, _ := json.MarshalIndent(user, "", "  ")

// JSON → 结构体
var user User
json.Unmarshal(data, &user)

// JSON → map
var result map[string]any
json.Unmarshal(data, &result)
```

### 15.5 数学与随机

```go
import (
    "math"
    "math/rand"
    "math/rand/v2"   // Go 1.22+ 新 random 包
)

math.Max(3.14, 2.72)
math.Pow(2, 10)

// Go 1.22+ 推荐用 math/rand/v2
import "math/rand/v2"
n := rand.IntN(100)         // 0 ~ 99
```

### 15.6 网络与 HTTP

```go
import "net/http"

// ===== 最简单 HTTP 服务器 =====
http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
    fmt.Fprintf(w, "Hello, %s!", r.URL.Path[1:])
})
http.ListenAndServe(":8080", nil)

// ===== 带 JSON 的 REST API =====
http.HandleFunc("/api/user", func(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(map[string]string{
        "name": "Alice",
    })
})

// ===== HTTP 客户端 =====
resp, err := http.Get("https://api.example.com/data")
if err != nil {
    return err
}
defer resp.Body.Close()
body, _ := io.ReadAll(resp.Body)
```

### 15.7 其他常用

```go
import "log"         // 日志（简单场景）
import "log/slog"    // 结构化日志（Go 1.21+，推荐）
import "regexp"      // 正则
import "sort"        // 排序
import "sync"        // 并发原语（Mutex、WaitGroup、Once...）
import "strconv"     // 字符串 ↔ 数字转换
import "testing"     // 测试框架
import "reflect"     // 反射（少用）

// struct tag 配合 reflect 使用
type User struct {
    Name string `json:"name" validate:"required"`
    Age  int    `json:"age"  validate:"min=0"`
}
// 像 json:"name" 就是 struct tag——json 包会读取它来决定序列化的字段名
```

---

## 16. 测试与基准测试

### 16.1 测试文件约定

```
user.go
user_test.go        ← 测试文件，必须 _test.go 后缀
```

### 16.2 基本测试

```go
// user_test.go
package user       // 白盒测试（可以访问私有函数）

import "testing"

func TestNewUser(t *testing.T) {
    u, err := NewUser("Alice", "alice@x.com")

    if err != nil {
        t.Fatalf("不想有 error，但有 : %v", err)
    }
    if u.Name != "Alice" {
        t.Errorf("期望 Name=Alice，实际=%s", u.Name)
    }
}

// 表驱动测试（Go 社区最推荐的模式）
func TestAdd(t *testing.T) {
    tests := []struct {
        name     string
        a, b     int
        expected int
    }{
        {"正数", 1, 2, 3},
        {"负数", -1, -2, -3},
        {"零", 0, 0, 0},
        {"混合", -1, 1, 0},
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            result := Add(tt.a, tt.b)
            if result != tt.expected {
                t.Errorf("Add(%d, %d) = %d; want %d", tt.a, tt.b, result, tt.expected)
            }
        })
    }
}
```

### 16.3 基准测试

```go
func BenchmarkAdd(b *testing.B) {
    for i := 0; i < b.N; i++ {    // b.N 由测试框架自动调整
        Add(1, 2)
    }
}
// 跑：go test -bench=.

// 基准测试 + 内存分配
func BenchmarkStringBuilder(b *testing.B) {
    for b.Loop() {   // Go 1.24+ 推荐用 b.Loop()
        var builder strings.Builder
        builder.WriteString("hello")
        _ = builder.String()
    }
}
```

---

## 17. 工具链进阶

### 17.1 构建标签（条件编译）

```go
//go:build linux
// +build linux     // 旧写法

// 文件名为 xxx_linux.go 也是同样的效果（按 GOOS/GOARCH 编译）
// config_linux.go   → 只在 Linux 编译
// config_darwin.go  → 只在 macOS 编译
// config_windows.go → 只在 Windows 编译
```

### 17.2 go generate —— 代码生成

```go
// 在源代码里写
//go:generate stringer -type=Status

// 然后跑
go generate ./...
// 会执行后面的命令（这里是 stringer 工具，自动生成 Status 的 String() 方法）
```

### 17.3 竞态检测

```bash
# 检测代码是否有 data race
go test -race ./...
go build -race .
go run -race main.go

# 如果有 data race，输出会告诉你是哪两个 goroutine 在哪两行代码上冲突
```

### 17.4 性能分析（pprof）

```go
import _ "net/http/pprof"   // 在 import 里加这个

go func() {
    log.Println(http.ListenAndServe("localhost:6060", nil))
}()

// 浏览器访问 http://localhost:6060/debug/pprof/
```

---

## 18. 实用代码片段

### 18.1 完整的 HTTP REST API（最小示例）

```go
package main

import (
    "encoding/json"
    "log"
    "net/http"
    "strconv"
    "sync"
)

type Todo struct {
    ID    int    `json:"id"`
    Title string `json:"title"`
    Done  bool   `json:"done"`
}

type TodoStore struct {
    mu    sync.Mutex
    todos map[int]Todo
    nextID int
}

func NewTodoStore() *TodoStore {
    return &TodoStore{todos: make(map[int]Todo), nextID: 1}
}

func main() {
    store := NewTodoStore()

    http.HandleFunc("/todos", func(w http.ResponseWriter, r *http.Request) {
        switch r.Method {
        case "GET":
            store.mu.Lock()
            list := make([]Todo, 0, len(store.todos))
            for _, t := range store.todos {
                list = append(list, t)
            }
            store.mu.Unlock()
            w.Header().Set("Content-Type", "application/json")
            json.NewEncoder(w).Encode(list)

        case "POST":
            var t Todo
            if err := json.NewDecoder(r.Body).Decode(&t); err != nil {
                http.Error(w, err.Error(), http.StatusBadRequest)
                return
            }
            store.mu.Lock()
            t.ID = store.nextID
            store.nextID++
            store.todos[t.ID] = t
            store.mu.Unlock()
            w.WriteHeader(http.StatusCreated)
            json.NewEncoder(w).Encode(t)

        default:
            http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
        }
    })

    http.HandleFunc("/todos/", func(w http.ResponseWriter, r *http.Request) {
        id, err := strconv.Atoi(r.URL.Path[len("/todos/"):])
        if err != nil {
            http.Error(w, "invalid id", http.StatusBadRequest)
            return
        }
        store.mu.Lock()
        t, ok := store.todos[id]
        store.mu.Unlock()
        if !ok {
            http.NotFound(w, r)
            return
        }
        w.Header().Set("Content-Type", "application/json")
        json.NewEncoder(w).Encode(t)
    })

    log.Println("Server running on :8080")
    log.Fatal(http.ListenAndServe(":8080", nil))
}
```

### 18.2 读取配置文件

```go
config := struct {
    Host string `json:"host"`
    Port int    `json:"port"`
}{Host: "localhost", Port: 8080}  // 默认值

data, err := os.ReadFile("config.json")
if err == nil {
    json.Unmarshal(data, &config)
}
```

### 18.3 并发安全的缓存

```go
type Cache struct {
    mu   sync.RWMutex
    data map[string]any
}

func (c *Cache) Get(key string) (any, bool) {
    c.mu.RLock()
    defer c.mu.RUnlock()
    v, ok := c.data[key]
    return v, ok
}

func (c *Cache) Set(key string, value any) {
    c.mu.Lock()
    defer c.mu.Unlock()
    c.data[key] = value
}
```

---

## 19. 常见陷阱与最佳实践

1. **nil map 不能写入** —— `var m map[string]int` 后直接 `m["a"]=1` 会 panic。必须 `make`。

2. **切片 append 可能共享底层数组** —— `sub := s[1:3]; append(sub, 99)` 可能影响 `s`。需要独立时用 `copy` 或 `slices.Clone`。

3. **循环中的 goroutine 闭包捕获循环变量（Go 1.22 已修复）** —— Go 1.22+ 循环变量每次迭代都是新变量，不再需要 `i := i` 的技巧。但老代码里仍会遇到，写法是 `go func(i int) { ... }(i)`。

4. **defer 在循环里** —— `for { defer f.Close() }` 会把所有 Close 堆到函数尾才执行，可能导致文件描述符耗尽。循环里直接用 `f.Close()` 或封到匿名函数里。

5. **接口的 nil 不等于 nil** —— 一个接口值包含（类型, 值）两部分。`var w io.Writer = (*os.File)(nil)` 后 `w == nil` 是 `false`！因为类型部分不为 nil。只有类型和值都为 nil，接口才是 nil。

6. **时间格式化字符串** —— 不是 YYYY-MM-DD，是 `2006-01-02 15:04:05`。记住这个神奇数字：1月2日3时4分5秒2006年。

7. **goroutine 泄漏** —— 如果你创建了一个 goroutine 但从不退出，它就是泄漏。用 `context` 或 `channel close` 发信号让它退出。

8. **没有 set，也不建议用 map[T]bool 当 set** —— 用 `map[T]struct{}`，`struct{}` 占 0 字节。

9. **错误应该只有一处日志** —— 要么在函数里 log，要么 return 给调用方 log，不要两次都打。原则是 "errors are values"，返回 error 让上层决定怎么处理。

10. **public 包名和文件名** —— 包名不要用 `util`、`common`、`misc`、`helper`。这种包会变成垃圾桶。按功能命名：`auth`、`config`、`storage`。

11. **`panic` 不像异常，不要做常规控制流** —— `panic` 是"程序出现不可恢复的错误了"，类似其他语言的 fatal。真正的错误场景用 `error` 返回值。`recover` 只在极少数场合用（如 HTTP handler 兜底）。

12. **`iota` 从 0 开始** —— 如果你的枚举值需要 0 有意义，小心 iota。可以用 `iota + 1` 或 `_` 跳过 0。

13. **interface 应该小而精** —— Go 推荐 "由调用方定义接口"，而不是实现方预先定义大接口。标准库的 `io.Reader` 只有一个方法。如果你定义了一个 10 个方法的接口，可能需要拆开。

14. **不要用 `go get` 获取不是工具的非 main 包作为可执行程序** —— `go get` 现在只用于添加依赖。安装工具用 `go install package@version`。

15. **文件夹名 = 包名** —— Go 社区极不建议文件夹名和包名不一致。`user/` 目录里必须 `package user`。唯一例外是测试文件可用 `package user_test` 做黑盒测试。
