# HTML —— 超文本标记语言

> 网页的骨架。不是编程语言，是标记语言。
> 从 HTML 4.01（1999）到 HTML5（2014→Living Standard），二十余年进化。
> 规范：HTML Living Standard · [html.spec.whatwg.org](https://html.spec.whatwg.org)
> 学习参考：[developer.mozilla.org/zh-CN/docs/Web/HTML](https://developer.mozilla.org/zh-CN/docs/Web/HTML)

> **关于"完整"**：HTML 规范超过 1000 页，没有人能背下所有标签。但本文件覆盖了你实际开发中 95% 会遇到的场景。更重要的是，给出了每种标签的**使用语境**和**真实示例**，这是 MDN 做不到的。

---

## 目录

1. [HTML 是什么](#1-html-是什么)
2. [一棵文档树](#2-一棵文档树)
3. [`<head>` —— 页面的"元信息"](#3-head--页面的元信息)
4. [文本与段落（HTML4）](#4-文本与段落html4)
5. [列表](#5-列表)
6. [链接与图片](#6-链接与图片)
7. [表格](#7-表格)
8. [表单](#8-表单)
9. [通用容器与内联元素](#9-通用容器与内联元素)
10. [HTML5 语义化结构](#10-html5-语义化结构)
11. [HTML5 多媒体](#11-html5-多媒体)
12. [HTML5 表单增强](#12-html5-表单增强)
13. [HTML5 交互组件](#13-html5-交互组件)
14. [HTML5 Canvas 与 SVG](#14-html5-canvas-与-svg)
15. [HTML5 API（简要索引）](#15-html5-api简要索引)
16. [全局属性速查](#16-全局属性速查)
17. [字符实体速查](#17-字符实体速查)
18. [特殊标签：iframe / object / embed](#18-特殊标签iframe--object--embed)
19. [HTML 与 SEO](#19-html-与-seo)
20. [HTML 与无障碍（A11Y）](#20-html-与无障碍a11y)
21. [完整的页面示例](#21-完整的页面示例)
22. [标签索引（按功能分类）](#22-标签索引按功能分类)
23. [常见错误与陷阱](#23-常见错误与陷阱)

---

## 1. HTML 是什么

```
        用户请求 URL
              │
              ▼
    ┌──────────────────┐
    │   浏览器 (Browser) │
    │   ┌──────────────┐ │
    │   │ HTML  → DOM 树 │ │
    │   │ CSS   → 样式 │ │
    │   │ JS    → 交互 │ │
    │   └──────────────┘ │
    └──────────────────┘
              │
              ▼
          你看到的页面
```

HTML（HyperText Markup Language）用**标签**（tags）标记内容的结构和语义。它回答"这是什么"——这是段落、那是标题、这是一个输入框。

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>我的网页</title>
</head>
<body>
  <h1>你好，世界</h1>
  <p>这是我的第一个网页。</p>
</body>
</html>
```

**HTML4 vs HTML5 一句话**：HTML4 是"用标签排版"，HTML5 在此基础上加了三件事 —— **语义化**（让机器读懂内容）、**多媒体原生支持**、**更强大的表单与 API**。

---

## 2. 一棵文档树

HTML 文档被浏览器解析为一棵 **DOM 树**（Document Object Model）：

```
html
├── head
│   ├── meta (charset)
│   ├── title "页面标题"
│   └── link (stylesheet)
└── body
    ├── header
    │   ├── h1 "我的博客"
    │   └── nav
    │       └── a "首页"  a "关于"
    ├── main
    │   ├── article
    │   │   ├── h2 "第一篇文章"
    │   │   └── p "文章内容…"
    │   └── article
    │       ├── h2 "第二篇文章"
    │       └── p "更多内容…"
    └── footer
        └── p "© 2025"
```

理解 DOM 树很重要，因为 CSS 选择器和 JavaScript 都在这棵树上工作。

**嵌套规则**：
- 块级元素可以包含块级和内联元素
- 内联元素只能包含内联元素（不能包块级）
- 某些标签有固定的父子关系（如 `<ul>` 的直接子元素只能是 `<li>`）

---

## 3. `<head>` —— 页面的"元信息"

`<head>` 中的内容不直接显示在页面上，但决定了页面如何被浏览器、搜索引擎、社交平台理解和处理。

### 3.1 最精简的 head

```html
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>页面标题</title>
</head>
```

### 3.2 生产级的 head

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <!-- 字符编码 -->
  <meta charset="UTF-8">

  <!-- 视口（移动端必需） -->
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <!-- 浏览器标签页标题 -->
  <title>我的网站 - 首页</title>

  <!-- SEO 描述 -->
  <meta name="description" content="一个关于前端开发、设计和生活的个人网站。">
  <meta name="keywords" content="前端, HTML, CSS, JavaScript">
  <meta name="author" content="Your Name">

  <!-- 禁止搜索引擎索引（开发时不想要） -->
  <!-- <meta name="robots" content="noindex, nofollow"> -->

  <!-- Open Graph（分享到社交平台时的预览） -->
  <meta property="og:title" content="我的网站">
  <meta property="og:description" content="一个很棒的网站">
  <meta property="og:image" content="https://example.com/og-image.jpg">
  <meta property="og:url" content="https://example.com">
  <meta property="og:type" content="website">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="我的网站">
  <meta name="twitter:description" content="一个很棒的网站">

  <!-- Favicon -->
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">

  <!-- 样式 -->
  <link rel="stylesheet" href="/styles/main.css">

  <!-- 预加载关键资源 -->
  <link rel="preload" href="/fonts/main.woff2" as="font" crossorigin>

  <!-- 外部脚本（defer：HTML 解析完再执行） -->
  <script src="/scripts/main.js" defer></script>
</head>
```

### 3.3 head 中包含可渲染的内容吗？

正常情况下不会。但如果你忘了 `<body>`，某些浏览器会自动补全，导致 `<head>` 的内容跑到 `<body>` 里。一个经典的 bug：

```html
<html>
<head>
  <title>Test</title>
  <!-- 下面这行 p 标签会被浏览器自动移到 body 里 -->
  <p>这不会显示在 head 中（浏览器会自动修正）</p>
</head>
```

---

## 4. 文本与段落（HTML4）

### 4.1 标题 h1～h6

```html
<!-- 一个页面应该只有一个 h1（代表页面主题） -->
<h1>一级标题：页面主题</h1>
<h2>二级标题：大章节</h2>
<h3>三级标题：子章节</h3>
<h4>四级标题：小节</h4>
<h5>五级标题：更细的小节</h5>
<h6>六级标题：最细的层级</h6>

<!-- ❌ 不要为大小跳级，h1 之后是 h2，不是 h3 -->
<!-- ❌ 不要为了字体大小用标题标签，用 CSS -->
```

### 4.2 段落与换行

```html
<p>这是一个段落。段落之间会有默认的间距。</p>
<p>
  这是第二个段落。段落内可以很长很长很长很长很长很长
  很长很长很长很长很长很长很长很长很长很长很长很长。
  浏览器会自动换行。
</p>

<!-- 换行（通常用于诗歌、地址等） -->
<p>
  床前明月光，<br>
  疑是地上霜。<br>
  举头望明月，<br>
  低头思故乡。
</p>

<!-- 水平线（语义上是主题分隔，不用来画线（用 CSS）） -->
<hr>
```

### 4.3 文本语义标签（HTML4）

```html
<!-- 强调 -->
<em>强调（斜体）</em>
<strong>重要（粗体）</strong>

<!-- 引用 -->
<cite>《红楼梦》</cite> —— 书名、作品名
<q>这是一句行内引用</q> —— 自动加引号
<blockquote cite="https://source.com">
  <p>这是块级引用。浏览器会缩进显示。</p>
  <footer>—— 引用来源</footer>
</blockquote>

<!-- 代码与预格式化 -->
<code>console.log('hello')</code>        <!-- 行内代码 -->
<pre>                                    <!-- 预格式化：保留空格和换行 -->
  function hello() {
    console.log('hello')
  }
</pre>
<samp>输出：hello world</samp>           <!-- 程序输出示例 -->
<kbd>Ctrl + S</kbd>                     <!-- 键盘输入 -->
<var>x</var>                             <!-- 变量 -->

<!-- 上下标 -->
H<sub>2</sub>O                           <!-- 下标 -->
x<sup>2</sup> + y<sup>2</sup>           <!-- 上标 -->

<!-- 其他 -->
<abbr title="HyperText Markup Language">HTML</abbr>  <!-- 缩写（悬浮显示完整） -->
<dfn>HTML</dfn>                          <!-- 定义术语（首次使用的术语） -->
<del>已删除的文本</del>                   <!-- 删除线 -->
<ins>新插入的文本</ins>                   <!-- 下划线（表示插入） -->
<s>不再准确的文本</s>                     <!-- 删除线（不推荐内容） -->
<small>小号文本（通常用于声明/注释）</small>
<b>粗体（无特殊语义，仅视觉）</b>
<i>斜体（无特殊语义，技术术语、外语等）</i>
<u>下划线（无特殊语义，专有名词拼写错误等）</u>

<address>                                <!-- 联系信息 -->
  联系方式：北京市海淀区<br>
  电话：123-4567
</address>
```

### 4.4 列表（将在第 5 节详细展开）

```html
<!-- 无序列表 -->
<ul>
  <li>苹果</li>
  <li>香蕉</li>
  <li>橙子</li>
</ul>

<!-- 有序列表 -->
<ol>
  <li>打开冰箱</li>
  <li>放入大象</li>
  <li>关上冰箱</li>
</ol>

<!-- 定义列表 -->
<dl>
  <dt>HTML</dt>
  <dd>超文本标记语言</dd>
  <dt>CSS</dt>
  <dd>层叠样式表</dd>
</dl>
```

---

## 5. 列表

### 5.1 无序列表 ul

```html
<!-- 基本用法 -->
<ul>
  <li>咖啡</li>
  <li>茶</li>
  <li>牛奶</li>
</ul>

<!-- 嵌套列表（导航菜单的经典结构） -->
<ul>
  <li>
    前端
    <ul>
      <li>HTML</li>
      <li>CSS</li>
      <li>
        JavaScript
        <ul>
          <li>Vue</li>
          <li>React</li>
        </ul>
      </li>
    </ul>
  </li>
  <li>后端</li>
  <li>设计</li>
</ul>
```

### 5.2 有序列表 ol

```html
<!-- 基本 -->
<ol>
  <li>第一步</li>
  <li>第二步</li>
  <li>第三步</li>
</ol>

<!-- 自定义序号 -->
<ol type="A">              <!-- 大写字母 A, B, C... -->
  <li>选项一</li>
  <li>选项二</li>
</ol>
<ol type="a">              <!-- 小写字母 a, b, c... -->
<ol type="I">              <!-- 大写罗马数字 I, II, III... -->
<ol type="i">              <!-- 小写罗马数字 -->

<!-- 自定义起始值 -->
<ol start="5">
  <li>从 5 开始</li>
  <li>6</li>
</ol>

<!-- reversed（HTML5，倒序） -->
<ol reversed>
  <li>倒数第三</li>
  <li>倒数第二</li>
  <li>倒数第一（最新）</li>
</ol>
```

### 5.3 定义列表 dl

```html
<dl>
  <dt>HTML</dt>
  <dd>用于创建网页的标准标记语言</dd>
  <dd>最新版本是 HTML5</dd>

  <dt>CSS</dt>
  <dt>层叠样式表</dt> <!-- 多个 dt 也可以 -->
  <dd>用于描述网页样式的语言</dd>
</dl>
```

### 5.4 真实场景 —— 导航菜单

```html
<nav>
  <ul>
    <li><a href="/">首页</a></li>
    <li>
      <a href="/products">产品</a>
      <ul>
        <li><a href="/products/software">软件</a></li>
        <li><a href="/products/hardware">硬件</a></li>
      </ul>
    </li>
    <li><a href="/about">关于</a></li>
  </ul>
</nav>
```

---

## 6. 链接与图片

### 6.1 超链接 a

```html
<!-- 外部链接 -->
<a href="https://example.com">访问 Example</a>

<!-- 新窗口打开（安全：加 noopener noreferrer） -->
<a href="https://example.com" target="_blank" rel="noopener noreferrer">
  新窗口打开
</a>

<!-- 页面内锚点 -->
<a href="#section2">跳转到第二节</a>
<section id="section2">
  <h2>第二节</h2>
  <p>内容...</p>
</section>

<!-- 回到顶部 -->
<a href="#top">回到顶部</a>

<!-- 电子邮件链接 -->
<a href="mailto:someone@example.com">发送邮件</a>
<a href="mailto:someone@example.com?subject=Hello&body=你好">
  发送邮件（带主题和正文）
</a>

<!-- 电话链接（移动端可点击拨打） -->
<a href="tel:+8613800138000">拨打电话</a>

<!-- 下载链接 -->
<a href="/files/report.pdf" download>下载报告</a>
<a href="/files/report.pdf" download="2025-report.pdf">下载（重命名）</a>

<!-- 链接类型（给搜索引擎提示） -->
<a href="https://partner.com" rel="nofollow">不传递权重的链接</a>
<a href="https://sponsored.com" rel="sponsored">赞助链接</a>
<a href="https://friend.com" rel="noopener">不带 opener</a>
```

### 6.2 图片 img

```html
<!-- 基本用法 -->
<img src="photo.jpg" alt="一只在草地上奔跑的金毛犬"
     width="800" height="600">

<!-- srcset：响应式图片（不同分辨率加载不同图片） -->
<img
  src="photo-800.jpg"
  srcset="photo-400.jpg 400w, photo-800.jpg 800w, photo-1200.jpg 1200w"
  sizes="(max-width: 600px) 100vw, 800px"
  alt="响应式图片"
>

<!-- figure + figcaption（带说明的图片组合） -->
<figure>
  <img src="chart.png" alt="2025年季度销售趋势图表">
  <figcaption>图 1：2025 年第一季度销售数据显示显著增长</figcaption>
</figure>

<!-- 图片加载属性 -->
<img src="lazy.jpg" alt="..." loading="lazy">     <!-- 懒加载（滚动到才加载） -->
<img src="eager.jpg" alt="..." loading="eager">   <!-- 立即加载（默认） -->

<!-- ⚠️ alt 属性很重要！ -->
<!-- ✅ 有意义的描述 -->
<img src="logo.png" alt="公司 Logo">
<!-- ✅ 纯装饰用空 alt（屏幕阅读器跳过） -->
<img src="decorative-border.png" alt="">
<!-- ❌ 没有 alt（不合法） -->
```

### 6.3 图片映射（用得不多，但偶尔有用）

```html
<img src="china-map.png" alt="中国地图" usemap="#chinamap">
<map name="chinamap">
  <area shape="rect" coords="0,0,100,100" href="/beijing" alt="北京">
  <area shape="circle" coords="200,150,50" href="/shanghai" alt="上海">
</map>
```

### 6.4 真实场景 —— 图片卡片

```html
<figure class="card">
  <a href="/article/42">
    <img
      src="thumbnail.jpg"
      srcset="thumbnail.jpg 1x, thumbnail@2x.jpg 2x"
      alt="Vue 3.5 新特性一览"
      loading="lazy"
    >
  </a>
  <figcaption>
    <h3><a href="/article/42">Vue 3.5 新特性一览</a></h3>
    <time datetime="2025-06-15">2025年6月15日</time>
  </figcaption>
</figure>
```

---

## 7. 表格

### 7.1 完整表格结构

```html
<table>
  <caption>2025年第一季度销售数据</caption>   <!-- 表格标题 -->
  <colgroup>
    <col style="background: #f0f0f0;">  <!-- 第一列样式 -->
    <col span="3">                        <!-- 三列同类样式 -->
  </colgroup>
  <thead>                                <!-- 表头 -->
    <tr>
      <th scope="col">产品</th>           <!-- scope=col 表示这是列的标题 -->
      <th scope="col">一月</th>
      <th scope="col">二月</th>
      <th scope="col">三月</th>
    </tr>
  </thead>
  <tbody>                                <!-- 表体 -->
    <tr>
      <th scope="row">Widget A</th>      <!-- scope=row 表示这是行的标题 -->
      <td>120</td>
      <td>135</td>
      <td>148</td>
    </tr>
    <tr>
      <th scope="row">Widget B</th>
      <td>89</td>
      <td>92</td>
      <td>101</td>
    </tr>
  </tbody>
  <tfoot>                                <!-- 表尾（合计等） -->
    <tr>
      <th scope="row">合计</th>
      <td>209</td>
      <td>227</td>
      <td>249</td>
    </tr>
  </tfoot>
</table>
```

### 7.2 单元格合并

```html
<table border="1">
  <tr>
    <td colspan="2">横跨两列</td>
    <td>普通单元格</td>
  </tr>
  <tr>
    <td rowspan="2">纵跨两行</td>
    <td>单元格</td>
    <td>单元格</td>
  </tr>
  <tr>
    <td>单元格</td>
    <td>单元格</td>
  </tr>
</table>
```

**colspan / rowspan 常见 bug**：合并后对应行的 td 数量会变，漏掉一个 td 会导致表格错位。

### 7.3 真实场景 —— 对比表

```html
<table>
  <caption>三种方案对比</caption>
  <thead>
    <tr>
      <th>特性</th>
      <th>方案 A</th>
      <th>方案 B</th>
      <th>方案 C</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">价格</th>
      <td>免费</td>
      <td>¥99/月</td>
      <td>¥299/月</td>
    </tr>
    <tr>
      <th scope="row">存储</th>
      <td>5GB</td>
      <td>100GB</td>
      <td>1TB</td>
    </tr>
    <tr>
      <th scope="row">支持</th>
      <td>社区</td>
      <td>邮件</td>
      <td>7×24电话</td>
    </tr>
  </tbody>
</table>
```

---

## 8. 表单

### 8.1 一个完整的表单

```html
<form action="/submit" method="POST" novalidate>
  <!-- 文本输入 -->
  <p>
    <label for="name">姓名：</label>
    <input type="text" id="name" name="name"
           required placeholder="请输入你的姓名"
           minlength="2" maxlength="20">
  </p>

  <!-- 邮箱 -->
  <p>
    <label for="email">邮箱：</label>
    <input type="email" id="email" name="email" required>
  </p>

  <!-- 密码 -->
  <p>
    <label for="password">密码：</label>
    <input type="password" id="password" name="password"
           required minlength="8">
  </p>

  <!-- 单选框 -->
  <fieldset>
    <legend>性别：</legend>
    <label>
      <input type="radio" name="gender" value="male" checked> 男
    </label>
    <label>
      <input type="radio" name="gender" value="female"> 女
    </label>
  </fieldset>

  <!-- 复选框组 -->
  <fieldset>
    <legend>兴趣：</legend>
    <label>
      <input type="checkbox" name="interests" value="coding"> 编程
    </label>
    <label>
      <input type="checkbox" name="interests" value="reading"> 阅读
    </label>
    <label>
      <input type="checkbox" name="interests" value="music"> 音乐
    </label>
  </fieldset>

  <!-- 下拉选择 -->
  <p>
    <label for="country">国家：</label>
    <select id="country" name="country" required>
      <option value="">请选择...</option>
      <optgroup label="亚洲">
        <option value="cn">中国</option>
        <option value="jp">日本</option>
        <option value="kr">韩国</option>
      </optgroup>
      <optgroup label="欧洲">
        <option value="uk">英国</option>
        <option value="fr">法国</option>
      </optgroup>
    </select>
  </p>

  <!-- 多行文本 -->
  <p>
    <label for="bio">个人简介：</label>
    <textarea id="bio" name="bio" rows="4" cols="50"
              maxlength="500"
              placeholder="介绍一下自己..."></textarea>
  </p>

  <!-- 文件上传 -->
  <p>
    <label for="avatar">头像：</label>
    <input type="file" id="avatar" name="avatar"
           accept="image/*">
  </p>

  <!-- 隐藏字段 -->
  <input type="hidden" name="csrf_token" value="abc123">

  <!-- 按钮 -->
  <p>
    <button type="submit">提交</button>
    <button type="reset">重置</button>
    <button type="button" onclick="alert('普通按钮')">普通按钮</button>
  </p>
</form>
```

### 8.2 input 类型一览

```html
<!-- 文本类 -->
<input type="text">           <!-- 普通文本 -->
<input type="password">      <!-- 密码（掩码） -->
<input type="email">         <!-- 邮箱（移动端调邮箱键盘） -->
<input type="url">           <!-- URL -->
<input type="tel">           <!-- 电话（移动端调拨号键盘） -->
<input type="search">        <!-- 搜索（带清除按钮） -->
<input type="number">        <!-- 数字 -->
<input type="range">         <!-- 滑块 -->

<!-- 选择类 -->
<input type="radio">         <!-- 单选 -->
<input type="checkbox">      <!-- 多选 -->

<!-- 文件与按钮 -->
<input type="file">          <!-- 文件上传 -->
<input type="hidden">        <!-- 隐藏字段 -->
<input type="submit">        <!-- 提交按钮 -->
<input type="reset">         <!-- 重置按钮 -->
<input type="button">        <!-- 普通按钮 -->
<input type="image">         <!-- 图片提交按钮 -->

<!-- HTML5 新增日期时间类 -->
<input type="date">          <!-- 日期选择器 -->
<input type="time">          <!-- 时间选择器 -->
<input type="datetime-local"><!-- 日期+时间（不含时区） -->
<input type="month">         <!-- 年月 -->
<input type="week">          <!-- 年周 -->

<!-- HTML5 新增其他 -->
<input type="color">         <!-- 颜色选择器 -->
```

### 8.3 form 的属性

```html
<form
  action="/api/users"         <!-- 提交地址 -->
  method="POST"               <!-- GET / POST（推荐 POST） -->
  enctype="multipart/form-data"  <!-- 上传文件时必须 -->
  novalidate                  <!-- 禁用浏览器默认验证 -->
  autocomplete="on"           <!-- 自动填充 -->
  target="_blank"             <!-- 在新窗口显示结果 -->
>
```

### 8.4 验证与约束（HTML5 新增）

```html
<!-- 必填 -->
<input type="text" required>

<!-- 长度 -->
<input type="text" minlength="2" maxlength="20">

<!-- 数字范围 -->
<input type="number" min="0" max="100" step="5">

<!-- 正则模式 -->
<input type="text" pattern="[A-Za-z]{3,}"
       title="至少三个英文字母">

<!-- 禁用 -->
<input type="text" disabled>
<input type="text" readonly>    <!-- 只读（但值会提交） -->

<!-- 提示文本 -->
<input type="text" placeholder="请输入...">

<!-- 自动聚焦 -->
<input type="text" autofocus>

<!-- 自动补全 -->
<input type="text" autocomplete="off">
<input type="text" autocomplete="given-name">
```

### 8.5 datalist —— 带建议的下拉

```html
<label for="browser">浏览器：</label>
<input list="browsers" id="browser" name="browser">
<datalist id="browsers">
  <option value="Chrome">
  <option value="Firefox">
  <option value="Safari">
  <option value="Edge">
</datalist>
<!-- 用户可以直接输入，也可以从列表中选择 -->
```

### 8.6 输出与进度

```html
<!-- 进度条 -->
<progress value="70" max="100">70%</progress>

<!-- 标量测量（带高/低阈值，颜色会变） -->
<meter value="0.6" min="0" max="1"
       low="0.3" high="0.7" optimum="0.8">60%</meter>

<!-- 计算结果关联 -->
<form oninput="result.value = parseInt(a.value) + parseInt(b.value)">
  <input type="number" id="a" value="0"> +
  <input type="number" id="b" value="0"> =
  <output name="result" for="a b">0</output>
</form>
```

---

## 9. 通用容器与内联元素

```html
<!-- div：块级容器（无语义，纯布局用） -->
<div class="card">
  <div class="card-header">
    <h2>卡片标题</h2>
  </div>
  <div class="card-body">
    <p>卡片内容</p>
  </div>
</div>

<!-- span：内联容器（无语义，用来包裹内联文本） -->
<p>价格：<span class="price highlight">¥99</span></p>

<!-- div 和 span 的区别 -->
<!-- div：独占一行（块级） -->
<!-- span：不换行（内联） -->
```

> HTML5 之前，`div` + class 是唯一的布局手段。HTML5 引入了语义化标签后，`div` 仍然是布局主力，但关键区块应该优先考虑是否有语义标签可用。

---

## 10. HTML5 语义化结构

### 10.1 为什么需要语义化

```html
<!-- HTML4 方式：div + class（人能看懂，机器看不懂） -->
<div class="header">...</div>
<div class="nav">...</div>
<div class="main">
  <div class="article">...</div>
  <div class="sidebar">...</div>
</div>
<div class="footer">...</div>

<!-- HTML5 语义化：标签本身就是含义 -->
<header>...</header>
<nav>...</nav>
<main>
  <article>...</article>
  <aside>...</aside>
</main>
<footer>...</footer>
```

**好处**：屏幕阅读器能更快跳转、搜索引擎更懂你的内容、代码更好维护。

### 10.2 语义化标签全览

```html
<!-- header：页眉（可以是页面级，也可以是 article 级） -->
<header>
  <h1>网站标题</h1>
  <p>网站描述</p>
</header>

<!-- nav：导航（主要的导航链接才用，不是所有链接组都用） -->
<nav>
  <ul>
    <li><a href="/">首页</a></li>
    <li><a href="/blog">博客</a></li>
    <li><a href="/about">关于</a></li>
  </ul>
</nav>

<!-- main：页面的主要内容（一个页面只有一个） -->
<main>
  <h1>文章标题</h1>
  <p>文章内容...</p>
</main>

<!-- article：独立的内容块（文章、博客帖子、评论、卡片） -->
<article>
  <header>
    <h2>文章标题</h2>
    <time datetime="2025-06-15">2025年6月15日</time>
  </header>
  <p>文章正文...</p>
  <footer>
    <p>标签：<a href="/tag/vue">Vue</a>, <a href="/tag/js">JS</a></p>
  </footer>
</article>

<!-- section：有主题的内容分组（通常带一个标题） -->
<section>
  <h2>最新文章</h2>
  <article>...</article>
  <article>...</article>
</section>

<!-- aside：侧边栏 / 补充内容（与主体相关但非核心） -->
<aside>
  <h3>作者信息</h3>
  <p>关于作者的简介...</p>
</aside>

<!-- footer：页脚 -->
<footer>
  <p>&copy; 2025 我的网站</p>
  <nav>
    <a href="/privacy">隐私政策</a>
    <a href="/terms">服务条款</a>
  </nav>
</footer>
```

### 10.3 语义化标签小节

```html
<!-- figure / figcaption：图文组合（不仅仅是图片） -->
<figure>
  <pre><code>console.log('hello')</code></pre>
  <figcaption>示例 1：JavaScript 输出语句</figcaption>
</figure>

<!-- mark：高亮 / 标记文本（搜索结果的匹配词） -->
<p>搜索结果：在 HTML 中使用 <mark>语义化标签</mark> 非常重要。</p>

<!-- time：时间 -->
<time datetime="2025-06-15T14:30:00">2025年6月15日下午2:30</time>
<!-- datetime 属性给机器读，标签内容给人看 -->

<!-- details / summary：可折叠内容（无 JS 的折叠面板！） -->
<details>
  <summary>点击展开查看更多</summary>
  <p>这是被隐藏的内容。不需要 JavaScript！</p>
  <p>很适合放 FAQ 或长说明。</p>
</details>

<details open>   <!-- open 属性默认展开 -->
  <summary>默认展开的折叠面板</summary>
  <p>内容已展开。</p>
</details>

<!-- dialog：模态对话框（HTML5.2） -->
<dialog id="myDialog">
  <h3>确认操作</h3>
  <p>确定要删除这条记录吗？</p>
  <form method="dialog">
    <button value="cancel">取消</button>
    <button value="confirm">确认</button>
  </form>
</dialog>

<script>
  // JavaScript 控制
  const dialog = document.getElementById('myDialog')
  dialog.showModal()   // 模态显示（有背景遮罩）
  dialog.show()        // 非模态显示
  dialog.close()       // 关闭
</script>
```

### 10.4 一个利用语义化标签的完整页面骨架

```html
<body>
  <header>
    <nav>
      <ul>
        <li><a href="/">首页</a></li>
        <li><a href="/blog">博客</a></li>
        <li><a href="/about">关于</a></li>
      </ul>
    </nav>
  </header>

  <main>
    <article>
      <header>
        <h1>HTML5 语义化：不只是 div 换了个名字</h1>
        <p>发布于 <time datetime="2025-06-15">2025年6月15日</time></p>
        <p>作者：<address>小明</address></p>
      </header>

      <section>
        <h2>为什么需要语义化</h2>
        <p>在 HTML4 时代，我们用 div 和 class 来描述一切结构...</p>
        <figure>
          <img src="html4-vs-html5.png" alt="HTML4 和 HTML5 页面结构对比">
          <figcaption>图 1：HTML4 vs HTML5 结构对比</figcaption>
        </figure>
      </section>

      <section>
        <h2>具体标签怎么用</h2>
        <p>每个标签都有明确的使用场景...</p>
        <h3>article 和 section 的区别</h3>
        <p>article 可以独立分发（如 RSS），section 不能。</p>
      </section>

      <footer>
        <p>标签：
          <a href="/tag/html" rel="tag">HTML</a>
          <a href="/tag/semantic" rel="tag">语义化</a>
        </p>
      </footer>
    </article>

    <aside>
      <section>
        <h3>关于作者</h3>
        <p>一个热爱前端的人。</p>
      </section>
      <nav>
        <h3>相关文章</h3>
        <ul>
          <li><a href="#">CSS 布局入门</a></li>
          <li><a href="#">JavaScript DOM 操作</a></li>
        </ul>
      </nav>
    </aside>
  </main>

  <footer>
    <p>&copy; 2025 我的博客</p>
  </footer>
</body>
```

---

## 11. HTML5 多媒体

### 11.1 音频 audio

```html
<!-- 基本用法 -->
<audio src="music.mp3" controls></audio>

<!-- 完整配置 -->
<audio controls preload="metadata" loop muted>
  <source src="music.ogg" type="audio/ogg">
  <source src="music.mp3" type="audio/mpeg">
  <source src="music.wav" type="audio/wav">
  <!-- 浏览器都不支持时的降级文本 -->
  <p>你的浏览器不支持 HTML5 音频，请
    <a href="music.mp3">下载 MP3</a>。</p>
</audio>
```

**属性说明**：
- `controls`：显示播放控件
- `autoplay`：自动播放（大多数浏览器会阻止，需同时加 `muted`）
- `loop`：循环播放
- `muted`：静音
- `preload`：预加载策略（`none` / `metadata` / `auto`）

### 11.2 视频 video

```html
<!-- 基本用法 -->
<video src="movie.mp4" controls width="800" height="450"></video>

<!-- 完整配置 -->
<video controls preload="metadata" poster="thumbnail.jpg">
  <source src="movie.webm" type="video/webm">
  <source src="movie.mp4" type="video/mp4">
  <!-- 字幕轨道 -->
  <track src="subtitles-zh.vtt" kind="subtitles"
         srclang="zh" label="中文">
  <track src="subtitles-en.vtt" kind="subtitles"
         srclang="en" label="English">
  <p>你的浏览器不支持 HTML5 视频。</p>
</video>
```

**track 的 kind 类型**：
- `subtitles`：翻译字幕（对听不懂的人）
- `captions`：隐藏字幕（含音效描述，为听障人士）
- `descriptions`：视频内容的口述
- `chapters`：章节导航
- `metadata`：脚本使用的元数据（不显示）

**source 标签的作用**：按顺序尝试，使用第一个浏览器支持的格式。比写在 `src` 属性里多了一个 fallback 机制。

### 11.3 多媒体与 JavaScript 交互

```html
<video id="myVideo" src="movie.mp4"></video>

<script>
  const video = document.getElementById('myVideo')

  // 播放控制
  video.play()
  video.pause()

  // 跳转到指定时间
  video.currentTime = 30   // 跳到 30 秒

  // 音量
  video.volume = 0.5       // 0.0 ~ 1.0
  video.muted = true

  // 事件
  video.addEventListener('ended', () => {
    console.log('播放结束')
  })
</script>
```

---

## 12. HTML5 表单增强

### 12.1 新增 input 类型示例

```html
<!-- 范围滑块 -->
<label for="volume">音量：</label>
<input type="range" id="volume" name="volume" min="0" max="100" value="50"
       oninput="this.nextElementSibling.textContent = this.value + '%'">
<span>50%</span>

<!-- 颜色选择器 -->
<label for="favcolor">喜欢的颜色：</label>
<input type="color" id="favcolor" name="favcolor" value="#42b883">

<!-- 日期 -->
<label for="birthday">生日：</label>
<input type="date" id="birthday" name="birthday"
       min="1900-01-01" max="2025-12-31">

<!-- 日期时间 -->
<label for="meeting">会议时间：</label>
<input type="datetime-local" id="meeting" name="meeting">

<!-- 月份 -->
<label for="month">月份：</label>
<input type="month" id="month" name="month">

<!-- 周 -->
<label for="week">周：</label>
<input type="week" id="week" name="week">
```

### 12.2 表单新属性

```html
<!-- autocomplete 细粒度控制 -->
<input type="text" name="username" autocomplete="username">
<input type="password" autocomplete="current-password">
<input type="text" autocomplete="given-name">
<input type="text" autocomplete="family-name">
<input type="email" autocomplete="email">
<input type="tel" autocomplete="tel">
<input type="text" autocomplete="street-address">
<input type="text" autocomplete="postal-code">
<!-- 完整列表参考 WHATWG Autofill 规范 -->

<!-- inputmode：指定键盘类型（比 type 更精细） -->
<input type="text" inputmode="numeric">      <!-- 数字键盘 -->
<input type="text" inputmode="decimal">      <!-- 带小数点的数字 -->
<input type="text" inputmode="email">         <!-- 邮箱键盘 -->
<input type="text" inputmode="url">           <!-- URL 键盘 -->
<input type="text" inputmode="search">        <!-- 搜索键盘 -->

<!-- list + datalist 的多样用法 -->
<label for="ice-cream">口味：</label>
<input list="flavors" id="ice-cream" name="flavor">
<datalist id="flavors">
  <option value="巧克力">
  <option value="香草">
  <option value="草莓">
  <option value="抹茶">
</datalist>
```

### 12.3 表单验证 API

```html
<form id="myForm">
  <input type="text" id="username" required minlength="3"
         pattern="[A-Za-z0-9]+">
  <button type="submit">提交</button>
</form>

<script>
  const username = document.getElementById('username')

  // 自定义验证消息
  username.addEventListener('invalid', (e) => {
    e.preventDefault()
    if (username.validity.valueMissing) {
      username.setCustomValidity('请填写用户名')
    } else if (username.validity.tooShort) {
      username.setCustomValidity('用户名至少 3 个字符')
    } else if (username.validity.patternMismatch) {
      username.setCustomValidity('用户名只能包含字母和数字')
    }
  })

  // 输入后清除自定义提示
  username.addEventListener('input', () => {
    username.setCustomValidity('')
  })

  // validity 对象属性一览
  // valueMissing     → 必填字段未填写
  // typeMismatch     → 类型不匹配（如 email 格式错误）
  // patternMismatch  → 正则不匹配
  // tooLong / tooShort → 长度超出/不足
  // rangeUnderflow / rangeOverflow → 范围超出
  // stepMismatch     → 步长不符合
  // badInput         → 无法转换（如 number 输入了字母）
  // valid            → 以上全无问题
</script>
```

---

## 13. HTML5 交互组件

### 13.1 details / summary —— 无 JS 折叠面板

```html
<!-- 基础折叠 -->
<details>
  <summary>什么是 HTML5？</summary>
  <p>HTML5 是 HTML 的最新版本...</p>
</details>

<!-- 手风琴效果（用 name 属性，同名的互斥展开） -->
<details name="faq">
  <summary>如何退款？</summary>
  <p>7 天内无条件退款。</p>
</details>
<details name="faq">
  <summary>发货时间？</summary>
  <p>下单后 24 小时内发货。</p>
</details>
<details name="faq">
  <summary>支持哪些支付方式？</summary>
  <p>支付宝、微信、银行卡。</p>
</details>

<!-- 真实场景 —— FAQ 页面 -->
<section>
  <h2>常见问题</h2>
  <details>
    <summary><strong>订单可以修改地址吗？</strong></summary>
    <p>在订单未发货之前，您可以在"我的订单"页面修改收货地址。</p>
    <p>如果订单已发货，请联系客服处理。</p>
  </details>
  <details>
    <summary><strong>如何获取发票？</strong></summary>
    <p>在订单完成后，进入"我的订单"，点击"申请发票"即可。</p>
  </details>
</section>
```

### 13.2 dialog —— 模态对话框

```html
<!-- 基础模态 -->
<dialog id="confirmDialog">
  <div class="dialog-content">
    <h3>确认删除</h3>
    <p>此操作不可撤销。确定要删除吗？</p>
    <div class="dialog-actions">
      <button onclick="document.getElementById('confirmDialog').close()">
        取消
      </button>
      <button id="confirmDelete" class="danger">确认删除</button>
    </div>
  </div>
</dialog>

<script>
  const dialog = document.getElementById('confirmDialog')

  function showConfirm(onConfirm) {
    dialog.showModal()  // 显示模态对话框
    document.getElementById('confirmDelete').onclick = () => {
      onConfirm()
      dialog.close()
    }
  }

  // 也可以这样关闭（点击背景遮罩不会自动关闭）
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) dialog.close()
  })

  // 对话框关闭时触发
  dialog.addEventListener('close', () => {
    console.log('对话框返回值:', dialog.returnValue)
  })
</script>

<style>
  dialog::backdrop {
    background: rgba(0, 0, 0, 0.5);  /* 遮罩背景 */
  }
  dialog {
    border: none;
    border-radius: 8px;
    padding: 24px;
    box-shadow: 0 4px 24px rgba(0,0,0,0.2);
  }
</style>
```

### 13.3 popover —— 弹出层（HTML5 最新特性，2024+）

```html
<!-- 声明式弹出（不需要 JavaScript！） -->
<button popovertarget="myPopover">点击弹出</button>
<div id="myPopover" popover>
  <p>这是一个弹出层。点击外部自动关闭。</p>
  <button popovertarget="myPopover" popoveraction="hide">关闭</button>
</div>

<!-- JavaScript API 控制 -->
<script>
  const popover = document.getElementById('myPopover')
  popover.showPopover()
  popover.hidePopover()
  popover.togglePopover()
</script>

<style>
  /* 弹出层定位样式 */
  #myPopover:popover-open {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
</style>
```

---

## 14. HTML5 Canvas 与 SVG

### 14.1 Canvas —— 像素级绘图

Canvas 是**像素画布**，通过 JavaScript 绘制。适合游戏、图表、图像处理。

```html
<canvas id="myCanvas" width="400" height="300">
  你的浏览器不支持 Canvas（降级文本）
</canvas>

<script>
  const canvas = document.getElementById('myCanvas')
  const ctx = canvas.getContext('2d')

  // 绘制矩形
  ctx.fillStyle = '#42b883'    // 填充颜色
  ctx.fillRect(50, 50, 200, 100)

  // 绘制圆形
  ctx.beginPath()
  ctx.arc(200, 200, 50, 0, Math.PI * 2)
  ctx.fillStyle = '#ff0000'
  ctx.fill()
  ctx.strokeStyle = '#000'
  ctx.lineWidth = 2
  ctx.stroke()

  // 绘制文字
  ctx.font = '24px sans-serif'
  ctx.fillStyle = '#333'
  ctx.fillText('Hello Canvas!', 100, 280)

  // 绘制线条
  ctx.beginPath()
  ctx.moveTo(10, 10)
  ctx.lineTo(300, 100)
  ctx.strokeStyle = 'blue'
  ctx.lineWidth = 3
  ctx.stroke()
</script>
```

### 14.2 SVG —— 矢量图形

SVG 是**矢量图形**，基于 XML，无损缩放。适合图标、Logo、插画。

```html
<!-- 内联 SVG（可以直接用 CSS 控制） -->
<svg width="200" height="200" viewBox="0 0 100 100"
     xmlns="http://www.w3.org/2000/svg">
  <!-- 圆形 -->
  <circle cx="50" cy="50" r="40"
          fill="none" stroke="#42b883" stroke-width="4" />
  <!-- 文字 -->
  <text x="50" y="55" text-anchor="middle"
        font-size="16" fill="#333">Vue</text>
</svg>

<!-- 复杂的 SVG 示例 —— 一个简单的图标 -->
<svg width="48" height="48" viewBox="0 0 24 24"
     fill="none" stroke="currentColor" stroke-width="2"
     stroke-linecap="round" stroke-linejoin="round">
  <path d="M20 6L9 17l-5-5" />
</svg>

<!-- 使用 img 标签引入 SVG 文件 -->
<img src="icon.svg" alt="图标" width="48" height="48">
```

### 14.3 Canvas vs SVG

| | Canvas | SVG |
|------|--------|-----|
| 本质 | 像素位图 | 矢量图形 |
| 缩放 | 模糊 | 清晰 |
| DOM 交互 | 无（只能整体） | 每个元素都是 DOM 节点 |
| 性能 | 大量对象时好 | 少量对象时好 |
| 适合 | 游戏、图像处理、粒子 | 图标、图表、动画 |

---

## 15. HTML5 API（简要索引）

这部分 API 需要 JavaScript，但它们的入口在 HTML 标签或 DOM 上。

```html
<!-- 地理定位 -->
<script>
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      console.log('纬度:', pos.coords.latitude)
      console.log('经度:', pos.coords.longitude)
    },
    (err) => console.error('定位失败', err)
  )
</script>

<!-- 本地存储 -->
<script>
  // localStorage（持久，不清除一直存在）
  localStorage.setItem('theme', 'dark')
  const theme = localStorage.getItem('theme')

  // sessionStorage（关闭标签页即清除）
  sessionStorage.setItem('temp', 'data')
</script>

<!-- 拖放 API -->
<div
  draggable="true"
  ondragstart="event.dataTransfer.setData('text/plain', 'hello')"
>
  拖我
</div>
<div
  ondragover="event.preventDefault()"
  ondrop="console.log(event.dataTransfer.getData('text/plain'))"
>
  放到这里
</div>

<!-- Web Worker（后台线程，不阻塞 UI） -->
<script>
  const worker = new Worker('worker.js')
  worker.postMessage({ type: 'start' })
  worker.onmessage = (e) => {
    console.log('Worker 返回:', e.data)
  }
</script>
```

---

## 16. 全局属性速查

以下属性几乎可以用在**所有** HTML 标签上：

| 属性 | 说明 | 示例 |
|------|------|------|
| `id` | 唯一标识符（文档内唯一） | `id="main-content"` |
| `class` | CSS 类名（可多个） | `class="card highlight"` |
| `style` | 行内样式 | `style="color: red"` |
| `title` | 悬停提示文本 | `title="更多信息"` |
| `lang` | 内容语言 | `lang="zh-CN"` |
| `dir` | 文本方向 | `dir="ltr"` / `dir="rtl"`  |
| `hidden` | 隐藏元素 | `hidden` |
| `tabindex` | Tab 键顺序 | `tabindex="0"`（加入顺序） / `-1`（不可 tab） |
| `accesskey` | 快捷键 | `accesskey="s"`（Alt+S） |
| `contenteditable` | 可编辑 | `contenteditable="true"` |
| `draggable` | 可拖拽 | `draggable="true"` |
| `data-*` | 自定义数据属性 | `data-user-id="42"` |
| `role` | ARIA 角色（无障碍） | `role="button"` |
| `aria-*` | ARIA 属性（无障碍） | `aria-label="关闭"` |

```html
<!-- data-* 的真实用法 -->
<button data-user-id="42" data-action="delete"
        onclick="handleClick(this.dataset)">
  删除用户
</button>
<script>
  function handleClick(dataset) {
    console.log(dataset.userId)    // "42"（注意是字符串）
    console.log(dataset.action)    // "delete"
  }
</script>

<!-- contenteditable -->
<div contenteditable="true">
  这段文字可以直接点击编辑。
</div>
```

---

## 17. 字符实体速查

在 HTML 书写 `<`、`>`、`&`、`"` 等特殊字符时，需要使用字符实体。

| 字符 | 实体 | 说明 |
|------|------|------|
| `<` | `&lt;` | 小于号（最重要） |
| `>` | `&gt;` | 大于号 |
| `&` | `&amp;` | & 符号 |
| `"` | `&quot;` | 双引号 |
| `'` | `&apos;` | 单引号 |
| ` ` | `&nbsp;` | 不换行空格 |
| `©` | `&copy;` | 版权符号 |
| `®` | `&reg;` | 注册商标 |
| `™` | `&trade;` | 商标 |
| `←` | `&larr;` | 左箭头 |
| `→` | `&rarr;` | 右箭头 |
| `—` | `&mdash;` | 长破折号 |
| `–` | `&ndash;` | 短破折号 |
| `…` | `&hellip;` | 省略号 |
| `✓` | `&check;` | 对号 |
| `✗` | `&cross;` | 叉号 |
| `♥` | `&hearts;` | 心形 |
| `★` | `&starf;` | 实心星 |

```html
<!-- 在代码块中展示 HTML 标签本身 -->
<p>在 HTML 中，段落用 <code>&lt;p&gt;</code> 标签表示。</p>
```

---

## 18. 特殊标签：iframe / object / embed

### 18.1 iframe —— 内嵌页面

```html
<!-- 嵌入 YouTube 视频 -->
<iframe
  width="560" height="315"
  src="https://www.youtube.com/embed/dQw4w9WgXcQ"
  title="YouTube 视频播放器"
  frameborder="0"
  allow="accelerometer; autoplay; clipboard-write;
         encrypted-media; gyroscope; picture-in-picture"
  allowfullscreen
  loading="lazy"
  sandbox="allow-scripts allow-same-origin"
></iframe>
```

**安全属性**：
- `sandbox`：限制 iframe 权限。不加任何值 = 最严格（禁用一切）
  - `allow-scripts`：允许 JavaScript
  - `allow-same-origin`：允许同源
  - `allow-forms`：允许表单提交
  - `allow-popups`：允许弹窗
  - `allow-downloads`：允许下载
- 永远不要信任用户生成的内容嵌入的 iframe！

### 18.2 嵌入 PDF

```html
<!-- 方式一：iframe -->
<iframe src="/files/report.pdf" width="100%" height="600px"
        title="报告 PDF"></iframe>

<!-- 方式二：object（更传统的嵌入） -->
<object data="/files/report.pdf" type="application/pdf"
        width="100%" height="600px">
  <p>无法显示 PDF。<a href="/files/report.pdf">下载</a></p>
</object>
```

---

## 19. HTML 与 SEO

SEO（搜索引擎优化）从正确的 HTML 开始：

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <!-- title 是最重要的 SEO 元素 -->
  <title>HTML5 完整教程 —— 从入门到实战 | 我的博客</title>

  <!-- description：搜索结果下的摘要 -->
  <meta name="description"
        content="覆盖 HTML4 与 HTML5 的全功能教程，含 20+ 节详解、大量代码示例。">

  <!-- 规范 URL（避免重复内容） -->
  <link rel="canonical" href="https://mysite.com/html-tutorial/">

  <!-- Open Graph（影响社交分享预览） -->
  <meta property="og:title" content="HTML5 完整教程">
  <meta property="og:description" content="覆盖 HTML4 与 HTML5...">
  <meta property="og:image" content="https://mysite.com/og-html.jpg">
  <meta property="og:url" content="https://mysite.com/html-tutorial/">
</head>
<body>
  <!-- 一个页面只有一个 h1（最重要） -->
  <h1>HTML5 完整教程</h1>

  <!-- 语义化标签帮助搜索引擎理解内容结构 -->
  <main>
    <article>
      <h2>第一章：认识 HTML</h2>
      <p>HTML 是...</p>
      <h3>1.1 HTML 的历史</h3>
      <h3>1.2 HTML5 的新特性</h3>
    </article>
  </main>

  <!-- 结构化数据（JSON-LD，提高搜索结果的展示效果） -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "HTML5 完整教程",
    "author": { "@type": "Person", "name": "你的名字" },
    "datePublished": "2025-06-15",
    "description": "覆盖 HTML4 与 HTML5 的全功能教程"
  }
  </script>
</body>
```

### SEO 的 HTML 检查清单

1. ✅ 每页有唯一的 `<title>`
2. ✅ 每页有 `<meta name="description">`
3. ✅ `<h1>` 只出现一次，反映页面主题
4. ✅ 标题层级正确（h1→h2→h3，不跳级）
5. ✅ `<img>` 有 `alt` 属性
6. ✅ `<a>` 有描述性文字（不是"点击这里"）
7. ✅ 使用语义化标签（`<article>`、`<nav>` 等）
8. ✅ 添加 `canonical` 链接（防止重复内容告警）
9. ✅ 移动端友好的 viewport 设置

---

## 20. HTML 与无障碍（A11Y）

### 20.1 屏幕阅读器如何"看"你的页面

```
屏幕阅读器 → DOM 树 → 无障碍树（Accessibility Tree）
                          ↓
                 角色（role）+ 名称（name）+ 状态（state）
```

你每写一个 `<button>`，它就自动有 `role="button"`。你用 `<div onclick="...">`，它就什么都不是——纯装饰。

### 20.2 实用技巧

```html
<!-- ✅ 用语义化标签，不要用 div 替代一切 -->
<button onclick="handleClick()">提交</button>
<!-- ❌ <div onclick="handleClick()">提交</div>（屏幕阅读器不知道这是按钮） -->

<!-- ✅ 图片有 alt -->
<img src="dog.jpg" alt="金毛犬在草地上奔跑">
<!-- ❌ <img src="dog.jpg">（屏幕阅读器读不出任何信息） -->
<!-- ✅ 纯装饰用空 alt -->
<img src="border.png" alt="">

<!-- ✅ 表单关联 label -->
<label for="email">邮箱地址：</label>
<input type="email" id="email">
<!-- ❌ 用 placeholder 替代 label（看不到了，但屏幕阅读器可能漏掉） -->

<!-- 形式上的按钮，但实际上是链接 → 用真正的 a -->
<a href="/signup" class="btn">注册</a>

<!-- 不可见但需要让屏幕阅读器读的文本 -->
<span class="sr-only">（这个文件有新版本可用）</span>
<!-- sr-only CSS：只在屏幕阅读器中可见 -->
```

### 20.3 sr-only 的 CSS

```css
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

### 20.4 aria-label / aria-labelledby

```html
<!-- 没有可见文本的按钮，用 aria-label 补充 -->
<button aria-label="关闭弹窗">✕</button>

<!-- 引用页面其他元素的文本作为标签 -->
<h2 id="section-title">热门文章</h2>
<nav aria-labelledby="section-title">
  <ul>
    <li><a href="#">文章 1</a></li>
    <li><a href="#">文章 2</a></li>
  </ul>
</nav>

<!-- role 的恰当使用 -->
<div role="alert">操作成功！</div>       <!-- 自动读出 -->
<div role="status">3 条新消息</div>      <!-- 状态更新 -->
<div role="navigation">...</div>        <!-- 导航（<nav> 自带此 role） -->
```

### 20.5 键盘可访问性

```html
<!-- 原生可交互元素自带键盘支持（button、a、input 等） -->
<!-- 自定义交互元素需要额外处理 -->

<!-- tabindex 控制 -->
<div tabindex="0">我可以通过 Tab 键聚焦</div>
<div tabindex="-1">只能通过 JavaScript focus() 聚焦</div>

<!-- 处理键盘事件 -->
<div role="button" tabindex="0"
     onkeydown="if(event.key==='Enter'||event.key===' ') handleClick()">
  自定义按钮
</div>

<!-- 跳过导航链接（跳到主内容） -->
<a href="#main-content" class="skip-link">跳到主内容</a>
<main id="main-content">...</main>
```

---

## 21. 完整的页面示例

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>我的技术博客</title>
  <meta name="description" content="一个关于前端开发的技术博客">
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <link rel="stylesheet" href="/styles/main.css">
</head>
<body>
  <!-- 跳过导航 -->
  <a href="#main-content" class="skip-link">跳到主内容</a>

  <!-- 页眉 -->
  <header>
    <div class="container">
      <h1><a href="/">我的技术博客</a></h1>
      <nav aria-label="主导航">
        <ul>
          <li><a href="/" aria-current="page">首页</a></li>
          <li><a href="/blog/">博客</a></li>
          <li><a href="/projects/">项目</a></li>
          <li><a href="/about/">关于</a></li>
        </ul>
      </nav>
      <form role="search" action="/search/" method="get">
        <label for="search-input" class="sr-only">搜索</label>
        <input type="search" id="search-input" name="q"
               placeholder="搜索文章...">
        <button type="submit">搜索</button>
      </form>
    </div>
  </header>

  <!-- 主内容 -->
  <main id="main-content">
    <div class="container">
      <section>
        <h2>最新文章</h2>

        <article>
          <header>
            <h3><a href="/blog/html5-guide/">HTML5 完整指南</a></h3>
            <p>
              发布于 <time datetime="2025-06-15">2025.06.15</time>
              · 标签：<a href="/tag/html/">HTML</a>
            </p>
          </header>
          <p>从 HTML4 到 HTML5，一份覆盖所有常用场景的全面指南...</p>
          <footer>
            <a href="/blog/html5-guide/" aria-label="阅读全文：HTML5 完整指南">
              阅读全文 →
            </a>
          </footer>
        </article>

        <article>
          <header>
            <h3><a href="/blog/vue3-composition-api/">Vue 3 组合式 API 深入</a></h3>
            <p>
              发布于 <time datetime="2025-06-10">2025.06.10</time>
              · 标签：<a href="/tag/vue/">Vue</a>, <a href="/tag/js/">JavaScript</a>
            </p>
          </header>
          <p>从 ref 到 composable，掌握 Composition API 的精髓...</p>
          <footer>
            <a href="/blog/vue3-composition-api/">阅读全文 →</a>
          </footer>
        </article>
      </section>

      <aside>
        <section>
          <h3>关于作者</h3>
          <img src="/avatar.jpg" alt="作者头像" width="80" height="80">
          <p>一个热爱前端开发的技术爱好者。</p>
        </section>

        <section>
          <h3>标签云</h3>
          <ul>
            <li><a href="/tag/html/">HTML</a></li>
            <li><a href="/tag/css/">CSS</a></li>
            <li><a href="/tag/js/">JavaScript</a></li>
            <li><a href="/tag/vue/">Vue</a></li>
            <li><a href="/tag/react/">React</a></li>
          </ul>
        </section>
      </aside>
    </div>
  </main>

  <!-- 页脚 -->
  <footer>
    <div class="container">
      <p>&copy; 2025 我的技术博客</p>
      <nav aria-label="底部导航">
        <ul>
          <li><a href="/privacy/">隐私政策</a></li>
          <li><a href="/terms/">服务条款</a></li>
          <li><a href="/rss/">RSS 订阅</a></li>
        </ul>
      </nav>
    </div>
  </footer>

  <script src="/scripts/main.js" defer></script>
</body>
</html>
```

---

## 22. 标签索引（按功能分类）

### 文档结构
`<!DOCTYPE>` `html` `head` `body` `title`

### 元数据与资源
`meta` `link` `style` `script` `base`

### 内容分区
`header` `main` `footer` `nav` `article` `section` `aside` `address`

### 文本内容
`h1~h6` `p` `br` `hr` `pre` `blockquote` `div`

### 内联文本语义
`a` `em` `strong` `small` `s` `cite` `q` `dfn` `abbr` `code` `kbd` `samp` `var` `time` `mark` `sub` `sup` `i` `b` `u` `span` `br`

### 列表
`ul` `ol` `li` `dl` `dt` `dd`

### 表格
`table` `caption` `colgroup` `col` `thead` `tbody` `tfoot` `tr` `th` `td`

### 表单
`form` `input` `textarea` `select` `option` `optgroup` `button` `label` `fieldset` `legend` `datalist` `output` `progress` `meter`

### 嵌入内容
`img` `figure` `figcaption` `audio` `video` `source` `track` `iframe` `object` `embed` `canvas` `svg`

### 交互
`details` `summary` `dialog`

### 脚本
`script` `noscript` `template` `slot`

### 已废弃（不要用）
`<center>` `<font>` `<big>` `<strike>` `<tt>` `<frame>` `<frameset>` `<noframes>` `<marquee>` `<blink>` `<bgsound>` `<applet>` `<acronym>` `<dir>`

---

## 23. 常见错误与陷阱

1. **忘了 DOCTYPE** —— 没有 `<!DOCTYPE html>` 浏览器进入"怪异模式"，CSS 可能完全错位。永远放在第一行。

2. **`<div>` 滥用** —— 能说清楚是什么的标签就不应该用 div。`<nav>`、`<article>`、`<section>` 有明确的语义。

3. **`<img>` 没有 `alt`** —— 不合法的 HTML，对无障碍是重大缺陷。纯装饰可以用 `alt=""`。

4. **表单没有 `<label>`** —— 点击标签文字能聚焦输入框，这是基础的无障碍实践。

5. **`id` 重复** —— `id` 必须全局唯一。两个相同的 id 会导致 CSS/JS 行为诡异。

6. **`<a>` 和 `<button>` 混用** —— 导航到其他页 = `<a href>`；触发 JS 动作 = `<button>`。不要 `<a href="#" onclick="...">`。

7. **块级元素包在行内元素里** —— `<span><div>内容</div></span>` 不合法。

8. **`<ul>` / `<ol>` 直接子元素不是 `<li>`** —— `<ul>` 里只能放 `<li>`（以及 `<script>` 和 `<template>`）。

9. **`<table>` 没有 `<th>` 和 `scope`** —— 表格没有表头，屏幕阅读器无法理解列之间的关系。

10. **`<input>` 没有 `name`** —— `name` 属性是表单数据提交的 key，忘了会导致该字段不提交。

11. **把 `<br>` 当间距用** —— `<br>` 是换行，不是间距。间距用 CSS `margin`。

12. **`placeholder` 替代 `<label>`** —— placeholder 在输入后消失，填完表单的人无法确认字段用途。label 永远需要。

13. **iframe 不加 sandbox** —— 嵌入外部内容不加 sandbox 是安全隐患。

14. **`async` vs `defer` 分不清** —— `<script defer>` 保证按顺序执行；`<script async>` 下载完就执行，不保证顺序。

15. **忘记 HTML 实体的 `<` 和 `&`** —— 在 HTML 中展示代码或用 `&` 作 URL 参数时，忘了转义会导致解析错误或 XSS 漏洞。
