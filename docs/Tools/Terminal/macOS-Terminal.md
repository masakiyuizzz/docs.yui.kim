# macOS Terminal 命令收录
> 本文档收录较为完整的命令，以后可能会单独出详细分类文档
>
> 当前版本：`0.0.1` | 修改日期：`2026-05-18` | 作者：`MasakiYui`
## 目录
- [macOS Terminal 命令收录](#macos-terminal-命令收录)
  - [目录](#目录)
  - [文件与目录操作](#文件与目录操作)
    - [`ls` - 列出目录内容](#ls---列出目录内容)
    - [`cd` - 切换目录](#cd---切换目录)
    - [`pwd` - 显示当前工作目录](#pwd---显示当前工作目录)
    - [`mkdir` - 创建目录](#mkdir---创建目录)
    - [`touch` - 创建文件或更新时间戳](#touch---创建文件或更新时间戳)
  - [文本处理](#文本处理)
  - [系统信息](#系统信息)
  - [用户与权限](#用户与权限)
  - [网络工具](#网络工具)
  - [`Shell` 环境配置](#shell-环境配置)
  - [磁盘与存储管理](#磁盘与存储管理)
  - [实用技巧](#实用技巧)
## 文件与目录操作
### `ls` - 列出目录内容
**绝大部分参数可以叠加使用**
```bash
ls                    # 列出当前目录文件
ls -l                 # 长格式显示（权限、大小、日期）
ls -la                # 显示隐藏文件（以`.`开头）
ls -lh                # 人类可读的文件大小（KB、MB）
ls -lt                # 按修改时间排序（mtime，最新在前）
ls -lc                # 状态改变时间（ctime）
ls -lu                # 访问时间（atime）
ls -lS                # 按文件大小排序（最大在前）
ls -R                 # 递归列出子目录
ls -G                 # 彩色输出（macOS 默认启用）
ls -1                 # 每行只显示一个文件名
ls -i                 # 显示文件的 inode 号（唯一标识符）
ls -d */              # 只列出所有子目录（文件夹）
ls -d "单个目录"/      # 如有特殊字符或空格，需要使用引号括起来
```
**常用组合（前提安装`tree`命令，最好安装`lsd`美化插件并设置覆盖`ls`）**
```bash
ls -lahiS --tree --depth=3

# `-lahiS`是最常用的形式
# `--tree`参数可以递归列出子目录
# `--depth=3`参数可以限制递归深度
```
**输出解读：**
```bash
# `lsd`和原生`ls`有很大区别，这里以`lsd`为例

39990889 drwxr-xr-x fumimutsumi staff 160 B  Mon May 18 13:52:06 2026  .
40059309 .rw-r--r-- fumimutsumi staff 148 MB Mon May 18 13:51:34 2026 ├──  Animenz_201.mp3
40058958 .rw-r--r-- fumimutsumi staff  12 MB Mon May 18 13:49:52 2026 ├──  罪恶王冠组曲.mp3
39999529 .rw-r--r-- fumimutsumi staff 6.0 KB Mon May 18 13:52:05 2026 └──  .DS_Store
    │    ││││││││││      │        │      │             │                │       │
    │    │└─权限         用户      组     大小         修改时间         `--tree`  文件名
    │    └─类型：d=目录, .=文件, l=符号链接                             展示的结构
 inode 号                                                         以及`lsd`的图标

# 如需显示链接数，可以使用`\ls -l` `/bin/ls -l`等，绕过别名或者直接调用原生命令
```
**更多请了解：**
- [权限](../Terminal-Others.md#权限)
- [inode](../Terminal-Others.md#inode)
### `cd` - 切换目录
```bash
cd /path/to/dir       # 绝对路径
cd ./path             # 相对路径
cd ~                  # 回到用户主目录
cd                    # 等同 `cd ~`
cd ../                # 返回上一级目录
cd ../../             # 返回上两级目录
cd -                  # 切换到上一次所在目录
```
### `pwd` - 显示当前工作目录
```bash
pwd                   # 输出完整路径
pwd -P                # 显示物理路径（解析符号链接）

# 符号链接通过记录 `路径字符串` 指向目标文件或目录
```
**举例：列出根目录下的符号链接**
```bash
cd / && ls -alh | grep '^l'
➜ ...
lrwxr-xr-x root wheel  11 B  Wed Feb 25 11:41:32 2026  var ⇒ private/var
```
**分别使用`pwd`和`pwd -P`输出当前工作目录**
```bash
cd /var && pwd
➜ /var                 # 符号链接所在目录
--------------
cd /var && pwd -P
➜ /private/var         # 实际文件所在目录
```
### `mkdir` - 创建目录
```bash
mkdir dir                        # 创建单个目录
mkdir dir1 dir2 dir3             # 创建多个目录
mkdir -p Desktop/temp/test/dir1  # 递归创建（父目录不存在则自动创建）
mkdir -m 755 my_dir              # 创建时指定权限
```
**权限请了解：**
- [权限](../Terminal-Others.md#权限)
### `touch` - 创建文件或更新时间戳
## 文本处理
## 系统信息
## 用户与权限
## 网络工具
## `Shell` 环境配置
## 磁盘与存储管理
## 实用技巧

