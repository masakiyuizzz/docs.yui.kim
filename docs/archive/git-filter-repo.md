# git-filter-repo —— Git 历史重写利器

> `git filter-branch` 的官方推荐替代品。Python 3 编写，基于 fast-export/fast-import 管道，速度快数十倍。
> 用于：删除敏感文件 / 提取子目录 / 重写作者 / 修改提交信息 / 清理大文件 / 仓库瘦身。
> 官方仓库：[github.com/newren/git-filter-repo](https://github.com/newren/git-filter-repo)
> 安装：Homebrew（本机） 或 `pip install git-filter-repo`

---

## 目录

1. [安装](#1-安装)
2. [前置警告与安全机制](#2-前置警告与安全机制)
3. [分析模式（--analyze）](#3-分析模式--analyze)
4. [路径过滤](#4-路径过滤)
5. [路径重命名](#5-路径重命名)
6. [内容编辑](#6-内容编辑)
7. [提交信息过滤](#7-提交信息过滤)
8. [作者/邮箱重写](#8-作者邮箱重写)
9. [引用重命名](#9-引用重命名)
10. [Callback 回调系统](#10-callback-回调系统)
11. [高级场景](#11-高级场景)
12. [实战脚本示例](#12-实战脚本示例)
13. [完整选项速查表](#13-完整选项速查表)
14. [注意事项与陷阱](#14-注意事项与陷阱)

---

## 1. 安装

```bash
# macOS Homebrew（本机安装方式）
brew install git-filter-repo

# pip（跨平台）
pip install git-filter-repo

# 源码安装
git clone https://github.com/newren/git-filter-repo
cd git-filter-repo
sudo cp git-filter-repo /usr/local/bin/

# 依赖：Python 3.5+、Git 2.22.0+
```

---

## 2. 前置警告与安全机制

### ⚠️ 黄金法则

```
永远在 FRESH CLONE 中运行 git-filter-repo！
永远不要在原工作仓库中运行！
```

### 安全特性

| 机制 | 说明 |
|------|------|
| **Fresh Clone 检查** | 非 fresh clone 会拒绝运行（除非 `--force`） |
| **自动备份** | 原始 refs 保留在 `refs/original/` 下 |
| **自动 gc** | 完成后自动 `git gc --aggressive` 瘦身 |
| **`--dry-run`** | 预览模式，不实际修改仓库 |

```bash
# 正确操作流程
git clone --bare <repo-url> repo-to-filter
cd repo-to-filter
git-filter-repo ...                    # 执行过滤
cd ..
git clone repo-to-filter repo-filtered # 从过滤后的 bare clone 出工作副本

# 强制运行（危险，确认知晓后果）
git-filter-repo --force --path src/
```

---

## 3. 分析模式（--analyze）

先分析再操作，生成报告帮助决策。

```bash
# 生成分析报告
git filter-repo --analyze

# 报告输出在 .git/filter-repo/analysis/ 目录下：
#   README                 - 说明文档
#   directories-deleted-sizes.txt  - 按目录统计大小
#   extensions-deleted-sizes.txt   - 按扩展名统计大小
#   path-deleted-sizes.txt        - 按路径统计大小
#   blob-shas-and-paths.txt        - blob SHA 与路径映射
#   renamed-files.txt             - 检测到的重命名
#   all-objects-report.txt        - 所有对象的完整报告

# 查看报告中最大的文件/目录
cat .git/filter-repo/analysis/path-deleted-sizes.txt | sort -rn | head -20
cat .git/filter-repo/analysis/extensions-deleted-sizes.txt | sort -rn | head -20
```

---

## 4. 路径过滤

### 基本路径过滤

```bash
# 只保留指定路径的历史
git filter-repo --path README.md --path src/ --path docs/

# 目录名可以有或没有尾部斜杠
git filter-repo --path src       # 等价 --path src/

# 删除指定路径（反向）
git filter-repo --path secrets/ --path passwords.txt --invert-paths

# 删除 .DS_Store
git filter-repo --path-glob '.DS_Store' --invert-paths

# 通配符匹配
git filter-repo --path-glob '*.zip' --invert-paths     # 删除所有 zip 文件
git filter-repo --path-glob '*.mp4' --path-glob '*.psd' --invert-paths

# 正则匹配
git filter-repo --path-regex '^.*\.(exe|dll|so)$'

# 从文件批量读取路径
git filter-repo --paths-from-file ../paths.txt
# paths.txt 格式：每行一个路径
#   src/
#   README.md
#   glob:*.py
#   regex:^docs/.*\.md$
#   行首 # 为注释
```

### 多轮过滤（include + exclude）

```bash
# 方式一：多次运行（推荐，因为逻辑清晰）
git filter-repo --path src/             # 先只保留 src/
git filter-repo --path src/README.md --invert-paths  # 再排除 README.md

# 方式二：用 --filename-callback 一次完成
git filter-repo --filename-callback '
    if filename == b"src/README.md":
        return None
    if filename.startswith(b"src/"):
        return filename
    return None
'
```

### 基于文件名的过滤

```bash
# --use-base-name：只匹配文件基本名，不匹配完整路径
git filter-repo --use-base-name --path-glob '*.pyc' --invert-paths
# 删除所有目录下的 .pyc 文件
```

---

## 5. 路径重命名

```bash
# 基本路径重命名
git filter-repo --path-rename old/name/:new/name/

# 提取子目录到仓库根
git filter-repo --subdirectory-filter src/
# 等价于：--path src/ --path-rename src/:

# 将仓库根移入子目录（为合并仓库做准备）
git filter-repo --to-subdirectory-filter my-module/
# 等价于：--path-rename :my-module/

# 多重重命名
git filter-repo \
    --path-rename src/main/:lib/core/ \
    --path-rename src/util/:lib/util/ \
    --path-rename docs/:documentation/

# 指定重命名匹配模式（regex 模式）
git filter-repo --path-rename 'regex:^test_(.*)\.py$==>tests/\1_test.py'
```

---

## 6. 内容编辑

### 替换文件内容中的文本

```bash
# 创建替换规则文件 expressions.txt
cat > ../expressions.txt << 'EOF'
password123==>***REMOVED***
secret_key==>***REMOVED***
AWS_ACCESS_KEY_ID==>***REMOVED***
regex:-----BEGIN RSA PRIVATE KEY-----.*?-----END RSA PRIVATE KEY-----==>\n***KEY REMOVED***\n
EOF

# 执行替换
git filter-repo --replace-text ../expressions.txt
```

**替换规则语法**：
- `literal_text` → 替换为 `***REMOVED***`
- `literal_text==>replacement` → 替换为指定文本
- `regex:PATTERN==>REPLACEMENT` → 正则替换
- `glob:pattern` → 通配符匹配（查找，不替换内容）

### 删除超过大小限制的文件

```bash
# 删除大于 100MB 的文件
git filter-repo --strip-blobs-bigger-than 100M

# 删除大于 1GB 的文件
git filter-repo --strip-blobs-bigger-than 1G

# 支持的大小单位：K, M, G, T
```

### 按 blob ID 删除

```bash
# 先找出大文件的 blob ID
git filter-repo --analyze
# 从 blob-shas-and-paths.txt 提取

# 创建 blob ID 列表
cat > ../blobs-to-remove.txt << 'EOF'
abc123def456...
789ghi012jkl...
EOF

# 删除
git filter-repo --strip-blobs-with-ids ../blobs-to-remove.txt
```

---

## 7. 提交信息过滤

```bash
# 替换提交信息中的文本
cat > ../message_changes.txt << 'EOF'
JIRA-123==>JIRA-456
TODO==>FIXME
EOF
git filter-repo --replace-message ../message_changes.txt

# 用 callback 修改提交信息
git filter-repo --message-callback '
    return message.replace(b"old-project", b"new-project")
'

# 删除提交信息中的特定行
git filter-repo --message-callback '
    return re.sub(br"\nReviewed-by:.*", b"", message)
'

# 保留原始 commit hash 引用（默认会自动更新 hash 引用）
git filter-repo --preserve-commit-hashes --path src/

# 保留原始编码（默认会转为 UTF-8）
git filter-repo --preserve-commit-encoding --path src/
```

---

## 8. 作者/邮箱重写

```bash
# 使用 .mailmap 文件
git filter-repo --use-mailmap

# 或指定 mailmap 文件
git filter-repo --mailmap ../my-mailmap

# mailmap 格式示例：
# Proper Name <proper@email.com> Old Name <old@email.com>
# Proper Name <proper@email.com> <old@email.com>
# <proper@email.com> <old@email.com>

# 用 callback 修改作者
git filter-repo --name-callback 'return name.replace(b"Jon", b"John")'
git filter-repo --email-callback 'return email.replace(b"@old.com", b"@new.com")'

# 同时修改 name 和 email
git filter-repo \
    --name-callback 'return name.replace(b"John", b"Jonathan")' \
    --email-callback 'return email.lower()'

# 处理特殊字符（如 ë á）
git filter-repo --commit-callback '
    if commit.author_email == b"old@test.com":
        commit.author_name = "Raphaël González".encode()
        commit.author_email = b"rgonzalez@test.com"
'
```

---

## 9. 引用重命名

```bash
# 重命名 tag 前缀
git filter-repo --tag-rename foo:bar
# foo-1.2.3 → bar-1.2.3

# 添加 tag 前缀
git filter-repo --tag-rename '':'v'
# 1.2.3 → v1.2.3

# 删除 tag 前缀
git filter-repo --tag-rename 'v:'
# v1.2.3 → 1.2.3

# 只处理特定范围的引用
git filter-repo --refs main --refs develop --refs tags/v1.* --path src/
```

---

## 10. Callback 回调系统

这是 git-filter-repo 最强大的功能。回调用 Python 编写，在命令行直接传入。

### 回调类型一览

| 回调 | 函数签名 | 用途 |
|------|---------|------|
| `--filename-callback` | `def(filename)` | 过滤/重命名文件 |
| `--message-callback` | `def(message)` | 修改提交信息 |
| `--name-callback` | `def(name)` | 修改作者名 |
| `--email-callback` | `def(email)` | 修改邮箱 |
| `--commit-callback` | `def(commit)` | 修改整个 commit 对象 |
| `--blob-callback` | `def(blob)` | 修改文件内容（blob） |
| `--refname-callback` | `def(refname)` | 修改引用名 |
| `--file-info-callback` | `def(filename, mode, blob_id, value)` | 同时操作文件名和内容 |
| `--tag-callback` | `def(tag)` | 修改 tag 对象 |

### filename-callback

```bash
# 删除所有 .DS_Store
git filter-repo --filename-callback '
    return None if os.path.basename(filename) == b".DS_Store" else filename
'

# 删除含反斜杠的文件
git filter-repo --filename-callback '
    return None if b"\\" in filename else filename
'

# include + exclude（单次运行）
git filter-repo --filename-callback '
    if filename.endswith(b".pyc"):
        return None
    if filename.startswith(b"src/") or filename == b"README.md":
        return filename
    return None
'

# NFD → NFC 文件名标准化（macOS 兼容）
git filter-repo --filename-callback '
    import unicodedata
    try:
        return bytearray(unicodedata.normalize("NFC", filename.decode("utf-8")), "utf-8")
    except:
        return filename
'
```

### message-callback

```bash
# 替换提交信息中的关键字
git filter-repo --message-callback '
    return message.replace(b"stuff", b"task")
'

# 删除 Tested-by / Reviewed-by 标签
git filter-repo --message-callback '
    return re.sub(br"\n(Tested|Reviewed)-by:.*", b"", message)
'

# 从文件加载回调逻辑
echo 'return message.replace(b"old", b"new")' > /tmp/msg-callback.py
git filter-repo --message-callback /tmp/msg-callback.py
```

### commit-callback

```bash
# 修改特定范围的提交
git filter-repo --refs main~5..main --commit-callback '
    commit.committer_name = b"My Name"
    commit.committer_email = b"my@email.com"
'

# 给 root commit 添加文件
git filter-repo --commit-callback '
    if not commit.parents:
        commit.file_changes.append(
            FileChange(b"M", b".gitignore", b"<blob-id>", b"100644"))
'

# 删除空提交
git filter-repo --commit-callback '
    if not commit.file_changes and not commit.parents:
        commit.skip()   # 会被 --prune-empty 自动处理
'
```

### blob-callback

```bash
# 替换特定的二进制文件
git filter-repo --blob-callback '
    if blob.original_id == b"f4ede2e944868b9a08401dafeb2b944c7166fd0a":
        blob.data = open("../replacement.jpg", "rb").read()
'

# Python 多行回调
git filter-repo --blob-callback '
if blob.original_id in [b"abc123", b"def456"]:
    blob.data = b"placeholder"
'
```

### file-info-callback

```bash
# 同时操作文件名和 blob（最灵活的回调）
git filter-repo --file-info-callback '
    # 获取 blob 内容
    contents = value.get_contents_by_identifier(blob_id)
    if value.is_binary(contents):
        return (filename, mode, blob_id)  # 跳过二进制
    # 替换文本
    new_contents = value.apply_replace_text(contents)
    new_blob_id = value.insert_file_with_contents(new_contents)
    return (filename, mode, new_blob_id)
'

# 替换特定旧 blob 为已压缩的新版本
git filter-repo --file-info-callback '
    if filename == b"resources/logo.png" and blob_id == b"oldblobhash...":
        blob_id = b"newcompressedhash..."
    return (filename, mode, blob_id)
'
```

---

## 11. 高级场景

### 11.1 仓库瘦身（删除大文件）

```bash
# 完整流程
git clone --bare https://github.com/user/repo.git repo-bare
cd repo-bare

# 分析找出大文件
git filter-repo --analyze
cat .git/filter-repo/analysis/path-deleted-sizes.txt | sort -rn | head -20

# 删除超过 50MB 的文件
git filter-repo --strip-blobs-bigger-than 50M

# 或按路径删除
git filter-repo --path-glob '*.mp4' --path-glob '*.psd' --invert-paths

# 克隆回工作目录
cd ..
git clone repo-bare repo-slim
```

### 11.2 拆分 monorepo — 提取子目录

```bash
# 将 src/lib/ 提取为新仓库
git clone --bare monorepo.git lib-extracted
cd lib-extracted
git filter-repo --subdirectory-filter src/lib/ --tag-rename '':'lib-'
cd ..
git clone lib-extracted lib-repo
```

### 11.3 合并两个仓库

```bash
# 1. 为 repo-A 创建子目录
git clone repo-A.git repoA-prep
cd repoA-prep
git filter-repo --to-subdirectory-filter project-a/
cd ..

# 2. 为 repo-B 创建子目录
git clone repo-B.git repoB-prep
cd repoB-prep
git filter-repo --to-subdirectory-filter project-b/
cd ..

# 3. 合并到新仓库
mkdir merged && cd merged
git init
git remote add a ../repoA-prep
git remote add b ../repoB-prep
git fetch --all
git merge a/main --allow-unrelated-histories
git merge b/main --allow-unrelated-histories
```

### 11.4 永久化 replace refs

```bash
# 如果有 git replace 引用，将其永久写入历史
git filter-repo --proceed
```

### 11.5 截断历史（删除旧提交）

```bash
# 将历史截断为最近 100 个提交
OLD_COMMIT=$(git rev-list HEAD | tail -100 | head -1)
git replace --graft $OLD_COMMIT   # 使其成为新的 root commit
git filter-repo --proceed --force
```

### 11.6 删除指定 commit 范围内的文件

```bash
# 只处理 main 分支上最近 10 个提交
git filter-repo --refs main~10..main --path passwords.txt --invert-paths
```

### 11.7 从 stdin 处理

```bash
# 手动控制 fast-export 输出
git fast-export --all | git filter-repo --stdin --path src/

# 和 --dry-run 配合查看效果
git fast-export --all > original.fi
git filter-repo --dry-run --path src/ < original.fi
```

---

## 12. 实战脚本示例

### 脚本 1：一键清理敏感信息

```bash
#!/bin/bash
# 文件名：scrub-secrets.sh
# 用法：./scrub-secrets.sh <repo-url>

REPO_URL="${1:?用法: $0 <repo-url>}"
REPO_NAME=$(basename "$REPO_URL" .git)

set -e

echo "=== 克隆仓库 ==="
git clone --bare "$REPO_URL" "${REPO_NAME}-scrubbed"

cd "${REPO_NAME}-scrubbed"

echo "=== 创建替换规则 ==="
cat > ../secrets.txt << 'EOF'
regex:AKIA[0-9A-Z]{16}==>***AWS_KEY_REMOVED***
regex:sk-[a-zA-Z0-9]{32,}==>***STRIPE_KEY_REMOVED***
regex:ghp_[a-zA-Z0-9]{36}==>***GITHUB_TOKEN_REMOVED***
regex:-----BEGIN (RSA |EC |OPENSSH |)PRIVATE KEY-----.*?-----END \1PRIVATE KEY-----==>\n***PRIVATE_KEY_REMOVED***\n
regex:mongodb(\+srv)?://[^:]+:[^@]+@==>mongodb\1://***:***@
regex:postgres://[^:]+:[^@]+@==>postgres://***:***@
EOF

echo "=== 扫描并替换敏感信息 ==="
git filter-repo --replace-text ../secrets.txt

echo "=== 克隆为工作目录 ==="
cd ..
git clone "${REPO_NAME}-scrubbed" "${REPO_NAME}-clean"

echo "=== ✅ 完成 ==="
echo "清理后仓库：${REPO_NAME}-clean"
echo "bare 备份：${REPO_NAME}-scrubbed"
```

### 脚本 2：提取子目录为新仓库

```bash
#!/bin/bash
# 文件名：extract-subdir.sh
# 用法：./extract-subdir.sh <repo-url> <subdir> [new-name]

REPO_URL="${1:?用法: $0 <repo-url> <subdir-path> [new-repo-name]}"
SUBDIR="${2:?用法: $0 <repo-url> <subdir-path> [new-repo-name]}"
NEW_NAME="${3:-$(basename "$SUBDIR")}"

set -e

echo "=== 克隆源仓库 ==="
git clone --bare "$REPO_URL" "${NEW_NAME}-bare"
cd "${NEW_NAME}-bare"

echo "=== 提取子目录: $SUBDIR ==="
git filter-repo --subdirectory-filter "$SUBDIR"

echo "=== 克隆为工作目录 ==="
cd ..
git clone "${NEW_NAME}-bare" "$NEW_NAME"

echo "=== ✅ 完成 ==="
echo "新仓库：$NEW_NAME"
echo "建议：cd $NEW_NAME && git remote add origin <new-origin-url>"
```

### 脚本 3：批量修改作者信息

```bash
#!/bin/bash
# 文件名：rewrite-authors.sh
# 用法：先创建 .mailmap，然后 ./rewrite-authors.sh

MAILMAP="${1:-.mailmap}"

if [[ ! -f "$MAILMAP" ]]; then
    echo "mailmap 文件不存在：$MAILMAP"
    echo ""
    echo "格式示例："
    echo '  Proper Name <proper@email.com> Old Name <old@email.com>'
    echo '  Proper Name <proper@email.com> <old@email.com>'
    echo '  <proper@email.com> <old@email.com>'
    exit 1
fi

echo "当前 mailmap 内容："
cat "$MAILMAP"
echo ""
read -p "在当前仓库执行？（y/n）：" CONFIRM
if [[ "$CONFIRM" != "y" ]]; then
    exit 0
fi

git filter-repo --mailmap "$MAILMAP" --force
echo "✅ 作者信息已重写。"
```

### 脚本 4：按文件大小归档分析

```bash
#!/bin/bash
# 文件名：repo-audit.sh
# 用法：./repo-audit.sh (在要分析的仓库中运行)

echo "=== Git 仓库审计报告 ==="
echo "仓库：$(pwd)"
echo "时间：$(date)"
echo ""

echo "--- 基本信息 ---"
echo "总大小：$(du -sh .git | cut -f1)"
echo "总提交数：$(git rev-list --count --all)"
echo "分支数：$(git branch -r | wc -l | tr -d ' ')"
echo "标签数：$(git tag | wc -l | tr -d ' ')"
echo ""

echo "--- 最大的对象 ---"
git rev-list --objects --all | \
    git cat-file --batch-check='%(objecttype) %(objectname) %(objectsize) %(rest)' | \
    awk '/^blob/ {print $3, $4}' | \
    sort -rn | \
    head -20 | \
    awk '{printf "  %10s  %s\n", $1, $2}'

echo ""
echo "--- 文件类型分布 ---"
git ls-tree -r HEAD | awk '{print $4}' | \
    awk -F. '{print $NF}' | \
    sort | uniq -c | sort -rn | head -15 | \
    awk '{printf "  %6s  .%s\n", $1, $2}'

echo ""
echo "--- 建议 ---"
BIGGEST=$(git rev-list --objects --all | \
    git cat-file --batch-check='%(objecttype) %(objectname) %(objectsize) %(rest)' | \
    awk '/^blob/ {print $3, $4}' | \
    sort -rn | head -1 | awk '{print $2}')
echo "  最大文件：$BIGGEST"
echo "  如需瘦身：git filter-repo --path-glob '*.{ext}' --invert-paths"
```

### 脚本 5：从 Git 历史中彻底删除文件

```bash
#!/bin/bash
# 文件名：obliterate-files.sh
# 用法：./obliterate-files.sh "*.zip,*.mp4,*.psd"

PATTERNS="$1"
REPO_URL="$2"

set -e

if [[ -z "$PATTERNS" ]]; then
    echo "用法：$0 '<pattern1>,<pattern2>' [repo-url]"
    echo "示例：$0 '*.zip,*.mp4'"
    exit 1
fi

# 如果有远程 URL，先 clone
if [[ -n "$REPO_URL" ]]; then
    REPO_NAME=$(basename "$REPO_URL" .git)
    git clone --bare "$REPO_URL" "${REPO_NAME}-cleaned"
    cd "${REPO_NAME}-cleaned"
fi

# 构建 filter 命令
IFS=',' read -ra PATS <<< "$PATTERNS"
FILTER_ARGS=""
for pat in "${PATS[@]}"; do
    pat=$(echo "$pat" | xargs)  # trim
    FILTER_ARGS="$FILTER_ARGS --path-glob '$pat'"
done

echo "=== 删除文件模式: $PATTERNS ==="
echo ""
echo "删除的文件预览："
eval "git filter-repo --analyze --dry-run $FILTER_ARGS --invert-paths" 2>&1 | grep -E "Renamed|Deleted" || true
echo ""

read -p "确认执行？（y/n）：" CONFIRM
if [[ "$CONFIRM" != "y" ]]; then
    echo "已取消。"
    exit 0
fi

eval "git filter-repo $FILTER_ARGS --invert-paths"

echo "=== ✅ 完成 ==="
echo "文件已从所有历史中删除。"
```

### 脚本 6：dry-run 预览过滤器效果

```bash
#!/bin/bash
# 文件名：filter-preview.sh
# 用法：./filter-preview.sh (在仓库中运行)

echo "=== Dry-run 预览 ==="
echo "此操作不会修改仓库。"
echo ""

git filter-repo --dry-run --debug "$@" 2>&1 | \
    grep -E "Renamed|Deleted|Added|commit|blob|tree|total" | \
    head -30

echo ""
echo "原始 refs 仍完整保留。"
echo "满意后重新运行不带 --dry-run 的相同命令。"
```

---

## 13. 完整选项速查表

### 路径过滤

| 选项 | 说明 |
|------|------|
| `--path PATH` | 保留匹配路径 |
| `--path-glob GLOB` | 通配符匹配保留 |
| `--path-regex REGEX` | 正则匹配保留 |
| `--invert-paths` | 反转（排除匹配路径） |
| `--use-base-name` | 匹配基本名而非全路径 |
| `--paths-from-file FILE` | 从文件读取路径规则 |

### 路径重命名

| 选项 | 说明 |
|------|------|
| `--path-rename OLD:NEW` | 重命名路径 |
| `--path-rename-match OLD:NEW` | 精确匹配重命名 |
| `--subdirectory-filter DIR` | 提取子目录到根 |
| `--to-subdirectory-filter DIR` | 根移入子目录 |

### 内容编辑

| 选项 | 说明 |
|------|------|
| `--replace-text FILE` | 按规则文件替换文本 |
| `--strip-blobs-bigger-than SIZE` | 删除大于指定大小的文件 |
| `--strip-blobs-with-ids FILE` | 按 blob ID 删除 |

### 引用操作

| 选项 | 说明 |
|------|------|
| `--tag-rename OLD:NEW` | 重命名 tag 前缀 |
| `--refs REF` | 只处理指定引用 |
| `--replace-refs MODE` | 控制 replace refs 行为 |

### 提交信息

| 选项 | 说明 |
|------|------|
| `--replace-message FILE` | 替换提交信息中的文本 |
| `--preserve-commit-hashes` | 不更新 commit hash 引用 |
| `--preserve-commit-encoding` | 保留原始编码 |

### 作者/邮箱

| 选项 | 说明 |
|------|------|
| `--mailmap FILE` | 使用 mailmap 重写 |
| `--use-mailmap` | 使用 .mailmap |

### Callback

| 选项 | 说明 |
|------|------|
| `--filename-callback CODE` | 文件过滤/重命名 |
| `--message-callback CODE` | 修改提交信息 |
| `--name-callback CODE` | 修改作者名 |
| `--email-callback CODE` | 修改邮箱 |
| `--commit-callback CODE` | 修改 commit 对象 |
| `--blob-callback CODE` | 修改文件内容 |
| `--refname-callback CODE` | 修改引用名 |
| `--tag-callback CODE` | 修改 tag |
| `--file-info-callback CODE` | 综合操作 |

### 通用

| 选项 | 说明 |
|------|------|
| `--analyze` | 生成分析报告 |
| `--proceed` | 永久化 git replace 引用 |
| `--dry-run` | 预览不修改 |
| `--debug` | 调试输出 |
| `--force` | 跳过 fresh clone 检查 |
| `--stdin` | 从 stdin 读取 fast-export |
| `--quiet` | 安静模式 |
| `--prune-empty` | 删除空提交（默认开启） |

---

## 14. 注意事项与陷阱

1. **必须在 fresh clone 中运行**：git-filter-repo 会拒绝在原工作仓库中运行（除非 `--force`）。这是因为它会永久删除原始历史。

2. **`--force` 不等于安全**：即使跳过 fresh clone 检查，历史仍然会被改写。使用 `--force` 前务必有完整备份。

3. **`--analyze` 是最好的第一步**：先分析再操作，避免删错东西。

4. **`--path` 和 `--path-rename` 的陷阱**：`--path-rename` 不会自动选择文件——你需要 `--path` 来选择它们。`--path-rename` 只重命名那些已经被 `--path`（或其他过滤）选中的文件。

5. **顺序敏感**：多个 `--path` 是取并集，但多个 `--path-rename` 中，如果两个 rename 规则匹配同一条路径，后面的会覆盖前面的。

6. **Commit hash 会全部改变**：filter-repo 会重写所有涉及到的 commit，所有 SHA-1 都会变。团队成员必须重新克隆。

7. **重写后需要 force push**：过滤完成后 push 需要 `--force`（或 `--force-with-lease`），因为历史完全不同了。

8. **submodule 需要注意**：submodule 的 hash 不会被自动更新，需要手动用 `--file-info-callback` 处理。

9. **stash 也会被重写**：默认自动重写所有 stash 引用。

10. **Callback 中的 Python bytes**：callback 中所有字符串参数都是 `bytes` 类型（Python 3），返回也必须用 `bytes`（或 `None` 表示删除）。字符字面量加 `b` 前缀：`b"hello"`。

11. **特殊字符处理**：不能直接在 `b""` 中使用非 ASCII 字符。先用普通字符串然后 `.encode()`：`"Raphaël".encode()`。

12. **`--replace-text` 中的正则**：默认使用 Python `re.sub()`，`.` 不包括换行符。跨行匹配需要 `re.DOTALL`（在 regex 表达式中用 `(?s)` 前缀）。

13. **大仓库会很慢**：对于数 GB 的仓库，filter-repo 可能需要数十分钟。可以先用 `--refs` 缩小范围。

14. **`git-filter-repo` vs `git filter-branch`**：git 官方文档明确建议不要使用 `git filter-branch`，使用 `git filter-repo` 替代。快几十倍，更安全。
