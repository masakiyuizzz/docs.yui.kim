# lfs-test-server —— 本地 Git LFS 测试服务器

> Git LFS API 的极简 Go 实现。用于本地开发/测试，非生产用途。
> 官方仓库：[github.com/git-lfs/lfs-test-server](https://github.com/git-lfs/lfs-test-server)
> 本机版本：0.4.0（arm64，Go 1.25.1 编译）
> 安装路径：`~/go/bin/lfs-test-server`

---

## 目录

1. [安装](#1-安装)
2. [启动与停止](#2-启动与停止)
3. [环境变量完整参考](#3-环境变量完整参考)
4. [端口与地址配置](#4-端口与地址配置)
5. [认证配置](#5-认证配置)
6. [TLS / HTTPS 配置](#6-tls--https-配置)
7. [存储路径](#7-存储路径)
8. [日志输出](#8-日志输出)
9. [客户端对接](#9-客户端对接)
10. [管理 API](#10-管理-api)
11. [Docker 部署](#11-docker-部署)
12. [注意事项与陷阱](#12-注意事项与陷阱)

---

## 1. 安装

```bash
# Go install（推荐，本机安装方式）
go install github.com/github/lfs-test-server@latest

# 安装后二进制路径
ls -la ~/go/bin/lfs-test-server

# 源码编译
git clone https://github.com/git-lfs/lfs-test-server
cd lfs-test-server
go build -o lfs-test-server .
```

**依赖**：Go 1.21+、Git、无外部运行时依赖（单二进制）。

---

## 2. 启动与停止

```bash
# 启动（前台运行，默认监听 tcp://:8080）
~/go/bin/lfs-test-server

# 输出示例：
# 2026-05-18T13:12:09Z yui.local lfs[9136] ... msg=listening pid=9136 addr=tcp://:8080 version=0.4.0

# 后台运行
~/go/bin/lfs-test-server &
# 停止：kill %1  或  pkill lfs-test-server

# 指定监听地址
LFS_LISTEN="tcp://:9999" ~/go/bin/lfs-test-server

# 停止所有 lfs-test-server 进程
pkill lfs-test-server
```

---

## 3. 环境变量完整参考

所有配置通过环境变量完成，没有命令行参数，没有配置文件。

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `LFS_LISTEN` | `tcp://:8080` | 监听地址（tcp://host:port 或 unix:///path） |
| `LFS_HOST` | `localhost:8080` | 对外宣告的主机地址（用于 LFS API URL 生成） |
| `LFS_SCHEME` | `http` | 协议（`http` 或 `https`） |
| `LFS_ADMINUSER` | （空） | 管理 API 用户名 |
| `LFS_ADMINPASS` | （空） | 管理 API 密码 |
| `LFS_CERT` | （空） | TLS 证书文件路径（`server.crt`） |
| `LFS_KEY` | （空） | TLS 私钥文件路径（`server.key`） |
| `LFS_CONTENTPATH` | `lfs-content` | LFS 对象本地存储路径 |
| `LFS_USETUS` | `false` | 启用 tusd 断点续传上传（需额外装 tusd） |
| `LFS_TUSHOST` | `localhost:1080` | tusd 服务地址 |
| `LFS_PUBLIC` | `false` | `true` 表示无需认证即可读取 |

---

## 4. 端口与地址配置

```bash
# 默认 8080 端口
~/go/bin/lfs-test-server

# 指定端口
LFS_LISTEN="tcp://:9000" LFS_HOST="192.168.1.100:9000" ~/go/bin/lfs-test-server

# 仅监听本地（外部不可访问）
LFS_LISTEN="tcp://127.0.0.1:8080" ~/go/bin/lfs-test-server

# 监听所有接口
LFS_LISTEN="tcp://0.0.0.0:8080" ~/go/bin/lfs-test-server

# Unix domain socket（Mac / Linux）
LFS_LISTEN="unix:///tmp/lfs-server.sock" ~/go/bin/lfs-test-server
```

**关键**：`LFS_HOST` 必须与客户端访问服务器的地址一致，因为服务器会在 LFS Batch API 响应中返回完整 URL，客户端据此下载/上传。

---

## 5. 认证配置

```bash
# 启用管理认证
export LFS_ADMINUSER="admin"
export LFS_ADMINPASS="secret123"
~/go/bin/lfs-test-server
# 管理 API 需要 Basic Auth：admin:secret123

# 设为公开读取（不需要认证也能读取 LFS 对象）
LFS_PUBLIC="true" ~/go/bin/lfs-test-server
```

**默认行为**：不设 `LFS_ADMINUSER` 时，上传不需要认证，任何人都可以 PUT。设了之后只有管理 API 需要认证，普通 LFS 上传仍不需要。

---

## 6. TLS / HTTPS 配置

```bash
# 生成自签名证书
openssl req -x509 -newkey rsa:4096 -keyout server.key -out server.crt \
    -days 365 -nodes -subj "/CN=localhost"

# 启动 HTTPS
LFS_SCHEME="https" \
LFS_CERT="./server.crt" \
LFS_KEY="./server.key" \
LFS_HOST="localhost:8080" \
~/go/bin/lfs-test-server

# 客户端配置（跳过证书验证，仅开发环境）
git config lfs.https://localhost:8080/.sslverify false
```

---

## 7. 存储路径

```bash
# 默认存储路径：当前目录下的 lfs-content/
~/go/bin/lfs-test-server
# 对象保存在 ./lfs-content/<oid前2位>/<oid完整值>

# 自定义存储路径
LFS_CONTENTPATH="/data/lfs-storage" ~/go/bin/lfs-test-server
# 对象保存在 /data/lfs-storage/<oid前2位>/<oid完整值>

# 查看存储结构
tree ./lfs-content/
# lfs-content/
# └── 4e/
#     └── 4e9a8c2e5f...

# 查看存储用量
du -sh ./lfs-content/
```

**存储格式**：LFS 对象按 OID（SHA-256 的 hex 字符串）存储，前 2 位作为子目录名。

---

## 8. 日志输出

```bash
# 日志默认输出到 stderr
~/go/bin/lfs-test-server

# 重定向日志到文件
~/go/bin/lfs-test-server 2> lfs-server.log

# 同时输出到终端和文件
~/go/bin/lfs-test-server 2>&1 | tee lfs-server.log

# 查看最近日志
tail -f lfs-server.log
```

**日志格式**：ISO 8601 时间戳 + 主机名 + 进程名 + PID + 日志消息。

---

## 9. 客户端对接

### 9.1 设置 lfs.url

```bash
# 设置仓库的 LFS 服务器地址
cd /path/to/your/repo
git config lfs.url "http://localhost:8080"

# 或写入 .lfsconfig（可提交到仓库共享）
git config -f .lfsconfig lfs.url "http://localhost:8080"
git add .lfsconfig
git commit -m "Configure local LFS server"

# 查看当前 LFS 端点
git lfs env | grep Endpoint
```

### 9.2 验证连通性

```bash
# 手动测试 API 端点
curl http://localhost:8080/
# 应该返回 404 但说明服务可达

# 测试认证（如果启用了 ADMINUSER）
curl -u admin:secret123 http://localhost:8080/mgmt

# 测试 LFS Batch API
curl -X POST http://localhost:8080/org/repo/objects/batch \
    -H "Content-Type: application/json" \
    -H "Accept: application/vnd.git-lfs+json" \
    -d '{"operation":"download","objects":[]}'
```

### 9.3 推送 LFS 对象

```bash
cd /path/to/repo

# 正常 git push 会自动触发 LFS 推送
git lfs push origin main

# 或手动推送
git lfs push --all origin
```

---

## 10. 管理 API

仅当设置了 `LFS_ADMINUSER` 和 `LFS_ADMINPASS` 时可用，使用 HTTP Basic Auth。

```bash
# 列出所有 LFS 对象
curl -u admin:secret123 http://localhost:8080/mgmt

# 删除特定对象
curl -u admin:secret123 -X DELETE \
    http://localhost:8080/mgmt/objects/4e9a8c2e5f...

# 验证对象是否存在
curl -u admin:secret123 -I \
    http://localhost:8080/org/repo/objects/4e9a8c2e5f...

# 获取对象下载 URL
curl -u admin:secret123 \
    http://localhost:8080/org/repo/objects/4e9a8c2e5f...
```

**管理 API 端点**：
| 方法 | 路径 | 说明 |
|------|------|------|
| `GET` | `/mgmt` | 列出所有 LFS 对象 |
| `DELETE` | `/mgmt/objects/:oid` | 删除指定对象 |
| `POST` | `/:org/:repo/objects/batch` | LFS Batch API（客户端用） |
| `GET/PUT` | `/:org/:repo/objects/:oid` | 下载/上传单个对象 |

---

## 11. Docker 部署

```bash
# 官方 Dockerfile 构建
git clone https://github.com/git-lfs/lfs-test-server
cd lfs-test-server
docker build -t lfs-test-server .

# 运行
docker run -d -p 8080:8080 \
    -v /host/storage:/lfs-storage \
    -e LFS_LISTEN="tcp://:8080" \
    -e LFS_HOST="localhost:8080" \
    -e LFS_CONTENTPATH="/lfs-storage" \
    --name lfs-server \
    lfs-test-server

# 查看日志
docker logs -f lfs-server
```

---

## 12. 注意事项与陷阱

1. **非生产就绪**：lfs-test-server 是为测试 LFS 客户端而设计的极简服务器，没有高可用、备份、横向扩展等生产特性。

2. **无内置数据库**：使用文件系统存储，元数据存在内存中的 map 里，重启即丢失（但存储对象不丢失）。如需持久化元数据，需要配合外部数据库改造。

3. **`LFS_HOST` 必须正确**：客户端握手时会收到服务器返回的 URL，如果 `LFS_HOST` 设置与实际访问地址不同（如 `localhost` vs `192.168.x.x`），客户端将无法下载上传。

4. **认证仅限 Management API**：设置 `LFS_ADMINUSER` 只保护 `/mgmt` 路径，普通 LFS 上传不要求认证。

5. **端口冲突**：默认 8080 端口如果被其他服务占用，需要通过 `LFS_LISTEN` 换端口。

6. **存储路径相对性**：默认 `LFS_CONTENTPATH` 是相对路径 `lfs-content`，以启动进程时的工作目录为准。建议用绝对路径。

7. **`LFS_SCHEME` 影响 API URL**：`LFS_HOST` 不包含协议，协议由 `LFS_SCHEME` 决定。HTTPS 模式需要同时设置 `LFS_CERT` 和 `LFS_KEY`。

8. **日志默认 stderr**：如果后台运行（`&`），日志会混入终端，建议重定向。

9. **并发限制**：无内置并发限制，但 Go 运行时自然支持高并发，一般够用。

10. **lfs-test-server 是单进程**：只适合单用户/本地开发场景，不适合团队协作。

---

## 13. 实践示例：从零搭建本地 Git + LFS 完整工作流

> 本示例带你走完完整的本地 LFS 环境：启动服务器 → 创建仓库 → 配置 LFS 跟踪 → 推送大文件 → 克隆验证 → 撰写管理脚本。
> 整条链路纯本地运行，不依赖任何外部服务。

### 13.1 架构概览

```
┌────────────────────┐     git push/pull      ┌─────────────────────┐
│  User Repo Clone   │ ─────────────────────→ │   Git Remote (bare)  │
│  ~/projects/myproj │                        │  ~/git-server/myproj │
│                     │                        │  只有指针文件        │
│  git config lfs.url│                          / 1KB each            │
│  = http://         │                        └──────┬──────────────┘
│    localhost:8080  │                               │
└─────────┬──────────┘                               │
          │ lfs push/pull                            │
          │ (大文件本体)                                │
          ▼                                          ▼
┌─────────────────────────────────────────────────────────┐
│              lfs-test-server (:8080)                     │
│  LFS_CONTENTPATH=/data/lfs-storage                       │
│  ~/go/bin/lfs-test-server &                              │
│                                                          │
│  lfs-storage/                                            │
│  ├── 4e/4e9a8c2e5f...  (video.mp4 v1)                  │
│  ├── 7b/7b3d5f7a9c...  (design.psd)                     │
│  └── a1/a1b2c3d4e5...  (dataset.zip)                    │
└─────────────────────────────────────────────────────────┘
```

**关键点**：
- Git 远程仓库（bare）只存指针文件（≈130B/个）
- LFS 服务器存储真正的大文件体
- 用户在本地仓库工作，`git push` 自动分流指针到 Git remote、文件体到 LFS 服务器

### 13.2 第一步：启动 LFS 服务器

```bash
#!/bin/bash
# -- 新建终端窗口 1：启动 LFS 服务器 --

# 创建工作目录
mkdir -p ~/lfs-server
cd ~/lfs-server

# 设置环境变量（写入脚本方便复用）
export LFS_LISTEN="tcp://:8080"
export LFS_HOST="localhost:8080"
export LFS_SCHEME="http"
export LFS_CONTENTPATH="${HOME}/lfs-server/lfs-storage"
export LFS_PUBLIC="true"          # 允许公开读取
export LFS_ADMINUSER="admin"      # 管理 API 认证
export LFS_ADMINPASS="lfs_secret"

# 确保存储目录存在
mkdir -p "$LFS_CONTENTPATH"

# 启动服务器（前台运行，方便观察日志）
~/go/bin/lfs-test-server 2>&1 | tee ~/lfs-server/server.log

# 输出类似：
# 2026-05-18T13:00:00Z yui.local lfs[12345] ... msg=listening pid=12345 addr=tcp://:8080 version=0.4.0
```

**验证服务已启动**：
```bash
# 新终端测试
curl http://localhost:8080/
# 返回空或 404（正常，说明服务在运行）

# 测试管理 API
curl -u admin:lfs_secret http://localhost:8080/mgmt
# 返回：{"objects":[]}
```

### 13.3 第二步：创建 Git bare 远程仓库

```bash
#!/bin/bash
# -- 新建终端窗口 2：初始化仓库 --

# 创建 Git 服务器目录
mkdir -p ~/git-server

# 创建一个 bare 仓库
cd ~/git-server
git init --bare myproject.git
# Initialized empty Git repository in ~/git-server/myproject.git/

# 此时 bare 仓库还不包含 LFS 信息，后续第一次 push 时会带入
```

### 13.4 第三步：创建本地工作仓库，配置 LFS

```bash
#!/bin/bash
# -- 仍在终端窗口 2 --

# 克隆 bare 仓库
cd ~/projects
git clone ~/git-server/myproject.git myproject
cd myproject

# 安装 LFS hooks
git lfs install
# Git LFS initialized.

# 配置 LFS 服务器地址
git config lfs.url "http://localhost:8080"

# 验证 LFS 环境
git lfs env | grep -E "Endpoint|lfs.url"
# Endpoint=http://localhost:8080 (auth=none)
# lfs.url=http://localhost:8080

# 跟踪常见大文件类型
git lfs track "*.psd" "*.mp4" "*.zip" "*.dmg" "*.iso" "*.blend"
# 查看跟踪规则
git lfs track
# Listing tracked patterns
#     *.psd (.gitattributes)
#     *.mp4 (.gitattributes)
#     ...

# 提交 LFS 配置
git add .gitattributes
git commit -m "Setup Git LFS tracking"
```

### 13.5 第四步：创建大文件并提交

```bash
#!/bin/bash
# -- 仍在 myproject 仓库 --

# 创建一些模拟"大文件"
dd if=/dev/urandom of=design.psd bs=1m count=10
dd if=/dev/urandom of=demo.mp4 bs=1m count=50
dd if=/dev/urandom of=assets.zip bs=1m count=20

# 查看文件大小
ls -lh *.psd *.mp4 *.zip
# -rw-r--r--  1 user  staff  10M .../design.psd
# -rw-r--r--  1 user  staff  50M .../demo.mp4
# -rw-r--r--  1 user  staff  20M .../assets.zip

# 创建 README
echo "# My LFS Project" > README.md

# 添加所有文件
git add README.md design.psd demo.mp4 assets.zip

# 查看 git 状态
git status
# On branch main
# Changes to be committed:
#     new file: README.md
#     new file: assets.zip
#     new file: demo.mp4
#     new file: design.psd

# 检查 LFS 文件是否被正确追踪
git lfs ls-files
# c3d4e5f607 * assets.zip
# 7b3d5f7a9c * demo.mp4
# 4e9a8c2e5f * design.psd
# * = 本地已缓存（clean filter 已生效）

# 提交
git commit -m "Initial project with assets"
```

### 13.6 第五步：推送到远程（分离推送）

```bash
# 推送 Git 对象 + LFS 对象
git push -u origin main

# 预期输出：
# Uploading LFS objects: 100% (3/3), 80 MB | 0 B/s, done.
# Enumerating objects: 7, done.
# ...
# To ~/git-server/myproject.git
#  * [new branch] main -> main

# 检查 LFS 推送状态
git lfs status
# On branch main
# Objects to be pushed to origin/main:
#     (nothing... all pushed)

# 验证 Git bare 仓库中只有指针（文件很小）
ls -lh ~/git-server/myproject.git/objects/       # 只有小对象
du -sh ~/git-server/myproject.git/               # 几 MB 而已

# 验证 LFS 服务器上存储了真正的文件
du -sh ~/lfs-server/lfs-storage/
# 80M ~/lfs-server/lfs-storage/

tree ~/lfs-server/lfs-storage/
# lfs-storage/
# ├── 4e/
# │   └── 4e9a8c2e5f2c7c3a6d6f...
# ├── 7b/
# │   └── 7b3d5f7a9c2e5f4d6b8a...
# └── c3/
#     └── c3d4e5f607a9b2c1d8f4...

# 管理 API 查看注册对象
curl -u admin:lfs_secret http://localhost:8080/mgmt
# {"objects":[{"oid":"4e9a8c2e5f...","size":10485760},...]}
```

### 13.7 第六步：克隆到新位置，验证 LFS 还原

```bash
# 在新目录克隆
cd ~/projects
git clone ~/git-server/myproject.git myproject-clone
cd myproject-clone

# 查看文件 —— 应该是真实内容，不是指针
ls -lh
# -rw-r--r--  1 user  staff  10M .../design.psd
# -rw-r--r--  1 user  staff  50M .../demo.mp4
# -rw-r--r--  1 user  staff  20M .../assets.zip

# 验证 LFS 文件有正确的 * 标记
git lfs ls-files
# 4e9a8c2e5f * design.psd
# 7b3d5f7a9c * demo.mp4
# c3d4e5f607 * assets.zip

# 文件内容一致
sha256sum design.psd
# 和原始文件比对应该相同

echo "✅ LFS 服务器工作正常！"
```

### 13.8 第七步：测试文件锁定流程

```bash
# 回到 myproject（第一个克隆）
cd ~/projects/myproject

# 新建一个 lockable 文件类型
git lfs track --lockable "*.blend"
echo "// Placeholder" > scene.blend
git add .gitattributes scene.blend
git commit -m "Add blend file with locking"
git push

# 锁定文件
git lfs lock scene.blend
# Locked scene.blend

# 查看锁定列表
git lfs locks
# scene.blend  fumimutsumi  ID:1

# 在 myproject-clone 尝试锁定（应该提示已被锁定）
cd ~/projects/myproject-clone
git pull
git lfs lock scene.blend
# Lock failed: already created lock

# 解锁
cd ~/projects/myproject
git lfs unlock scene.blend
```

### 13.9 第八步：管理脚本 —— 将以上流程自动化

将所有步骤整合为一套可复用的脚本。

**脚本 A：`lfs-server-ctl` —— 服务器生命周期管理**

```bash
#!/bin/bash
# 文件名：~/scripts/lfs-server-ctl
# 用法：
#   lfs-server-ctl start   启动 LFS 服务器
#   lfs-server-ctl stop    停止 LFS 服务器
#   lfs-server-ctl status  查看状态
#   lfs-server-ctl log     查看日志

set -e

SERVER_BIN="${HOME}/go/bin/lfs-test-server"
BASE_DIR="${HOME}/lfs-server"
STORAGE_DIR="${BASE_DIR}/lfs-storage"
LOG_FILE="${BASE_DIR}/server.log"
PID_FILE="${BASE_DIR}/server.pid"

# 环境配置
export LFS_LISTEN="${LFS_LISTEN:-tcp://:8080}"
export LFS_HOST="${LFS_HOST:-localhost:8080}"
export LFS_SCHEME="${LFS_SCHEME:-http}"
export LFS_CONTENTPATH="${STORAGE_DIR}"
export LFS_PUBLIC="${LFS_PUBLIC:-true}"
export LFS_ADMINUSER="${LFS_ADMINUSER:-admin}"
export LFS_ADMINPASS="${LFS_ADMINPASS:-lfs_secret}"

mkdir -p "$BASE_DIR" "$STORAGE_DIR"

is_running() {
    if [[ -f "$PID_FILE" ]]; then
        local pid
        pid=$(cat "$PID_FILE")
        if kill -0 "$pid" 2>/dev/null; then
            return 0
        fi
    fi
    return 1
}

case "${1:-}" in
    start)
        if is_running; then
            echo "LFS 服务器已在运行 (PID: $(cat "$PID_FILE"))"
            exit 0
        fi

        echo "启动 LFS 服务器..."
        echo "  监听地址: $LFS_LISTEN"
        echo "  存储路径: $STORAGE_DIR"
        echo "  日志文件: $LOG_FILE"

        "$SERVER_BIN" >> "$LOG_FILE" 2>&1 &
        echo $! > "$PID_FILE"

        sleep 1
        if is_running; then
            echo "✅ LFS 服务器已启动 (PID: $(cat "$PID_FILE"))"
        else
            echo "❌ 启动失败，查看日志：tail $LOG_FILE"
            rm -f "$PID_FILE"
            exit 1
        fi
        ;;

    stop)
        if ! is_running; then
            echo "LFS 服务器未运行。"
            rm -f "$PID_FILE"
            exit 0
        fi

        local pid
        pid=$(cat "$PID_FILE")
        echo "停止 LFS 服务器 (PID: $pid)..."
        kill "$pid"
        sleep 1
        if kill -0 "$pid" 2>/dev/null; then
            echo "强制停止..."
            kill -9 "$pid"
        fi
        rm -f "$PID_FILE"
        echo "✅ LFS 服务器已停止。"
        ;;

    status)
        if is_running; then
            local pid
            pid=$(cat "$PID_FILE")
            echo "✅ LFS 服务器运行中"
            echo "   PID: $pid"
            echo "   地址: $LFS_HOST ($LFS_SCHEME)"
            echo "   存储: $STORAGE_DIR"
            local size
            size=$(du -sh "$STORAGE_DIR" 2>/dev/null | cut -f1)
            echo "   用量: ${size:-0}"
        else
            echo "❌ LFS 服务器未运行。"
        fi
        ;;

    log)
        if [[ -f "$LOG_FILE" ]]; then
            tail -f "$LOG_FILE"
        else
            echo "暂无日志文件。"
        fi
        ;;

    restart)
        "$0" stop
        sleep 1
        "$0" start
        ;;

    *)
        echo "用法：$0 {start|stop|status|log|restart}"
        exit 1
        ;;
esac
```

**脚本 B：`lfs-repo-init` —— 为新仓库配置 LFS**

```bash
#!/bin/bash
# 文件名：~/scripts/lfs-repo-init
# 用法：
#   lfs-repo-init myproject                   创建 bare + 本地仓库并配置 LFS
#   lfs-repo-init myproject --git-url ~/git-server 指定 Git 远程路径
#   lfs-repo-init myproject --lfs-url http://myhost:8080 指定 LFS 服务器

set -e

PROJECT="${1:?用法: $0 <project-name> [--git-url <path>] [--lfs-url <url>]}"
shift

GIT_SERVER="${HOME}/git-server"
LFS_URL="${LFS_URL:-http://localhost:8080}"

while [[ $# -gt 0 ]]; do
    case "$1" in
        --git-url) GIT_SERVER="$2"; shift 2 ;;
        --lfs-url) LFS_URL="$2"; shift 2 ;;
        *) echo "未知参数：$1"; exit 1 ;;
    esac
done

BARE_REPO="${GIT_SERVER}/${PROJECT}.git"
WORK_DIR="${HOME}/projects/${PROJECT}"

echo "=== 初始化 LFS 仓库：$PROJECT ==="
echo "  Git 远程：$BARE_REPO"
echo "  LFS 服务器：$LFS_URL"
echo "  工作目录：$WORK_DIR"
echo ""

# 1. 创建 Git bare 远程
mkdir -p "$GIT_SERVER"
git init --bare "$BARE_REPO"
echo "✅ Bare 仓库创建完成。"

# 2. 克隆到工作目录
mkdir -p "$(dirname "$WORK_DIR")"
git clone "$BARE_REPO" "$WORK_DIR"
cd "$WORK_DIR"

# 3. 安装 LFS
git lfs install

# 4. 配置 LFS 服务器
git config lfs.url "$LFS_URL"

# 5. 配置常见文件跟踪
cat > .gitattributes << 'EOF'
# 图像/设计
*.psd filter=lfs diff=lfs merge=lfs -text
*.ai filter=lfs diff=lfs merge=lfs -text
*.fig filter=lfs diff=lfs merge=lfs -text lockable
*.blend filter=lfs diff=lfs merge=lfs -text lockable
*.sketch filter=lfs diff=lfs merge=lfs -text

# 音视频
*.mp4 filter=lfs diff=lfs merge=lfs -text
*.mov filter=lfs diff=lfs merge=lfs -text
*.mp3 filter=lfs diff=lfs merge=lfs -text
*.wav filter=lfs diff=lfs merge=lfs -text

# 压缩/磁盘
*.zip filter=lfs diff=lfs merge=lfs -text
*.dmg filter=lfs diff=lfs merge=lfs -text
*.iso filter=lfs diff=lfs merge=lfs -text
*.tar.gz filter=lfs diff=lfs merge=lfs -text

# 数据
*.bin filter=lfs diff=lfs merge=lfs -text
*.weights filter=lfs diff=lfs merge=lfs -text
*.onnx filter=lfs diff=lfs merge=lfs -text
EOF

# 6. 初始提交
echo "# $PROJECT" > README.md
git add .gitattributes README.md
git commit -m "Init: LFS repository setup"
git push -u origin main

echo ""
echo "=== ✅ 仓库就绪 ==="
echo "  工作目录：$WORK_DIR"
echo "  下次使用：cd $WORK_DIR"
```

### 13.10 第九步：日常使用流程

```bash
# 每日工作流

# 1. 确保 LFS 服务器运行
lfs-server-ctl status

# 2. 进入项目
cd ~/projects/myproject

# 3. 拉取最新代码 + LFS 文件
git pull

# 4. 编辑锁定文件前先锁定
git lfs lock design/main.fig

# 5. 正常开发...
#    git add ...
#    git commit ...

# 6. 推送
git push
# 自动推 LFS 对象

# 7. 解锁
git lfs unlock design/main.fig

# 8. 定期清理本地 LFS 缓存
git lfs prune --recent=14
```

### 13.11 故障排查

```bash
# 问题 1：git push 时 LFS 上传失败
# 检查 LFS 服务器状态
lfs-server-ctl status
curl http://localhost:8080/

# 检查 lfs.url 配置
git config lfs.url
git lfs env | grep Endpoint

# 问题 2：clone 后文件是指针而非真实内容
# 文件内容类似 version https://git-lfs.github.com/spec/v1...
# 原因：LFS 服务器不可达或 lfs.url 配置丢失
git lfs pull
git config lfs.url "http://localhost:8080"
git lfs pull

# 问题 3：服务器端口被占用
lsof -i :8080
# 换端口
LFS_LISTEN="tcp://:8081" LFS_HOST="localhost:8081" lfs-server-ctl restart

# 问题 4：锁定不了文件（提示 not lockable）
# 检查 .gitattributes 中是否包含 lockable
grep lockable .gitattributes
# 如果没有，重新 track
git lfs track --lockable "*.fig"
git add .gitattributes
git commit -m "Enable locking"
git push

# 问题 5：LFS 对象占用磁盘太大
# 查看大小
du -sh ~/lfs-server/lfs-storage/
# 清理未引用本地缓存
git lfs prune --verify-remote
```

### 13.12 可选增强：协同两台 Mac 使用

需要在局域网中共享 LFS 服务器：

```bash
# 服务器端 Mac（假设 IP 192.168.1.100）
export LFS_LISTEN="tcp://0.0.0.0:8080"
export LFS_HOST="192.168.1.100:8080"
lfs-server-ctl start

# 客户端 Mac
cd ~/projects/myproject
git config lfs.url "http://192.168.1.100:8080"

# Git 远程可以用任何可达的方式：
# 1. 本地 bare 仓库（只适合单机）: ~/git-server/myproject.git
# 2. Git over SSH: git@192.168.1.100:~/git-server/myproject.git
# 3. GitHub/GitLab（Git 在远端，LFS 在本地）
```

---

## 14. 与 standalone-file 模式的对比

lfs-test-server 不是本地 LFS 的唯一方案。Git LFS 自带 **standalone-file adapter**，可以直接用本地路径存储 LFS 对象，无需启动服务器。

```bash
# standalone-file 方式（更简单，无需服务器）
git config lfs.url "file:///Users/fumimutsumi/lfs-storage"

# lfs-test-server 方式（更灵活，支持 HTTP/认证/多客户端）
git config lfs.url "http://localhost:8080"
```

| 特性 | standalone-file | lfs-test-server |
|------|----------------|-----------------|
| 启动服务器 | 不需要 | 需要 |
| 多机器共享 | 需要 NFS/文件共享 | 直接 HTTP 访问 |
| 认证 | 文件系统权限 | Basic Auth（mgmt API） |
| 锁定文件 | 不支持 | 支持 (lockable) |
| 管理 API | 无 | 有 (/mgmt) |
| 生产就绪 | 可（文件系统级别） | 不适合 |

**建议**：单机开发用 standalone-file，需要网络共享 / 锁定 / 管理功能时用 lfs-test-server。
