# skhd —— macOS 热键守护进程

> 简洁、高性能的 macOS 热键守护进程。通过 DSL 文本文件定义全局快捷键，支持模态系统、应用特定热键、按键合成、配置热加载。
> 版本：v0.3.9（本机实测）
> 仓库：[github.com/koekeishiya/skhd](https://github.com/koekeishiya/skhd)
> 维护状态：维护模式（maintenance mode），Zig 重写版见 [skhd.zig](https://github.com/jackielii/skhd.zig)

---

## 目录

1. [安装与首次运行](#1-安装与首次运行)
2. [命令行选项](#2-命令行选项)
3. [配置文件语法](#3-配置文件语法)
   - [基本热键规则](#31-基本热键规则)
   - [修饰键与字面量关键字](#32-修饰键与字面量关键字)
   - [特殊按键 keycode](#33-特殊按键-keycode)
4. [动作类型：命令模式](#4-动作类型命令模式)
5. [动作类型：按键直通（passthrough）](#5-动作类型按键直通passthrough)
6. [模态系统（Modal Hotkey System）](#6-模态系统modal-hotkey-system)
7. [应用特定热键（Application-Specific）](#7-应用特定热键application-specific)
8. [应用黑名单（Blacklist）](#8-应用黑名单blacklist)
9. [配置文件包含（.load）](#9-配置文件包含load)
10. [按键合成（-k / --key）](#10-按键合成--k---key)
11. [调试与诊断](#11-调试与诊断)
12. [Service 管理（launchd）](#12-service-管理launchd)
13. [综合实战配置示例](#13-综合实战配置示例)
    - [基础：应用启动器](#131-基础应用启动器)
    - [进阶：模态窗口管理（配合 yabai）](#132-进阶模态窗口管理配合-yabai)
    - [高级：多键序列快捷系统（leader key）](#133-高级多键序列快捷系统leader-key)
14. [注意事项与陷阱](#14-注意事项与陷阱)

---

## 1. 安装与首次运行

```bash
# Homebrew 安装（本机安装方式）
brew install koekeishiya/formulae/skhd

# 从源码编译
git clone https://github.com/koekeishiya/skhd
cd skhd
make install    # release 版本
make            # debug 版本
```

**首次运行必备步骤**：

1. 首次运行 `skhd` 时，macOS 会弹出 **辅助功能（Accessibility）权限请求**。
2. 进入 **系统设置 → 隐私与安全性 → 辅助功能**，勾选 `skhd`。
3. **重启 skhd** 使权限生效。

```bash
# 确保辅助功能权限已授权
skhd

# 或安装为 launchd 服务（开机自启）
skhd --install-service
skhd --start-service
```

**Secure Keyboard Entry（安全键盘输入）** 必须**关闭**，否则 skhd 无法接收按键事件。检查终端 app 的设置中是否关闭了此选项（iTerm2 中在 `Secure Input` 设置项）。

**本机状态**：`~/.skhdrc` 文件存在但内容为空（已安装，尚未配置快捷键）。

---

## 2. 命令行选项

```
用法：skhd [选项]

服务管理：
  --install-service      安装 launchd 服务（~/Library/LaunchAgents/）
  --uninstall-service    卸载 launchd 服务
  --start-service        启动 launchd 服务
  --restart-service      重启 launchd 服务
  --stop-service         停止 launchd 服务

运行时选项：
  -V, --verbose          输出调试信息（前台运行）
  -P, --profile          输出性能分析信息
  -v, --version          打印版本号
  -c, --config <path>    指定配置文件路径
  -o, --observe          观察模式：显示每次按键的 keycode 和修饰键（Ctrl+C 退出）
  -r, --reload           通知运行中的 skhd 重新加载配置文件
  -h, --no-hotload       禁用配置文件热加载

按键合成：
  -k, --key <keysym>     合成一次按键（语法同热键定义）
  -t, --text <string>    合成一行文本
```

**使用示例**：

```bash
# 前台运行 + 详细日志
skhd -V

# 观察按键事件（调试用，会显示 keycode 和修饰键）
skhd -o
# 按下 Ctrl+Shift+A 会输出类似：
#   keycode: 0x00, modifiers: ctrl, shift

# 指定自定义配置文件
skhd -c ~/my-skhd-config

# 重载配置（skhd 已在运行中）
skhd -r

# 合成按键
skhd -k "shift + alt - 7"
skhd -k "cmd - space"

# 合成文本输入
skhd -t "hello, world"
skhd -t "シ"                    # 支持 Unicode
```

**pid 文件**：运行中的 skhd 在 `/tmp/skhd_$USER.pid` 创建 pid 文件，确保单实例运行。`--reload` 通过信号通知现有实例重载配置。

**服务日志**：以 launchd 服务方式运行时，日志位于：
- `/tmp/skhd_$USER.out.log`（标准输出）
- `/tmp/skhd_$USER.err.log`（标准错误）

---

## 3. 配置文件语法

### 配置文件的查找顺序

skhd 按以下优先级查找配置文件：

1. `$XDG_CONFIG_HOME/skhd/skhdrc`
2. `$HOME/.config/skhd/skhdrc`
3. `$HOME/.skhdrc`

或通过 `-c` / `--config` 显式指定。

> 本机配置位于 `~/.skhdrc`（空文件）。

### 3.1 基本热键规则

skhd 使用简洁的 DSL 定义热键，语法规则：

```
hotkey   = <mode> '<' <action> | <action>

mode     = 'name of mode' | <mode> ',' <mode>

action   = <keysym> ':' <command>          | <keysym> '->' ':' <command>
           <keysym> ';' <mode>             | <keysym> '->' ';' <mode>
           <keysym> '[' <proc_map_lst> ']' | <keysym> '->' '[' <proc_map_lst> ']'

keysym   = <mod> '-' <key> | <key>

mod      = 'modifier keyword' | <mod> '+' <mod>

key      = <literal> | <keycode>
```

**最简单的热键**：

```bash
# 格式：修饰键 + 按键 : 执行的命令
alt - c : open -a 'Google Chrome'

# 多个修饰键（用 + 连接）
cmd + shift - return : open -na /Applications/kitty.app/Contents/MacOS/kitty

# 无修饰键（不推荐，会干扰打字）
space : echo "space pressed"
```

### 3.2 修饰键与字面量关键字

**修饰键关键字**：

| 关键字 | 对应按键 |
|--------|----------|
| `cmd` | Command (⌘) |
| `alt` | Option (⌥) |
| `ctrl` | Control (⌃) |
| `shift` | Shift (⇧) |
| `lalt` | 左 Option |
| `lctrl` | 左 Control |
| `lcmd` | 左 Command |
| `lshift` | 左 Shift |
| `ralt` | 右 Option |
| `rctrl` | 右 Control |
| `rcmd` | 右 Command |
| `rshift` | 右 Shift |
| `fn` | Function (fn) |
| `hyper` | Ctrl + Shift + Cmd + Option |
| `meh` | Ctrl + Shift + Option（不含 Cmd） |

**字面量关键字（特殊功能键）**：

| 关键字 | 对应按键 |
|--------|----------|
| `return` | Return / Enter |
| `space` | 空格 |
| `tab` | Tab |
| `escape` / `esc` | Escape |
| `delete` | Delete (Backspace) |
| `forward_delete` | Forward Delete (⌦) |
| `left` | ← 左箭头 |
| `right` | → 右箭头 |
| `up` | ↑ 上箭头 |
| `down` | ↓ 下箭头 |
| `home` | Home |
| `end` | End |
| `page_up` | Page Up |
| `page_down` | Page Down |
| `f1` ~ `f20` | F1 ~ F20 功能键 |
| `insert` | Insert |
| `volume_up` | 音量+ |
| `volume_down` | 音量- |
| `mute` | 静音 |
| `prev` | 上一曲 |
| `next` | 下一曲 |
| `play` | 播放/暂停 |

### 3.3 特殊按键 keycode

当字面量关键字覆盖不到的按键，使用 Apple 键盘的 `kVK_<Key>` 十六进制值：

```bash
# 使用 keycode 绑定按键（0x 前缀表示十六进制）
ctrl - 0x15       # kVK_ANSI_Y

# 常用 keycode 参考
# 0x00 = A, 0x0B = B, 0x08 = C  ...
# 0x1D = 0, 0x12 = 1, 0x13 = 2  ...
# 0x31 = 空格
# 0x24 = Return
# 0x30 = Tab
# 0x35 = Escape
# 0x33 = Delete (Backspace)
# 0x75 = Forward Delete
# 0x7B = Left, 0x7C = Right, 0x7E = Up, 0x7D = Down
```

> 使用 `skhd -o` 观察模式可以直接看到每次按键的 keycode 和修饰键，无需死记。

---

## 4. 动作类型：命令模式

命令模式是 skhd 最常用的触发方式。命令通过 `$SHELL -c` 执行（默认 `/bin/bash`）。

```bash
# 基本命令
alt - t : open -a 'iTerm'
cmd - s : /path/to/script.sh

# 多命令（用 ; 链式执行）
alt - b : btop; exit

# 多行命令（用 \ 续行）
alt - d : date "+%Y-%m-%d %H:%M:%S" \
          | pbcopy

# 带参数的命令
cmd + shift - r : open -na /Applications/Firefox.app \
                  --args --new-window https://github.com

# 使用 osascript 控制 macOS 应用
cmd + shift - j : osascript -e 'tell application "iTerm" to activate'
```

**常见使用模式**：
```bash
# 打开应用
alt - f : open -a 'Finder'
alt - c : open -a 'Google Chrome'
alt - v : open -a 'Visual Studio Code'

# 打开终端（比 iTerm 启动快得多）
cmd - return : /Applications/kitty.app/Contents/MacOS/kitty --single-instance -d ~

# 使用剪贴板内容
cmd - m : open -na /Applications/mpv.app $(pbpaste)

# 执行 shell 管道
cmd + shift - p : echo "$(date): screenshot taken" >> ~/log.txt
```

---

## 5. 动作类型：按键直通（passthrough）

默认情况下，skhd 会 **消费** 按键事件（即原按键不会被传递到活跃应用）。使用 `->` 箭头符号可以让按键**不被消费**，继续传递给前台应用。

```bash
# 执行命令，但按键不消费（命令也会执行，原按键也传递）
alt - c -> : open -a 'Google Chrome'

# 模式切换，按键不消费
cmd - x -> ; my_mode

# 对比：
cmd - x ; my_mode       # ctrl+x 被消费，应用收不到
cmd - x -> ; my_mode    # ctrl+x 不被消费，应用正常接收
```

**何时使用 `->`**：
- 热键触发的同时还希望应用接收到该按键
- 热键触发的是"附加"行为而非"替代"行为

---

## 6. 模态系统（Modal Hotkey System）

skhd 支持**模态热键**，类似 Vim 的编辑模式——同一按键在不同模式下触发不同命令。

### 模式声明

```
mode_decl = '::' <name> '@' ':' <command> | '::' <name> ':' <command> |
            '::' <name> '@'               | '::' <name>

name      = 模式名称
@         = 捕获所有按键（即使未绑定动作也不转发）
command   = 进入/离开模式时执行的命令（可选）
```

### 基本模态示例

```bash
# --- 声明模式 ---

# 声明一个简单模式（无进入/离开命令）
:: launcher

# 声明模式 + 进入时执行命令
:: launcher : osascript -e 'display notification "进入 Launcher 模式"'

# 声明模式 + 捕获所有按键（@）+ 进入时执行命令
:: shortcut @ : osascript -e 'display notification "进入 Shortcut 模式"'

# --- 声明 default 模式的 on_enter 命令 ---
# default 是预设的默认模式名
:: default : yabai -m config active_window_border_color 0xff775759

# --- 模式切换 ---

# 从任何模式切换到 launcher 模式
cmd + shift - space ; launcher

# 从 launcher 模式切换回 default
launcher < escape ; default

# launcher 模式内的热键定义
launcher < c : open -a 'Google Chrome'
launcher < t : open -a 'iTerm'
launcher < v : open -a 'Visual Studio Code'
launcher < f : open -a 'Finder'
```

### 模式完整示例

```bash
# ~/.skhdrc

# 声明 launcher 模式（进入时通知）
:: launcher : osascript -e 'display notification "🔵 Launcher" with title "skhd"'

# 声明 shortcut 模式
:: shortcut : osascript -e 'display notification "🟢 Shortcut" with title "skhd"'

# default 模式下的模式切换热键
cmd + shift - l ; launcher
cmd + shift - s ; shortcut

# launcher 模式：打开应用
launcher < c : open -a 'Google Chrome'
launcher < t : open -a 'iTerm'
launcher < v : open -a 'Visual Studio Code'
launcher < f : open -a 'Finder'
launcher < s : open -a 'Spotify'
launcher < m : open -a 'Mail'
launcher < n : open -a 'Notes'
launcher < escape ; default      # 返回 default

# shortcut 模式：执行脚本/系统操作
shortcut < c : pbpaste | pbcopy  # 剪贴板历史（简化示意）
shortcut < s : screencapture -i ~/Desktop/screenshot.png
shortcut < l : pmset displaysleepnow
shortcut < escape ; default      # 返回 default

# 跨模式通用的热键
default, launcher < cmd - return : open -na /Applications/kitty.app/Contents/MacOS/kitty --single-instance -d ~
```

### 模式关键点

- **模式名区分大小写**：`Launcher` ≠ `launcher`
- **逗号分隔多个模式**：`default, launcher < key` 表示两个模式下都可用
- **`@` 捕获模式**：声明时加 `@` 会让 skhd 阻止所有未绑定的按键传递到应用
- **`default` 是保留模式名**：启动后的初始模式
- **模式隔离**：每个模式的快捷键互不干扰

---

## 7. 应用特定热键（Application-Specific）

同一热键在不同应用中触发不同命令（`[...]` 语法）。

```bash
# 语法：
# <keysym> [
#     "App Name" : <command>            # 只在指定应用中触发
#     "App Name" ~                       # 在指定应用中去绑定（转发按键）
#     "*" : <command>                   # 匹配所有未指定应用
#     "*" ~                              # 所有未指定应用去绑定
# ]

# 示例：Ctrl+N 在不同应用中的行为
cmd - n [
    "kitty" : echo "hello kitty"
    "Visual Studio Code" : echo "hello vscode"
    "Finder" ~                                   # Finder 中直接转发（不处理）
    "*" : echo "hello everyone"                  # 其他所有应用
]
```

**完整示例**：

```bash
# 在终端和浏览器中使用不同快捷键打开新窗口
cmd - t [
    "kitty" : /Applications/kitty.app/Contents/MacOS/kitty --single-instance -d ~
    "iTerm" : osascript -e 'tell application "iTerm" to create window with default profile'
    "Google Chrome" : osascript -e 'tell application "Google Chrome" to make new tab with properties {URL:"about:blank"}'
    "*" ~
]
```

**应用名称获取方式**：
- 查看 Dock 中的应用名
- 使用 `osascript -e 'id of app "App Name"'` 查看 bundle identifier
- 使用 `skhd -V` 运行，切换应用时会打印应用名

---

## 8. 应用黑名单（Blacklist）

阻止 skhd 监听特定应用中的按键事件。

```bash
# 在这些应用中 skhd 完全不处理任何热键
.blacklist [
    "kitty"
    "iTerm"
    "terminal"
    "Google Chrome"
]

# 使用场景：
# - 终端类应用：避免与终端内的快捷键冲突
# - 虚拟机/远程桌面：让按键完全传递给虚拟机
# - 全屏游戏：避免热键干扰游戏操作
```

---

## 9. 配置文件包含（.load）

将配置拆分为多个文件以便管理。

```bash
# ~/.skhdrc

# 加载绝对路径文件
.load "/Users/myuser/.config/skhd/launcher.conf"

# 加载相对路径文件（相对当前 skhdrc 所在目录）
.load "window-management.conf"
.load "app-shortcuts.conf"
```

**推荐拆分结构**：

```
~/.config/skhd/
├── skhdrc            # 主配置（模式声明、load 指令、blacklist）
├── default.conf      # default 模式快捷键
├── launcher.conf     # 应用启动快捷
├── window.conf       # 窗口管理（配合 yabai）
└── media.conf        # 媒体控制
```

**主配置 `skhdrc`**：
```bash
.blacklist [
    "kitty"
]

:: launcher : osascript -e 'display notification "launcher mode" with title "skhd"'
:: window @ : osascript -e 'display notification "window mode" with title "skhd"'

cmd + shift - l ; launcher
cmd + shift - w ; window

.load "default.conf"
.load "launcher.conf"
.load "window.conf"
```

---

## 10. 按键合成（-k / --key）

skhd 可以**合成按键事件**，从命令行模拟按键输入。

```bash
# 基本语法（与热键定义语法相同）
skhd -k "shift + alt - 7"

# 模拟 Command+Space 打开 Spotlight/Alfred
skhd -k "cmd - space"

# 模拟特殊键
skhd -k "cmd - left"
skhd -k "alt - tab"
skhd -k "return"

# 合成文本
skhd -t "hello, world"
skhd -t "https://github.com"
```

**进阶：结合热键使用**——让一个热键触发多个按键操作：

```bash
# 一个热键实现"输入模板"
alt - e : skhd -t "console.log('debug:'); "  # 输入代码模板
alt - d : skhd -t "$(date '+%Y-%m-%d')"      # 输入当前日期

# 组合按键
alt - cmd - left : skhd -k "shift + cmd - left" && skhd -k "shift + cmd - down"
```

> 注意：`-k` 递归合成按键不会触发 skhd 自身的热键（无无限循环风险）。

---

## 11. 调试与诊断

```bash
# 前台运行 + 详细日志
skhd -V

# 输出类似：
# skhd: watching events..
# skhd: config file: /Users/user/.skhdrc
# skhd: hotkey :: cmd - return
# skhd: hotkey :: alt - t
# skhd: binding mapped: cmd - return -> /Applications/kitty...

# 观察模式（显示 keycode 和修饰键）
skhd -o
# 按下按键时输出：
# keycode: 0x08, modifiers: cmd, shift
# 按 Ctrl+C 退出

# 停止服务，前台调试
skhd --stop-service
skhd -V             # 在前台运行调试

# 调试完成后恢复服务
skhd --start-service

# 热加载配置（不中断服务）
skhd -r

# 查看服务日志
cat /tmp/skhd_$(whoami).out.log
cat /tmp/skhd_$(whoami).err.log
```

**常见调试流程**：

1. `skhd --stop-service` 停止后台服务
2. `skhd -V` 前台运行，观察每次按键的匹配日志
3. `skhd -o` 单独调试按键识别问题
4. 修改 `~/.skhdrc` 后 `skhd -r` 热重载
5. 确认没问题后 `skhd --start-service` 恢复后台服务

---

## 12. Service 管理（launchd）

skhd 可作为 launchd 服务常驻后台、开机自启。

```bash
# 安装服务（创建 plist 文件）
skhd --install-service
# 文件位置：~/Library/LaunchAgents/com.koekeishiya.skhd.plist

# 启动服务
skhd --start-service

# 停止服务
skhd --stop-service

# 重启服务
skhd --restart-service

# 卸载服务（删除 plist）
skhd --uninstall-service
```

**手动管理（备选）**：

```bash
# 使用 launchctl 手动管理
launchctl load ~/Library/LaunchAgents/com.koekeishiya.skhd.plist
launchctl unload ~/Library/LaunchAgents/com.koekeishiya.skhd.plist
launchctl list | grep skhd
```

**添加环境变量到 launchd 服务**：

有时 launchd 运行的环境与你终端的环境不一致（如 `$PATH`、`$SHELL`）。可以在 plist 中手动添加：

```xml
<!-- ~/Library/LaunchAgents/com.koekeishiya.skhd.plist 添加 -->
<key>EnvironmentVariables</key>
<dict>
    <key>PATH</key>
    <string>/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin</string>
    <key>SHELL</key>
    <string>/bin/zsh</string>
</dict>
```

---

## 13. 综合实战配置示例

### 13.1 基础：应用启动器

```bash
# ~/.skhdrc —— 最简洁的启动器配置

# 应用快速切换
alt - c : open -a 'Google Chrome'
alt - t : open -a 'iTerm'
alt - v : open -a 'Visual Studio Code'
alt - f : open -a 'Finder'
alt - n : open -a 'Notes'
alt - m : open -a 'Mail'
alt - s : open -a 'Spotify'

# 打开当前目录终端
cmd - return : /Applications/kitty.app/Contents/MacOS/kitty --single-instance -d ~

# 剪贴板操作
cmd + shift - c : pbpaste | pbcopy          # 清除格式

# 锁屏
cmd + shift - l : pmset displaysleepnow
```

### 13.2 进阶：模态窗口管理（配合 yabai）

```bash
# ~/.skhdrc

.blacklist [
    "kitty"
]

# === default 模式：窗口移动 ===
# 聚焦窗口
alt - h : yabai -m window --focus west
alt - j : yabai -m window --focus south
alt - k : yabai -m window --focus north
alt - l : yabai -m window --focus east

# 移动窗口
shift + alt - h : yabai -m window --warp west
shift + alt - j : yabai -m window --warp south
shift + alt - k : yabai -m window --warp north
shift + alt - l : yabai -m window --warp east

# 调整窗口大小
ctrl + alt - h : yabai -m window --resize left:-50:0
ctrl + alt - j : yabai -m window --resize bottom:0:50
ctrl + alt - k : yabai -m window --resize top:0:-50
ctrl + alt - l : yabai -m window --resize right:50:0

# 旋转布局
alt - r : yabai -m space --rotate 90

# === 切换 Space ===
alt - 1 : yabai -m space --focus 1
alt - 2 : yabai -m space --focus 2
alt - 3 : yabai -m space --focus 3

# 移动窗口到指定 Space
shift + alt - 1 : yabai -m window --space 1; yabai -m space --focus 1
shift + alt - 2 : yabai -m window --space 2; yabai -m space --focus 2
```

### 13.3 高级：多键序列快捷系统（Leader Key）

参考 Vim 的 leader key 理念——先按 leader，再按序列键触发不同动作。

```bash
# ~/.skhdrc

# Leader 模式（按 cmd+space 进入，按键后自动退出）
:: leader @ : osascript -e 'display notification "⌨ Leader Active" with title "skhd"'

# 进入 leader 模式
cmd - space ; leader

# leader 模式：第一个字母选择类别
leader < w [
    "kitty" : echo "already in terminal"
    "*" : skhd -k "cmd - space ; win-leader"
]

leader < a [
    "kitty" : echo "already in terminal"
    "*" : skhd -k "cmd - space ; app-leader"
]

# 窗口操作子模式
:: win-leader @
win-leader < h : yabai -m window --focus west; skhd -k "escape"
win-leader < j : yabai -m window --focus south; skhd -k "escape"
win-leader < k : yabai -m window --focus north; skhd -k "escape"
win-leader < l : yabai -m window --focus east; skhd -k "escape"
win-leader < f : yabai -m window --toggle zoom-fullscreen; skhd -k "escape"
win-leader < escape ; default

# 应用启动子模式
:: app-leader @
app-leader < c : open -a 'Google Chrome'; skhd -k "escape"
app-leader < t : open -a 'iTerm'; skhd -k "escape"
app-leader < v : open -a 'Visual Studio Code'; skhd -k "escape"
app-leader < f : open -a 'Finder'; skhd -k "escape"
app-leader < escape ; default
```

> 更深层次的键盘序列定制可参考 [Multi-key shortcuts with skhd + Raycast](https://heckmann.app/en/blog/multi-key-shortcuts/)。

---

## 14. 注意事项与陷阱

1. **辅助功能权限**：首次运行必须授予辅助功能权限，否则 skhd 无法拦截按键事件。授权后必须重启 skhd。

2. **Secure Keyboard Entry**：终端的"安全键盘输入"功能会阻止 skhd 工作。检查 iTerm2/Terminal.app 的设置。

3. **配置热加载**：修改配置后执行 `skhd -r` 即可，无需重启服务。`-h / --no-hotload` 可禁用此功能。

4. **单实例运行**：通过 pid 文件保证同一用户只有一個 skhd 实例。如果 pid 文件残留（异常退出），需要手动删除 `/tmp/skhd_$USER.pid`。

5. **模式名区分大小写**：`launcher` 和 `Launcher` 是不同的模式。建议全部使用小写。

6. **逗号分隔模式**：`default, launcher < key : cmd` 表示在 default 和 launcher 模式下都可用。逗号**后有空格也没关系**。

7. **命令执行环境**：命令通过 `$SHELL -c` 执行（默认 `/bin/bash`）。若使用 zsh 特性需确认 `$SHELL` 环境变量。

8. **`->` passthrough 的位置**：必须写在 `hotkey` 和动作之间（`:` `;` `[` 之前）。

9. **`.blacklist` 的应用名**：使用 Activity Monitor 或 Dock 中显示的应用名。不完全匹配则无效（已规范化比较——忽略大小写和空格）。

10. **`.load` 相对路径**：相对路径相对于包含该 `.load` 指令的配置文件所在目录。

11. **快捷键冲突**：skhd 的优先级高于系统快捷键。如果某个系统快捷键失效了，检查 skhd 是否绑定了相同的组合键。

12. **与 Karabiner 共存**：skhd 和 Karabiner 可以共存，但可能产生优先级问题。一般建议二选一。

13. **项目维护状态**：原作者声明项目处于维护模式（maintenance mode）。长期使用可关注 Zig 重写版 [skhd.zig](https://github.com/jackielii/skhd.zig)。
