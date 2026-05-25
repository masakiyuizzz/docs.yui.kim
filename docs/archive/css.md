# CSS —— 层叠样式表

> 给 HTML 穿上衣服的语言。从 CSS 2.1（2002）到 CSS3（模块化，持续演进），再到如今的 Flexbox / Grid / 自定义属性 / 容器查询。
> 规范：CSSWG 各模块独立推进 · 权威参考：[developer.mozilla.org/zh-CN/docs/Web/CSS](https://developer.mozilla.org/zh-CN/docs/Web/CSS)

> **关于"杂乱的根基"**：CSS 确实容易学得零散——今天抄一段居中代码，明天抄一个动画。本文件按**功能分类**重新组织，从选择器到盒模型，从 Flexbox 到 Grid，从过渡到动画，从变量到响应式，把散落的知识点串成体系。

---

## 目录

1. [CSS 是怎么工作的](#1-css-是怎么工作的)
2. [引入 CSS 的四种方式](#2-引入-css-的四种方式)
3. [选择器全解](#3-选择器全解)
4. [优先级与层叠](#4-优先级与层叠)
5. [盒模型](#5-盒模型)
6. [单位与尺寸](#6-单位与尺寸)
7. [颜色](#7-颜色)
8. [文本与字体](#8-文本与字体)
9. [背景](#9-背景)
10. [边框与轮廓](#10-边框与轮廓)
11. [display 属性](#11-display-属性)
12. [定位（position）](#12-定位position)
13. [Flexbox 弹性布局](#13-flexbox-弹性布局)
14. [Grid 网格布局](#14-grid-网格布局)
15. [变换（Transform）](#15-变换transform)
16. [过渡（Transition）](#16-过渡transition)
17. [动画（Animation）](#17-动画animation)
18. [渐变（Gradient）](#18-渐变gradient)
19. [阴影](#19-阴影)
20. [滤镜与混合模式](#20-滤镜与混合模式)
21. [自定义属性（CSS 变量）](#21-自定义属性css-变量)
22. [响应式设计](#22-响应式设计)
23. [CSS 组织与命名约定](#23-css-组织与命名约定)
24. [实用模式与代码片段](#24-实用模式与代码片段)
25. [常见问题与陷阱](#25-常见问题与陷阱)

---

## 1. CSS 是怎么工作的

```
HTML 文档
    ↓
浏览器解析 HTML → DOM 树
    ↓
浏览器解析 CSS  → CSSOM 树（CSS Object Model）
    ↓
DOM + CSSOM = Render Tree（渲染树）
    ↓
Layout（布局：计算每个元素的位置和大小）
    ↓
Paint（绘制：逐像素上色）
```

**层叠（Cascade）** 是 CSS 的 C。当多条规则匹配同一个元素时，浏览器按优先级决定哪条生效。

---

## 2. 引入 CSS 的四种方式

```html
<!-- 方式一：外部样式表（推荐） -->
<link rel="stylesheet" href="styles/main.css">

<!-- 方式二：<style> 标签（页面级样式） -->
<style>
  body { font-family: sans-serif; }
</style>

<!-- 方式三：@import（样式表中引入另一个样式表，不推荐，阻塞渲染） -->
<style>
  @import url('theme.css');
</style>

<!-- 方式四：行内样式（优先级最高，但不推荐） -->
<p style="color: red; font-size: 16px;">行内样式</p>
```

**优先级（由低到高）**：外部样式表 < `<style>` < 行内样式 < `!important`

**`!important` 是核武器，少用。** 滥用会让样式无法覆盖。

---

## 3. 选择器全解

### 3.1 基础选择器

```css
/* 类型选择器（标签名） */
p { color: #333; }
h1, h2, h3 { font-family: sans-serif; }   /* 群组选择器 */

/* 类选择器（最常用） */
.card { border: 1px solid #ccc; }
.text-center { text-align: center; }

/* ID 选择器（尽量不用，权重太高难以覆盖） */
#header { background: #000; }

/* 通配选择器（匹配一切，慎用） */
* { box-sizing: border-box; }
```

### 3.2 组合选择器

```html
<!-- 示例 HTML -->
<div class="container">
  <p>第一个段落</p>
  <p>第二个段落</p>
  <div>
    <p>嵌套的段落</p>
  </div>
</div>
<p>外部段落</p>
```

```css
/* 后代选择器（空格：所有后代，不管多少层） */
.container p { color: blue; }
/* 匹配：三个 p 全中 */

/* 子代选择器（>：只选直接子元素） */
.container > p { color: red; }
/* 匹配：只有前两个 p（直接子元素），嵌套的那个不匹配 */

/* 相邻兄弟选择器（+：紧挨着的下一个兄弟） */
h2 + p { margin-top: 0; }
/* 匹配：紧跟在 h2 后面的那个 p */

/* 通用兄弟选择器（~：所有后续兄弟） */
h2 ~ p { color: gray; }
/* 匹配：h2 之后的全部 p */

/* 交集选择器（紧挨着写，同时满足多个条件） */
p.highlight { background: yellow; }
/* 匹配：带有 highlight 类的 p */
```

### 3.3 属性选择器

```css
/* 有该属性 */
[title] { cursor: help; }

/* 属性等于某值 */
[type="email"] { border-color: blue; }

/* 属性值以某字符串开头 */
[href^="https://"] { color: green; }

/* 属性值以某字符串结尾 */
[href$=".pdf"] { background: url(pdf-icon.svg) no-repeat; }
/* 匹配：所有 PDF 链接 */

/* 属性值包含某字符串 */
[class*="btn"] { border-radius: 4px; }
/* 匹配：class 中含有 "btn" 的元素，如 btn-primary、my-btn 等 */

/* 属性值包含完整单词 */
[class~="card"] { padding: 16px; }

/* 属性值等于或以某值-开头 */
[lang|="zh"] { font-family: "Noto Sans SC", sans-serif; }
/* 匹配：lang="zh"、lang="zh-CN"、lang="zh-TW" */
```

### 3.4 伪类（选中元素的特定状态）

```css
/* ===== 链接与交互状态 ===== */
a:link { color: blue; }         /* 未访问 */
a:visited { color: purple; }    /* 已访问 */
a:hover { text-decoration: underline; }   /* 鼠标悬浮 */
a:active { color: red; }        /* 点击瞬间 */
/* ⚠️ 必须按这个顺序写：link → visited → hover → active */

button:focus { outline: 2px solid #42b883; }  /* 获得焦点 */
input:focus-visible { outline: 2px solid blue; }  /* 键盘焦点才显示 */

/* ===== 表单状态 ===== */
input:disabled { opacity: 0.5; }
input:enabled { border-color: green; }
input:checked + label { font-weight: bold; }   /* 复选框选中 */
input:required { border-left: 3px solid red; }
input:optional { border-left: 3px solid gray; }
input:valid { border-color: green; }           /* 格式有效 */
input:invalid { border-color: red; }           /* 格式无效 */
input:placeholder-shown { border-style: dashed; }  /* placeholder 还在时 */
input:in-range { background: #e8f5e9; }        /* 数字在范围内 */
input:out-of-range { background: #fce4ec; }    /* 数字超出范围 */

/* ===== 结构性伪类 ===== */
li:first-child { color: blue; }     /* 第一个 li */
li:last-child { color: red; }       /* 最后一个 */
li:first-of-type { font-weight: bold; }  /* 同类型中的第一个 */
li:last-of-type { border-bottom: none; }

li:nth-child(2) { background: yellow; }           /* 第 2 个 */
li:nth-child(odd) { background: #f0f0f0; }       /* 奇数 */
li:nth-child(even) { background: #fff; }          /* 偶数 */
li:nth-child(3n+1) { margin-top: 0; }            /* 第 1,4,7,10... */
/* 3n+1 = 从第 1 个开始，每 3 个一组 */

li:nth-last-child(1) { /* 倒数第一个（同 last-child） */ }
li:nth-of-type(2n) { /* 同类型中的偶数 */ }

/* 反向索引 */
li:nth-last-child(-n+3) { font-weight: bold; }
/* 最后 3 个 */

li:only-child { /* 唯一的子元素 */ }
p:only-of-type { /* 同类型中唯一 */ }
div:empty { display: none; }       /* 没有子元素 */

/* ===== 其他伪类 ===== */
details:open { background: #f5f5f5; }    /* summary 展开时 */
dialog:modal { /* 模态对话框（浏览器支持有限） */ }
:target { background: yellow; }          /* URL hash 指向的元素 */
```

### 3.5 伪元素（创建虚拟元素）

```css
/* ::before / ::after —— 最常用的两个 */
.quote::before {
  content: "「";
}
.quote::after {
  content: "」";
}

/* 清除浮动（经典用法） */
.clearfix::after {
  content: "";
  display: table;
  clear: both;
}

/* ::first-line —— 第一行 */
p::first-line {
  font-weight: bold;
}

/* ::first-letter —— 首字下沉 */
p.intro::first-letter {
  float: left;
  font-size: 4em;
  line-height: 1;
  margin-right: 8px;
  color: #42b883;
}

/* ::selection —— 用户选中文本的样式 */
::selection {
  background: #42b883;
  color: white;
}

/* ::placeholder —— 输入框占位文本 */
input::placeholder {
  color: #999;
  font-style: italic;
}

/* ::marker —— 列表项标记 */
li::marker {
  color: #42b883;
  font-weight: bold;
}

/* ::backdrop —— dialog 弹窗背景 */
dialog::backdrop {
  background: rgba(0,0,0,0.6);
  backdrop-filter: blur(4px);
}
```

### 3.6 选择器综合示例

```html
<nav class="main-nav">
  <ul>
    <li><a href="/">首页</a></li>
    <li><a href="/blog/">博客</a></li>
    <li><a href="/about/">关于</a></li>
  </ul>
</nav>

<table class="data-table">
  <thead><tr><th>姓名</th><th>年龄</th></tr></thead>
  <tbody>
    <tr><td>Alice</td><td>25</td></tr>
    <tr><td>Bob</td><td>30</td></tr>
    <tr><td>Carol</td><td>28</td></tr>
    <tr><td>Dave</td><td>22</td></tr>
  </tbody>
</table>
```

```css
/* 导航：最后一个项目的右边框去掉 */
.main-nav li:last-child a::after {
  content: "";
}

/* 表格：斑马条纹 */
.data-table tbody tr:nth-child(even) {
  background-color: #f5f5f5;
}

/* 表格：鼠标悬浮高亮 */
.data-table tbody tr:hover {
  background-color: #e8f4fd;
}

/* 表格：第一列加粗 */
.data-table td:first-child {
  font-weight: bold;
}
```

---

## 4. 优先级与层叠

当多个规则冲突时，浏览器按以下规则决定胜者：

### 4.1 优先级计算

```
!important > 行内样式 > ID > 类/属性/伪类 > 类型/伪元素 > 通配符

具体计分（a, b, c）：
  a = ID 选择器数量
  b = 类/属性/伪类选择器数量
  c = 类型/伪元素选择器数量

示例：
  p                    → (0, 0, 1)   = 1
  .card                → (0, 1, 0)   = 10
  #header              → (1, 0, 0)   = 100
  #header .card        → (1, 1, 0)   = 110
  #header .card p      → (1, 1, 1)   = 111
  .card p.highlight    → (0, 2, 1)   = 21
  p:first-child        → (0, 1, 1)   = 11
  *                    → (0, 0, 0)   = 0
  行内样式              → (1, 0, 0, 0) = 1000
  !important           → 最高
```

```css
/* 优先级演示 */
p { color: black; }              /* 0,0,1 */
article p { color: gray; }       /* 0,0,2 → 这条生效 */
.card p { color: blue; }         /* 0,1,1 → 这条生效（类选择器权重更高） */
#main-content p { color: red; }  /* 1,0,1 → 这条生效（ID 最高） */
```

### 4.2 层叠顺序

优先级相同时，**后写的覆盖先写的**。因此：

```css
/* ✅ 正确的顺序（link → visited → hover → active） */
a:link    { color: blue; }
a:visited { color: purple; }
a:hover   { color: red; }    /* hover 在 visited 之后，所以悬停时是红色 */
a:active  { color: orange; }
```

### 4.3 优先级的实用建议

1. **尽量用类选择器**，避免 ID 选择器（权重太高，难以覆盖）
2. **不滥用 !important**，把它当作最后的手段
3. **选择器不宜嵌套太深**（不超过 3 层），否则优先级太高难以维护

---

## 5. 盒模型

### 5.1 标准盒模型

```
┌──────────────────────────────┐
│           margin             │
│  ┌─────────────────────────┐ │
│  │         border          │ │
│  │  ┌───────────────────┐  │ │
│  │  │      padding      │  │ │
│  │  │  ┌─────────────┐  │  │ │
│  │  │  │   content   │  │  │ │
│  │  │  │  (width ×   │  │  │ │
│  │  │  │   height)   │  │  │ │
│  │  │  └─────────────┘  │  │ │
│  │  └───────────────────┘  │ │
│  └─────────────────────────┘ │
└──────────────────────────────┘

标准盒模型（box-sizing: content-box，默认）
  元素宽度 = width + padding + border
  元素高度 = height + padding + border
```

### 5.2 替代盒模型（推荐）

```css
/* 几乎所有现代项目的第一条 CSS 规则 */
*,
*::before,
*::after {
  box-sizing: border-box;
}

/* border-box 下：
   元素宽度 = width（包含 padding 和 border）
   直观：设置 width: 300px，元素就是 300px 宽 */
```

### 5.3 盒模型属性示例

```html
<div class="box">这是一个盒子</div>
```

```css
.box {
  /* 内容尺寸 */
  width: 300px;
  height: 200px;

  /* 内边距 */
  padding: 20px;              /* 四边相同 */
  /* padding: 20px 30px; */          /* 上下 20，左右 30 */
  /* padding: 10px 20px 30px 40px; *//* 上 10，右 20，下 30，左 40 */

  /* 外边距 */
  margin: 10px auto;           /* 上下 10，左右居中 */

  /* 边框 */
  border: 2px solid #333;

  /* 溢出处理 */
  overflow: hidden;            /* hidden / scroll / auto / visible */
}
```

### 5.4 margin 塌陷（经典坑）

```html
<div class="parent" style="background:#f0f0f0">
  <div class="child" style="height:50px; margin-top:30px;">
    我会让父元素也产生 30px 的上边距吗？
  </div>
</div>
```

```css
/* ⚠️ 父元素和子元素的上边距会"合并"（塌陷）
   父元素似乎也多了 30px 的上边距
   解决方案： */
.parent {
  overflow: hidden;       /* 方案一 */
  /* 或 */
  padding-top: 1px;       /* 方案二 */
  /* 或 */
  border-top: 1px solid transparent; /* 方案三 */
  /* 或 */
  display: flow-root;     /* 方案四（最优雅的现代写法） */
}
```

---

## 6. 单位与尺寸

### 6.1 绝对单位

```css
px    /* 像素（最常用） */
pt    /* 点（1pt ≈ 1.333px，打印用） */
cm, mm, in  /* 物理单位（打印用） */
```

### 6.2 相对单位

```css
em    /* 相对于当前元素的 font-size */
rem   /* 相对于根元素 html 的 font-size（推荐） */
%     /* 相对于父元素的百分比 */
vw    /* 视口宽度的 1% */
vh    /* 视口高度的 1% */
vmin  /* vw 和 vh 中较小的 */
vmax  /* vw 和 vh 中较大的 */
```

```css
/* rem 示例：根字号 16px，1rem = 16px */
html {
  font-size: 16px;
}
h1 {
  font-size: 2rem;       /* 32px */
}
p {
  font-size: 1rem;       /* 16px */
  line-height: 1.5;       /* 无单位（相对于自身 font-size）：24px */
}
small {
  font-size: 0.875rem;   /* 14px */
}

/* em 示例：相对于父元素或自身 */
.parent {
  font-size: 20px;
}
.parent .child {
  font-size: 1.5em;      /* 30px（20px × 1.5） */
  padding: 1em;           /* 30px（相对于自身 font-size） */
}

/* vw / vh 示例 */
.hero {
  height: 100vh;          /* 全屏高度 */
  width: 100vw;           /* 全屏宽度 */
}
.half-width {
  width: 50vw;            /* 屏幕一半宽 */
}
```

### 6.3 函数型尺寸

```css
/* min()：取最小值 */
.sidebar {
  width: min(300px, 25vw);   /* 小屏幕 25vw，大屏幕最大 300px */
}

/* max()：取最大值 */
.text {
  font-size: max(1rem, 12px);   /* 不小于 12px */
}

/* clamp()：钳制在区间内（响应式排版利器） */
p {
  font-size: clamp(0.875rem, 1vw + 0.5rem, 1.25rem);
  /* 最小 0.875rem，最大 1.25rem，中间随视口缩放 */
}
```

---

## 7. 颜色

```css
/* 命名颜色（有限） */
color: red;
color: tomato;
color: dodgerblue;

/* 十六进制 */
color: #ff0000;          /* 纯红 */
color: #f00;             /* 简写（同 #ff0000） */
color: #42b883;          /* Vue 绿 */

/* RGB / RGBA */
color: rgb(255, 0, 0);           /* 纯红 */
color: rgba(255, 0, 0, 0.5);    /* 半透明红 */

/* HSL（色相-饱和度-明度，更直观：调亮度比调 RGB 容易） */
color: hsl(0, 100%, 50%);                /* 纯红 */
color: hsl(210, 80%, 60%);               /* 蓝紫色 */
color: hsla(210, 80%, 60%, 0.7);        /* 半透明 */

/* 现代写法（推荐）：去掉逗号，用 / 分隔透明度 */
color: rgb(255 0 0 / 0.5);
color: hsl(210 80% 60% / 0.7);

/* 关键词 */
color: currentColor;     /* 继承当前元素的 color */
color: transparent;      /* 透明 */
```

### 颜色的 UI 中实用搭配

```css
/* 灰色阶梯（设计系统的基础） */
--gray-50:  #fafafa;
--gray-100: #f5f5f5;
--gray-200: #eee;
--gray-300: #e0e0e0;
--gray-400: #bdbdbd;
--gray-500: #9e9e9e;
--gray-600: #757575;
--gray-700: #616161;
--gray-800: #424242;
--gray-900: #212121;
```

---

## 8. 文本与字体

### 8.1 字体属性

```css
body {
  /* 字体栈（按顺序尝试，最后是族名） */
  font-family:
    "Inter",              /* 首选 */
    "Noto Sans SC",       /* 中文字体 */
    -apple-system,        /* macOS 系统字体 */
    BlinkMacSystemFont,   /* Chrome macOS */
    "Segoe UI",           /* Windows */
    Roboto,               /* Android / ChromeOS */
    sans-serif;           /* 兜底：无衬线字体 */

  font-size: 16px;
  font-weight: 400;       /* 100~900。400=normal，700=bold */
  font-style: normal;     /* normal | italic | oblique */
  line-height: 1.6;       /* 行高：无单位值相对于自身 font-size */
  font-variant-numeric: tabular-nums;  /* 等宽数字（表格对齐） */
}

/* @font-face：加载自定义字体 */
@font-face {
  font-family: "Inter";
  src: url("/fonts/Inter-Regular.woff2") format("woff2"),
       url("/fonts/Inter-Regular.woff") format("woff");
  font-weight: 400;
  font-style: normal;
  font-display: swap;          /* 先显示系统字体，加载后替换 */
}
```

### 8.2 文本排版

```css
.article p {
  text-align: justify;       /* 两端对齐 */
  text-indent: 2em;          /* 首行缩进两个汉字 */
  letter-spacing: 0.5px;     /* 字间距 */
  word-spacing: 2px;          /* 词间距（只对空格分隔的单词有效） */
}

/* 多行截断（现代浏览器用 line-clamp） */
.card-summary {
  display: -webkit-box;
  -webkit-line-clamp: 3;      /* 最多 3 行 */
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 单行截断（经典写法） */
.ellipsis {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 文本装饰 */
a { text-decoration: none; }    /* 去掉下划线 */
del { text-decoration: line-through; }
ins { text-decoration: underline; }
.text-underline { text-decoration: underline dotted #42b883; }
/* 支持：solid | double | dotted | dashed | wavy */

/* 文本转换 */
.uppercase { text-transform: uppercase; }
.lowercase { text-transform: lowercase; }
.capitalize { text-transform: capitalize; }   /* 每词首字母大写 */

/* 换行控制 */
.break-all { word-break: break-all; }           /* 任意位置断行 */
.break-word { overflow-wrap: break-word; }      /* 词中断行 */
.nowrap { white-space: nowrap; }                /* 不换行 */
.pre-wrap { white-space: pre-wrap; }            /* 保留空格，自动换行 */

/* 书写模式 */
.vertical-rl {
  writing-mode: vertical-rl;    /* 竖排，从右到左 */
}

/* 文本方向 */
.rtl { direction: rtl; }
```

### 8.3 list-style 列表样式

```css
ul {
  /* 简写 */
  list-style: disc outside;     /* 实心圆点，放在外面 */
  /* 或分开写 */
  list-style-type: square;      /* disc | circle | square | none | 自定义字符串 */
  list-style-image: url(star.svg);
  list-style-position: inside;  /* inside（缩进不齐） | outside（默认） */
}

/* 用 ::marker 定制更有表现力 */
li::marker {
  content: "→ ";
  color: #42b883;
}
```

---

## 9. 背景

```css
/* 纯色背景 */
.box { background-color: #f5f5f5; }

/* 背景图 */
.hero {
  background-image: url("/images/hero.jpg");
  background-size: cover;           /* 填满容器 */
  /* auto | contain（完整显示） | cover（裁剪填满） | 具体值 */
  background-position: center;      /* 图片位置 */
  background-repeat: no-repeat;
}

/* 简写 */
.banner {
  background: url("bg.jpg") center/cover no-repeat;
  /* 顺序无固定要求，但建议：color image position/size repeat */
}

/* 多背景（用逗号分隔） */
.multi-bg {
  background:
    url("top-layer.png") center/cover no-repeat,
    #42b883;                     /* 底色 */
}

/* 渐变背景（详见第 18 节） */
.gradient-box {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* 背景裁切 */
.text-gradient {
  background: linear-gradient(to right, #f00, #00f);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  /* 文字显示渐变色 */
}
```

---

## 10. 边框与轮廓

```css
/* 基本边框 */
.box {
  border: 2px solid #ccc;
  border-radius: 8px;       /* 圆角（最常用的 CSS3 属性之一） */
}

/* 各边不同的边框 */
.card {
  border-top: 3px solid #42b883;
  border-right: none;
  border-bottom: 1px solid #eee;
  border-left: 4px solid #ff6b6b;
}

/* 圆角详解 */
.rounded {
  border-radius: 50%;           /* 正圆（正方形元素） */
  border-radius: 12px 6px 3px 1px;  /* 左上 右上 右下 左下 */
  border-top-left-radius: 0;    /* 单独设置一角 */
}

/* 图片边框（极少用，但知道有） */
.frame {
  border: 10px solid transparent;
  border-image: url("frame.png") 30 round;
}

/* 轮廓（outline：在 border 外面，不占空间） */
button:focus-visible {
  outline: 2px solid #42b883;
  outline-offset: 2px;          /* 与元素边缘的间距 */
}
/* 注意：outline 与 border 不同，不占盒模型空间，不会导致布局变化 */
```

---

## 11. display 属性

`display` 决定了元素在页面上的**表现形态**——是块级？行内？还是弹性容器？

```css
/* 基础显示方式 */
display: block;         /* 块级（独占一行，可设宽高），如 div、p、h1 */
display: inline;        /* 行内（不换行，不可设宽高），如 span、a */
display: inline-block;  /* 行内块（不换行，可设宽高），如 button */
display: none;          /* 隐藏：完全不渲染（与 visibility:hidden 不同） */

/* 弹性盒（Flexbox，第 13 节详述） */
display: flex;
display: inline-flex;   /* 行内弹性容器 */

/* 网格（Grid，第 14 节详述） */
display: grid;
display: inline-grid;

/* 其他 */
display: table;          /* 模拟表格（仅当 HTML 不能改时用） */
display: flow-root;      /* 创建 BFC（清除浮动、阻止 margin 塌陷） */
display: contents;       /* 元素自身消失，子元素提升到父级 */
```

### `display: none` vs `visibility: hidden`

```css
/* display: none —— 元素完全不渲染，不占空间 */
.box-none { display: none; }

/* visibility: hidden —— 元素仍在布局中，只是不可见 */
.box-hidden { visibility: hidden; }

/* opacity: 0 —— 透明但仍在布局中，仍可交互（除非 pointer-events: none） */
.box-opacity { opacity: 0; pointer-events: none; }
```

---

## 12. 定位（position）

`position` 控制元素脱离正常文档流后的放置方式。

### 12.1 五种定位模式

```html
<div class="parent" style="position:relative; height:200px;
     background:#f0f0f0; width:400px;">
  <div class="child-static">static</div>
  <div class="child-relative">relative</div>
  <div class="child-absolute">absolute</div>
  <div class="child-fixed">fixed</div>
  <div class="child-sticky">sticky</div>
</div>
```

```css
/* static —— 默认。正常文档流，忽略 top/left */
.child-static { position: static; }

/* relative —— 相对定位。仍在文档流，但可偏移 */
.child-relative {
  position: relative;
  top: 10px;      /* 向下偏移 10px */
  left: 20px;     /* 向右偏移 20px */
}
/* 用途：1) 微调位置  2) 为子元素 absolute 创建定位父元素 */

/* absolute —— 绝对定位。脱离文档流，相对于最近的定位祖先 */
.child-absolute {
  position: absolute;
  top: 0;
  right: 0;
  /* 定位在父元素的右上角 */
}
/* 定位祖先：最近的 position ≠ static 的祖先元素 */
/* 如果找不到，相对于 <body> */

/* fixed —— 固定定位。相对于视口，滚动不变 */
.child-fixed {
  position: fixed;
  bottom: 20px;
  right: 20px;
  /* 固定在屏幕右下角（回到顶部按钮） */
}

/* sticky —— 粘性定位。滚动到阈值时"卡住" */
.child-sticky {
  position: sticky;
  top: 0;
  /* 表头滚到视口顶部时固定（sticky header） */
}
/* 必须先指定 top / bottom / left / right 中的一个 */
```

### 12.2 定位真实示例

```css
/* 模态框居中 */
.modal-overlay {
  position: fixed;
  inset: 0;                          /* top+right+bottom+left: 0 */
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 角标 */
.badge {
  position: absolute;
  top: -4px;
  right: -4px;
  width: 20px;
  height: 20px;
  background: red;
  color: white;
  border-radius: 50%;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 工具提示 */
.tooltip {
  position: relative;
}
.tooltip::after {
  content: attr(data-tip);
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: #333;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  opacity: 0;
  transition: opacity 0.2s;
  pointer-events: none;
}
.tooltip:hover::after {
  opacity: 1;
}
```

### 12.3 z-index —— 层叠顺序

```css
/* z-index 控制定位元素谁在上面 */
.dropdown-menu {
  position: absolute;
  z-index: 1000;
}
.modal-overlay {
  z-index: 2000;
}
.modal {
  z-index: 2001;
}
.tooltip {
  z-index: 3000;
}

/* ⚠️ z-index 在同一层叠上下文中比较才有效 */
/* 父元素 z-index 低，子元素设再高也上不去 */
```

---

## 13. Flexbox 弹性布局

Flexbox 是**一维**布局系统。一句话：**主轴 + 交叉轴**。

### 13.1 容器属性

```css
.container {
  display: flex;
  /* 或 inline-flex */

  /* 主轴方向 */
  flex-direction: row;            /* 默认：水平 → */
  /* row | row-reverse ← | column ↓ | column-reverse ↑ */

  /* 主轴排列方式 */
  justify-content: flex-start;    /* 默认：靠左 */
  /* flex-start | flex-end | center | space-between | space-around | space-evenly */

  /* 交叉轴排列方式 */
  align-items: stretch;           /* 默认：拉伸填满 */
  /* stretch | flex-start | flex-end | center | baseline */

  /* 多行排列 */
  flex-wrap: nowrap;               /* 默认：不换行 */
  /* nowrap | wrap | wrap-reverse */

  /* 多行间距 */
  align-content: stretch;          /* 类似 align-items 但针对多行 */

  /* 间距（替代 margin 的间隙方案） */
  gap: 16px;                      /* 行间距和列间距相同 */
  /* gap: 16px 8px;  */           /* 行间距 16，列间距 8 */
  row-gap: 20px;
  column-gap: 10px;
}
```

### 13.2 项目属性

```css
.item {
  /* 伸展比例（剩余空间分配） */
  flex-grow: 0;       /* 默认：不伸展 */
  /* 如果设为 1，则平分剩余空间 */

  /* 收缩比例 */
  flex-shrink: 1;     /* 默认：空间不足时等比例收缩 */

  /* 初始大小 */
  flex-basis: auto;   /* 伸展/收缩的基础尺寸 */

  /* 简写 */
  flex: 1;            /* flex-grow: 1; flex-shrink: 1; flex-basis: 0 */
  flex: 1 0 200px;    /* 伸展 1 不收缩 基础 200px —— 侧边栏用 */

  /* 单独的对齐（覆盖 align-items） */
  align-self: flex-start;   /* auto | flex-start | flex-end | center | stretch */

  /* 显示顺序（视觉排序，不改变 DOM） */
  order: 0;           /* 默认 0，负值排前面 */
}
```

### 13.3 Flexbox 经典布局

```html
<!-- 导航栏：logo 左 + 链接右 -->
<header class="navbar">
  <div class="logo">Logo</div>
  <nav class="nav-links">
    <a href="#">首页</a>
    <a href="#">关于</a>
    <a href="#">联系</a>
  </nav>
</header>

<!-- 卡片列表：自适应换行 -->
<div class="card-grid">
  <div class="card">卡片 1</div>
  <div class="card">卡片 2</div>
  <div class="card">卡片 3</div>
  <div class="card">卡片 4</div>
  <div class="card">卡片 5</div>
</div>

<!-- 三栏布局：左右固定 + 中间自适应 -->
<div class="layout">
  <aside class="sidebar-left">左侧栏 200px</aside>
  <main class="content">中间自适应</main>
  <aside class="sidebar-right">右侧栏 300px</aside>
</div>

<!-- 居中对齐 -->
<div class="center-demo">
  <div class="centered">我总是居中</div>
</div>
```

```css
/* 导航栏 */
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 24px;
}
.nav-links {
  display: flex;
  gap: 20px;
}

/* 卡片网格（自适应换行） */
.card-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}
.card {
  flex: 1 1 280px;        /* 最小 280px，空间够时均匀伸展 */
  /* 或 */
  /* width: calc(33.333% - 16px);  固定三列 */
}

/* 圣杯三栏（左右固定 + 中间自适应） */
.layout {
  display: flex;
  gap: 16px;
}
.sidebar-left {
  flex: 0 0 200px;         /* 不伸展 不收缩 固定 200px */
}
.content {
  flex: 1;                 /* 填满剩余空间 */
}
.sidebar-right {
  flex: 0 0 300px;
}

/* 垂直居中 */
.center-demo {
  display: flex;
  justify-content: center;   /* 水平居中 */
  align-items: center;       /* 垂直居中 */
  height: 400px;
}
```

---

## 14. Grid 网格布局

Grid 是**二维**布局系统。和 Flexbox 的区别：Flexbox 是"一排排"，Grid 是"一行行列"。

### 14.1 容器属性

```css
.grid {
  display: grid;

  /* 定义列 */
  grid-template-columns: 200px 1fr 1fr;
  /* 第一列 200px，剩余空间 1:1 分给第二、三列 */

  grid-template-columns: repeat(3, 1fr);
  /* 三等分 */

  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  /* 自适应列数：每列最小 250px，自动换行（不用 media query！） */

  /* 定义行 */
  grid-template-rows: auto 1fr auto;
  /* 头 内容 脚 */

  /* 行间距与列间距 */
  gap: 16px;
  row-gap: 12px;
  column-gap: 24px;

  /* 排列方式（同 Flexbox） */
  justify-items: stretch;       /* 单元格水平对齐 */
  align-items: start;           /* 单元格垂直对齐 */
  place-items: center;          /* 简写：水平和垂直同时居中 */

  justify-content: center;      /* 整个网格的水平对齐（网格总宽小于容器时） */
  align-content: center;
}
```

### 14.2 项目属性

```css
/* 手动放置 */
.item {
  grid-column: 1 / 3;        /* 从第 1 条列线到第 3 条列线（占两列） */
  grid-column: span 2;       /* 跨两列 */
  grid-row: 2 / 4;            /* 从第 2 条行线到第 4 条行线（占两行） */

  /* 简写 */
  grid-area: 1 / 1 / 3 / 3;  /* row-start / col-start / row-end / col-end */
}

/* 单独对齐（覆盖 justify-items / align-items） */
.item {
  justify-self: center;
  align-self: end;
  place-self: center;         /* 简写 */
}
```

### 14.3 grid-template-areas —— 最直观的布局方式

```css
.layout {
  display: grid;
  grid-template-areas:
    "header  header  header"
    "sidebar content aside"
    "footer  footer  footer";
  grid-template-columns: 200px 1fr 250px;
  grid-template-rows: auto 1fr auto;
  gap: 16px;
  min-height: 100vh;
}

.header  { grid-area: header; }
.sidebar { grid-area: sidebar; }
.content { grid-area: content; }
.aside   { grid-area: aside; }
.footer  { grid-area: footer; }
```

```html
<div class="layout">
  <header class="header">页眉</header>
  <nav class="sidebar">侧栏</nav>
  <main class="content">主内容</main>
  <aside class="aside">附加栏</aside>
  <footer class="footer">页脚</footer>
</div>
```

### 14.4 Grid 经典布局

```html
<!-- 博客文章列表（响应式网格） -->
<div class="post-grid">
  <article class="post"><h3>文章 1</h3></article>
  <article class="post"><h3>文章 2</h3></article>
  <article class="post"><h3>文章 3</h3></article>
  <article class="post"><h3>文章 4</h3></article>
  <article class="post"><h3>文章 5</h3></article>
</div>

<!-- 仪表盘 -->
<div class="dashboard">
  <div class="stat stat-large">大盘数据（宽 2 列）</div>
  <div class="stat">指标 1</div>
  <div class="stat">指标 2</div>
  <div class="stat stat-tall">排行榜（高 2 行）</div>
  <div class="stat">指标 3</div>
  <div class="stat">指标 4</div>
</div>
```

```css
/* 响应式文章网格 */
.post-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}
/* 屏幕宽 → 多列；屏幕窄 → 少列，自动！ */

/* 仪表盘 */
.dashboard {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}
.stat-large {
  grid-column: span 2;        /* 跨两列 */
}
.stat-tall {
  grid-row: span 2;            /* 跨两行 */
}
.stat {
  background: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
```

### 14.5 Flexbox vs Grid 选型指南

| 场景 | 用 |
|------|-----|
| 一排按钮/导航链接 | Flexbox |
| 一个方向排列的对齐 | Flexbox |
| 行+列都要控制 | Grid |
| 响应式卡片网格（列数自适应） | Grid（`auto-fill + minmax`） |
| 表单行（标签+输入框） | Grid 或 Flexbox |
| 整体页面布局 | Grid（`grid-template-areas`） |
| 居中一个元素 | Flexbox 或 Grid 都行 |

---

## 15. 变换（Transform）

`transform` 是 CSS3 的核心特性之一，对元素做几何变换而不影响文档流。

```css
/* 平移 */
.box {
  transform: translateX(50px);         /* 右移 50px */
  transform: translateY(-20px);        /* 上移 20px */
  transform: translate(50px, 30px);    /* 右 50，下 30 */
}

/* 缩放 */
.box {
  transform: scale(1.5);               /* 放大 1.5 倍 */
  transform: scaleX(2);                /* 宽度 ×2 */
  transform: scale(0.8, 1.2);          /* 宽 ×0.8，高 ×1.2 */
}

/* 旋转 */
.box {
  transform: rotate(45deg);            /* 顺时针 45° */
  transform: rotate(-30deg);           /* 逆时针 */
  /* 注意：旋转绕元素中心（transform-origin） */
}

/* 倾斜 */
.box {
  transform: skewX(10deg);             /* 水平倾斜 */
  transform: skew(5deg, -5deg);       /* 水平 5°，垂直 -5° */
}

/* 组合变换（顺序重要：从右往左执行） */
.box {
  transform: translateX(100px) rotate(45deg) scale(1.5);
  /* 先缩放 → 再旋转 → 最后平移 */
}

/* 变换中心点 */
.box {
  transform-origin: center center;     /* 默认 */
  transform-origin: top left;          /* 从左上角旋转 */
  transform-origin: 50px 30px;         /* 指定坐标 */
}

/* 3D 变换（需设置透视） */
.container {
  perspective: 800px;                  /* 父元素设透视距离 */
}
.card {
  transform: rotateY(15deg);           /* 绕 Y 轴旋转（翻牌效果） */
  transform: rotateX(10deg);           /* 绕 X 轴旋转 */
}
```

### Transform 实用示例

```css
/* 悬停放大 */
.card {
  transition: transform 0.3s;
}
.card:hover {
  transform: scale(1.05);
}

/* 图标旋转 */
.icon-refresh:active {
  transform: rotate(180deg);
  transition: transform 0.3s;
}

/* 模态框弹入（配合 opacity 用 JS 添加 open 类） */
.modal {
  transform: scale(0.9) translateY(20px);
  opacity: 0;
  transition: all 0.3s;
}
.modal.open {
  transform: scale(1) translateY(0);
  opacity: 1;
}
```

---

## 16. 过渡（Transition）

`transition` 让属性变化变得平滑——从 A 值"过渡"到 B 值。

```css
/* 简写 */
.button {
  background: #42b883;
  transition: background 0.3s ease;
}
.button:hover {
  background: #35495e;
}

/* 完整写法 */
.box {
  /* transition: property duration timing-function delay */
  transition: opacity 0.3s ease-in-out 0.1s;

  /* 多个属性 */
  transition:
    opacity 0.3s ease,
    transform 0.5s cubic-bezier(0.25, 0.1, 0.25, 1);
}

/* 全部过渡属性（不推荐性能差） */
.box {
  transition: all 0.3s;
}
```

### 缓动函数

```css
transition: opacity 0.3s ease;            /* 默认：慢起 快中 慢收 */
transition: opacity 0.3s linear;          /* 匀速 */
transition: opacity 0.3s ease-in;         /* 慢起 急收 */
transition: opacity 0.3s ease-out;        /* 急起 慢收 */
transition: opacity 0.3s ease-in-out;     /* 慢起 慢收 */

/* 自定义贝塞尔曲线 */
transition: all 0.5s cubic-bezier(0.68, -0.55, 0.27, 1.55);
/* 弹性效果 */
```

### Transition 实用示例

```html
<button class="btn-hover">悬停我</button>
<div class="tooltip-trigger">
  鼠标放我上面
  <span class="tooltip-content">这是提示文字</span>
</div>
<nav class="smooth-nav">
  <a href="#">首页</a>
  <a href="#">博客</a>
  <a href="#">关于</a>
</nav>
```

```css
/* 按钮悬停效果 */
.btn-hover {
  background: #42b883;
  color: white;
  border: none;
  padding: 10px 24px;
  border-radius: 6px;
  cursor: pointer;
  transition:
    background 0.3s,
    transform 0.2s,
    box-shadow 0.2s;
}
.btn-hover:hover {
  background: #35495e;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}

/* 工具提示平滑出现/消失 */
.tooltip-trigger {
  position: relative;
  display: inline-block;
}
.tooltip-content {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: #333;
  color: white;
  padding: 6px 12px;
  border-radius: 4px;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.2s, visibility 0.2s;
}
.tooltip-trigger:hover .tooltip-content {
  opacity: 1;
  visibility: visible;
}

/* 导航链接下划线动画 */
.smooth-nav a {
  position: relative;
  text-decoration: none;
  color: #333;
  padding: 4px 0;
}
.smooth-nav a::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 2px;
  background: #42b883;
  transition: width 0.3s;
}
.smooth-nav a:hover::after {
  width: 100%;
}
```

---

## 17. 动画（Animation）

`transition` 是"从 A 到 B 的过渡"，`animation` 是"按时间轴演出一段动画"。

### 17.1 基本用法

```css
/* 定义动画（@keyframes） */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 使用动画 */
.element {
  animation: fadeIn 0.5s ease-out;
}
```

### 17.2 关键帧

```css
/* 用百分比定义多个关键帧 */
@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
    background: #ff6b6b;
  }
  100% {
    transform: scale(1);
    background: #42b883;
  }
}

/* 动画属性 */
.element {
  animation-name: pulse;
  animation-duration: 1.5s;
  animation-timing-function: ease-in-out;
  animation-delay: 0s;
  animation-iteration-count: infinite;  /* 无限循环 | 数字 */
  animation-direction: alternate;       /* 往返 */
  /* normal | reverse | alternate | alternate-reverse */
  animation-fill-mode: forwards;        /* 停留在末尾 */
  /* none | forwards | backwards | both */
  animation-play-state: running;

  /* 简写 */
  animation: pulse 1.5s ease-in-out infinite alternate;
}
```

### 17.3 实用动画库

```css
/* ===== 淡入 ===== */
@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}
.fade-in {
  animation: fadeIn 0.5s ease-out;
}

/* ===== 从底部滑入 ===== */
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.slide-up {
  animation: slideUp 0.4s ease-out;
}

/* ===== 旋转加载器 ===== */
@keyframes spin {
  to { transform: rotate(360deg); }
}
.spinner {
  width: 24px;
  height: 24px;
  border: 3px solid #e0e0e0;
  border-top-color: #42b883;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

/* ===== 骨架屏闪烁 ===== */
@keyframes shimmer {
  0% { background-position: -200px 0; }
  100% { background-position: 200px 0; }
}
.skeleton {
  height: 16px;
  background: linear-gradient(90deg, #eee 25%, #f5f5f5 50%, #eee 75%);
  background-size: 400px 100%;
  animation: shimmer 1.5s ease-in-out infinite;
}

/* ===== 弹跳 ===== */
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
.bounce {
  animation: bounce 0.6s ease infinite;
}
```

### 17.4 滚动触发动画（用 JS 加 class）

```css
/* 配合 Intersection Observer 添加 .visible 类 */
@keyframes revealIn {
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.reveal {
  opacity: 0;
}
.reveal.visible {
  animation: revealIn 0.6s ease-out forwards;
}
```

---

## 18. 渐变（Gradient）

渐变是**背景图像的一种**，不需要图片文件。

```css
/* 线性渐变 */
.gradient-1 {
  background: linear-gradient(#42b883, #35495e);
  /* 默认从上到下 */
}
.gradient-2 {
  background: linear-gradient(to right, #ff6b6b, #ffa502);
  /* 从左到右 */
}
.gradient-3 {
  background: linear-gradient(135deg, #667eea, #764ba2);
  /* 135° 对角线 */
}
.gradient-4 {
  background: linear-gradient(to bottom, #42b883 0%, #35495e 50%, #ff6b6b 100%);
  /* 多个色标 */
}

/* 径向渐变（从中心向外辐射） */
.radial-1 {
  background: radial-gradient(circle, #42b883, #35495e);
}
.radial-2 {
  background: radial-gradient(circle at 20% 50%, #ff6b6b, #ffa502);
  /* 圆心在 (20%, 50%) */
}

/* 圆锥渐变（围绕中心旋转） */
.conic-1 {
  background: conic-gradient(#42b883, #35495e, #ff6b6b, #42b883);
}
.conic-2 {
  background: conic-gradient(from 45deg, #ff6b6b, #42b883, #ffa502);
  /* 从 45° 开始 */
}

/* 重复渐变 */
.repeating-linear {
  background: repeating-linear-gradient(
    45deg,
    #42b883 0px,
    #42b883 10px,
    #35495e 10px,
    #35495e 20px
  );
  /* 条纹图案 */
}
```

### 渐变 HTML 示例

```html
<div class="hero-banner">
  <h1>欢迎</h1>
  <p>使用渐变的英雄横幅</p>
</div>
<div class="stripe-bg">条纹背景</div>
<div class="card-glow">发光卡片</div>
```

```css
/* 英雄横幅 */
.hero-banner {
  height: 400px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
}

/* 条纹背景（类似进度条纹理） */
.stripe-bg {
  padding: 60px;
  background: repeating-linear-gradient(
    -45deg,
    transparent,
    transparent 10px,
    rgba(66, 184, 131, 0.1) 10px,
    rgba(66, 184, 131, 0.1) 20px
  );
}

/* 发光卡片（径向渐变模拟光源） */
.card-glow {
  padding: 32px;
  border-radius: 12px;
  background: radial-gradient(
    circle at 30% 20%,
    rgba(66, 184, 131, 0.15),
    transparent 60%
  ), #fff;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
}
```

---

## 19. 阴影

```css
/* ===== box-shadow ===== */
/* 参数：x偏移 y偏移 模糊 扩散 颜色 */
.card {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  /* 向下 2px，模糊 8px，颜色半透明黑 */
}

/* 内阴影 */
.inset {
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.1);
}

/* 多层阴影（创建深度感） */
.elevated {
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.12),
    0 1px 2px rgba(0, 0, 0, 0.24);
}

.floating {
  box-shadow:
    0 20px 40px rgba(0, 0, 0, 0.08),
    0 5px 10px rgba(0, 0, 0, 0.06),
    0 0 0 1px rgba(0, 0, 0, 0.03);
}

/* 彩色阴影（扩散+颜色） */
.colored-shadow {
  box-shadow: 0 0 0 4px rgba(66, 184, 131, 0.3);
}

/* ===== text-shadow ===== */
.text-shadow-1 {
  text-shadow: 1px 2px 3px rgba(0, 0, 0, 0.3);
}
.text-shadow-2 {
  text-shadow: 0 0 10px rgba(66, 184, 131, 0.5);
  /* 发光文字 */
}
```

```html
<!-- 阴影的"高度层级" -->
<div class="card-level-1">近距离阴影（如按钮）</div>
<div class="card-level-2">中距离阴影（如卡片）</div>
<div class="card-level-3">远距离阴影（如浮层、模态框）</div>
```

```css
/* 设计系统的阴影层级（参考 Material Design） */
.card-level-1 {
  box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
}
.card-level-2 {
  box-shadow: 0 3px 6px rgba(0,0,0,0.15), 0 2px 4px rgba(0,0,0,0.12);
}
.card-level-3 {
  box-shadow: 0 10px 20px rgba(0,0,0,0.15), 0 3px 6px rgba(0,0,0,0.10);
}
```

---

## 20. 滤镜与混合模式

```css
/* ===== filter ===== */
img.blur { filter: blur(4px); }                     /* 模糊 */
img.brightness { filter: brightness(1.2); }          /* 亮度 */
img.contrast { filter: contrast(1.5); }              /* 对比度 */
img.grayscale { filter: grayscale(1); }              /* 灰度（0~1） */
img.sepia { filter: sepia(0.8); }                    /* 怀旧 */
img.saturate { filter: saturate(2); }                /* 饱和度 */
img.hue-rotate { filter: hue-rotate(90deg); }        /* 色相旋转 */
img.invert { filter: invert(1); }                    /* 反色 */
img.opacity-filter { filter: opacity(0.5); }         /* 透明度 */
img.drop-shadow { filter: drop-shadow(4px 4px 4px rgba(0,0,0,0.5)); }

/* 多滤镜组合 */
img.combined {
  filter: grayscale(0.5) contrast(1.2) brightness(0.9);
}

/* backdrop-filter：对元素后面的内容应用滤镜 */
.glass-panel {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  /* 毛玻璃效果 */
}

/* ===== mix-blend-mode ===== */
/* 控制元素与背景的混合方式 */
.overlay-text {
  mix-blend-mode: multiply;       /* 正片叠底 */
  /* normal | multiply | screen | overlay | darken | lighten |
     color-dodge | color-burn | hard-light | soft-light |
     difference | exclusion */
}

/* background-blend-mode：背景层之间的混合 */
.blended-bg {
  background:
    url("texture.jpg"),
    linear-gradient(135deg, #667eea, #764ba2);
  background-blend-mode: overlay;
}
```

```html
<!-- 毛玻璃卡片 -->
<div class="glass-card">
  <h2>毛玻璃效果</h2>
  <p>背景图透过卡片隐约可见</p>
</div>
```

```css
body {
  background: url("mountains.jpg") center/cover no-repeat;
  min-height: 100vh;
}
.glass-card {
  width: 320px;
  padding: 32px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  text-shadow: 0 1px 2px rgba(0,0,0,0.3);
}
```

---

## 21. 自定义属性（CSS 变量）

CSS 变量的革命性：一次定义，全局使用；运行时修改，全网联动。

```css
/* 定义（通常在 :root 中定义全局变量） */
:root {
  --color-primary: #42b883;
  --color-primary-dark: #35495e;
  --color-bg: #ffffff;
  --color-text: #333333;
  --color-text-light: #666666;
  --color-border: #e0e0e0;

  --font-sans: "Inter", -apple-system, sans-serif;
  --font-mono: "Fira Code", monospace;

  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  --spacing-2xl: 48px;

  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;

  --shadow-sm: 0 1px 3px rgba(0,0,0,0.12);
  --shadow-md: 0 3px 6px rgba(0,0,0,0.15);
  --shadow-lg: 0 10px 20px rgba(0,0,0,0.15);
}
```

```css
/* 使用变量 */
body {
  background: var(--color-bg);
  color: var(--color-text);
  font-family: var(--font-sans);
}

.button {
  background: var(--color-primary);
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
}

/* 带默认值（如果变量未定义，用默认值） */
.card {
  background: var(--card-bg, #ffffff);
  /* 如果 --card-bg 未定义，用 #ffffff */
}
```

### 暗色模式（用变量一行切换）

```css
:root {
  --bg: #ffffff;
  --text: #333333;
  --card-bg: #f5f5f5;
}

[data-theme="dark"] {
  --bg: #1a1a2e;
  --text: #e0e0e0;
  --card-bg: #16213e;
}

body {
  background: var(--bg);
  color: var(--text);
}

.card {
  background: var(--card-bg);
}

/* 也可以用 prefers-color-scheme 媒体查询自动检测 */
@media (prefers-color-scheme: dark) {
  :root {
    --bg: #1a1a2e;
    --text: #e0e0e0;
    --card-bg: #16213e;
  }
}
```

```html
<button onclick="document.documentElement.setAttribute(
  'data-theme',
  document.documentElement.getAttribute('data-theme') === 'dark'
    ? 'light' : 'dark'
)">
  切换主题
</button>
```

---

## 22. 响应式设计

### 22.1 媒体查询（Media Queries）

```css
/* 移动优先（推荐）：先写小屏样式，再用 min-width 覆盖 */

/* 基础样式：手机 */
.card { padding: 12px; }
.grid { grid-template-columns: 1fr; }

/* 平板（≥ 768px） */
@media (min-width: 768px) {
  .card { padding: 20px; }
  .grid { grid-template-columns: repeat(2, 1fr); }
}

/* 桌面（≥ 1024px） */
@media (min-width: 1024px) {
  .grid { grid-template-columns: repeat(3, 1fr); }
}

/* 宽屏（≥ 1440px） */
@media (min-width: 1440px) {
  .container { max-width: 1200px; }
}

/* 打印 */
@media print {
  .no-print { display: none; }
  body { font-size: 12pt; }
}

/* 暗色模式 */
@media (prefers-color-scheme: dark) {
  body { background: #1a1a2e; color: #e0e0e0; }
}

/* 减少动画 */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}

/* 高对比度 */
@media (prefers-contrast: high) {
  body { color: #000; background: #fff; }
}
```

### 22.2 容器查询（Container Queries，2023+）

不再基于"视口多大"，而是基于"容器多大"。——组件级响应式。

```css
/* 定义容器 */
.card-container {
  container-type: inline-size;
  container-name: card;
}

/* 基于容器宽度设置样式 */
@container card (min-width: 400px) {
  .card {
    display: flex;
    gap: 16px;
  }
  .card-image {
    width: 40%;
  }
}

@container card (max-width: 399px) {
  .card {
    display: block;
  }
  .card-image {
    width: 100%;
  }
}
```

### 22.3 响应式排版

```css
/* 使用 clamp 实现流畅缩放（不用媒体查询） */
h1 {
  font-size: clamp(1.5rem, 4vw, 3rem);
}
p {
  font-size: clamp(0.875rem, 1vw + 0.5rem, 1.125rem);
}

/* 或使用媒体查询 */
@media (max-width: 600px) {
  h1 { font-size: 1.5rem; }
}
@media (min-width: 601px) and (max-width: 1024px) {
  h1 { font-size: 2rem; }
}
@media (min-width: 1025px) {
  h1 { font-size: 3rem; }
}
```

### 22.4 元视口标签（HTML，但驱动响应式）

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<!-- 没有这行，移动端页面会按 980px 渲染，所有响应式 CSS 失效 -->
```

---

## 23. CSS 组织与命名约定

### 23.1 样式放置顺序

```css
/* 推荐的属性书写顺序（提高可读性） */
.element {
  /* 1. 定位 */
  position: relative;
  top: 0;
  z-index: 1;

  /* 2. 盒模型 */
  display: flex;
  width: 100%;
  height: auto;
  margin: 0;
  padding: 0;

  /* 3. 排版 */
  font-size: 1rem;
  line-height: 1.5;
  text-align: center;

  /* 4. 视觉 */
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);

  /* 5. 其他 */
  cursor: pointer;
  transition: all 0.3s;
}
```

### 23.2 BEM 命名约定

```css
/* BEM = Block（块）__Element（元素）--Modifier（修饰符） */
/* Block：独立的组件 */
/* Element：块的组成部分 */
/* Modifier：状态或变体 */

/* 块 */
.card { padding: 16px; }

/* 块__元素 */
.card__header { font-weight: bold; }
.card__body { margin-top: 8px; }
.card__footer { margin-top: 12px; border-top: 1px solid #eee; }

/* 块--修饰符 */
.card--featured { border-left: 4px solid #42b883; }
.card--large { padding: 32px; }
.card--disabled { opacity: 0.5; }

/* HTML 使用 */
/*
<div class="card card--featured card--large">
  <div class="card__header">标题</div>
  <div class="card__body">内容</div>
  <div class="card__footer">页脚</div>
</div>
*/
```

---

## 24. 实用模式与代码片段

### 24.1 CSS Reset / Normalize（最小化浏览器差异）

```css
/* 最小 reset */
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}

img, picture, video, canvas, svg {
  display: block;
  max-width: 100%;
}

input, button, textarea, select {
  font: inherit;
}

a {
  color: inherit;
  text-decoration: none;
}
```

### 24.2 常用组件片段

```html
<!-- 按钮 -->
<button class="btn btn-primary">主要按钮</button>
<button class="btn btn-outline">次要按钮</button>
<button class="btn btn-danger">危险按钮</button>
<button class="btn btn-primary" disabled>禁用状态</button>

<!-- 输入框 -->
<div class="form-group">
  <label for="email" class="input-label">邮箱</label>
  <input type="email" id="email" class="input-text"
         placeholder="your@email.com">
</div>

<!-- 卡片 -->
<article class="card">
  <img class="card-img" src="photo.jpg" alt="...">
  <div class="card-body">
    <h3 class="card-title">卡片标题</h3>
    <p class="card-text">卡片内容描述</p>
  </div>
</article>
```

```css
/* ===== 按钮系统 ===== */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 20px;
  border: 2px solid transparent;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-primary {
  background: var(--color-primary);
  color: white;
}
.btn-primary:hover {
  background: var(--color-primary-dark);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(66, 184, 131, 0.3);
}
.btn-outline {
  background: transparent;
  color: var(--color-primary);
  border-color: var(--color-primary);
}
.btn-outline:hover {
  background: var(--color-primary);
  color: white;
}
.btn-danger {
  background: #ff4757;
  color: white;
}
.btn-danger:hover {
  background: #ee3a4a;
}
.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

/* ===== 输入框 ===== */
.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.input-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text);
}
.input-text {
  padding: 8px 12px;
  border: 2px solid var(--color-border);
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s;
}
.input-text:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(66, 184, 131, 0.15);
}
.input-text::placeholder {
  color: #aaa;
}
.input-text:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
}

/* ===== 卡片 ===== */
.card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: transform 0.2s, box-shadow 0.2s;
}
.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
}
.card-img {
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
}
.card-body {
  padding: 20px;
}
.card-title {
  font-size: 18px;
  margin-bottom: 8px;
}
.card-text {
  color: var(--color-text-light);
  font-size: 14px;
  line-height: 1.6;
}
```

### 24.3 全局实用工具类

```css
/* 文本对其 */
.text-left   { text-align: left; }
.text-center { text-align: center; }
.text-right  { text-align: right; }

/* 间距 */
.mt-sm { margin-top: 8px; }
.mt-md { margin-top: 16px; }
.mt-lg { margin-top: 24px; }
.mb-sm { margin-bottom: 8px; }
.p-sm  { padding: 8px; }
.p-md  { padding: 16px; }
.p-lg  { padding: 24px; }

/* 显示 */
.hidden    { display: none; }
.block     { display: block; }
.inline    { display: inline; }
.flex      { display: flex; }
.grid      { display: grid; }

/* Flex 简写 */
.flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}
.flex-between {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* 屏幕阅读器专用（看不到但能被读屏软件读取） */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

---

## 25. 常见问题与陷阱

1. **margin 塌陷（父子/兄弟）**
   父子或兄弟元素之间的上下 margin 会合并，取最大值。用 `display: flow-root` 或 `overflow: hidden` 或 padding/border 阻止。

2. **z-index 不生效** —— 被父元素截断。z-index 只在**同一层叠上下文**内比较。检查祖先是否创建了新层叠上下文（`opacity < 1`、`transform`、`position: fixed` 等都会）。

3. **`100vh` 在移动端有 bug** —— 移动浏览器的地址栏会压缩视口，`100vh` 比实际可视区域高。用 `dvh`（dynamic viewport height）替代：`height: 100dvh`。

4. **`box-sizing: content-box` 是默认值** —— 设置 `width: 300px; padding: 20px;` 实际宽度是 340px。永远在项目开头设置 `*, *::before, *::after { box-sizing: border-box; }`。

5. **Flexbox 的子元素 `flex-basis` 基础** —— `flex: 1` 等价于 `flex: 1 1 0`，基础尺寸是 0，会完全按比例分配。`flex: auto` 等价于 `flex: 1 1 auto`，先保留固有尺寸再分配剩余空间。

6. **Grid 的 `1fr` 不等于 `%`** —— `1fr` 分配的是**可用空间**（容器减去 gap 和固定尺寸列之后的），而 `25%` 是容器宽度的 25%（可能溢出）。

7. **`inline-block` 元素之间有间隙** —— 这是 HTML 中标签之间的空白字符造成的。解决方案：父元素 `font-size: 0` 再在子元素恢复，或用 Flexbox 替代。

8. **`overflow: hidden` 会裁剪内容** —— 不是真的"隐藏溢出"，而是裁剪。如果子元素有 `position: absolute` 且超出容器，也会被裁。

9. **`transition` 不能从 `auto` 过渡** —— `height: auto` 到 `height: 100px` 没有过渡。用 `max-height` 技巧或用 JS 计算。

10. **`@import` 阻塞渲染** —— `@import` 是串行加载，外部 CSS 中的 `@import` 会阻塞后续 CSS 的下载。用 `<link>` 替代。

11. **渐变中的 `transparent` 可能不是你期望的** —— 在 `linear-gradient(transparent, red)` 中，`transparent` = `rgba(0,0,0,0)`。如果要淡出一个颜色，显式写 `rgba(255,255,255,0)`。

12. **`position: sticky` 不生效** —— 检查：
    - 是否指定了 `top/bottom/left/right`
    - 父元素是否有 `overflow: hidden`（会禁用 sticky）
    - 父元素高度是否大于 sticky 元素

13. **`gap` 在旧 Flexbox 实现中不兼容** —— Safari 14 以下不支持 Flexbox 中的 `gap`。可以用 `margin` 配合 `:not(:last-child)` 替代。

14. **不要给 `html` 设 `font-size: 62.5%`（10px 技巧）** —— 这是为了 `1rem = 10px` 方便心算，但会破坏用户设置的默认字体大小。直接用 `16px` 基准。

15. **`:focus` vs `:focus-visible`** —— `:focus` 在所有聚焦方式下都触发（包括鼠标点击），`:focus-visible` 只在键盘聚焦时触发。优先用 `:focus-visible` 做样式，避免鼠标点击后出现难看的聚焦框。
