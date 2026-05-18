# lighttpd —— 轻量高性能 Web 服务器

> "lighty" —— 安全、快速、标准兼容、灵活的开源 Web 服务器，为高并发场景优化。
> 版本：1.4.82 (ssl)（本机 Homebrew 安装）
> 官网：[lighttpd.net](https://www.lighttpd.net)
> 架构：单进程、事件驱动（kqueue on macOS），异步非阻塞 I/O

---

## 目录

1. [简介与架构](#1-简介与架构)
2. [安装](#2-安装)
3. [命令行选项](#3-命令行选项)
4. [配置文件语法核心](#4-配置文件语法核心)
5. [核心基础配置](#5-核心基础配置)
6. [虚拟主机（VHost）](#6-虚拟主机vhost)
7. [TLS/SSL 配置](#7-tlsssl-配置)
8. [URL 重写（mod_rewrite）](#8-url-重写mod_rewrite)
9. [反向代理（mod_proxy）](#9-反向代理mod_proxy)
10. [FastCGI / CGI / SCGI](#10-fastcgi--cgi--scgi)
11. [访问控制与认证](#11-访问控制与认证)
12. [压缩与性能优化](#12-压缩与性能优化)
13. [日志配置](#13-日志配置)
14. [目录列表与 WebDAV](#14-目录列表与-webdav)
15. [HTTP/2 配置](#15-http2-配置)
16. [完整配置示例](#16-完整配置示例)
17. [本机环境速览](#17-本机环境速览)
18. [常用配置选项速查表](#18-常用配置选项速查表)
19. [注意事项与陷阱](#19-注意事项与陷阱)

---

## 1. 简介与架构

lighttpd（读作 "lighty"）最初由 Jan Kneschke 开发，旨在解决 **c10k 问题**（单机一万并发连接）。

**核心特性**：

| 特性 | 说明 |
|------|------|
| 事件驱动 | 单进程 + 有限线程，不按连接创建线程/进程 |
| 低内存 | 内存占用仅数 MB，适合嵌入式/IoT |
| 高并发 | kqueue (macOS) / epoll (Linux) 异步 I/O |
| 模块化 | 按需加载模块，启动精简 |
| FastCGI | 原生支持 PHP/Python/Ruby 等动态后端 |
| 反向代理 | mod_proxy 支持 HTTP/WebSocket 代理 |
| TLS | OpenSSL 原生集成 |

**典型应用场景**：
- 静态文件服务器（图片/视频/CDN 边缘）
- 反向代理前端（代理到 Nginx/Apache/应用服务器）
- 嵌入式/物联网 Web 服务
- FastCGI 动态站点
- YouTube 曾用它分发缩略图

---

## 2. 安装

```bash
# macOS Homebrew（本机安装方式）
brew install lighttpd

# Debian/Ubuntu
sudo apt install lighttpd

# Fedora/CentOS
sudo dnf install lighttpd

# Arch Linux
sudo pacman -S lighttpd

# 从源码编译
./configure --prefix=/usr/local/lighttpd
make && make install
```

**本机 Homebrew 环境**：
| 项 | 路径/值 |
|----|---------|
| 配置文件 | `/opt/homebrew/etc/lighttpd/lighttpd.conf` |
| 模块目录 | `/opt/homebrew/Cellar/lighttpd/1.4.82/lib/` |
| 默认文档根 | `/opt/homebrew/var/www` |
| 默认端口 | 8080（非 root 可运行） |
| 模块配置 | `/opt/homebrew/etc/lighttpd/modules.conf` |
| 子配置目录 | `/opt/homebrew/etc/lighttpd/conf.d/` |

---

## 3. 命令行选项

```
lighttpd [选项]

  -f <file>   指定配置文件（'-' 从 stdin 读取）
  -m <dir>    指定模块目录
  -D          前台运行，不进入后台守护（调试用）
  -t          测试配置文件语法，然后退出
  -tt         测试配置文件语法+加载初始化模块，然后退出
  -p          打印解析后的配置（内部格式），然后退出
  -i <secs>   空闲 <secs> 秒后优雅关闭
  -1          在 stdin socket 上处理单个请求后退出
  -v          显示版本号
  -V          显示编译时特性
  -h          显示帮助
```

**常用操作**：

```bash
# 测试配置文件语法
lighttpd -tt -f /opt/homebrew/etc/lighttpd/lighttpd.conf

# 前台运行调试
lighttpd -D -f /opt/homebrew/etc/lighttpd/lighttpd.conf

# 查看编译特性
lighttpd -V

# 作为 brew service 管理
brew services start lighttpd     # 启动（开机自启）
brew services stop lighttpd      # 停止
brew services restart lighttpd   # 重启
brew services list | grep lighttpd  # 查看状态
```

---

## 4. 配置文件语法核心

lighttpd 配置文件采用类 C 的语法，核心语法要素：

### 4.1 基本赋值

```nginx
# 简单值
server.port = 8080
server.document-root = "/opt/homebrew/var/www"

# 列表值
server.modules = ("mod_access", "mod_accesslog")
index-file.names = ("index.html", "index.php", "index.htm")

# 键值对列表
mimetype.assign = (
    ".html" => "text/html",
    ".css"  => "text/css",
    ".js"   => "text/javascript"
)

# 追加（+=）
server.modules += ("mod_rewrite")

# 布尔值
dir-listing.activate = "enable"
server.feature-flags += ("server.h2c" => "enable")
```

### 4.2 条件块

```nginx
# HTTP Host 条件（虚拟主机）
$HTTP["host"] == "example.com" {
    server.document-root = "/var/www/example.com"
}

# URL 正则匹配
$HTTP["url"] =~ "^/admin/" {
    # admin 路径下的特殊配置
}

# 远程 IP 条件
$HTTP["remoteip"] == "192.168.1.0/24" {
    # 内网访问的特殊配置
}

# 请求方法条件
$HTTP["scheme"] == "https" {
    # HTTPS 特定配置
}

# 嵌套条件
$HTTP["host"] == "example.com" {
    $HTTP["url"] =~ "^/download/" {
        dir-listing.activate = "enable"
    }
}

# else 分支
$HTTP["host"] == "blog.example.com" {
    server.document-root = "/var/www/blog"
} else $HTTP["host"] == "static.example.com" {
    server.document-root = "/var/www/static"
} else $HTTP["host"] =~ "" {
    # 默认 vhost
    server.document-root = "/var/www/default"
}
```

### 4.3 include 文件

```nginx
# 包含其他配置文件
include "/opt/homebrew/etc/lighttpd/modules.conf"
include conf_dir + "/conf.d/*.conf"     # conf_dir 为内置变量
include_shell "cat /etc/lighttpd/extra.conf"
```

### 4.4 变量

```nginx
# 内置变量
var.basedir = "/var/www"
server.document-root = basedir + "/html"

# conf_dir 自动指向配置文件所在目录
include conf_dir + "/conf.d/tls.conf"
```

---

## 5. 核心基础配置

### 5.1 最小可用配置

```nginx
# /opt/homebrew/etc/lighttpd/lighttpd.conf

server.document-root = "/opt/homebrew/var/www"
server.port = 8080

# MIME 类型映射（1.4.71+ 自动提供，可省略）
# 旧版本需手动设置 mimetype.assign
```

```bash
# 测试并启动
lighttpd -tt -f lighttpd.conf
lighttpd -D -f lighttpd.conf
# 访问 http://localhost:8080
```

### 5.2 生产基础配置

```nginx
# 基础路径和端口
server.document-root = "/opt/homebrew/var/www"
server.port = 8080
server.bind = "127.0.0.1"          # 仅监听本地

# 以非 root 用户运行（系统服务自动处理）
server.username = "_www"
server.groupname = "_www"

# 索引文件
index-file.names = ("index.html", "index.php")

# 禁止访问的文件扩展名
static-file.exclude-extensions = (".fcgi", ".php", ".rb", "~", ".inc")

# 事件处理（macOS 自动使用 kqueue）
# server.event-handler = "kqueue"

# 网络处理
server.network-backend = "writev"   # macOS 用 writev

# 最大连接数
server.max-connections = 1024

# 错误日志
server.errorlog = "/opt/homebrew/var/log/lighttpd/error.log"

# PID 文件
server.pid-file = "/opt/homebrew/var/run/lighttpd.pid"
```

### 5.3 模块加载顺序

**极其重要**：模块在 `server.modules` 中的加载顺序决定了处理流程：

```nginx
server.modules = (
    # 第1层：连接/请求预处理
    "mod_access",         # 在此之前的模块不处理请求
    "mod_auth",           # 认证
    "mod_authn_file",     # 文件认证后端

    # 第2层：URL 修改
    "mod_alias",          # URL 别名
    "mod_setenv",         # 环境变量
    "mod_redirect",       # 重定向
    "mod_rewrite",        # URL 重写（需在 mod_proxy 之前）

    # 第3层：动态处理器
    "mod_cgi",            # CGI
    "mod_fastcgi",        # FastCGI
    "mod_proxy",          # 反向代理
    "mod_scgi",           # SCGI

    # 第4层：后处理
    "mod_accesslog",      # 访问日志
    "mod_deflate",        # 压缩
)
```

> ⚠️ **不要按字母排序模块**。顺序错误会导致功能异常！

---

## 6. 虚拟主机（VHost）

lighttpd 原生通过 `$HTTP["host"]` 条件块支持虚拟主机，无需额外模块。

### 6.1 基础虚拟主机

```nginx
# 默认站点
server.document-root = "/opt/homebrew/var/www/default"

# 站点 A
$HTTP["host"] == "a.example.com" {
    server.document-root = "/opt/homebrew/var/www/a"
    accesslog.filename = "/opt/homebrew/var/log/a_access.log"
}

# 站点 B
$HTTP["host"] == "b.example.com" {
    server.document-root = "/opt/homebrew/var/www/b"
}
```

### 6.2 基于正则的虚拟主机

```nginx
# 所有 .example.org 子域
$HTTP["host"] =~ "(^|\.)example\.org$" {
    server.document-root = "/opt/homebrew/var/www/example"
}

# 泛域名
$HTTP["host"] =~ "^(.+)\.example\.com$" {
    server.document-root = "/opt/homebrew/var/www/%1"
    # %1 引用正则捕获组
}
```

### 6.3 mod_evhost（增强虚拟主机）

简化基于模式的 vhost 配置：

```nginx
server.modules += ("mod_evhost")

evhost.path-pattern = "/opt/homebrew/var/www/%2/%0"
# %0 = 完整主机名
# %1 = TLD
# %2 = SLD（二级域名）
# %3 = 三级域名（以此类推）
# 例如 www.example.com → /opt/homebrew/var/www/example/www
```

### 6.4 mod_simple_vhost

```nginx
server.modules += ("mod_simple_vhost")

simple-vhost.server-root   = "/opt/homebrew/var/www/vhosts"
simple-vhost.document-root  = "/html"
simple-vhost.default-host   = "default.local"
# 例：a.com → /opt/homebrew/var/www/vhosts/a.com/html/
```

---

## 7. TLS/SSL 配置

本机 lighttpd 已编译 `+ OpenSSL support`。

```nginx
server.modules += ("mod_openssl")

# 监听 HTTPS
$SERVER["socket"] == "0.0.0.0:443" {
    ssl.engine  = "enable"
    ssl.pemfile = "/opt/homebrew/etc/ssl/server.pem"   # 证书+私钥合一
    # 或分开指定
    # ssl.privkey = "/etc/ssl/private/server.key"
}

# 仅监听 TLS
$SERVER["socket"] == "0.0.0.0:443" {
    ssl.engine  = "enable"
    ssl.pemfile = "/etc/letsencrypt/live/example.com/fullchain.pem"
    ssl.privkey = "/etc/letsencrypt/live/example.com/privkey.pem"

    # 现代 TLS 配置（推荐）
    ssl.openssl.ssl-conf-cmd = (
        "MinProtocol" => "TLSv1.2",
        "Options"     => "-ServerPreference",
    )
}
```

**自签名证书（测试用）**：

```bash
openssl req -x509 -newkey rsa:4096 \
    -keyout server.key -out server.crt \
    -days 365 -nodes -subj "/CN=localhost"
cat server.crt server.key > server.pem
chmod 600 server.pem
```

**HTTP → HTTPS 重定向**：

```nginx
$HTTP["scheme"] == "http" {
    $HTTP["host"] == "example.com" {
        url.redirect = (".*" => "https://example.com$0")
    }
}
```

---

## 8. URL 重写（mod_rewrite）

```nginx
server.modules += ("mod_rewrite")

# 规则格式：("regex" => "target")
# target 支持 %1-%9 引用捕获组

# WordPress 风格重写
url.rewrite-once = (
    "^/(wp-admin|wp-content|wp-includes)/(.*)" => "$0",
    "^/(.*\.php)" => "$0",
    "^/(.*)" => "/index.php/$1"
)

# 清理 URL（前端路由）
url.rewrite-if-not-file = (
    "^/(.*)$" => "/index.html"
)

# 规则列表（按顺序匹配，命中即停止）
url.rewrite = (
    "^/old-path/(.*)$" => "/new-path/$1",
    "^/article/(\d+)$" => "/article.php?id=$1"
)

# 外部重定向（301）
url.redirect = (
    "^/old$" => "https://new.example.com/",
    "^/docs/(.*)" => "https://docs.example.com/$1"
)
```

---

## 9. 反向代理（mod_proxy）

```nginx
server.modules += ("mod_proxy")

# 基础代理：/api/ → 后端服务器
$HTTP["url"] =~ "^/api/" {
    proxy.server = (
        "" => (
            "backend" => (
                "host" => "127.0.0.1",
                "port" => 3000
            )
        )
    )
    # 移除 /api 前缀转发
    proxy.header = (
        "map-urlpath" => ("/api/" => "/")
    )
}

# 负载均衡（多后端）
$HTTP["url"] =~ "^/app/" {
    proxy.server = (
        "" => (
            ("host" => "127.0.0.1", "port" => 3001),
            ("host" => "127.0.0.1", "port" => 3002),
        )
    )
    proxy.balance = "fair"    # fair / hash / round-robin
}
```

**WebSocket 代理（mod_wstunnel）**：

```nginx
server.modules += ("mod_wstunnel")

$HTTP["url"] =~ "^/ws/" {
    wstunnel.server = (
        "" => (
            ("host" => "127.0.0.1", "port" => 4000)
        )
    )
    wstunnel.frame-type  = "text"
}
```

---

## 10. FastCGI / CGI / SCGI

### 10.1 PHP-FPM (FastCGI)

```nginx
server.modules += ("mod_fastcgi")

fastcgi.server = (
    ".php" => (
        "localhost" => (
            "socket"          => "/var/run/php/php-fpm.sock",
            "broken-scriptfilename" => "enable"
        )
    )
)

# TCP 方式
fastcgi.server = (
    ".php" => (
        "localhost" => (
            "host" => "127.0.0.1",
            "port" => 9000
        )
    )
)
```

### 10.2 Python/CGI

```nginx
server.modules += ("mod_cgi")

$HTTP["url"] =~ "^/cgi-bin/" {
    cgi.assign = (
        ".py" => "/usr/bin/python3",
        ".sh" => "/bin/bash"
    )
    alias.url += ("/cgi-bin/" => "/opt/homebrew/var/www/cgi-bin/")
}
```

### 10.3 SCGI

```nginx
server.modules += ("mod_scgi")

scgi.server = (
    "/app" => (
        "127.0.0.1" => (
            "host" => "127.0.0.1",
            "port" => 4000
        )
    )
)
```

---

## 11. 访问控制与认证

### 11.1 IP 访问限制

```nginx
server.modules += ("mod_access")

# 拒绝列表
$HTTP["url"] =~ "^/internal/" {
    $HTTP["remoteip"] != "192.168.1.0/24" {
        url.access-deny = ("")
    }
}
```

### 11.2 Basic 认证

```nginx
server.modules += ("mod_auth", "mod_authn_file")

# 创建密码文件
# echo -n "user:" && openssl passwd -apr1

auth.backend = "htpasswd"
auth.backend.htpasswd.userfile = "/opt/homebrew/etc/lighttpd/.htpasswd"

# 保护 /admin
$HTTP["url"] =~ "^/admin/" {
    auth.require = (
        "" => (
            "method"  => "basic",
            "realm"   => "Admin Area",
            "require" => "valid-user"
        )
    )
}
```

创建密码文件：
```bash
echo -n "admin:" > .htpasswd
openssl passwd -apr1 >> .htpasswd    # 输入密码两次
```

### 11.3 LDAP 认证

```nginx
server.modules += ("mod_auth", "mod_authn_ldap")

auth.backend = "ldap"
auth.backend.ldap.hostname = "ldap.example.com"
auth.backend.ldap.base-dn  = "ou=users,dc=example,dc=com"
auth.backend.ldap.filter   = "(uid=$)"
```

---

## 12. 压缩与性能优化

### 12.1 输出压缩（mod_deflate）

```nginx
server.modules += ("mod_deflate")

deflate.enabled = "enable"
deflate.compression-level = 6          # 1-9
deflate.mem-level = 6                  # 1-9
deflate.cache-dir = "/tmp/lighttpd-compress/"

# 压缩的 MIME 类型
deflate.mimetypes = (
    "text/plain",
    "text/html",
    "text/css",
    "text/javascript",
    "application/javascript",
    "application/json",
    "text/xml",
    "application/xml"
)
```

### 12.2 缓存头（mod_expire）

```nginx
server.modules += ("mod_expire")

expire.url = (
    "/static/"  => "access plus 30 days",
    "/images/"  => "access plus 7 days",
    "/css/"     => "access plus 1 weeks",
    ".pdf"      => "access plus 1 months"
)
```

### 12.3 Keep-Alive 调优

```nginx
server.max-keep-alive-requests = 128    # 每个连接最大请求数
server.max-keep-alive-idle = 30          # 空闲超时秒数
server.max-read-idle = 60                # 读空闲超时
server.max-write-idle = 360             # 写空闲超时
```

### 12.4 sendfile（零拷贝）

```nginx
# macOS 自动使用 darwin-sendfile
# 无需额外配置，编译时已启用
# 查看：lighttpd -V | grep sendfile
```

---

## 13. 日志配置

```nginx
server.modules += ("mod_accesslog")

# 错误日志
server.errorlog             = "/opt/homebrew/var/log/lighttpd/error.log"
server.errorlog-use-syslog  = "disable"

# 访问日志
accesslog.filename          = "/opt/homebrew/var/log/lighttpd/access.log"

# 组合格式（类似 Apache combined）
accesslog.format = "%h %V %u %t \"%r\" %>s %b \"%{Referer}i\" \"%{User-Agent}i\""

# 按条件分离日志
$HTTP["host"] == "api.example.com" {
    accesslog.filename = "/opt/homebrew/var/log/api_access.log"
}

# 管道日志（经 cronolog 按日期分割）
# accesslog.filename = "|/usr/sbin/cronolog /var/log/lighttpd/%Y/%m/%d/access.log"
```

---

## 14. 目录列表与 WebDAV

### 14.1 目录列表

```nginx
server.modules += ("mod_dirlisting")

# 全局启用
dir-listing.activate = "enable"
dir-listing.encoding = "utf-8"

# 仅特定路径
$HTTP["url"] =~ "^/downloads/" {
    dir-listing.activate = "enable"
    dir-listing.hide-dotfiles = "enable"
}
```

### 14.2 WebDAV

```nginx
server.modules += ("mod_webdav")

$HTTP["url"] =~ "^/webdav($|/)" {
    webdav.activate = "enable"
    webdav.is-readonly = "disable"

    # 认证保护
    auth.require = (
        "" => (
            "method"  => "basic",
            "realm"   => "WebDAV",
            "require" => "valid-user"
        )
    )
}
```

---

## 15. HTTP/2 配置

本机已安装 `mod_h2`（HTTP/2）模块。

```nginx
server.modules += ("mod_h2")

# 仅 TLS 连接启用 H2
$SERVER["socket"] == "0.0.0.0:443" {
    ssl.engine = "enable"
    ssl.pemfile = "/etc/ssl/server.pem"

    # HTTP/2 在 TLS ALPN 后自动协商，无需额外配置
}

# 明文 H2（h2c，仅限测试）
server.feature-flags += ("server.h2c" => "enable")
```

> 浏览器通常只支持 HTTPS 的 HTTP/2（h2），h2c 用于内部测试。

---

## 16. 完整配置示例

一个实际的 macOS 开发环境配置：

```nginx
# /opt/homebrew/etc/lighttpd/lighttpd.conf

# === 模块 ===
server.modules = (
    "mod_access",
    "mod_auth",
    "mod_authn_file",
    "mod_alias",
    "mod_redirect",
    "mod_rewrite",
    "mod_setenv",
    "mod_proxy",
    "mod_fastcgi",
    "mod_deflate",
    "mod_expire",
    "mod_accesslog",
    "mod_dirlisting",
)

# === 服务器基础 ===
server.document-root  = "/opt/homebrew/var/www"
server.port           = 8080
server.bind           = "127.0.0.1"
server.username       = "_www"
server.groupname      = "_www"
server.tag            = "lighttpd"
server.max-connections = 1024

# === 静态文件安全 ===
static-file.exclude-extensions = (".php", ".fcgi", ".rb", "~", ".inc")
index-file.names    = ("index.html", "index.php")
server.follow-symlink = "enable"

# === MIME 类型 ===
mimetype.assign = (
    ".html"  => "text/html",
    ".css"   => "text/css",
    ".js"    => "text/javascript",
    ".json"  => "application/json",
    ".png"   => "image/png",
    ".jpg"   => "image/jpeg",
    ".gif"   => "image/gif",
    ".svg"   => "image/svg+xml",
    ".ico"   => "image/x-icon",
    ".pdf"   => "application/pdf",
    ".zip"   => "application/zip",
    ".woff2" => "font/woff2",
    ".xml"   => "text/xml",
    ".txt"   => "text/plain",
)

# === 日志 ===
server.errorlog  = "/opt/homebrew/var/log/lighttpd/error.log"
accesslog.filename = "/opt/homebrew/var/log/lighttpd/access.log"
accesslog.format   = "%h %V %u %t \"%r\" %>s %b \"%{Referer}i\" \"%{User-Agent}i\""

# === 压缩 ===
deflate.enabled          = "enable"
deflate.compression-level = 6
deflate.cache-dir         = "/tmp/lighttpd-deflate"
deflate.mimetypes = (
    "text/plain", "text/html", "text/css",
    "text/javascript", "application/javascript", "application/json"
)

# === 缓存 ===
expire.url = (
    "/static/"  => "access plus 30 days",
    "/images/"  => "access plus 7 days",
    ".css"      => "access plus 1 weeks",
    ".js"       => "access plus 1 weeks",
)

# === 虚拟主机：站点 A ===
$HTTP["host"] == "site-a.local" {
    server.document-root = "/Users/user/Projects/site-a/dist"
    server.errorlog      = "/tmp/site-a-error.log"

    # SPA 路由回退
    url.rewrite-if-not-file = (
        "^/(.*)$" => "/index.html"
    )
}

# === 虚拟主机：站点 B（PHP） ===
$HTTP["host"] == "site-b.local" {
    server.document-root = "/Users/user/Projects/site-b/public"

    index-file.names = ("index.php", "index.html")

    # PHP-FPM
    fastcgi.server = (
        ".php" => (
            "localhost" => (
                "socket" => "/var/run/php/php-fpm.sock"
            )
        )
    )
}

# === API 反向代理 ===
$HTTP["url"] =~ "^/api/" {
    proxy.server = (
        "" => (
            "api" => (
                "host" => "127.0.0.1",
                "port" => 3000
            )
        )
    )
}

# === 目录列表 ===
$HTTP["url"] =~ "^/public/" {
    dir-listing.activate = "enable"
}

# === 安全头 ===
server.setenv = (
    "X-Content-Type-Options" => "nosniff",
    "X-Frame-Options"        => "SAMEORIGIN",
)
```

---

## 17. 本机环境速览

```
版本：     lighttpd/1.4.82 (ssl)
编译时：   Apple clang 21.0.0
配置文件： /opt/homebrew/etc/lighttpd/lighttpd.conf
模块目录： /opt/homebrew/Cellar/lighttpd/1.4.82/lib/
默认端口： 8080
文档根：   /opt/homebrew/var/www

事件处理器：  kqueue (macOS)
网络处理：    darwin-sendfile, writev, write, mmap support
特性：        IPv6, zlib, bzip2, OpenSSL, PCRE, LDAP, Y2038

已安装模块：
  mod_accesslog       mod_ajp13         mod_auth + mod_authn_file
  mod_authn_ldap      mod_cgi           mod_deflate
  mod_dirlisting      mod_extforward    mod_h2 (HTTP/2)
  mod_openssl (TLS)   mod_proxy         mod_rrdtool
  mod_sockproxy       mod_ssi           mod_status
  mod_userdir         mod_vhostdb + ldap mod_webdav
  mod_wstunnel
```

---

## 18. 常用配置选项速查表

### 服务器核心

| 选项 | 说明 | 示例 |
|------|------|------|
| `server.document-root` | 文档根目录 | `"/var/www"` |
| `server.port` | 监听端口 | `8080` |
| `server.bind` | 绑定地址 | `"127.0.0.1"` |
| `server.username` | 运行用户 | `"_www"` |
| `server.max-connections` | 最大连接数 | `1024` |
| `server.max-keep-alive-requests` | Keep-Alive 最大请求 | `128` |
| `server.max-keep-alive-idle` | Keep-Alive 空闲超时 | `30` |
| `server.follow-symlink` | 跟随符号链接 | `"enable"` |
| `server.tag` | Server 响应头 | `"lighttpd"` |
| `server.errorlog` | 错误日志路径 | `"/var/log/lighttpd/error.log"` |
| `server.pid-file` | PID 文件路径 | `"/var/run/lighttpd.pid"` |

### index / static-file

| 选项 | 说明 |
|------|------|
| `index-file.names` | 索引文件名列表 |
| `static-file.exclude-extensions` | 禁止直接访问的扩展名 |

### 条件变量

| 变量 | 匹配对象 |
|------|----------|
| `$HTTP["host"]` | 请求 Host 头 |
| `$HTTP["url"]` | 请求 URL 路径 |
| `$HTTP["remoteip"]` | 客户端 IP |
| `$HTTP["scheme"]` | http / https |
| `$HTTP["request-method"]` | GET / POST … |
| `$HTTP["querystring"]` | 查询字符串 |
| `$SERVER["socket"]` | 监听 socket |
| `$REQUEST["header"]` | 任意请求头 |

### 模块选项速查

| 模块 | 关键选项 |
|------|----------|
| mod_rewrite | `url.rewrite` `url.rewrite-once` `url.rewrite-if-not-file` `url.redirect` |
| mod_proxy | `proxy.server` `proxy.balance` `proxy.header` |
| mod_fastcgi | `fastcgi.server` `fastcgi.map-extensions` |
| mod_cgi | `cgi.assign` |
| mod_deflate | `deflate.enabled` `deflate.mimetypes` `deflate.cache-dir` |
| mod_expire | `expire.url` |
| mod_auth | `auth.require` `auth.backend` `auth.backend.htpasswd.userfile` |
| mod_access | `url.access-deny` |
| mod_dirlisting | `dir-listing.activate` `dir-listing.hide-dotfiles` |
| mod_webdav | `webdav.activate` `webdav.is-readonly` |
| mod_openssl | `ssl.engine` `ssl.pemfile` `ssl.privkey` `ssl.openssl.ssl-conf-cmd` |
| mod_status | `status.status-url` `status.statistics-url` |
| mod_setenv | `setenv.add-response-header` `setenv.add-environment` |
| mod_alias | `alias.url` |
| mod_redirect | `url.redirect` |
| mod_ssi | `ssi.extension` |
| mod_evhost | `evhost.path-pattern` |
| mod_simple_vhost | `simple-vhost.server-root` `simple-vhost.document-root` |
| mod_userdir | `userdir.path` |
| mod_wstunnel | `wstunnel.server` `wstunnel.frame-type` |
| mod_extforward | `extforward.forwarder` |
| mod_h2 | 自动启用（TLS） |

---

## 19. 注意事项与陷阱

1. **模块顺序至关重要**：access/auth 类放在 rewrite 之前，rewrite 放在 proxy/fastcgi 之前。字母排序会破坏功能。

2. **Homebrew 端口为 8080**：brew 安装的 lighttpd 默认端口是 8080（非 root 可绑定），生产环境用 80/443 需要 root 启动或系统服务。

3. **配置测试永远先行**：每次改配置后用 `lighttpd -tt -f config.conf` 测试，避免重启失败。

4. **静态文件排除**：`static-file.exclude-extensions` 防止 `.php` `.inc` 等源文件被直接下载。

5. **macOS sendfile**：macOS 原生支持 `darwin-sendfile`，无需额外配置。

6. **符号链接安全**：`server.follow-symlink = "enable"` 允许跟随符号链接，确保目标文件可被 lighttpd 用户读取。

7. **TLS PEM 文件**：`ssl.pemfile` 是证书链+私钥的合并文件，顺序：私钥 → 证书 → 中间证书。

8. **与 Nginx 的对比**：lighttpd 内存占用更低，配置语法更简洁；但生态和第三方模块不如 Nginx 丰富。适合静态文件/CDN/嵌入式场景。

9. **FastCGI 超时**：长时间运行的 FastCGI 请求可通过 `fastcgi.server` 中配置 `"idle-timeout"` 和 `"response-timeout"`。

10. **日志文件权限**：确保日志目录对 lighttpd 运行用户可写。`brew` 安装后日志在 `/opt/homebrew/var/log/lighttpd/`。
