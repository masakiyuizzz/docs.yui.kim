# fastfetch —— 高速系统信息展示工具

> neofetch 的现代替代品，C 语言编写，启动速度快 10 倍以上，高度可定制。
> 版本：2.61.0 aarch64（本机 Homebrew 安装）
> 仓库：[github.com/fastfetch-cli/fastfetch](https://github.com/fastfetch-cli/fastfetch)
> 配置文档：[Wiki](https://github.com/fastfetch-cli/fastfetch/wiki/Configuration)

---

## 目录

1. [安装](#1-安装)
2. [基本用法](#2-基本用法)
3. [核心选项](#3-核心选项)
4. [Structure 模块控制](#4-structure-模块控制)
5. [Logo 定制](#5-logo-定制)
6. [颜色系统](#6-颜色系统)
7. [格式与显示微调](#7-格式与显示微调)
8. [输出格式](#8-输出格式)
9. [JSONC 配置文件详解](#9-jsonc-配置文件详解)
    - [生成配置](#91-生成配置文件)
    - [模块定义](#92-模块定义)
    - [条件模块](#93-条件模块)
    - [颜色与进度条](#94-颜色与进度条)
10. [预设（Presets）](#10-预设presets)
11. [内置模块速查](#11-内置模块速查)
12. [实战配置示例](#12-实战配置示例)
13. [注意事项与陷阱](#13-注意事项与陷阱)

---

## 1. 安装

```bash
# macOS Homebrew（本机安装方式）
brew install fastfetch

# Debian/Ubuntu
sudo apt install fastfetch

# Fedora
sudo dnf install fastfetch

# Arch Linux
sudo pacman -S fastfetch

# Windows (winget)
winget install fastfetch

# 从源码编译
git clone https://github.com/fastfetch-cli/fastfetch
cd fastfetch && mkdir build && cd build
cmake .. && make -j$(nproc)
sudo make install
```

---

## 2. 基本用法

```bash
# 默认显示系统信息
fastfetch

# 只显示特定模块
fastfetch -s os:kernel:cpu:gpu:memory

# 列出所有可用模块
fastfetch --list-modules

# 列出所有内置 logo
fastfetch --list-logos

# 列出所有预设
fastfetch --list-presets
```

---

## 3. 核心选项

```bash
# 指定 logo（用内置 logo 名）
fastfetch --logo Alpine

# 使用预设配置
fastfetch -c neofetch.jsonc
fastfetch -c archey.jsonc

# 指定配置文件
fastfetch -c ~/.config/fastfetch/myconfig.jsonc

# 生成配置文件
fastfetch --gen-config            # 默认路径
fastfetch --gen-config ~/myconfig.jsonc  # 指定路径

# 显示错误信息
fastfetch --show-errors

# 统计每个模块耗时（ms）
fastfetch --stat

# 纯文本模式（无颜色）
fastfetch --pipe

# 输出所有模块信息（全量显示）
fastfetch -c all.jsonc
```

---

## 4. Structure 模块控制

`-s` / `--structure` 控制显示哪些模块以及顺序。模块名用小写，用 `:` 分隔。

```bash
# 基础：只显示 OS、Kernel、CPU、Memory
fastfetch -s os:kernel:cpu:memory

# 全量模块
fastfetch -s title:separator:os:host:kernel:uptime:packages:shell:resolution:de:wm:theme:icons:terminal:cpu:gpu:memory:disk:battery:locale

# 排除特定模块（用 --structure-disabled）
fastfetch --structure-disabled cpu:gpu:battery

# 添加分隔行
fastfetch -s os:kernel:break:cpu:gpu
# "break" 模块输出一个空行
```

**常用模块名速查**（完整列表见第 11 节）：

| 模块名 | 显示内容 |
|--------|----------|
| `title` | 标题行（用户名@主机名） |
| `separator` | 分隔线 |
| `os` | 操作系统 |
| `host` | 主机型号 |
| `kernel` | 内核版本 |
| `uptime` | 运行时长 |
| `packages` | 已安装软件包数量 |
| `shell` | 当前 Shell |
| `de` | 桌面环境 |
| `wm` | 窗口管理器 |
| `terminal` | 终端模拟器 |
| `cpu` | CPU 型号/频率 |
| `cpuusage` | CPU 使用率 |
| `gpu` | GPU 型号 |
| `memory` | 内存使用 |
| `disk` | 磁盘使用 |
| `battery` | 电池状态 |
| `display` | 显示器分辨率 |
| `resolution` | 屏幕分辨率 |
| `localip` | 本地 IP 地址 |
| `media` | 当前播放歌曲 |
| `font` | 系统字体 |
| `loadavg` | 系统负载 |
| `locale` | 区域设置 |
| `bluetooth` | 蓝牙设备列表 |

---

## 5. Logo 定制

```bash
# 使用内置 logo
fastfetch --logo arch
fastfetch --logo Alpine
fastfetch --logo macOS

# 查看所有 logo 名称
fastfetch --list-logos

# 自定义 logo 文件（ASCII 文本文件）
fastfetch --logo my-ascii-logo.txt

# logo 颜色（编号对应行或区域）
fastfetch --logo-color-1 red
fastfetch --logo-color-2 blue
fastfetch --logo-color-3 green

# 全 logo 用同一颜色
fastfetch --logo-color-1 cyan --logo-color-2 cyan --logo-color-3 cyan

# 小 logo
fastfetch --logo-type small
fastfetch --logo-type small --logo Alpine_small

# 不显示 logo
fastfetch --logo none

# logo 与信息并排时的间距
fastfetch --logo-padding-left 4
fastfetch --logo-padding-right 2
fastfetch --logo-padding-top 1

# logo 宽度/高度（字符）
fastfetch --logo-width 40
fastfetch --logo-height 15
```

**颜色名称**（fastfetch 支持）：`red` `green` `yellow` `blue` `magenta` `cyan` `white` `black` `bright-red` `bright-green` `bright-yellow` `bright-blue` `bright-magenta` `bright-cyan` `bright-white` 或直接用 hex：`#ff6600`

---

## 6. 颜色系统

```bash
# 整体色彩方案
fastfetch --color blue           # 标题 + key 的颜色
fastfetch --color-keys green     # 设置 key 的颜色
fastfetch --color-title cyan     # 设置标题的颜色
fastfetch --color-output white   # 设置输出值的颜色
fastfetch --color-separator yellow  # key-value 分隔符的颜色
fastfetch --bright-color         # 使用亮色（bold）

# 温度颜色阈值
fastfetch --temp-color-green 34  # ≤此值用绿色
fastfetch --temp-color-yellow 208
fastfetch --temp-color-red 160

# 百分比/进度条颜色
fastfetch --percent-color-green 34
fastfetch --percent-color-yellow 208
fastfetch --percent-color-red 160
```

---

## 7. 格式与显示微调

```bash
# key 宽度对齐
fastfetch --key-width 20
# 所有 key 对齐到 20 字符宽

# key 左侧 padding
fastfetch --key-padding-left 2

# key 图标类型
fastfetch --key-type icon     # 带 Nerd Font 图标
fastfetch --key-type string   # 纯文本
fastfetch --key-type none     # 无图标

# 分隔符
fastfetch --separator " → "     # 默认是 ": "
fastfetch --separator "  "     # Nerd Font 分隔符号

# 大小显示精度
fastfetch --size-ndigits 2      # 保留 2 位小数
fastfetch --size-binary-prefix iec  # IEC (1024) 或 si (1000)
fastfetch --size-max-prefix g    # 最大单位到 GB

# 频率显示精度
fastfetch --freq-ndigits 2

# 温度单位
fastfetch --temp-unit celsius    # celsius / fahrenheit / kelvin
fastfetch --temp-ndigits 1       # 温度小数点位数

# 百分比精度
fastfetch --percent-type 2       # 0=不显示 1=数字 2=进度条 3=数字+进度条
fastfetch --percent-ndigits 1
fastfetch --percent-width 10     # 进度条宽度（字符数）

# 进度条外观
fastfetch --bar-char-elapsed "█"
fastfetch --bar-char-total "░"
fastfetch --bar-border-left "["
fastfetch --bar-border-right "]"
fastfetch --bar-width 20

# 持续时间显示缩写
fastfetch --duration-abbreviation
fastfetch --duration-space-before-unit false
```

---

## 8. 输出格式

```bash
# JSON 格式输出
fastfetch --format json > sysinfo.json

# 配合 jq 解析
fastfetch --format json | jq '.[] | select(.key == "CPU")'

# 纯文本输出（管道安全）
fastfetch --pipe

# 隐藏光标（防止闪烁）
fastfetch --hide-cursor

# 禁用自动换行
fastfetch --disable-linewrap

# 禁用输出缓冲
fastfetch --no-buffer
```

---

## 9. JSONC 配置文件详解

fastfetch 使用 **JSONC**（带注释的 JSON）格式配置。配置文件默认路径：
- `~/.config/fastfetch/config.jsonc`

### 9.1 生成配置文件

```bash
# 生成默认配置
fastfetch --gen-config

# 生成到指定路径
fastfetch --gen-config ~/my-fastfetch.jsonc

# 使用配置
fastfetch -c ~/my-fastfetch.jsonc
```

### 9.2 模块定义

```jsonc
// ~/.config/fastfetch/config.jsonc
{
    "logo": {
        "type": "macOS",      // logo 名称
        "padding": {
            "left": 4
        },
        "color": {
            "1": "blue",
            "2": "cyan"
        }
    },
    "display": {
        "separator": " → ",
        "color": {
            "keys": "yellow",
            "title": "cyan",
            "output": "white",
            "separator": "green"
        },
        "key": {
            "width": 20,
            "paddingLeft": 2
        },
        "size": {
            "ndigits": 1,
            "binaryPrefix": "iec",
            "maxPrefix": "g"
        },
        "percent": {
            "type": 2,         // 进度条
            "width": 10
        }
    },
    "modules": [
        {
            "type": "title",
            "format": "{user-name}@{host-name}",
            "color": "bright-blue"
        },
        {
            "type": "separator"
        },
        {
            "type": "os",
            "format": "{name} {version} {arch}",
            "key": "OS",
            "keyColor": "yellow"
        },
        {
            "type": "host",
            "key": "Host"
        },
        {
            "type": "kernel",
            "key": "Kernel",
            "format": "{release} {version}"
        },
        {
            "type": "uptime",
            "key": "Uptime",
            "format": " {uptime}"
        },
        {
            "type": "cpu",
            "key": "CPU",
            "format": "{name} ({cores} cores) @ {freq} GHz",
            "temp": true
        },
        {
            "type": "gpu",
            "key": "GPU",
            "format": "{name} ({driver})"
        },
        {
            "type": "memory",
            "key": "Memory",
            "format": "{used} / {total} ({percentage})"
        },
        {
            "type": "disk",
            "key": "Disk",
            "folders": "/:/Users"
        },
        {
            "type": "battery",
            "key": "Battery",
            "format": "{capacity}% [{status}]"
        },
        {
            "type": "localip",
            "key": "Local IP"
        },
        {
            "type": "colors",
            "key": "Colors",
            "symbol": "circle"
        },
        {
            "type": "break"
        },
        {
            "type": "custom",
            "format": "Have a nice day! 🌸"
        }
    ]
}
```

**可用 `format` 变量**：每个模块有不同的变量可用，例如 `cpu` 模块：`{name}` `{freq}` `{cores}` `{threads}` `{temp}` …

每个模块可设置的通用属性：
| 属性 | 说明 |
|------|------|
| `"type"` | 模块类型（必填） |
| `"key"` | 显示的 key 名 |
| `"format"` | 输出格式字符串 |
| `"keyColor"` | key 的颜色 |
| `"outputColor"` | output 值的颜色 |
| `"error"` | 出错时显示的文字（不设置则隐藏该行） |

### 9.3 条件模块

仅在某些条件下才显示模块：

```jsonc
{
    "type": "battery",
    "key": "Battery",
    "if": "battery"  // 有电池才显示
}
```

### 9.4 颜色与进度条

```jsonc
"display": {
    "percent": {
        "type": 3,                        // 数字+进度条
        "width": 10,
        "bar": {
            "charElapsed": "█",
            "charTotal": "─",
            "borderLeft": "[",
            "borderRight": "]",
            "colorElapsed": "green",
            "colorTotal": "dark-gray",
            "colorBorder": "white"
        },
        "green": "#00ff00",
        "yellow": "#ffaa00",
        "red": "#ff0000"
    },
    "temperature": {
        "unit": "celsius",
        "ndigits": 1,
        "green": "34",
        "yellow": "208",
        "red": "196"
    }
}
```

---

## 10. 预设（Presets）

fastfetch 内置了多个预设配置，一键切换风格：

```bash
# 列出所有预设
fastfetch --list-presets

# 使用预设
fastfetch -c neofetch.jsonc       # 模仿 neofetch 风格
fastfetch -c archey.jsonc         # 模仿 Archey 风格
fastfetch -c screenfetch.jsonc    # 模仿 screenFetch 风格
fastfetch -c hardware.jsonc       # 侧重硬件信息
fastfetch -c software.jsonc       # 侧重软件信息
fastfetch -c paleofetch.jsonc     # 极简风格
fastfetch -c all.jsonc            # 全量信息

# 预设 + 覆盖选项
fastfetch -c neofetch.jsonc -s os:kernel:cpu:memory

# 基于预设生成自定义配置
fastfetch -c neofetch.jsonc --gen-config ~/my-custom.jsonc
```

---

## 11. 内置模块速查

本机 fastfetch 2.61.0 支持 **40+ 模块**，完整列表：

| # | 模块 | 显示内容 |
|---|------|----------|
| 1 | `Battery` | 电池容量、状态 |
| 2 | `BIOS` | BIOS 名称、版本、发布日期 |
| 3 | `Bluetooth` | 蓝牙设备列表 |
| 4 | `BluetoothRadio` | 蓝牙适配器信息 |
| 5 | `Board` | 主板型号 |
| 6 | `Bootmgr` | 第二阶 bootloader（GRUB/systemd-boot） |
| 7 | `Break` | 空行分隔 |
| 8 | `Brightness` | 显示器亮度 |
| 9 | `Btrfs` | BTRFS 卷信息 |
| 10 | `Camera` | 摄像头列表 |
| 11 | `Chassis` | 机箱类型（笔记本/台式等） |
| 12 | `Command` | 执行自定义 shell 命令 |
| 13 | `Colors` | 终端 16 色调色板 |
| 14 | `CPU` | CPU 型号、频率 |
| 15 | `CPUCache` | CPU 缓存大小 |
| 16 | `CPUUsage` | CPU 使用率（需一定采集时间） |
| 17 | `Cursor` | 光标样式名 |
| 18 | `Custom` | 自定义文本（静态） |
| 19 | `DateTime` | 当前日期时间 |
| 20 | `DE` | 桌面环境名 |
| 21 | `Display` | 分辨率、刷新率 |
| 22 | `Disk` | 磁盘分区、空间使用 |
| 23 | `DiskIO` | 物理磁盘 I/O 吞吐 |
| 24 | `DNS` | DNS 服务器 |
| 25 | `Editor` | 默认编辑器 |
| 26 | `Font` | 系统字体名 |
| 27 | `Gamepad` | 手柄列表 |
| 28 | `GPU` | GPU 型号、显存 |
| 29 | `Host` | 主机产品名 |
| 30 | `Icons` | 图标主题 |
| 31 | `InitSystem` | init 系统（pid 1） |
| 32 | `Kernel` | 内核版本 |
| 33 | `Keyboard` | 键盘列表 |
| 34 | `LM` | 登录管理器（SDDM/GDM 等） |
| 35 | `Loadavg` | 系统负载均值 |
| 36 | `Locale` | 系统语言区域 |
| 37 | `LocalIp` | 本地 IP / MAC 地址 |
| 38 | `Logo` | 查询内置 logo（用于 JSON 输出） |
| 39 | `Media` | 当前播放歌曲 |
| 40 | `Memory` | 内存使用 |

其余模块：`Monitor` `NetIO` `OpenCL` `OS` `Packages` `PhysicalDisk` `Player` `PowerAdapter` `Processes` `PublicIp` `Separator` `Shell` `Sound` `Swap` `Terminal` `TerminalFont` `TerminalTheme` `Title` `TPM` `Uptime` `Users` `Version` `Vulkan` `WM` `Wifi` `Zpool`

> **注意**：部分模块仅在特定 OS 下可用（如 `Btrfs` 限于 Linux）。

---

## 12. 实战配置示例

### 12.1 极简风格（只显示核心信息）

```jsonc
{
    "modules": [
        { "type": "title", "format": "{user-name}@{host-name}" },
        { "type": "separator" },
        { "type": "os" },
        { "type": "host" },
        { "type": "kernel" },
        { "type": "uptime" },
        { "type": "shell" },
        { "type": "cpu", "format": "{name} @ {freq} GHz" },
        { "type": "gpu" },
        { "type": "memory" }
    ]
}
```

### 12.2 硬件监控面板

```jsonc
{
    "display": {
        "key": { "width": 16 },
        "percent": { "type": 2, "width": 20 }
    },
    "modules": [
        { "type": "title" },
        { "type": "separator" },
        { "type": "cpu", "temp": true, "format": "{name} ({freq} GHz) {temp}°C" },
        { "type": "cpuusage" },
        { "type": "memory" },
        { "type": "disk", "folders": "/" },
        { "type": "loadavg", "format": "{1m} {5m} {15m}" },
        { "type": "battery" }
    ]
}
```

### 12.3 网络与外部信息

```jsonc
{
    "modules": [
        { "type": "title" },
        { "type": "separator" },
        { "type": "localip" },
        { "type": "publicip" },
        { "type": "dns" },
        { "type": "wifi" },
        { "type": "netio" },
        { "type": "bluetooth" },
        { "type": "break" },
        { "type": "media", "key": "Now Playing" }
    ]
}
```

### 12.4 macOS 开发环境专用

```jsonc
{
    "logo": { "type": "macOS", "color": { "1": "cyan", "2": "green" } },
    "display": { "separator": " → ", "key": { "width": 16 } },
    "modules": [
        { "type": "title", "format": "{user-name}@{host-name}" },
        { "type": "separator" },
        { "type": "os", "format": "macOS {version} ({arch})" },
        { "type": "host", "key": "Machine" },
        { "type": "cpu", "format": "{name} ({freq} GHz, {cores} cores)" },
        { "type": "gpu", "key": "GPU" },
        { "type": "memory" },
        { "type": "disk", "key": "Disk", "folders": "/:/Users" },
        { "type": "uptime", "key": "Uptime" },
        { "type": "shell", "key": "Shell" },
        { "type": "terminal", "key": "Terminal" },
        { "type": "break" },
        { "type": "localip", "key": "Local IP" },
        { "type": "battery", "key": "Battery" }
    ]
}
```

### 12.5 命令行 alias

```bash
# ~/.zshrc 添加
alias ff='fastfetch'
alias ffs='fastfetch -c all.jsonc'                     # 全量信息
alias ffn='fastfetch -c neofetch.jsonc'                 # neofetch 风格
alias ffh='fastfetch -c hardware.jsonc'                 # 硬件信息
alias ffmin='fastfetch -s os:kernel:cpu:gpu:memory'    # 极简
```

---

## 13. 注意事项与陷阱

1. **「fastfetch」= 可执行文件名**：不是 `fastfetch`，就是 `fastfetch`（与软件同名）。

2. **和 neofetch 的关系**：neofetch 已停止维护（最后更新 2020），fastfetch 是其事实上的继任者。速度快 10 倍以上，配置方式不同（JSONC vs bash 脚本）。

3. **JSONC 格式敏感**：配置文件是严格的 JSONC，不支持尾随逗号（trailing comma），但支持 `//` 注释。

4. **模块名为 PascalCase**：JSON 配置中的 `"type"` 使用大写开头如 `"CPU"`，但 `-s` 命令行参数用小写如 `cpu`。

5. **温度显示权限**：macOS 上 CPU 温度可能需要辅助功能权限或有传感器访问限制。

6. **预设路径**：内置预设存储在 fastfetch 安装目录的 `presets/` 下，使用 `-c` 直接引用预设名称（如 `neofetch.jsonc`）而非完整路径。

7. **`--pipe` 管道兼容**：`fastfetch --pipe` 禁用所有颜色和格式，适合管道或脚本输出。

8. **`--stat` 诊断**：加 `--stat` 可查看每个模块的耗时（ms），用于诊断慢模块。

9. **logo 名区分大小写**：`--logo macOS` 和 `--logo macos` 可能不同，用 `--list-logos` 查看准确的名称。

10. **`-c` 冲突**：`fastfetch` 的 `-c` 是 `--config`，不要和 `aria2c` 的 `-c`（断点续传）混淆。

11. **自定义 logo 文件**：ASCII 文本文件每行代表 logo 的一行。可以为不同行指定颜色（ANSI 转义码或让 fastfetch 用 `--logo-color-*` 覆盖）。
