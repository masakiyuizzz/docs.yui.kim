# exiftool —— 文件元数据读写利器

> 跨平台命令行工具（Perl），支持 **300+** 文件格式的元数据读取、写入、删除、复制。
> 由 Phil Harvey 开发。支持 EXIF / IPTC / XMP / GPS / ICC / 缩略图等所有主流元数据标准。
> 版本：12.x+（本机 Homebrew 安装）
> 官网：[exiftool.org](https://exiftool.org)

---

## 目录

1. [安装](#1-安装)
2. [基础读取](#2-基础读取)
3. [标签组与选择器](#3-标签组与选择器)
4. [写入元数据](#4-写入元数据)
5. [删除元数据](#5-删除元数据)
6. [复制元数据（tagsFromFile）](#6-复制元数据tagsfromfile)
7. [按元数据重命名文件](#7-按元数据重命名文件)
8. [GPS / 地理标签](#8-gps--地理标签)
9. [批量处理](#9-批量处理)
10. [输出格式化](#10-输出格式化)
11. [提取嵌入资源](#11-提取嵌入资源)
12. [管道与网络](#12-管道与网络)
13. [实战脚本示例](#13-实战脚本示例)
14. [常用标签速查表](#14-常用标签速查表)
15. [完整选项速查表](#15-完整选项速查表)
16. [注意事项与陷阱](#16-注意事项与陷阱)

---

## 1. 安装

```bash
# macOS Homebrew（本机安装方式）
brew install exiftool

# Debian/Ubuntu
sudo apt install libimage-exiftool-perl

# Fedora
sudo dnf install perl-Image-ExifTool

# 直接下载（跨平台单文件 Perl 脚本）
wget https://exiftool.org/Image-ExifTool-12.xx.tar.gz
tar xzf Image-ExifTool-12.xx.tar.gz
cd Image-ExifTool-12.xx
perl Makefile.PL && make && sudo make install
```

---

## 2. 基础读取

```bash
# 查看单文件所有元数据
exiftool photo.jpg

# 查看多个文件
exiftool photo1.jpg photo2.jpg photo3.jpg

# 查看目录下所有文件
exiftool /path/to/directory

# 列出支持的标签种类
exiftool -list           # 所有标签名
exiftool -listg          # 所有标签组
exiftool -listw          # 所有可写标签
exiftool -listf          # 所有支持的文件类型

# 只看元数据概要（简洁）
exiftool -common photo.jpg

# 只看特定标签
exiftool -Make -Model -DateTimeOriginal -ExposureTime -ISO -FNumber photo.jpg
exiftool -FileName -FileSize -ImageWidth -ImageHeight photo.jpg
```

---

## 3. 标签组与选择器

exiftool 标签按"组"分类：`EXIF` `XMP` `IPTC` `GPS` `MakerNotes` `Composite` 等。

```bash
# 按组名提取
exiftool -EXIF:all photo.jpg          # 所有 EXIF 标签
exiftool -XMP:all photo.jpg           # 所有 XMP 标签
exiftool -IPTC:all photo.jpg          # 所有 IPTC 标签
exiftool -GPS:all photo.jpg           # 所有 GPS 标签
exiftool -xmp-dc:all photo.jpg        # XMP Dublin Core

# 分组显示（层级结构）
exiftool -g photo.jpg                 # 按 group 0（大类）
exiftool -g1 photo.jpg                # 按 group 1（子类）
exiftool -G photo.jpg                 # 每行显示 group 名
exiftool -G1 photo.jpg                # group 1 名

# 列出所有重复/未知标签
exiftool -a -u -g1 photo.jpg

# 通配符匹配标签名
exiftool -"*date*" photo.jpg          # 所有含 "date" 的标签
exiftool -"*resolution*" photo.jpg    # 含 "resolution" 的标签
exiftool -"*gps*" photo.jpg           # 含 "gps" 的标签

# 排除特定标签
exiftool --DateTimeOriginal --CreateDate photo.jpg
```

---

## 4. 写入元数据

**重要安全特性**：默认写入会保留原始文件（追加 `_original` 后缀），改完后确认无误再删除原文件。

```bash
# 写入 Artist
exiftool -Artist="John Doe" photo.jpg
# 生成 photo.jpg（新） + photo.jpg_original（备份）

# 写入 Copyright
exiftool -Copyright="© 2025 John Doe" photo.jpg

# 写入描述
exiftool -Description="Sunset at the beach" photo.jpg

# 写入多个标签
exiftool -Artist="John" -Copyright="2025" -Description="Hike" photo.jpg

# 写入所有 JPEG 文件
exiftool -Artist="John" *.jpg

# 写入整个目录
exiftool -Artist="John" /path/to/photos/

# 追加 IPTC 关键词（+=追加而非覆盖）
exiftool -Keywords+="sunset" photo.jpg
exiftool -Keywords+="beach" photo.jpg
# 结果：Keywords: sunset, beach

# 删除特定关键词（-=）
exiftool -Keywords-="beach" photo.jpg

# 覆盖写入不创建备份
exiftool -overwrite_original -Artist="John" photo.jpg

# 覆盖原文件并保留备份改名为 .bak
exiftool -overwrite_original_in_place -Artist="John" photo.jpg
```

**带有特殊字符的值**：包含空格或特殊字符时用引号包围。

---

## 5. 删除元数据

```bash
# 删除单个标签
exiftool -Artist= photo.jpg

# 删除所有 EXIF 元数据
exiftool -EXIF:all= photo.jpg

# 删除所有 XMP 元数据
exiftool -XMP:all= photo.jpg

# 删除所有 GPS 信息（隐私保护常用）
exiftool -gps:all= photo.jpg

# 彻底清除所有元数据（保留图像本身）
exiftool -all= -overwrite_original photo.jpg

# 删除缩略图
exiftool -ThumbnailImage= photo.jpg
```

---

## 6. 复制元数据（tagsFromFile）

从一个文件复制元数据到其他文件，常用于"恢复处理后的图片的原始元数据"。

```bash
# 从 source.jpg 复制所有可写标签到 dest.jpg
exiftool -tagsFromFile source.jpg dest.jpg

# 复制所有元数据到多个目标文件
exiftool -tagsFromFile source.jpg -all:all target1.jpg target2.jpg

# 只复制 GPS 信息
exiftool -tagsFromFile source.jpg -GPS:all target.jpg

# 复制全部，除了某些标签
exiftool -tagsFromFile source.jpg -all:all --ThumbnailImage target.jpg

# 从一个文件复制到目录中所有 JPEG
exiftool -tagsFromFile source.jpg -all:all /path/to/photos/
# 注意：会覆盖每个目标文件的元数据

# 跨格式复制（如 RAW → JPEG）
exiftool -tagsFromFile original.cr2 -all:all processed.jpg
```

---

## 7. 按元数据重命名文件

```bash
# 按日期时间重命名
exiftool "-FileName<DateTimeOriginal" -d "%Y%m%d_%H%M%S%%-c.%%e" *.jpg
# 结果：20250115_143025.jpg

# 带相机型号
exiftool "-FileName<${DateTimeOriginal}_${Model}" -d "%Y%m%d_%H%M%S" *.jpg

# 更完整的示例（日期+型号+序号）
exiftool "-FileName<${DateTimeOriginal}_${Make}_${Model}" \
    -d "%Y-%m-%d_%H%M%S%%-c.%%e" *.jpg
# 结果：2025-01-15_143025_Canon_EOS R5.jpg

# 按拍摄日期创建目录
exiftool "-Directory<DateTimeOriginal" -d "%Y/%Y-%m-%d" *.jpg
# 结果：./2025/2025-01-15/photo.jpg

# 自定义重命名模板
exiftool "-FileName<IMG_${DateTimeOriginal}_${ImageSize}" \
    -d "%Y%m%d_%H%M%S" -ext jpg .

# 递归子目录
exiftool -r "-FileName<DateTimeOriginal" -d "%Y%m%d_%H%M%S%%-c.%%e" /photos/
```

**重命名格式符**：

| 符号 | 含义 |
|------|------|
| `%f` | 原文件名（不含扩展） |
| `%e` | 原扩展名（不含点） |
| `%%e` | 扩展名（含点） |
| `%d` | 目录路径 |
| `%%-c` | 遇到重复时追加编号（-1, -2 …） |
| `${TAG}` | 插入元数据标签值 |
| `%Y` `%m` `%d` `%H` `%M` `%S` | strftime 日期格式符 |

---

## 8. GPS / 地理标签

```bash
# 查看 GPS 信息
exiftool -GPS:all photo.jpg
exiftool -GPSLatitude -GPSLongitude -GPSAltitude photo.jpg

# 写入 GPS 坐标
exiftool -GPSLatitude=35.6762 -GPSLongitude=139.6503 photo.jpg
exiftool -GPSLatitude="35 deg 40' 34.32\" N" \
         -GPSLongitude="139 deg 39' 1.08\" E" photo.jpg

# 写入海拔
exiftool -GPSAltitude=100 photo.jpg

# 用 GPX 轨跡文件批量写入地理标签（自动匹配时间）
exiftool -geotag track.gpx *.jpg
exiftool -geotag track.gpx -r /photos/
# 根据拍摄时间匹配 GPX 中的位置

# 时间偏移（相机时间不准时）
exiftool -geotag track.gpx -geosync=+01:00 *.jpg    # 相机慢 1 小时
exiftool -geotag track.gpx -geosync=-00:30 *.jpg    # 相机快 30 分钟

# 删除 GPS 信息
exiftool -GPS:all= photo.jpg
```

---

## 9. 批量处理

```bash
# 递归处理目录中所有支持的文件
exiftool -r -Artist="John" /photos/

# 递归不包括隐藏目录（. 开头）
exiftool -r /photos/

# 递归包括隐藏目录
exiftool -r. /photos/

# 限定扩展名
exiftool -ext jpg -ext png -Artist="John" /photos/

# 批量处理忽略（-i）特定文件
exiftool -i "*.png" -Artist="John" /photos/

# 只处理最近修改的文件（配合 find）
find . -name "*.jpg" -mtime -7 | xargs exiftool -Artist="John"
```

---

## 10. 输出格式化

```bash
# 简洁模式（只显示值，加标签名）
exiftool -s -DateTimeOriginal -Model photo.jpg

# 无标签名（只显示值）
exiftool -S -DateTimeOriginal photo.jpg

# Tab 分隔输出（适合导入 Excel/数据库）
exiftool -T -FileName -DateTimeOriginal -ISO -FNumber *.jpg > metadata.tsv
exiftool -T -r -FileName -DateTimeOriginal -ISO -FNumber /photos/ > all_metadata.tsv

# CSV 输出
exiftool -csv *.jpg > photos.csv
exiftool -csv -r /photos/ > all_photos.csv

# JSON 输出
exiftool -json photo.jpg
exiftool -json *.jpg > photos.json
exiftool -json -r /photos/ | jq '.'

# 自定义输出格式（-p 打印格式）
exiftool -p '${FileName} | ${DateTimeOriginal} | ${ExposureTime}s f/${FNumber} ISO${ISO}' *.jpg

# 写入文本文件（-w）
exiftool -w .txt photo.jpg          # 生成 photo.txt
exiftool -w %f.txt /photos/         # 每个文件生成对应的 .txt

# HTML 转储
exiftool -htmldump photo.jpg > report.html
```

---

## 11. 提取嵌入资源

```bash
# 提取 JPEG 缩略图
exiftool -b -ThumbnailImage photo.jpg > thumbnail.jpg

# 提取 RAW 内嵌 JPEG 预览
exiftool -b -JpgFromRaw -w _preview.jpg -ext CR2 -r .
# 从 .CR2 提取，保存为 文件名_preview.jpg

# 提取 ICC 色彩配置
exiftool -icc_profile -b -w icc photo.jpg

# 提取 FlashPix 缩略图
exiftool -b -PreviewImage photo.jpg > preview.jpg

# 提取 XMP 数据包
exiftool -xmp -b photo.jpg > metadata.xmp
```

---

## 12. 管道与网络

```bash
# 从 stdin 读取
cat photo.jpg | exiftool -

# 管道写入（stdin → 处理 → stdout）
cat a.jpg | exiftool -iptc:keywords+=fantastic - > b.jpg

# 从网络读取（curl 管道）
curl -s https://example.com/photo.jpg | exiftool -

# 快速模式（只提取基本元数据，适合大文件网络流）
curl -s https://example.com/big.jpg | exiftool -fast -

# 写回原文件 + 管道
cat photo.jpg | exiftool -Artist="John" - -o - > new_photo.jpg
```

---

## 13. 实战脚本示例

### 脚本 1：批量隐私清理（删除所有 GPS + 相机序列号）

```bash
#!/bin/bash
# 文件名：strip_privacy.sh
# 用法：./strip_privacy.sh /photos/ (所有照片去除隐私信息)

DIR="${1:-.}"

echo "处理目录：$DIR"
exiftool -overwrite_original \
    -GPS:all= \
    -SerialNumber= \
    -InternalSerialNumber= \
    -LensSerialNumber= \
    -CameraOwnerName= \
    -r -ext jpg -ext jpeg -ext png -ext tif -ext heic \
    "$DIR"
echo "完成。"
```

### 脚本 2：按拍摄日期整理照片到目录

```bash
#!/bin/bash
# 文件名：organize_by_date.sh
# 用法：./organize_by_date.sh /photos/

DIR="${1:-.}"

exiftool -r \
    "-Directory<DateTimeOriginal" \
    -d "${DIR}/%Y/%Y-%m-%d" \
    -ext jpg -ext jpeg -ext png -ext heic -ext mov -ext mp4 \
    "$DIR"

echo "完成。目录结构已创建。"
```

### 脚本 3：为社交分享批量压缩元数据

```bash
#!/bin/bash
# 文件名：export_for_web.sh
# 保留版权信息但清除敏感 EXIF
# 用法：./export_for_web.sh /raw_photos/ /web_output/

SRC="${1:-.}"
DST="${2:-./web_output}"
mkdir -p "$DST"

# 先复制照片
cp "$SRC"/*.{jpg,jpeg,png} "$DST/" 2>/dev/null

# 批量处理：保留基本标签，删除敏感信息
exiftool -overwrite_original \
    -all= \
    -tagsFromFile @ \
    -DateTimeOriginal \
    -Make -Model \
    -ImageWidth -ImageHeight \
    -Orientation \
    -ColorSpace \
    -Copyright="$(whoami)" \
    -Artist="$(whoami)" \
    -r "$DST"

echo "完成。输出目录：$DST"
```

### 脚本 4：批量添加水印式版权信息

```bash
#!/bin/bash
# 文件名：batch_copyright.sh
# 用法：./batch_copyright.sh "© 2025 Your Name" /photos/

COPYRIGHT="${1:-© $(date +%Y) $(whoami)}"
DIR="${2:-.}"

exiftool -overwrite_original \
    -Copyright="$COPYRIGHT" \
    -Rights="$COPYRIGHT" \
    -Artist="$COPYRIGHT" \
    -r -ext jpg -ext jpeg -ext png \
    "$DIR"

echo "版权信息已写入：$COPYRIGHT"
```

### 脚本 5：从 GPX 文件批量写入 GPS 坐标

```bash
#!/bin/bash
# 文件名：geotag_from_gpx.sh
# 用法：./geotag_from_gpx.sh track.gpx /photos/

GPX="$1"
DIR="${2:-.}"

if [[ ! -f "$GPX" ]]; then
    echo "用法：$0 <gpx文件> <照片目录>"
    exit 1
fi

exiftool -overwrite_original \
    -geotag "$GPX" \
    -geosync=+00:00 \
    -r -ext jpg -ext jpeg -ext png \
    "$DIR"

echo "地理标签写入完成。"
```

### 脚本 6：生成照片目录的 HTML 索引报告

```bash
#!/bin/bash
# 文件名：photo_report.sh
# 用法：./photo_report.sh /photos/ > report.html

DIR="${1:-.}"

cat << 'HEADER'
<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<title>Photo Report</title>
<style>table{border-collapse:collapse}td,th{padding:6px 12px;border:1px solid #ccc}</style>
</head><body><table><tr><th>File</th><th>Date</th><th>Camera</th><th>Settings</th><th>GPS</th></tr>
HEADER

exiftool -r -q -p \
    '<tr><td>$FileName</td><td>$DateTimeOriginal</td><td>${Make} ${Model}</td><td>${ExposureTime}s f/${FNumber} ISO${ISO} (${ImageSize})</td><td>${GPSLatitude}, ${GPSLongitude}</td></tr>' \
    -ext jpg -ext jpeg -ext heic \
    "$DIR"

echo '</table></body></html>'
```

### 脚本 7：批量修正相片时区偏移

```bash
#!/bin/bash
# 文件名：shift_time.sh
# 用法：./shift_time.sh "+01:00" /photos/   (时间 +1 小时)

OFFSET="${1:-+00:00}"
DIR="${2:-.}"

exiftool -overwrite_original \
    "-DateTimeOriginal${OFFSET}" \
    "-CreateDate${OFFSET}" \
    "-ModifyDate${OFFSET}" \
    -r -ext jpg -ext jpeg -ext png \
    "$DIR"

echo "时间偏移 $OFFSET 完成。"
```

### 脚本 8：检查哪些照片缺少 GPS 信息

```bash
#!/bin/bash
# 文件名：find_no_gps.sh
# 用法：./find_no_gps.sh /photos/

DIR="${1:-.}"

echo "缺少 GPS 信息的照片："
exiftool -r -q -p '$Directory/$FileName' \
    -if 'not $GPSLatitude' \
    -ext jpg -ext jpeg -ext png \
    "$DIR"
```

---

## 14. 常用标签速查表

### 文件信息

| 标签 | 含义 |
|------|------|
| `FileName` | 文件名 |
| `FileSize` | 文件大小 |
| `FileType` | 文件类型 |
| `MIMEType` | MIME 类型 |
| `Directory` | 所在目录 |

### EXIF 摄影信息

| 标签 | 含义 |
|------|------|
| `Make` | 相机制造商 |
| `Model` | 相机型号 |
| `DateTimeOriginal` | 拍摄日期时间 |
| `CreateDate` | 创建日期 |
| `ModifyDate` | 修改日期 |
| `ExposureTime` | 曝光时间（快门速度） |
| `FNumber` | 光圈值 |
| `ISO` | ISO 感光度 |
| `FocalLength` | 焦距 |
| `ImageWidth` | 图片宽度 |
| `ImageHeight` | 图片高度 |
| `Orientation` | 旋转方向 |
| `Flash` | 闪光灯状态 |
| `WhiteBalance` | 白平衡 |
| `ExposureProgram` | 曝光模式 |
| `MeteringMode` | 测光模式 |
| `LensModel` | 镜头型号 |
| `ColorSpace` | 色彩空间 |

### 版权/作者

| 标签 | 含义 |
|------|------|
| `Artist` | 作者/摄影师 |
| `Copyright` | 版权声明 |
| `Rights` | XMP 版权 |
| `OwnerName` | 相机所有者 |

### IPTC / XMP

| 标签 | 含义 |
|------|------|
| `Keywords` | 关键词 |
| `Description` | 描述/说明 |
| `Title` | 标题 |
| `Subject` | 主题 |
| `Rating` | 评分 |
| `City` | 城市 |
| `Country` | 国家 |
| `Location` | 拍摄地点 |

### GPS

| 标签 | 含义 |
|------|------|
| `GPSLatitude` | 纬度 |
| `GPSLongitude` | 经度 |
| `GPSAltitude` | 海拔 |
| `GPSDateTime` | GPS 时间 |
| `GPSPosition` | 经纬度合写 |

---

## 15. 完整选项速查表

### 读取/显示

| 选项 | 含义 |
|------|------|
| `-a` | 显示重复标签 |
| `-u` | 显示未知标签 |
| `-g` | 按组排序显示 |
| `-g1` | 按 group 1 层级显示 |
| `-G` | 每行显示 group 名 |
| `-G1` | 每行显示 group 1 名 |
| `-s` | 短格式（显示标签名） |
| `-S` | 超短格式（不显示标签名） |
| `-t` | Tab 分隔输出 |
| `-T` | Tab 分隔（列式） |
| `-csv` | CSV 格式 |
| `-json` | JSON 格式 |
| `-b` | 二进制输出（提取缩略图等） |
| `-x` | XML 格式 |
| `-list` | 列出所有标签名 |
| `-listg` | 列出所有标签组 |
| `-listw` | 列出所有可写标签 |
| `-listf` | 列出支持的文件格式 |
| `-L` | 标签名大小写不敏感 |

### 写入/操作

| 选项 | 含义 |
|------|------|
| `-TAG=VALUE` | 写入标签值 |
| `-TAG+=VALUE` | 追加到列表标签 |
| `-TAG-=VALUE` | 从列表标签删除 |
| `-TAG=` | 删除标签 |
| `-GROUP:all=` | 删除整个组 |
| `-all=` | 删除所有元数据 |
| `-tagsFromFile SRC` | 从源文件复制元数据 |
| `-geotag GPX` | 从 GPX 文件写入 GPS |
| `-overwrite_original` | 不保留 _original 备份 |
| `-overwrite_original_in_place` | 覆盖原文件（不创建临时文件） |
| `-restore_original` | 从备份恢复 |

### 文件处理

| 选项 | 含义 |
|------|------|
| `-r` | 递归处理子目录 |
| `-r.` | 递归包括隐藏目录 |
| `-ext EXT` | 指定扩展名（可重复） |
| `-i PATTERN` | 忽略匹配文件 |
| `-x PATTERN` | 排除匹配文件（同 -i） |
| `-o OUTFILE` | 输出到文件（管道） |
| `-w EXT` | 输出写入文本文件 |
| `-d FORMAT` | strftime 日期格式 |
| `-p FORMAT` | 自定义打印格式 |
| `-if COND` | 条件过滤（Perl 表达式） |

### 性能

| 选项 | 含义 |
|------|------|
| `-fast` | 快速模式（不读取 MakerNotes） |
| `-fast1` | 更快 |
| `-fast2` | 最快 |
| `-P` | 保留原有文件修改日期 |
| `-q` | 安静模式 |

---

## 16. 注意事项与陷阱

1. **默认创建 `_original` 备份**：写入操作会在同目录下产生 `文件名_original` 备份。使用 `-overwrite_original` 跳过，但务必先验证。

2. **标签名大小写敏感**（但 `-L` 可关闭）：`ExposureTime` ≠ `exposuretime`。

3. **组名前缀**：写入时如果不指定组，exiftool 自动选择"最合适"的组。明确指定组可避免意外：`-EXIF:Artist` `-XMP:Artist`。

4. **`-all=` 极度危险**：删除所有元数据包括色彩空间、旋转方向等，可能影响正常显示。

5. **RAW 文件写入谨慎**：某些 RAW 格式的写入是"非破坏性"的（存入 XMP sidecar），但 `-overwrite_original` 会破坏原始数据。

6. **日期格式化重命名**：`%%-c` 防止重名覆盖，务必包含。

7. **特殊字符转义**：Shell 中 `$` `(` `)` `*` 等需要转义或用单引号包围：`'-FileName<${DateTimeOriginal}_${Model}'`。

8. **exiftool 是 Perl 脚本**：启动性能一般，批量操作时一次性处理所有文件（而非循环调用）可大幅提速。

9. **多标签返回同义标签**：很多标签在不同组中重复（如 EXIF:Artist 和 XMP:Creator），写入时确保一致性。

10. **管道停止信号**：`Ctrl+C` 中断时可能留下 `.tmp` 临时文件，手动清理。
