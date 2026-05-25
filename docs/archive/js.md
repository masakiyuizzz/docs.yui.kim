# JavaScript —— 网页的脚本语言

> "JavaScript is the world's most misunderstood programming language." —— Douglas Crockford
> 从 Brendan Eich 10 天草创（1995）到 ES6（2015）脱胎换骨，到每年一个新版本（ES2016～ES2025）。
> 标准：ECMAScript · 权威参考：[developer.mozilla.org/zh-CN/docs/Web/JavaScript](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript)

> **阅读提示**：JS 的知识点确实零散——今天学闭包，明天学 Promise，后天发现不会解构。本文件按**从基础到高级**的线索组织，每一节都给你"什么时候用、为什么这么用"的语境，而不是干巴巴的语法列表。

---

## 目录

1. [JavaScript 是什么](#1-javascript-是什么)
2. [变量与声明](#2-变量与声明)
3. [数据类型](#3-数据类型)
4. [运算符](#4-运算符)
5. [控制流](#5-控制流)
6. [字符串](#6-字符串)
7. [数组](#7-数组)
8. [对象](#8-对象)
9. [函数](#9-函数)
10. [作用域与闭包](#10-作用域与闭包)
11. [this 关键字](#11-this-关键字)
12. [类与面向对象](#12-类与面向对象)
13. [解构赋值](#13-解构赋值)
14. [展开与剩余](#14-展开与剩余)
15. [模板字符串](#15-模板字符串)
16. [Set / Map / WeakMap](#16-set--map--weakmap)
17. [可选链与空值合并](#17-可选链与空值合并)
18. [模块](#18-模块)
19. [错误处理](#19-错误处理)
20. [异步编程](#20-异步编程)
21. [DOM 操作](#21-dom-操作)
22. [事件](#22-事件)
23. [JSON](#23-json)
24. [常用 Web API 速览](#24-常用-web-api-速览)
25. [实用模式与代码片段](#25-实用模式与代码片段)
26. [常见陷阱与最佳实践](#26-常见陷阱与最佳实践)

---

## 1. JavaScript 是什么

```
┌─────────────────────────────────────────────┐
│              浏览器 (Browser)                 │
│                                              │
│  HTML ──→ DOM 树（结构）                     │
│  CSS  ──→ CSSOM（样式）                      │
│  JS   ──→ 修改 DOM + CSSOM + 发请求 + ...    │
│                                              │
│  JavaScript 是浏览器中唯一的原生编程语言       │
└─────────────────────────────────────────────┘
```

JavaScript 可以：
- **操作 DOM**：增删改页面元素
- **操作样式**：动态修改 CSS
- **响应事件**：点击、滚动、键盘、触摸
- **网络通信**：fetch 数据、WebSocket 实时推送
- **本地存储**：localStorage、IndexedDB
- **运行在服务端**：Node.js

**ES6 是分水岭**。ES6 之前 JS 被称为"玩具语言"，ES6 之后有了 class、箭头函数、Promise、模块、解构等现代特性。后续每年一个版本（ES2017 有 async/await，ES2020 有可选链，ES2021 有逻辑赋值...），都是增量改进。

---

## 2. 变量与声明

### 2.1 var vs let vs const

```js
// var —— 函数作用域，会提升，允许重复声明（不推荐再用）
var name = "Alice"
var name = "Bob"    // ✅ 允许（但混乱）
console.log(name)   // "Bob"

// let —— 块作用域，不允许重复声明
let age = 25
// let age = 30     // ❌ SyntaxError
age = 30            // ✅ 可以重新赋值

// const —— 块作用域，不可重新赋值（推荐默认使用）
const PI = 3.14159
// PI = 3           // ❌ TypeError: 对常量赋值
const config = { theme: "dark" }
config.theme = "light"   // ✅ 对象内部属性可变（引用没变）
// config = {}            // ❌ 引用不可变
```

### 2.2 声明建议

```js
// 默认用 const
// 需要重新赋值时用 let
// 不再使用 var

const MAX_USERS = 100           // 常量
const user = { name: "Alice" }  // 对象（内容可变，引用不变）
let counter = 0                 // 需要重新赋值的变量
```

### 2.3 变量提升（Hoisting）

```js
// var 声明被"提升"到作用域顶部（但赋值不提升）
console.log(x)  // undefined（不是 ReferenceError！）
var x = 5

// 等价于：
// var x
// console.log(x)
// x = 5

// let / const 不会被提升（暂时性死区 TDZ）
// console.log(y)  // ❌ ReferenceError
let y = 10
```

---

## 3. 数据类型

### 3.1 8 种类型

```js
// 原始类型（7 种）
const n = null              // null（故意的空值）
const u = undefined         // undefined（未定义）
const b = true              // boolean
const num = 42              // number（整数和浮点数都是它）
const big = 9007199254740991n  // bigint（大整数，数字后加 n）
const str = "hello"         // string
const sym = Symbol("id")    // symbol（唯一标识符）

// 引用类型（1 种）
const obj = { a: 1 }        // object（包括数组、函数、日期等）
const arr = [1, 2, 3]       // 数组也是 object
const fn = function() {}    // 函数也是 object
```

### 3.2 类型检测

```js
typeof "hello"        // "string"
typeof 42             // "number"
typeof true           // "boolean"
typeof undefined      // "undefined"
typeof Symbol()       // "symbol"
typeof 123n           // "bigint"

// ⚠️ typeof 的"三个谎言"
typeof null           // "object"（历史遗留 bug）
typeof [1, 2, 3]      // "object"（无法区分数组和对象）
typeof function(){}   // "function"（函数是特殊的对象）

// 更准确的类型判断
Array.isArray([1, 2, 3])      // true
Object.prototype.toString.call([])  // "[object Array]"
Object.prototype.toString.call(null) // "[object Null]"
typeof (() => {}) === "function"     // 函数用 typeof 还是准的

// 判断是否为 null
value === null

// 判断是否既不是 null 也不是 undefined
value != null   // null 和 undefined 用 == 比较时相等
```

### 3.3 类型转换

```js
// 显式转换（推荐）
String(42)           // "42"
Number("42")         // 42
Boolean("hello")     // true
parseInt("42px")     // 42
parseFloat("3.14")   // 3.14

// 隐式转换（常见坑）
"5" + 3              // "53"（字符串拼接！）
"5" - 3              // 2（减法触发数字转换）
"5" * "3"            // 15
+ "42"               // 42（一元 + 强制转数字）
!!"hello"            // true（双感叹转布尔）

// 假值（falsy）：这 6 个值在布尔上下文中为 false
false, 0, "", null, undefined, NaN
// 其他都是真值（truthy）
```

---

## 4. 运算符

### 4.1 算术与赋值

```js
// 算术
2 + 3       // 5
2 - 3       // -1
2 * 3       // 6
2 / 3       // 0.666...
2 ** 3      // 8（幂）
10 % 3      // 1（取余）

// 自增/自减
let a = 1
a++         // 返回 1，然后 a = 2
++a         // a = 3，返回 3

// 赋值简写
let x = 10
x += 5    // x = 15
x -= 3    // x = 12
x *= 2    // x = 24
x /= 4    // x = 6

// 逻辑赋值（ES2021）
let y = null
y ??= "默认值"   // y 为 null/undefined 时赋值
let z = 0
z ||= 42         // z 为 falsy 时赋值（0 是 falsy！）
z &&= 100        // z 为 truthy 时赋值
```

### 4.2 比较

```js
// 宽松相等（==）：会做类型转换，不推荐
0 == false        // true  😱
"" == false       // true  😱
null == undefined // true（特例）

// 严格相等（===）：不转换类型，永远用这个
0 === false       // false ✅
"" === false      // false ✅

// Object.is：对 NaN 和 -0 更精确
Object.is(NaN, NaN)     // true（NaN === NaN 是 false）
Object.is(0, -0)        // false（0 === -0 是 true）

// 比较
5 > 3            // true
"b" > "a"        // true（字典序）
"2" > "10"       // true（字典序：'2' > '1'）
```

### 4.3 逻辑与可选链

```js
// 逻辑与 &&（短路：第一个 falsy 就停）
true && "hello"      // "hello"
false && "hello"     // false

// 逻辑或 ||（短路：第一个 truthy 就停）
0 || "hello"         // "hello"（常用作默认值）
42 || "hello"        // 42

// 空值合并 ??（只拦截 null 和 undefined）
0 ?? "hello"         // 0（0 不是 null！）
null ?? "hello"      // "hello"

// 可选链 ?.（ES2020，安全访问深层属性）
user?.address?.city
// 等价于：user && user.address && user.address.city
// 任何一个为 null/undefined 就返回 undefined
```

---

## 5. 控制流

### 5.1 if / else if / else

```js
const score = 85

if (score >= 90) {
  console.log("优秀")
} else if (score >= 80) {
  console.log("良好")
} else if (score >= 60) {
  console.log("及格")
} else {
  console.log("不及格")
}
```

### 5.2 switch

```js
const fruit = "apple"

switch (fruit) {
  case "apple":
  case "pear":
    console.log("仁果类")
    break           // 别忘了 break！否则"穿透"
  case "peach":
    console.log("核果类")
    break
  default:
    console.log("其他")
}
```

### 5.3 三元运算符

```js
const msg = score >= 60 ? "及格" : "不及格"

// 嵌套时加括号提高可读性
const grade = score >= 90 ? "A"
            : score >= 80 ? "B"
            : score >= 60 ? "C"
            : "D"
```

### 5.4 循环

```js
// for —— 知道次数时用
for (let i = 0; i < 5; i++) {
  console.log(i)
}

// while —— 不知道次数时用
let i = 0
while (i < 5) {
  console.log(i)
  i++
}

// do...while —— 至少执行一次
let j = 0
do {
  console.log(j)
  j++
} while (j < 5)

// for...of —— 遍历可迭代对象（数组、字符串、Map、Set 等）
const arr = ["a", "b", "c"]
for (const item of arr) {
  console.log(item)     // "a", "b", "c"
}

for (const [index, item] of arr.entries()) {
  console.log(index, item)  // 0 "a", 1 "b", 2 "c"
}

// for...in —— 遍历对象的可枚举属性（含原型链，少用）
const obj = { a: 1, b: 2 }
for (const key in obj) {
  if (Object.hasOwn(obj, key)) {  // 过滤原型属性
    console.log(key, obj[key])
  }
}
// 更推荐：Object.keys(obj).forEach(k => console.log(k, obj[k]))
```

### 5.5 break / continue

```js
for (let i = 0; i < 10; i++) {
  if (i === 3) continue   // 跳过本次迭代
  if (i === 7) break      // 终止循环
  console.log(i)          // 0, 1, 2, 4, 5, 6
}

// 带标签的 break（跳出多层循环）
outer:
for (let i = 0; i < 3; i++) {
  for (let j = 0; j < 3; j++) {
    if (i === 1 && j === 1) break outer
    console.log(i, j)
  }
}
```

---

## 6. 字符串

### 6.1 基本操作

```js
const str = "JavaScript"

str.length          // 10
str[0]              // "J"（不支持负数索引）
str.charAt(0)       // "J"
str.toUpperCase()   // "JAVASCRIPT"
str.toLowerCase()   // "javascript"

// 截取
str.slice(0, 4)     // "Java"（支持负数：slice(-6) === "Script"）
str.substring(0, 4) // "Java"（不支持负数）

// 搜索
str.includes("va")  // true
str.startsWith("Ja") // true
str.endsWith("pt")  // true
str.indexOf("a")    // 1（第一次出现的位置，未找到 -1）
str.lastIndexOf("a") // 3（最后一次出现的位置）
str.search(/script/i) // 4（支持正则）

// 替换
str.replace("Java", "Type")     // "TypeScript"（只替换第一个）
str.replace(/a/g, "A")          // "JAvAScript"（全局替换）
str.replaceAll("a", "A")        // "JAvAScript"（ES2021）

// 拆分与连接
"a-b-c".split("-")              // ["a", "b", "c"]
"a-b-c".split("-", 2)           // ["a", "b"]（限制数量）
["a", "b", "c"].join(", ")      // "a, b, c"

// 去空格
"  hello  ".trim()              // "hello"
"  hello  ".trimStart()         // "hello  "
"  hello  ".trimEnd()           // "  hello"

// 填充
"42".padStart(5, "0")           // "00042"
"42".padEnd(5, ".")             // "42..."

// 重复
"ha".repeat(3)                  // "hahaha"

// 字符与码点
"A".charCodeAt(0)               // 65
String.fromCharCode(65)         // "A"
```

---

## 7. 数组

### 7.1 创建与基本操作

```js
const arr = [1, 2, 3, 4, 5]
const arr2 = Array.from("abc")        // ["a", "b", "c"]
const arr3 = Array.from({ length: 5 }, (_, i) => i)  // [0,1,2,3,4]
const arr4 = Array.of(1, 2, 3)        // [1,2,3]

arr.length          // 5
arr[0]              // 1
arr[arr.length - 1] // 5（最后一个）
arr.at(-1)          // 5（ES2022，支持负数）

// 检查是否为数组
Array.isArray(arr)  // true
```

### 7.2 增删改

```js
// 末尾
arr.push(6, 7)          // [1,2,3,4,5,6,7]（返回新长度）
arr.pop()               // 7（返回被删除的元素）

// 开头
arr.unshift(0)          // [0,1,2,3,4,5,6]（返回新长度）
arr.shift()             // 0（返回被删除的元素）

// 任意位置（会修改原数组）
arr.splice(2, 1)        // 从索引 2 删 1 个 → [1,2,4,5,6]
arr.splice(2, 0, "x")   // 在索引 2 插入 → [1,2,"x",4,5,6]
arr.splice(2, 2, "a","b") // 替换 → [1,2,"a","b",5,6]

// 切片（不修改原数组）
arr.slice(1, 3)         // 索引 1~2 → [2, "a"]
arr.slice(-2)           // 最后 2 个
```

### 7.3 遍历与转换 —— 函数式数组方法

这些是 JS 中最常用的工具，掌握它们能少写 80% 的 for 循环。

```js
const nums = [1, 2, 3, 4, 5]

// forEach —— 遍历（无返回值，用于执行副作用）
nums.forEach((n, i) => console.log(i, n))

// map —— 映射（返回新数组，每个元素变换）
nums.map(n => n * 2)              // [2, 4, 6, 8, 10]
nums.map((n, i) => `${i}: ${n}`)  // ["0: 1", "1: 2", ...]

// filter —— 过滤
nums.filter(n => n % 2 === 0)     // [2, 4]
nums.filter(n => n > 3)           // [4, 5]

// find —— 查找第一个匹配的元素
nums.find(n => n > 3)             // 4
nums.findIndex(n => n > 3)        // 3

// some —— 是否至少有一个满足条件
nums.some(n => n > 4)             // true

// every —— 是否全部满足条件
nums.every(n => n > 0)            // true
nums.every(n => n > 3)            // false

// reduce —— 归约（最强大也最难读的方法）
nums.reduce((sum, n) => sum + n, 0)         // 15（求和）
nums.reduce((max, n) => Math.max(max, n))  // 5（找最大值）

// 复杂 reduce 示例：按属性分组
const items = [
  { type: "fruit", name: "苹果" },
  { type: "fruit", name: "香蕉" },
  { type: "veg",   name: "胡萝卜" },
]
const grouped = items.reduce((acc, item) => {
  (acc[item.type] ??= []).push(item)
  return acc
}, {})
// { fruit: [{...},{...}], veg: [{...}] }

// flat —— 拍平嵌套数组
[1, [2, [3, 4]]].flat()         // [1, 2, [3, 4]]
[1, [2, [3, 4]]].flat(2)        // [1, 2, 3, 4]
[1, [2, [3, 4]]].flat(Infinity) // [1, 2, 3, 4]

// flatMap —— map 后自动 flat(1)
["hello world", "foo bar"].flatMap(s => s.split(" "))
// ["hello", "world", "foo", "bar"]

// sort —— 排序（⚠️ 默认按字符串排！）
[3, 1, 10, 2].sort()             // [1, 10, 2, 3]  😱
[3, 1, 10, 2].sort((a, b) => a - b) // [1, 2, 3, 10] ✅

// reverse —— 反转（修改原数组）
[1, 2, 3].reverse()              // [3, 2, 1]
// 不想修改原数组：用 toReversed()（ES2023）
[1, 2, 3].toReversed()           // [3, 2, 1]（新数组）

// 其他不修改原数组的方法（ES2023+）
[1, 2, 3].toSorted((a, b) => b - a)  // [3, 2, 1]
[2, 1, 3].toSpliced(1, 1, 9)        // [2, 9, 3]
[1, 2, 3].with(1, "x")              // [1, "x", 3]
```

### 7.4 数组去重与集合操作

```js
// 去重
const dupes = [1, 2, 2, 3, 3, 3]
[...new Set(dupes)]          // [1, 2, 3]

// 交集
const a = [1, 2, 3], b = [2, 3, 4]
const intersection = a.filter(x => b.includes(x))  // [2, 3]

// 差集
const diff = a.filter(x => !b.includes(x))  // [1]

// 并集
const union = [...new Set([...a, ...b])]    // [1, 2, 3, 4]
```

---

## 8. 对象

### 8.1 基本操作

```js
const user = {
  name: "Alice",
  age: 25,
  "is-admin": true,         // 带特殊字符的键用引号
}

// 访问
user.name                   // "Alice"
user["name"]                // "Alice"
user["is-admin"]            // true（只能用方括号）

// 动态键
const key = "name"
user[key]                   // "Alice"

// 增删改
user.email = "alice@example.com"
user.age = 26
delete user.age             // true（删除成功）

// 检查属性是否存在
"name" in user              // true
user.hasOwnProperty("name") // true
Object.hasOwn(user, "name") // true（推荐，ES2022）

// 遍历
Object.keys(user)           // ["name", "is-admin"]（自己的可枚举属性）
Object.values(user)         // ["Alice", true]
Object.entries(user)        // [["name","Alice"], ["is-admin",true]]

for (const [key, value] of Object.entries(user)) {
  console.log(`${key}: ${value}`)
}
```

### 8.2 属性简写与计算属性

```js
const name = "Alice"
const age = 25

// 属性简写
const user = { name, age }    // { name: "Alice", age: 25 }

// 计算属性名
const prop = "theme"
const config = {
  [prop]: "dark",              // { theme: "dark" }
  [`${prop}_mode`]: "auto",   // { theme_mode: "auto" }
}
```

### 8.3 对象方法简写

```js
const person = {
  name: "Bob",
  // 方法简写（ES6）
  greet() {
    return `Hello, I'm ${this.name}`
  },
  // 旧写法
  // greet: function() { return "Hello, I'm " + this.name }
}
person.greet()  // "Hello, I'm Bob"
```

### 8.4 合并与复制

```js
// 浅合并（Object.assign）
const target = { a: 1 }
const result = Object.assign(target, { b: 2 }, { c: 3 })
// result = { a: 1, b: 2, c: 3 }（target 也被修改）

// 展开语法（推荐，不修改原对象）
const merged = { ...target, ...{ b: 2 } }  // { a: 1, b: 2 }

// 有序合并（后面的覆盖前面的）
const config = { ...defaultConfig, ...userConfig }

// 结构化克隆（深拷贝）
const deepCopy = structuredClone(original)
// 支持循环引用、Date、Map、Set 等
// 不支持函数、DOM 节点、Symbol

// JSON 深拷贝（旧的替代方案，有局限）
const copy = JSON.parse(JSON.stringify(original))
// 不支持：Date→字符串、undefined→消失、函数→消失、循环引用→报错
```

### 8.5 冻结与密封

```js
// Object.freeze —— 不可修改（浅冻结）
const frozen = Object.freeze({ a: 1, nested: { b: 2 } })
frozen.a = 999        // ❌ 静默失败（严格模式报错）
frozen.nested.b = 999 // ✅ 嵌套对象未冻结！

// Object.seal —— 不可增删，可改已有属性

// Object.preventExtensions —— 不可新增
```

---

## 9. 函数

### 9.1 函数声明与表达式

```js
// 函数声明（会提升，可以在定义前调用）
function add(a, b) {
  return a + b
}

// 函数表达式（赋值不会提升）
const add = function(a, b) {
  return a + b
}

// 箭头函数
const add = (a, b) => a + b              // 单表达式自动 return
const greet = name => `Hello, ${name}`   // 单参数可不加括号
const getObj = () => ({ x: 1 })          // 返回对象字面量加括号
```

### 9.2 参数

```js
// 默认参数
function greet(name = "Guest", greeting = "Hello") {
  return `${greeting}, ${name}!`
}
greet()                 // "Hello, Guest!"
greet("Alice")          // "Hello, Alice!"

// 剩余参数（rest）
function sum(...nums) {
  return nums.reduce((a, b) => a + b, 0)
}
sum(1, 2, 3, 4)         // 10

// arguments（旧方式，箭头函数无此属性）
function oldWay() {
  console.log(arguments)  // 类数组对象
}
```

### 9.3 箭头函数 vs 普通函数

```js
// 箭头函数没有自己的 this
// this 继承自外层作用域（词法作用域）
const user = {
  name: "Alice",
  sayHi() {
    setTimeout(() => {
      console.log(this.name)   // "Alice"（this 指向 user）
    }, 100)
  },
  sayHiOld() {
    setTimeout(function() {
      console.log(this.name)   // undefined（this 指向 window/global）
    }, 100)
  },
}

// 箭头函数不能用作构造函数
// const F = () => {}; new F()  // ❌ TypeError

// 箭头函数没有 arguments 对象
```

### 9.4 闭包

```js
// 闭包 = 函数 + 其引用的外部变量
function createCounter() {
  let count = 0              // count 被 return 的函数"记住"了
  return function() {
    count++
    return count
  }
}

const counter = createCounter()
counter()  // 1
counter()  // 2
counter()  // 3

// 闭包不是特意写出来的，是 JS 函数作用域的必然结果
// 你几乎每天都在用，只是没注意

// 经典问题：循环中的 var
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0)  // 3, 3, 3（打印循环结束后的 i）
}
// 解决：用 let 代替 var（let 每次迭代创建新绑定）
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0)  // 0, 1, 2 ✅
}
```

### 9.5 高阶函数与回调

```js
// 高阶函数：接受函数作为参数或返回函数的函数
function repeat(n, action) {
  for (let i = 0; i < n; i++) action(i)
}
repeat(3, console.log)  // 0, 1, 2

// 返回函数的函数（工厂模式）
function multiplier(factor) {
  return x => x * factor
}
const double = multiplier(2)
const triple = multiplier(3)
double(5)   // 10
triple(5)   // 15

// 回调：函数作为参数，在某个时刻被执行
fs.readFile("data.txt", (err, data) => {
  if (err) throw err
  console.log(data)
})
```

### 9.6 柯里化与偏应用

```js
// 柯里化：将多参数函数转成嵌套单参数函数
const curry = fn => a => b => c => fn(a, b, c)
const curriedSum = curry((a, b, c) => a + b + c)
curriedSum(1)(2)(3)  // 6

// 实用例子：日志工具
const log = level => time => message =>
  console.log(`[${level}] ${time}: ${message}`)

const errorLog = log("ERROR")(new Date().toISOString())
errorLog("数据库连接失败")
// [ERROR] 2025-06-15T10:30:00.000Z: 数据库连接失败
```

---

## 10. 作用域与闭包

### 10.1 三种作用域

```js
// 全局作用域
const globalVar = "I'm global"

function demo() {
  // 函数作用域
  const localVar = "I'm local"

  if (true) {
    // 块作用域（let / const）
    const blockVar = "I'm block-scoped"
    var notBlockVar = "I'm actually function-scoped"  // ⚠️
  }

  console.log(blockVar)     // ❌ ReferenceError
  console.log(notBlockVar)  // ✅ "I'm actually function-scoped"
}

console.log(localVar)       // ❌ ReferenceError
```

### 10.2 闭包的经典应用

```js
// 1. 数据私有化
function createWallet() {
  let balance = 0
  return {
    deposit(amount) { balance += amount },
    withdraw(amount) {
      if (amount > balance) return "余额不足"
      balance -= amount
      return amount
    },
    getBalance() { return balance },
  }
}
const wallet = createWallet()
wallet.deposit(100)
wallet.getBalance()   // 100
// wallet.balance     // undefined（直接访问不了）

// 2. 缓存 / 记忆化
function memoize(fn) {
  const cache = {}
  return function(arg) {
    if (arg in cache) return cache[arg]
    cache[arg] = fn(arg)
    return cache[arg]
  }
}
const factorial = memoize(n => (n <= 1 ? 1 : n * factorial(n - 1)))
factorial(20)  // 计算
factorial(20)  // 从缓存读取
```

---

## 11. this 关键字

`this` 的值取决于**函数的调用方式**，而不是定义位置。

```js
// 1. 全局作用域
console.log(this)          // window（浏览器）/ global（Node）

// 2. 对象方法 —— this 指向调用方法的对象
const obj = {
  name: "Alice",
  greet() { console.log(this.name) },
}
obj.greet()                // "Alice"

const greet = obj.greet
greet()                    // undefined（丢失了调用者）

// 3. 构造函数 —— this 指向新创建的实例
function Person(name) {
  this.name = name
}
const p = new Person("Bob")
console.log(p.name)        // "Bob"

// 4. 箭头函数 —— this 继承外层
const obj2 = {
  name: "Charlie",
  greet: () => console.log(this.name),  // ⚠️ 箭头函数，this 不是 obj2
}
obj2.greet()               // undefined

// 5. 显式绑定 —— call / apply / bind
function sayHi(greeting) {
  console.log(`${greeting}, ${this.name}`)
}
const user = { name: "David" }
sayHi.call(user, "Hello")  // "Hello, David"
sayHi.apply(user, ["Hi"])  // "Hi, David"
const bound = sayHi.bind(user)
bound("Hey")               // "Hey, David"
```

**一句话记 this**：看 `.` 前面是谁。`a.b.c.f()` 中 `f` 的 `this` 是 `a.b.c`。没有 `.` 就是全局/undefined（严格模式）。

---

## 12. 类与面向对象

### 12.1 基本语法

```js
class User {
  // 私有字段（ES2022，# 前缀）
  #password

  // 构造函数
  constructor(name, email) {
    this.name = name
    this.email = email
    this.#password = "changeme"
  }

  // 方法（自动在原型上，所有实例共享）
  greet() {
    return `Hello, I'm ${this.name}`
  }

  // Getter（像属性一样访问，实际调用函数）
  get displayName() {
    return this.name.toUpperCase()
  }

  // Setter
  set displayName(value) {
    this.name = value.trim()
  }

  // 私有方法
  #hashPassword(pw) {
    return pw.split("").reverse().join("") // 只是演示，别当真
  }

  changePassword(oldPw, newPw) {
    if (this.#hashPassword(oldPw) === this.#password) {
      this.#password = this.#hashPassword(newPw)
      return true
    }
    return false
  }

  // 静态方法（类方法，不能通过实例调用）
  static fromJSON(json) {
    const data = JSON.parse(json)
    return new User(data.name, data.email)
  }
}

const alice = new User("Alice", "alice@example.com")
alice.greet()              // "Hello, I'm Alice"
alice.displayName          // "ALICE"（getter，不加括号）
alice.displayName = "Bob"  // setter：名字变成 "Bob"
// alice.#password         // ❌ SyntaxError（私有字段外部不可访问）
User.fromJSON('{"name":"Eve","email":"eve@x.com"}')
```

### 12.2 继承

```js
class Admin extends User {
  constructor(name, email, role) {
    super(name, email)    // 必须先调用 super
    this.role = role
  }

  // 覆盖父类方法
  greet() {
    return `${super.greet()}（${this.role}）`
  }

  deleteUser(user) {
    console.log(`删除用户 ${user.name}`)
  }
}

const admin = new Admin("Root", "root@x.com", "superadmin")
admin.greet()   // "Hello, I'm Root（superadmin）"
```

### 12.3 class 本质还是原型

```js
// class 语法只是原型链的语法糖
console.log(typeof User)            // "function"
console.log(User.prototype.greet)   // [Function: greet]
```

---

## 13. 解构赋值

```js
// ===== 数组解构 =====
const [a, b] = [1, 2]              // a=1, b=2
const [x, , z] = [1, 2, 3]         // x=1, z=3（跳过第二个）
const [first, ...rest] = [1,2,3,4]   // first=1, rest=[2,3,4]

// 默认值
const [m = 0, n = 0] = [5]          // m=5, n=0

// 交换变量（无需临时变量）
let p = 1, q = 2;
[p, q] = [q, p]                    // p=2, q=1

// ===== 对象解构 =====
const user = { name: "Alice", age: 25, address: { city: "NY" } }

// 基本
const { name, age } = user         // name="Alice", age=25

// 重命名
const { name: userName } = user    // userName="Alice"

// 默认值
const { role = "user" } = user     // role="user"

// 嵌套解构
const { address: { city } } = user // city="NY"

// ===== 函数参数解构（非常常用） =====
function greet({ name, age }) {
  return `Hello, ${name} (${age})`
}
greet(user)                        // "Hello, Alice (25)"

// 带默认值的参数解构
function createButton({ text = "OK", type = "primary" } = {}) {
  return `<button class="${type}">${text}</button>`
}
createButton()                     // <button class="primary">OK</button>
createButton({ text: "Cancel" })   // <button class="primary">Cancel</button>
```

---

## 14. 展开与剩余

```js
// ===== 展开（Spread）—— 把数组/对象"拆开" =====

// 数组展开
const arr1 = [1, 2]
const arr2 = [3, 4]
const combined = [...arr1, ...arr2]   // [1, 2, 3, 4]
const copy = [...arr1]                // 浅拷贝
Math.max(...[1, 5, 3])                // 5（函数参数展开）

// 字符串展开
const chars = [..."hello"]            // ["h", "e", "l", "l", "o"]

// 对象展开（ES2018）
const defaults = { theme: "light", lang: "en" }
const userConfig = { lang: "zh", fontSize: 16 }
const merged = { ...defaults, ...userConfig }
// { theme: "light", lang: "zh", fontSize: 16 }（后面的覆盖前面的）

// 不可变性更新（React/Vue 常用模式）
const prevState = { count: 1, users: ["Alice"] }
const newState = {
  ...prevState,
  count: prevState.count + 1,
  users: [...prevState.users, "Bob"],
}

// ===== 剩余（Rest）—— 把剩下的"收集起来" =====
const [first, ...rest] = [1, 2, 3, 4] // rest = [2, 3, 4]
const { name, ...other } = user        // other = { age: 25, address: { city: "NY" } }

function log(level, ...messages) {
  console.log(`[${level}]`, ...messages)
}
log("INFO", "User", "logged in", "at", new Date())
```

---

## 15. 模板字符串

```js
const name = "Alice"
const age = 25

// 基本
const msg = `Hello, I'm ${name}, ${age} years old`

// 多行（保留换行）
const html = `
  <div class="card">
    <h3>${name}</h3>
    <p>Age: ${age}</p>
  </div>
`

// 任意表达式
const isEven = n => `${n} is ${n % 2 === 0 ? "even" : "odd"}`

// 嵌套
const items = ["Apple", "Banana", "Cherry"]
const list = `
  <ul>
    ${items.map(item => `<li>${item}</li>`).join("")}
  </ul>
`
// 更好的写法：
const list2 = `
  <ul>
    ${items.map(item => `
      <li>${item}</li>
    `).join("")}
  </ul>
`

// 标签模板（Tagged Template）
// 用于自定义字符串处理（如 styled-components、GraphQL 查询等）
function highlight(strings, ...values) {
  return strings.reduce((acc, str, i) =>
    acc + str + (values[i] ? `<mark>${values[i]}</mark>` : ""), "")
}
highlight`Hello, ${name}!`  // "Hello, <mark>Alice</mark>!"
```

---

## 16. Set / Map / WeakMap

### 16.1 Set —— 无重复值的集合

```js
const set = new Set([1, 2, 2, 3, 3, 3])
// Set(3) { 1, 2, 3 }

set.add(4)
set.has(2)          // true
set.delete(2)
set.size            // 3
set.clear()

// 数组去重
const unique = [...new Set([1,2,2,3,3])]

// 遍历
for (const val of set) { /* ... */ }
set.forEach(val => console.log(val))
```

### 16.2 Map —— 任意键值的映射

```js
const map = new Map()

// 任意类型作为键（对象只能字符串/Symbol）
map.set("name", "Alice")
map.set(42, "answer")
map.set({ id: 1 }, "user1")

map.get("name")     // "Alice"
map.has(42)         // true
map.delete(42)
map.size            // 2
map.clear()

// 遍历（保持插入顺序！）
for (const [key, value] of map) {
  console.log(key, value)
}

// 初始化
const kv = new Map([
  ["a", 1],
  ["b", 2],
])

// 与对象的转换
const obj = Object.fromEntries(kv)    // { a: 1, b: 2 }
const map2 = new Map(Object.entries(obj))
```

### 16.3 WeakMap / WeakSet

```js
// WeakMap：键必须是对象，且是弱引用（不阻止垃圾回收）
const wm = new WeakMap()

const element = document.getElementById("app")
wm.set(element, { clicked: 0 })
// 当 element 从 DOM 移除且无其他引用时，这条记录自动被回收

// 典型用途：缓存 DOM 元素的元数据
// WeakSet 类似，只接受对象，弱引用
```

---

## 17. 可选链与空值合并

```js
// 可选链 ?. —— 安全访问深层属性（ES2020）
const city = user?.address?.city
// 等价于：
// const city = user && user.address && user.address.city

// 用在方法调用
const result = obj?.method?.()

// 用在数组索引
const first = arr?.[0]

// 空值合并 ?? —— 只在 null/undefined 时用默认值
const theme = userConfig.theme ?? "light"
// vs || ：|| 把 ""、0、false 都当 falsy
const count = 0
count || 10    // 10（0 是 falsy！）
count ?? 10    // 0 ✅（只有 null/undefined 触发）

// 组合使用
const displayName = user?.profile?.name ?? "匿名用户"

// 空值合并赋值（ES2021）
let config = null
config ??= { theme: "light" }  // config = { theme: "light" }
```

---

## 18. 模块

### 18.1 导出

```js
// ===== 命名导出 =====
// utils.js
export const PI = 3.14159

export function add(a, b) {
  return a + b
}

export class Calculator {
  // ...
}

// 或统一导出
const subtract = (a, b) => a - b
const multiply = (a, b) => a * b
export { subtract, multiply }

// 重命名导出
export { subtract as minus }

// ===== 默认导出（一个模块只能有一个） =====
export default function(a, b) {
  return a + b
}

// 或
export default class App {
  // ...
}
```

### 18.2 导入

```js
// 导入命名导出
import { add, subtract } from "./utils.js"
import { add as sum } from "./utils.js"     // 重命名导入
import * as Utils from "./utils.js"         // 导入所有

// 导入默认导出（名字可以任意取）
import myAdd from "./math.js"
import MathLib from "./math.js"

// 混合导入
import App, { add, PI } from "./main.js"

// 只执行模块（不导入任何内容）
import "./init.js"

// 动态导入（异步，返回 Promise，用于代码分割）
const module = await import("./heavy-module.js")
// 或
import("./heavy-module.js").then(mod => mod.doSomething())
```

### 18.3 在 HTML 中使用

```html
<!-- ES 模块（type="module"） -->
<script type="module" src="app.js"></script>

<!-- 模块默认是 defer（HTML 解析完再执行） -->
<!-- 模块自动严格模式 -->
<!-- 模块有独立的作用域（变量不会泄漏到全局） -->
```

---

## 19. 错误处理

### 19.1 try...catch

```js
try {
  const data = JSON.parse(brokenJSON)
  // 如果上面出错，下面不执行
  processData(data)
} catch (error) {
  console.error("解析失败:", error.message)
  // error 对象有 name, message, stack 属性
} finally {
  // 无论成功失败都执行（清理资源等）
  hideLoading()
}

// 可以捕获不同类型的错误
try {
  // ...
} catch (error) {
  if (error instanceof SyntaxError) {
    console.error("语法错误")
  } else if (error instanceof TypeError) {
    console.error("类型错误")
  } else {
    throw error   // 重新抛出，让上层处理
  }
}
```

### 19.2 自定义错误

```js
class ValidationError extends Error {
  constructor(message, field) {
    super(message)
    this.name = "ValidationError"
    this.field = field
  }
}

try {
  if (!username) {
    throw new ValidationError("用户名不能为空", "username")
  }
} catch (error) {
  if (error instanceof ValidationError) {
    showFieldError(error.field, error.message)
  } else {
    throw error
  }
}
```

### 19.3 全局错误捕获

```js
// 未捕获的同步异常
window.addEventListener("error", (event) => {
  console.error("全局错误:", event.error)
})

// 未处理的 Promise 拒绝
window.addEventListener("unhandledrejection", (event) => {
  console.error("未处理的 Promise 拒绝:", event.reason)
  event.preventDefault()  // 阻止控制台输出
})
```

---

## 20. 异步编程

### 20.1 回调（旧方式，理解即可）

```js
// 回调地狱
getUser(userId, (err, user) => {
  if (err) return console.error(err)
  getPosts(user.id, (err, posts) => {
    if (err) return console.error(err)
    getComments(posts[0].id, (err, comments) => {
      if (err) return console.error(err)
      console.log(comments)
    })
  })
})
```

### 20.2 Promise

```js
// 创建 Promise
const promise = new Promise((resolve, reject) => {
  setTimeout(() => {
    const success = Math.random() > 0.3
    if (success) {
      resolve("成功了")
    } else {
      reject(new Error("失败了"))
    }
  }, 1000)
})

// 使用 Promise
promise
  .then(result => {
    console.log("结果:", result)
    return result.toUpperCase()     // 返回的值被包装为下一个 Promise
  })
  .then(upper => console.log("大写:", upper))
  .catch(error => console.error("出错:", error.message))
  .finally(() => console.log("不管成功失败都执行"))

// Promise 静态方法
Promise.resolve(42)                           // 直接成功的 Promise
Promise.reject(new Error("fail"))             // 直接失败的 Promise

Promise.all([p1, p2, p3])                     // 全部成功才成功
Promise.allSettled([p1, p2, p3])              // 等到全部完成（不管成败）
Promise.race([p1, p2, p3])                    // 第一个完成（不管成败）
Promise.any([p1, p2, p3])                     // 第一个成功，全失败才 reject
```

### 20.3 async / await（现代标准）

```js
// async 函数自动返回 Promise
async function fetchUser(id) {
  // await 等待 Promise 完成
  const response = await fetch(`/api/users/${id}`)

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`)
  }

  const user = await response.json()
  return user
}

// 使用
async function main() {
  try {
    const user = await fetchUser(1)
    console.log(user)
  } catch (error) {
    console.error("获取用户失败:", error.message)
  }
}

// 并行执行（无依赖关系时）
async function loadDashboard() {
  // 两个请求同时发出，等两个都完成
  const [user, posts] = await Promise.all([
    fetchUser(1),
    fetchPosts(1),
  ])
  return { user, posts }
}

// 循环中的 await（注意：默认是串行！）
// 串行（慢）
for (const id of ids) {
  const user = await fetchUser(id)  // 逐个等
}
// 并行（快）
const users = await Promise.all(ids.map(id => fetchUser(id)))
```

### 20.4 fetch API

```js
// 基本 GET
const res = await fetch("/api/data")
const data = await res.json()

// POST JSON
const res = await fetch("/api/users", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ name: "Alice", email: "alice@x.com" }),
})

// POST 表单
const form = new FormData()
form.append("name", "Alice")
form.append("avatar", fileInput.files[0])
const res = await fetch("/api/upload", { method: "POST", body: form })

// 超时控制（fetch 本身不支持 timeout）
const controller = new AbortController()
const timeout = setTimeout(() => controller.abort(), 5000)

try {
  const res = await fetch("/api/data", { signal: controller.signal })
  const data = await res.json()
} catch (error) {
  if (error.name === "AbortError") {
    console.log("请求超时")
  }
} finally {
  clearTimeout(timeout)
}

// 检查响应
if (!res.ok) {
  const errorBody = await res.text()
  throw new Error(`HTTP ${res.status}: ${errorBody}`)
}
```

---

## 21. DOM 操作

### 21.1 查询元素

```js
// 单个元素
const el = document.querySelector(".card")        // 第一个匹配的
const el = document.getElementById("app")         // ID 查找（最快）

// 多个元素
const els = document.querySelectorAll(".item")    // NodeList（静态）
const els = document.getElementsByClassName("item") // HTMLCollection（动态）

// 遍历 NodeList
document.querySelectorAll("li").forEach(el => console.log(el))
// 或
for (const el of document.querySelectorAll("li")) { /* ... */ }

// 相对查询（在父元素内查找）
const parent = document.getElementById("app")
parent.querySelector(".child")
```

### 21.2 创建与修改元素

```js
// 创建
const div = document.createElement("div")
div.className = "card"
div.id = "card-1"
div.textContent = "Hello"         // 纯文本（安全）
div.innerHTML = "<strong>Hello</strong>"  // HTML（有 XSS 风险）
div.setAttribute("data-id", "42")

// 插入
parent.appendChild(div)           // 追加到最后
parent.prepend(div)              // 追加到最前
parent.before(div)               // 插入到 parent 之前
parent.after(div)                // 插入到 parent 之后
refElement.insertAdjacentHTML("beforebegin", "<span>!</span>")
// beforebegin | afterbegin | beforeend | afterend

// 替换
oldElement.replaceWith(newElement)

// 移除
element.remove()
// 或
parent.removeChild(element)

// 克隆
const clone = element.cloneNode(true)  // true = 深克隆（含子元素）
```

### 21.3 修改样式与类

```js
// ===== classList =====
element.classList.add("active")
element.classList.remove("inactive")
element.classList.toggle("dark")       // 有则删，无则加
element.classList.toggle("dark", isDark)  // 第二个参数强制状态
element.classList.contains("active")   // 是否存在
element.classList.replace("old", "new")

// ===== 行内样式 =====
element.style.color = "red"
element.style.fontSize = "16px"        // 驼峰命名
element.style.setProperty("--color", "#ff0000")  // CSS 变量

// ===== data-* 属性 =====
element.dataset.userId       // "42"
element.dataset.lastLogin    // "2025-01-01"
```

### 21.4 属性与内容

```js
// 标准属性
input.value = "Hello"
input.type = "email"
img.src = "photo.jpg"
a.href = "/page"

// 通用属性
element.getAttribute("data-custom")
element.setAttribute("aria-label", "关闭")
element.hasAttribute("disabled")
element.removeAttribute("disabled")

// 布尔属性用属性名而非方法
button.disabled = true
checkbox.checked = true

// 内容
element.textContent = "纯文本"         // 安全
element.innerHTML = "<b>HTML</b>"      // 危险（XSS！）

// 如果必须插入 HTML 字符串，用 insertAdjacentHTML
element.insertAdjacentHTML("beforeend", trustedHTML)
```

### 21.5 尺寸与位置

```js
// 元素几何属性
element.offsetWidth       // 包含 padding + border
element.clientWidth       // 包含 padding，不含 border
element.scrollWidth       // 内容实际宽度（含溢出）

// 位置
const rect = element.getBoundingClientRect()
// rect.top / right / bottom / left / width / height
// 相对于视口

// 滚动
element.scrollTop         // 已滚动的距离
element.scrollTo(0, 100)  // 滚动到
element.scrollTo({ top: 0, behavior: "smooth" })

// 视口尺寸
window.innerWidth
window.innerHeight
```

---

## 22. 事件

### 22.1 事件监听

```js
// addEventListener（推荐）
element.addEventListener("click", handler)

// 带选项
element.addEventListener("click", handler, {
  once: true,     // 只触发一次
  passive: true,   // 不调用 preventDefault（提升滚动性能）
  capture: true,   // 捕获阶段触发（默认冒泡阶段）
})

// 移除监听（必须引用同一个函数）
element.removeEventListener("click", handler)

// 事件对象
element.addEventListener("click", (event) => {
  console.log(event.type)          // "click"
  console.log(event.target)        // 触发事件的元素
  console.log(event.currentTarget) // 绑定了监听的元素
  console.log(event.clientX)       // 鼠标坐标
})
```

### 22.2 事件委托

利用冒泡，在父元素上监听，减少事件监听器数量。

```js
// ❌ 每个 li 都绑定监听器（列表项多时性能差）
document.querySelectorAll("li").forEach(li =>
  li.addEventListener("click", handler)
)

// ✅ 事件委托：在父元素上监听
document.querySelector("ul").addEventListener("click", (event) => {
  const li = event.target.closest("li")  // 向上查找最近的 li
  if (!li) return                        // 点到了 li 外面，忽略
  console.log("点击了:", li.textContent)
})
```

### 22.3 常用事件类型

```js
// 鼠标
"click"       "dblclick"    "mousedown"   "mouseup"
"mousemove"   "mouseenter"  "mouseleave"
"contextmenu"  // 右键菜单

// 键盘
"keydown"     "keyup"       // 所有键
"keypress"                   // 字符键（已弃用，用 keydown）

// 输入
"input"       // 输入时（每按一个字符）
"change"      // 值改变+失焦时（input 不同：select 立即，input 失焦）
"focus"       "blur"         // 焦点获取/失去
"submit"      "reset"

// 表单验证
"invalid"     // 验证失败时

// 滚动与尺寸
"scroll"      "resize"

// 触摸
"touchstart"  "touchmove"   "touchend"

// 资源
"load"        "error"
"DOMContentLoaded"            // DOM 解析完毕（比 load 早）
```

### 22.4 自定义事件

```js
// 创建与触发自定义事件
const event = new CustomEvent("user-login", {
  detail: { userId: 42, timestamp: Date.now() },
  bubbles: true,
})
document.dispatchEvent(event)

// 监听自定义事件
document.addEventListener("user-login", (e) => {
  console.log("用户登录:", e.detail.userId)
})
```

### 22.5 事件示例

```html
<button id="saveBtn">保存</button>
<form id="myForm">
  <input type="text" name="username" required minlength="3">
  <span class="error-msg"></span>
</form>
<div id="dynamic-list">
  <ul>
    <li>项目 1 <button class="del">删除</button></li>
    <li>项目 2 <button class="del">删除</button></li>
    <li>项目 3 <button class="del">删除</button></li>
  </ul>
</div>
```

```js
// 按钮防重复提交
const saveBtn = document.getElementById("saveBtn")
saveBtn.addEventListener("click", async (e) => {
  const btn = e.target
  btn.disabled = true
  btn.textContent = "保存中..."
  try {
    await saveData()
    btn.textContent = "已保存"
  } catch {
    btn.textContent = "保存失败"
  } finally {
    setTimeout(() => {
      btn.disabled = false
      btn.textContent = "保存"
    }, 2000)
  }
})

// 表单验证
const form = document.getElementById("myForm")
const username = form.querySelector("[name='username']")
const errorMsg = form.querySelector(".error-msg")

username.addEventListener("input", () => {
  if (username.validity.tooShort) {
    errorMsg.textContent = `至少 ${username.minLength} 个字符`
  } else {
    errorMsg.textContent = ""
  }
})

form.addEventListener("submit", (e) => {
  if (!form.checkValidity()) {
    e.preventDefault()
  }
})

// 事件委托删除按钮（列表是动态的）
const list = document.querySelector("#dynamic-list ul")
list.addEventListener("click", (e) => {
  const btn = e.target.closest(".del")
  if (!btn) return
  btn.closest("li").remove()
})
```

---

## 23. JSON

```js
// 序列化 —— JS 对象 → JSON 字符串
const user = { name: "Alice", age: 25, hobbies: ["code", "read"] }
const json = JSON.stringify(user)
// '{"name":"Alice","age":25,"hobbies":["code","read"]}'

// 美化输出
JSON.stringify(user, null, 2)
// 第二参数 replacer：过滤/转换
JSON.stringify(user, ["name", "age"])   // '{"name":"Alice","age":25}'
JSON.stringify(user, (key, value) => {
  if (key === "password") return undefined // 过滤敏感字段
  return value
})

// 反序列化 —— JSON 字符串 → JS 对象
const parsed = JSON.parse(json)

// 安全解析
function safeParse(str, fallback = null) {
  try {
    return JSON.parse(str)
  } catch {
    return fallback
  }
}

// 不支持的类型（stringify 会忽略或转换）
// undefined → 忽略（对象中）或 null（数组中）
// Function → 忽略
// Symbol → 忽略
// Date → ISO 字符串
// NaN / Infinity → null
// 循环引用 → 报错
```

---

## 24. 常用 Web API 速览

### 24.1 定时器

```js
// setTimeout：延迟执行一次
const id = setTimeout(() => console.log("done"), 1000)
clearTimeout(id)                          // 取消

// setInterval：间隔执行
const id = setInterval(() => console.log("tick"), 1000)
clearInterval(id)                         // 取消

// requestAnimationFrame：下一帧执行（动画用）
function animate() {
  // 更新动画
  requestAnimationFrame(animate)
}
requestAnimationFrame(animate)
```

### 24.2 本地存储

```js
// localStorage —— 持久存储（不清除一直保留）
localStorage.setItem("theme", "dark")
const theme = localStorage.getItem("theme")
localStorage.removeItem("theme")
localStorage.clear()

// 对象存读（需要序列化）
const prefs = { theme: "dark", fontSize: 16 }
localStorage.setItem("prefs", JSON.stringify(prefs))
const loaded = JSON.parse(localStorage.getItem("prefs"))

// sessionStorage —— 关闭标签页即清除（用法同上）
sessionStorage.setItem("tempData", "123")

// 一次安全读写
function safeSetJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    console.warn("存储空间不足")
  }
}
```

### 24.3 URL 操作

```js
// 当前 URL 信息
window.location.href       // 完整 URL
window.location.pathname   // "/blog/post/42"
window.location.search     // "?q=hello&page=1"
window.location.hash       // "#section2"

// 跳转
window.location.href = "/new-page"
window.location.replace("/new-page")  // 不保留历史记录

// 解析 URL 参数
const params = new URLSearchParams(location.search)
params.get("q")             // "hello"
params.get("page")          // "1"
params.has("q")             // true
params.set("sort", "desc")
params.toString()           // "q=hello&page=1&sort=desc"

// URL 对象
const url = new URL("https://example.com/path?q=hello#hash")
url.pathname                // "/path"
url.searchParams.get("q")   // "hello"
```

### 24.4 History API

```js
// 前进后退
history.back()
history.forward()
history.go(-2)

// pushState：添加历史记录
history.pushState({ page: 1 }, "", "/page/1")

// replaceState：替换当前历史记录
history.replaceState({ page: 2 }, "", "/page/2")

// 监听前进后退
window.addEventListener("popstate", (e) => {
  console.log("state:", e.state)
  // 根据 e.state 更新页面
})
```

### 24.5 剪贴板

```js
// 写入剪贴板（需要用户手势或 https）
await navigator.clipboard.writeText("Hello, clipboard!")
await navigator.clipboard.write([
  new ClipboardItem({ "image/png": blob })
])

// 读取剪贴板
const text = await navigator.clipboard.readText()
```

---

## 25. 实用模式与代码片段

### 25.1 防抖与节流

```js
// 防抖（Debounce）：连续触发只执行最后一次
// 适用：搜索输入、窗口 resize
function debounce(fn, delay = 300) {
  let timer
  return function(...args) {
    clearTimeout(timer)
    timer = setTimeout(() => fn.apply(this, args), delay)
  }
}

// 节流（Throttle）：固定间隔执行一次
// 适用：滚动事件、按钮防连点
function throttle(fn, interval = 300) {
  let lastTime = 0
  return function(...args) {
    const now = Date.now()
    if (now - lastTime >= interval) {
      lastTime = now
      fn.apply(this, args)
    }
  }
}

// 使用示例
input.addEventListener("input", debounce((e) => {
  search(e.target.value)
}, 500))

window.addEventListener("scroll", throttle(() => {
  updateScrollIndicator()
}, 200))
```

### 25.2 单例模式

```js
// 利用闭包实现单例
const getSingleton = (() => {
  let instance
  return function createInstance() {
    if (!instance) {
      instance = { createdAt: new Date(), id: Math.random() }
    }
    return instance
  }
})()

const a = getSingleton()
const b = getSingleton()
console.log(a === b)  // true
```

### 25.3 管道模式

```js
// 将多个函数串联，数据依次穿过
const pipe = (...fns) => x => fns.reduce((v, f) => f(v), x)

const trim = s => s.trim()
const lowercase = s => s.toLowerCase()
const replace = s => s.replace(/\s+/g, "-")

const slugify = pipe(trim, lowercase, replace)
slugify("  Hello World  ")  // "hello-world"
```

### 25.4 重试机制

```js
async function fetchWithRetry(url, options = {}, retries = 3) {
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await fetch(url, options)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return res
    } catch (error) {
      if (i === retries) throw error
      // 指数退避
      await new Promise(r => setTimeout(r, 1000 * Math.pow(2, i)))
    }
  }
}

const res = await fetchWithRetry("/api/unstable")
```

### 25.5 数组随机打乱

```js
// Fisher-Yates 洗牌算法
function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
```

### 25.6 链式调用

```js
class QueryBuilder {
  constructor() { this._query = {} }

  select(fields)    { this._query.select = fields; return this }
  from(table)       { this._query.table = table; return this }
  where(condition)  { this._query.where = condition; return this }
  limit(n)          { this._query.limit = n; return this }
  build() {
    const { select, table, where, limit } = this._query
    let sql = `SELECT ${select} FROM ${table}`
    if (where) sql += ` WHERE ${where}`
    if (limit) sql += ` LIMIT ${limit}`
    return sql
  }
}

const sql = new QueryBuilder()
  .select("*")
  .from("users")
  .where("age > 18")
  .limit(10)
  .build()
// "SELECT * FROM users WHERE age > 18 LIMIT 10"
```

---

## 26. 常见陷阱与最佳实践

1. **`==` vs `===`**：永远用 `===`。`==` 的类型转换规则诡异（除了 `== null` 可以同时匹配 `null` 和 `undefined`）。

2. **`this` 的绑定丢失**：将方法作为回调传递时，`this` 会丢失。用箭头函数或 `.bind()` 解决。`setTimeout(obj.method, 0)` 中的 `this` 是 `window`。

3. **异步循环的坑**：`forEach` 不等待 `await`。`[1,2,3].forEach(async n => await doSomething(n))` 会同时执行。要用 `for...of` 或 `Promise.all`。

4. **数组的 `sort()` 默认按字符串排序**：`[3, 1, 10].sort()` 返回 `[1, 10, 3]`。永远传比较函数：`.sort((a, b) => a - b)`。

5. **`NaN` 不等于任何值（包括自己）**：用 `Number.isNaN(x)` 而不是 `x === NaN` 或 `isNaN(x)`。

6. **`parseInt` 的进制参数**：`parseInt("08")` 在旧引擎中可能返回 0。永远写 `parseInt(str, 10)`。或直接用 `Number(str)`。

7. **`const` 的引用不变，内容可变**：`const arr = [1,2,3]; arr.push(4)` 是合法的。`const` 只管引用不能重新赋值。

8. **对象和数组的浅拷贝**：`{ ...obj }` 和 `[...arr]` 都是浅拷贝。嵌套对象仍然共享引用。深拷贝用 `structuredClone()`。

9. **`innerHTML` 的 XSS 风险**：绝不用 `innerHTML` 插入用户输入的内容。用 `textContent` 或创建元素节点。

10. **Promise 忘记 catch**：未捕获的 Promise 拒绝是静默的（部分浏览器会警告）。每个 Promise 链都要有 `.catch()`，或全局监听 `unhandledrejection`。

11. **`0` 和空字符串在 `||` 中被当做 falsy**：用 `??` 代替 `||` 作为默认值，除非你确实想把 `0`、`""`、`false` 也当作"无值"。

12. **`switch` 的 fall-through**：每个`case` 分支必须加 `break`，否则会"穿透"到下一个分支。这是特性不是 bug，但容易忘。

13. **浮点数运算不精确**：`0.1 + 0.2 !== 0.3`。涉及金额时用整数（分）或库（如 `decimal.js`）。

14. **`Date` 的月份从 0 开始**：`new Date(2025, 0, 1)` 是 1 月 1 日，不是 0 月。日期从 1 开始。这是 JS 最恼人的设计之一。

15. **`typeof null === "object"`**：历史遗留 bug，记住就好。判断 `null` 用 `value === null`。
