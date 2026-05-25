# 中英文命名速查手册

> 写代码最痛苦的不是逻辑，是命名。这份手册按**用途分类**列出 HTML/CSS/JS/TS 中最常用的英文命名，越靠前的越通用推荐。
> 约定：CSS 类名用 kebab-case（`main-header`），JS 变量用 camelCase（`mainHeader`），React/Vue 组件用 PascalCase（`MainHeader`）。

---

## 目录

1. [命名约定速览](#1-命名约定速览)
2. [布局与结构](#2-布局与结构)
3. [页面区块](#3-页面区块)
4. [组件 / UI 元素](#4-组件--ui-元素)
5. [文本与排版](#5-文本与排版)
6. [颜色与主题](#6-颜色与主题)
7. [状态](#7-状态)
8. [尺寸与间距](#8-尺寸与间距)
9. [定位与显示](#9-定位与显示)
10. [JS/TS 布尔变量](#10-jsts-布尔变量)
11. [JS/TS 数字变量](#11-jsts-数字变量)
12. [JS/TS 字符串变量](#12-jsts-字符串变量)
13. [JS/TS 函数命名](#13-jsts-函数命名)
14. [JS/TS 数组与集合](#14-jsts-数组与集合)
15. [JS/TS 对象与字典](#15-jsts-对象与字典)
16. [JS/TS DOM 引用](#16-jsts-dom-引用)
17. [JS/TS 事件与处理器](#17-jsts-事件与处理器)
18. [JS/TS 异步相关](#18-jsts-异步相关)
19. [JS/TS 状态管理](#19-jsts-状态管理)
20. [JS/TS 通用变量](#20-jsts-通用变量)
21. [常用修饰词](#21-常用修饰词)
22. [反模式：永远不要用的命名](#22-反模式永远不要用的命名)

---

## 1. 命名约定速览

| 约定 | 写法 | 用在哪里 |
|------|------|----------|
| **kebab-case** | `main-header`, `btn-primary` | CSS 类名、HTML id、文件命名 |
| **camelCase** | `mainHeader`, `isActive`, `onClick` | JS/TS 变量、函数、方法 |
| **PascalCase** | `MainHeader`, `UserCard` | React/Vue 组件名、TS 类/接口/类型 |
| **snake_case** | `MAIN_HEADER`, `api_base_url` | 常量、配置文件、Python/数据库字段 |
| **UPPER_SNAKE** | `MAX_RETRIES`, `API_URL` | 全局常量、环境变量 |

```
同一个概念在不同语境：
  CSS：   <div class="user-card">
  JS：    const userCard = document.querySelector('.user-card')
  Vue：   <UserCard />
  TS：    interface UserCard { ... }
```

---

## 2. 布局与结构

### 整体布局

| CSS 类名 | JS 变量名 | 说明 |
|----------|-----------|------|
| `layout` | `layout` | 页面整体布局容器 |
| `container` | `container` | 内容居中容器 |
| `wrapper` | `wrapper` | 包裹层 |
| `grid` | — | Grid 布局容器 |
| `row` | `row` | 行 |
| `col`, `column` | `col`, `column` | 列 |
| `cell` | `cell` | 单元格 |

### 典型结构

```html
<div class="container">
  <div class="row">
    <div class="col">列 1</div>
    <div class="col">列 2</div>
  </div>
</div>
```

### 弹性布局

| CSS 类名 | 说明 |
|----------|------|
| `flex` | 弹性容器 |
| `flex-row` | 水平弹性 |
| `flex-col`, `flex-column` | 垂直弹性 |
| `flex-center` | 弹性居中 |
| `flex-between` | 弹性和间距（两端对齐） |
| `flex-wrap` | 弹性换行 |
| `flex-1` | flex-grow: 1 |

### 间隙与分隔

| CSS 类名 | 说明 |
|----------|------|
| `gap`, `gap-sm`, `gap-md`, `gap-lg` | 子元素间距 |
| `divider` | 分隔线 |
| `spacer` | 占位空白 |
| `gutter` | 列间距（Grid 语境） |

---

## 3. 页面区块

| 中文 | CSS 类名（kebab） | JS 变量（camel） | 组件名（Pascal） |
|------|-------------------|------------------|-------------------|
| 页眉 | `header`, `page-header`, `site-header` | `header`, `pageHeader` | `Header`, `PageHeader` |
| 页脚 | `footer`, `page-footer`, `site-footer` | `footer`, `pageFooter` | `Footer`, `PageFooter` |
| 主内容 | `main`, `main-content`, `content` | `mainContent`, `content` | — |
| 侧边栏 | `sidebar`, `aside`, `side-panel` | `sidebar`, `aside` | `Sidebar`, `AsidePanel` |
| 导航 | `nav`, `navbar`, `navigation` | `nav`, `navbar` | `Nav`, `Navbar` |
| 面包屑 | `breadcrumb`, `breadcrumbs` | `breadcrumb` | `Breadcrumb` |
| 分页 | `pagination`, `pager` | `pagination` | `Pagination` |
| 页签 | `tabs`, `tab-bar` | `tabs`, `activeTab` | `Tabs`, `TabBar` |
| 菜单 | `menu`, `dropdown-menu` | `menu`, `isMenuOpen` | `Menu`, `DropdownMenu` |
| 搜索区 | `search`, `search-bar`, `search-box` | `searchBar`, `searchQuery` | `SearchBar` |
| 英雄区 | `hero`, `hero-banner`, `hero-section` | — | `HeroBanner` |
| 关于 | `about`, `about-section` | — | `AboutSection` |
| 联系 | `contact`, `contact-section` | — | `ContactSection` |
| 常见问题 | `faq`, `faq-section` | `faqList` | `FAQ`, `FaqSection` |
| 评论区 | `comments`, `comment-section`, `comment-list` | `comments` | `Comments`, `CommentList` |
| 相关文章 | `related`, `related-posts` | `relatedPosts` | `RelatedPosts` |
| 标签云 | `tag-cloud`, `tags` | `tags`, `tagList` | `TagCloud` |
| 归档 | `archive`, `archive-list` | `archiveList` | `Archive` |
| 广告 | `ad`, `advertisement`, `banner` | — | `AdBanner` |
| 推广 | `promo`, `promotion` | — | `Promotion` |
| 公告 | `notice`, `announcement`, `alert` | `notice`, `alertMessage` | `Notice`, `Alert` |

---

## 4. 组件 / UI 元素

### 卡片

| 中文 | CSS 类名 | JS 变量 | 组件名 |
|------|----------|---------|--------|
| 卡片 | `card` | `card` | `Card` |
| 卡片容器 | `card-grid`, `card-list`, `cards` | `cards`, `cardList` | `CardGrid`, `CardList` |
| 卡片头 | `card-header` | — | `CardHeader` |
| 卡片图 | `card-img`, `card-image` | — | `CardImage` |
| 卡片体 | `card-body` | — | `CardBody` |
| 卡片脚 | `card-footer` | — | `CardFooter` |
| 卡片标题 | `card-title` | — | — |
| 卡片描述 | `card-text`, `card-desc` | — | — |

### 按钮

| 中文 | CSS 类名 | JS 变量 | 组件名 |
|------|----------|---------|--------|
| 按钮 | `btn`, `button` | `btn` | `Button`, `Btn` |
| 主要按钮 | `btn-primary` | — | — |
| 次要按钮 | `btn-secondary` | — | — |
| 线框按钮 | `btn-outline`, `btn-ghost` | — | — |
| 危险按钮 | `btn-danger`, `btn-destructive` | — | — |
| 小按钮 | `btn-sm` | — | — |
| 大按钮 | `btn-lg` | — | — |
| 图标按钮 | `btn-icon`, `icon-btn` | — | `IconButton` |
| 按钮组 | `btn-group`, `button-group` | — | `ButtonGroup` |
| 返回顶部 | `btn-back-top`, `back-to-top` | — | `BackToTop` |

### 表单

| 中文 | CSS 类名 | JS 变量 | 组件名 |
|------|----------|---------|--------|
| 表单 | `form` | `form` | `Form` |
| 表单项 | `form-group`, `form-item`, `field` | `formGroup` | `FormGroup`, `FormItem` |
| 标签 | `label`, `form-label` | `label` | — |
| 输入框 | `input`, `form-input`, `input-field` | `input`, `inputEl` | `Input`, `TextField` |
| 文本域 | `textarea` | `textarea`, `textareaEl` | `Textarea` |
| 下拉框 | `select`, `dropdown` | `select` | `Select`, `Dropdown` |
| 复选框 | `checkbox` | `checkbox` | `Checkbox` |
| 单选框 | `radio` | `radio` | `Radio` |
| 开关 | `toggle`, `switch` | `toggle`, `isToggled` | `Toggle`, `Switch` |
| 滑块 | `slider`, `range-slider` | `slider` | `Slider` |
| 文件上传 | `upload`, `file-upload`, `file-input` | `upload`, `fileInput` | `Upload`, `FileUpload` |
| 提示信息 | `hint`, `help-text`, `form-text` | `hint` | — |
| 错误提示 | `error-msg`, `error-text`, `field-error` | `errorMsg`, `fieldError` | — |
| 验证状态 | `is-valid`, `is-invalid` | `isValid`, `isInvalid` | — |

### 弹窗与遮罩

| 中文 | CSS 类名 | JS 变量 | 组件名 |
|------|----------|---------|--------|
| 模态框 | `modal`, `dialog` | `isModalOpen` | `Modal`, `Dialog` |
| 遮罩层 | `overlay`, `backdrop`, `mask` | `showOverlay` | `Overlay` |
| 弹出层 | `popover`, `popup` | `isPopoverOpen` | `Popover`, `Popup` |
| 抽屉 | `drawer`, `slide-panel` | `isDrawerOpen` | `Drawer`, `SlidePanel` |
| 提示框 | `tooltip` | — | `Tooltip` |
| 确认框 | `confirm-dialog` | — | `ConfirmDialog` |
| 通知 | `toast`, `notification`, `snackbar` | `toast`, `notification` | `Toast`, `Notification` |

### 列表中常用的子元素

| 中文 | CSS 类名 |
|------|----------|
| 列表 | `list`, `item-list` |
| 列表项 | `list-item`, `item` |
| 列表头 | `list-header` |

### 媒体

| 中文 | CSS 类名 | 组件名 |
|------|----------|--------|
| 头像 | `avatar` | `Avatar` |
| 图标 | `icon` | `Icon` |
| 徽标/角标 | `badge`, `dot` | `Badge` |
| 缩略图 | `thumbnail`, `thumb` | `Thumbnail` |
| 封面图 | `cover`, `cover-image`, `hero-image` | — |
| Logo | `logo` | `Logo` |
| 轮播图 | `carousel`, `slider`, `slideshow` | `Carousel`, `Slider` |
| 视频容器 | `video-wrapper`, `video-container` | `VideoPlayer` |
| 音频播放器 | `audio-player` | `AudioPlayer` |

### 内容容器

| 中文 | CSS 类名 | 组件名 |
|------|----------|--------|
| 区块 | `section`, `block` | — |
| 面板 | `panel` | `Panel` |
| 盒子 | `box` | `Box` |
| 分组 | `group`, `fieldset` | `Group` |
| 折叠面板 | `collapse`, `accordion` | `Collapse`, `Accordion` |
| 时间线 | `timeline` | `Timeline` |
| 步骤条 | `steps`, `stepper`, `progress-steps` | `Steps`, `Stepper` |
| 表格 | `table`, `data-table` | `Table`, `DataTable` |
| 表格行 | `table-row`, `tr` | `TableRow` |
| 表格头 | `table-header`, `thead` | `TableHeader` |
| 空状态 | `empty-state`, `empty`, `no-data` | `EmptyState` |
| 结果页 | `result`, `result-page` | `Result` |

### 加载与反馈

| 中文 | CSS 类名 | JS 变量 | 组件名 |
|------|----------|---------|--------|
| 加载中 | `loading`, `loader` | `loading`, `isLoading` | `Loading`, `Spinner` |
| 旋转器 | `spinner`, `spin` | — | `Spinner` |
| 骨架屏 | `skeleton`, `skeleton-screen` | — | `Skeleton` |
| 进度条 | `progress`, `progress-bar` | `progress` | `Progress`, `ProgressBar` |
| 下拉刷新 | `pull-refresh` | — | `PullRefresh` |
| 无限滚动 | `infinite-scroll` | `isLoadingMore` | `InfiniteScroll` |
| 错误状态 | `error-state`, `error` | `error`, `hasError` | `ErrorState` |
| 重试 | `retry` | `retry` | `Retry` |

### 交互

| 中文 | CSS 类名 | JS 变量/函数 | 组件名 |
|------|----------|-------------|--------|
| 可点击 | `clickable` | — | — |
| 可拖拽 | `draggable` | `isDragging` | `Draggable` |
| 可排序 | `sortable` | `sortBy`, `sortOrder` | `Sortable` |
| 可展开 | `expandable`, `collapsible` | `isExpanded` | `Expandable` |
| 可编辑 | `editable` | `isEditing` | `Editable` |
| 可关闭 | `dismissible`, `closable` | — | `Dismissible` |
| 高亮/选中 | `highlight`, `selected`, `active` | `isHighlighted`, `isSelected` | — |
| 悬停提示 | `tooltip-trigger`, `has-tooltip` | — | — |
| 右键菜单 | `context-menu` | `isContextMenuOpen` | `ContextMenu` |

### 社交与功能

| 中文 | CSS 类名 ↓ 越前越推荐 | 附注 |
|------|------------------------|------|
| 点赞 | `like`, `likes`, `like-btn`, `thumbs-up`, `upvote`, `heart` | `like` 最通用 |
| 收藏 | `bookmark`, `favorite`, `save`, `star`, `collect` | `bookmark` 中性，`favorite` 偏个人化 |
| 分享 | `share`, `share-btn`, `social-share` | — |
| 评论 | `comment`, `comments`, `remark`, `reply`, `review` | `review` 偏评价 |
| 关注 | `follow`, `subscribe` | — |
| 转发 | `repost`, `retweet`, `share`, `forward` | — |
| 浏览/阅读 | `view`, `views`, `read`, `reads`, `visit`, `visits` | — |
| 评分 | `rating`, `rate`, `score`, `stars` | — |
| 下载 | `download`, `dl` | — |
| 订阅 | `subscribe`, `subscription`, `newsletter`, `follow` | `subscribe` 偏邮件，`follow` 偏社交 |
| 复制 | `copy`, `copy-btn` | — |
| 打印 | `print`, `print-btn` | — |
| 全屏 | `fullscreen`, `full-screen` | — |
| 刷新 | `refresh`, `reload` | — |
| 更多 | `more`, `more-btn`, `ellipsis`, `dropdown-trigger` | — |
| 排序 | `sort`, `sort-by`, `order-by` | — |
| 筛选 | `filter`, `filters` | — |

---

## 5. 文本与排版

| 中文 | CSS 类名 | JS 变量 |
|------|----------|---------|
| 标题 | `title`, `heading` | `title` |
| 副标题 | `subtitle`, `subheading` | `subtitle` |
| 正文/段落 | `text`, `body`, `content`, `paragraph` | `body`, `content` |
| 描述 | `desc`, `description`, `summary` | `description` |
| 标签 | `tag`, `label` | `tag` |
| 标注/说明 | `caption`, `note`, `remark` | `caption`, `note` |
| 提示 | `tip`, `hint`, `help` | `tip`, `hint` |
| 代码 | `code`, `pre`, `code-block` | `code` |
| 引言/引用 | `quote`, `blockquote`, `citation` | `quote` |
| 强调 | `highlight`, `mark`, `em` | `highlight` |
| 次要文字 | `text-muted`, `text-secondary`, `text-light` | `isMuted` |
| 居中对齐 | `text-center` | — |
| 右对齐 | `text-right` | — |
| 左对齐 | `text-left` | — |
| 两端对齐 | `text-justify` | — |
| 粗体 | `font-bold`, `bold` | — |
| 下划线 | `underline` | — |
| 删除线 | `line-through`, `strikethrough` | — |
| 斜体 | `italic` | — |
| 单行截断 | `text-truncate`, `text-ellipsis`, `text-nowrap` | — |
| 多行截断 | `text-clamp`, `line-clamp` | — |
| 等宽字体 | `font-mono`, `monospace` | — |
| 大写 | `uppercase` | — |
| 首字母大写 | `capitalize` | — |
| 小写 | `lowercase` | — |
| 字间距 | `tracking-wide`, `tracking-tight` | — |
| 行高 | `leading-tight`, `leading-loose` | — |

---

## 6. 颜色与主题

| 中文 | CSS 类名 | CSS 变量名 |
|------|----------|-----------|
| 主色 | `primary`, `brand` | `--color-primary` |
| 辅色 | `secondary` | `--color-secondary` |
| 强调色 | `accent` | `--color-accent` |
| 成功/绿色 | `success`, `positive`, `green` | `--color-success` |
| 警告/橙色 | `warning`, `caution` | `--color-warning` |
| 危险/红色 | `danger`, `error`, `critical`, `negative` | `--color-danger` |
| 信息/蓝色 | `info`, `information` | `--color-info` |
| 文本色 | `text`, `foreground` | `--color-text` |
| 背景色 | `bg`, `background` | `--color-bg` |
| 边框色 | `border` | `--color-border` |
| 浅色 | `light` | — |
| 深色 | `dark` | — |
| 灰阶 | `gray-50` ～ `gray-900` | `--color-gray-50` ～ |
| 透明 | `transparent` | — |
| 反转色 | `inverted` | — |

### 主题模式

| 中文 | CSS 类名 | JS 变量 |
|------|----------|---------|
| 亮色模式 | `light`, `light-mode`, `theme-light` | `isLightTheme` |
| 暗色模式 | `dark`, `dark-mode`, `theme-dark` | `isDarkMode` |
| 系统跟随 | `system`, `auto`, `theme-system` | `followSystem` |
| 高对比度 | `high-contrast` | `isHighContrast` |

### 颜色修饰

| CSS 类名 | 说明 |
|----------|------|
| `text-primary`, `text-secondary` | 文字颜色 |
| `bg-primary`, `bg-secondary` | 背景颜色 |
| `border-primary` | 边框颜色 |

---

## 7. 状态

"状态"是 CSS 里最重要的修饰类——让元素在不同条件下看起来不同。

| 中文 | CSS 类名 ↓ 越前越推荐 | JS 布尔变量 |
|------|------------------------|------------|
| 活跃/当前 | `active`, `current` | `isActive`, `isCurrent` |
| 禁用 | `disabled`, `inactive` | `isDisabled`, `disabled` |
| 可见 | `visible`, `show`, `open` | `isVisible`, `isOpen`, `showXxx` |
| 隐藏 | `hidden`, `hide`, `invisible`, `closed` | `isHidden`, `isClosed` |
| 选中 | `selected`, `checked`, `chosen`, `picked` | `isSelected`, `isChecked` |
| 折叠/展开 | `collapsed`, `expanded` | `isCollapsed`, `isExpanded` |
| 加载中 | `loading`, `busy`, `fetching` | `isLoading`, `loading` |
| 悬停 | `hovered`（少用，用 `:hover`） | `isHovered` |
| 聚焦 | `focused`（少用，用 `:focus-visible`） | `isFocused` |
| 错误 | `error`, `invalid`, `has-error` | `hasError`, `isInvalid` |
| 成功 | `success`, `valid`, `has-success` | `isSuccess`, `isValid` |
| 警告 | `warning`, `has-warning` | `hasWarning` |
| 空状态 | `empty`, `blank`, `no-data` | `isEmpty` |
| 首项 | `first`, `is-first` | `isFirst` |
| 末项 | `last`, `is-last` | `isLast` |
| 奇数 | `odd` | `isOdd`（少用，用 `nth-child`） |
| 偶数 | `even` | `isEven` |
| 只读 | `readonly`, `read-only` | `isReadonly` |
| 必填 | `required` | `isRequired` |
| 脏/已修改 | `dirty`, `modified`, `touched` | `isDirty`, `isModified` |
| 未修改 | `pristine`, `untouched` | `isPristine` |
| 可拖拽中 | `dragging`, `dragover` | `isDragging` |
| 固定 | `fixed`, `sticky`, `pinned` | `isFixed`, `isPinned`, `isSticky` |
| 溢出 | `overflow`, `overflowing` | `isOverflowing` |
| 截断 | `truncated`, `clamped` | `isTruncated` |
| 新 | `new`, `unread`, `fresh` | `isNew`, `isUnread` |
| 已读 | `read`, `seen` | `isRead`, `isSeen` |
| 在线 | `online`, `connected` | `isOnline` |
| 离线 | `offline`, `disconnected` | `isOffline` |
| 移动端 | `mobile`, `is-mobile` | `isMobile` |
| 桌面端 | `desktop`, `is-desktop` | `isDesktop` |
| 触摸设备 | `touch`, `is-touch` | `isTouch` |
| 动画开关 | `animated`, `no-animation` | `isAnimated` |
| 偏好减少动画 | `reduced-motion` | `prefersReducedMotion` |

---

## 8. 尺寸与间距

### 尺寸阶梯

按从小到大的逻辑：`xs → sm → md → lg → xl → 2xl`

| CSS 类名 | 含义 |
|----------|------|
| `size-xs`, `size-sm`, `size-md`, `size-lg`, `size-xl` | 通用尺寸 |
| `w-xs` ～ `w-xl`, `w-full` | 宽度 |
| `h-xs` ～ `h-xl`, `h-full`, `h-screen` | 高度 |

### 间距阶梯

| CSS 类名 | 说明 |
|----------|------|
| `m-0` ～ `m-8`, `mx-auto`, `mt`, `mb`, `ml`, `mr` | margin |
| `p-0` ～ `p-8`, `pt`, `pb`, `pl`, `pr`, `px`, `py` | padding |
| `gap-0` ～ `gap-8` | gap |

### 具体含义（参考）

| 值 | 含义 |
|----|------|
| `xs` | 超小（extra small），通常 4px |
| `sm` | 小（small），通常 8px |
| `md` | 中（medium），通常 16px |
| `lg` | 大（large），通常 24px |
| `xl` | 超大（extra large），通常 32px |
| `2xl`, `3xl`, `4xl` | 更大层级 |

---

## 9. 定位与显示

| CSS 类名 | 说明 |
|----------|------|
| `relative` | position: relative |
| `absolute` | position: absolute |
| `fixed` | position: fixed |
| `sticky` | position: sticky |
| `inset-0` | top/right/bottom/left: 0 |
| `z-0` ～ `z-50` | z-index 层级 |

### 显示方式

| CSS 类名 | 说明 |
|----------|------|
| `block` | display: block |
| `inline` | display: inline |
| `inline-block` | display: inline-block |
| `inline-flex` | display: inline-flex |
| `hidden` | display: none 或 visibility: hidden |
| `sr-only` | 屏幕阅读器专用（视觉隐藏但读屏可见） |

### 浮动（少用）

| CSS 类名 |
|----------|
| `float-left`, `float-right`, `clearfix`, `clear-both` |

### 溢出

| CSS 类名 | 说明 |
|----------|------|
| `overflow-hidden` | overflow: hidden |
| `overflow-auto` | overflow: auto |
| `overflow-scroll` | overflow: scroll |
| `overflow-visible` | overflow: visible |

---

## 10. JS/TS 布尔变量

布尔变量以 `is` / `has` / `can` / `should` 开头。

### is 开头 —— 当前状态

```
isActive      isOpen        isVisible      isDisabled
isLoading     isReady       isPending      isProcessing
isExpanded    isCollapsed   isSelected     isChecked
isValid       isInvalid     isDirty        isPristine
isHovered     isFocused     isPressed      isTouched
isEmpty       isRequired    isReadonly     isEditable
isFirst       isLast        isDragging     isResizing
isOnline      isOffline     isConnected    isAuthenticated
isAdmin       isOwner       isNew          isRead
isError       isSuccess
```

### has 开头 —— 拥有某物

```
hasError      hasWarning    hasData        hasChildren
hasFocus      hasPermission hasAccess      hasChanges
hasOverflow   hasTooltip    hasImage       hasIcon
hasBadge      hasSubmenu    hasFooter
```

### can 开头 —— 能做什么

```
canEdit       canDelete     canSubmit      canSave
canUndo       canRedo       canResize      canDrag
canDrop       canNavigate   canRefresh
```

### should 开头 —— 应该做什么

```
shouldUpdate    shouldRender    shouldFetch    shouldRetry
shouldValidate  shouldNotify    shouldPersist  shouldAnimate
```

### 其他布尔前缀

```
showModal     showSidebar   showOverlay   showPanel
enableLogging  enableCache   enableNotifications
allowAnonymous allowSubmit
```

---

## 11. JS/TS 数字变量

| 场景 | 推荐命名 ↓ 越前越推荐 |
|------|----------------------|
| 数量/计数 | `count`, `total`, `num`, `totalCount`, `itemCount` |
| 索引/位置 | `index`, `idx`, `position`, `offset`, `pointer`, `cursor` |
| 当前页 | `page`, `currentPage`, `activePage`, `pageIndex` |
| 每页条数 | `pageSize`, `perPage`, `limit`, `itemsPerPage` |
| 总分页 | `totalPages`, `pageCount` |
| 最小/最大 | `min`, `max`, `minValue`, `maxValue`, `lowerBound`, `upperBound` |
| 长度 | `length`（数组/字符串） |
| 尺寸 | `width`, `height`, `size`, `depth` |
| 比例 | `ratio`, `scale`, `aspectRatio`, `percentage` |
| 时间戳 | `timestamp`, `createdAt`, `updatedAt`, `startTime`, `endTime` |
| 持续时间 | `duration`, `interval`, `delay`, `timeout`, `elapsed` |
| 重试次数 | `retries`, `retryCount`, `attempts`, `maxRetries` |
| 超时毫秒 | `timeout`, `timeoutMs`, `deadline` |
| 层级 | `level`, `depth`, `priority`, `layer`, `zIndex` |
| 步长 | `step`, `increment`, `stride` |
| 价格 | `price`, `amount`, `cost`, `fee`, `total`, `subtotal`, `tax`, `discount` |
| 速度 | `speed`, `velocity`, `rate`, `frequency` |
| 得分 | `score`, `points`, `rating`, `rank` |
| 版本号 | `version`, `major`, `minor`, `patch` |

---

## 12. JS/TS 字符串变量

| 场景 | 推荐命名 ↓ 越前越推荐 |
|------|----------------------|
| 通用文段 | `text`, `str`, `value`, `content` |
| 名称/标题 | `name`, `title`, `heading`, `label` |
| 用户名 | `username`, `userName` |
| 全名 | `fullName`, `displayName` |
| 姓氏/名字 | `firstName`, `lastName` |
| 邮箱 | `email`, `emailAddress` |
| 电话 | `phone`, `phoneNumber`, `tel`, `mobile` |
| 地址 | `address`, `location`, `url`, `href`, `link`, `path`, `route` |
| 图片地址 | `src`, `imageUrl`, `imageSrc`, `avatarUrl`, `thumbnailUrl` |
| 描述 | `description`, `desc`, `summary`, `intro`, `bio`, `abstract` |
| 提示/通知 | `message`, `msg`, `tip`, `hint`, `notification`, `alert` |
| 占位文本 | `placeholder` |
| 键/标识 | `key`, `id`, `uuid`, `slug`, `identifier`, `token` |
| 密码 | `password`, `passphrase`, `secret` |
| 搜索 | `query`, `keyword`, `searchTerm`, `searchText` |
| 类型 | `type`, `category`, `kind`, `tag`, `level`, `role`, `status` |
| 语言/主题 | `language`, `locale`, `lang`, `theme`, `mode` |
| 错误信息 | `errorMessage`, `error`, `errMsg` |
| 前缀/后缀 | `prefix`, `suffix` |
| CSS 类名 | `className` |
| HTML | `html`, `innerHtml`（只用可信内容） |
| 格式化字符串 | `format`, `pattern`, `template`, `mask` |

---

## 13. JS/TS 函数命名

### 动词前缀规范

| 前缀 | 含义 | 示例 |
|------|------|------|
| `get` | 获取/读取（同步） | `getUser`, `getValue`, `getItem` |
| `set` | 设置/写入 | `setUser`, `setName`, `setActive` |
| `fetch` | 获取数据（异步，通常是网络请求） | `fetchUsers`, `fetchPost` |
| `load` | 加载（可以是异步获取 + 设置状态） | `loadData`, `loadPage` |
| `find` | 查找 | `findById`, `findUser`, `findIndex` |
| `create` | 创建 | `createUser`, `createPost` |
| `update` | 更新 | `updateProfile`, `updateSettings` |
| `delete` / `remove` | 删除 | `deleteUser`, `removeItem` |
| `save` | 保存 | `saveData`, `saveToStorage` |
| `add` | 添加 | `addItem`, `addEventListener` |
| `has` | 检查是否有 | `hasPermission`, `hasData` |
| `is` | 检查是否为 | `isValid`, `isAdmin` |
| `can` | 检查是否能 | `canEdit`, `canDelete` |
| `should` | 检查是否应该 | `shouldRender`, `shouldRetry` |
| `toggle` | 切换 | `toggleTheme`, `toggleSidebar` |
| `handle` | 事件处理 | `handleClick`, `handleSubmit` |
| `on` | 事件回调 | `onClick`, `onChange`, `onSubmit` |
| `render` | 渲染 | `renderList`, `renderChart` |
| `show` / `hide` | 显示/隐藏 | `showModal`, `hideTooltip` |
| `open` / `close` | 打开/关闭 | `openDialog`, `closePanel` |
| `start` / `stop` | 开始/停止 | `startTimer`, `stopPolling` |
| `init` | 初始化 | `initApp`, `initCanvas` |
| `setup` | 设置（一次性） | `setupEventListeners` |
| `reset` | 重置 | `resetForm`, `resetState` |
| `clear` | 清除 | `clearCache`, `clearInterval` |
| `parse` | 解析 | `parseJSON`, `parseURL` |
| `format` | 格式化 | `formatDate`, `formatCurrency` |
| `validate` | 验证 | `validateEmail`, `validateForm` |
| `transform` | 转换 | `transformData`, `transformResponse` |
| `sanitize` | 净化/安全化 | `sanitizeHTML`, `sanitizeInput` |
| `sort` | 排序 | `sortByDate`, `sortByName` |
| `filter` | 筛选 | `filterByCategory` |
| `search` | 搜索 | `searchPosts`, `searchUsers` |
| `compute` / `calculate` | 计算 | `computeTotal`, `calculateAge` |
| `generate` | 生成 | `generateID`, `generateToken` |
| `register` / `unregister` | 注册/注销 | `registerPlugin`, `unregisterHook` |
| `subscribe` / `unsubscribe` | 订阅/取消 | `subscribe`, `unsubscribe` |
| `enable` / `disable` | 启用/禁用 | `enableButton`, `disableInput` |
| `send` | 发送 | `sendMessage`, `sendRequest` |
| `merge` | 合并 | `mergeOptions`, `mergeConfigs` |
| `clone` / `copy` | 复制 | `cloneObject`, `copyToClipboard` |
| `scrollTo` | 滚动到 | `scrollToTop`, `scrollToElement` |
| `focus` / `blur` | 聚焦/失焦 | `focusInput`, `blurField` |

### 函数命名示例（动词 + 名词）

```js
// ✅ 好：动词开头，一目了然
function getUser(id) { }
function setUserName(name) { }
function handleClick(event) { }
function onSubmit(data) { }
function fetchPosts(page) { }
function validateEmail(email) { }
function formatDate(date) { }

// ❌ 差：名词开头，不知道做什么
function userData(id) { }
function nameUpdate(name) { }
```

---

## 14. JS/TS 数组与集合

| 场景 | 推荐命名 ↓ 越前越推荐 |
|------|----------------------|
| 通用列表 | `items`, `list`, `data`, `collection`, `records`, `entries` |
| 用户 | `users`, `userList` |
| 文章 | `posts`, `articles`, `postList` |
| 评论 | `comments` |
| 标签 | `tags`, `tagList` |
| 分类 | `categories` |
| 结果集 | `results`, `searchResults` |
| 选项 | `options`, `choices`, `alternatives` |
| 已选项 | `selected`, `selectedItems`, `selection` |
| 过滤后 | `filtered`, `filteredItems`, `filteredResults` |
| 排好序 | `sorted`, `sortedItems` |
| 行/列 | `rows`, `columns`, `cols` |
| 键集合 | `keys`, `fieldNames` |
| 历史记录 | `history`, `historyItems` |
| 队列 | `queue`, `stack` |
| 错误列表 | `errors`, `errorList`, `issues` |
| 日志 | `logs`, `logEntries` |
| 通知 | `notifications`, `alerts` |

### 单复数约定

```js
const users = []         // 复数 → 数组
const user = {}          // 单数 → 单个对象
const userIds = []        // 复数 → 数组（通常存 id 的数组）
const userMap = new Map() // Map 后缀 → Map 对象
const userSet = new Set() // Set 后缀 → Set 对象
```

---

## 15. JS/TS 对象与字典

| 场景 | 推荐命名 ↓ 越前越推荐 |
|------|----------------------|
| 配置 | `config`, `options`, `settings`, `preferences`, `params` |
| 参数 | `args`, `params`, `parameters`, `payload`, `body` |
| 数据 | `data`, `record`, `entry`, `item` |
| 用户对象 | `user`, `profile`, `account` |
| 文章对象 | `post`, `article` |
| 表单数据 | `formData`, `formValues`, `formState` |
| 请求体 | `payload`, `body`, `requestBody` |
| 响应 | `response`, `res`, `result` |
| 元数据 | `meta`, `metadata`, `headers` |
| 样式对象 | `style`, `classNames` |
| 错误对象 | `error`, `err` |
| 事件对象 | `event`, `e`, `evt` |
| 节点/元素 | `node`, `element`, `el` |
| 属性 | `props`, `attributes`, `attrs` |
| 状态 | `state`, `status` |
| 查询参数 | `query`, `queryParams`, `searchParams` |
| 路由 | `route`, `router` |
| 上下文 | `context`, `ctx` |
| 事件数据 | `detail`（CustomEvent 约定） |
| 关系映射 | `lookup`, `hash`, `dictionary`, `index`, `cache` |

---

## 16. JS/TS DOM 引用

| 场景 | 推荐命名 ↓ 越前越推荐 |
|------|----------------------|
| 通用元素 | `element`, `el`, `elem`, `target` |
| 容器 | `container`, `containerEl` |
| 根节点 | `root`, `rootEl`, `app`, `appEl` |
| 按钮 | `button`, `btn`, `buttonEl`, `submitBtn` |
| 输入框 | `input`, `inputEl`, `textInput`, `searchInput` |
| 表单 | `form`, `formEl` |
| 列表 | `list`, `listEl` |
| 模态框 | `modal`, `dialog`, `modalEl` |
| 图片 | `img`, `image`, `imageEl` |
| 滚动区域 | `scrollContainer`, `scrollArea` |
| Canvas | `canvas`, `canvasEl` |
| iframe | `iframe`, `iframeEl` |

### 后缀约定

```js
// El → Element（推荐，清晰）
const containerEl = document.getElementById('container')
const buttonEl = document.querySelector('.btn')

// "Ref" 后缀（Vue/React 常见）
const inputRef = ref<HTMLInputElement | null>(null)           // Vue
const inputRef = useRef<HTMLInputElement>(null)               // React

// 无后缀（简单场景）
const container = document.getElementById('container')
```

---

## 17. JS/TS 事件与处理器

### React / Vue 事件处理

```js
// handle + 事件名 → 事件处理函数
const handleClick = () => {}
const handleSubmit = (e) => {}
const handleChange = (e) => {}
const handleKeyDown = (e) => {}
const handleScroll = () => {}

// 或 on + 事件名（React 内联）
<button onClick={handleClick}>Click</button>
```

### Vue emit 事件名（kebab-case）

```
update:modelValue    // v-model 约定
submit               // 提交
cancel               // 取消
close                // 关闭
delete               // 删除
select               // 选择
change               // 变更
```

### 原生回调

```js
// 一般监听器
element.addEventListener('click', onClick)
element.addEventListener('input', onInput)

// on + 名词 → 回调
const onSuccess = (data) => {}
const onError = (err) => {}
const onLoad = () => {}
const onClose = () => {}
const onReady = () => {}
const onProgress = (percent) => {}
const onComplete = () => {}
const onCancel = () => {}
const onTimeout = () => {}
```

### 事件对象

```js
function handleClick(event) { }   // 完整写法
function handleClick(e) { }       // 简写（最常见）
function handleClick(evt) { }     // 也有用
```

---

## 18. JS/TS 异步相关

| 场景 | 推荐命名 ↓ 越前越推荐 |
|------|----------------------|
| Promise | `promise`, `deferred` |
| 中止 | `abortController`, `signal`, `cancelToken` |
| 定时器 | `timer`, `timerId`, `intervalId`, `timeoutId` |
| 防抖定时 | `debounceTimer`, `debouncedFn` |
| 节流定时 | `throttleTimer`, `throttledFn` |
| 请求取消 | `cancelRequest`, `abortRequest` |

```js
// 异步流程中的状态变量
let isLoading = false
let isFetching = false
let isSaving = false
let isSubmitting = false
let isUploading = false

// 中止控制器
const controller = new AbortController()
const { signal } = controller
controller.abort()
```

---

## 19. JS/TS 状态管理

### Pinia / Vuex / Zustand 等

| 概念 | 推荐命名 |
|------|----------|
| Store | `useUserStore`, `useCartStore`, `useCounterStore`（Pinia 约定 `use` 开头） |
| State | `count`, `user`, `token`, `items` |
| Getter | `doubleCount`, `isLoggedIn`, `cartTotal` |
| Action | `login`, `logout`, `addItem`, `removeItem`, `clearCart` |

### React Context / Reducer

```js
// Reducer actions（大写下划线）
{ type: 'ADD_TODO', payload: { id: 1, text: '...' } }
{ type: 'REMOVE_TODO', payload: { id: 1 } }
{ type: 'TOGGLE_TODO', payload: { id: 1 } }

// 或简写
{ type: 'SET_USER', user }
{ type: 'CLEAR_USER' }
```

---

## 20. JS/TS 通用变量

| 场景 | 推荐命名 ↓ 越前越推荐 |
|------|----------------------|
| 临时变量 | `temp`, `tmp`, `result`, `out` |
| 上一次/旧值 | `prev`, `previous`, `old`, `last`, `before` |
| 下一次/新值 | `next`, `after`, `new`（少用，易与 `new` 关键字冲突） |
| 当前值 | `current`, `curr`, `now` |
| 初始值 | `initial`, `initialXX`, `defaultXX`, `fallback` |
| 比较结果 | `diff`, `delta`, `changes`, `comparison` |
| 累加器 | `acc` / `accumulator`（reduce 用） |
| 回调 | `callback`, `cb`, `fn`, `handler`, `done` |
| 遍历项 | `item`, `entry`, `element`, `el` |
| 遍历索引 | `index`, `i`, `idx`, `j`, `k` |
| 遍历值 | `value`, `val`, `v` |
| 遍历键 | `key`, `k` |
| 返回值 | `result`, `ret`, `output`, `res` |
| 标记 | `flag`, `done`, `found`, `active` |
| 迭代器 | `iterator`, `iter`, `it` |
| 正则匹配 | `match`, `matches` |
| 随机数 | `random`, `rand` |
| 克隆 | `clone`, `copy`, `cloned`, `deepCopy`, `shallowCopy` |
| 快照 | `snapshot`, `snap` |
| 占位 | `dummy`, `placeholder` |
| 模拟/测试 | `mock`, `stub`, `fake`, `test` |

---

## 21. 常用修饰词

这些词可以自由拼装，前缀/后缀/中缀来修饰。

### 时间顺序

```
prev, previous   old, last        之前
next, following  new              之后
current, curr, active             当前
first, head, start                第一个
last, tail, end                   最后一个
initial, default, fallback        初始/默认
final                              最终
```

### 范围/程度

```
min, minimum       最小值
max, maximum       最大值
avg, average       平均值
total, sum         总和
partial             部分
full, complete     完整
infinite           无限
```

### 位置

```
top, bottom, left, right, center, middle
inner, outer
above, below, before, after
```

### 方向

```
horizontal, vertical
forward, backward
up, down
```

### 修饰前缀

```
raw       原始（未处理的）
clean     清洗后的
sorted    已排序
filtered  已过滤
updated   已更新
cached    已缓存
pending   等待中
```

---

## 22. 反模式：永远不要用的命名

| ❌ 差 | 问题 | ✅ 好 |
|------|------|------|
| `data1`, `data2`, `data3` | 数字后缀，没有语义 | `userData`, `postData` |
| `aaa`, `bbb`, `temp` | 无意义 | 见上方对应分类 |
| `thing`, `stuff`, `obj` | 太模糊 | 具体名称 |
| `flag`, `flag2` | 什么 flag？ | `hasError`, `isLoaded` |
| `str`, `num`, `arr` | 匈牙利命名法（类型前置），已过时 | `name`, `count`, `users` |
| `s`, `ss`, `sss` | 字母递进 | 语义化 |
| `foo`, `bar`, `baz` | 示例代码专用，不要进生产 | — |
| `class`, `function`, `const` | 保留字 | `className`, `fn`, `constantValue` |
| `el1`, `el2` | 数字后缀 | `headerEl`, `footerEl` |
| `data`（用于一切） | 什么都叫 data，谁也看不懂 | `userData`, `apiData`, `rawData` |
| `handler`（不加限定） | 处理什么？ | `clickHandler`, `submitHandler` |
| `result`, `result1`, `finalResult` | 语义递进但无意义 | `parsedData`, `filteredUsers` |
| `value`（所有场合都用） | 什么值？ | `inputValue`, `defaultValue`, `selectedValue` |
| `cb`, `cb2` | 什么回调？ | `onSuccess`, `onError` |
| 中文拼音 | `dianjichuli` | `handleClick` |
| `isNotXXX` | 双重否定难读 | `isEditable`, `canEdit` |
| `val`（太随意） | 除了在 forEach 中，其他场合太模糊 | 具体的 `name`, `value` |
