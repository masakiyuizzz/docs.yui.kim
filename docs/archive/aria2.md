# aria2c —— 超高速多协议下载工具

> 轻量级、多协议、多线程的命令行下载工具。支持 HTTP(S)/FTP/SFTP/BitTorrent/Metalink，断点续传，分段下载。
> 版本：1.37.0（本机 Homebrew 安装）
> 官网：[aria2.github.io](https://aria2.github.io)
> 开发者：Tatsuhiro Tsujikawa © 2006-2019

---

## 目录

1. [安装](#1-安装)
2. [基本用法](#2-基本用法)
3. [核心选项详解](#3-核心选项详解)
4. [HTTP/HTTPS 下载](#4-httphttps-下载)
5. [BitTorrent / 磁力链接](#5-bittorrent--磁力链接)
6. [Metalink 下载](#6-metalink-下载)
7. [输入文件批量下载](#7-输入文件批量下载)
8. [代理配置](#8-代理配置)
9. [限速与并发控制](#9-限速与并发控制)
10. [RPC 远程控制](#10-rpc-远程控制)
11. [配置文件 aria2.conf](#11-配置文件-aria2conf)
12. [实战脚本示例](#12-实战脚本示例)
13. [完整选项速查表](#13-完整选项速查表)
14. [注意事项与陷阱](#14-注意事项与陷阱)

---

## 1. 安装

```bash
# macOS Homebrew（本机安装方式）
brew install aria2

# Debian/Ubuntu
sudo apt install aria2

# Fedora
sudo dnf install aria2

# Arch Linux
sudo pacman -S aria2

# Windows (winget)
winget install aria2
```

验证安装：
```bash
aria2c --version
# aria2 version 1.37.0
```

**本机编译特性**：
BitTorrent, Firefox3 Cookie, GZip, HTTPS, Message Digest, Metalink, XML-RPC, SFTP

---

## 2. 基本用法

aria2 的可执行文件名为 `aria2c`（c = client）。

```bash
# 基础下载
aria2c https://example.com/file.zip

# 指定输出目录
aria2c -d ~/Downloads https://example.com/file.zip

# 指定输出文件名
aria2c -o myfile.zip https://example.com/file.zip

# 下载多个文件
aria2c https://example.com/file1.zip https://example.com/file2.zip

# 多源同文件下载（从多个镜像）
aria2c https://mirror1/file.zip https://mirror2/file.zip https://mirror3/file.zip
```

---

## 3. 核心选项详解

### 目录与输出

| 选项 | 说明 |
|------|------|
| `-d DIR` | 下载目录（默认当前目录） |
| `-o FILE` | 输出文件名 |
| `-c` | 断点续传 |
| `-V` | 校验文件完整性（hash 验证） |

### 并发与分片

| 选项 | 说明 | 默认 |
|------|------|------|
| `-s N` | 每个文件的分片数（连接数） | 5 |
| `-j N` | 并行下载任务数 | 5 |
| `-x N` | 单服务器最大连接数 | 1 |
| `-k SIZE` | 最小分片大小 | 20M |
| `-Z` | 命令行中的 URL 顺序下载（默认并行） | - |

```bash
# 高性能下载：16 线程 + 4M 最小分片
aria2c -s 16 -x 8 -k 4M https://example.com/largefile.iso

# 并发 10 个文件（默认 5），每个 8 线程
aria2c -j 10 -s 8 https://example.com/file1.zip https://example.com/file2.zip ...

# 顺序下载（而非并行）
aria2c -Z https://example.com/file1.zip https://example.com/file2.zip
```

### 重试与超时

| 选项 | 说明 | 默认 |
|------|------|------|
| `-m N` | 最大重试次数（0=无限） | 5 |
| `--retry-wait SEC` | 重试等待秒数 | 5 |
| `--connect-timeout SEC` | 连接超时 | 60 |
| `--timeout SEC` | 传输超时 | 60 |
| `--max-file-not-found N` | N 次 404 后放弃 | 0（不限制） |

### 日志

| 选项 | 说明 |
|------|------|
| `-l FILE` | 日志文件（`-` = stdout） |
| `--log-level LEVEL` | 日志级别：debug / info / notice / warn / error |

---

## 4. HTTP/HTTPS 下载

### 4.1 多线程分片下载

```bash
# 16 线程，从 2 个服务器各取
aria2c -s 16 -x 2 -k 1M https://example.com/video.iso

# 断点续传（即使非 aria2 发起的下载也能续）
aria2c -c https://example.com/partial_file.zip

# 校验完整性后重下损坏分片
aria2c -V https://example.com/file.iso
```

### 4.2 自定义请求头

```bash
# 设置 Referer
aria2c --referer="https://example.com" https://cdn.example.com/video.mp4

# 自定义 User-Agent
aria2c -U "Mozilla/5.0" https://example.com/file.zip

# 自定义任意 Header（可多次使用）
aria2c --header="Authorization: Bearer token123" \
       --header="X-Custom: value" \
       https://api.example.com/download
```

### 4.3 HTTP 认证

```bash
# 基本认证
aria2c --http-user=admin --http-passwd=secret https://protected.example.com/file.zip

# 仅在服务器要求时发送认证头
aria2c --http-auth-challenge=true --http-user=user --http-passwd=pass URL
```

### 4.4 Cookie 支持

```bash
# 从文件读取 Cookie（Firefox3/Mozilla 格式）
aria2c --load-cookies=cookies.txt https://example.com/file.zip

# Cookie 格式：
# .example.com  TRUE  /  FALSE  1234567890  session_id  abc123
```

### 4.5 远程时间戳

```bash
# 保留服务器的修改时间
aria2c -R https://example.com/file.zip

# 默认不保留远程时间
```

### 4.6 速度限制

```bash
# 全局下载限速 1MB/s
aria2c --max-overall-download-limit=1M https://example.com/file.zip

# 全局上传限速 512KB/s（BT 上传）
aria2c --max-overall-upload-limit=512K https://example.com/file.zip

# 单文件下载限速
aria2c --max-download-limit=500K https://example.com/file.zip
```

---

## 5. BitTorrent / 磁力链接

### 5.1 种子文件下载

```bash
# 用 .torrent 文件下载
aria2c file.torrent

# 磁力链接
aria2c "magnet:?xt=urn:btih:HASH&dn=NAME"

# 磁力链接 + 指定 tracker
aria2c --bt-tracker="udp://tracker.example.com:6969/announce" "magnet:?xt=urn:btih:HASH"

# 种子文件 + HTTP 补充下载（混合模式）
aria2c -T file.torrent https://cdn.example.com/same_file.zip
# HTTP 下载的数据同时上传到 BT 网络
```

### 5.2 BT 核心选项

| 选项 | 说明 | 默认 |
|------|------|------|
| `--listen-port` | BT TCP 端口 | 6881-6999 |
| `--dht-listen-port` | DHT UDP 端口 | 6881-6999 |
| `--enable-dht` | IPv4 DHT | true |
| `--enable-dht6` | IPv6 DHT | false |
| `--bt-enable-lpd` | 本地节点发现 | false |
| `--bt-max-peers` | 最大节点数 | 55 |
| `--bt-require-crypto` | 强制加密 | false |
| `--bt-seed-unverified` | 不校验直接做种 | false |
| `--bt-save-metadata` | 保存磁链元数据为 .torrent | false |
| `--bt-tracker` | 额外 tracker URL（逗号分隔） | - |
| `--follow-torrent` | BT 下载模式 | true |

### 5.3 选择下载文件

```bash
# 查看种子内文件列表
aria2c --show-files file.torrent

# 输出：
# idx|path/length
# ===+======================
#   1|./video.mp4
# 500MB
#   2|./subtitle.srt
# 50KB

# 只下载特定文件（用 --select-file）
aria2c --select-file=1 file.torrent           # 只下索引 1
aria2c --select-file=1,3 file.torrent         # 下载 1 和 3
aria2c --select-file=1-3 file.torrent         # 下载 1 到 3

# 磁力链接也可
aria2c --show-files "magnet:?xt=urn:btih:HASH"
```

### 5.4 做种

```bash
# 下载完成后继续做种（默认停止）
aria2c --seed-time=60 file.torrent           # 做种 60 分钟
aria2c --seed-time=0 file.torrent            # 一直做种
aria2c --seed-ratio=2.0 file.torrent         # 分享率达到 2.0 后停止
```

---

## 6. Metalink 下载

Metalink 是一个 XML 格式的多源下载描述文件，aria2 支持 `.meta4` 和 `.metalink`。

```bash
# Metalink 文件下载
aria2c file.meta4

# Metalink 自动多源+校验，无需额外参数
aria2c file.metalink

# 查看 Metalink 内容
aria2c --show-files file.meta4
```

---

## 7. 输入文件批量下载

将 URL 列表写入文件，aria2 批量下载。

### 7.1 输入文件格式

```
# urls.txt —— 每行一个 URL
https://example.com/file1.zip
https://example.com/file2.zip

# 同文件多源（用 TAB 分隔）
https://mirror1.com/file.iso	https://mirror2.com/file.iso

# 带选项的行（空格开头）
https://example.com/file.zip
  dir=/downloads
  out=renamed.zip
  split=10
```

### 7.2 使用

```bash
# 从文件读取 URL 列表下载
aria2c -i urls.txt

# 从 stdin 读取
cat urls.txt | aria2c -i -

# 从文件 + 指定下载目录
aria2c -d ~/Downloads -i urls.txt

# 每个文件独立下载（-Z 保证文件完整）
aria2c -Z -i urls.txt

# 断点续传模式
aria2c -c -i urls.txt
```

### 7.3 会话保存与恢复

```bash
# 下载时保存会话（记录进度）
aria2c --save-session=session.txt -i urls.txt
# 每次 Ctrl+C 后 session.txt 保存已完成和未完成的任务

# 恢复会话（重启后继续未完成的任务）
aria2c --continue=true --input-file=session.txt

# 推荐的断点续传组合
aria2c -c --save-session=session.txt -i urls.txt
```

---

## 8. 代理配置

```bash
# HTTP 代理
aria2c --http-proxy="http://proxy.example.com:8080" URL

# HTTPS 代理
aria2c --https-proxy="http://proxy.example.com:8080" URL

# 所有协议共用一个代理
aria2c --all-proxy="http://proxy.example.com:8080" URL

# 带认证的代理
aria2c --http-proxy="http://user:pass@proxy.example.com:8080" URL

# 或分别指定
aria2c --http-proxy="http://proxy.example.com:8080" \
       --http-proxy-user=user \
       --http-proxy-passwd=pass \
       URL

# SOCKS 代理（用 all-proxy）
aria2c --all-proxy="socks5://127.0.0.1:1080" URL

# 排除特定域名不使用代理
aria2c --no-proxy="localhost,127.0.0.1,*.local" URL
```

---

## 9. 限速与并发控制

```bash
# === 速度限制 ===

# 全局下载限速
aria2c --max-overall-download-limit=10M URL  # 10MB/s
aria2c --max-overall-download-limit=0 URL     # 不限速

# 全局上传限速（BT 场景）
aria2c --max-overall-upload-limit=1M URL

# 单任务限速
aria2c --max-download-limit=5M URL

# === 并发控制 ===

# 并行 3 个文件同时下载
aria2c -j 3 URL1 URL2 URL3 URL4 URL5

# 每个文件 16 线程 + 最小分片 1M
aria2c -s 16 -k 1M URL

# 对单服务器最多 4 个连接（恢复 1.9.x 行为）
aria2c -x 4 -k 1M URL

# === 低速断连 ===
# 速度低于 10KB/s 持续 60 秒则断开
aria2c --lowest-speed-limit=10K URL
```

> **注意**：自 1.10.0 起，aria2 默认单服务器只使用 1 个连接，最小分片 20MB。要用旧版多连接行为，显式设置 `--max-connection-per-server=4 --min-split-size=1M`。

---

## 10. RPC 远程控制

aria2 可通过 JSON-RPC（XML-RPC）接口被远程控制，配合 WebUI 使用。

```bash
# 启用 RPC 服务
aria2c --enable-rpc --rpc-listen-port=6800

# 指定 RPC 密钥
aria2c --enable-rpc --rpc-secret=my_secret_token

# 允许所有来源（安全风险，仅内网用）
aria2c --enable-rpc --rpc-allow-origin-all

# 生产环境推荐配置
aria2c --enable-rpc \
       --rpc-listen-all=false \
       --rpc-allow-origin-all=false \
       --rpc-secret=YourSecretToken \
       --rpc-listen-port=6800
```

**常用 RPC 选项**：

| 选项 | 说明 |
|------|------|
| `--enable-rpc` | 启用 JSON-RPC 服务 |
| `--rpc-listen-port N` | RPC 监听端口（默认 6800） |
| `--rpc-listen-all` | 监听所有网卡（默认仅 localhost） |
| `--rpc-secret TOKEN` | RPC 密钥（空 = 无认证） |
| `--rpc-allow-origin-all` | 允许跨域请求 |
| `--rpc-save-upload-metadata` | 保存上传的种子文件 |

**前端工具**：
- [AriaNg](https://github.com/mayswind/AriaNg) — 纯 HTML WebUI
- [webui-aria2](https://github.com/ziahamza/webui-aria2)
- [Aria2 Explorer](https://chrome.google.com) — Chrome 扩展

---

## 11. 配置文件 aria2.conf

配置文件路径（按优先级）：
1. `$HOME/.aria2/aria2.conf`
2. `$XDG_CONFIG_HOME/aria2/aria2.conf`（默认 `~/.config/aria2/aria2.conf`）

也可通过 `--conf-path=PATH` 指定。

### 完整配置模板

```conf
# ~/.aria2/aria2.conf

## === 基本设置 ===
dir=~/Downloads
continue=true
max-concurrent-downloads=5
max-connection-per-server=16
min-split-size=10M
split=16
max-overall-download-limit=0
max-download-limit=0
max-overall-upload-limit=1M
disable-ipv6=false

## === 重试 ===
max-tries=5
retry-wait=5
connect-timeout=60
timeout=60
max-file-not-found=5
lowest-speed-limit=0

## === 代理 ===
# all-proxy=http://127.0.0.1:7890
# no-proxy=localhost,127.0.0.1,*.local

## === HTTP ===
user-agent=aria2/1.37.0
referer=*
enable-http-keep-alive=true
enable-http-pipelining=true
check-certificate=true
http-accept-gzip=true

## === BT ===
bt-enable-lpd=false
bt-max-peers=55
bt-require-crypto=false
enable-dht=true
enable-dht6=false
enable-peer-exchange=true
bt-seed-unverified=false
bt-save-metadata=true
bt-tracker=udp://tracker.openbittorrent.com:80/announce,udp://tracker.opentrackr.org:1337/announce
seed-time=0
seed-ratio=0
follow-torrent=true

## === RPC ===
enable-rpc=true
rpc-listen-all=false
rpc-allow-origin-all=false
rpc-listen-port=6800
rpc-secret=YourSecretTokenHere

## === 日志 ===
log=~/.aria2/aria2.log
log-level=warn

## === 会话 ===
save-session=~/.aria2/session.txt
save-session-interval=30
input-file=~/.aria2/session.txt
```

---

## 12. 实战脚本示例

### 脚本 1：批量下载文件列表

```bash
#!/bin/bash
# 文件名：batch_download.sh
# 用法：./batch_download.sh urls.txt ~/Downloads

URLFILE="${1:-urls.txt}"
DEST="${2:-~/Downloads}"

aria2c -c -j 5 -s 8 -x 4 -k 4M \
    -d "$DEST" \
    --save-session=~/.aria2/batch_session.txt \
    -i "$URLFILE"

echo "下载完成。会话保存至 ~/.aria2/batch_session.txt"
```

### 脚本 2：下载 + 自动解压

```bash
#!/bin/bash
# 文件名：download_and_extract.sh
# 用法：./download_and_extract.sh https://example.com/archive.zip

URL="$1"
DEST="${2:-./downloads}"
mkdir -p "$DEST"

FILENAME=$(basename "$URL")
FILEPATH="$DEST/$FILENAME"

echo "下载：$URL"
aria2c -c -s 8 -x 4 -d "$DEST" -o "$FILENAME" "$URL"

if [[ $? -eq 0 ]]; then
    echo "下载完成，解压..."
    case "$FILENAME" in
        *.zip) unzip -q "$FILEPATH" -d "$DEST" ;;
        *.tar.gz|*.tgz) tar xzf "$FILEPATH" -C "$DEST" ;;
        *.tar.bz2) tar xjf "$FILEPATH" -C "$DEST" ;;
        *.7z) 7z x "$FILEPATH" -o"$DEST" ;;
        *) echo "未知格式，跳过解压" ;;
    esac
    echo "完成：$DEST"
fi
```

### 脚本 3：定时下载（低峰时段）

```bash
#!/bin/bash
# 文件名：scheduled_download.sh
# 配合 cron 或 launchd 在凌晨执行

URLFILE="$HOME/.aria2/nightly_urls.txt"
DEST="$HOME/Downloads/nightly"
mkdir -p "$DEST"

echo "[$(date)] 开始夜间下载"
aria2c -c -j 3 -s 8 --max-overall-download-limit=0 \
    -d "$DEST" \
    --save-session="$HOME/.aria2/nightly_session.txt" \
    -i "$URLFILE"
echo "[$(date)] 完成"
```

### 脚本 4：下载整个目录（HTTP 服务器目录）

```bash
#!/bin/bash
# 文件名：download_directory.sh
# 从 Apache/Nginx 目录列表下载所有文件

BASE_URL="${1%/}"
DEST="${2:-./downloads}"
mkdir -p "$DEST"

# 用 wget 获取目录列表，提取链接提供给 aria2
wget -q -O - "$BASE_URL/" | \
    grep -oP 'href="\K[^"]+' | \
    grep -v '^\.\.\?$' | \
    grep -v '/$' | \
    sed "s|^|$BASE_URL/|" > /tmp/aria2_urls.txt

echo "发现 $(wc -l < /tmp/aria2_urls.txt) 个文件"
aria2c -c -j 5 -s 4 -d "$DEST" -i /tmp/aria2_urls.txt
```

### 脚本 5：监控文件夹种子自动下载

```bash
#!/bin/bash
# 文件名：watch_torrents.sh
# 监控目录，自动下载新种子
# 用法：nohup ./watch_torrents.sh ~/torrents_watch ~/Downloads &

WATCH_DIR="${1:-~/torrents_watch}"
DEST="${2:-~/Downloads}"
mkdir -p "$WATCH_DIR" "$DEST"

echo "监控：$WATCH_DIR → $DEST"

while true; do
    for torrent in "$WATCH_DIR"/*.torrent; do
        [[ -f "$torrent" ]] || continue
        echo "[$(date '+%H:%M:%S')] 下载种子：$(basename "$torrent")"
        aria2c -d "$DEST" --seed-time=0 "$torrent"
        mv "$torrent" "${torrent}.done"
    done
    sleep 10
done
```

### 脚本 6：配合 AriaNg WebUI 启动

```bash
#!/bin/bash
# 文件名：start_aria2_rpc.sh
# 启动 aria2 RPC 服务 + AriaNg

CONF="$HOME/.aria2/aria2.conf"
RPC_PORT=6800

# 确保配置目录存在
mkdir -p "$(dirname "$CONF")"

# 启动 aria2 RPC
aria2c --conf-path="$CONF" &
ARIA_PID=$!
echo "aria2 RPC 已启动 (PID: $ARIA_PID, 端口: $RPC_PORT)"

# 打开 AriaNg（需先下载到本地）
ARIANG_DIR="$HOME/.aria2/ariang"
if [[ -d "$ARIANG_DIR" ]]; then
    echo "AriaNg 可用：file://$ARIANG_DIR/index.html"
    open "${ARIANG_DIR}/index.html" 2>/dev/null
fi

echo "按 Ctrl+C 停止"
trap "kill $ARIA_PID 2>/dev/null; exit" INT TERM
wait $ARIA_PID
```

---

## 13. 完整选项速查表

### 基本选项（#basic）

| 选项 | 说明 | 默认 |
|------|------|------|
| `-d DIR` | 下载目录 | 当前目录 |
| `-o FILE` | 输出文件名 | 自动 |
| `-i FILE` | 从文件读取 URL（`-`=stdin） | - |
| `-l FILE` | 日志文件（`-`=stdout） | - |
| `-j N` | 并行下载数 | 5 |
| `-s N` | 每个文件分片数 | 5 |
| `-x N` | 单服务器最大连接 | 1 |
| `-k SIZE` | 最小分片大小 | 20M |
| `-c` | 断点续传 | false |
| `-V` | 校验完整性 | false |
| `-Z` | 顺序下载 | false（并行） |
| `--show-files` | 显示种子/Metalink 内容 | - |
| `--select-file IDX` | 选择种子文件 | - |
| `--save-session FILE` | 保存会话 | - |

### HTTP 选项（#http）

| 选项 | 说明 |
|------|------|
| `--http-user USER` | HTTP 认证用户 |
| `--http-passwd PASS` | HTTP 认证密码 |
| `--http-proxy URL` | HTTP 代理 |
| `--https-proxy URL` | HTTPS 代理 |
| `--all-proxy URL` | 全协议代理 |
| `--no-proxy DOMAINS` | 排除代理域名 |
| `--referer URL` | Referer 头 |
| `-U STR` | User-Agent |
| `--header STR` | 自定义请求头（可重复） |
| `--load-cookies FILE` | 读取 Cookie 文件 |
| `--check-certificate` | HTTPS 证书校验 | true |
| `--enable-http-keep-alive` | 持久连接 | true |
| `--enable-http-pipelining` | HTTP 管线化 | false |
| `--http-accept-gzip` | 接收 gzip 响应 | false |
| `-R` | 保留远程时间戳 | false |

### BT 选项（#bittorrent）

| 选项 | 说明 | 默认 |
|------|------|------|
| `-T FILE` | 种子文件路径 | - |
| `--listen-port` | BT TCP 端口 | 6881-6999 |
| `--dht-listen-port` | DHT UDP 端口 | 6881-6999 |
| `--enable-dht` | IPv4 DHT | true |
| `--enable-dht6` | IPv6 DHT | false |
| `--bt-max-peers` | 最大节点数 | 55 |
| `--bt-require-crypto` | 强制加密 | false |
| `--bt-enable-lpd` | 本地节点发现 | false |
| `--bt-tracker URLS` | 额外 tracker | - |
| `--seed-time MIN` | 做种时间（0=无限制） | - |
| `--seed-ratio R` | 分享率目标 | - |
| `--bt-save-metadata` | 保存磁链 .torrent | false |
| `--follow-torrent` | 模式：true/mem/none | true |

### RPC 选项（#rpc）

| 选项 | 说明 | 默认 |
|------|------|------|
| `--enable-rpc` | 启用 JSON-RPC | false |
| `--rpc-listen-port` | RPC 端口 | 6800 |
| `--rpc-listen-all` | 监听所有 IP | false |
| `--rpc-secret` | RPC 密钥 | - |
| `--rpc-allow-origin-all` | 跨域允许 | false |

### 高级选项（#advanced）

| 选项 | 说明 | 默认 |
|------|------|------|
| `--max-overall-download-limit N` | 全局下载限速 | 0 |
| `--max-overall-upload-limit N` | 全局上传限速 | 0 |
| `--max-download-limit N` | 单文件下载限速 | 0 |
| `-m N` | 最大重试次数 | 5 |
| `--retry-wait SEC` | 重试等待 | 5 |
| `--connect-timeout SEC` | 连接超时 | 60 |
| `--timeout SEC` | 传输超时 | 60 |
| `-q` | 安静模式 | - |
| `--console-log-level LEVEL` | 控制台日志级别 | - |
| `--conf-path PATH` | 配置文件路径 | - |
| `--stop SEC` | 指定秒数后停止 | 0 |
| `--deferred-input` | 延迟读取输入文件 | false |

---

## 14. 注意事项与陷阱

1. **可执行文件名为 `aria2c`**：不是 `aria2`。`aria2` 是项目名，`aria2c` 是命令行工具。

2. **1.10.0+ 默认单连接**：每个服务器默认只开 1 个连接。若要多连接，显式设置 `--max-connection-per-server=N --min-split-size=1M`。

3. **会话保存**：使用 `Ctrl+C` 正常退出时才会保存 session。用 `kill -9` 强制杀死不会保存。

4. **输出文件名**：`-o` 仅在纯 URL 下载时有效。对于种子/Metalink 下载，文件名由种子/Metalink 决定。

5. **并发控制层级**：
   - `-j`：同时进行的任务数（文件级别）
   - `-s`：每个任务的分片连接数
   - `-x`：每个服务器的最大连接数
   三者需要协调：`-s` 受限于 `-x * 服务器数`。

6. **代理格式**：`--all-proxy="socks5://127.0.0.1:1080"` 支持 HTTP/SOCKS4/SOCKS5 代理。

7. **私有种子**：aria2 识别私有种子标记，不会对私有种子启用 DHT/PEX。

8. **BT 端口**：需确保防火墙开放 BT TCP/UDP 监听端口（默认 6881-6999），否则上传速度受限。

9. **配置文件语法**：一行一个选项，`#` 开头为注释。选项名去掉 `--` 前缀。例如命令行 `--max-concurrent-downloads=10` 在配置文件中写 `max-concurrent-downloads=10`。

10. **与其它下载工具对比**：
    - vs `wget`：aria2 支持多线程、BT、Metalink
    - vs `curl`：aria2 支持分片续传、批量任务
    - vs `IDM`：aria2 跨平台、命令行、可脚本化
