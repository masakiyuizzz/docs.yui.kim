# Git —— 分布式版本控制系统

> "the stupid content tracker" —— 但实际上是世界上最强大的版本控制系统。
> 分布式、快照式、分支廉价、本地完整历史。
> 版本：2.51.1（Homebrew）· 官网：[git-scm.com](https://git-scm.com) · 文档：[git-scm.com/docs](https://git-scm.com/docs)

---

## 目录

1. [基础概念](#1-基础概念)
2. [仓库操作](#2-仓库操作)
3. [基本工作流](#3-基本工作流)
4. [分支管理](#4-分支管理)
5. [合并与变基](#5-合并与变基)
6. [远程协作](#6-远程协作)
7. [历史查看](#7-历史查看)
8. [撤销与回退](#8-撤销与回退)
9. [储藏](#9-储藏)
10. [标签管理](#10-标签管理)
11. [高级操作](#11-高级操作)
12. [工作树](#12-工作树)
13. [子模块](#13-子模块)
14. [配置管理](#14-配置管理)
15. [高效别名与脚本](#15-高效别名与脚本)
16. [命令速查表](#16-命令速查表)
17. [注意事项与陷阱](#17-注意事项与陷阱)

---

## 1. 基础概念

### 1.1 四个区域

```
工作区         暂存区          本地仓库         远程仓库
Working    →   Index     →   Repository    →   Remote
Directory      (Staging)      (.git/)            (origin)

  git add       git commit        git push
              ← git restore --staged
             ← git checkout --
                            ← git reset
                                          ← git fetch / pull
```

| 区域 | 含义 | 操作 |
|------|------|------|
| 工作区 | 实际文件系统 | 编辑代码 |
| 暂存区（Index） | 下次提交的蓝图 | `git add` 暂存；`git restore --staged` 取消暂存 |
| 本地仓库 | 完整的提交历史 | `git commit` 提交；`git reset` 回退 |
| 远程仓库 | 共享的裸仓库 | `git push` 推送；`git fetch` 拉取 |

### 1.2 快照而非差异

Git 将每次提交记录为**完整快照**（snapshot），而非文件差异。未修改的文件不重新存储，而是引用之前的相同 blob。这套机制叫做**内容寻址存储**。

### 1.3 四种对象

```
Blob    —— 文件内容（不含文件名、路径、权限）
Tree    —— 目录结构（文件名 + Blob 映射 + 子 Tree）
Commit  —— 一次提交（Tree + 父 Commit + 作者 + 提交信息 + 时间戳）
Tag     —— 标签（指向 Commit 的引用，可带注释和签名）
```

每个对象通过 SHA-1（新版本支持 SHA-256）哈希值唯一标识。

### 1.4 引用（Refs）

```
refs/heads/main       → 分支指针
refs/tags/v1.0.0      → 标签指针
refs/remotes/origin/main → 远程跟踪分支
HEAD                  → 当前检出的引用（通常是 refs/heads/xxx）
HEAD                  → 或在 detached HEAD 状态下直接指向 commit
```

---

## 2. 仓库操作

### 初始化与克隆

```bash
# 在当前目录创建仓库
git init

# 创建目录并初始化
git init my-project

# 克隆远程仓库
git clone <url>
git clone git@github.com:user/repo.git
git clone https://github.com/user/repo.git

# 浅克隆（只取最新提交，节省时间/空间）
git clone --depth 1 <url>

# 克隆特定分支
git clone -b main --single-branch <url>

# 指定本地目录名
git clone <url> my-folder

# 克隆时禁用自动检出
git clone --no-checkout <url>

# 克隆裸仓库（不含工作区，用于服务器）
git clone --bare <url>
```

### .git 目录结构

```
.git/
├── HEAD                 # 当前检出引用
├── config               # 仓库级配置
├── index                # 暂存区（二进制）
├── objects/             # 对象库（Blob/Tree/Commit/Tag）
│   ├── info/
│   └── pack/            # 打包后的对象文件
├── refs/
│   ├── heads/           # 本地分支
│   ├── tags/            # 标签
│   └── remotes/         # 远程跟踪分支
├── logs/                # reflog
├── hooks/               # 钩子脚本
└── info/
    └── exclude          # 本地排除规则（不提交到仓库）
```

---

## 3. 基本工作流

### 3.1 查看状态

```bash
# 完整状态
git status

# 简洁状态
git status -s
git status --short
# 输出解读：
# ?? 未跟踪
# A  新添加到暂存区
# M  已修改
#  M 工作区修改（未暂存）
# M  暂存区修改
# D  已删除
# R  重命名
```

### 3.2 查看差异

```bash
# 工作区 vs 暂存区
git diff

# 暂存区 vs 最近一次提交
git diff --cached
git diff --staged

# 工作区 vs 最近一次提交（跳过暂存区）
git diff HEAD

# 两个分支之间
git diff main..feature

# 两次提交之间
git diff abc123..def456

# 特定文件
git diff -- path/to/file

# 单词级差异（而非行级）
git diff --word-diff

# 统计变更（只显示文件列表和行数）
git diff --stat
git diff --stat HEAD~5

# 忽略空白
git diff -w
```

### 3.3 暂存与提交

```bash
# 添加文件到暂存区
git add file1 file2
git add .                       # 当前目录及子目录
git add -A                      # 所有文件
git add -u                      # 仅已跟踪文件（不包未跟踪的）

# 交互式暂存（分块选择）
git add -p
# 交互式选项：y=暂存此块 n=跳过 s=拆分更小块 e=手动编辑

# 提交
git commit -m "提交信息"
git commit -m "标题" -m "详细描述"

# 跳过 add，直接提交所有已跟踪文件的变更
git commit -a -m "提交信息"

# 修补最后一次提交
git commit --amend
git commit --amend -m "新提交信息"
# 注意：只在未 push 时使用！

# 提交空提交（触发 CI 等用）
git commit --allow-empty -m "trigger CI"
```

### 3.4 文件操作

```bash
# 删除文件（工作区 + 暂存区）
git rm file.txt
git rm -r dir/                  # 递归删除目录

# 停止跟踪但保留文件
git rm --cached file.txt

# 重命名 / 移动
git mv old.txt new.txt

# 查看哪些文件被跟踪
git ls-files

# 查看被忽略的文件
git status --ignored
git ls-files --others --ignored --exclude-standard
```

### 3.5 恢复文件

```bash
# 丢弃工作区修改（恢复到最后一次 add 或 commit 的状态）
git restore file.txt
git checkout -- file.txt        # 旧写法

# 从暂存区移除（保留工作区修改）
git restore --staged file.txt
git reset file.txt              # 旧写法

# 从特定提交恢复文件
git restore --source=abc123 file.txt
git checkout abc123 -- file.txt # 旧写法

# 丢弃所有工作区修改
git restore .
```

---

## 4. 分支管理

### 4.1 查看分支

```bash
# 本地分支列表
git branch

# 远程分支
git branch -r

# 所有分支
git branch -a

# 含最近提交信息
git branch -v
git branch -vv                  # 含上游跟踪信息

# 已合并到当前分支的分支
git branch --merged

# 未合并的分支
git branch --no-merged

# 含特定提交的分支
git branch --contains abc123
```

### 4.2 创建与切换分支

```bash
# 创建分支
git branch feature-x

# 创建并切换
git checkout -b feature-x
git switch -c feature-x         # 推荐写法（Git 2.23+）

# 基于指定提交创建分支
git checkout -b hotfix abc123
git switch -c hotfix abc123

# 基于远程分支创建本地分支
git checkout -b feature origin/feature
git switch -c feature --track origin/feature

# 切换分支
git checkout main
git switch main                 # 推荐写法

# 切回上一个分支
git checkout -
git switch -

# 切换时丢弃未提交修改
git checkout -f main
```

### 4.3 删除分支

```bash
# 删除本地分支（必须已合并）
git branch -d feature-x

# 强制删除（即使未合并）
git branch -D feature-x

# 删除远程分支
git push origin --delete feature-x
git push origin :feature-x      # 旧写法

# 清理已删除的远程分支在本地留下的跟踪引用
git remote prune origin
git fetch --prune
```

### 4.4 重命名分支

```bash
# 重命名本地分支
git branch -m old-name new-name

# 如果当前就在该分支
git branch -m new-name

# 推送重命名后的分支并删除旧的远程分支
git push origin -u new-name
git push origin --delete old-name
```

---

## 5. 合并与变基

### 5.1 合并（merge）

```bash
# 合并指定分支到当前分支
git merge feature

# Fast-forward 模式（如果可能）
git merge --ff feature

# 禁止 Fast-forward，总是产生合并提交
git merge --no-ff feature

# 压缩合并（将所有提交压成一个）
git merge --squash feature
git commit -m "合并 feature 分支"

# 合并时添加自定义信息
git merge feature -m "Merge feature into main"

# 放弃合并（冲突时）
git merge --abort

# 继续合并（解决冲突后）
git merge --continue
```

### 5.2 变基（rebase）

变基将当前分支的提交"搬到"另一个分支的顶端，产生线性历史。

```bash
# 将当前分支变基到 main 上
git rebase main

# 交互式变基（最强大的历史整理工具）
git rebase -i HEAD~5
git rebase -i abc123

# 交互式 rebase 内的选项：
# pick   保留提交
# reword 保留但编辑提交信息
# edit   暂停以便修改提交
# squash 合并到上一个提交（保留信息）
# fixup  合并到上一个提交（丢弃信息）
# drop   删除此提交
# break  在此处暂停

# 变基时保留合并提交
git rebase -i --rebase-merges HEAD~5

# 放弃变基
git rebase --abort

# 继续变基（解决冲突后）
git rebase --continue

# 跳过当前提交
git rebase --skip
```

### 5.3 合并策略速查

| 场景 | 推荐方式 | 命令 |
|------|----------|------|
| 功能分支合入 main | merge --no-ff | `git merge --no-ff feature` |
| 保持 feature 与 main 同步 | rebase | `git rebase main` |
| PR 前整理提交历史 | rebase -i | `git rebase -i HEAD~n` |
| 实验性合入 | merge --squash | `git merge --squash feature` |

### 5.4 冲突解决

```bash
# 查看冲突文件
git diff --name-only --diff-filter=U

# 查看冲突内容
git diff

# 使用我们的版本
git checkout --ours file.txt

# 使用他们的版本
git checkout --theirs file.txt

# 标记已解决
git add file.txt

# 查看三方合并的冲突标记工具
git mergetool

# 配置合并工具（如 VS Code）
git config --global merge.tool code
git config --global mergetool.code.cmd 'code --wait --merge $REMOTE $LOCAL $BASE $MERGED'
```

---

## 6. 远程协作

### 6.1 远程仓库管理

```bash
# 查看远程仓库
git remote -v

# 添加远程仓库
git remote add origin <url>
git remote add upstream <url>

# 修改 URL
git remote set-url origin <new-url>

# 查看远程仓库详情
git remote show origin

# 删除远程仓库
git remote rm upstream

# 重命名远程仓库
git remote rename origin old-origin
```

### 6.2 获取与拉取

```bash
# 获取远程数据（不合并）
git fetch
git fetch origin
git fetch --all                  # 获取所有远程

# 获取并删除已不存在的远程分支引用
git fetch --prune

# 拉取并合并
git pull
git pull origin main

# 拉取并变基（保持线性历史）
git pull --rebase
git pull --rebase origin main

# 配置默认 pull 策略为 rebase
git config --global pull.rebase true
```

### 6.3 推送

```bash
# 推送当前分支到远程
git push
git push origin main

# 首次推送并设置上游
git push -u origin feature
git push --set-upstream origin feature

# 推送所有分支
git push --all origin

# 推送标签
git push --tags

# 强制推送（覆盖远程历史，危险！）
git push --force
git push --force-with-lease       # 安全版强制推送

# 删除远程分支
git push origin --delete old-branch
```

### 6.4 上游跟踪

```bash
# 设置当前分支的上游
git branch -u origin/main
git branch --set-upstream-to=origin/main

# 查看跟踪关系
git branch -vv

# 取消跟踪
git branch --unset-upstream
```

---

## 7. 历史查看

### 7.1 日志

```bash
# 基本日志
git log
git log --oneline                # 一行一条
git log --oneline --graph        # 含 ASCII 图
git log --oneline --graph --all  # 所有分支
git log -5                       # 最近 5 条
git log --since="2025-01-01"
git log --until="2025-06-01"
git log --author="masakiyuizzz"

# 查看文件历史
git log -p file.txt              # 含 diff
git log --stat                   # 含统计
git log --follow file.txt        # 跟踪重命名历史

# 格式化输出
git log --pretty=format:"%h %s %an %ar"
# %h 短哈希  %s 标题  %an 作者  %ar 相对时间  %ad 日期
git log --pretty=format:"%C(yellow)%h%Creset %s %C(blue)(%an)%Creset" --graph

# 搜索
git log -S "search-term"         # 搜索提交引入/删除的字符串
git log -G "regex"               # 正则搜索
git log --grep="fix"             # 搜索提交信息

# 查看合并提交
git log --merges
git log --no-merges

# 查看某个提交的变更范围
git log abc123..def456
git log main..feature            # feature 有但 main 没有的
```

### 7.2 查看提交与文件

```bash
# 查看某次提交的详情
git show abc123
git show HEAD~3
git show HEAD~3:file.txt

# 查看某次提交的统计
git show --stat abc123

# 查看某次提交中某个文件
git show abc123:path/to/file.txt

# 查看某个文件的指定版本
git show v1.0.0:file.txt

# 简短引用
git show HEAD^           # 第一个父提交
git show HEAD^^          # 祖父提交
git show HEAD~3          # 向上 3 个提交
git show abc123^2        # 合并提交的第二个父提交
```

### 7.3 追溯（blame）

```bash
# 查看每行是谁何时修改的
git blame file.txt

# 忽略空白变更
git blame -w file.txt

# 从指定行开始
git blame -L 10,20 file.txt
git blame -L 100,+50 file.txt    # 100 行起 50 行

# 显示行号和作者
git blame -s file.txt            # 简洁模式

# 显示原始日期
git blame --date=short file.txt

# 忽略某次提交（用于跳过格式化提交）
git blame --ignore-rev abc123 file.txt
```

---

## 8. 撤销与回退

### 8.1 reset —— 重置 HEAD

```bash
# 格式：git reset [--soft | --mixed | --hard] <目标>

# --soft：只移动 HEAD，保留暂存区和工作区
git reset --soft HEAD~1
# 场景：想修改刚刚的提交信息，或把多个提交合并

# --mixed（默认）：移动 HEAD + 重置暂存区，保留工作区
git reset HEAD~1
git reset --mixed HEAD~1
# 场景：取消提交但保留代码修改

# --hard：移动 HEAD + 重置暂存区 + 丢弃工作区修改
git reset --hard HEAD~1
# 场景：彻底放弃最近几次提交（危险！）
```

| reset 模式 | HEAD | 暂存区 | 工作区 | 安全性 |
|------------|------|--------|--------|--------|
| `--soft` | 移动 | 保留 | 保留 | ✅ 最安全 |
| `--mixed` | 移动 | 重置 | 保留 | ✅ 安全 |
| `--hard` | 移动 | 重置 | **丢弃** | ⚠️ 危险 |

### 8.2 revert —— 撤销提交

与 reset 不同，revert 创建**新的提交**来撤销指定提交，不会改写历史。

```bash
# 撤销某次提交
git revert abc123

# 撤销但不自动提交（可合并多个 revert）
git revert --no-commit abc123
git revert --no-commit def456
git commit -m "撤销两处修改"

# 撤销一系列提交
git revert abc123..def456

# 撤销合并提交（需要指定保留哪个父提交）
git revert -m 1 abc123
# -m 1 表示保留第一个父提交（通常是目标分支）
```

### 8.3 checkout / restore —— 恢复文件

```bash
# 丢弃工作区修改
git restore file.txt
git checkout -- file.txt         # 旧写法

# 取消暂存（从暂存区移出但保留工作区修改）
git restore --staged file.txt
git reset HEAD file.txt          # 旧写法

# 从历史版本恢复文件
git restore --source=abc123 file.txt

# 恢复整个目录
git restore .
git clean -fd                    # 同时删除未跟踪文件
```

### 8.4 clean —— 清理未跟踪文件

```bash
# 预览将删除的文件
git clean -n
git clean --dry-run

# 删除未跟踪文件
git clean -f

# 删除未跟踪文件和目录
git clean -fd

# 同时删除 .gitignore 忽略的文件
git clean -fdx
```

---

## 9. 储藏

Stash 将当前工作区和暂存区的修改暂存到栈中，以便快速切换上下文。

```bash
# 储藏当前修改
git stash
git stash push

# 储藏时添加描述
git stash push -m "WIP: refactor auth module"

# 储藏所有（含未跟踪文件）
git stash push -u
git stash push --include-untracked

# 查看储藏列表
git stash list

# 查看某个储藏的内容
git stash show
git stash show -p
git stash show stash@{2} -p

# 恢复最近储藏（保留 stash）
git stash apply
git stash apply stash@{2}

# 恢复最近储藏（删除 stash）
git stash pop
git stash pop stash@{2}

# 应用 stash 到指定分支
git stash branch new-branch stash@{1}

# 丢弃某个储藏
git stash drop stash@{0}

# 清空所有储藏
git stash clear

# 只储藏部分文件
git stash push -p             # 交互式选择
```

---

## 10. 标签管理

### 轻量标签 vs 注释标签

```bash
# 轻量标签（只是指向提交的指针）
git tag v1.0.0

# 注释标签（含信息 + 作者 + 日期，推荐）
git tag -a v1.0.0 -m "正式发布 v1.0.0"
```

### 标签操作

```bash
# 列出标签
git tag
git tag -l "v1.*"               # 通配符过滤

# 给历史提交打标签
git tag -a v0.9.0 abc123 -m "回溯标签"

# 查看标签详情
git show v1.0.0

# 推送标签
git push origin v1.0.0          # 推送单个
git push --tags                 # 推送所有
git push origin --follow-tags   # 只推送注释标签

# 删除本地标签
git tag -d v1.0.0

# 删除远程标签
git push origin --delete v1.0.0
git push origin :refs/tags/v1.0.0

# 检出标签（进入 detached HEAD 状态）
git checkout v1.0.0

# 基于标签创建分支
git checkout -b release-1.0 v1.0.0
```

---

## 11. 高级操作

### 11.1 Cherry-pick —— 挑选提交

```bash
# 将指定提交应用到当前分支
git cherry-pick abc123

# 挑选多个提交
git cherry-pick abc123 def456

# 挑选一系列
git cherry-pick abc123..def456  # 不含 abc123
git cherry-pick abc123^..def456 # 含 abc123

# 只应用变更不自动提交
git cherry-pick --no-commit abc123

# 遇到冲突时中止
git cherry-pick --abort
git cherry-pick --continue      # 解决冲突后继续
```

### 11.2 Bisect —— 二分查找 Bug

```bash
# 开始二分查找
git bisect start

# 标记当前版本有问题
git bisect bad
# 或指定坏的提交
git bisect bad HEAD

# 标记已知好的版本
git bisect good v1.0.0
# 或
git bisect good abc123

# Git 会自动检出中间版本，测试后标记
git bisect good    # 这个版本没问题
git bisect bad     # 这个版本有问题

# 结束二分查找
git bisect reset

# 自动化二分查找（提供测试脚本）
git bisect start HEAD v1.0.0
git bisect run npm test
```

### 11.3 Reflog —— 找回"丢失"的提交

```bash
# 查看 HEAD 变化历史
git reflog
git reflog --date=iso

# 查看特定分支的 reflog
git reflog show main

# 恢复到 reflog 中的某个状态
git reset --hard HEAD@{3}
git checkout HEAD@{5}
git branch recovered-branch HEAD@{2}
```

Reflog 记录了本地所有 HEAD 和分支引用的变化，包括被 reset/rebase 丢弃的提交。**默认保留 90 天**。

### 11.4 范围选择

```bash
# 双点
git log main..feature     # feature 有但 main 没有的提交
git diff main..feature

# 三点（两边的差异，不包含共同祖先）
git log main...feature    # 两分支各自的独有提交
git diff main...feature

# 排除当前提交
git log ^abc123 def456
git log def456 --not abc123

# 查看某个文件在每次提交中的版本
git log -p -- file.txt
```

### 11.5 修补历史（交互式 rebase 高级）

```bash
# 修改倒数第 3 个提交的信息
git rebase -i HEAD~3
# 将对应行从 pick 改为 reword

# 拆分一个提交为多个
git rebase -i HEAD~3
# 将对应行从 pick 改为 edit
# rebase 暂停后：
git reset HEAD^          # 取消提交但保留修改
git add -p               # 按块暂存
git commit -m "第一部分"
git add ...
git commit -m "第二部分"
git rebase --continue

# 删除某个提交
git rebase -i HEAD~5
# 删除对应行，或改为 drop

# 重新排序提交
git rebase -i HEAD~5
# 调整行顺序，删掉无关行
```

---

## 12. 工作树

Worktree 允许同时检出多个分支到不同目录，无需 clone 多个仓库。

```bash
# 添加工作树（自动创建同名的分支）
git worktree add ../hotfix

# 在已有分支上创建工作树
git worktree add ../feature feature-branch

# 基于某次提交创建临时工作树
git worktree add --detach ../experiment abc123

# 列出所有工作树
git worktree list

# 锁定工作树（防止被 prune 清理）
git worktree lock ../feature --reason "for release audit"

# 解锁
git worktree unlock ../feature

# 移动工作树
git worktree move ../feature ../new-path

# 删除工作树
git worktree remove ../feature
git worktree remove -f ../feature  # 强制删除（即使有修改）

# 清理已物理删除的工作树的元数据
git worktree prune
git worktree prune -n              # 预览
```

**典型场景**：
- 同时开发两个分支，无需来回 stash/switch
- CI 中在不同分支上并行运行构建
- 在另一个分支上临时修复 bug，不中断当前工作

---

## 13. 子模块

### 基本操作

```bash
# 添加子模块
git submodule add <url> path/to/submodule
git submodule add -b main <url> path/to/submodule

# 克隆含子模块的仓库
git clone --recurse-submodules <url>
# 或者分步：
git clone <url>
cd repo
git submodule init
git submodule update

# 更新子模块到远程最新
git submodule update --remote

# 递归更新所有子模块
git submodule update --init --recursive

# 查看子模块状态
git submodule status
git submodule status --recursive

# 进入子模块操作
cd path/to/submodule
# 正常 git 操作，然后回到父仓库 commit 子模块的版本变更

# 删除子模块
git submodule deinit path/to/submodule
git rm path/to/submodule
git commit -m "删除子模块"
# 或简写：
git rm path/to/submodule
git commit -m "删除子模块"
```

### Submodule vs Subtree

| 特性 | Submodule | Subtree |
|------|-----------|---------|
| 原理 | 引用外部仓库的特定 commit | 将外部代码复制到仓库中 |
| 独立性 | 需要单独 clone/update | 直接包含代码 |
| 适合场景 | 多个项目共享的库 | 希望完全控制代码 |
| 协作成本 | 较高（需了解子模块） | 较低（像普通目录） |

---

## 14. 配置管理

### 14.1 配置文件层级

优先级从高到低：

| 层级 | 路径 | 作用域 |
|------|------|--------|
| 命令行 `-c` | - | 单次命令 |
| 仓库级 | `.git/config` | 当前仓库 |
| 用户级 | `~/.gitconfig` | 当前用户所有仓库 |
| 系统级 | `/opt/homebrew/etc/gitconfig` | 本机所有用户 |

```bash
# 查看配置
git config --list
git config --list --show-origin   # 显示来源文件

# 查看特定配置
git config user.name
git config user.email

# 设置配置
git config user.name "Your Name"            # 仓库级
git config --global user.name "Your Name"   # 用户级
git config --system core.editor vim         # 系统级

# 编辑配置文件
git config --global --edit

# 删除配置
git config --unset user.name
```

### 14.2 推荐配置

```bash
# 用户信息
git config --global user.name "Your Name"
git config --global user.email "you@example.com"

# 默认分支名
git config --global init.defaultBranch main

# 合并工具
git config --global merge.tool code
git config --global mergetool.code.cmd 'code --wait --merge $REMOTE $LOCAL $BASE $MERGED'

# diff 工具
git config --global diff.tool code
git config --global difftool.code.cmd 'code --wait --diff $LOCAL $REMOTE'

# 编辑器
git config --global core.editor "code --wait"

# pull 策略（推荐 rebase）
git config --global pull.rebase true

# 自动修剪远程分支
git config --global fetch.prune true

# 忽略大小写（macOS 默认）
git config core.ignorecase true

# 自动设置上游（push 默认行为）
git config --global push.default simple

# 使用颜色
git config --global color.ui auto
```

### 14.3 本机配置

```bash
# 本机当前 Git 2.51.1 配置
user.name=masakiyuizzz
user.email=234709575+masakiyuizzz@users.noreply.github.com
credential.helper=osxkeychain
http.postbuffer=1048576000    # 1GB（应对大文件推送）
http.version=HTTP/1.1
core.compression=9            # 最高压缩率
safe.directory=*              # 信任所有目录
```

### 14.4 .gitignore

```bash
# 全局 gitignore
git config --global core.excludesfile ~/.gitignore_global

# 常用忽略规则
cat >> .gitignore << 'EOF'
# 依赖
node_modules/
.pnpm-store/

# 构建产物
dist/
build/
*.o
*.class

# 操作系统
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo

# 环境变量
.env
.env.local

# 日志
*.log
logs/

# 缓存
.cache/
__pycache__/
*.pyc
EOF
```

---

## 15. 高效别名与脚本

### 15.1 推荐别名

```bash
# 加在 ~/.gitconfig 的 [alias] 段落

[alias]
  # 美观日志
  lg = log --oneline --graph --all
  lga = log --oneline --graph --all --decorate
  lg1 = log --graph --pretty=format:'%C(yellow)%h%Creset %s %C(blue)(%an, %ar)%Creset' --all
  
  # 状态
  st = status -s
  co = checkout
  sw = switch
  br = branch
  ci = commit
  cp = cherry-pick
  rb = rebase
  
  # 差异
  df = diff
  dfs = diff --staged
  dft = difftool
  
  # 快速操作
  amend = commit --amend --no-edit
  unstage = reset HEAD --
  undo = reset HEAD~1
  last = log -1 HEAD
  who = shortlog -sn
  
  # 文件历史
  fl = log --follow -p --
  
  # 远程
  ra = remote add
  rr = remote rm
  rv = remote -v
  
  # 清理
  clean-dry = clean -fdn
  clean-do = clean -fd
```

### 15.2 Bash/Zsh 函数

```bash
# 添加到 ~/.zshrc

# 快速查看某个文件的每次提交中的版本
glogf() { git log --oneline --follow -p -- "$1"; }

# 在所有提交历史中搜索某个字符串（不限于当前代码）
gsearch() { git log -S "$1" --oneline; }

# 快速初始化仓库并推送到 GitHub
ginit() {
  git init
  git add -A
  git commit -m "Initial commit"
  git branch -M main
  git remote add origin "git@github.com:$1/$2.git"
  git push -u origin main
}
# 用法：ginit username repo-name

# 查看当前分支名
gcb() { git branch --show-current; }

# 删除所有已合并的功能分支
gclean() {
  git branch --merged | grep -v "\*\|main\|master\|develop" | xargs -n 1 git branch -d
}

# rebase 时自动以 main 为目标
grbm() { git rebase main; }

# 重置当前分支到与 main 同步
greset() {
  git checkout main
  git pull
  git checkout -
  git rebase main
}
```

---

## 16. 命令速查表

### 仓库操作

| 命令 | 说明 |
|------|------|
| `git init` | 初始化仓库 |
| `git clone <url>` | 克隆仓库 |
| `git clone --depth 1 <url>` | 浅克隆 |

### 基本工作流

| 命令 | 说明 |
|------|------|
| `git status` / `git status -s` | 查看状态 |
| `git diff` / `git diff --staged` | 查看差异 |
| `git add <file>` / `git add -p` | 暂存 |
| `git commit -m "msg"` | 提交 |
| `git commit --amend` | 修补上次提交 |
| `git restore <file>` | 丢弃工作区修改 |
| `git restore --staged <file>` | 取消暂存 |
| `git rm <file>` / `git rm --cached <file>` | 删除 / 停止跟踪 |
| `git mv <old> <new>` | 重命名 |

### 分支

| 命令 | 说明 |
|------|------|
| `git branch` / `-r` / `-a` / `-vv` | 查看分支 |
| `git switch -c <name>` | 创建并切换 |
| `git switch <name>` | 切换分支 |
| `git branch -d/-D <name>` | 删除分支 |
| `git branch -m <new>` | 重命名 |
| `git merge <name>` | 合并 |
| `git merge --no-ff <name>` | 非快进合并 |
| `git merge --squash <name>` | 压缩合并 |
| `git rebase <name>` | 变基 |
| `git rebase -i HEAD~n` | 交互式变基 |
| `git merge/rebase --abort` | 放弃 |
| `git merge/rebase --continue` | 继续 |

### 远程

| 命令 | 说明 |
|------|------|
| `git remote -v` / `add` / `rm` / `set-url` | 管理远程 |
| `git fetch` / `git fetch --prune` | 获取 |
| `git pull` / `git pull --rebase` | 拉取并合并/变基 |
| `git push` / `git push -u origin <b>` | 推送 |
| `git push --force-with-lease` | 安全强制推送 |
| `git push --tags` | 推送标签 |

### 历史

| 命令 | 说明 |
|------|------|
| `git log --oneline --graph --all` | 美观日志 |
| `git log -p <file>` | 文件历史 |
| `git log --follow <file>` | 跟踪重命名 |
| `git log -S "text"` | 搜索代码变更 |
| `git show <commit>` | 查看提交 |
| `git blame <file>` | 追溯每行 |
| `git reflog` | 引用日志 |

### 撤销

| 命令 | 说明 |
|------|------|
| `git reset --soft HEAD~1` | 撤销提交（保留修改） |
| `git reset --hard HEAD~1` | 彻底丢弃 |
| `git revert <commit>` | 安全撤销 |
| `git clean -fdn` / `git clean -fd` | 清理未跟踪文件 |
| `git stash` / `git stash pop` | 储藏 / 恢复 |

### 高级

| 命令 | 说明 |
|------|------|
| `git cherry-pick <commit>` | 挑选提交 |
| `git bisect start/good/bad` | 二分查找 |
| `git worktree add <path>` | 添加工作树 |
| `git submodule add <url>` | 添加子模块 |
| `git tag -a v1.0 -m "msg"` | 打标 |

---

## 17. 注意事项与陷阱

1. **commit --amend 不要对已 push 的提交使用**：`--amend` 会改写 commit hash，这会导致其他人的仓库冲突。只用于本地未推送的提交。

2. **`push --force` 极度危险**：会覆盖远程历史，团队成员丢失提交。用 `--force-with-lease` 代替，至少会检查远程是否有其他人推送过。

3. **已 push 的提交不要 rebase**：rebase 同样会改写 hash，会让协作者的仓库混乱。rebase 应只用于本地分支或个人 feature 分支。

4. **`reset --hard` 不可逆**：除非在 reflog 中找到。reset 前确认工作区已提交或 stash。

5. **合并冲突不要慌**：Git 不会丢失任何一方的修改。冲突标记清晰显示了双方差异。用 `--abort` 可以随时放弃。

6. **macOS 文件名大小写**：macOS 文件系统默认不区分大小写但保留大小写。`git mv` 用于重命名大小写（`git mv File.txt file.txt`），否则 Git 可能不感知。

7. **大文件不要直接进仓库**：用 Git LFS 管理二进制大文件（图片、视频、模型等）。见 `git-lfs.md`。

8. **秘密信息一经提交永留历史**：即使后续删除文件，git 历史中仍然存在。泄露密钥后需立即更换 + 用 `git-filter-repo` 清理历史。见 `git-filter-repo.md`。

9. **`git add .` 可能暂存不该提交的文件**：永远先 `git status` 确认，或用 `.gitignore` 严格过滤。

10. **detached HEAD 状态下提交不会保存到任何分支**：应立即 `git switch -c new-branch` 或 `git cherry-pick` 迁移提交。

11. **`git pull` 可能在冲突中产生难看的合并提交**：建议配置 `git config --global pull.rebase true` 或用 `git pull --rebase`。

12. **子模块需要单独更新**：clone 父仓库后不会自动拉取子模块内容，需 `git submodule update --init --recursive`。

13. **reflog 有时限**：默认仅保留 90 天。超期的"丢失"提交可能被 GC 回收。如有重要工作，及时从 reflog 恢复到分支。

14. **CI/CD 中的 clone 优化**：用 `--depth 1` 浅克隆节省时间，或用 `--filter=blob:none` 延迟获取文件内容。但某些操作（如 `git log -S`）在浅仓库中无法工作。
