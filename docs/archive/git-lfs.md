# git-lfs —— Git Large File Storage

> Git 大文件版本控制扩展。用指针文件替代仓库中的大文件本体，本体存储于远程 LFS 服务器。
> 由 GitHub / Atlassian 联合开发。Go 语言编写。
> 版本：3.7.0（本机 Homebrew 安装）
> 仓库：[github.com/git-lfs/git-lfs](https://github.com/git-lfs/git-lfs)

---

## 目录

1. [安装](#1-安装)
2. [工作原理](#2-工作原理)
3. [初始化与基本流程](#3-初始化与基本流程)
4. [跟踪文件（track / untrack）](#4-跟踪文件track--untrack)
5. [列出 LFS 文件（ls-files）](#5-列出-lfs-文件ls-files)
6. [获取 LFS 对象（fetch / pull / checkout）](#6-获取-lfs-对象fetch--pull--checkout)
7. [推送 LFS 对象（push）](#7-推送-lfs-对象push)
8. [文件状态（status）](#8-文件状态status)
9. [文件锁定（lock / unlock / locks）](#9-文件锁定lock--unlock--locks)
10. [迁移历史（migrate）](#10-迁移历史migrate)
11. [清理缓存（prune）](#11-清理缓存prune)
12. [配置与环境](#12-配置与环境)
13. [调试与诊断](#13-调试与诊断)
14. [实战脚本示例](#14-实战脚本示例)
15. [完整命令速查表](#15-完整命令速查表)
16. [注意事项与陷阱](#16-注意事项与陷阱)

---

## 1. 安装

```bash
# macOS Homebrew（本机安装方式）
brew install git-lfs

# Debian/Ubuntu
sudo apt install git-lfs

# Fedora
sudo dnf install git-lfs

# Arch Linux
sudo pacman -S git-lfs

# 直接下载（跨平台二进制）
# https://github.com/git-lfs/git-lfs/releases

# 首次系统级安装（每台机器只需一次）
git lfs install
# 输出：Git LFS initialized.
```

---

## 2. 工作原理

```
┌──────────┐     git add     ┌────────────┐     git push    ┌──────────────┐
│ 大文件   │ ───────────────→ │ 指针文件   │ ──────────────→ │ Git 远程仓库  │
│ (100MB)  │ ←────────────── │ (≈130B)   │ ←────────────── │ (只存指针)    │
└────┬─────┘   git checkout  └─────┬──────┘                └──────────────┘
     │                             │
     │ git-lfs clean               │ git-lfs smudge
     │ (生成指针)                   │ (还原真实文件)
     │                             │
     ▼                             ▼
┌──────────┐                ┌─────────────────┐
│ 本地缓存 │ ←────────────── │ LFS 远程存储     │
│ .git/lfs │   上传/下载     │ (真正的大文件)    │
└──────────┘                └─────────────────┘
```

**核心概念**：
- **指针文件**（Pointer File）：约 130 字节的文本文件，包含 OID（SHA-256）和原始文件大小
- **Clean Filter**：`git add` 时将大文件替换为指针文件
- **Smudge Filter**：`git checkout` 时将指针文件还原为大文件
- **Pre-push Hook**：`git push` 前自动上传 LFS 对象到远程
- **LFS Cache**：本地 `.git/lfs/objects` 目录，缓存已下载的 LFS 对象

**指针文件示例**：
```
version https://git-lfs.github.com/spec/v1
oid sha256:4e9a8c2e5f2c7c...（64 位 SHA-256）
size 12345678
```

**核心优势**：`git clone` 只下载当前 checkout 版本的大文件，而非全部历史版本，大幅加速克隆速度。

---

## 3. 初始化与基本流程

```bash
# 1. 系统级安装（每台机器只需一次）
git lfs install

# 2. 指定要跟踪的文件类型
git lfs track "*.psd"
git lfs track "*.zip"
git lfs track "*.mp4"
git lfs track "data/*.bin"

# 3. 提交 .gitattributes（track 命令会自动修改它）
git add .gitattributes
git commit -m "Setup Git LFS tracking"

# 4. 像平常一样使用 Git
git add bigfile.psd
git commit -m "Add design file"
git push origin main
# push 时自动上传 LFS 对象
```

**新仓库完整示例**：
```bash
git init my-project
cd my-project
git lfs install
git lfs track "*.psd" "*.mp4" "*.zip"
echo "# My Project" > README.md
git add .gitattributes README.md
git commit -m "Initial commit with LFS"
# 添加大文件
cp ~/big-file.mp4 .
git add big-file.mp4
git commit -m "Add video"
git remote add origin <url>
git push -u origin main
```

---

## 4. 跟踪文件（track / untrack）

```bash
# 跟踪特定后缀的所有文件
git lfs track "*.psd"
git lfs track "*.iso"
git lfs track "*.zip"
git lfs track "*.mp4"

# 跟踪特定目录
git lfs track "assets/*"
git lfs track "vendor/binaries/*.so"

# 跟踪单独文件
git lfs track "path/to/large-database.sql"

# 查看当前跟踪规则
git lfs track
# 输出：
# Listing tracked patterns
#     *.psd (.gitattributes)
#     *.mp4 (.gitattributes)

# 取消跟踪（只移除规则，已提交的 LFS 对象不受影响）
git lfs untrack "*.zip"

# 预览跟踪变更（不实际修改 .gitattributes）
git lfs track --dry-run "*.mov"

# 跟踪并启用锁定（适用于二进制协作文件）
git lfs track --lockable "design/*.fig"
git lfs track --lockable "*.blend"
```

**`.gitattributes` 示例**：
```
*.psd filter=lfs diff=lfs merge=lfs -text
*.mp4 filter=lfs diff=lfs merge=lfs -text
design/*.fig filter=lfs diff=lfs merge=lfs -text lockable
```

**规则说明**：
- `filter=lfs`：使用 LFS clean/smudge 过滤器
- `diff=lfs`：使用 LFS diff 驱动
- `merge=lfs`：使用 LFS merge 驱动
- `-text`：标记为二进制（避免 Git 换行符转换）
- `lockable`：支持 LFS 文件锁定

---

## 5. 列出 LFS 文件（ls-files）

```bash
# 列出工作区所有 LFS 文件及其 OID
git lfs ls-files

# 输出示例：
# 4e9a8c2e5f * design/main.psd
# 7b3d5f7a9c * videos/intro.mp4
# a1b2c3d4e5 - assets/logo.png
# * = 文件已缓存本地
# - = 文件是指针（未下载真实内容）

# 列出特定文件
git lfs ls-files -n "*.psd"

# 列出暂存区 LFS 文件
git lfs ls-files --cached

# 列出已删除的 LFS 引用
git lfs ls-files --deleted

# 只列出 OID（不显示文件名）
git lfs ls-files --all

# 非零退出码表示有文件缺少 LFS 对象
git lfs ls-files --missing
```

---

## 6. 获取 LFS 对象（fetch / pull / checkout）

### fetch —— 下载 LFS 对象到本地缓存

```bash
# 获取当前分支缺失的 LFS 对象
git lfs fetch

# 获取所有分支的 LFS 对象
git lfs fetch --all

# 获取最近提交的 LFS 对象（默认 7 天）
git lfs fetch --recent

# 只获取部分路径
git lfs fetch --include="*.psd"
git lfs fetch --exclude="*.mp4"

# 从指定远程获取
git lfs fetch origin main

# 获取特定提交的 LFS 对象
git lfs fetch origin <commit-SHA>
```

### pull —— fetch + checkout 的组合

```bash
# 拉取远程 LFS 对象并检出到工作区
git lfs pull

# 等于：git lfs fetch + git lfs checkout
git lfs pull origin main
```

### checkout —— 用真实文件替换指针

```bash
# 检出当前分支所有 LFS 文件
git lfs checkout

# 检出特定文件
git lfs checkout large-file.psd

# 冲突时选择本地版本
git lfs checkout --ours conflicted-file.bin

# 冲突时选择远程版本
git lfs checkout --theirs conflicted-file.bin
```

### 加速克隆

```bash
# GIT_LFS_SKIP_SMUDGE=1 跳过自动下载大文件（只获取指针）
GIT_LFS_SKIP_SMUDGE=1 git clone <repo-url>

# 之后按需下载
cd repo
git lfs pull --include="*.psd"     # 只下载 psd 文件
git lfs pull                        # 下载所有 LFS 文件
```

---

## 7. 推送 LFS 对象（push）

```bash
# 推送当前分支关联的 LFS 对象（通常在 git push 时自动触发）
git lfs push origin main

# 推送到所有远程
git lfs push --all origin

# 推送特定 OID 的对象
git lfs push --object-id origin 4e9a8c2e5f...

# 预览（不实际推送）
git lfs push --dry-run origin main
```

---

## 8. 文件状态（status）

```bash
# 显示 LFS 文件状态
git lfs status

# 输出示例：
# On branch main
# Objects to be pushed to origin/main:
#
#         design/main.psd (7b3d5f7a9c -> origin)
#         videos/intro.mp4 (a1b2c3d4e5 -> origin)
#
# Objects to be committed:
#
#         assets/banner.png (LFS: c3d4e5f6a7)

# 指定远程
git lfs status origin
```

---

## 9. 文件锁定（lock / unlock / locks）

避免多人同时编辑二进制文件造成冲突。

```bash
# 锁定文件（需要 --lockable 跟踪）
git lfs lock "design/project.fig"

# 锁定并附带说明
git lfs lock "design/project.fig" -m "Editing header layout"

# 查看所有锁定
git lfs locks

# 输出：
# design/project.fig  alice    ID:123  Editing header layout

# 查看特定路径锁定
git lfs locks --path "design/"

# 查看本地拥有的锁定
git lfs locks --local

# 解锁文件
git lfs unlock "design/project.fig"

# 强制解锁（管理员/OWNER 用）
git lfs unlock "design/project.fig" --force

# 验证暂存区文件未被他人锁定
git lfs locks --verify
```

**锁定流程**：
```bash
# 1. 文件必须标记为 lockable
git lfs track --lockable "*.blend"
git add .gitattributes && git commit -m "Enable locking for .blend"

# 2. 编辑前锁定
git lfs lock scene.blend

# 3. 正常编辑、提交、推送
git add scene.blend
git commit -m "Update 3D scene"
git push

# 4. 编辑完解锁
git lfs unlock scene.blend
```

---

## 10. 迁移历史（migrate）

将仓库历史中的大文件转换为 LFS 管理（或逆向）。

### import —— 将历史中的文件转为 LFS

```bash
# 预览迁移效果（不实际修改）
git lfs migrate info --everything

# 预览匹配特定模式的文件
git lfs migrate info --include="*.psd,*.mp4" --everything

# 执行迁移（rewrite history）
git lfs migrate import --include="*.psd,*.mp4" --everything

# 只迁移当前分支
git lfs migrate import --include="*.zip" --include-ref=main

# 迁移并排除某些模式
git lfs migrate import --include="*.bin" --exclude="small-*.bin" --everything

# 迁移大于指定大小的文件
git lfs migrate import --above=100MB --everything

# 迁移到指定提交范围
git lfs migrate import --include="*.psd" --include-ref=main --exclude-ref=feature/*
```

### export —— 将 LFS 文件还原为普通 git 对象

```bash
git lfs migrate export --include="*.zip" --everything
```

### info —— 查看迁移建议

```bash
# 查看超过 100MB 的文件
git lfs migrate info --above=100MB --everything

# 查看所有分支的大文件分布
git lfs migrate info --everything --top=20

# 输出示例：
# *.psd    1.2 GB    15/15 files(s)
# *.mp4    800 MB    5/5 files(s)
```

**⚠️ migrate 会改写历史，务必在团队协作前完成，或全员重新克隆**

---

## 11. 清理缓存（prune）

删除不再被引用的 LFS 本地缓存对象，释放磁盘空间。

```bash
# 预览可清理的对象
git lfs prune --dry-run

# 执行清理（保留最近 7 天的对象）
git lfs prune

# 保留最近 30 天的对象
git lfs prune --recent=30

# 清理前验证远程是否存在
git lfs prune --verify-remote

# 强制清理所有未引用对象
git lfs prune --force

# 详细输出
git lfs prune --verbose
```

---

## 12. 配置与环境

### 查看当前环境

```bash
git lfs env
# 输出：版本、Endpoint、本地路径、并发数、缓存设置等
```

### 关键配置项

```bash
# 默认的 LFS 服务器地址（通常 clone 时自动设置）
git config lfs.url "https://github.com/user/repo.git/info/lfs"

# 自定义 LFS 服务器（独立于 Git 托管）
git config lfs.url "https://lfs-server.example.com/org/repo"

# 并发传输数
git config lfs.concurrenttransfers 8

# 最近引用天数（fetch --recent 用）
git config lfs.fetchrecentrefsdays 7

# 不清除特定天数内的缓存
git config lfs.pruneoffsetdays 3

# 关闭 TLS 验证（仅私有服务器用）
git config lfs.https://lfs-server.example.com/.sslverify false
```

### `.lfsconfig` 文件

与 `.gitattributes` 不同，`.lfsconfig` 可以提交到仓库，让所有克隆者自动获得 LFS 服务器配置：

```bash
# 创建仓库级配置
git config -f .lfsconfig lfs.url "https://my-lfs-server.com/org/repo"
git config -f .lfsconfig lfs.concurrenttransfers 4

# 提交到仓库
git add .lfsconfig
git commit -m "Add LFS config"
```

`.lfsconfig` 示例内容：
```
[lfs]
    url = https://my-lfs-server.com/org/repo
    concurrenttransfers = 4
```

### 环境变量

| 变量 | 说明 |
|------|------|
| `GIT_LFS_SKIP_SMUDGE` | `=1` 跳过自动下载，只保留指针 |
| `GIT_LFS_SKIP_PUSH` | `=1` 跳过 LFS 推送 |
| `GIT_LFS_SET_LOCKABLE_READONLY` | `=1` 锁定文件设为只读 |
| `GIT_LFS_FORCE_PROGRESS` | `=1` 强制显示进度条 |

---

## 13. 调试与诊断

```bash
# 查看 LFS 日志
git lfs logs last          # 最近一次操作日志
git lfs logs show          # 所有日志文件
git lfs logs clear         # 清除日志

# 校验 LFS 对象完整性
git lfs fsck
git lfs fsck --pointers    # 只检查指针文件

# 去重 LFS 对象（节省空间）
git lfs dedup

# 显示 LFS 扩展信息
git lfs ext list

# 卸载 LFS（移除 hooks 和 filter 配置）
git lfs uninstall

# 更新 hooks（安装新版 LFS 后）
git lfs update
```

---

## 14. 实战脚本示例

### 脚本 1：为新仓库批量初始化 LFS 跟踪

```bash
#!/bin/bash
# 文件名：init_lfs.sh
# 用法：./init_lfs.sh

# 常见大文件类型
PATTERNS=(
    "*.psd"
    "*.ai"
    "*.sketch"
    "*.fig"
    "*.blend"
    "*.max"
    "*.mp4"
    "*.mov"
    "*.avi"
    "*.mp3"
    "*.wav"
    "*.flac"
    "*.zip"
    "*.tar.gz"
    "*.7z"
    "*.iso"
    "*.dmg"
    "*.pkg"
)

git lfs install
for pattern in "${PATTERNS[@]}"; do
    git lfs track "$pattern"
done
git lfs track
git add .gitattributes
git commit -m "Setup Git LFS tracking"
echo "LFS 初始化完成。"
```

### 脚本 2：检查仓库是否有大文件应该迁移

```bash
#!/bin/bash
# 文件名：lfs_audit.sh
# 用法：./lfs_audit.sh

echo "=== 超过 10MB 的文件 ==="
git lfs migrate info --above=10MB --everything

echo ""
echo "=== 当前 LFS 跟踪规则 ==="
git lfs track

echo ""
echo "=== 当前 LFS 文件列表 ==="
git lfs ls-files

echo ""
echo "=== 未推送的 LFS 对象 ==="
git lfs status
```

### 脚本 3：按需下载 LFS 文件（只下载需要的类型）

```bash
#!/bin/bash
# 文件名：lfs_pull_selective.sh
# 用法：./lfs_pull_selective.sh "*.psd,*.mp4" (只下载这些类型)

TYPES="${1:-*.psd}"

# 先只获取指针
GIT_LFS_SKIP_SMUDGE=1 git pull

# 按需下载
git lfs fetch --include="$TYPES"
git lfs checkout
echo "已下载类型：$TYPES"
```

### 脚本 4：批量锁定 / 解锁文件

```bash
#!/bin/bash
# 文件名：lfs_batch_lock.sh
# 用法：./lfs_batch_lock.sh lock "design/*.fig"
#       ./lfs_batch_lock.sh unlock "design/*.fig"

ACTION="$1"
PATTERN="$2"

if [[ "$ACTION" == "lock" ]]; then
    git lfs ls-files -n "$PATTERN" | while read -r oid file; do
        git lfs lock "$file"
    done
elif [[ "$ACTION" == "unlock" ]]; then
    git lfs locks --path "$PATTERN" | grep "$PATTERN" | while read -r file _; do
        git lfs unlock "$file"
    done
else
    echo "用法：$0 <lock|unlock> <pattern>"
fi
```

### 脚本 5：仓库重写后强制推送 LFS（慎用）

```bash
#!/bin/bash
# 文件名：lfs_force_push.sh
# 用法：./lfs_force_push.sh
# 注意：会改写远程仓库历史！

set -e

echo "⚠️  此操作将强制推送并改写历史。"
read -p "确认？（yes/no）：" CONFIRM
if [[ "$CONFIRM" != "yes" ]]; then
    echo "已取消。"
    exit 0
fi

BRANCH=$(git rev-parse --abbrev-ref HEAD)
git push origin "$BRANCH" --force --all
echo "强制推送完成。通知团队成员重新克隆仓库。"
```

### 脚本 6：清理 LFS 缓存 + 查看空间回收

```bash
#!/bin/bash
# 文件名：lfs_cleanup.sh
# 用法：./lfs_cleanup.sh

echo "清理前 LFS 缓存大小："
du -sh .git/lfs/objects 2>/dev/null || echo "无缓存"

echo ""
echo "=== 预览可删除对象 ==="
git lfs prune --dry-run --verbose

echo ""
read -p "执行清理？（y/n）：" CONFIRM
if [[ "$CONFIRM" == "y" ]]; then
    git lfs prune --verify-remote --verbose
    echo ""
    echo "清理后 LFS 缓存大小："
    du -sh .git/lfs/objects 2>/dev/null || echo "无缓存"
fi
```

### 脚本 7：lfs-test-server 启动器

```bash
#!/bin/bash
# 文件名：start_lfs_server.sh
# 用法：./start_lfs_server.sh

# 需要 lfs-test-server（go install github.com/github/lfs-test-server）

LFS_ADMIN_USER="${LFS_ADMIN_USER:-admin}"
LFS_ADMIN_PASS="${LFS_ADMIN_PASS:-admin}"
LFS_LISTEN="${LFS_LISTEN:-tcp://:8080}"
LFS_HOST="${LFS_HOST:-localhost:8080}"
LFS_CONTENT_PATH="${LFS_CONTENT_PATH:-./lfs-content}"
LFS_SCHEME="${LFS_SCHEME:-http}"

export LFS_ADMIN_USER LFS_ADMIN_PASS LFS_LISTEN LFS_HOST LFS_CONTENT_PATH LFS_SCHEME

mkdir -p "$LFS_CONTENT_PATH"
lfs-test-server &
echo "LFS 服务器启动：$LFS_SCHEME://$LFS_HOST"
echo "客户端配置："
echo "  git config lfs.url $LFS_SCHEME://$LFS_HOST"
```

---

## 15. 完整命令速查表

### Porcelain 命令

| 命令 | 说明 |
|------|------|
| `git lfs install` | 初始化 LFS（设定 hooks 和 filters） |
| `git lfs track "*.ext"` | 跟踪文件类型 |
| `git lfs untrack "*.ext"` | 取消跟踪 |
| `git lfs ls-files` | 列出工作区 LFS 文件 |
| `git lfs fetch` | 下载 LFS 对象到缓存 |
| `git lfs pull` | fetch + checkout 组合 |
| `git lfs checkout` | 替换指针为真实文件 |
| `git lfs push origin main` | 推送 LFS 对象 |
| `git lfs status` | 显示 LFS 文件状态 |
| `git lfs lock <file>` | 锁定文件 |
| `git lfs unlock <file>` | 解锁文件 |
| `git lfs locks` | 列出锁定 |
| `git lfs migrate import` | 迁移历史文件到 LFS |
| `git lfs migrate export` | 迁移 LFS 回到 git |
| `git lfs migrate info` | 查看迁移信息 |
| `git lfs prune` | 清理未引用 LFS 缓存 |
| `git lfs env` | 显示 LFS 环境 |
| `git lfs logs` | 查看日志 |
| `git lfs fsck` | 校验 LFS 对象 |
| `git lfs dedup` | 去重 LFS 对象 |
| `git lfs uninstall` | 卸载 LFS |
| `git lfs update` | 更新 hooks |
| `git lfs version` | 查看版本 |
| `git lfs completion` | 生成 shell 补全脚本 |
| `git lfs ext` | 显示 LFS 扩展 |

### Plumbing 命令（底层）

| 命令 | 说明 |
|------|------|
| `git lfs clean` | 大文件 → 指针 |
| `git lfs smudge` | 指针 → 大文件 |
| `git lfs pointer` | 构建/比对指针 |
| `git lfs pre-push` | pre-push hook 实现 |
| `git lfs post-checkout` | post-checkout hook |
| `git lfs post-commit` | post-commit hook |
| `git lfs post-merge` | post-merge hook |

### 常用选项

| 选项 | 说明 |
|------|------|
| `--lockable` | 跟踪并启用锁定 |
| `--all` | 所有分支/所有对象 |
| `--recent` | 最近提交的对象 |
| `--include="*.psd"` | 只包含匹配路径 |
| `--exclude="*.mp4"` | 排除匹配路径 |
| `--dry-run` | 预览不执行 |
| `--force` | 强制执行 |
| `--verbose` | 详细输出 |
| `--json` | JSON 格式输出 |

---

## 16. 注意事项与陷阱

1. **安装后必须 `git lfs install`**：每台新机器/clone 之前都需要做一次（clone 时也会自动 bootstrap）。

2. **`.gitattributes` 必须提交**：`git lfs track` 写入了 `.gitattributes`，必须 `git add .gitattributes` 并提交，否则克隆者不会知道哪些文件需要 LFS。

3. **`GIT_LFS_SKIP_SMUDGE=1` 会得到指针文件**：此时工作区的 LFS 文件是 ≈130B 的指针文本，而不是真实内容。记得后续 `git lfs pull`。

4. **`migrate` 改写历史**：`git lfs migrate import` 会修改所有受影响提交的 SHA。团队中所有人需要重新克隆或在 force push 后重新 fetch。

5. **LFS 服务器独立计费**：GitHub / GitLab 的 LFS 存储和带宽通常独立于仓库大小配额，有额外限制。

6. **锁定需要 `--lockable`**：`git lfs track` 时使用 `--lockable` 标记，否则文件不支持锁定。

7. **锁定不是自动的**：即便标记了 `lockable`，也不会自动锁定，需要手动 `git lfs lock`。

8. **`prune` 需谨慎**：清理后如果需要旧版本的大文件，需要重新从远程拉取。`--verify-remote` 可以确保远程确实存在才删除本地。

9. **LFS URL 优先级**：`.lfsconfig` > `git config lfs.url` > 自动推断（from git remote）。

10. **大文件已提交到 Git（非 LFS）**：只能用 `migrate` 改写历史。普通 `git lfs track` 只对之后的 commit 生效。

11. **并发传输**：默认 `concurrenttransfers` 是 8，大带宽环境适当增加，弱网络适当减少。

12. **自建 LFS 服务器**：可以使用 `lfs-test-server`（本机已安装）作为开发测试环境，或使用 MinIO/自定义 HTTP 服务器实现 LFS API。
