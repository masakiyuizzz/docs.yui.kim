# SQLite —— 零配置的嵌入式关系数据库

> "Small. Fast. Reliable. Choose any three."
> C 语言编写 · 单一文件 · 无服务器 · 无配置 · ACID 事务 · 公共领域授权
> 本机安装：系统自带 3.51.0（`/usr/bin/sqlite3`）+ Homebrew keg-only 3.53.1
> 官网：[sqlite.org](https://sqlite.org) · 文档：[sqlite.org/docs.html](https://www.sqlite.org/docs.html)

---

## 目录

1. [认识 SQLite](#1-认识-sqlite)
2. [安装与 CLI 入门](#2-安装与-cli-入门)
3. [数据类型系统](#3-数据类型系统)
4. [创建数据库与表](#4-创建数据库与表)
5. [增删改查（CRUD）](#5-增删改查crud)
6. [查询进阶](#6-查询进阶)
7. [约束与引用完整性](#7-约束与引用完整性)
8. [索引](#8-索引)
9. [事务与并发](#9-事务与并发)
10. [视图](#10-视图)
11. [触发器](#11-触发器)
12. [JSON 支持](#12-json-支持)
13. [全文搜索（FTS5）](#13-全文搜索fts5)
14. [CTE 与窗口函数](#14-cte-与窗口函数)
15. [PRAGMA 配置调优](#15-pragma-配置调优)
16. [备份、恢复与迁移](#16-备份恢复与迁移)
17. [编程接口](#17-编程接口)
18. [实战场景](#18-实战场景)
19. [命令行速查](#19-命令行速查)
20. [注意事项与常见陷阱](#20-注意事项与常见陷阱)

---

## 1. 认识 SQLite

### 1.1 它是什么

SQLite 是一个**嵌入式关系数据库引擎**。它不是一个独立运行的服务器进程，而是一个**库**，直接链接到你的程序中。

```
传统数据库                       SQLite
┌──────────┐                   ┌──────────────────┐
│  Client  │──TCP──┐           │  Application     │
└──────────┘       │           │  ┌────────────┐  │
                   ▼           │  │ SQLite Lib  │  │
┌──────────┐  ┌──────────┐     │  └──────┬─────┘  │
│  Client  │─▶│  Server  │     │         │读写     │
└──────────┘  │  Process │     │  ┌──────▼─────┐  │
              └──────────┘     │  │  .db 文件  │  │
                   │           │  └────────────┘  │
              ┌────▼────┐      └──────────────────┘
              │ 数据文件 │
              └─────────┘
```

### 1.2 为什么适合你

| 特点 | 对你意味着什么 |
|------|---------------|
| **零配置** | 不需要安装数据库服务器、创建用户、配置权限 |
| **单一文件** | 整个数据库就是一个 `.db` 文件，可以复制、备份、发邮件 |
| **无服务器** | 不需要 `brew services start`，程序启动即用 |
| **轻量** | 库文件不到 1MB，内存占用极低 |
| **ACID 事务** | 崩溃断电不丢数据 |
| **标准 SQL** | 学的 SQL 知识通用，不白学 |
| **公共领域** | 随便用，无任何法律风险 |

### 1.3 谁在用

- 所有 Android / iOS 手机的本地存储引擎
- 每个 Chrome / Firefox 浏览器的书签和历史记录
- macOS 的 Spotlight、Contacts、Notes 等系统应用
- 无数桌面应用和嵌入式设备
- 单机 Web 应用（比 MySQL 简单太多）

---

## 2. 安装与 CLI 入门

### 2.1 本机版本情况

```bash
# macOS 系统自带（较旧但完全可用）
/usr/bin/sqlite3 --version
# 3.51.0 2025-06-12

# Homebrew 安装的更新版本（keg-only）
/opt/homebrew/opt/sqlite/bin/sqlite3 --version
# 3.53.1

# 建议：用系统自带足矣，也可用 brew 版本
alias sqlite3='/opt/homebrew/opt/sqlite/bin/sqlite3'
```

### 2.2 CLI 点命令

SQLite CLI 中有两类命令：
- **SQL 语句**（以 `;` 结尾）—— 标准 SQL
- **点命令**（以 `.` 开头）—— CLI 专用控制命令

```bash
# 打开 / 创建数据库
sqlite3 mydb.db

# 进入交互模式后：
```

| 点命令 | 说明 |
|--------|------|
| `.help` | 帮助 |
| `.tables` | 列出所有表 |
| `.schema` | 显示所有建表语句 |
| `.schema table_name` | 查看特定表结构 |
| `.databases` | 列出已附加的数据库 |
| `.indexes` | 列出索引 |
| `.show` | 显示当前设置 |
| `.mode` | 查看/设置输出模式 |
| `.headers on\|off` | 显示/隐藏列标题 |
| `.output file.txt` | 输出重定向到文件 |
| `.output stdout` | 输出恢复终端 |
| `.read file.sql` | 执行 SQL 文件 |
| `.import file.csv table` | 导入 CSV |
| `.dump` | 导出整个数据库为 SQL |
| `.dump table_name` | 只导出某表 |
| `.backup ?DB? file` | 备份数据库到文件 |
| `.restore ?DB? file` | 从文件恢复 |
| `.clone new.db` | 克隆当前数据库 |
| `.quit` 或 `.exit` | 退出 |

### 2.3 输出模式

```bash
.mode column          # 对齐列（最常用）
.mode line            # 每列一行
.mode list            # 分隔符模式（默认）
.mode csv             # CSV 格式
.mode json            # JSON 格式
.mode insert          # INSERT 语句格式
.mode table           # ASCII 表格
.mode markdown        # Markdown 表格

.separator ,          # 设置分隔符（list 模式下）
.width 10 20 30       # 设置每列宽度
```

### 2.4 第一个示例

```sql
-- 进入 sqlite3 mydb.db 后执行

CREATE TABLE posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO posts (title, content) VALUES
    ('Hello SQLite', '今天开始学数据库'),
    ('SQLite 真简单', '原来数据库可以只有一个文件');

.headers on
.mode column
SELECT * FROM posts;
-- id  title           content            created_at
-- --  --------------  -----------------  -------------------
-- 1   Hello SQLite    今天开始学数据库     2025-06-12 ...
-- 2   SQLite 真简单    原来数据库可以只...   2025-06-12 ...

.quit
```

---

## 3. 数据类型系统

### 3.1 类型亲和性（Type Affinity）

SQLite 的独特设计：**列没有固定类型**。任何列可以存储任何类型的值。但有"类型亲和性"——建议列优先使用某类型。

```sql
-- 五种类型亲和性
INTEGER          -- 整数
REAL             -- 浮点数
TEXT             -- 字符串
BLOB             -- 二进制数据
NUMERIC          -- 数字（整数或浮点）
```

### 3.2 存储类别（Storage Classes）

不管声明什么类型，SQLite 内部用 5 种存储类别：

| 存储类别 | 容纳的内容 |
|----------|-----------|
| `NULL` | NULL 值 |
| `INTEGER` | 有符号整数（1, 2, 3, 4, 6, 8 字节自动选择） |
| `REAL` | 8 字节 IEEE 浮点数 |
| `TEXT` | 字符串（UTF-8 / UTF-16BE / UTF-16LE） |
| `BLOB` | 原始二进制，原样存储 |

### 3.3 类型声明决定亲和性

| 列声明示例 | 推导的亲和性 |
|-----------|-------------|
| `INT`, `INTEGER`, `TINYINT`, `BIGINT` 等 | INTEGER |
| `TEXT`, `CHAR`, `VARCHAR`, `CLOB` 等 | TEXT |
| `BLOB`, 无声明 | BLOB |
| `REAL`, `DOUBLE`, `FLOAT` | REAL |
| `NUMERIC`, `DECIMAL`, `BOOLEAN`, `DATE` | NUMERIC |

### 3.4 类型行为

```sql
-- 列声明为 INTEGER，但可以插入文本
CREATE TABLE demo (val INTEGER);
INSERT INTO demo VALUES ('hello');   -- ✅ 不会报错！
INSERT INTO demo VALUES (42);        -- ✅
SELECT typeof(val) FROM demo;
-- text      ← 'hello' 被存储为 TEXT
-- integer   ← 42 被存储为 INTEGER

-- INTEGER PRIMARY KEY 的特殊行为：
-- 如果插入 NULL，自动分配递增整数（别名 rowid）
CREATE TABLE t (id INTEGER PRIMARY KEY, name TEXT);
INSERT INTO t (name) VALUES ('Alice');
SELECT id FROM t;   -- 1（自动分配）
```

### 3.5 STRICT 表（SQLite 3.37+）

如果你想要"传统数据库"那样的严格类型检查：

```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    age INTEGER,
    score REAL
) STRICT;
-- 现在 age 只能存整数，score 只能存浮点数
-- INSERT INTO users (name, age) VALUES ('Alice', 'x') → 报错
```

### 3.6 日期时间

SQLite 没有 DATE/DATETIME 类型，用 TEXT / INTEGER / REAL 存储：

```sql
-- 三种存储方式
-- 1. TEXT（ISO 8601 字符串，最推荐，可读）
'2025-06-12'
'2025-06-12 15:30:00'

-- 2. INTEGER（Unix 时间戳）
1718206800

-- 3. REAL（儒略日）
2460475.5

-- 日期时间函数
SELECT date('now');                    -- 2025-06-12
SELECT datetime('now');                -- 2025-06-12 15:30:00
SELECT datetime('now', '+1 day');      -- 明天
SELECT datetime('now', '-1 month');    -- 上个月
SELECT strftime('%Y-%m-%d', 'now');    -- 格式化
SELECT julianday('now');               -- 儒略日
SELECT unixepoch('now');               -- Unix 时间戳
```

---

## 4. 创建数据库与表

### 4.1 创建表

```sql
-- 最简单
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 完整示例：博客系统
CREATE TABLE authors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    bio TEXT,
    avatar_url TEXT
);

CREATE TABLE posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    author_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    content TEXT,
    status TEXT DEFAULT 'draft'
        CHECK(status IN ('draft', 'published', 'archived')),
    view_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES authors(id)
        ON DELETE CASCADE
);

CREATE TABLE tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL
);

-- 多对多关联表
CREATE TABLE post_tags (
    post_id INTEGER NOT NULL,
    tag_id INTEGER NOT NULL,
    PRIMARY KEY (post_id, tag_id),
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);
```

### 4.2 约束一览

| 约束 | 作用 | 示例 |
|------|------|------|
| `PRIMARY KEY` | 主键，唯一标识一行 | `id INTEGER PRIMARY KEY` |
| `AUTOINCREMENT` | 自动递增（仅 INTEGER PRIMARY KEY） | `id INTEGER PRIMARY KEY AUTOINCREMENT` |
| `NOT NULL` | 不允许 NULL | `name TEXT NOT NULL` |
| `UNIQUE` | 值唯一 | `email TEXT UNIQUE` |
| `DEFAULT` | 默认值 | `status TEXT DEFAULT 'active'` |
| `CHECK` | 值域校验 | `age INTEGER CHECK(age >= 0)` |
| `FOREIGN KEY` | 外键引用 | `FOREIGN KEY (uid) REFERENCES users(id)` |

### 4.3 修改表

```sql
-- 添加列
ALTER TABLE posts ADD COLUMN summary TEXT;

-- 重命名表
ALTER TABLE posts RENAME TO articles;

-- 重命名列（SQLite 3.25+）
ALTER TABLE posts RENAME COLUMN content TO body;

-- 删除列（SQLite 3.35+）
ALTER TABLE posts DROP COLUMN summary;

-- 注意：不支持修改列的类型或约束
-- 需要新建表 → 复制数据 → 删旧表 → 重命名
```

### 4.4 删除表

```sql
DROP TABLE IF EXISTS old_table;
DROP TABLE old_table;           -- 不加 IF EXISTS，表不存在会报错
```

### 4.5 查看表结构

```sql
.schema posts                     -- CLI 命令
PRAGMA table_info(posts);         -- SQL 查询（更详细）
SELECT sql FROM sqlite_master
  WHERE type='table' AND name='posts';  -- 查看 DDL
```

---

## 5. 增删改查（CRUD）

### 5.1 INSERT —— 插入数据

```sql
-- 单行插入（推荐：明确指定列名）
INSERT INTO authors (name, bio) VALUES ('Alice', '一个写作者');

-- 多行插入
INSERT INTO posts (author_id, title, slug, content) VALUES
    (1, '第一篇', 'first-post', '这是内容'),
    (1, '第二篇', 'second-post', '又是内容');

-- 插入所有列（按表定义顺序，不推荐）
INSERT INTO authors VALUES (NULL, 'Bob', '开发者', NULL);

-- 使用子查询插入
INSERT INTO draft_posts
    SELECT * FROM posts WHERE status = 'draft';

-- REPLACE：如果存在则替换（基于主键/唯一约束）
REPLACE INTO authors (id, name) VALUES (1, 'Alice2');
-- 等价于：先 DELETE 再 INSERT

-- 从 JSON 插入
INSERT INTO posts (title, slug, content)
    SELECT json_extract(value, '$.title'),
           json_extract(value, '$.slug'),
           json_extract(value, '$.content')
    FROM json_each('[{"title":"A","slug":"a","content":"..."}]');
```

### 5.2 SELECT —— 查询数据

```sql
-- 基础查询
SELECT * FROM posts;
SELECT title, created_at FROM posts;

-- 去重
SELECT DISTINCT status FROM posts;

-- 别名
SELECT title AS 标题, created_at AS 创建时间 FROM posts;

-- 排序
SELECT * FROM posts ORDER BY created_at DESC;
SELECT * FROM posts ORDER BY status ASC, created_at DESC;

-- 限制数量
SELECT * FROM posts LIMIT 10;
SELECT * FROM posts LIMIT 10 OFFSET 20;   -- 第 21-30 条

-- 条件过滤（见下一节详解）
SELECT * FROM posts
WHERE status = 'published' AND view_count > 100;
```

### 5.3 UPDATE —— 更新数据

```sql
-- 更新单列
UPDATE posts SET status = 'published' WHERE id = 1;

-- 更新多列
UPDATE posts
SET title = '新标题', updated_at = CURRENT_TIMESTAMP
WHERE id = 1;

-- 基于计算更新
UPDATE counters SET count = count + 1 WHERE name = 'visits';

-- 无条件更新（修改所有行）
UPDATE posts SET view_count = 0;

-- 用子查询更新
UPDATE posts
SET author_id = (SELECT id FROM authors WHERE name = 'Alice')
WHERE author_id IS NULL;
```

### 5.4 DELETE —— 删除数据

```sql
-- 删除指定行
DELETE FROM posts WHERE id = 1;

-- 删除满足条件的多行
DELETE FROM posts WHERE status = 'archived';

-- 删除所有行（表结构保留）
DELETE FROM posts;

-- 快速清空表（不触发 DELETE 触发器）
DELETE FROM posts;
-- 更快的方式：
```

### 5.5 UPSERT —— 插入或更新（SQLite 3.24+）

```sql
-- 如果冲突则更新
INSERT INTO counters (name, count) VALUES ('visits', 1)
ON CONFLICT(name) DO UPDATE SET count = count + 1;

-- 如果冲突则忽略
INSERT INTO users (email, name) VALUES ('alice@example.com', 'Alice')
ON CONFLICT(email) DO NOTHING;

-- 带条件的 UPSERT
INSERT INTO posts (slug, title, content) VALUES ('hello', 'Hello', '...')
ON CONFLICT(slug) DO UPDATE
SET title = excluded.title,
    content = excluded.content,
    updated_at = CURRENT_TIMESTAMP
WHERE posts.status != 'archived';   -- archived 的不更新
```

---

## 6. 查询进阶

### 6.1 WHERE 条件

```sql
-- 比较运算符
=   <>  !=  <  >  <=  >=

-- 逻辑运算符
AND  OR  NOT

-- BETWEEN
SELECT * FROM posts WHERE created_at BETWEEN '2025-01-01' AND '2025-06-30';

-- IN / NOT IN
SELECT * FROM posts WHERE status IN ('draft', 'published');
SELECT * FROM posts WHERE status NOT IN ('archived');

-- LIKE（模糊匹配）
SELECT * FROM posts WHERE title LIKE '%SQLite%';   -- 包含 SQLite
SELECT * FROM posts WHERE title LIKE 'Hello%';     -- 以 Hello 开头
SELECT * FROM posts WHERE title LIKE '_est';       -- 单字符匹配

-- GLOB（Unix 通配符，大小写敏感）
SELECT * FROM posts WHERE title GLOB '[A-Z]*';     -- 大写字母开头

-- IS NULL / IS NOT NULL
SELECT * FROM posts WHERE content IS NULL;

-- EXISTS（子查询有结果时返回）
SELECT * FROM authors WHERE EXISTS
    (SELECT 1 FROM posts WHERE posts.author_id = authors.id);
```

### 6.2 GROUP BY 与聚合

```sql
-- 聚合函数
COUNT()  SUM()  AVG()  MAX()  MIN()  GROUP_CONCAT()  TOTAL()

-- 按状态分组统计
SELECT status, COUNT(*) as cnt
FROM posts
GROUP BY status;

-- 每个作者的帖子数
SELECT author_id, COUNT(*) as post_count
FROM posts
GROUP BY author_id
ORDER BY post_count DESC;

-- HAVING（过滤分组结果，类似 WHERE 但用于聚合后）
SELECT author_id, COUNT(*) as cnt
FROM posts
GROUP BY author_id
HAVING cnt >= 3;    -- 至少 3 篇文章

-- GROUP_CONCAT（连接分组内的值）
SELECT author_id, GROUP_CONCAT(title, ', ') as titles
FROM posts
GROUP BY author_id;

-- WHERE vs HAVING
-- WHERE  在分组前过滤行
-- HAVING 在分组后过滤组
SELECT status, COUNT(*) FROM posts
WHERE created_at >= '2025-01-01'      -- 只统计今年的
GROUP BY status
HAVING COUNT(*) > 1;                   -- 数量大于 1 的状态
```

### 6.3 JOIN —— 连接表

```
INNER JOIN      ┌───┐    两张表的交集
                │▓▓▓│
LEFT JOIN       ┌───┐    左表全部 + 右表匹配
                │▓▓▓│
                └─┘
CROSS JOIN      笛卡尔积（所有组合）
```

```sql
-- INNER JOIN（只返回匹配的行）
SELECT p.title, a.name AS author
FROM posts p
INNER JOIN authors a ON p.author_id = a.id;

-- LEFT JOIN（左表全部行都返回，右表无匹配时为 NULL）
SELECT a.name, COUNT(p.id) as post_count
FROM authors a
LEFT JOIN posts p ON p.author_id = a.id
GROUP BY a.id;
-- 结果包含没发过文章的作者（post_count = 0）

-- 多表连接
SELECT p.title, a.name AS author, GROUP_CONCAT(t.name) AS tags
FROM posts p
JOIN authors a ON p.author_id = a.id
LEFT JOIN post_tags pt ON p.id = pt.post_id
LEFT JOIN tags t ON pt.tag_id = t.id
GROUP BY p.id;

-- 自连接（查询同一表的不同行之间的关系）
SELECT a.title, b.title AS related
FROM posts a
JOIN post_tags pt1 ON a.id = pt1.post_id
JOIN post_tags pt2 ON pt1.tag_id = pt2.tag_id AND pt1.post_id != pt2.post_id
JOIN posts b ON pt2.post_id = b.id;
-- 找到有相同标签的相关文章

-- CROSS JOIN（笛卡尔积，慎用）
SELECT * FROM colors CROSS JOIN sizes;
```

### 6.4 子查询

```sql
-- 标量子查询（返回单个值）
SELECT title FROM posts
WHERE view_count > (SELECT AVG(view_count) FROM posts);

-- 在 SELECT 中使用子查询
SELECT title,
    (SELECT COUNT(*) FROM comments WHERE post_id = posts.id) AS comment_count
FROM posts;

-- 在 FROM 中使用子查询（派生表）
SELECT * FROM (
    SELECT status, COUNT(*) as cnt FROM posts GROUP BY status
) WHERE cnt > 2;

-- 关联子查询（引用外部查询的列）
SELECT title FROM posts p
WHERE EXISTS (
    SELECT 1 FROM comments c WHERE c.post_id = p.id
);

-- IN 子查询
SELECT * FROM posts WHERE author_id IN
    (SELECT id FROM authors WHERE name LIKE 'A%');
```

### 6.5 CASE 表达式

```sql
-- 简单 CASE
SELECT title,
    CASE status
        WHEN 'draft' THEN '草稿'
        WHEN 'published' THEN '已发布'
        WHEN 'archived' THEN '已归档'
        ELSE '未知'
    END AS status_cn
FROM posts;

-- 搜索 CASE
SELECT title, view_count,
    CASE
        WHEN view_count >= 1000 THEN '热门'
        WHEN view_count >= 100 THEN '一般'
        ELSE '冷门'
    END AS popularity
FROM posts
ORDER BY view_count DESC;
```

---

## 7. 约束与引用完整性

### 7.1 外键

SQLite 默认**不强制外键约束**，需要手动开启：

```sql
-- 开启外键约束（每个连接都要执行）
PRAGMA foreign_keys = ON;

-- 或在 sqlite3 启动时
sqlite3 -cmd "PRAGMA foreign_keys = ON" mydb.db

-- 创建有外键的表
CREATE TABLE comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER NOT NULL,
    author TEXT NOT NULL,
    body TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id)
        ON DELETE CASCADE      -- 删除文章时自动删除评论
        ON UPDATE CASCADE      -- 更新文章 id 时同步更新
);

-- 外键动作
ON DELETE CASCADE      -- 级联删除
ON DELETE SET NULL     -- 设为 NULL
ON DELETE SET DEFAULT  -- 设为默认值
ON DELETE RESTRICT     -- 禁止删除（默认）
ON DELETE NO ACTION    -- 同 RESTRICT
```

### 7.2 CHECK 约束

```sql
-- 列级 CHECK
CREATE TABLE products (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    price REAL CHECK(price > 0),
    stock INTEGER CHECK(stock >= 0)
);

-- 表级 CHECK（可涉及多列）
CREATE TABLE orders (
    id INTEGER PRIMARY KEY,
    start_date DATE,
    end_date DATE,
    CHECK(end_date >= start_date)
);

-- 给约束命名（便于调试）
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    age INTEGER,
    email TEXT,
    CONSTRAINT age_positive CHECK(age > 0),
    CONSTRAINT email_format CHECK(email LIKE '%@%.%')
);
```

### 7.3 AUTOINCREMENT 的细节

```sql
-- INTEGER PRIMARY KEY（不显式指定 AUTOINCREMENT）
-- 行为：如果插入时 id 为空或 NULL，取 max(rowid)+1
-- 如果最大 rowid 的那行被删了，其 id 会复用

-- INTEGER PRIMARY KEY AUTOINCREMENT
-- 行为：保证 id 总是递增的，即使删掉最大 id 的行的也不复用
-- 代价：多查一张内部表（sqlite_sequence），稍慢

-- 建议：非特殊需要，只用 INTEGER PRIMARY KEY 即可
```

---

## 8. 索引

### 8.1 创建索引

```sql
-- 单列索引
CREATE INDEX idx_posts_author ON posts(author_id);

-- 多列索引（最左前缀原则）
CREATE INDEX idx_posts_status_date ON posts(status, created_at);
-- 这个索引可以加速：
-- WHERE status = 'published'
-- WHERE status = 'published' AND created_at > '2025-01-01'
-- 但不能加速 WHERE created_at > '2025-01-01'（跳过了 status）

-- 唯一索引
CREATE UNIQUE INDEX idx_users_email ON users(email);

-- 表达式索引（SQLite 3.9+）
CREATE INDEX idx_posts_lower_title ON posts(LOWER(title));
-- 加速 WHERE LOWER(title) = 'hello world'

-- 部分索引（SQLite 3.8+）
CREATE INDEX idx_active_posts ON posts(created_at)
    WHERE status = 'published';
-- 只索引已发布的文章，减少索引大小
```

### 8.2 删除索引

```sql
DROP INDEX IF EXISTS idx_posts_author;
```

### 8.3 查看索引

```sql
.indexes                          -- CLI 命令
PRAGMA index_list(posts);         -- 列出表的所有索引
PRAGMA index_info(idx_name);      -- 查看索引详情
```

### 8.4 分析查询计划

```sql
EXPLAIN QUERY PLAN
SELECT * FROM posts WHERE status = 'published' ORDER BY created_at DESC;
-- 输出：是否用了索引，扫描了多少行等
```

### 8.5 索引最佳实践

- **有选择性的列加索引**：性别（男/女）不适合，email 适合
- **外键列加索引**：`JOIN` 和 `WHERE` 经常用到
- **WHERE / ORDER BY / JOIN 常一起用的列**加联合索引
- **不要过度索引**：每次 INSERT/UPDATE/DELETE 都要维护索引
- **用部分索引**替代全列索引，减少写入开销

---

## 9. 事务与并发

### 9.1 事务基础

```sql
-- 隐式事务（每条语句自动提交）
INSERT INTO posts VALUES (...);  -- 自动包裹在事务中

-- 显式事务
BEGIN TRANSACTION;
    INSERT INTO posts (...) VALUES (...);
    INSERT INTO post_tags (...) VALUES (...);
    UPDATE authors SET post_count = post_count + 1 WHERE id = 1;
COMMIT;

-- 如果中途出错，回滚
BEGIN TRANSACTION;
    INSERT INTO posts (...) VALUES (...);
    -- 出错了
ROLLBACK;
-- 回滚后，INSERT 的效果完全撤销

-- SQLite 也支持
BEGIN;
...

-- SAVEPOINT（部分回滚）
SAVEPOINT sp1;
    INSERT INTO posts (...) VALUES (...);
    -- 这里出错了
    ROLLBACK TO sp1;   -- 只撤销 sp1 之后的操作
RELEASE sp1;
```

### 9.2 WAL 模式（Write-Ahead Logging）

**默认的 rollback journal 模式**：写的时候锁住整个数据库，读和写互斥。

**WAL 模式**：写操作先写入 `.wal` 文件，读操作仍然读主数据库文件。读和写可以同时进行。

```sql
-- 启用 WAL 模式（持久化设置）
PRAGMA journal_mode = WAL;

-- 查看当前模式
PRAGMA journal_mode;
-- 返回：wal

-- WAL 模式的特点：
-- ✅ 读和写可以并发（多读 + 一写）
-- ✅ 写入通常更快（顺序写 WAL 文件）
-- ❌ 需要 WAL 检查和清理
-- ✅ 数据库仍是单一 .db 文件（WAL 是临时文件）
```

WAL 模式对个人本地项目**几乎总是更好的选择**。在初始化数据库时执行一次即可。

### 9.3 并发与锁

```sql
-- SQLite 锁级别（由低到高）
-- UNLOCKED → SHARED（读） → RESERVED（准备写） → PENDING → EXCLUSIVE（写）

-- WAL 模式下：
-- 读操作不阻塞其他读，也不阻塞写
-- 写操作不阻塞读
-- 同一时刻只有一个写操作
```

### 9.4 常见事务模式

```sql
-- 批量插入优化
BEGIN TRANSACTION;
    INSERT INTO bigtable VALUES (...);
    INSERT INTO bigtable VALUES (...);
    -- ... 数千条
COMMIT;
-- 将数千条 INSERT 包在单个事务中，比逐条提交快 100+ 倍

-- 快速的做法（牺牲安全性）
PRAGMA synchronous = OFF;
PRAGMA journal_mode = OFF;
-- 批量操作后恢复
PRAGMA synchronous = FULL;
PRAGMA journal_mode = DELETE;
```

---

## 10. 视图

视图是保存的查询，可以像表一样使用。

```sql
-- 创建视图
CREATE VIEW published_posts AS
SELECT p.title, p.created_at, a.name AS author
FROM posts p
JOIN authors a ON p.author_id = a.id
WHERE p.status = 'published';

-- 使用视图（和查表一样）
SELECT * FROM published_posts WHERE author = 'Alice';

-- 删除视图
DROP VIEW IF EXISTS published_posts;

-- 视图是"虚拟"的，每次查询都实时执行底层 SQL
-- 适合：封装复杂查询、做权限控制、简化应用代码
```

---

## 11. 触发器

触发器在 INSERT/UPDATE/DELETE 时自动执行 SQL。

```sql
-- 自动更新 updated_at
CREATE TRIGGER trg_posts_updated
    AFTER UPDATE ON posts
    FOR EACH ROW
BEGIN
    UPDATE posts SET updated_at = CURRENT_TIMESTAMP
    WHERE id = OLD.id
      AND NEW.updated_at IS OLD.updated_at;
    -- 只在用户没有手动更新时才自动更新
END;

-- 自动记录变更日志
CREATE TABLE audit_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    table_name TEXT,
    record_id INTEGER,
    action TEXT,
    old_values TEXT,
    new_values TEXT,
    changed_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER trg_posts_audit_insert
    AFTER INSERT ON posts
    FOR EACH ROW
BEGIN
    INSERT INTO audit_log (table_name, record_id, action, new_values)
    VALUES ('posts', NEW.id, 'INSERT', json_object('title', NEW.title));
END;

-- 阻止删除（归档代替）
CREATE TRIGGER trg_posts_archive
    INSTEAD OF DELETE ON posts
    FOR EACH ROW
BEGIN
    -- 这里用 INSTEAD OF 只能用于 VIEW
    -- 实际用 BEFORE DELETE 改 status
    UPDATE posts SET status = 'archived' WHERE id = OLD.id;
    SELECT RAISE(ABORT, 'Posts are archived, not deleted');
END;
```

### 触发器变量

```
NEW.id     —— INSERT 或 UPDATE 后的新值
OLD.id     —— DELETE 或 UPDATE 前的旧值
```

### 管理触发器

```sql
.tables                           -- 触发器也会显示
SELECT name, sql FROM sqlite_master WHERE type = 'trigger';
DROP TRIGGER IF EXISTS trg_name;
```

---

## 12. JSON 支持

SQLite 内置了强大的 JSON 函数（从 3.38 起更是直接有 `->` 和 `->>` 运算符）。

### 12.1 查询 JSON

```sql
-- 假设有一列 json_data 存储 JSON
SELECT json_extract(json_data, '$.name') FROM mytable;
-- 3.38+ 简写
SELECT json_data->'$.name' FROM mytable;
-- 获取文本值（去除引号）
SELECT json_data->>'$.name' FROM mytable;

-- 嵌套访问
SELECT json_extract(data, '$.user.address.city') FROM t;
SELECT data->'$.user'->>'$.address.city' FROM t;   -- 3.38+

-- 数组元素
SELECT json_extract(data, '$[0]') FROM t;           -- 第一个元素
SELECT json_extract(data, '$[3].name') FROM t;      -- 第四个元素的 name
```

### 12.2 构建 JSON

```sql
-- json_object
SELECT json_object('name', 'Alice', 'age', 25);
-- {"name":"Alice","age":25}

-- json_array
SELECT json_array('apple', 'banana', 'cherry');
-- ["apple","banana","cherry"]

-- json_group_array 聚合
SELECT author_id, json_group_array(title) as titles
FROM posts GROUP BY author_id;

-- json_group_object 聚合
SELECT json_group_object(name, count) FROM counters;
-- {"visits":100,"likes":50}
```

### 12.3 修改 JSON

```sql
-- json_set（设置值，不存在则添加）
SELECT json_set('{"name":"Alice"}', '$.age', 25);
-- {"name":"Alice","age":25}

-- json_insert（只添加，不覆盖已有值）
SELECT json_insert('{"name":"Alice"}', '$.name', 'Bob');
-- {"name":"Alice"}  -- 已有不覆盖

-- json_replace（只覆盖，不添加）
SELECT json_replace('{"name":"Alice"}', '$.age', 25);
-- {"name":"Alice"}  -- 无 age 不添加

-- json_remove（删除键）
SELECT json_remove('{"name":"Alice","temp":1}', '$.temp');
-- {"name":"Alice"}

-- json_patch（RFC 7396 合并）
SELECT json_patch('{"name":"Alice","age":25}', '{"age":26,"city":"NY"}');
-- {"name":"Alice","age":26,"city":"NY"}
```

### 12.4 JSON 表函数

```sql
-- json_each：遍历 JSON 对象的键值
SELECT * FROM json_each('{"name":"Alice","age":25}');
-- key   value   type
-- name  "Alice" text
-- age   25      integer

-- json_tree：递归遍历整个 JSON 树
SELECT * FROM json_tree('{"a":[1,2]}');

-- json_each 遍历数组
SELECT value FROM json_each('[1, 2, 3]');
-- 1, 2, 3
```

### 12.5 JSON 验证

```sql
-- 检查是否为合法 JSON
SELECT json_valid('{"a":1}');       -- 1
SELECT json_valid('not json');      -- 0

-- 获取 JSON 类型
SELECT json_type('{"a":1}');        -- object
SELECT json_type('[1,2,3]');        -- array
```

---

## 13. 全文搜索（FTS5）

FTS5 是 SQLite 的全文索引模块，提供比 `LIKE '%keyword%'` 快得多的文本搜索。

### 13.1 创建 FTS 表

```sql
-- 创建 FTS5 虚拟表
CREATE VIRTUAL TABLE posts_fts USING fts5(
    title,
    content,
    content=posts,          -- 使用外部内容表
    content_rowid=id
);

-- 简单版本（内容存储在 FTS 表本身）
CREATE VIRTUAL TABLE docs_fts USING fts5(title, body);

-- 填充（如果内容在 FTS 表本身）
INSERT INTO docs_fts (title, body) VALUES
    ('SQLite Guide', 'SQLite is a lightweight database...'),
    ('Python Tutorial', 'Python is a programming language...');
```

### 13.2 外部内容表（节省空间，推荐）

```sql
CREATE VIRTUAL TABLE posts_fts USING fts5(
    title,
    content,
    content=posts,       -- posts 是真实表
    content_rowid=id     -- 映射到 posts 的 id
);

-- 创建触发器自动同步（必须手动维护 FTS 索引）
CREATE TRIGGER posts_ai AFTER INSERT ON posts BEGIN
    INSERT INTO posts_fts(rowid, title, content)
    VALUES (NEW.id, NEW.title, NEW.content);
END;

CREATE TRIGGER posts_ad AFTER DELETE ON posts BEGIN
    INSERT INTO posts_fts(posts_fts, rank) VALUES('delete', OLD.id);
END;

CREATE TRIGGER posts_au AFTER UPDATE ON posts BEGIN
    INSERT INTO posts_fts(posts_fts, rank) VALUES('delete', OLD.id);
    INSERT INTO posts_fts(rowid, title, content)
    VALUES (NEW.id, NEW.title, NEW.content);
END;
```

### 13.3 搜索

```sql
-- 基本搜索
SELECT * FROM posts_fts WHERE posts_fts MATCH 'SQLite';

-- 短语搜索
SELECT * FROM posts_fts WHERE posts_fts MATCH '"lightweight database"';

-- AND / OR / NOT
SELECT * FROM posts_fts WHERE posts_fts MATCH 'SQLite AND Python';
SELECT * FROM posts_fts WHERE posts_fts MATCH 'SQLite OR database';
SELECT * FROM posts_fts WHERE posts_fts MATCH 'database NOT SQLite';

-- 前缀搜索
SELECT * FROM posts_fts WHERE posts_fts MATCH 'data*';
-- 匹配 data, database, datagram...

-- 带排名的搜索
SELECT rowid, title, rank
FROM posts_fts
WHERE posts_fts MATCH 'SQLite'
ORDER BY rank;

-- 高亮搜索结果
SELECT highlight(posts_fts, 0, '<b>', '</b>') AS title,
       highlight(posts_fts, 1, '<b>', '</b>') AS content
FROM posts_fts WHERE posts_fts MATCH 'SQLite';
```

---

## 14. CTE 与窗口函数

### 14.1 公用表表达式（CTE）

CTE 是 SQL 中临时的"具名子查询"，让复杂查询更可读。

```sql
-- 基本 CTE
WITH recent_posts AS (
    SELECT * FROM posts
    WHERE created_at >= date('now', '-7 days')
)
SELECT author_id, COUNT(*) as cnt
FROM recent_posts
GROUP BY author_id;

-- 多个 CTE
WITH
    post_counts AS (
        SELECT author_id, COUNT(*) as cnt FROM posts GROUP BY author_id
    ),
    active_authors AS (
        SELECT * FROM post_counts WHERE cnt >= 5
    )
SELECT a.name, c.cnt
FROM authors a JOIN active_authors c ON a.id = c.author_id;
```

### 14.2 递归 CTE

适合处理树形结构（分类、评论回复、组织架构等）。

```sql
-- 生成 1 到 100
WITH RECURSIVE cnt(x) AS (
    SELECT 1
    UNION ALL
    SELECT x + 1 FROM cnt WHERE x < 100
)
SELECT x FROM cnt;

-- 组织树（无限级分类）
CREATE TABLE categories (
    id INTEGER PRIMARY KEY,
    name TEXT,
    parent_id INTEGER REFERENCES categories(id)
);

-- 查询某个分类及其所有子级
WITH RECURSIVE sub_cats AS (
    -- 起始：根节点
    SELECT id, name, parent_id, 0 AS depth
    FROM categories WHERE id = 1

    UNION ALL

    -- 递归：找子节点
    SELECT c.id, c.name, c.parent_id, sc.depth + 1
    FROM categories c
    JOIN sub_cats sc ON c.parent_id = sc.id
)
SELECT name, depth FROM sub_cats ORDER BY depth, id;
```

### 14.3 窗口函数

窗口函数在"行组"上计算，但**不折叠行**（和 GROUP BY 不同）。

```sql
-- ROW_NUMBER：行号
SELECT title, created_at,
    ROW_NUMBER() OVER (ORDER BY created_at DESC) AS row_num
FROM posts;

-- RANK / DENSE_RANK：排名
SELECT title, view_count,
    RANK() OVER (ORDER BY view_count DESC) AS rank,
    DENSE_RANK() OVER (ORDER BY view_count DESC) AS dense_rank
FROM posts;

-- RANK：相同值排名相同，下一排名跳数字  (1, 1, 3, 4...)
-- DENSE_RANK：相同值排名相同，下一排名不跳 (1, 1, 2, 3...)

-- 分区窗口
SELECT author_id, title, created_at,
    ROW_NUMBER() OVER (
        PARTITION BY author_id        -- 每个作者内部编号
        ORDER BY created_at DESC
    ) AS post_num
FROM posts;

-- LAG / LEAD（前后行对比）
SELECT title, view_count,
    LAG(view_count) OVER (ORDER BY created_at) AS prev_views,
    LEAD(view_count) OVER (ORDER BY created_at) AS next_views
FROM posts;

-- 滚动聚合
SELECT created_at, view_count,
    SUM(view_count) OVER (
        ORDER BY created_at
        ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
    ) AS weekly_rolling
FROM posts;

-- NTILE：分成 N 组
SELECT title, view_count,
    NTILE(4) OVER (ORDER BY view_count DESC) AS quartile
FROM posts;
```

---

## 15. PRAGMA 配置调优

PRAGMA 语句用于查询和设置 SQLite 内部参数。

### 15.1 关键 PRAGMA

```sql
-- 性能相关
PRAGMA journal_mode = WAL;              -- 启用 WAL 模式（强烈推荐）
PRAGMA synchronous = NORMAL;            -- 平衡安全和速度（默认 FULL）
PRAGMA cache_size = -10000;            -- 缓存 10MB（负数 = KB）
PRAGMA mmap_size = 268435456;          -- 内存映射 256MB
PRAGMA temp_store = MEMORY;            -- 临时表存内存
PRAGMA page_size = 4096;               -- 页大小（新建 DB 时设）
PRAGMA auto_vacuum = NONE;             -- 不自动压缩（默认）

-- 安全相关
PRAGMA foreign_keys = ON;              -- 启用外键
PRAGMA integrity_check;                -- 完整性检查
PRAGMA quick_check;                    -- 快速完整性检查
PRAGMA application_id = 12345;         -- 应用标识（防止文件误用）

-- 信息查询
PRAGMA table_info(posts);              -- 表列信息
PRAGMA index_list(posts);              -- 索引列表
PRAGMA page_count;                     -- 页总数
PRAGMA freelist_count;                 -- 空闲页数
PRAGMA compile_options;                -- 编译时启用的功能
PRAGMA database_list;                  -- 附加的数据库
PRAGMA user_version;                   -- 用户定义版本号（用于迁移）
```

### 15.2 推荐初始化配置

```sql
-- 每次使用数据库时执行
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;
PRAGMA busy_timeout = 5000;       -- 锁等待 5 秒
PRAGMA cache_size = -20000;       -- 20MB 缓存
PRAGMA mmap_size = 134217728;     -- 128MB 内存映射
PRAGMA synchronous = NORMAL;
```

### 15.3 查看大小

```sql
-- 数据库物理大小
SELECT page_count * page_size / 1024.0 / 1024.0 AS size_mb
FROM pragma_page_size, pragma_page_count;

-- 各表大小
SELECT name,
    pgsize / 1024 AS size_kb
FROM dbstat
ORDER BY pgsize DESC;
-- 需要启用 DBSTAT 虚拟表
```

---

## 16. 备份、恢复与迁移

### 16.1 .dump 导出

```bash
# 导出整个数据库为 SQL
sqlite3 mydb.db .dump > backup.sql

# 只导出结构和数据（不含设置）
sqlite3 mydb.db .dump --data-only > data.sql
sqlite3 mydb.db .dump --schema-only > schema.sql

# 只导出某些表
sqlite3 mydb.db ".dump posts authors" > partial.sql

# 恢复
sqlite3 new.db < backup.sql
```

### 16.2 .backup / .restore

```bash
# 在线备份（可以在使用中备份）
sqlite3 mydb.db ".backup backup.db"

# 恢复
sqlite3 mydb.db ".restore backup.db"
```

### 16.3 .clone

```bash
# 克隆当前数据库到新文件
sqlite3 mydb.db ".clone clone.db"
```

### 16.4 在 SQL 中备份

```sql
-- 在 SQL 中执行在线备份
VACUUM INTO 'backup.db';

-- 压缩数据库
VACUUM;
```

### 16.5 数据库迁移 / 版本管理

```sql
-- 用 user_version 记录 schema 版本
PRAGMA user_version;
-- 初始为 0

-- 设置版本
PRAGMA user_version = 1;

-- 应用层迁移模式（伪代码）
-- 读取当前版本 → 根据版本执行对应 DDL → 更新版本号
-- 例：
-- IF version = 0:  ALTER TABLE ... ADD COLUMN ...; PRAGMA user_version = 1
-- IF version = 1:  CREATE INDEX ...;               PRAGMA user_version = 2
```

---

## 17. 编程接口

### 17.1 Node.js —— better-sqlite3（推荐生产）

```bash
# 安装
pnpm add better-sqlite3
```

```js
// db.js
import Database from 'better-sqlite3'

const db = new Database('mydb.db')

// 初始化（只执行一次）
db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

// ===== 查询 =====
// 单行
const user = db.prepare('SELECT * FROM users WHERE id = ?').get(1)

// 多行
const posts = db.prepare('SELECT * FROM posts WHERE author_id = ?').all(1)

// 遍历（大数据集，不一次性加载内存）
const stmt = db.prepare('SELECT * FROM posts')
for (const row of stmt.iterate()) {
  console.log(row.title)
}

// ===== 写入 =====
// 单行插入
const info = db.prepare(
  'INSERT INTO users (name, email) VALUES (?, ?)'
).run('Alice', 'alice@example.com')
console.log(info.lastInsertRowid)  // 新插入的 id

// 批量插入（极快）
const insert = db.prepare(
  'INSERT INTO posts (author_id, title, slug, content) VALUES (?, ?, ?, ?)'
)

const insertMany = db.transaction((posts) => {
  for (const p of posts) {
    insert.run(p.author_id, p.title, p.slug, p.content)
  }
})

insertMany([
  { author_id: 1, title: 'A', slug: 'a', content: '...' },
  { author_id: 1, title: 'B', slug: 'b', content: '...' },
])

// ===== 命名参数 =====
const byName = db.prepare(
  'SELECT * FROM posts WHERE author_id = @authorId AND status = @status'
)
byName.all({ authorId: 1, status: 'published' })

// ===== 自定义函数 =====
db.function('greet', (name) => `Hello, ${name}!`)
const r = db.prepare("SELECT greet('Alice')").get()
// { "greet('Alice')": "Hello, Alice!" }

// ===== 关闭 =====
db.close()
```

### 17.2 Node.js —— node:sqlite（Node 22+ 内置，实验性）

```js
// Node 22+ 实验性
// 启动：node --experimental-sqlite app.js
import { DatabaseSync } from 'node:sqlite'

const db = new DatabaseSync('mydb.db')

// 执行 SQL
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL
  )
`)

// 插入
const stmt = db.prepare('INSERT INTO users (name) VALUES (?)')
stmt.run('Alice')

// 查询
const query = db.prepare('SELECT * FROM users WHERE id = ?')
console.log(query.get(1))
// { id: 1, name: 'Alice' }

db.close()
```

### 17.3 Python —— sqlite3 标准库

```python
import sqlite3

# 连接
conn = sqlite3.connect('mydb.db')
conn.execute("PRAGMA journal_mode=WAL")
conn.execute("PRAGMA foreign_keys=ON")
conn.row_factory = sqlite3.Row  # 按列名访问

# 查询
rows = conn.execute("SELECT * FROM posts WHERE author_id = ?", (1,))
for row in rows:
    print(row['title'], row['created_at'])

# 单行
row = conn.execute("SELECT * FROM users WHERE id = ?", (1,)).fetchone()

# 写入
conn.execute(
    "INSERT INTO users (name, email) VALUES (?, ?)",
    ('Alice', 'alice@example.com')
)
conn.commit()

# 批量
data = [('A', 'a@x.com'), ('B', 'b@x.com')]
conn.executemany("INSERT INTO users (name, email) VALUES (?, ?)", data)
conn.commit()

# 创建自定义函数
conn.create_function("add_one", 1, lambda x: x + 1)
conn.execute("SELECT add_one(41)")  # 42

conn.close()
```

---

## 18. 实战场景

### 场景 1：个人知识库

```sql
-- 建表
CREATE TABLE notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT,
    tags TEXT,          -- 用 JSON 数组存储标签
    is_pinned INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 创建 FTS（搜索笔记内容）
CREATE VIRTUAL TABLE notes_fts USING fts5(
    title, content, content=notes, content_rowid=id
);

-- 触发器自动同步 FTS
CREATE TRIGGER notes_ai AFTER INSERT ON notes BEGIN
    INSERT INTO notes_fts(rowid, title, content)
    VALUES (NEW.id, NEW.title, NEW.content);
END;
-- (同样需要 UPDATE 和 DELETE 触发器)

-- 插入一条笔记
INSERT INTO notes (title, content, tags)
VALUES ('SQLite WAL 模式',
        'WAL 是 Write-Ahead Logging 的缩写...',
        '["数据库","SQLite","性能"]');

-- 全文搜索
SELECT notes.*, rank
FROM notes
JOIN notes_fts ON notes.id = notes_fts.rowid
WHERE notes_fts MATCH 'SQLite AND 性能'
ORDER BY rank;

-- 按标签查询（用 JSON 函数）
SELECT * FROM notes
WHERE json_array_length(json_extract(tags, '$')) > 0;

-- 查询含"SQLite"标签的笔记
SELECT * FROM notes
WHERE EXISTS (
    SELECT 1 FROM json_each(notes.tags)
    WHERE value = 'SQLite'
);
```

### 场景 2：简单的博客系统

```sql
-- 建表
create_tables.sql（见第 4.1 节）
```

```js
// blog-db.js
import Database from 'better-sqlite3'
import fs from 'node:fs'

const db = new Database('blog.db')
db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

// 初始化表结构
db.exec(fs.readFileSync('create_tables.sql', 'utf-8'))

export function getRecentPosts(limit = 10) {
  return db.prepare(`
    SELECT p.*, a.name AS author_name
    FROM posts p
    JOIN authors a ON p.author_id = a.id
    WHERE p.status = 'published'
    ORDER BY p.created_at DESC
    LIMIT ?
  `).all(limit)
}

export function getPostBySlug(slug) {
  // 自动 +1 浏览量
  db.prepare('UPDATE posts SET view_count = view_count + 1 WHERE slug = ?').run(slug)
  return db.prepare(`
    SELECT p.*, a.name AS author_name
    FROM posts p
    JOIN authors a ON p.author_id = a.id
    WHERE p.slug = ?
  `).get(slug)
}

export function createPost({ author_id, title, slug, content }) {
  return db.prepare(`
    INSERT INTO posts (author_id, title, slug, content)
    VALUES (?, ?, ?, ?)
  `).run(author_id, title, slug, content)
}

export function getPostsByTag(tagName) {
  return db.prepare(`
    SELECT p.* FROM posts p
    JOIN post_tags pt ON p.id = pt.post_id
    JOIN tags t ON pt.tag_id = t.id
    WHERE t.name = ? AND p.status = 'published'
    ORDER BY p.created_at DESC
  `).all(tagName)
}

export default db
```

### 场景 3：配置数据 / 键值存储

```sql
CREATE TABLE config (
    key TEXT PRIMARY KEY,
    value TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 插入或更新
INSERT INTO config (key, value) VALUES ('theme', 'dark')
ON CONFLICT(key) DO UPDATE SET
    value = excluded.value,
    updated_at = CURRENT_TIMESTAMP;

-- 读取
SELECT value FROM config WHERE key = 'theme';

-- 批量读取
SELECT key, value FROM config WHERE key IN ('theme', 'language');
```

### 场景 4：计数器 / 统计数据

```sql
CREATE TABLE stats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    value INTEGER DEFAULT 0,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 原子递增（UPSERT）
INSERT INTO stats (name, value) VALUES ('page_views', 1)
ON CONFLICT(name) DO UPDATE SET
    value = value + 1,
    updated_at = CURRENT_TIMESTAMP;

-- 按小时记录（时序数据）
CREATE TABLE hourly_stats (
    hour TEXT,                    -- '2025-06-12T15'
    metric TEXT,
    value INTEGER,
    PRIMARY KEY (hour, metric)
);

INSERT INTO hourly_stats (hour, metric, value) VALUES ('2025-06-12T15', 'visits', 1)
ON CONFLICT(hour, metric) DO UPDATE SET value = value + 1;
```

### 场景 5：轻量化替换 JSON 文件

```js
// 以前：用 JSON 文件存数据
// data.json → 读整个文件 → 修改 → 写整个文件
// 问题：并发不安全、大文件慢、无查询能力

// 现在：用 SQLite
const db = new Database('app.db')
db.pragma('journal_mode = WAL')

// 存用户设置
db.prepare('INSERT OR REPLACE INTO config (key, value) VALUES (?, ?)')
  .run('user.preferences', JSON.stringify({ theme: 'dark', lang: 'zh' }))

// 读用户设置
const prefs = JSON.parse(
  db.prepare('SELECT value FROM config WHERE key = ?')
    .get('user.preferences').value
)
```

---

## 19. 命令行速查

### 进入与退出

```bash
sqlite3 mydb.db              # 打开/创建
sqlite3 :memory:               # 内存数据库
sqlite3 -cmd "PRAGMA ..." mydb.db  # 启动时执行 SQL
```

### 点命令速查表

| 命令 | 说明 |
|------|------|
| `.help` | 帮助 |
| `.tables ?PATTERN?` | 列出表 |
| `.schema ?TABLE?` | 显示建表语句 |
| `.databases` | 列出数据库 |
| `.indexes ?TABLE?` | 列出索引 |
| `.show` | 显示 CLI 设置 |
| `.headers on\|off` | 列标题开关 |
| `.mode MODE` | 输出模式（column/json/csv/…） |
| `.timer on\|off` | 计时开关 |
| `.output FILE` | 输出到文件 |
| `.output stdout` | 恢复终端输出 |
| `.read FILE` | 执行 SQL 文件 |
| `.import FILE TABLE` | 导入 CSV |
| `.dump ?TABLE?` | 导出 SQL |
| `.backup FILE` | 在线备份 |
| `.restore FILE` | 在线恢复 |
| `.clone NEWDB` | 克隆数据库 |
| `.save FILE` | 写入磁盘（内存数据库用） |
| `.quit` / `.exit` | 退出 |
| `.load FILE` | 加载扩展 |
| `.shell CMD` | 执行系统命令 |
| `.sha3sum ?TABLE?` | SHA3 校验 |

### CLI 启动示例

```bash
# 美化输出
sqlite3 -cmd ".headers on" -cmd ".mode column" mydb.db

# 执行一条 SQL 后退出
sqlite3 mydb.db "SELECT count(*) FROM posts"

# 管道 SQL
echo "SELECT * FROM posts;" | sqlite3 -cmd ".headers on" mydb.db

# 定时备份
sqlite3 mydb.db ".backup 'backup_$(date +%Y%m%d).db'"
```

---

## 20. 注意事项与常见陷阱

1. **外键默认不生效**：每个连接都必须 `PRAGMA foreign_keys = ON`。忘记开的外键形同虚设。

2. **类型太宽松**：默认不强制类型。如果来自强类型语言背景，用 `STRICT` 表（SQLite 3.37+）。

3. **并发写受限**：SQLite 不支持多个进程同时写。对个人应用足够，但不要用于高并发 Web 服务端。

4. **默认 synchronous=FULL 较慢**：开发环境可降至 NORMAL。生产环境保留 FULL 确保安全性。

5. **不要用 NFS 共享存储**：SQLite 依赖文件锁，NFS 的文件锁实现常有 bug。数据库文件放本地磁盘。

6. **`AUTOINCREMENT` 有额外开销**：大部分场景用 `INTEGER PRIMARY KEY`（不加 AUTOINCREMENT）即可，一样自增且更快。

7. **长时间运行的 WAL 需要 checkpoint**：WAL 文件会持续增长，系统自动在合适时机做 checkpoint。手动触发：`PRAGMA wal_checkpoint(TRUNCATE)`。

8. **`DELETE` 不释放磁盘空间**：删数据后文件大小不变。用 `VACUUM` 回收空间（会锁库，较慢）。

9. **大 `OFFSET` 很慢**：`LIMIT 10 OFFSET 100000` 需要扫描 100010 行。用"游标分页"代替：`WHERE id > last_id ORDER BY id LIMIT 10`。

10. **SQL 注入风险**：永远不要拼接用户输入到 SQL 字符串。用参数化查询（`?` 占位符或命名参数）。

11. **日期时间没有原生类型**：用 TEXT（ISO 8601 字符串）存储最清晰可读、最容易查询。

12. **整数溢出**：`INTEGER` 按需分配 1~8 字节，但如果存极大数（超过 9e18）会存为 REAL，丢失精度。用 TEXT 存超大整数。

13. **临时表在连接关闭时销毁**：`CREATE TEMP TABLE` 创建的表只在当前连接有效。

14. **生产环境备份**：用 `.backup` 或 `VACUUM INTO` 做在线备份，不要直接 `cp` 数据库文件（有 WAL 文件时可能不一致）。

15. **代码大小**：SQLite 在"全功能"编译下约 900KB。对嵌入式场景足够小，对桌面/服务端更是忽略不计。
