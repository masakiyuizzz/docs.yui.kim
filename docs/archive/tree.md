# tree —— 递归目录树形可视化

> 以树形缩进结构显示目录内容，支持彩色输出、文件元数据、模式过滤、XML/HTML/JSON 导出。
> 版本：v2.3.2（本机实测，© 1996-2026 Steve Baker et al.）
> 安装：`brew install tree`（macOS 默认不内置）

---

## 目录

1. [安装](#1-安装)
2. [基本用法](#2-基本用法)
3. [深度控制](#3-深度控制)
4. [列出选项（Listing Options）](#4-列出选项listing-options)
   - [显示控制](#41-显示控制--a--d--f--x--prune)
   - [模式过滤与 .gitignore](#42-模式过滤与-gitignore)
5. [文件信息选项（File Options）](#5-文件信息选项file-options)
6. [排序选项](#6-排序选项)
7. [图形选项](#7-图形选项)
8. [XML / HTML / JSON 格式导出](#8-xml--html--json-格式导出)
   - [HTML 输出详解](#81-html-输出详解)
   - [XML 输出](#82-xml-输出)
   - [JSON 输出](#83-json-输出)
   - [超链接输出](#84-超链接输出hyperlinks)
9. [输入选项（--fromfile / --fromtabfile）](#9-输入选项--fromfile--fromtabfile)
10. [综合实战场景](#10-综合实战场景)
    - [代码审查 / PR 描述](#101-代码审查--pr-描述)
    - [README 中的项目结构图](#102-readme-中的项目结构图)
    - [日志审计 / 安全扫描](#103-日志审计--安全扫描)
    - [只关心目录结构](#104-只关心目录结构)
    - [统计文件数量](#105-统计文件数量)
    - [磁盘空间分析](#106-磁盘空间分析)
11. [环境变量](#11-环境变量)
12. [完整选项速查表](#12-完整选项速查表)
13. [注意事项与陷阱](#13-注意事项与陷阱)

---

## 1. 安装

```bash
# macOS（本机安装方式）
brew install tree

# Debian/Ubuntu
sudo apt install tree

# Fedora/CentOS/RHEL
sudo dnf install tree
sudo yum install tree

# Arch Linux
sudo pacman -S tree

# Alpine
apk add tree

# Windows (winget)
winget install tree
```

验证安装：
```bash
tree --version
# 输出：tree v2.3.2 © 1996 - 2026 by Steve Baker, Thomas Moore, ...
```

> macOS 自带终端不内置 `tree` 命令。`ls -R` 可递归列出但不具备树形缩进效果。

---

## 2. 基本用法

```bash
# 列出当前目录树
tree

# 列出指定目录
tree /path/to/project
tree ~/Documents ~/Pictures

# 典型输出示例：
# .
# ├── README.md
# └── src
#     ├── main.rs
#     └── lib.rs
# 1 directory, 3 files
```

**输出末尾统计行**：
```
2 directories, 15 files
```

每行末尾的数字统计是 `tree` 的标志性输出，包括目录数和文件数。

---

## 3. 深度控制

```bash
# 只显示 2 层
tree -L 2

# 只显示 1 层（当前目录下第一级）
tree -L 1

# 只显示 3 层
tree -L 3

# 递归深入：到指定层后继续深入，
# 每到一个新级别输出到文件 00Tree.html
tree -L 2 -R
# -R 配合 -L 使用，逐级生成 HTML 文件
```

**`-L` 的层级从 0 开始计数**：
- `-L 0`：只显示当前目录名（不展开）
- `-L 1`：展开当前目录下第一级子项
- `-L 2`：展开两级

---

## 4. 列出选项（Listing Options）

### 4.1 显示控制：`-a` `-d` `-f` `-x` `--prune`

```bash
# 显示所有文件（包括以 . 开头的隐藏文件）
tree -a

# 只显示目录
tree -d

# 显示文件完整路径前缀
tree -f
# 输出每行都带完整路径：
# ./src/main.rs
# ./src/lib.rs

# 跟踪符号链接（如果链接指向目录，进入该目录）
tree -l

# 仅停留在当前文件系统（不跨越挂载点）
tree -x
# 等价于 find -xdev

# 删除输出中的空目录
tree --prune
# 常配合 -P / -I 使用：过滤后把变空的目录从输出中移除

# 压缩缩进（减少缩进空格数）
tree --compress 2
# 每层缩进只占 2 个空格（默认 4）

# --condense：压缩单子目录（只有一个子项的目录压缩为一行）
tree --condense
# dir1/dir2/file.txt → 一行显示而非展开三层

# --filelimit #：文件数超过 # 的目录不再深入展开
tree --filelimit 50
# 超过 50 个文件的目录只显示目录名，不展开内容
```

### 4.2 模式过滤与 .gitignore

```bash
# 只列出匹配模式的文件（支持通配符）
tree -P "*.rs"
tree -P "*.py"
tree -P "*.rs|*.toml"          # | 分隔多个 pattern

# 排除匹配模式的文件
tree -I "*.log"
tree -I "node_modules"
tree -I "node_modules|.git|*.tmp"

# 多个 -I 叠加
tree -I "*.log" -I "*.tmp"

# 忽略大小写匹配
tree -I "readme.md" --ignore-case

# -P 时包含目录名匹配
tree -P "src" --matchdirs
# 目录名也参与模式匹配，匹配的目录内容不再展开

# 使用 .gitignore 文件过滤
tree --gitignore
# 自动读取当前目录和各个子目录中的 .gitignore

# 显式指定 gitignore 文件
tree --gitignore --gitfile=/path/to/custom_gitignore
```

**通配符语法的特殊规则**：
| 通配符 | 含义 |
|--------|------|
| `*` | 匹配零个或多个字符（不跨 `/`） |
| `**` | 匹配零个或多个字符（跨 `/`，即匹配路径） |
| `?` | 匹配单个字符 |
| `[abc]` | 匹配括号内任一字符 |
| `[A-Z]` | 匹配字符范围 |
| `[^abc]` | 排除括号内字符 |
| `\|` | 分隔多个备选 pattern |
| `/` 结尾 | 匹配目录，不匹配文件 |

**示例**：
```bash
# 排除所有 .git 目录和 node_modules
tree -I ".git|node_modules"

# 排除名字以 . 开头的（等价于不带 -a）
tree -I ".*"

# 只显示 markdown 和 txt 文件
tree -P "*.md|*.txt"

# 排除 build 和 dist，但保留 build 下的 README
tree -I "build|dist" -P "README.md"
```

---

## 5. 文件信息选项（File Options）

树形显示的同时附加文件元数据：

```bash
# 文件权限（如 -rw-r--r--）
tree -p

# 文件所有者
tree -u

# 文件所属组
tree -g

# 文件大小（字节）
tree -s

# 文件大小（人类可读：K, M, G）
tree -h

# 人类可读 + SI 单位（1000 进制而非 1024）
tree -h --si

# 计算目录总大小（累加内部所有文件，而非目录自身占用的空间）
tree -h --du

# 最后修改日期
tree -D

# 最后状态变更日期（ctime）
tree -D -c

# 自定义日期格式（strftime）
tree -D --timefmt="%Y-%m-%d %H:%M:%S"
tree -D --timefmt="%Y/%m/%d"
tree -D --timefmt="%b %d %H:%M"

# 文件类型标记（/ = * @ | > 等，等同 ls -F）
tree -F
# 目录 → 尾部加 /
# 可执行文件 → 尾部加 *
# 符号链接 → 尾部加 @
# FIFO/管道 → 尾部加 |
# socket → 尾部加 =

# 显示 inode 号
tree --inodes

# 显示设备号
tree --device

# 信息显示在缩进线之前（metafirst 风格）
tree -p -u -h --metafirst
# 元数据在行首，后跟树形缩进线和文件名

# 完整信息一行
tree -ahp --du --timefmt="%Y-%m-%d %H:%M"
```

**strftime 常用格式符**：
| 格式 | 含义 | 示例 |
|------|------|------|
| `%Y` | 四位年 | 2025 |
| `%y` | 两位年 | 25 |
| `%m` | 月（01-12） | 01 |
| `%b` | 月缩写 | Jan |
| `%B` | 月全名 | January |
| `%d` | 日（01-31） | 15 |
| `%H` | 时（00-23） | 14 |
| `%M` | 分（00-59） | 30 |
| `%S` | 秒（00-59） | 45 |
| `%a` | 星期缩写 | Mon |
| `%A` | 星期全名 | Monday |

---

## 6. 排序选项

```bash
# 按名称排序（默认）
tree

# 按版本号自然排序（file1 < file2 < file10）
tree -v

# 按修改时间排序（最新在前）
tree -t

# 按状态变更时间排序
tree -c

# 不排序（磁盘顺序）
tree -U

# 反向排序
tree -r
tree -t -r                      # 按时间倒序（最旧在前）

# 统一排序接口
tree --sort=name                # 按名称（默认）
tree --sort=version             # 按版本号
tree --sort=size                # 按大小
tree --sort=mtime               # 按修改时间
tree --sort=ctime               # 按状态变更时间
tree --sort=none                # 不排序

# 目录排在文件前（默认）
tree --dirsfirst

# 文件排在目录前
tree --filesfirst

# 注意：-U 会禁用 --dirsfirst / --filesfirst
```

---

## 7. 图形选项

控制树形线条的外观和颜色：

```bash
# 不显示缩进线（纯文本缩进）
tree -i

# ANSI 画线字符（现代终端推荐）
tree -A

# CP437（控制台）画线字符
tree -S

# 总是开启/关闭颜色
tree -C                        # 始终彩色
tree -n                        # 始终无色（-C 覆盖）

# 指定字符集
tree --charset=ASCII           # 用 ASCII 字符画线（+ - `）
tree --charset=UTF-8           # 用 Unicode 字符画线
tree --charset=IBM437          # IBM 437 风格
```

**`-A` vs `-S` 效果对比**：

| 选项 | 线条风格 | 适用场景 |
|------|----------|----------|
| `-A` | Unicode 平滑线（├ └ │） | 现代终端（iTerm2, Terminal.app） |
| `-S` | ASCII 粗线（CP437） | 传统控制台、无 Unicode 支持时 |

**颜色来源**：`tree` 兼容 `LS_COLORS` 环境变量（同 `dircolors`），通过颜色区分文件类型。

---

## 8. XML / HTML / JSON 格式导出

### 8.1 HTML 输出详解

```bash
# 基本 HTML 输出
tree -H . > tree.html
# 点 . 作为基准 URL 前缀（baseHREF）

# 指定基准 URL
tree -H "https://example.com/docs" > tree.html

# 自定义 HTML 标题
tree -H . -T "My Project Structure" > tree.html

# 不生成超链接
tree -H . --nolinks > tree.html

# HTML 添加自定义 intro/outro 内容
tree -H . --hintro=intro.html --houtro=outro.html > tree.html

# 配合递归 -R 逐级生成 HTML（每到一个新层级生成 00Tree.html）
tree -L 2 -R -H .
```

**HTML 输出特性**：
- 文件名自动生成超链接（基于 `baseHREF` 构造路径）
- 保留了颜色和图标
- 支持 CSS 样式控制

### 8.2 XML 输出

```bash
# XML 格式
tree -X
tree -X -L 2 > structure.xml

# XML 输出示例结构：
# <tree>
#   <directory name="src">
#     <file name="main.rs"></file>
#   </directory>
#   <report>
#     <directories>1</directories>
#     <files>1</files>
#   </report>
# </tree>
```

### 8.3 JSON 输出

```bash
# JSON 格式（v2.3.2 无需 jq 即可输出）
tree -J
tree -J -L 2 > structure.json

# 配合 jq 提取特定信息
tree -J -L 1 | jq '.[0].contents[].name'

# JSON 输出示例结构：
# [{ "type": "directory", "name": ".", "contents": [
#   { "type": "file", "name": "README.md" },
#   { "type": "directory", "name": "src", "contents": [
#     { "type": "file", "name": "main.rs" }
#   ]}
# ]},
# { "type": "report", "directories": 1, "files": 2 }]
```

### 8.4 超链接输出（Hyperlinks）

```bash
# OSC 8 终端超链接（支持点击跳转的现代终端）
tree --hyperlink
# 文件名变为可点击的超链接

# 指定 URL scheme 和 authority
tree --hyperlink --scheme=file --authority=localhost
```

---

## 9. 输入选项（--fromfile / --fromtabfile）

从外部文件读取路径列表，而非扫描磁盘：

```bash
# 从 stdin 读取路径列表
echo -e "/etc/hosts\n/etc/resolv.conf" | tree --fromfile .
# 等价于 tree --fromfile .

# 从文件读取（每行一个路径）
cat paths.txt
# /usr/local/bin/python3
# /usr/local/bin/node

tree --fromfile paths.txt

# 从 tab 缩进文本重建树结构
cat << 'EOF' | tree --fromtabfile .
src
  main.rs
  lib.rs
    utils.rs
tests
  test_main.rs
EOF

# 处理符号链接信息（配合 --fromfile）
tree --fromfile paths.txt --fflinks
```

---

## 10. 综合实战场景

### 10.1 代码审查 / PR 描述

```bash
# 只显示目录结构（最深 3 层），排除噪声
tree -d -L 3 -I "node_modules|.git|dist|__pycache__"

# 显示最近修改过的文件（按时间排序）
tree -t -L 2 -I ".git"

# 查看某种语言文件的全貌
tree -P "*.rs" -L 3
```

### 10.2 README 中的项目结构图

```bash
# 生成 Markdown 代码块可直接粘贴的结构
tree -L 2 -I "node_modules|.git|target" > Structure.md

# 带文件大小（人类可读）
tree -L 2 -I "node_modules|.git" -h --du > Structure.md

# 导出为 HTML 嵌入文档
tree -H "." -T "Project Structure" -I "node_modules|.git" > docs/structure.html
```

### 10.3 日志审计 / 安全扫描

```bash
# 列出所有以 .env 或包含 key/secret 命名的文件
tree -a -P "*.env|*key*|*secret*|*token*"

# 查找大文件（> 一定大小的）
tree -h -s -L 3 --sort=size
# 配合 --filelimit 跳过小型目录

# 列出所有可执行文件
tree -F | grep '\*$'
```

### 10.4 只关心目录结构

```bash
# 只看目录，不显示文件
tree -d

# 只看目录的前 2 层
tree -d -L 2

# 只看匹配名称的目录
tree -d -P "src|test|doc" --matchdirs
```

### 10.5 统计文件数量

```bash
# 只显示统计结果（用 tail 提取最后一行）
tree -a | tail -1
# 输出：459 directories, 3107 files

# 排除无关目录后的统计
tree -I "node_modules|.git" | tail -1

# 不显示完整清单，只统计（--noreport 关闭统计行）
# 反过来：没有直接显示统计行的 flag，用 grep 过滤即可
```

### 10.6 磁盘空间分析

```bash
# 显示每个目录的累计大小 + 人类可读
tree -h --du -L 2

# 按大小排序查看
tree -h --du -L 2 --sort=size

# 用 SI 单位 + 完整信息
tree -h --si --du -L 3 --dirsfirst
```

---

## 11. 环境变量

| 变量 | 含义 |
|------|------|
| `LS_COLORS` | 文件名颜色（`dircolors` 格式，tree 复用） |
| `LANG` / `LC_ALL` | 语言环境，影响字符编码 |
| `TREE_COLORS` | tree 专用颜色覆盖（部分版本支持） |

**LS_COLORS 示例**：
```bash
export LS_COLORS="di=34:ex=32:ln=36:*.md=33:*.rs=31"
# di=目录 ex=可执行 ln=符号链接 *.ext=特定扩展名
```

---

## 12. 完整选项速查表

### 列出选项（Listing Options）

| 选项 | 含义 |
|------|------|
| `-a` | 显示所有文件（包括隐藏文件） |
| `-d` | 只列出目录 |
| `-l` | 跟踪符号链接（指向目录时进入） |
| `-f` | 每项显示完整路径 |
| `-x` | 只留在当前文件系统 |
| `-L N` | 最大递归深度 N |
| `-R` | 到达最大层级后重新递归（生成 00Tree.html） |
| `-P pattern` | 只列出匹配 pattern 的文件（`\|` 分隔多模式） |
| `-I pattern` | 排除匹配 pattern 的文件（`\|` 分隔多模式） |
| `--gitignore` | 使用 .gitignore 过滤 |
| `--gitfile X` | 显式指定 gitignore 文件 |
| `--ignore-case` | pattern 匹配忽略大小写 |
| `--matchdirs` | -P 时目录名也参与匹配 |
| `--prune` | 删除输出中的空目录 |
| `--noreport` | 不显示末尾的文件/目录统计 |
| `--charset X` | 指定字符集 |
| `--filelimit #` | 文件数超过 # 的目录不展开 |
| `--condense` | 压缩多级单子目录为一行 |
| `-o filename` | 输出到文件 |

### 文件信息选项（File Options）

| 选项 | 含义 |
|------|------|
| `-p` | 显示文件权限 |
| `-u` | 显示文件所有者 |
| `-g` | 显示文件所属组 |
| `-s` | 显示文件大小（字节） |
| `-h` | 人类可读大小 |
| `--si` | SI 单位（1000 进制） |
| `--du` | 计算目录累计大小 |
| `-D` | 显示最后修改日期 |
| `-c` | 按状态变更时间排序 |
| `--timefmt fmt` | 自定义 strftime 日期格式 |
| `-F` | 文件类型标记（/ * = @ \|） |
| `--inodes` | 显示 inode 号 |
| `--device` | 显示设备号 |
| `-q` | 不可打印字符显示为 `?` |
| `-N` | 不可打印字符原样输出 |
| `-Q` | 文件名用双引号包围 |
| `--metafirst` | 元数据放在行首（缩进线之前） |

### 排序选项（Sorting Options）

| 选项 | 含义 |
|------|------|
| `-v` | 按版本号排序 |
| `-t` | 按修改时间排序 |
| `-c` | 按状态变更时间排序 |
| `-U` | 不排序 |
| `-r` | 反向排序 |
| `--dirsfirst` | 目录排在文件前 |
| `--filesfirst` | 文件排在目录前 |
| `--sort X` | name / version / size / mtime / ctime / none |

### 图形选项（Graphics Options）

| 选项 | 含义 |
|------|------|
| `-i` | 不显示缩进线 |
| `-A` | ANSI 画线字符（Unicode 风格） |
| `-S` | CP437 画线字符（控制台风格） |
| `-n` | 关闭颜色 |
| `-C` | 始终开启颜色 |
| `--compress #` | 压缩缩进空格数（# 个空格/层） |
| `--hyperlink` | OSC 8 终端超链接 |
| `--scheme X` | 超链接 URL scheme |
| `--authority X` | 超链接 authority/hostname |

### 输出格式选项

| 选项 | 含义 |
|------|------|
| `-X` | XML 格式输出 |
| `-J` | JSON 格式输出 |
| `-H baseHREF` | HTML 格式输出 |
| `-T string` | HTML 标题 |
| `--nolinks` | HTML 中不生成超链接 |
| `--hintro X` | HTML intro 文件 |
| `--houtro X` | HTML outro 文件 |

### 输入选项

| 选项 | 含义 |
|------|------|
| `--fromfile` | 从文件/stdin 读取路径列表 |
| `--fromtabfile` | 从 tab 缩进文本重建树 |
| `--fflinks` | 配合 --fromfile 处理符号链接 |

### 杂项

| 选项 | 含义 |
|------|------|
| `--opt-toggle` | 启用选项切换 |
| `--version` | 版本信息 |
| `--help` | 帮助信息 |
| `--` | 参数结束标志 |

---

## 13. 注意事项与陷阱

1. **macOS 默认没有 tree**：必须通过 `brew install tree` 安装。未安装时 `tree` 会报 `command not found`。

2. **大目录性能**：在大量文件的目录（如 `node_modules`）中裸跑 `tree` 可能极慢。务必使用 `-I` 排除，或使用 `--filelimit` 限制展开。

3. **`-L` 层级从 0 开始**：`-L 0` 只显示当前目录自身，`-L 1` 显示第一层子项。

4. **`-I` 和 `-P` 的交互**：
   - `-I` 和 `-P` 同时使用时，先匹配 `-P` 再过滤 `-I`
   - `-P` 不匹配隐藏文件（需同时 `-a`）

5. **`--prune` 只对空目录有效**：目录中若有文件就不会被移除。需在 `-P`/`-I` 过滤后使用才能看到效果。

6. **`--gitignore` 的性能**：在大仓库中使用时会读取多个 `.gitignore` 文件，有一定开销。

7. **符号链接递归**：`-l` 会跟随指向目录的符号链接，但 tree 会检测循环链接并避免无限递归。

8. **颜色输出到文件**：`-C` 输出到文件时会包含 ANSI 转义码，在普通文本编辑器中会显示乱码。若不想要颜色，用 `-n` 或重定向时 tree 会自动关闭颜色（除非用 `-C` 强制）。

9. **HTML 输出中的相对路径**：`-H .` 使用相对路径，当 HTML 文件移动到其他位置时链接可能失效。

10. **`-R` 的特殊行为**：`-R` 配合 `-L` 时，到达最大层级后会重新运行 tree 在下一级生成 `00Tree.html`，适用于分页生成大型文档。

11. **与 `lsd --tree` 的区别**：
    - `tree` 是专门的树形列出工具，功能更全面（文件元数据、多格式导出、--gitignore、--fromfile 等）
    - `lsd --tree` 是 `ls` 的树形变体，提供图标和美观色彩，更侧重视觉效果
    - 需要纯文本反馈、文档导出时用 `tree`；需要可视化浏览时用 `lsd --tree`

12. **Windows 兼容性**：tree 在 Windows 上也有原生命令行版本（`tree` 命令由 CMD 提供），但选项差异较大，本指南选项适用于 Unix/macOS 版。
