# Terminal Others 命令收录-补充说明
> 本文档补充`macOS Terminal`未涉及到的额外说明
>
> 当前版本：`0.0.1` | 修改日期：`2026-05-18` | 作者：`MasakiYui`
## 目录
- [Terminal Others 命令收录-补充说明](#terminal-others-命令收录-补充说明)
  - [目录](#目录)
  - [权限](#权限)
  - [inode](#inode)
  - [时间戳](#时间戳)
## 权限
**示例：**
```bash
.rw-r--r-- fumimutsumi staff 148 MB Mon May 18 13:51:34 2026  Animenz_201.mp3
 │││││││││
drwxr-xr-x fumimutsumi staff 160 B  Mon May 18 13:52:06 2026  .
 │││││││││      │        │
 ││││││rwx     用户      组
 │││rwx
 rwx
```
```bash
权限顺序：先用户权限（User/Owner），再组权限（Group），最后其他用户权限（Others）
权重：r(4) w(2) x(1) -(0)
r = read    (读取)  → 能看内容（能列出目录里的文件（ls））
w = write   (写入)  → 能修改/删除（能在目录里创建/删除文件）
x = execute (执行)  → 文件：能运行  目录：能进入（能进入目录（cd））
```
```bash
rwxr-xr-x（755权限） 用户：读取、写入、执行权限 组：读取、执行权限 其他用户：读取、执行权限
...
# 文件分享后权限会被剥离丢失，即700权限的文件分享给网盘或者微信后，别人下载会默认分配系统的权限
# 比如755，不会受到自己电脑700权限设置的影响
```
**相关示例：**
```bash
mkdir -m 700 new_dir             # 创建隐私目录，只有用户可以访问（权限700）
touch password.docs              # 创建密码文件
chmod 700 password.docs          # 设置密码文件权限为700（只有用户可以访问）

chmod g=rx password.docs         # 设置组权限为读取、执行权限（权限750）
chmod o+r password.docs          # 为其他用户添加读取权限（权限754）
chmod u-w password.docs          # 移除用户写入权限（权限554）
chmod a=rwx password.docs        # 设置所有人权限为读取、写入、执行权限（权限777）
chmod go=- password.docs         # 设置组和其他用户权限为空（权限700）
```
## inode
**inode 存储文件的元数据：权限、所有者、大小、时间戳、数据块位置（内容实际存储的地方）**

*文件名只是指向 inode 的「标签」，真正的「灵魂」是 inode*
```bash
40059309 .rw-r--r-- fumimutsumi staff 148 MB Mon May 18 13:51:34 2026  Animenz_201.mp3
40058958 .rw-r--r-- fumimutsumi staff  12 MB Mon May 18 13:49:52 2026  罪恶王冠组曲.mp3
    │
  inode

# inode 可以指向多个文件名，此时表示硬链接 `ln`，链接数表示指向 inode 的文件名数量
```
**示例：**
```bash
\ls -lhi Animenz_201.mp3
➜ 40058958 -rw-r--r--@ 1 fumimutsumi  staff    12M May 18 13:49 罪恶王冠组曲.mp3

ln Animenz_201.mp3 Animenz_201_2.mp3 && \ls -lhi Animenz_201.mp3
➜ 40058958 -rw-r--r--@ 2 fumimutsumi  staff    12M May 18 13:49 罪恶王冠组曲.mp3
```
## 时间戳