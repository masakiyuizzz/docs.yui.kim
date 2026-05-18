# lsd —— 带图标和色彩的下一代 ls

> 用 Rust 重写的 GNU `ls`，支持 Nerd Font 图标、Git 集成、树状视图、丰富色彩。
> 版本：1.2.0（本机实测）
> 仓库：[github.com/lsd-rs/lsd](https://github.com/lsd-rs/lsd)

---

## 目录

1. [安装](#1-安装)
2. [基本用法](#2-基本用法)
3. [显示模式](#3-显示模式)
   - [网格/单列/长格式](#31-基本模式)
   - [递归与树状视图](#32-递归与树状视图)
4. [图标系统](#4-图标系统)
5. [色彩系统](#5-色彩系统)
6. [排序系统](#6-排序系统)
   - [全部排序方式](#61-排序方式速览)
   - [目录优先](#62-目录分组)
   - [组合排序](#63-组合排序)
7. [Blocks 自定义列](#7-blocks-自定义列)
8. [日期格式](#8-日期格式)
9. [大小显示格式](#9-大小显示格式)
10. [权限显示格式](#10-权限显示格式)
11. [Git 集成](#11-git-集成)
12. [过滤与忽略](#12-过滤与忽略)
13. [配置文件详解](#13-配置文件详解)
    - [config.yaml 完整示例](#131-configyaml-配置)
    - [colors.yaml 自定义颜色](#132-colorsyaml-自定义颜色)
    - [icons.yaml 自定义图标](#133-iconsyaml-自定义图标)
14. [环境变量](#14-环境变量)
15. [与 ls 的兼容性 & alias 设置](#15-与-ls-的兼容性--alias-设置)
16. [完整选项速查](#16-完整选项速查)
17. [注意事项与陷阱](#17-注意事项与陷阱)

---

## 1. 安装

```bash
# macOS Homebrew（本机安装方式）
brew install lsd

# Debian/Ubuntu
sudo apt install lsd

# Fedora
sudo dnf install lsd

# Arch Linux
sudo pacman -S lsd

# Windows (winget)
winget install lsd-rs.lsd

# Windows (scoop)
scoop install lsd

# 从源码编译（需要 Rust）
cargo install lsd
```

**前置要求**：要正常显示图标，终端需安装并启用 **Nerd Font**（否则图标会显示为方框或问号）。

推荐的 Nerd Font：
```bash
brew install font-hack-nerd-font  # 也支持 Meslo, FiraCode 等 Nerd Font
```

然后在终端偏好设置中将字体设为对应的 Nerd Font。

---

## 2. 基本用法

```bash
# 列出当前目录
lsd

# 列出指定目录
lsd /etc
lsd ~/Documents

# 列出多个目录
lsd src/ tests/

# 隐藏文件
lsd -a                    # 包括 . 开头的文件和 . .. 
lsd -A                    # 包括 . 开头但不显示 . 和 ..

# 兼容 ls 习惯
lsd -la                   # 长格式 + 隐藏文件
lsd -lAh                  # 长格式 + 隐藏文件 + 人类可读
```

---

## 3. 显示模式

### 3.1 基本模式

```bash
# 网格模式（默认）：多列对齐排列
lsd

# 单列模式：每行一个文件
lsd -1
lsd --oneline

# 长格式：显示权限、所有者、大小、日期等
lsd -l
lsd --long

# 经典模式：无图标、无色彩（传统 ls 外观）
lsd --classic
# 适用于脚本输出或复制粘贴场景
```

**三种模式对比**：
| 模式 | 命令 | 适用场景 |
|------|------|----------|
| 网格 | `lsd`（默认） | 日常快速浏览 |
| 单列 | `lsd -1` | 管道处理、脚本 |
| 长格式 | `lsd -l` | 查看详细信息 |

### 3.2 递归与树状视图

```bash
# 递归列出子目录内容
lsd -R

# 树状图（lsd 独有特色功能）
lsd --tree

# 树状图 + 限制深度
lsd --tree --depth 2

# 树状图 + 长格式（每个节点显示详细信息）
lsd -l --tree --depth 3

# 树状图 + 隐藏文件
lsd -a --tree --depth 2

# 树状图 + 只看目录本身（不展开目录内容）
lsd -d --tree
# 等价于 lsd --tree --directory-only

# 限定目录的树状深度
lsd --tree --depth 2 ~/projects
```

> `--tree` 替代了传统的 `tree` 命令，同时享受 lsd 的图标和色彩优势。

---

## 4. 图标系统

lsd 通过 Nerd Font 图标直观区分文件类型。

```bash
# 图标显示控制
lsd --icon always          # 始终显示图标
lsd --icon auto            # 自动（默认，检测终端支持后显示）
lsd --icon never           # 不显示图标

# 图标主题切换
lsd --icon-theme fancy     # fancy 主题：Nerd Font 丰富图标（默认）
lsd --icon-theme unicode   # unicode 主题：纯 unicode 字符，无需 Nerd Font
```

**fancy vs unicode 主题对比**：

| 主题 | 依赖 | 效果 | 兼容性 |
|------|------|------|--------|
| `fancy` | Nerd Font | 🦀 `.rs` 📂 目录 | 需要 Nerd Font |
| `unicode` | 无 | 纯文本符号 | 任意终端 |

典型图标含义速查：
| 图标 | 文件类型 |
|------|----------|
| 📂 /  | 目录 |
| 🦀 /  | Rust (.rs) |
| 🐍 /  | Python (.py) |
|  | Go (.go) |
|  | Git 仓库 (`.git`) |
| ⚙️ /  | 配置文件 (.yaml/.toml/.json) |
| 📜 /  | Markdown / 文本 |
| 🔗 | 符号链接 |
|  | 可执行文件 |

---

## 5. 色彩系统

```bash
# 色彩控制
lsd --color always         # 始终彩色
lsd --color auto           # 自动（默认，检测终端支持）
lsd --color never          # 不输出颜色

# 合并 style
lsd --color always --icon always
```

**颜色含义速查**：
| 颜色 | 含义 |
|------|------|
| 蓝色 | 目录 |
| 绿色 | 可执行文件 |
| 红色 | 损坏的符号链接 |
| 黄色 | 被修改过的文件（Git） |
| 青色 | 特殊文件（管道/套接字） |
| 灰色 | 隐藏文件 |

lsd 也兼容 `LS_COLORS` 环境变量（dircolors 标准）。

---

## 6. 排序系统

### 6.1 排序方式速览

```bash
# 按名称（默认）
lsd -l

# 按修改时间（最新的在最前）
lsd -lt
lsd -l --timesort

# 按文件大小
lsd -lS
lsd -l --sizesort

# 按文件扩展名
lsd -lX
lsd -l --extensionsort

# 按版本号自然排序（file1 < file2 < file10）
lsd -lv
lsd -l --versionsort

# 按 Git 状态排序
lsd -lG
lsd -l --gitsort

# 不排序（按磁盘目录顺序）
lsd -lU
lsd -l --no-sort

# --sort 统一接口
lsd --sort=size           # size / time / version / extension / git / none
lsd --sort=time
lsd --sort=git

# 反向排序
lsd -lr                    # 按名称倒序
lsd -ltr                   # 按时间倒序（最旧在前）
lsd -lSr                   # 按大小倒序（最小在前）
lsd --sort=size --reverse
lsd --reverse              # 所有排序方式通用
```

### 6.2 目录分组

```bash
# 目录排在前面（类似 Windows 资源管理器）
lsd -l --group-directories-first
lsd -l --group-dirs=first

# 目录排在最后
lsd -l --group-dirs=last

# 不分组（默认：目录和文件混排）
lsd -l --group-dirs=none
```

### 6.3 组合排序

```bash
# 目录优先 + 按大小倒序
lsd -l --group-dirs=first --sort=size --reverse

# 隐藏文件 + 按时间排序
lsd -la --sort=time

# 树状 + 按名称排序 + 目录优先
lsd --tree --group-dirs=first
```

---

## 7. Blocks 自定义列

在 `-l`（长格式）模式下，可以通过 `--blocks` 自定义显示哪些列以及列的顺序。

**可用 block**：

| block | 含义 |
|-------|------|
| `permission` | 权限位 |
| `user` | 所有者用户名 |
| `group` | 所属组名 |
| `context` | SELinux/SMACK 安全上下文 |
| `size` | 文件大小 |
| `date` | 修改日期 |
| `name` | 文件名 |
| `inode` | inode 号 |
| `links` | 硬链接数 |
| `git` | Git 状态列 |

**使用示例**：

```bash
# 默认顺序：permission, user, group, size, date, name
lsd -l

# 只显示 权限 + 大小 + 日期 + 文件名
lsd -l --blocks permission,size,date,name

# 加上 Git 状态列
lsd -l --blocks permission,user,group,size,date,git,name

# 加上 inode 号在最前面
lsd -l --blocks inode,permission,user,size,date,name

# 加上硬链接数
lsd -l --blocks permission,links,user,size,date,name

# 去掉 user 和 group（更简洁）
lsd -l --blocks permission,size,date,name
```

**列头**：
```bash
# 显示列头标题
lsd -l --header
lsd -l --blocks permission,user,size,date,name --header
```

**所有者名截断**：
```bash
# 用户名/组名超过 8 个字符时截断
lsd -l --truncate-owner-after 8

# 自定义截断标记（默认 "…"）
lsd -l --truncate-owner-after 8 --truncate-owner-marker "..."
```

---

## 8. 日期格式

```bash
# 默认格式（如 "2025-08-24 14:00"）
lsd -l --date=date

# locale 格式（跟随系统区域设置）
lsd -l --date=locale

# 相对时间（"2 hours ago", "3 days ago"）
lsd -l --date=relative

# 自定义 strftime 格式（+ 开头）
lsd -l --date='+%Y-%m-%d %H:%M:%S'       # 2025-01-15 10:30:45
lsd -l --date='+%Y/%m/%d'                 # 2025/01/15
lsd -l --date='+%H:%M'                    # 10:30
lsd -l --date='+%b %d %Y'                 # Jan 15 2025
```

常用 strftime 格式符：
| 格式 | 含义 | 示例 |
|------|------|------|
| `%Y` | 四位年 | 2025 |
| `%y` | 两位年 | 25 |
| `%m` | 月（01-12） | 01 |
| `%b` | 月缩写 | Jan |
| `%B` | 月全名 | January |
| `%d` | 日（01-31） | 15 |
| `%H` | 小时（00-23） | 14 |
| `%M` | 分钟（00-59） | 30 |
| `%S` | 秒（00-59） | 45 |
| `%a` | 星期缩写 | Mon |
| `%A` | 星期全名 | Monday |

---

## 9. 大小显示格式

```bash
# 默认：大于 1KB 用 KB/MB/G 显示
lsd -l --size=default

# 短格式：去掉 B 后缀（1.2K / 3.5M）
lsd -l --size=short

# 原始字节（不格式化）
lsd -l --size=bytes

# 显示目录总大小（包括子文件累加，递归统计）
lsd -l --total-size
# 注意：对大目录可能较慢
```

---

## 10. 权限显示格式

```bash
# Linux/macOS 默认：rwx 风格（如 rwxr-xr-x）
lsd -l --permission=rwx

# 八进制数字风格（如 755）
lsd -l --permission=octal

# 属性模式（Windows 默认，Unix 同 rwx）
lsd -l --permission=attributes

# 不显示权限列
lsd -l --permission=disable
```

---

## 11. Git 集成

```bash
# 在长格式中显示 Git 状态
lsd -l --git

# 等价于
lsd -l -g

# 结合 tree + git
lsd --tree --git --depth 2

# 按 Git 状态排序（修改过的文件排前面）
lsd -l --sort=git
```

Git 状态标识含义：
| 颜色 | 含义 |
|------|------|
| 绿色 | 已暂存（staged） |
| 黄色 | 已修改（modified） |
| 红色 | 已删除（deleted） |
| 青色 | 未跟踪（untracked） |
| 深红色 | 合并冲突（conflicted） |
| 默认色 | 未修改 |

> 目录的 Git 状态是其内部所有文件状态的归约结果（递归统计）。

---

## 12. 过滤与忽略

```bash
# 使用 glob 模式忽略文件
lsd -I "*.tmp"             # 不显示 .tmp 文件
lsd -I "node_modules"     # 不显示 node_modules

# 多个忽略模式（重复 -I）
lsd -I "*.log" -I "*.tmp"

# 配合 --tree 使用
lsd --tree -I "node_modules" -I ".git" --depth 3

# 显示 inode 号
lsd -i
lsd --inode

# 显示文件结尾标识符（*/=>@|）
lsd -F
lsd --classify
# 输出会在目录后加 /，可执行文件后加 *，符号链接后加 @ 等

# 符号链接处理
lsd -L                     # --dereference：显示目标文件的信息而非链接本身
lsd --no-symlink           # 不显示符号链接指向的目标路径
```

---

## 13. 配置文件详解

配置文件默认路径：`~/.config/lsd/config.yaml`

### 13.1 config.yaml 配置

```yaml
# ~/.config/lsd/config.yaml

# === 经典模式（去掉图标和颜色） ===
classic: false

# === 颜色 ===
color:
  when: auto              # always / auto / never

# === 图标 ===
icons:
  when: auto              # always / auto / never
  theme: fancy            # fancy / unicode
  separator: " "          # 图标和文件名之间的分隔符

# === 符号链接 ===
symlink-arrow: ⇒          # 符号链接的箭头符号

# === 排序 ===
sorting:
  dir-grouping: none      # none / first / last
  # 等价于 --group-dirs

# === 长格式默认 blocks ===
blocks:
  - permission
  - user
  - group
  - size
  - date
  - name
  # 可选额外添加：git, inode, links, context

# === 日期 ===
date: date                # date / locale / relative / +%Y-%m-%d

# === 大小 ===
size: default             # default / short / bytes

# === 权限 ===
permission: rwx           # rwx / octal / disable

# === 表头 ===
header: false

# === 递归 ===
recursion:
  enabled: false
  depth: 3                # 递归深度限制

# === 目录总大小 ===
total-size: false

# === 超链接（终端支持时） ===
hyperlink: never          # always / auto / never

# === 忽略 glob ===
ignore-globs:
  - .git
  - node_modules
  - __pycache__

# === LS_COLORS ===
ls-colors:
  # 兼容 dircolors 的 LS_COLORS 格式
  # 可在配置文件中覆盖特定文件类型的颜色

# === 所有者截断 ===
truncate-owner:
  after: 0               # 0 = 不截断
  marker: "…"            # 截断标记
```

### 13.2 colors.yaml 自定义颜色

文件路径：`~/.config/lsd/colors.yaml`

```yaml
# 用户和组名颜色
user: 230                # ANSI 256 色号（浅黄色）
group: 187               # 浅黄绿色

# 权限位颜色
permission:
  read: 28               # 绿色
  write: 220             # 黄色
  exec: 196              # 红色
  exec-sticky: 196
  no-access: 245
  octal: 6
  acl: 6
  context: 6

# 文件类型颜色
file-type:
  normal: 252
  directory: 33
  symlink:
    default: 51
    broken: 196
  pipe: 214
  block_device: 208
  char_device: 220
  socket: 214
  executable: 42
  special: 246

# Git 状态颜色
git-status:
  new-in-index: 34       # 绿色 → 已暂存
  modified: 208          # 橙色 → 已修改
  deleted: 160           # 红色 → 已删除
  conflicted: 124        # 深红色 → 冲突
  not-modified: 245

# ANSI 颜色值参考（0-255）
#   0-7:   黑 红 绿 黄 蓝 品红 青 白
#   8-15:  亮色版本
#   16-231: 216 色调色板
#   232-255: 灰度
# 也可以用 RGB: rgb(255,128,0) 或十六进制: "#FF8000"
```

### 13.3 icons.yaml 自定义图标

文件路径：`~/.config/lsd/icons.yaml`

```yaml
# 按文件名匹配
name:
  .gitignore: 
  .gitconfig: 
  README.md: 
  Makefile: 
  Dockerfile: 

# 按文件扩展名匹配
extension:
  rs: 🦀
  go: 
  js: 
  ts: 
  py: 
  css: 
  html: 
  json: 
  yaml: 
  toml: 
  md: 
  sh: 

# 按文件类型匹配
filetype:
  dir:                   # 目录
  file:                  # 普通文件
  symlink:               # 符号链接
  pipe: 󱧠                 # 管道
  socket: 󰞉               # 套接字
  executable:            # 可执行文件
  block_device: 󰌌         # 块设备
  char_device: 󰸓          # 字符设备
```

> 添加/修改配置文件后无需重启 —— lsd 每次运行都会读取配置。

---

## 14. 环境变量

| 变量 | 含义 |
|------|------|
| `LS_COLORS` | 文件名颜色定义（兼容 dircolors 格式） |
| `XDG_CONFIG_HOME` | 配置文件基础路径（默认 `~/.config`） |
| `SHELL_COMPLETIONS_DIR` / `OUT_DIR` | shell 补全脚本输出目录 |

**LS_COLORS 示例**：
```bash
export LS_COLORS="di=34:ex=32:ln=36:*.md=33:*.py=35"
# di=目录  ex=可执行  ln=符号链接  *.ext=特定扩展名
```

---

## 15. 与 ls 的兼容性 & alias 设置

```bash
# 完全替代 ls
alias ls='lsd'

# 常用 alias 组合
alias l='lsd'
alias la='lsd -a'
alias ll='lsd -l'
alias lla='lsd -la'
alias lt='lsd --tree'
alias ltd='lsd --tree --depth 2'

# 写入 ~/.zshrc
cat >> ~/.zshrc << 'EOF'
alias ls='lsd'
alias l='lsd'
alias la='lsd -a'
alias ll='lsd -l'
alias lla='lsd -la'
alias lt='lsd --tree'
alias ltd='lsd --tree --depth 2'
alias lS='lsd -lS'
alias lr='lsd -ltr'
EOF
source ~/.zshrc
```

兼容性注意事项：
- `-h`（human-readable）lsd 默认开启，不需要手动加
- `--classic` 可开启完全兼容 `ls` 的无装饰模式
- 脚本中如需可靠输出，建议用 `\ls` 调用系统原生 `ls`

---

## 16. 完整选项速查

```
lsd [OPTIONS] [FILE]...

显示选项：
  -1, --oneline              每行一个文件
  -l, --long                 长格式（权限、所有者、大小、日期）
  -R, --recursive            递归列出子目录
  --tree                     树状视图
  --depth <N>                递归深度限制
  -d, --directory-only       只显示目录本身（不展开内容）
  --classic                  经典模式（无图标颜色）
  --no-symlink               不显示符号链接目标
  -F, --classify             文件名后追加类型标识符 (*/=>@|)

文件过滤：
  -a, --all                  显示隐藏文件（含 . ..）
  -A, --almost-all           显示隐藏文件（不含 . ..）
  -I, --ignore-glob <P>      忽略匹配 glob 模式的文件（可重复）

图标与色彩：
  --icon <WHEN>              图标显示时机：always / auto / never
  --icon-theme <THEME>       图标主题：fancy / unicode
  --color <WHEN>             色彩时机：always / auto / never

排序：
  -t, --timesort             按修改时间排序
  -S, --sizesort             按文件大小排序
  -X, --extensionsort        按扩展名排序
  -v, --versionsort          按版本号自然排序
  -G, --gitsort              按 Git 状态排序
  --sort <TYPE>              统一排序参数：size/time/version/extension/git/none
  -U, --no-sort              不排序（磁盘目录顺序）
  -r, --reverse              反向排序
  --group-dirs <MODE>        目录分组：none / first / last
  --group-directories-first  目录排前面（= --group-dirs=first）

长格式定制：
  --blocks <B1,B2,...>       自定义列及其顺序
  --header                   显示列头
  --date <FORMAT>            日期格式：date/locale/relative/+strftime
  --size <FORMAT>            大小格式：default/short/bytes
  --permission <FORMAT>      权限格式：rwx/octal/attributes/disable
  --total-size               显示目录总大小（递归计算）
  --truncate-owner-after <N> 用户名截断长度
  --truncate-owner-marker <S> 截断标记

Git 集成：
  -g, --git                  显示 Git 状态（需配合 -l）

文件元数据：
  -i, --inode                显示 inode 号
  -L, --dereference          显示符号链接目标的信息
  -Z, --context              SELinux/SMACK 安全上下文

其他：
  --hyperlink <MODE>         文件名超链接：always/auto/never
  -N, --literal              不引用含空格的文件名
  --config-file <PATH>       指定配置文件
  --ignore-config            忽略配置文件
  --help                     帮助信息
  -V, --version              版本号
```

---

## 17. 注意事项与陷阱

1. **Nerd Font 是必须的**：终端未安装 Nerd Font 时 fancy 主题的图标会显示为方框/乱码。如不想安装字体，请切换到 `--icon-theme unicode`。

2. **`--classic` 模式**：完全移除图标和颜色，接近原生 `ls` 外观。适合脚本输出、管道处理或粘贴到文档。

3. **`--total-size` 性能**：对大目录递归统计所有文件大小，在深层目录或大量文件时可能较慢。

4. **配置文件优先级**：命令行参数 > 配置文件。使用 `--ignore-config` 可以临时忽略所有配置。

5. **`--tree` vs `-R`**：
   - `--tree` 树状可视化（美观、直观）
   - `-R` 扁平递归列表
   - 两者都受 `--depth` 限制

6. **与 `ls` 的差异**：
   - `-h` 无实际效果（lsd 默认 human-readable）
   - `-G` 在 lsd 中是 `--gitsort`，不是 `ls` 的 `--no-group`（BSD）或颜色控制

7. **`--color=always` + 管道**：管道到 `less -R` 时需要用 `--color=always` 保留颜色；管道到文件时可能包含 ANSI 控制码。

8. **排序优先级**：`--sort` / `--timesort` 等与 `--group-dirs` 组合时，先执行目录分组，再在各自组内排序。

9. **Windows 下的权限**：Windows 系统默认 `--permission=attributes`，Linux/macOS 默认 `--permission=rwx`。

10. **自定义配置文件路径**：`XDG_CONFIG_HOME` 改变时，配置文件位置随之移动。例如 `XDG_CONFIG_HOME=~/.dotfiles` 则配置在 `~/.dotfiles/lsd/config.yaml`。
