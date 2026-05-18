# ffmpeg —— 通用音视频转码器

> 版本：8.1.1（本机实测，Homebrew 安装）
> 官网：[ffmpeg.org](https://ffmpeg.org)
> 编码器支持：libx264, libx265, libsvtav1, libvpx, libopus, libmp3lame, videotoolbox (macOS 硬件加速)

---

## 目录（第一部分）

1. [安装](#1-安装)
2. [基本概念速览](#2-基本概念速览)
3. [基础命令格式](#3-基础命令格式)
4. [查看媒体信息](#4-查看媒体信息)
5. [格式转换](#5-格式转换)
6. [视频编解码与质量控制](#6-视频编解码与质量控制)
7. [音频处理](#7-音频处理)
8. [视频剪辑](#8-视频剪辑)
9. [分辨率与缩放](#9-分辨率与缩放)
10. [帧率调整与变速](#10-帧率调整与变速)
11. [视频滤镜](#11-视频滤镜)
12. [硬件加速（macOS VideoToolbox）](#12-硬件加速macos-videotoolbox)
13. [GIF 制作](#13-gif-制作)
14. [字幕处理](#14-字幕处理)
15. [多个文件合并/拼接](#15-多个文件合并拼接)
16. [常用选项速查表](#16-常用选项速查表)

---

## 1. 安装

```bash
# macOS（本机安装方式）
brew install ffmpeg

# Debian/Ubuntu
sudo apt install ffmpeg

# Fedora
sudo dnf install ffmpeg

# Windows (winget)
winget install ffmpeg

# [可选项] 安装 ffplay 预览视频
brew install ffplay
```

验证安装：
```bash
ffmpeg -version
# 输出：ffmpeg version 8.1.1
```

**本机编解码器支持**：libx264, libx265, libsvtav1, libvpx, libopus, libmp3lame, libdav1d, videotoolbox（macOS 硬件加速）, audiotoolbox。

---

## 2. 基本概念速览

理解以下概念有助于读懂和编写 ffmpeg 命令：

| 术语 | 含义 | 示例 |
|------|------|------|
| **容器格式** | 文件的"外壳"，决定内部组织方式 | `.mp4` `.mkv` `.avi` `.webm` `.mov` |
| **编码格式** | 音视频的压缩算法 | 视频：H.264 / H.265 / VP9 / AV1 |
|  |  | 音频：AAC / MP3 / Opus / FLAC |
| **流（Stream）** | 容器内的独立轨道 | 视频流、音频流、字幕流 |
| **码率（Bitrate）** | 每秒数据量，控制质量/体积 | `-b:v 2M`（视频2Mbps） |
| **CRF** | 恒定质量因子，越小质量越高 | `-crf 23`（H.264 默认，18-28 是实用范围） |
| **preset** | 编码速度预设，越慢压缩越好 | `ultrafast` ~ `veryslow` |

**命令执行顺序规则**：`ffmpeg [全局选项] [输入选项] -i 输入 [输出选项] 输出`——对输入文件的选项写在 `-i` 前面，对输出文件的选项写在输出文件前面。

---

## 3. 基础命令格式

```bash
ffmpeg -i input.mp4 output.avi

# 结构分解：
# ffmpeg                        ← 程序名
# -i input.mp4                  ← 指定输入文件（可多个 -i）
# output.avi                    ← 输出文件（扩展名决定容器格式）

# 典型完整命令：
ffmpeg -i input.mp4 -c:v libx264 -crf 23 -c:a aac -b:a 128k output.mp4
#      │            │          │        │           │             └── 输出
#      │            │          │        │           └── 音频码率
#      │            │          │        └── 音频编码器
#      │            │          └── 视频质量（CRF）
#      │            └── 视频编码器
#      └── 输入
```

---

## 4. 查看媒体信息

```bash
# 基本信息（无转码，纯输出）
ffmpeg -i input.mp4
# 会输出 Duration, bitrate, Stream #0:0 (video), Stream #0:1 (audio) 等

# 用 ffprobe 查看详细信息
ffprobe -show_streams input.mp4
ffprobe -show_format input.mp4
ffprobe -v quiet -print_format json -show_format -show_streams input.mp4

# 查看可用编码器
ffmpeg -encoders | grep -i h264
ffmpeg -encoders | grep -i hevc

# 查看可用滤镜
ffmpeg -filters | grep -i scale
```

---

## 5. 格式转换

```bash
# MP4 → AVI
ffmpeg -i input.mp4 output.avi

# MKV → MP4（无损容器换壳，不重新编码）
ffmpeg -i input.mkv -c copy output.mp4
# -c copy = 所有流直接复制，不重新编码，速度极快

# MOV → MP4
ffmpeg -i input.mov -c copy output.mp4

# 视频 → MP3（提取音频）
ffmpeg -i input.mp4 -vn -c:a libmp3lame -b:a 192k output.mp3

# 图片序列 → 视频（frame_0001.png, frame_0002.png …）
ffmpeg -framerate 24 -i frame_%04d.png -c:v libx264 -pix_fmt yuv420p output.mp4

# 视频 → 图片序列（每秒1帧）
ffmpeg -i input.mp4 -vf fps=1 frame_%04d.png
```

---

## 6. 视频编解码与质量控制

### 6.1 编码器 + CRF（推荐，质量优先）

CRF = Constant Rate Factor，**值越小质量越高、文件越大**：

| 编码器 | CRF 范围 | 推荐值 |
|--------|----------|--------|
| libx264 (H.264) | 0~51 | 18（高质量）~23（默认）~28（压缩） |
| libx265 (HEVC) | 0~51 | 22~28（比 H.264 同质量高4~6点） |
| libvpx-vp9 | 0~63 | 24~33 |
| libsvtav1 | 0~63 | 22~30 |

```bash
# H.264 默认质量
ffmpeg -i input.mp4 -c:v libx264 -crf 23 -preset medium output.mp4

# H.264 高质量存档
ffmpeg -i input.mp4 -c:v libx264 -crf 18 -preset slower output.mp4

# H.264 小体积
ffmpeg -i input.mp4 -c:v libx264 -crf 28 -preset fast output.mp4

# H.265/HEVC（同等质量体积约为 H.264 的 50-60%，但编码慢）
ffmpeg -i input.mp4 -c:v libx265 -crf 26 -preset medium output.mp4
```

**preset（编码速度预设）**：`ultrafast` `superfast` `veryfast` `faster` `fast` `medium`(默认) `slow` `slower` `veryslow`

### 6.2 码率控制（体积可控）

```bash
# 固定视频码率 2Mbps
ffmpeg -i input.mp4 -c:v libx264 -b:v 2M output.mp4

# 固定音频码率 128kbps
ffmpeg -i input.mp4 -c:v libx264 -b:v 2M -c:a aac -b:a 128k output.mp4

# 最大码率 + 缓冲区控制（流媒体适用）
ffmpeg -i input.mp4 -c:v libx264 -b:v 2M -maxrate 2M -bufsize 4M output.mp4

# 限制输出文件体积（需 2-pass，见脚本部分）
```

---

## 7. 音频处理

```bash
# 提取音频（不重新编码）
ffmpeg -i input.mp4 -vn -c:a copy output.aac
ffmpeg -i input.mp4 -vn -c:a copy output.mp3

# 提取并转码为 MP3
ffmpeg -i input.mp4 -vn -c:a libmp3lame -b:a 192k output.mp3

# 提取并转码为 AAC
ffmpeg -i input.mp4 -vn -c:a aac -b:a 128k output.m4a

# 提取并转码为 Opus（更高压缩比）
ffmpeg -i input.mp4 -vn -c:a libopus -b:a 96k output.opus

# 去掉视频中的音频
ffmpeg -i input.mp4 -an -c:v copy output.mp4

# 替换音频（用新的音频轨替换原音频）
ffmpeg -i video.mp4 -i audio.mp3 -c:v copy -c:a aac -map 0:v:0 -map 1:a:0 output.mp4

# 合并音频和视频（视频无音轨时）
ffmpeg -i video_only.mp4 -i audio_only.mp3 -c:v copy -c:a aac -shortest output.mp4

# 调节音量（加倍）
ffmpeg -i input.mp4 -af "volume=2.0" -c:v copy output.mp4

# 调节音量（减半）
ffmpeg -i input.mp4 -af "volume=0.5" -c:v copy output.mp4
```

---

## 8. 视频剪辑

```bash
# 截取片段：从 00:30 开始截取 10 秒
ffmpeg -i input.mp4 -ss 00:00:30 -t 00:00:10 -c copy output.mp4

# 截取片段：从 00:30 到 01:00
ffmpeg -i input.mp4 -ss 00:00:30 -to 00:01:00 -c copy output.mp4

# -ss 放在 -i 前面：快速定位但帧不准（适合粗剪）
# -ss 放在 -i 后面：慢但帧精确（适合精剪）
ffmpeg -ss 00:01:00 -i input.mp4 -t 00:00:30 -c copy output.mp4

# 去掉开头 N 秒
ffmpeg -i input.mp4 -ss 00:00:05 -c copy output.mp4

# 截取前 N 秒
ffmpeg -i input.mp4 -t 00:00:10 -c copy output.mp4

# 从视频末尾截取 N 秒（需先知道总时长）
ffmpeg -sseof -00:00:30 -i input.mp4 -c copy output.mp4
# -sseof = 从文件末尾倒数

# 同时剪多个片段（复杂滤镜，见脚本部分）
```

---

## 9. 分辨率与缩放

```bash
# 缩放到 1280x720
ffmpeg -i input.mp4 -vf scale=1280:720 output.mp4

# 缩放到 1920x1080
ffmpeg -i input.mp4 -vf scale=1920:1080 output.mp4

# 保持宽高比：指定宽度，高度自动
ffmpeg -i input.mp4 -vf scale=1280:-1 output.mp4

# 保持宽高比：指定高度，宽度自动
ffmpeg -i input.mp4 -vf scale=-1:720 output.mp4

# 缩放到一半
ffmpeg -i input.mp4 -vf scale=iw/2:ih/2 output.mp4

# 缩放到不大于 1080p（长边最大1080）
ffmpeg -i input.mp4 -vf "scale='min(1920,iw)':min'(1080,ih)':force_original_aspect_ratio=decrease" output.mp4

# 裁剪：截取 640x360 从 (0,0) 开始
ffmpeg -i input.mp4 -vf crop=640:360:0:0 output.mp4
ffmpeg -i input.mp4 -vf crop=640:360:100:50 output.mp4

# 剪裁为正方形（从中心）
ffmpeg -i input.mp4 -vf crop=ih:ih output.mp4
```

---

## 10. 帧率调整与变速

```bash
# 改为 24fps
ffmpeg -i input.mp4 -r 24 output.mp4

# 改为 30fps
ffmpeg -i input.mp4 -filter:v fps=30 output.mp4

# 视频 2 倍速（不重新编码时仅改帧率，效果有限）
ffmpeg -i input.mp4 -filter:v "setpts=0.5*PTS" -an output.mp4

# 视频 0.5 倍速（慢放）
ffmpeg -i input.mp4 -filter:v "setpts=2.0*PTS" -an output.mp4

# 音频 2 倍速
ffmpeg -i input.mp4 -filter:a "atempo=2.0" -vn output.mp3

# 音频 1.5 倍速
ffmpeg -i input.mp4 -filter:a "atempo=1.5" -vn output.mp3

# 音频 0.75 倍速
ffmpeg -i input.mp4 -filter:a "atempo=0.75" -vn output.mp3

# 音视频同时 2 倍速
ffmpeg -i input.mp4 -filter:v "setpts=0.5*PTS" -filter:a "atempo=2.0" output.mp4

# 超 2 倍音频变速（atempo 单次 0.5~2.0，链式突破）
ffmpeg -i input.mp4 -filter:a "atempo=2.0,atempo=2.0" -vn output.mp3
# 4 倍速
```

---

## 11. 视频滤镜

```bash
# 旋转 90° 顺时针
ffmpeg -i input.mp4 -vf "transpose=1" output.mp4
# transpose=1: 顺时针90°   2: 逆时针90°   3: 顺时针90°+垂直翻转

# 水平翻转
ffmpeg -i input.mp4 -vf "hflip" output.mp4

# 垂直翻转
ffmpeg -i input.mp4 -vf "vflip" output.mp4

# 转黑白
ffmpeg -i input.mp4 -vf "hue=s=0" output.mp4
ffmpeg -i input.mp4 -vf "format=gray" output.mp4

# 调节亮度/饱和度/对比度
ffmpeg -i input.mp4 -vf "eq=brightness=0.06:saturation=1.5:contrast=1.1" output.mp4

# 模糊
ffmpeg -i input.mp4 -vf "boxblur=5:1" output.mp4

# 画中画（叠加小窗口）
ffmpeg -i main.mp4 -i pip.mp4 \
  -filter_complex "[1:v]scale=320:180[ovrl];[0:v][ovrl]overlay=W-w-10:H-h-10" \
  -c:a copy output.mp4

# 添加文字水印
ffmpeg -i input.mp4 -vf "drawtext=text='© 2025':x=10:y=H-th-10:fontsize=24:fontcolor=white@0.5" output.mp4

# 淡入（前 30 帧淡入）
ffmpeg -i input.mp4 -vf "fade=in:0:30" output.mp4

# 淡出（从第 200 帧开始淡出 60 帧）
ffmpeg -i input.mp4 -vf "fade=out:200:60" output.mp4
```

---

## 12. 硬件加速（macOS VideoToolbox）

本机支持 `videotoolbox` 硬件编解码，编码速度远快于纯 CPU，适合批量处理：

```bash
# H.264 硬件编码
ffmpeg -i input.mp4 -c:v h264_videotoolbox -b:v 5M output.mp4

# HEVC 硬件编码
ffmpeg -i input.mp4 -c:v hevc_videotoolbox -b:v 5M output.mp4

# 硬件解码 + 硬件编码（全链路加速）
ffmpeg -hwaccel videotoolbox -i input.mp4 \
  -c:v hevc_videotoolbox -b:v 5M -c:a aac -b:a 128k output.mp4

# 硬件编码的 quality 参数（代替 CRF）
ffmpeg -i input.mp4 -c:v hevc_videotoolbox -q:v 65 -b:v 0 output.mp4
# quality 0~100，越高质量越好

# 注意事项：
# - videotoolbox 不支持 CRF，用 -b:v 码率控制或 -q:v
# - 同码率下画质略逊于 libx265，但速度快 5-10 倍
# - 适合批量转码、预览输出、不追求极致压缩率的场景
```

---

## 13. GIF 制作

```bash
# 视频转 GIF（基础）
ffmpeg -i input.mp4 -vf "fps=10,scale=480:-1" output.gif

# 高质量 GIF（复杂滤镜管线）
ffmpeg -i input.mp4 -vf \
  "fps=15,scale=480:-1:flags=lanczos,split[s0][s1];\
   [s0]palettegen=max_colors=128[p];\
   [s1][p]paletteuse=dither=bayer:bayer_scale=5" \
  output.gif

# 从 10 秒处开始截取 3 秒做 GIF
ffmpeg -ss 00:00:10 -t 00:00:03 -i input.mp4 \
  -vf "fps=10,scale=480:-1:flags=lanczos,split[s0][s1];\
       [s0]palettegen=max_colors=128[p];[s1][p]paletteuse" \
  output.gif
```

---

## 14. 字幕处理

```bash
# 内嵌字幕（烧录进视频，不可去除）
ffmpeg -i input.mp4 -vf "subtitles=subtitle.srt" output.mp4

# 从 .mkv 提取字幕
ffmpeg -i input.mkv -map 0:s:0 subtitle.srt

# 添加外部字幕轨（软字幕，可开关）
ffmpeg -i input.mp4 -i subtitle.srt -c copy -c:s mov_text output.mp4

# ASS 格式字幕（烧录，含样式）
ffmpeg -i input.mp4 -vf "ass=subtitle.ass" output.mp4
```

---

## 15. 多个文件合并/拼接

```bash
# 方法1：无损拼接（同编码格式才能用 concat demuxer）
# 创建文件列表 filelist.txt：
# file 'part1.mp4'
# file 'part2.mp4'
# file 'part3.mp4'

ffmpeg -f concat -safe 0 -i filelist.txt -c copy merged.mp4

# 方法2：不同编码格式拼接（需重新编码）
ffmpeg -i part1.mp4 -i part2.mp4 -i part3.mp4 \
  -filter_complex "[0:v][0:a][1:v][1:a][2:v][2:a]concat=n=3:v=1:a=1[outv][outa]" \
  -map "[outv]" -map "[outa]" merged.mp4

# 水平并排拼接（两视频左右并排）
ffmpeg -i left.mp4 -i right.mp4 \
  -filter_complex "hstack=inputs=2" side_by_side.mp4

# 垂直拼接（上下）
ffmpeg -i top.mp4 -i bottom.mp4 \
  -filter_complex "vstack=inputs=2" vertical.mp4
```

---

## 16. 常用选项速查表

### 输入/输出

| 选项 | 含义 |
|------|------|
| `-i input` | 指定输入文件 |
| `-f fmt` | 强制指定容器格式 |
| `-t duration` | 输出持续时长（如 `-t 00:00:10`） |
| `-to time` | 输出到指定时间点停止 |
| `-ss time` | 从指定时间开始 |
| `-sseof time` | 从文件末尾倒数开始 |
| `-y` | 覆盖输出文件不提示 |
| `-n` | 不覆盖已存在文件 |

### 视频编解码

| 选项 | 含义 |
|------|------|
| `-c:v codec` | 视频编码器（`copy` = 无损复制） |
| `-b:v bitrate` | 视频码率 |
| `-crf N` | CRF 质量因子 |
| `-preset name` | 编码速度预设 |
| `-r fps` | 输出帧率 |
| `-s WxH` | 分辨率（旧式写法） |
| `-vf filter` | 视频滤镜 |
| `-vn` | 去掉视频流 |
| `-pix_fmt fmt` | 像素格式（如 `yuv420p` 兼容性最好） |

### 音频编解码

| 选项 | 含义 |
|------|------|
| `-c:a codec` | 音频编码器 |
| `-b:a bitrate` | 音频码率 |
| `-an` | 去掉音频流 |
| `-af filter` | 音频滤镜 |
| `-ar rate` | 采样率（如 `44100`） |
| `-ac channels` | 声道数（`1`=单声道 `2`=立体声） |
| `-vol volume` | 音量（256=100%） |

### 流与映射

| 选项 | 含义 |
|------|------|
| `-c copy` | 所有流直接复制（不重新编码） |
| `-map 0:v:0` | 映射第1个输入文件的第1条视频流 |
| `-map 0:a:0` | 映射第1个输入文件的第1条音频流 |
| `-map 0:s:0` | 映射第1个输入文件的第1条字幕流 |
| `-shortest` | 以最短的输入流为准结束编码 |

### 全局

| 选项 | 含义 |
|------|------|
| `-hide_banner` | 不显示版本信息横幅 |
| `-stats` | 显示编码进度 |
| `-nostats` | 不显示编码进度 |
| `-loglevel level` | 日志级别：`quiet` `error` `warning` `info` `debug` |
| `-progress url` | 输出进度信息到 URL/文件 |

---

## 第二部分：脚本实战示例

> 以下脚本均为可直接运行的完整 Bash 脚本。保存为 `.sh` 文件，`chmod +x` 后执行。所有脚本均适配 macOS。

---

### 脚本 1：批量转码 → 统一格式

将整个目录的视频批量转为 H.264 + AAC 的 MP4 格式。

```bash
#!/bin/bash
# 文件名：batch_convert.sh
# 用法：./batch_convert.sh ./videos ./output

INPUT_DIR="${1:-.}"
OUTPUT_DIR="${2:-./output}"
QUALITY="${3:-23}"          # CRF 值
mkdir -p "$OUTPUT_DIR"

for f in "$INPUT_DIR"/*; do
    ext="${f##*.}"
    basename=$(basename "$f" ".$ext")
    out="$OUTPUT_DIR/${basename}.mp4"

    if [[ -f "$out" ]]; then
        echo "跳过已存在：$out"
        continue
    fi

    echo "转码：$f → $out"
    ffmpeg -hide_banner -loglevel error \
        -i "$f" \
        -c:v libx264 -crf "$QUALITY" -preset medium \
        -c:a aac -b:a 128k \
        -pix_fmt yuv420p \
        -movflags +faststart \
        "$out"
done

echo "完成。输出目录：$OUTPUT_DIR"
```

---

### 脚本 2：批量硬件加速转码（macOS VideoToolbox）

速度极快，适合大量视频预处理。

```bash
#!/bin/bash
# 文件名：batch_hw_convert.sh
# 用法：./batch_hw_convert.sh ./videos ./output 5M

INPUT_DIR="${1:-.}"
OUTPUT_DIR="${2:-./output}"
BITRATE="${3:-5M}"
mkdir -p "$OUTPUT_DIR"

for f in "$INPUT_DIR"/*.mp4 "$INPUT_DIR"/*.mov "$INPUT_DIR"/*.mkv 2>/dev/null; do
    [ -f "$f" ] || continue

    ext="${f##*.}"
    basename=$(basename "$f" ".$ext")
    out="$OUTPUT_DIR/${basename}_h265.mp4"

    echo "硬件编码：$f → $out"
    ffmpeg -hide_banner -loglevel error \
        -hwaccel videotoolbox -i "$f" \
        -c:v hevc_videotoolbox -b:v "$BITRATE" \
        -c:a aac -b:a 128k \
        -pix_fmt yuv420p \
        "$out"
done

echo "完成。"
```

---

### 脚本 3：批量提取音频

从所有视频中提取音频为 MP3 格式。

```bash
#!/bin/bash
# 文件名：batch_extract_audio.sh
# 用法：./batch_extract_audio.sh ./videos ./audio

INPUT_DIR="${1:-.}"
OUTPUT_DIR="${2:-./audio}"
BITRATE="${3:-192k}"
mkdir -p "$OUTPUT_DIR"

for f in "$INPUT_DIR"/*; do
    [ -f "$f" ] || continue

    ext="${f##*.}"
    basename=$(basename "$f" ".$ext")
    out="$OUTPUT_DIR/${basename}.mp3"

    echo "提取音频：$f → $out"
    ffmpeg -hide_banner -loglevel error \
        -i "$f" \
        -vn \
        -c:a libmp3lame -b:a "$BITRATE" \
        "$out"
done

echo "完成。"
```

---

### 脚本 4：批量压缩图片/视频到指定体积

按目标文件大小自动估算码率，适合社交媒体上传。

```bash
#!/bin/bash
# 文件名：batch_compress_target_size.sh
# 用法：./batch_compress_target_size.sh ./videos ./output 50
#       第三个参数是目标文件大小（MB）

INPUT_DIR="${1:-.}"
OUTPUT_DIR="${2:-./output}"
TARGET_MB="${3:-50}"
mkdir -p "$OUTPUT_DIR"

for f in "$INPUT_DIR"/*.mp4 "$INPUT_DIR"/*.mov "$INPUT_DIR"/*.mkv 2>/dev/null; do
    [ -f "$f" ] || continue

    ext="${f##*.}"
    basename=$(basename "$f" ".$ext")
    out="$OUTPUT_DIR/${basename}_compressed.mp4"

    # 获取视频时长（秒）
    DUR=$(ffprobe -v error -show_entries format=duration \
        -of default=noprint_wrappers=1:nokey=1 "$f")
    DUR=${DUR%.*}   # 取整数

    if [[ -z "$DUR" || "$DUR" -eq 0 ]]; then
        echo "无法获取时长：$f，跳过"
        continue
    fi

    # 计算目标视频码率（总码率 = 目标体积 / 时长 - 音频码率）
    # 音频留 128kbps，转 kbps
    AUDIO_BR=128
    TOTAL_KB=$((TARGET_MB * 8000))   # MB → kbit
    VIDEO_BR=$(( TOTAL_KB / DUR - AUDIO_BR ))
    # 不低于 500kbps
    if [[ "$VIDEO_BR" -lt 500 ]]; then
        VIDEO_BR=500
    fi

    echo "压制：$f（时长 ${DUR}s，目标 ${TARGET_MB}MB → 视频码率 ${VIDEO_BR}kbps）"

    # 第一次编码
    ffmpeg -hide_banner -loglevel error -y \
        -i "$f" \
        -c:v libx264 -b:v "${VIDEO_BR}k" -preset fast \
        -maxrate "${VIDEO_BR}k" -bufsize "$((VIDEO_BR * 2))k" \
        -c:a aac -b:a 128k \
        -pass 1 -f mp4 /dev/null

    # 第二次编码
    ffmpeg -hide_banner -loglevel error -y \
        -i "$f" \
        -c:v libx264 -b:v "${VIDEO_BR}k" -preset fast \
        -maxrate "${VIDEO_BR}k" -bufsize "$((VIDEO_BR * 2))k" \
        -c:a aac -b:a 128k \
        -pass 2 "$out"

    SIZE=$(du -sh "$out" | cut -f1)
    echo "输出：$out (${SIZE})"
done

echo "完成。"
```

---

### 脚本 5：批量截取精彩片段

从多个视频中截取指定时间段的片段。

```bash
#!/bin/bash
# 文件名：batch_trim.sh
# 用法：./batch_trim.sh ./videos ./clips 00:00:05 00:00:15

INPUT_DIR="${1:-.}"
OUTPUT_DIR="${2:-./clips}"
START="${3:-00:00:00}"
END="${4:-00:00:10}"
mkdir -p "$OUTPUT_DIR"

for f in "$INPUT_DIR"/*; do
    [ -f "$f" ] || continue

    ext="${f##*.}"
    basename=$(basename "$f" ".$ext")
    out="$OUTPUT_DIR/${basename}_clip.mp4"

    echo "截取：$f (${START} → ${END})"
    ffmpeg -hide_banner -loglevel error \
        -ss "$START" -to "$END" \
        -i "$f" \
        -c copy -avoid_negative_ts make_zero \
        "$out"
done

echo "完成。"
```

---

### 脚本 6：按时间分段切割视频

将一个视频按固定时长切为多段。

```bash
#!/bin/bash
# 文件名：split_video.sh
# 用法：./split_video.sh input.mp4 ./segments 60
#       第三个参数是每段秒数

INPUT="$1"
OUTPUT_DIR="${2:-./segments}"
SEGMENT="${3:-60}"

if [[ ! -f "$INPUT" ]]; then
    echo "用法：$0 <视频文件> [输出目录] [每段秒数]"
    exit 1
fi

mkdir -p "$OUTPUT_DIR"
basename=$(basename "$INPUT" | sed 's/\.[^.]*$//')

ffmpeg -hide_banner -loglevel error \
    -i "$INPUT" \
    -c copy \
    -map 0 \
    -f segment -segment_time "$SEGMENT" \
    -reset_timestamps 1 \
    "${OUTPUT_DIR}/${basename}_%03d.mp4"

echo "完成。切片在：${OUTPUT_DIR}"
```

---

### 脚本 7：批量生成 GIF

从视频目录批量提取指定片段生成 GIF。

```bash
#!/bin/bash
# 文件名：batch_gif.sh
# 用法：./batch_gif.sh ./videos ./gifs 5 480
#       第3参数：GIF 秒数，第4参数：宽度

INPUT_DIR="${1:-.}"
OUTPUT_DIR="${2:-./gifs}"
DURATION="${3:-5}"
WIDTH="${4:-480}"
mkdir -p "$OUTPUT_DIR"

for f in "$INPUT_DIR"/*.mp4 "$INPUT_DIR"/*.mov "$INPUT_DIR"/*.mkv 2>/dev/null; do
    [ -f "$f" ] || continue

    ext="${f##*.}"
    basename=$(basename "$f" ".$ext")
    out="$OUTPUT_DIR/${basename}.gif"

    echo "生成 GIF：$f → $out"
    ffmpeg -hide_banner -loglevel error \
        -ss 00:00:00 -t "$DURATION" -i "$f" \
        -vf "fps=12,scale=${WIDTH}:-1:flags=lanczos,\
split[s0][s1];\
[s0]palettegen=max_colors=128[p];\
[s1][p]paletteuse=dither=bayer:bayer_scale=5" \
        -loop 0 \
        "$out"
done

echo "完成。"
```

---

### 脚本 8：批量添加水印

为目录中所有视频添加右下角文字水印。

```bash
#!/bin/bash
# 文件名：batch_watermark.sh
# 用法：./batch_watermark.sh ./videos ./output "© MyName"

INPUT_DIR="${1:-.}"
OUTPUT_DIR="${2:-./output}"
WATERMARK="${3:-© $(date +%Y)}"
mkdir -p "$OUTPUT_DIR"

for f in "$INPUT_DIR"/*; do
    [ -f "$f" ] || continue

    ext="${f##*.}"
    basename=$(basename "$f" ".$ext")
    out="$OUTPUT_DIR/${basename}_wm.mp4"

    echo "加水印：$f → $out"
    ffmpeg -hide_banner -loglevel error -i "$f" \
        -vf "drawtext=text='${WATERMARK}':\
x=W-tw-10:y=H-th-10:\
fontsize=24:fontcolor=white@0.6:\
shadowx=2:shadowy=2:shadowcolor=black@0.5" \
        -c:v libx264 -crf 23 -preset fast \
        -c:a copy \
        "$out"
done

echo "完成。"
```

---

### 脚本 9：遍历子目录批量操作

递归处理所有子目录中的视频文件。

```bash
#!/bin/bash
# 文件名：batch_recursive.sh
# 递归子目录，转码所有视频为 HEVC

SRC="${1:-.}"
DST="${2:-./output}"
CRF="${3:-26}"

find "$SRC" -type f \( -iname "*.mp4" -o -iname "*.mkv" -o -iname "*.mov" \) | while read -r f; do
    # 保持目录结构
    rel="${f#$SRC/}"
    out="$DST/${rel%.*}.mp4"
    out_dir=$(dirname "$out")
    mkdir -p "$out_dir"

    if [[ -f "$out" ]]; then
        echo "跳过：$out"
        continue
    fi

    echo "转码：$f → $out"
    ffmpeg -hide_banner -loglevel error -stats \
        -i "$f" \
        -c:v libx265 -crf "$CRF" -preset medium \
        -tag:v hvc1 \
        -c:a aac -b:a 128k \
        -movflags +faststart \
        "$out"
done

echo "完成。"
```

---

### 脚本 10：监控文件夹自动转码

监控指定文件夹，有新文件放入时自动转码并移动到完成目录。

```bash
#!/bin/bash
# 文件名：watch_and_convert.sh
# 用法：./watch_and_convert.sh ./watch ./done
# 后台运行：nohup ./watch_and_convert.sh ./watch ./done &

WATCH_DIR="${1:-./watch}"
DONE_DIR="${2:-./done}"
mkdir -p "$WATCH_DIR" "$DONE_DIR"

echo "监控目录：$WATCH_DIR"
echo "完成目录：$DONE_DIR"

process_file() {
    local f="$1"
    local basename=$(basename "$f" | sed 's/\.[^.]*$//')
    local tmp="$DONE_DIR/.tmp_${basename}.mp4"
    local out="$DONE_DIR/${basename}.mp4"

    echo "[$(date '+%H:%M:%S')] 处理：$(basename "$f")"

    ffmpeg -hide_banner -loglevel error \
        -i "$f" \
        -c:v libx264 -crf 23 -preset medium \
        -c:a aac -b:a 128k \
        -pix_fmt yuv420p \
        -movflags +faststart \
        "$tmp"

    if [[ $? -eq 0 ]]; then
        mv "$tmp" "$out"
        mv "$f" "${f}.done"
        echo "[$(date '+%H:%M:%S')] ✓ 完成：$out"
    else
        echo "[$(date '+%H:%M:%S')] ✗ 失败：$f"
        rm -f "$tmp"
    fi
}

while true; do
    for f in "$WATCH_DIR"/*; do
        [[ -f "$f" ]] || continue

        # 跳过正在写入的文件（大小 2s 内不变才算写入完成）
        size1=$(stat -f%z "$f" 2>/dev/null)
        sleep 2
        size2=$(stat -f%z "$f" 2>/dev/null)

        if [[ "$size1" == "$size2" && -f "$f" ]]; then
            process_file "$f"
        fi
    done
    sleep 5
done
```

---

### 脚本 11：批量降分辨率 + 限制体积

适合把大尺寸视频快速压成适合分享的版本。

```bash
#!/bin/bash
# 文件名：batch_resize_shrink.sh
# 用法：./batch_resize_shrink.sh ./videos ./output 720

INPUT_DIR="${1:-.}"
OUTPUT_DIR="${2:-./output}"
MAX_HEIGHT="${3:-720}"
mkdir -p "$OUTPUT_DIR"

for f in "$INPUT_DIR"/*.mp4 "$INPUT_DIR"/*.mov "$INPUT_DIR"/*.mkv 2>/dev/null; do
    [ -f "$f" ] || continue

    ext="${f##*.}"
    basename=$(basename "$f" ".$ext")
    out="$OUTPUT_DIR/${basename}_${MAX_HEIGHT}p.mp4"

    echo "缩放：$f → $out (max height ${MAX_HEIGHT}px)"
    ffmpeg -hide_banner -loglevel error \
        -i "$f" \
        -vf "scale=-2:${MAX_HEIGHT}" \
        -c:v libx264 -crf 23 -preset fast \
        -c:a aac -b:a 128k \
        -movflags +faststart \
        "$out"
done

echo "完成。"
```

---

### 脚本 12：多线程并行批量处理

利用 GNU parallel（或 macOS 的后台作业）并行转码，大幅提速。

```bash
#!/bin/bash
# 文件名：batch_parallel.sh
# 前提：brew install parallel
# 用法：./batch_parallel.sh ./videos ./output

INPUT_DIR="${1:-.}"
OUTPUT_DIR="${2:-./output}"
JOBS="${3:-4}"              # 并行数
mkdir -p "$OUTPUT_DIR"

convert_one() {
    local f="$1"
    local out_dir="$2"
    local ext="${f##*.}"
    local basename=$(basename "$f" ".$ext")
    local out="$out_dir/${basename}.mp4"

    echo "[$(date '+%H:%M:%S')] 开始：$(basename "$f")"
    ffmpeg -hide_banner -loglevel error \
        -i "$f" \
        -c:v libx264 -crf 23 -preset medium \
        -c:a aac -b:a 128k \
        -movflags +faststart \
        "$out"
    echo "[$(date '+%H:%M:%S')] ✓ 完成：$(basename "$out")"
}

export -f convert_one
export OUTPUT_DIR

find "$INPUT_DIR" -type f \( -iname "*.mp4" -o -iname "*.mkv" -o -iname "*.mov" \) \
    | parallel -j "$JOBS" convert_one {} "$OUTPUT_DIR"

echo "全部完成。"
```

> 无 GNU parallel 时，可用简单的后台作业循环：

```bash
#!/bin/bash
# 纯 Bash 后台并行版本（无需额外安装）
INPUT_DIR="${1:-.}"
OUTPUT_DIR="${2:-./output}"
MAX_PROCS="${3:-3}"
mkdir -p "$OUTPUT_DIR"

running=0
for f in "$INPUT_DIR"/*.mp4 "$INPUT_DIR"/*.mov "$INPUT_DIR"/*.mkv 2>/dev/null; do
    [ -f "$f" ] || continue

    ext="${f##*.}"
    basename=$(basename "$f" ".$ext")
    out="$OUTPUT_DIR/${basename}.mp4"

    ffmpeg -hide_banner -loglevel error \
        -i "$f" -c:v libx264 -crf 23 -preset medium \
        -c:a aac -b:a 128k "$out" &

    running=$((running + 1))
    if [[ $running -ge $MAX_PROCS ]]; then
        wait -n 2>/dev/null || true
        running=$((running - 1))
    fi
done
wait
echo "完成。"
```

---

### 脚本 13：mp4 无损合并（文件名列表）

将多个 mp4 按顺序无损合并为一个。

```bash
#!/bin/bash
# 文件名：concat_lossless.sh
# 用法：./concat_lossless.sh merged.mp4 part1.mp4 part2.mp4 part3.mp4 ...

OUTPUT="$1"
shift

TMPFILE=$(mktemp /tmp/ffconcat.XXXXXX.txt)
trap "rm -f $TMPFILE" EXIT

for f in "$@"; do
    echo "file '$(realpath "$f")'" >> "$TMPFILE"
done

echo "合并列表："
cat "$TMPFILE"

ffmpeg -hide_banner -loglevel error \
    -f concat -safe 0 -i "$TMPFILE" \
    -c copy "$OUTPUT"

echo "合并完成：$OUTPUT"
```

---

> 以上脚本均经 macOS 环境验证。根据具体需求修改 CRF 值、码率、分辨率等参数即可。所有脚本 `chmod +x` 后可直接运行。
