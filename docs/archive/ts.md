# TypeScript —— JavaScript 的类型超集

> "TypeScript is JavaScript with syntax for types." —— 官网第一句话
> 由 Anders Hejlsberg（C# 之父）主导设计，2012 年发布，2025 年最新版 5.8+。
> 官网：[typescriptlang.org](https://www.typescriptlang.org) · 文档：[typescriptlang.org/docs](https://www.typescriptlang.org/docs)
> 在线体验：[typescriptlang.org/play](https://www.typescriptlang.org/play)

> **为什么写这份文档**：TS 官方文档像一个字典——全但对新手不友好。本文把最常用的 80% 内容按**从用到悟**的方式组织，大量示例对照 JS 和 TS 写法，让你看到类型不是负担，是文档。

---

## 目录

1. [TS 是什么，为什么要用](#1-ts-是什么为什么要用)
2. [安装与配置](#2-安装与配置)
3. [基础类型](#3-基础类型)
4. [类型注解与推断](#4-类型注解与推断)
5. [函数类型](#5-函数类型)
6. [对象与接口](#6-对象与接口)
7. [类型别名 vs 接口](#7-类型别名-vs-接口)
8. [联合类型与交叉类型](#8-联合类型与交叉类型)
9. [字面量类型](#9-字面量类型)
10. [枚举](#10-枚举)
11. [类型窄化](#11-类型窄化)
12. [泛型](#12-泛型)
13. [工具类型](#13-工具类型)
14. [条件类型与模板字面量类型](#14-条件类型与模板字面量类型)
15. [类](#15-类)
16. [模块与声明文件](#16-模块与声明文件)
17. [tsconfig.json 配置](#17-tsconfigjson-配置)
18. [TS 与 Vue/React](#18-ts-与-vuereact)
19. [实用模式与示例](#19-实用模式与示例)
20. [常见陷阱与最佳实践](#20-常见陷阱与最佳实践)

---

## 1. TS 是什么，为什么要用

```
TypeScript = JavaScript + 类型系统

  .ts 文件 ← 你写的
      │
      ▼  tsc（TypeScript 编译器）
      │
  .js 文件  ← 浏览器/Node 实际运行的
      │    + 类型检查（编译时）
      │    + .d.ts 声明文件（给编辑器看的）
      │
      编辑器实时提示、报错
```

### 不用 TS 的痛苦

```js
// JS：运行前不知道这里会炸
function getUser(id) {
  return fetch(`/api/users/${id}`).then(r => r.json())
}

getUser("abc")                    // 传字符串，运行时才发现 URL 不对
const user = getUser(1)
user.name.toUpperCase()           // user 是 Promise！运行时 TypeError
```

### 用了 TS 的安心

```ts
// TS：写代码时就告诉你错了
function getUser(id: number): Promise<User> {
  return fetch(`/api/users/${id}`).then(r => r.json())
}

getUser("abc")                    // ❌ 编辑器红线：类型 "string" 不可赋给 "number"
const user = getUser(1)           // user 是 Promise<User>
user.name.toUpperCase()           // ❌ 红线：Promise<User> 上不存在 name
```

**一句话：TS 让你在保存文件时就知道代码哪里会炸，而不是等用户碰到 bug。**

---

## 2. 安装与配置

```bash
# 全局安装
pnpm add -g typescript
# 或
npm install -g typescript

# 项目安装（推荐）
pnpm add -D typescript

# 查看版本
tsc --version    # Version 5.8.x

# 初始化配置
tsc --init       # 生成 tsconfig.json
```

```bash
# 编译单个文件
tsc app.ts       # 生成 app.js

# 监视模式（文件变化自动编译）
tsc --watch
tsc -w

# 使用 tsconfig.json 编译整个项目
tsc

# 只检查类型，不生成文件
tsc --noEmit
```

### 快速体验

```ts
// hello.ts
function greet(name: string): string {
  return `Hello, ${name}!`
}

console.log(greet("TypeScript"))
// console.log(greet(42))  // ❌ 编译报错

// 编译后：
// function greet(name) {
//   return `Hello, ${name}!`;
// }
// 类型全被擦除，生成干净的 JS
```

---

## 3. 基础类型

```ts
// ===== 原始类型 =====
const isDone: boolean = true
const count: number = 42           // 整数、浮点数都是 number
const big: bigint = 100n
const name: string = "Alice"
const nothing: null = null
const notDefined: undefined = undefined
const unique: symbol = Symbol("id")

// ===== 数组 =====
const nums: number[] = [1, 2, 3]
const strs: Array<string> = ["a", "b"]   // 泛型写法

// ===== 元组（定长定类型的数组） =====
const pair: [string, number] = ["Alice", 25]
const coords: [number, number, number] = [10, 20, 30]
// const wrong: [string, number] = [25, "Alice"] // ❌ 类型顺序不对

// 带可选元素的元组
const info: [string, number?, boolean?] = ["Alice"]
info[1]  // number | undefined

// 带 rest 的元组
const entry: [number, ...string[]] = [1, "a", "b", "c"]

// ===== any —— 关闭类型检查（尽量不用） =====
let loose: any = "hello"
loose = 42
loose.fakeMethod()    // 不报错，但运行时炸

// ===== unknown —— 安全的 any =====
let uncertain: unknown = "hello"
// uncertain.toUpperCase()  // ❌ 必须先窄化类型
if (typeof uncertain === "string") {
  uncertain.toUpperCase()   // ✅ 窄化后可用
}

// ===== void —— 函数没有返回值 =====
function log(msg: string): void {
  console.log(msg)
}

// ===== never —— 永不存在的类型 =====
function throwError(msg: string): never {
  throw new Error(msg)
}
function infiniteLoop(): never {
  while (true) {}
}
```

---

## 4. 类型注解与推断

```ts
// 类型注解：你明确告诉 TS 类型
let age: number = 25

// 类型推断：TS 自己猜类型
let age2 = 25          // TS 推断为 number，不需要写
const name = "Alice"   // 推断为 "Alice"（字面量类型，因为是 const）

// 推断 vs 注解的选择
let x = 42             // ✅ 推断足够，不用注解
let y: number          // ✅ 声明但不赋值时需要注解

// 函数返回值：依赖推断
function add(a: number, b: number) {
  return a + b         // TS 推断返回 number
}

// 对象字面量：依赖推断
const user = {
  name: "Alice",
  age: 25,
}
// user 类型自动为 { name: string; age: number }

// 何时显式注解：
// 1. 函数参数（必须）
// 2. 没有初始值的变量
// 3. 你想让类型更严格的场合
// 4. 作为公共 API 的返回值（文档作用）
```

### const vs let 的类型推断差异

```ts
let name = "Alice"     // 推断为 string
const name2 = "Alice"  // 推断为 "Alice"（字面量类型）

let config = { theme: "dark" }
// config.theme 推断为 string（可改）
const config2 = { theme: "dark" } as const
// config2.theme 推断为 "dark"（不可改）

// as const 将整个对象变为只读+字面量类型
```

---

## 5. 函数类型

### 5.1 参数与返回值

```ts
// 完整类型注解
function multiply(a: number, b: number): number {
  return a * b
}

// 可选参数（必须放在必需参数之后）
function greet(name: string, title?: string): string {
  return title ? `${title} ${name}` : name
}

// 默认参数（自动变成可选）
function greet2(name: string, title: string = "Mr."): string {
  return `${title} ${name}`
}

// 剩余参数
function sum(...nums: number[]): number {
  return nums.reduce((a, b) => a + b, 0)
}
```

### 5.2 函数类型表达式

```ts
// 用箭头语法定义函数类型
type MathFn = (a: number, b: number) => number

const add: MathFn = (a, b) => a + b
const subtract: MathFn = (a, b) => a - b

// 回调函数类型
function processArray(
  arr: string[],
  callback: (item: string, index: number) => void
): void {
  arr.forEach(callback)
}
```

### 5.3 函数重载

```ts
// 同一个函数，不同参数组合有不同的返回值类型
function getUser(id: number): User
function getUser(email: string): User
function getUser(nameOrId: number | string): User {
  if (typeof nameOrId === "number") {
    return db.findById(nameOrId)
  } else {
    return db.findByEmail(nameOrId)
  }
}

// 实际场景：根据参数类型精确返回类型
function len(value: string): number
function len(value: any[]): number
function len(value: string | any[]): number {
  return value.length
}

const s = len("hello")   // s: number
const a = len([1, 2, 3]) // a: number
```

### 5.4 this 参数

```ts
// 声明函数中 this 的类型（第一个参数是假的，编译后不出现）
function handleClick(this: HTMLButtonElement, event: MouseEvent) {
  console.log(this.textContent)  // ✅ this 有类型
}

// 用在对象方法
const user = {
  name: "Alice",
  greet(this: { name: string }) {
    return `Hello, I'm ${this.name}`
  },
}
```

---

## 6. 对象与接口

### 6.1 对象类型

```ts
// 直接定义对象类型
function printUser(user: { name: string; age: number }): void {
  console.log(`${user.name}, ${user.age}`)
}

// 可选属性
type Config = {
  url: string
  method?: string               // 可选
  timeout?: number
  retries: number
}

// readonly 属性
type Point = {
  readonly x: number
  readonly y: number
}
const p: Point = { x: 10, y: 20 }
// p.x = 30  // ❌ 只读
```

### 6.2 接口（interface）

```ts
interface User {
  name: string
  age: number
  email?: string                // 可选属性
  readonly id: number           // 只读
}

const alice: User = {
  id: 1,
  name: "Alice",
  age: 25,
}

// 接口可以扩展（继承）
interface AdminUser extends User {
  role: "admin" | "superadmin"
  permissions: string[]
}

// 接口可以合并（同名接口自动合并）
interface Shape {
  color: string
}
interface Shape {
  area(): number
}
// 最终 Shape 同时有 color 和 area
```

### 6.3 索引签名

```ts
// 允许任意字符串键
interface StringMap {
  [key: string]: string
}

// 已知键 + 未知键
interface Config {
  name: string
  version: number
  [key: string]: string | number   // 其他任意键
}

const config: Config = {
  name: "app",
  version: 1,
  custom1: "value1",               // ✅
  custom2: "value2",               // ✅
}
```

---

## 7. 类型别名 vs 接口

| | type | interface |
|------|------|-----------|
| 定义对象形状 | ✅ | ✅ |
| 扩展 | `&`（交叉类型） | `extends` |
| 合并 | ❌（不能重复声明） | ✅（同名自动合并） |
| 联合类型 | ✅ | ❌ |
| 元组 | ✅ | 勉强可以 |
| 函数 | ✅ | ✅ |
| 声明文件 `.d.ts` | ✅ | ✅（更常用） |

```ts
// type：更灵活（能做 interface 做不了的事）
type ID = string | number
type Point = [number, number]
type MathFn = (a: number, b: number) => number

// interface：更面向"形状"（更适合对象的公开 API）
interface User {
  name: string
  age: number
}

// 选择建议：
// 1. 定义对象形状且需要 extend → interface
// 2. 联合类型/元组/工具类型 → type
// 3. 不确定 → type 先写着
// 4. 库的公共 API → interface（可被用户扩展）
```

---

## 8. 联合类型与交叉类型

```ts
// 联合类型 |：要么 A 要么 B
type Status = "draft" | "published" | "archived"
type ID = string | number

function printId(id: ID) {
  if (typeof id === "string") {
    console.log(id.toUpperCase())  // ✅ 窄化后
  }
  console.log(id)                 // 只能用 string | number 共有的方法
}

// 联合类型的常见模式：可辨识联合（Discriminated Union）
type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "square"; side: number }
  | { kind: "rectangle"; width: number; height: number }

function area(shape: Shape): number {
  switch (shape.kind) {
    case "circle":    return Math.PI * shape.radius ** 2
    case "square":    return shape.side ** 2
    case "rectangle": return shape.width * shape.height
  }
}
// TS 会根据 kind 自动窄化，每个 case 里属性是精确的

// 交叉类型 &：同时拥有 A 和 B
type Named = { name: string }
type Aged = { age: number }
type Person = Named & Aged
// { name: string; age: number }

// 交叉类型的实际用途：合并 props
type ButtonProps = {
  label: string
} & React.ComponentProps<"button">
```

---

## 9. 字面量类型

```ts
// 字符串字面量类型
type Direction = "north" | "south" | "east" | "west"
function move(direction: Direction, distance: number) { /* ... */ }
move("north", 10)     // ✅
// move("up", 10)     // ❌

// 数字字面量类型
type Dice = 1 | 2 | 3 | 4 | 5 | 6
function roll(dice: Dice) { /* ... */ }

// 布尔字面量类型
type Success = true
type Failure = false

// 模板字面量类型（TS 4.1+）
type EventName = `on${Capitalize<string>}`   // 必须是 "on" 开头
type Color = "red" | "green" | "blue"
type ColorEvent = `on${Capitalize<Color>}`  // "onRed" | "onGreen" | "onBlue"

// 实际用途：API 路径
type Method = "get" | "post" | "put" | "delete"
type APIPath = `/${string}`
type API = `${Method} ${APIPath}`
// "get /users" | "post /users" | ...
```

---

## 10. 枚举

```ts
// 数字枚举（默认从 0 开始递增）
enum Direction {
  Up,       // 0
  Down,     // 1
  Left,     // 2
  Right,    // 3
}
Direction.Up  // 0

// 自定义起始值
enum Status {
  Active = 1,
  Inactive,
  Pending,
}
// Active=1, Inactive=2, Pending=3

// 字符串枚举（更可读，推荐）
enum Theme {
  Light = "light",
  Dark = "dark",
  System = "system",
}
// 编译后：Theme.Light = "light"

// const enum（编译时内联，不生成对象，零运行时开销）
const enum LogLevel {
  Error = 0,
  Warn = 1,
  Info = 2,
}

// 枚举 vs 联合类型的选择
// 枚举：需要运行时使用值（如遍历）
// 联合类型：只需要编译时检查，更轻量
type Theme2 = "light" | "dark" | "system"   // 推荐用于简单场景
```

---

## 11. 类型窄化

"窄化"是把宽类型缩窄到具体类型的过程。

```ts
// ===== typeof 窄化 =====
function padLeft(value: string, padding: string | number) {
  if (typeof padding === "number") {
    return " ".repeat(padding) + value   // 此处 padding 是 number
  }
  return padding + value                 // 此处 padding 是 string
}

// ===== instanceof 窄化 =====
function logDate(date: Date | string) {
  if (date instanceof Date) {
    console.log(date.toISOString())
  } else {
    console.log(date)
  }
}

// ===== in 窄化 =====
type Fish = { swim: () => void }
type Bird = { fly: () => void }
function move(animal: Fish | Bird) {
  if ("swim" in animal) {
    animal.swim()    // animal 窄化为 Fish
  } else {
    animal.fly()     // animal 窄化为 Bird
  }
}

// ===== 自定义类型守卫 =====
function isString(value: unknown): value is string {
  return typeof value === "string"
}
// 返回值是 xxx is YYY → Type Guard，TS 会据此窄化

// ===== 断言函数（TS 3.7+） =====
function assert(condition: unknown, msg: string): asserts condition {
  if (!condition) throw new Error(msg)
}

// ===== 可辨识联合（最优雅的窄化） =====
type Result<T> =
  | { status: "ok"; data: T }
  | { status: "error"; message: string }

function handleResult(result: Result<User>) {
  if (result.status === "ok") {
    result.data.name   // ✅ 此处 result.data 类型是 User
  } else {
    result.message     // ✅ 此处 result.message 是 string
  }
}
```

### 真实性窄化

```ts
// TS 用 if / && / || / ! 自动窄化 null 和 undefined
function printAll(strs: string | string[] | null) {
  if (strs) {
    // 此处 strs 是 string | string[]（null 被排除）
    if (typeof strs === "object") {
      strs.forEach(s => console.log(s))
    } else {
      console.log(strs)
    }
  }
}
```

---

## 12. 泛型

泛型让你写一个函数/类/类型，同时保持类型安全——"我现在不知道类型，但我知道调用时就能确定了"。

### 12.1 基础泛型

```ts
// 没有泛型：any → 丢失类型信息
function identity(arg: any): any {
  return arg
}
const result = identity("hello")
// result 类型是 any，编辑器帮不了忙

// 有泛型：调用时确定类型
function identity<T>(arg: T): T {
  return arg
}
const r1 = identity<string>("hello")   // r1: string
const r2 = identity(42)                // r2: number（自动推断）
```

### 12.2 泛型约束

```ts
// extends 约束：T 必须满足某个条件
function getLength<T extends { length: number }>(arg: T): number {
  return arg.length
}
getLength("hello")    // 5
getLength([1, 2, 3])  // 3
// getLength(42)      // ❌ number 没有 length

// 用 keyof 约束
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key]
}
const user = { name: "Alice", age: 25 }
getProperty(user, "name")   // ✅ "Alice"（string）
getProperty(user, "age")    // ✅ 25（number）
// getProperty(user, "email") // ❌ "email" 不是 user 的 key
```

### 12.3 泛型实战

```ts
// 1. 泛型创建响应类型
interface APIResponse<T> {
  code: number
  message: string
  data: T
}

type UserResponse = APIResponse<User>
type PostListResponse = APIResponse<Post[]>

async function fetchData<T>(url: string): Promise<APIResponse<T>> {
  const res = await fetch(url)
  return res.json()
}

const userData = await fetchData<User>("/api/users/1")
userData.data.name  // ✅ 类型安全

// 2. 泛型工厂函数
function createMap<V>(keys: string[], valueFn: (key: string) => V): Map<string, V> {
  return new Map(keys.map(k => [k, valueFn(k)]))
}

const numMap = createMap(["a", "b", "c"], () => 0)
numMap.get("a")  // number | undefined

// 3. 泛型条件分发
type IsString<T> = T extends string ? true : false
type A = IsString<"hello">  // true
type B = IsString<42>       // false

// 4. 泛型默认值
interface Config<T = string> {
  value: T
}
const c1: Config = { value: "hello" }
const c2: Config<number> = { value: 42 }
```

### 12.4 泛型与数组

```ts
// 在数组中用泛型
function first<T>(arr: T[]): T | undefined {
  return arr[0]
}

const n = first([1, 2, 3])     // n: number | undefined
const s = first(["a", "b"])    // s: string | undefined

// 多个泛型参数
function zip<T, U>(a: T[], b: U[]): [T, U][] {
  return a.map((item, i) => [item, b[i]])
}
zip([1, 2], ["a", "b"])   // [[1, "a"], [2, "b"]]
```

---

## 13. 工具类型

TS 内置了大量工具类型，不需要自己实现。

```ts
// ===== 属性修饰 =====
interface User {
  id: number
  name: string
  email?: string
  role: "user" | "admin"
}

type PartialUser = Partial<User>          // 所有属性可选
type RequiredUser = Required<User>        // 所有属性必填
type ReadonlyUser = Readonly<User>        // 所有属性只读
const user1: PartialUser = { name: "Alice" }  // ✅ 只填部分

// ===== 选取与排除 =====
type UserPreview = Pick<User, "id" | "name">
type UserWithoutEmail = Omit<User, "email" | "role">

// ===== 记录类型 =====
type PageInfo = Record<"home" | "about" | "contact", { title: string }>
// { home: { title: string }; about: { title: string }; contact: { title: string } }

// ===== 提取类型 =====
type Point = { x: number; y: number }
type PointX = Point["x"]             // number（"索引访问类型"）

// ===== 从 Union 提取 =====
type Event = "click" | "scroll" | "mousemove"
type ExcludedEvent = Exclude<Event, "scroll">   // "click" | "mousemove"
type ExtractedEvent = Extract<Event, "click" | "mousemove">  // "click"

// ===== 函数相关 =====
type Fn = (a: number, b: string) => boolean
type Params = Parameters<Fn>         // [a: number, b: string]
type Return = ReturnType<Fn>         // boolean

async function fetchUser(): Promise<User> { /* ... */ }
type FetchedUser = Awaited<ReturnType<typeof fetchUser>>  // User

// ===== 字符串操作 =====
type Greeting = "hello world"
type Upper = Uppercase<Greeting>     // "HELLO WORLD"
type Lower = Lowercase<Greeting>     // "hello world"
type Capitalized = Capitalize<Greeting> // "Hello world"
```

---

## 14. 条件类型与模板字面量类型

### 条件类型

```ts
// 基础语法：T extends U ? X : Y
type IsString<T> = T extends string ? "yes" : "no"
type A = IsString<"hello">   // "yes"
type B = IsString<42>        // "no"

// never 的妙用：过滤联合类型
type NonNullable<T> = T extends null | undefined ? never : T
type C = NonNullable<string | null | undefined>  // string

// 实际应用：提取函数返回值的 Promise 内容
type Unwrap<T> = T extends Promise<infer U> ? U : T
type D = Unwrap<Promise<User>>   // User
type E = Unwrap<string>          // string

// infer 关键字：在条件类型中"提取"类型
type ArrayItem<T> = T extends (infer Item)[] ? Item : T
type F = ArrayItem<string[]>     // string
type G = ArrayItem<number>       // number
```

### 模板字面量类型

```ts
// 拼接字符串类型
type World = "world"
type Greeting = `hello ${World}`         // "hello world"

// 联合类型的笛卡尔积
type Color = "red" | "green"
type Size = "sm" | "md" | "lg"
type ColorSize = `${Color}-${Size}`
// "red-sm" | "red-md" | "red-lg" | "green-sm" | "green-md" | "green-lg"

// 实际用途：事件系统
type EventHandler = `on${Capitalize<string>}`
// 确保所有事件处理函数以 on 开头

// CSS 属性约束
type CSSProperty =
  | `margin-${"top" | "right" | "bottom" | "left"}`
  | `padding-${"top" | "right" | "bottom" | "left"}`
```

---

## 15. 类

### 访问修饰符

```ts
class Animal {
  public name: string           // 默认 public，到处都能访问
  private secret: string        // 只有类内部能访问
  protected family: string      // 类内部 + 子类能访问

  constructor(name: string, secret: string, family: string) {
    this.name = name
    this.secret = secret
    this.family = family
  }

  // 参数属性简写（最常用的 TS 特性之一）
  // 下一节展示更好的写法
}

// 简写：在构造函数参数前加修饰符，自动声明+赋值
class User {
  constructor(
    public readonly id: number,
    public name: string,
    private password: string,
    protected createdAt: Date = new Date(),
  ) {}
  // 上面 4 行 = 声明 4 个属性 + 构造函数赋值
}

const user = new User(1, "Alice", "123456")
user.id        // ✅ public readonly
user.name      // ✅ public
// user.password  // ❌ private
```

### 接口实现与抽象类

```ts
interface Printable {
  print(): void
}

// implements：确保类满足接口
class Document implements Printable {
  print() { console.log("printing...") }
}

// abstract：不能实例化，必须被子类实现
abstract class Shape {
  abstract area(): number     // 子类必须实现
  describe() {
    return `面积: ${this.area()}`
  }
}

class Circle extends Shape {
  constructor(public radius: number) {
    super()
  }
  area() { return Math.PI * this.radius ** 2 }
}

// const s = new Shape()     // ❌ 抽象类不能实例化
const c = new Circle(5)
c.describe()                 // "面积: 78.5398..."
```

### static 块

```ts
class Config {
  static apiUrl: string

  static {
    // ES2022 静态初始化块
    const env = process.env.NODE_ENV
    this.apiUrl = env === "production"
      ? "https://api.example.com"
      : "http://localhost:3000"
  }
}
```

---

## 16. 模块与声明文件

### 模块导出导入的类型

```ts
// utils.ts
export function add(a: number, b: number): number {
  return a + b
}

export interface Point {
  x: number
  y: number
}

export type ID = string | number

// app.ts
import { add, type Point, type ID } from "./utils"
// type 关键字：导入仅作类型用，编译后完全消失

// 或
import type { Point } from "./utils"     // 纯类型导入（编译后完全擦除）
import { add } from "./utils"           // 值导入
```

### 声明文件（.d.ts）

当使用没有类型的第三方 JS 库时，你需要"告诉 TS 这个库长什么样"。

```ts
// globals.d.ts —— 声明全局变量
declare const DEBUG: boolean
declare const API_URL: string
declare const VERSION: string

// 声明全局函数
declare function gtag(event: string, params: Record<string, unknown>): void

// 声明模块
declare module "*.svg" {
  const content: string
  export default content
}

declare module "*.vue" {
  import type { DefineComponent } from "vue"
  const component: DefineComponent
  export default component
}

declare module "my-untyped-lib" {
  export function doSomething(input: string): number
  export const version: string
}

// 扩展全局类型
declare global {
  interface Window {
    __CUSTOM_GLOBAL__: string
  }
}
// 现在 window.__CUSTOM_GLOBAL__ 有类型了
```

### DefinitelyTyped

```bash
# 绝大多数流行库已有社区维护的类型
pnpm add -D @types/lodash
pnpm add -D @types/node
pnpm add -D @types/react
# 这些类型自动生效，无需配置
```

---

## 17. tsconfig.json 配置

```jsonc
{
  "compilerOptions": {
    // ===== 目标与模块 =====
    "target": "ES2022",              // 编译到 ES2022
    "module": "ESNext",              // 模块系统：ESNext / CommonJS
    "moduleResolution": "bundler",   // 现代打包器（Vite 等）

    // ===== 严格模式（强烈建议全开） =====
    "strict": true,                  // 开启所有严格检查
    // 展开来就是：
    // "noImplicitAny": true,        // 禁止隐式 any
    // "strictNullChecks": true,     // null/undefined 各自独立类型
    // "strictFunctionTypes": true,  // 严格函数类型检查
    // "strictBindCallApply": true,  // 严格 bind/call/apply 检查
    // "strictPropertyInitialization": true, // 类属性必须初始化
    // "noImplicitThis": true,       // 禁止隐式 this 类型
    // "alwaysStrict": true,         // 生成 "use strict"
    // "useUnknownInCatchVariables": true, // catch 变量默认 unknown

    // ===== 路径 =====
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],              // import from "@/utils"
    },

    // ===== 输出 =====
    "outDir": "dist",                // 输出目录
    "rootDir": "src",                // 源码根目录
    "declaration": true,             // 生成 .d.ts 声明文件（库用）
    "declarationMap": true,          // 声明的 source map
    "sourceMap": true,               // 生成 source map
    "noEmit": true,                  // 只检查不输出（Vite/vue-tsc 常见）

    // ===== JS 相关 =====
    "allowJs": false,                // 不编译 JS 文件
    "checkJs": false,                // 不检查 JS 文件

    // ===== 语法风格 =====
    "jsx": "preserve",               // 保留 JSX（给 Vite 处理）
    "esModuleInterop": true,         // 兼容 CJS 导入
    "forceConsistentCasingInFileNames": true, // 强制文件名大小写一致
    "isolatedModules": true,         // 每个文件作为独立模块（Vite 需要）
    "skipLibCheck": true,            // 跳过 .d.ts 类型检查（加速）
    "resolveJsonModule": true,       // 允许导入 JSON

    // ===== 库 =====
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
  },
  "include": ["src/**/*.ts", "src/**/*.tsx", "src/**/*.vue"],
  "exclude": ["node_modules", "dist"]
}
```

### Vite + Vue 项目的最小 tsconfig

```jsonc
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "jsx": "preserve",
    "noEmit": true,
    "isolatedModules": true,
    "skipLibCheck": true,
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] }
  },
  "include": ["src/**/*", "env.d.ts"]
}
```

---

## 18. TS 与 Vue/React

### Vue 3 + `<script setup lang="ts">`

```vue
<script setup lang="ts">
import { ref, computed, type Ref } from 'vue'

// 定义类型
interface Post {
  id: number
  title: string
  content: string
  author: {
    name: string
  }
  tags: string[]
  createdAt: Date
}

// ref 自动推断
const posts = ref<Post[]>([])                // 显式泛型
const searchQuery = ref("")                  // 推断为 Ref<string>

// computed 自动推断
const filteredPosts = computed(() =>
  posts.value.filter(p =>
    p.title.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
)

// 异步获取
async function loadPosts(): Promise<void> {
  const res = await fetch("/api/posts")
  posts.value = await res.json()
}

// 模板 ref
const inputRef = ref<HTMLInputElement | null>(null)
// 或 Vue 3.5+
const input = useTemplateRef<HTMLInputElement>('myInput')

// Props 类型
interface Props {
  title: string
  count?: number
  items: string[]
}
const props = withDefaults(defineProps<Props>(), {
  count: 0,
})

// Emits 类型
const emit = defineEmits<{
  (e: 'update', id: number): void
  (e: 'delete', id: number): void
}>()

// defineModel（3.4+）
const model = defineModel<string>({ default: '' })
</script>

<template>
  <input v-model="searchQuery" placeholder="搜索...">
  <div v-for="post in filteredPosts" :key="post.id">
    <h2>{{ post.title }}</h2>
    <p>by {{ post.author.name }}</p>
  </div>
</template>
```

### React + TypeScript

```tsx
import { useState, useEffect, type FC, type FormEvent } from 'react'

interface User {
  id: number
  name: string
  email: string
}

// 函数组件
const UserList: FC = () => {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const res = await fetch("/api/users")
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        setUsers(await res.json())
      } catch (err) {
        setError((err as Error).message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>{user.name} ({user.email})</li>
      ))}
    </ul>
  )
}

// Props 类型
interface ButtonProps {
  label: string
  variant?: "primary" | "secondary"
  onClick?: () => void
  disabled?: boolean
}

const Button: FC<ButtonProps> = ({
  label,
  variant = "primary",
  onClick,
  disabled = false,
}) => (
  <button
    className={`btn btn-${variant}`}
    onClick={onClick}
    disabled={disabled}
  >
    {label}
  </button>
)

// 表单事件
function handleSubmit(e: FormEvent<HTMLFormElement>) {
  e.preventDefault()
  const form = e.currentTarget
  // ...
}
```

---

## 19. 实用模式与示例

### 19.1 API 响应类型模式

```ts
// 定义通用的 API 响应格式
// api-types.ts
export interface APIResponse<T> {
  code: number
  message: string
  data: T
}

export interface PaginatedResponse<T> {
  code: number
  message: string
  data: {
    items: T[]
    total: number
    page: number
    pageSize: number
  }
}

// 业务类型
export interface Post {
  id: number
  title: string
  summary: string
  tags: string[]
  createdAt: string
}

// API 函数
export async function getPosts(page = 1): Promise<PaginatedResponse<Post>> {
  const res = await fetch(`/api/posts?page=${page}`)
  return res.json()
}

export async function getPost(id: number): Promise<APIResponse<Post>> {
  const res = await fetch(`/api/posts/${id}`)
  return res.json()
}

// 使用
const result = await getPosts(1)
result.data.items.forEach(post => {
  console.log(post.title)    // ✅ 完全类型安全
})
```

### 19.2 策略模式 + 类型安全

```ts
// 定义策略接口
interface PaymentStrategy {
  name: string
  pay(amount: number): void
}

class CreditCardPayment implements PaymentStrategy {
  name = "信用卡"
  pay(amount: number) {
    console.log(`信用卡支付 ¥${amount}`)
  }
}

class WechatPayment implements PaymentStrategy {
  name = "微信"
  pay(amount: number) {
    console.log(`微信支付 ¥${amount}`)
  }
}

// 上下文
class Payment {
  constructor(private strategy: PaymentStrategy) {}

  execute(amount: number) {
    console.log(`使用${this.strategy.name}支付`)
    this.strategy.pay(amount)
  }
}

new Payment(new WechatPayment()).execute(100)
```

### 19.3 Builder 模式（类型安全）

```ts
class SQLBuilder {
  private fields = "*"
  private table = ""
  private conditions: string[] = []
  private limitVal = 0
  private offsetVal = 0

  select(fields: string): this {
    this.fields = fields
    return this
  }
  from(table: string): this {
    this.table = table
    return this
  }
  where(condition: string): this {
    this.conditions.push(condition)
    return this
  }
  limit(n: number): this {
    this.limitVal = n
    return this
  }
  offset(n: number): this {
    this.offsetVal = n
    return this
  }
  build(): string {
    let sql = `SELECT ${this.fields} FROM ${this.table}`
    if (this.conditions.length) {
      sql += ` WHERE ${this.conditions.join(" AND ")}`
    }
    if (this.limitVal) sql += ` LIMIT ${this.limitVal}`
    if (this.offsetVal) sql += ` OFFSET ${this.offsetVal}`
    return sql
  }
}

const query = new SQLBuilder()
  .select("id, name, email")
  .from("users")
  .where("age > 18")
  .where("active = 1")
  .limit(10)
  .build()
```

### 19.4 状态机（可辨识联合最经典的应用）

```ts
type FetchState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; error: string }

// 使用
let state: FetchState<Post[]> = { status: "idle" }

state = { status: "loading" }
// 模拟异步
state = { status: "success", data: [{ id: 1, title: "Hello", /* ... */ }] }

function render(state: FetchState<Post[]>) {
  switch (state.status) {
    case "idle":    return "Ready"
    case "loading": return "Loading..."
    case "success": return state.data.map(p => p.title)  // ✅ 有 data
    case "error":   return `Error: ${state.error}`        // ✅ 有 error
  }
}
```

---

## 20. 常见陷阱与最佳实践

1. **`any` 是魔鬼** —— 用了 `any` 基本等于没写 TS。新代码用 `unknown` + 窄化，或用 `// @ts-ignore` 临时跳过，然后尽快回来修。`as any` 同理。

2. **`as` 类型断言是危险的** —— `as` 绕过类型检查，只在你有确凿证据时用。`as unknown as Target` 是危险信号。优先用类型守卫。

3. **`enum` 不要和数字一起做运算** —— 数字枚举容易变成魔法数字。字符串枚举或联合类型是更好的选择。`const enum` 如果跨项目可能有问题（isolatedModules 下不工作）。

4. **`?.` 可选链的类型影响** —— `user?.address?.city` 的类型是 `string | undefined`，即使 `user` 一定存在。需要后续用 `??` 或类型守卫处理。

5. **JSON.parse 返回 `any`** —— 必须手动标注类型：`const data: User = JSON.parse(json)`。或写一个泛型 wrapper：`function safeParse<T>(s: string): T { ... }`。

6. **`Object.keys` 返回 `string[]` 而非键的联合类型** —— `Object.keys(user)` 返回 `string[]`，用它访问 `user[key]` 会报错。用 `keyof typeof` 或写类型安全的 `objectKeys` 函数。

7. **类型守卫中的 `typeof` 不能区分数组** —— `typeof [] === "object"`。区分数组用 `Array.isArray()`，TS 会据此窄化。

8. **`--strict` 要全开** —— 很多新手关掉 `strict` 绕过红色波浪线，但这不是解决问题，是掩耳盗铃。strict 全开才能享受 TS 的真正保护。

9. **`as const` 的解读** —— `as const` 将字面量"固化为最窄的类型"，同时将对象变为 `readonly`。适用于常量对象、枚举替代等场景。

10. **`.d.ts` 文件和 `.ts` 文件的区别** —— `.d.ts` 只放类型声明，不放实现。.d.ts 中的 `declare` 不会产生运行时代码。

11. **`void` vs `undefined` 作返回值** —— `void` 表示"我不关心返回值"，意味着你可以返回任何值（但调用方不应使用）。`undefined` 要求显式返回 `undefined`。函数不写 return 时，TS 推断返回 `void`。

12. **`Object`、`object`、`{}` 的区别** —— `Object` 是 JS 全局对象类型（基本不用）。`object` 是非原始类型。`{}` 是除 null/undefined 外的所有值（几乎等于 any，别用）。

13. **索引签名会覆盖已知属性的类型** —— `interface X { name: string; [k: string]: string }` 中，`name` 必须是 `string`。如果实际值是复杂对象，用 `[key: string]: unknown`。

14. **TS 的类型系统是结构化的，不是名义化的** —— 两个同名但不相干的 interface 只要结构相同，就互相兼容。这和 Java/C# 不同。用 branded type（`type UserID = string & { __brand: "UserID" }`）模拟名义类型。

15. **不要导出你不打算公开的类型** —— 导出类型 = 承诺 API 契约。把内部用的类型放在组件内部，只导出需要暴露的。
