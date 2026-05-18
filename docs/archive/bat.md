# bat —— cat 超级增强版

> 用 Rust 编写的现代化 `cat` 替代品，带语法高亮、行号、Git 集成、自动分页等功能。
> 版本：0.26.1（本机实测）
> 仓库：[github.com/sharkdp/bat](https://github.com/sharkdp/bat)

---

## 目录

- [bat —— cat 超级增强版](#bat--cat-超级增强版)
  - [目录](#目录)
  - [1. 安装](#1-安装)
  - [2. 基本用法](#2-基本用法)
  - [3. 核心功能详解](#3-核心功能详解)
    - [3.1 语法高亮](#31-语法高亮)
    - [3.2 Git 集成](#32-git-集成)
    - [3.3 显示不可打印字符](#33-显示不可打印字符)
    - [3.4 自动分页](#34-自动分页)
  - [4. 风格与外观定制](#4-风格与外观定制)
    - [4.1 --style 组件详解](#41---style-组件详解)
    - [4.2 主题切换](#42-主题切换)
  - [5. 行范围与行高亮](#5-行范围与行高亮)
    - [--line-range（显示指定行范围）](#--line-range显示指定行范围)
    - [--highlight-line（高亮指定行）](#--highlight-line高亮指定行)
  - [6. 高级选项](#6-高级选项)
    - [换行控制](#换行控制)
    - [Tab 宽度](#tab-宽度)
    - [空行压缩](#空行压缩)
    - [二进制文件处理](#二进制文件处理)
    - [ANSI 转义序列处理](#ansi-转义序列处理)
    - [--file-name（指定显示文件名）](#--file-name指定显示文件名)
  - [7. 环境变量与配置文件](#7-环境变量与配置文件)
    - [环境变量](#环境变量)
    - [配置文件](#配置文件)
    - [优先级](#优先级)
  - [8. 工具集成实战](#8-工具集成实战)
    - [8.1 fzf 预览器](#81-fzf-预览器)
    - [8.2 find / fd](#82-find--fd)
    - [8.3 ripgrep + batgrep](#83-ripgrep--batgrep)
    - [8.4 tail -f 日志监控](#84-tail--f-日志监控)
    - [8.5 git show / git diff](#85-git-show--git-diff)
    - [8.6 man 手册着色](#86-man-手册着色)
    - [8.7 --help 命令帮助着色](#87---help-命令帮助着色)
    - [8.8 prettybat 格式化预览](#88-prettybat-格式化预览)
    - [8.9 xclip 复制时去除装饰](#89-xclip-复制时去除装饰)
  - [9. cat 替代方案与 alias 设置](#9-cat-替代方案与-alias-设置)
    - [作为 cat 的 alias](#作为-cat-的-alias)
    - [bat \> 写入文件的行为](#bat--写入文件的行为)
    - [注意事项](#注意事项)
  - [10. 自定义语法与主题](#10-自定义语法与主题)
    - [缓存目录](#缓存目录)
    - [添加 Sublime Text 语法](#添加-sublime-text-语法)
    - [添加 tmTheme 主题](#添加-tmtheme-主题)
  - [11. 常用快捷操作总结（less 内）](#11-常用快捷操作总结less-内)
  - [12. 本机完整选项速查](#12-本机完整选项速查)
  - [13. 注意事项与陷阱](#13-注意事项与陷阱)

---

## 1. 安装

```bash
# macOS Homebrew（本机安装方式）
brew install bat

# MacPorts
port install bat

# Debian/Ubuntu
sudo apt install bat
# 旧版系统可执行文件名为 batcat

# Fedora
sudo dnf install bat

# Arch Linux
sudo pacman -S bat

# Windows (winget)
winget install sharkdp.bat

# 从源码编译（需要 Rust 1.79+）
cargo install --locked bat
```

验证安装：
```bash
bat --version
# 输出：bat 0.26.1
```

---

## 2. 基本用法

```bash
# 查看单个文件
bat file.txt

# 查看多个文件（依次显示，有分隔）
bat src/main.rs src/lib.rs

# 从标准输入读取
curl -s https://example.com/data.json | bat
echo "hello world" | bat

# 从标准输入读取并指定语言
echo '{"key": "value"}' | bat -l json

# 创建新文件（输入后 Ctrl+D 结束）
bat > note.md

# 拼接文件并输出（重定向到非 TTY 时自动去掉装饰）
bat header.md content.md footer.md > document.md

# 混合文件和 stdin（f 文件 → stdin → g 文件）
bat f - g
```

---

## 3. 核心功能详解

### 3.1 语法高亮

`bat` 内置了 **170+** 种语言和标记格式的语法高亮支持。

```bash
# 列出所有支持的语言和对应的文件扩展名
bat --list-languages
```

常用语言速查：
| 语言 | 扩展名 | -l 参数 |
|------|--------|---------|
| Python | .py | `-l python` |
| Go | .go | `-l go` |
| Rust | .rs | `-l rs` |
| JavaScript | .js | `-l js` |
| TypeScript | .ts | `-l ts` |
| JSON | .json | `-l json` |
| YAML | .yaml, .yml | `-l yaml` |
| Markdown | .md | `-l markdown` |
| Shell | .sh | `-l bash` |
| Dockerfile | Dockerfile | `-l Dockerfile` |
| TOML | .toml | `-l toml` |
| SQL | .sql | `-l sql` |
| nginx | nginx.conf | `-l nginx` |
| log | .log | `-l log` |
| help | - | `-l help` |

**手动指定语言**（当自动检测失败时）：
```bash
bat -l python script_no_ext      # 按名称
bat -l py script_no_ext          # 按扩展名
bat -l 'C++' main.cpp            # 含空格的语言名需加引号
```

**从 shebang 自动检测**（stdin 场景）：
```bash
curl -s https://sh.rustup.rs | bat   # #!/bin/sh → 自动识别为 shell
```

### 3.2 Git 集成

`bat` 自动与 `git` 通信，在左侧边栏显示文件的修改状态：

```bash
bat src/main.rs
# 输出左侧会显示：
#   ~ 表示已修改的行
#   + 表示新增的行
#   - 表示已删除的行
#   空格表示未改动的行
```

**只显示 Git 差异行**：
```bash
bat --diff src/main.rs
# 只显示相对 git index 有变化的行

bat --diff --diff-context=5 src/main.rs
# 在差异行前后各显示 5 行上下文
```

### 3.3 显示不可打印字符

```bash
# 显示所有不可打印字符（空格、制表符、换行符等）
bat -A /etc/hosts
bat --show-all /etc/hosts

# 只显示特定不可打印字符（通过 --style 配合）
# 设置表示法风格
bat -A --nonprintable-notation=caret file.txt    # 用 ^ 表示法 (^G, ^J, ^@)
bat -A --nonprintable-notation=unicode file.txt  # 用 Unicode 表示法 (␇, ␊, ␀)
```

- `caret`：传统 `cat -v` 风格，如 `^I` 表示 Tab，`^J` 表示换行
- `unicode`：用特殊 Unicode 符号表示，更直观

### 3.4 自动分页

```bash
# 默认行为：输出超过一屏时自动调用 less 分页
bat long_file.txt

# 强制分页（即使只有几行）
bat --paging=always long_file.txt

# 禁用分页（像 cat 一样直接输出）
bat --paging=never long_file.txt

# 自动分页：输出到终端时启用分页，管道/重定向时禁用（默认）
bat --paging=auto long_file.txt
```

**分页时的内置 pager（less）快捷键**：

| 键 | 功能 |
|----|------|
| `Space` / `f` | 下一页 |
| `b` | 上一页 |
| `j` / `↓` | 下一行 |
| `k` / `↑` | 上一行 |
| `/pattern` | 向下搜索 |
| `?pattern` | 向上搜索 |
| `n` | 下一个匹配 |
| `N` | 上一个匹配 |
| `g` | 跳到文件开头 |
| `G` | 跳到文件末尾 |
| `q` | 退出分页 |

---

## 4. 风格与外观定制

### 4.1 --style 组件详解

`--style` 控制显示哪些装饰元素，用逗号分隔多个组件：

```bash
# 完整装饰（默认）
bat --style=full file.txt

# 纯文本模式（无任何装饰）
bat --style=plain file.txt
# 等价于 bat -p file.txt

# 两步法 -pp：纯文本 + 禁用分页
bat -pp file.txt
# 等价于 bat --style=plain --paging=never

# 自动模式：终端显示装饰，管道输出不显示
bat --style=auto file.txt

# 自定义组件组合
bat --style=numbers,changes,grid file.txt
```

**可用组件：**

| 组件 | 含义 |
|------|------|
| `changes` | Git 修改标记（默认启用） |
| `grid` | 竖线/横线分隔（默认启用） |
| `header-filename` | 文件名头部（默认启用） |
| `header-filesize` | 文件大小头部 |
| `header` | 等同于 `header-filename` |
| `numbers` | 行号（默认启用） |
| `rule` | 多文件之间的水平分隔线 |
| `snip` | 不同行范围之间的分隔线（默认启用） |
| `full` | 全部启用 |
| `plain` | 全部禁用 |
| `default` | 默认推荐组合 |
| `auto` | 终端=default，管道=plain |

**使用 `+`/`-` 前缀叠加修改**：
```bash
# 假设默认是 changes,grid,header-filename,numbers,snip
bat --style=-numbers,-changes file.txt
# 去掉行号和 Git 标记，保留 grid, header, snip

bat --style=+rule file.txt
# 在默认基础上加上多文件分隔线
```

### 4.2 主题切换

`bat` 内置 28 个主题（本机 v0.26.1）：

```bash
# 列出所有主题
bat --list-themes
```

完整主题列表：
```
1337                  Catppuccin Frappe      Catppuccin Latte
Catppuccin Macchiato  Catppuccin Mocha       Coldark-Cold
Coldark-Dark          DarkNeon               Dracula
GitHub                Monokai Extended       Monokai Extended Bright
Monokai Extended Light  Monokai Extended Origin  Nord
OneHalfDark           OneHalfLight            Solarized (dark)
Solarized (light)     Sublime Snazzy          TwoDark
Visual Studio Dark+   ansi                    base16
base16-256            gruvbox-dark            gruvbox-light
zenburn
```

**使用方法**：
```bash
# 指定临时主题
bat --theme=Dracula file.txt
bat --theme="Solarized (dark)" file.txt     # 含空格的主题加引号

# 区分亮/暗终端
bat --theme-dark=Dracula --theme-light=GitHub file.txt

# 自动检测（macOS 可根据系统外观自动切换）
bat --theme=auto file.txt
```

**永久设置**（推荐）：

环境变量方式：
```bash
# 添加到 ~/.zshrc 或 ~/.bashrc
export BAT_THEME="Dracula"
export BAT_THEME_DARK="Dracula"
export BAT_THEME_LIGHT="GitHub"
```

配置文件方式：
```bash
# 创建 ~/.config/bat/config
mkdir -p ~/.config/bat
echo '--theme="Dracula"' >> ~/.config/bat/config
```

> **本机已设 `BAT_THEME=Dracula`**

---

## 5. 行范围与行高亮

### --line-range（显示指定行范围）

```bash
# 显示第 30 到 40 行
bat --line-range 30:40 file.txt

# 显示开头到第 40 行
bat --line-range :40 file.txt

# 显示第 40 行到末尾
bat --line-range 40: file.txt

# 只显示第 40 行
bat --line-range 40 file.txt

# 显示倒数 10 行
bat --line-range -10: file.txt

# 从第 30 行开始显示 10 行
bat --line-range 30:+10 file.txt

# 以第 35 行为中心，前后各 5 行（上下文模式）
bat --line-range 35::5 file.txt

# 第 30-40 行，并带前后各 2 行上下文
bat --line-range 30:40:2 file.txt
```

### --highlight-line（高亮指定行）

用不同背景色高亮指定行：

```bash
# 高亮第 40 行
bat --highlight-line 40 file.txt

# 高亮第 30 到 40 行
bat --highlight-line 30:40 file.txt

# 高亮开头到第 40 行
bat --highlight-line :40 file.txt

# 高亮第 40 行到末尾
bat --highlight-line 40: file.txt

# 从第 30 行开始高亮 10 行
bat --highlight-line 30:+10 file.txt
```

---

## 6. 高级选项

### 换行控制

```bash
# 自动换行（默认）
bat --wrap=auto file.txt

# 从不换行（超长行截断）
bat --wrap=never file.txt
# 等价于 bat -S
# 等价于 bat --chop-long-lines

# 按字符换行（可能在单词中间断行）
bat --wrap=character file.txt

# 手动指定终端宽度
bat --terminal-width 80 file.txt

# 相对终端宽度（当前宽度 +20 列）
bat --terminal-width +20 file.txt

# 当前宽度 -10 列
bat --terminal-width -10 file.txt
```

### Tab 宽度

```bash
# 设置 Tab = 4 个空格
bat --tabs 4 file.txt

# Tab = 2 个空格
bat --tabs 2 file.txt

# Tab = 0（原样输出 Tab 字符，不渲染为空格）
bat --tabs 0 file.txt
```

### 空行压缩

```bash
# 压缩连续空行为一行
bat --squeeze-blank file.txt
# 等价于 bat -s

# 限制最多连续显示 N 行空行
bat --squeeze-limit 3 file.txt
# 连续超过 3 行空行时只显示 3 行
```

### 二进制文件处理

```bash
# 默认：不打印二进制内容
bat binary_file.bin

# 把二进制当文本强制显示
bat --binary as-text binary_file.bin
```

### ANSI 转义序列处理

```bash
# 自动模式：非纯文本语言时去掉 ANSI 序列（默认）
bat --strip-ansi auto file.txt

# 永远不剥离 ANSI 序列
bat --strip-ansi never file.txt

# 始终剥离 ANSI 序列
bat --strip-ansi always file.txt
```

### --file-name（指定显示文件名）

当管道输入时，手动指定文件名用于语法检测和头部显示：

```bash
# stdin 输入，但告诉 bat 按 foo.py 的语法高亮
cat data.txt | bat --file-name foo.py

# 同时影响头部显示的文件名
echo "print('hello')" | bat --file-name hello.py
```

---

## 7. 环境变量与配置文件

### 环境变量

| 变量 | 含义 |
|------|------|
| `BAT_THEME` | 默认主题 |
| `BAT_THEME_DARK` | 暗色终端主题 |
| `BAT_THEME_LIGHT` | 亮色终端主题 |
| `BAT_STYLE` | 默认 style 组件 |
| `BAT_PAGER` | 自定义 pager 程序（默认 `less`） |
| `BAT_PAGING` | 分页行为：`always` / `never` / `auto` |
| `BAT_TABS` | 默认 Tab 宽度 |
| `BAT_OPTS` | 全局附加选项 |
| `BAT_CACHE_PATH` | 缓存目录路径 |
| `BAT_CONFIG_PATH` | 配置文件路径 |

**本机当前环境变量状态**（`bat --diagnostic` 输出）：

| 变量 | 值 |
|------|-----|
| `BAT_THEME` | Dracula |
| `COLORTERM` | truecolor |
| `LESS` | -R |
| `PAGER` | （空字符串） |
| `SHELL` | /bin/zsh |
| `TERM` | xterm-256color |

### 配置文件

配置文件位置：`~/.config/bat/config`

```bash
# 创建/编辑配置文件
mkdir -p ~/.config/bat
vim ~/.config/bat/config
```

示例配置：
```conf
# 主题
--theme="Dracula"

# 风格：显示行号、Git 标记、网格
--style="numbers,changes,grid"

# Tab 宽度
--tabs=2

# 分页行为
--paging=auto

# 自动压缩空行
--squeeze-blank

# 截断超长行
--chop-long-lines

# 高亮整行背景色
--highlight-line=:
```

> 本机目前未创建配置文件（`~/.config/bat/config` 不存在），仅通过 `BAT_THEME` 环境变量设置主题。

### 优先级

命令行参数 > `BAT_*` 环境变量 > 配置文件

---

## 8. 工具集成实战

### 8.1 fzf 预览器

```bash
# fzf 文件模糊搜索 + bat 预览
fzf --preview "bat --color=always --style=numbers --line-range=:500 {}"

# --color=always 强制输出颜色（管道场景下默认会去掉颜色）
# --line-range=:500 只加载前 500 行（提升大文件预览性能）
```

### 8.2 find / fd

```bash
# 用 bat 预览 find 搜索结果
find . -name "*.rs" -exec bat {} +

# 用 fd 批量预览
fd '\.rs$' -X bat

# 更精细：find + bat 预览所有 .py 文件
find . -type f -name "*.py" -exec bat --style=header-filename,numbers {} +
```

### 8.3 ripgrep + batgrep

```bash
# batgrep 是 bat-extras 套件之一
# 安装：brew install bat-extras 或 cargo install bat-extras

# ripgrep 搜索 + bat 语法高亮展示结果
batgrep "TODO" src/

# 等价于
rg --no-heading -n "TODO" src/ | bat -l rg
```

### 8.4 tail -f 日志监控

```bash
# 实时监控日志文件 + 语法高亮
tail -f /var/log/system.log | bat --paging=never -l log

# macOS 系统日志文件
tail -f /var/log/system.log | bat --paging=never --style=plain -l log

# 注意必须加 --paging=never，否则 tail -f 无法正常工作
# -l log 显式指定 log 语言的语法高亮
```

### 8.5 git show / git diff

```bash
# 查看旧版本的某个文件（带语法高亮）
git show v0.6.0:src/main.rs | bat -l rs

# 查看某个 commit 的文件
git show abc123:path/to/file.go | bat -l go

# batdiff：查看 git diff 的语法高亮版
batdiff() {
  git diff --name-only --relative --diff-filter=d -z | xargs -0 bat --diff
}
```

> 更高级的 diff 查看推荐用 `delta`：`brew install git-delta`

### 8.6 man 手册着色

```bash
# 设置 MANPAGER 环境变量
export MANPAGER="bat -plman"

# 现在 man 输出也会有语法高亮
man 2 select
man rsync

# 写入 shell 配置文件永久生效
echo 'export MANPAGER="bat -plman"' >> ~/.zshrc
```

> 也可以使用 `bat-extras` 套件中的 `batman` 命令。

### 8.7 --help 命令帮助着色

```bash
# 最简单的用法
rsync --help 2>&1 | bat -plhelp

# 封装为 shell 函数
bathelp() {
  bat --plain --language=help
}
help() {
  "$@" --help 2>&1 | bathelp
}

# 使用
help git commit
help rsync
help cp

# zsh 全局别名（仅 zsh 支持，-h 和 --help 自动着色）
alias -g -- -h='-h 2>&1 | bat --language=help --style=plain'
alias -g -- --help='--help 2>&1 | bat --language=help --style=plain'

# 注意：某些命令的 -h 不是 help（如 ls -h），需要时用 ls \-h 转义
```

### 8.8 prettybat 格式化预览

```bash
# prettybat 是 bat-extras 套件之一
# 自动格式化代码后展示

# 对 Python 文件自动执行 black/isort 后再用 bat 展示
prettybat script.py

# 对 Rust 文件自动执行 rustfmt 后再展示
prettybat main.rs
```

### 8.9 xclip 复制时去除装饰

```bash
# macOS 用 pbcopy 代替 xclip
bat main.cpp | pbcopy
# bat 检测到输出是管道时自动以 plain 模式输出

# 显式 plain 模式
bat -p main.cpp | pbcopy
```

---

## 9. cat 替代方案与 alias 设置

### 作为 cat 的 alias

```bash
# 完全替代 cat（保留无分页行为）
alias cat='bat --paging=never'

# 加行号但不分页
alias cat='bat --paging=never --style=numbers'

# 纯文本模式（无装饰）
alias cat='bat -pp'

# 写入 ~/.zshrc 永久生效
echo "alias cat='bat --paging=never'" >> ~/.zshrc
source ~/.zshrc
```

### bat > 写入文件的行为

```bash
# 当输出重定向到文件时，bat 自动去掉所有装饰（plain 模式）
bat file1.txt file2.txt > merged.txt
# 等价于 cat file1.txt file2.txt > merged.txt
```

### 注意事项

- `bat` 重定向到非 TTY 时自动切换到纯文本模式——无需担心往文件里写行号和装饰
- 管道中也会自动切换（`bat file.txt | grep foo` 不会输出装饰）

---

## 10. 自定义语法与主题

### 缓存目录

```bash
# 自定义语法和主题保存在
~/.config/bat/syntaxes/    # 自定义语法文件 (.sublime-syntax)
~/.config/bat/themes/      # 自定义主题文件 (.tmTheme)

# 重建缓存（添加/修改语法和主题后必须执行）
bat cache --build

# 清除缓存
bat cache --clear
```

### 添加 Sublime Text 语法

```bash
# 1. 下载 .sublime-syntax 文件
mkdir -p ~/.config/bat/syntaxes
cp mylang.sublime-syntax ~/.config/bat/syntaxes/

# 2. 重建缓存
bat cache --build

# 3. 验证
bat --list-languages | grep mylang
bat -l mylang test.mylang
```

### 添加 tmTheme 主题

```bash
# 1. 下载 .tmTheme 文件
mkdir -p ~/.config/bat/themes
cp MyTheme.tmTheme ~/.config/bat/themes/

# 2. 重建缓存
bat cache --build

# 3. 使用
bat --theme=MyTheme file.txt
```

---

## 11. 常用快捷操作总结（less 内）

| 操作 | 快捷键 |
|------|--------|
| 下一页 | `Space` 或 `f` |
| 上一页 | `b` |
| 下一行 | `j` 或 `↓` |
| 上一行 | `k` 或 `↑` |
| 半页下 | `d` |
| 半页上 | `u` |
| 跳到开头 | `g` |
| 跳到末尾 | `G` |
| 跳到第 N 行 | `Ng`（如 `50g`） |
| 向下搜索 | `/pattern` |
| 向上搜索 | `?pattern` |
| 下一个匹配 | `n` |
| 上一个匹配 | `N` |
| 实时跟踪 | `F`（类似 tail -f），`Ctrl+C` 退出跟踪 |
| 退出 | `q` |

---

## 12. 本机完整选项速查

```
bat [OPTIONS] [FILE]...
bat <COMMAND>

文件参数：
  [FILE]...              要输出的文件，用 - 表示 stdin

选项：
  -A, --show-all                 显示所有不可打印字符
      --nonprintable-notation    unicode 或 caret
      --binary                   二进制处理：no-printing（默认）或 as-text
  -p, --plain                    纯文本（无装饰），-pp 同时禁用分页
  -l, --language <lang>          指定语言用于语法高亮
  -H, --highlight-line <N:M>     高亮指定行范围
      --file-name <name>         为 stdin 输入指定显示文件名
  -d, --diff                     只显示 Git 差异行
      --diff-context <N>         差异行周围显示 N 行上下文
      --tabs <T>                 Tab 宽度（0=原样输出）
      --wrap <mode>              换行模式：auto / never / character
  -S, --chop-long-lines          截断超长行（= --wrap=never）
      --terminal-width <width>   手动指定终端宽度
      --paging <mode>            分页：auto / always / never
      --pager <command>          自定义 pager
  -m, --map-syntax <glob:lang>   按文件名模式映射语法
      --theme <theme>            指定主题名
      --theme-light <theme>      亮色终端主题
      --theme-dark <theme>       暗色终端主题
      --list-themes              列出所有主题
  -s, --squeeze-blank            压缩连续空行为一行
      --squeeze-limit <N>        最多保留 N 行连续空行
      --strip-ansi <when>        剥离 ANSI 序列：auto / always / never
      --style <components>       显示组件：numbers, changes, grid, ...
  -r, --line-range <N:M>         只显示指定行范围
  -L, --list-languages           列出所有支持的语言
  -u, --unbuffered               POSIX 兼容选项（实际总是 unbuffered）
      --completion <SHELL>       生成 shell 补全脚本
      --diagnostic               显示诊断信息
      --acknowledgements         显示鸣谢
      --set-terminal-title       在 pager 中设置终端标题为文件名
  -h, --help                     帮助
  -V, --version                  版本号

子命令：
  bat cache --build              重建语法/主题缓存
  bat cache --clear              清除缓存
```

---

## 13. 注意事项与陷阱

1. **管道场景自动降级**：`bat file.txt | grep foo` 会自动切换到 plain 模式（无颜色、无装饰），如需强制颜色用 `bat --color=always`。

2. **Debian/Ubuntu 旧版可执行文件名**：部分旧版系统安装后命令为 `batcat` 而非 `bat`，可创建 alias `alias bat='batcat'`。

3. **主题含空格需引号**：`bat --theme="Solarized (dark)"`。

4. **`bat cache --build`**：添加自定义语法/主题后必须执行，否则不生效。

5. **`--terminal-width` 偏移**：加 `+` 或 `-` 前缀时为相对值，不加时为绝对值。

6. **大文件预览性能**：配合 fzf 等工具时，建议用 `--line-range=:500` 限制只预览前 N 行，避免加载超大文件。

7. **与 `delta` 的区别**：`bat` 侧重文件内容查看，`delta` 侧重 diff 输出的美化。两者互补而非替代。

8. **Windows 系统**：需要安装 Visual C++ Redistributable。
