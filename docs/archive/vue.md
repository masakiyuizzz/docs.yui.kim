# Vue 3.5 —— 渐进式 JavaScript 框架

> "The Progressive JavaScript Framework"
> 响应式 · 组件化 · 编译时优化 · 支持 Options API 与 Composition API
> 最新稳定版：3.5.21 · 次世代 Vapor 模式实验性阶段
> 官网：[cn.vuejs.org](https://cn.vuejs.org) · 源码：[github.com/vuejs/core](https://github.com/vuejs/core)

---

## 目录

1. [认识 Vue 3](#1-认识-vue-3)
2. [项目创建与工程化](#2-项目创建与工程化)
3. [单文件组件（SFC）](#3-单文件组件sfc)
4. [`<script setup>` 宏全解](#4-script-setup-宏全解)
5. [响应式系统](#5-响应式系统)
6. [计算属性与侦听器](#6-计算属性与侦听器)
7. [模板语法](#7-模板语法)
8. [组件基础](#8-组件基础)
9. [生命周期钩子](#9-生命周期钩子)
10. [内置组件](#10-内置组件)
11. [组合式函数（Composables）](#11-组合式函数composables)
12. [Vue Router 4](#12-vue-router-4)
13. [Pinia 状态管理](#13-pinia-状态管理)
14. [TypeScript 集成](#14-typescript-集成)
15. [异步组件与 Suspense](#15-异步组件与-suspense)
16. [Vue 3.5 新特性](#16-vue-35-新特性)
17. [API 速查表](#17-api-速查表)
18. [实战：从零写一个应用](#18-实战从零写一个应用)
19. [注意事项与常见陷阱](#19-注意事项与常见陷阱)

---

## 1. 认识 Vue 3

### 1.1 Vue 是什么

Vue 是一个**渐进式**前端框架。渐进式意味着你可以：
- 只在一个页面中嵌入几个组件
- 逐步扩成完整 SPA
- 按需引入 Router、Pinia、SSR

### 1.2 Vue 3 vs Vue 2

| 方面 | Vue 2 | Vue 3 |
|------|-------|-------|
| 响应式 | `Object.defineProperty`（有检测盲区） | `Proxy`（全覆盖） |
| API 风格 | Options API 为主 | Composition API 推荐（Options 仍可用） |
| TypeScript | 部分支持 | 原生 TypeScript 编写 |
| 性能 | 中等 | 快 2~3 倍（PatchFlag + 静态提升） |
| 体积 | ~20KB gzip | ~16KB gzip（Tree-shakable） |
| 多根节点 | ❌ 需要包一层 div | ✅ Fragments 原生支持 |
| Teleport | 需第三方 | ✅ 内置 |
| Suspense | ❌ | ✅ 内置 |

### 1.3 两种 API 风格对比

```vue
<!-- Options API（Vue 2 风格，Vue 3 兼容） -->
<script>
export default {
  data() {
    return { count: 0 }
  },
  computed: {
    double() { return this.count * 2 }
  },
  methods: {
    increment() { this.count++ }
  }
}
</script>

<!-- Composition API（推荐） -->
<script setup>
import { ref, computed } from 'vue'

const count = ref(0)
const double = computed(() => count.value * 2)
function increment() { count.value++ }
</script>
```

两者可以混用。`<script setup>` 是推荐写法。

---

## 2. 项目创建与工程化

### 2.1 create-vue（官方脚手架）

```bash
# 推荐方式
pnpm create vue@latest
# 或
npm create vue@latest
```

交互式选项：
```
✔ Project name: my-vue-app
✔ Add TypeScript? … Yes
✔ Add JSX Support? … No
✔ Add Vue Router? … Yes
✔ Add Pinia? … Yes
✔ Add Vitest? … Yes
✔ Add ESLint? … Yes
```

### 2.2 Vite 手动搭建

```bash
pnpm create vite@latest my-app -- --template vue-ts
cd my-app
pnpm install
pnpm add vue-router pinia
pnpm dev
```

### 2.3 项目结构

```
my-app/
├── index.html              # 入口 HTML
├── vite.config.ts          # Vite 配置
├── tsconfig.json           # TypeScript 配置
├── package.json
├── src/
│   ├── main.ts             # 应用入口
│   ├── App.vue             # 根组件
│   ├── router/
│   │   └── index.ts        # 路由配置
│   ├── stores/
│   │   └── counter.ts      # Pinia store
│   ├── views/              # 页面组件
│   ├── components/         # 通用组件
│   ├── composables/        # 组合式函数
│   └── assets/             # 静态资源
└── public/                 # 不处理的静态文件
```

### 2.4 main.ts 模板

```ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())   // Pinia
app.use(router)           // Vue Router

app.mount('#app')
```

---

## 3. 单文件组件（SFC）

Vue 的 `.vue` 文件包含三部分：

```vue
<script setup lang="ts">
// 逻辑
import { ref } from 'vue'
const count = ref(0)
</script>

<template>
  <!-- 模板 -->
  <button @click="count++">{{ count }}</button>
</template>

<style scoped>
/* 样式（scoped 限制只在本组件生效） */
button {
  color: blue;
}
</style>
```

### 3.1 样式特性

```vue
<style scoped>
/* scoped：样式只影响本组件（通过 data-v-xxx 属性实现） */
.title { color: red; }
</style>

<style module>
/* CSS Modules：$style.title 访问 */
.title { color: red; }
</style>

<style>
/* 全局样式 */
body { margin: 0; }
</style>

<style lang="scss" scoped>
/* 预处理器（需安装 sass） */
$primary: #42b883;
.btn { background: $primary; }
</style>
```

### 3.2 v-bind 在 CSS 中使用

```vue
<script setup>
const color = ref('#ff0000')
const size = ref(16)
</script>

<style scoped>
.title {
  color: v-bind(color);
  font-size: v-bind(size + 'px');
}
</style>
```

---

## 4. `<script setup>` 宏全解

`<script setup>` 中的 `defineProps`、`defineEmits`、`defineModel` 等是**编译器宏**——不需要 import，编译时直接替换。

### 4.1 defineProps —— 声明父组件传入的数据

```vue
<script setup lang="ts">
// 运行时声明
const props = defineProps({
  title: { type: String, required: true },
  count: { type: Number, default: 0 },
})

// TypeScript 类型声明（推荐）
interface Props {
  title: string
  count?: number
  items?: string[]
}
const props = defineProps<Props>()

// 带默认值（使用 withDefaults）
const props = withDefaults(defineProps<Props>(), {
  count: 0,
  items: () => [],   // 数组/对象默认值必须用工厂函数
})

// Vue 3.5+ 可以直接解构而不丢失响应式：
const { title, count } = defineProps<Props>()
// title 和 count 在模板中直接使用，保持响应式
</script>
```

### 4.2 defineEmits —— 声明组件触发的事件

```vue
<script setup lang="ts">
// 运行时声明
const emit = defineEmits(['update', 'delete'])

// TS 声明（推荐）
const emit = defineEmits<{
  (e: 'update', id: number): void
  (e: 'delete', id: number): void
}>()
// 或
const emit = defineEmits<{
  update: [id: number]
  delete: [id: number]
}>()

// 使用
emit('update', 1)
</script>
```

### 4.3 defineModel —— 简化 v-model（3.4+）

```vue
<script setup lang="ts">
// 父组件：<MyInput v-model="text" v-model:title="pageTitle" />

// 基础用法
const modelValue = defineModel<string>()

// 带名称的 v-model（多个）
const title = defineModel<string>('title', { default: '' })
const content = defineModel<string>('content')

// 带验证/修饰符
const count = defineModel<number>({
  required: true,
  validator: (v) => v >= 0,
})

// 带本地 set 转换
const name = defineModel<string>({
  set(value) {
    return value.trim()    // 自动去除前后空格
  }
})
</script>

<template>
  <!-- 直接当作 ref 使用，双向绑定自动工作 -->
  <input v-model="modelValue" />
  <input v-model="title" />
</template>
```

### 4.4 defineExpose —— 暴露给父组件

```vue
<script setup lang="ts">
// <script setup> 组件默认封闭，父组件无法直接访问
// 必须显式暴露

const count = ref(0)
function focus() { /* ... */ }
function reset() { count.value = 0 }

defineExpose({ focus, reset, count })
</script>
```

### 4.5 defineOptions —— 声明组件选项（3.3+）

```vue
<script setup lang="ts">
// 不需单独写一个 <script> 块来定义 name、inheritAttrs 等
defineOptions({
  name: 'MyComponent',
  inheritAttrs: false,
})
</script>
```

### 4.6 defineSlots —— 声明插槽类型（3.3+）

```vue
<script setup lang="ts">
defineSlots<{
  default(props: { item: Item }): any
  header(props: { title: string }): any
  footer(): any
}>()
</script>
```

---

## 5. 响应式系统

### 5.1 ref —— 基本类型的响应式包装

```ts
import { ref, isRef, unref } from 'vue'

const count = ref(0)         // { value: 0 }
const name = ref('Alice')    // { value: 'Alice' }
const list = ref([1, 2, 3])  // 内部转为 reactive

// 读写必须 .value（模板中自动解包）
count.value++
console.log(count.value)     // 1

// 工具
isRef(count)   // true
unref(count)   // 1（如果是 ref 返回 .value，否则原值）
```

### 5.2 reactive —— 对象的响应式包装

```ts
import { reactive } from 'vue'

const state = reactive({
  user: { name: 'Alice', age: 25 },
  posts: [],
})

state.user.age = 26        // ✅ 自动触发更新
state.posts.push({})       // ✅ 数组操作也追踪

// 注意：不能整体替换 reactive 对象
// state = {}               ❌ 断开响应式
// 可以包装在 ref 中
const stateRef = ref({ user: { name: 'Alice' } })
stateRef.value = { user: { name: 'Bob' } }  // ✅
```

### 5.3 ref vs reactive 选择

| 场景 | 推荐 |
|------|------|
| 基本类型（number, string, boolean） | `ref` |
| 需要整体替换的对象 | `ref` |
| 复杂表单 / 不需要整体替换的对象 | `reactive` |
| 从组合式函数返回多个值 | `reactive` 对象 + `toRefs` |

### 5.4 toRef / toRefs —— 解构保持响应式

```ts
import { reactive, toRef, toRefs } from 'vue'

const state = reactive({ a: 1, b: 2 })

// ❌ 直接解构丢失响应式
const { a } = state
// a 现在是普通数字 1

// ✅ 用 toRefs 保持响应式
const { a: aRef, b: bRef } = toRefs(state)
aRef.value++   // 等同于 state.a++

// toRef：单个属性
const aRef = toRef(state, 'a')
```

### 5.5 readonly —— 只读保护

```ts
import { reactive, readonly } from 'vue'

const state = reactive({ count: 0 })
const readonlyState = readonly(state)

readonlyState.count++   // ❌ 警告：只读
state.count++           // ✅ 原始对象可写，只读视图同步更新
```

### 5.6 shallowRef / triggerRef —— 浅层响应式

```ts
import { shallowRef, triggerRef } from 'vue'

// shallowRef：只有 .value 本身变化才触发更新
const chart = shallowRef(new ECharts(...))
chart.value.setOption(...)  // ❌ 不触发更新
chart.value = new ECharts(...) // ✅ 触发

// 手动触发更新（如果确实需要）
triggerRef(chart)
```

### 5.7 customRef —— 自定义响应式

```ts
import { customRef } from 'vue'

// 防抖 ref
function useDebouncedRef(value, delay = 300) {
  let timeout: number
  return customRef((track, trigger) => ({
    get() {
      track()            // 收集依赖
      return value
    },
    set(newValue) {
      clearTimeout(timeout)
      timeout = setTimeout(() => {
        value = newValue
        trigger()         // 触发更新
      }, delay)
    }
  }))
}

const keyword = useDebouncedRef('')
```

### 5.8 markRaw —— 标记为非响应式

```ts
import { reactive, markRaw } from 'vue'

// 避免第三方大型实例被深度代理
const state = reactive({
  chartInstance: markRaw(new ECharts(...))
})
// chartInstance 不会被深度代理，省内存、省时间
```

### 5.9 effectScope —— 批量管理副作用

```ts
import { effectScope, ref, watch, onScopeDispose } from 'vue'

const scope = effectScope()

scope.run(() => {
  const count = ref(0)

  watch(count, () => {
    console.log('count changed:', count.value)
  })

  onScopeDispose(() => {
    console.log('cleanup')
  })
})

// 需要时一次性清理所有副作用
scope.stop()
```

---

## 6. 计算属性与侦听器

### 6.1 computed —— 计算属性

```ts
import { ref, computed } from 'vue'

const firstName = ref('Zhang')
const lastName = ref('San')

// 只读计算属性
const fullName = computed(() => `${firstName.value} ${lastName.value}`)

// 可写计算属性
const fullName2 = computed({
  get: () => `${firstName.value} ${lastName.value}`,
  set(val) {
    const [first, last] = val.split(' ')
    firstName.value = first
    lastName.value = last
  }
})

fullName2.value = 'Li Si'  // firstName 和 lastName 同步更新
```

### 6.2 watch —— 侦听器

```ts
import { ref, reactive, watch } from 'vue'

const x = ref(0)
const y = ref(0)

// 侦听单个 ref
watch(x, (newVal, oldVal) => {
  console.log(`x changed from ${oldVal} to ${newVal}`)
})

// 侦听多个源
watch([x, y], ([newX, newY], [oldX, oldY]) => {
  console.log('x or y changed')
})

// 侦听 reactive 对象属性（用 getter 函数，不要直接传对象）
const state = reactive({ count: 0 })
watch(() => state.count, (newVal) => {
  console.log('count:', newVal)
})

// 深度侦听（侦听整个 reactive 对象时自动深度）
watch(state, (newVal) => {
  console.log('state changed')
})

// 侦听 ref 对象需显式 deep: true
const obj = ref({ a: { b: 1 } })
watch(obj, (newVal) => {}, { deep: true })

// 立即执行
watch(x, (newVal) => {}, { immediate: true })

// 清理副作用（异步竞态处理）
watch(keyword, async (newVal, oldVal, onCleanup) => {
  let aborted = false
  onCleanup(() => { aborted = true })
  const results = await search(newVal)
  if (!aborted) {
    data.value = results
  }
})

// 停止侦听
const stop = watch(x, () => {})
stop()
```

### 6.3 watchEffect —— 自动跟踪依赖

```ts
import { ref, watchEffect } from 'vue'

const count = ref(0)
const doubled = ref(0)

// 自动追踪函数内部访问的所有响应式值
watchEffect(() => {
  doubled.value = count.value * 2
  console.log('count 或 doubled 变了')
}, {
  flush: 'post',     // 等待 DOM 更新后执行（默认 'pre' DOM 更新前）
})

// 清理副作用
watchEffect((onCleanup) => {
  const timer = setInterval(() => count.value++, 1000)
  onCleanup(() => clearInterval(timer))
})

// 停止
const stop = watchEffect(() => {})
stop()
```

### 6.4 watch vs watchEffect

| | watch | watchEffect |
|------|-------|-------------|
| 显式指定源 | ✅ 必须 | ❌ 自动追踪 |
| 旧值 | ✅ 可获得 | ❌ |
| 懒执行 | ✅ 默认 | ❌ 立即执行 |
| 适用 | 数据变化时异步操作 | 同步计算派生状态 |

---

## 7. 模板语法

### 7.1 文本插值与表达式

```vue
<template>
  <span>Message: {{ msg }}</span>
  <span>{{ number + 1 }}</span>
  <span>{{ ok ? 'YES' : 'NO' }}</span>
  <span>{{ message.split('').reverse().join('') }}</span>
</template>
```

### 7.2 指令速查

| 指令 | 说明 | 示例 |
|------|------|------|
| `v-bind` | 绑定属性 | `:src="url"` / `:[attr]="value"` |
| `v-on` | 监听事件 | `@click="handler"` / `@[event]="handler"` |
| `v-model` | 双向绑定 | `v-model="text"` |
| `v-if/v-else-if/v-else` | 条件渲染 | `v-if="ok"` |
| `v-show` | 条件显示（display 切换） | `v-show="visible"` |
| `v-for` | 列表渲染 | `v-for="item in items" :key="item.id"` |
| `v-once` | 只渲染一次 | `v-once` |
| `v-memo` | 记忆化 | `v-memo="[a, b]"` |
| `v-html` | 渲染 HTML | `v-html="htmlStr"` |
| `v-text` | 文本内容 | `v-text="msg"` |
| `v-cloak` | 隐藏未编译模板 | `v-cloak` |
| `v-pre` | 跳过编译 | `v-pre` |

### 7.3 v-bind 简写

```vue
<template>
  <!-- 绑定属性 -->
  <img :src="imageUrl" />
  <div :class="{ active: isActive, 'text-red': hasError }" />
  <div :class="[activeClass, errorClass]" />
  <div :style="{ color: activeColor, fontSize: fontSize + 'px' }" />
  <!-- 动态属性名 -->
  <div :[attrName]="value" />
  <!-- 批量绑定属性 -->
  <div v-bind="propsObject" />
</template>
```

### 7.4 v-on 事件处理

```vue
<template>
  <button @click="count++">+1</button>
  <button @click="handleClick">Click</button>
  <button @click="handleClick($event, 'arg1')">Event</button>
  <!-- 事件修饰符 -->
  <div @click.stop="handler">           <!-- 阻止冒泡 -->
  <form @submit.prevent="onSubmit">     <!-- 阻止默认 -->
  <div @click.self="handler">           <!-- 只有自己触发 -->
  <button @click.once="handler">        <!-- 只触发一次 -->
  <input @keyup.enter="submit">         <!-- 按键修饰符 -->
  <input @keyup.ctrl.s="save">          <!-- 系统键组合 -->
  <!-- 鼠标修饰符 -->
  <div @click.left="handler">           <!-- 左键 -->
  <div @click.right.prevent="handler">  <!-- 右键阻止菜单 -->
</template>
```

### 7.5 v-model 全解

```vue
<template>
  <!-- 文本 -->
  <input v-model="text" />
  <!-- 等价于 -->
  <input :value="text" @input="text = $event.target.value" />

  <!-- 复选框 -->
  <input type="checkbox" v-model="checked" />

  <!-- 多个复选框（绑定数组） -->
  <input type="checkbox" v-model="selected" value="A" />
  <input type="checkbox" v-model="selected" value="B" />

  <!-- 单选框 -->
  <input type="radio" v-model="picked" value="one" />

  <!-- 下拉框 -->
  <select v-model="selected">
    <option disabled value="">请选择</option>
    <option>A</option><option>B</option>
  </select>

  <!-- 修饰符 -->
  <input v-model.lazy="msg" />       <!-- change 事件后更新 -->
  <input v-model.number="age" />     <!-- 自动转数字 -->
  <input v-model.trim="msg" />       <!-- 自动去空格 -->

  <!-- 自定义组件 v-model（见 4.3 defineModel） -->
  <MyInput v-model="text" />
  <MyInput v-model:title="pageTitle" v-model:content="pageContent" />
</template>
```

### 7.6 v-for

```vue
<template>
  <!-- 数组 -->
  <li v-for="(item, index) in items" :key="item.id">
    {{ index }} - {{ item.name }}
  </li>

  <!-- 对象 -->
  <li v-for="(value, key, index) in obj" :key="key">
    {{ key }}: {{ value }}
  </li>

  <!-- 范围（1 到 10） -->
  <span v-for="n in 10" :key="n">{{ n }}</span>

  <!-- 遍历时使用 template -->
  <template v-for="item in items" :key="item.id">
    <div>{{ item.name }}</div>
    <div>{{ item.desc }}</div>
  </template>
</template>
```

---

## 8. 组件基础

### 8.1 组件注册与使用

```vue
<script setup>
// 导入即注册（<script setup> 内自动完成）
import MyButton from './MyButton.vue'
</script>

<template>
  <MyButton />
  <my-button />   <!-- kebab-case 也可用 -->
</template>
```

### 8.2 Props 传递

```vue
<!-- 父组件 -->
<template>
  <BlogPost
    title="Hello"
    :likes="42"
    :author="{ name: 'Alice' }"
    @update="handleUpdate"
  />
</template>

<!-- 子组件 BlogPost.vue -->
<script setup lang="ts">
const props = defineProps<{
  title: string
  likes?: number
  author: { name: string }
}>()
</script>

<template>
  <h1>{{ title }}</h1>
  <p>{{ likes }} likes by {{ author.name }}</p>
</template>
```

### 8.3 事件（Emits）

```vue
<!-- 子组件 -->
<script setup>
const emit = defineEmits(['update', 'submit'])
// 或 TS:
const emit = defineEmits<{
  update: [id: number]
  submit: [data: FormData]
}>()

function handleClick() {
  emit('update', 1)
}
</script>

<template>
  <button @click="handleClick">Update</button>
</template>

<!-- 父组件 -->
<template>
  <Child @update="(id) => console.log(id)" />
</template>
```

### 8.4 插槽（Slots）

```vue
<!-- 子组件 BaseLayout.vue -->
<template>
  <div class="layout">
    <header>
      <slot name="header" :title="$attrs.title" />
    </header>
    <main>
      <slot />
    </main>
    <footer>
      <slot name="footer" />
    </footer>
  </div>
</template>

<!-- 父组件 -->
<template>
  <BaseLayout>
    <!-- 默认插槽 -->
    <p>Main content</p>

    <!-- 具名插槽 -->
    <template #header="{ title }">
      <h1>{{ title }}</h1>
    </template>

    <!-- 动态插槽名 -->
    <template #[slotName]>
      <p>Dynamic</p>
    </template>
  </BaseLayout>
</template>
```

### 8.5 透传 Attributes

```vue
<!-- 父组件 -->
<MyButton class="large" id="btn1" @click="handle" />

<!-- 子组件：没有被声明为 props 或 emits 的属性自动透传到根元素 -->
<!-- 渲染为 <button class="large" id="btn1"> -->
<template>
  <button>Click</button>
</template>

<!-- 关闭自动透传 -->
<script setup>
defineOptions({ inheritAttrs: false })
</script>

<template>
  <!-- 手动绑定到指定元素 -->
  <div class="wrapper">
    <button v-bind="$attrs">Click</button>
  </div>
</template>
```

### 8.6 provide / inject —— 跨层级传值

```vue
<!-- 祖先组件 -->
<script setup>
import { provide, ref, readonly } from 'vue'

const theme = ref('light')
function toggleTheme() { theme.value = theme.value === 'light' ? 'dark' : 'light' }

provide('theme', readonly(theme))
provide('toggleTheme', toggleTheme)
</script>

<!-- 深层后代 -->
<script setup>
import { inject } from 'vue'

const theme = inject('theme')       // Ref<'light' | 'dark'>
const toggle = inject('toggleTheme') // () => void
</script>
```

---

## 9. 生命周期钩子

```
setup()
 └─ beforeCreate ─→ created ──→ beforeMount ──→ mounted
                                    │                │
                              (数据变化触发更新)        │
                                    │                │
                              beforeUpdate ──→ updated
                                    │
                             beforeUnmount ──→ unmounted
```

```vue
<script setup>
import {
  onBeforeMount, onMounted,
  onBeforeUpdate, onUpdated,
  onBeforeUnmount, onUnmounted,
  onActivated, onDeactivated,      // KeepAlive 专用
  onErrorCaptured,                 // 错误捕获
  onServerPrefetch,                // SSR 专用
} from 'vue'

onMounted(() => {
  console.log('组件已挂载，可以访问 DOM 了')
})

onBeforeUnmount(() => {
  console.log('清理定时器、取消订阅')
})
</script>
```

### 执行顺序

```
父 beforeMount
 ├─ 子 beforeMount
 ├─ 子 mounted
 └─ 父 mounted
```

---

## 10. 内置组件

### 10.1 Teleport —— 将内容渲染到 DOM 其他位置

```vue
<template>
  <!-- 将模态框渲染到 body 下 -->
  <Teleport to="body">
    <div class="modal" v-if="showModal">
      <p>这是模态框内容</p>
      <button @click="showModal = false">关闭</button>
    </div>
  </Teleport>

  <!-- 禁用 Teleport（方便调试） -->
  <Teleport to="body" :disabled="isMobile">
    <Modal />
  </Teleport>

  <!-- Vue 3.5 新增 defer：目标元素可后出现 -->
  <Teleport defer to="#late-appear">
    <p>内容</p>
  </Teleport>
  <div id="late-appear" />
</template>
```

### 10.2 Suspense —— 异步组件加载状态

```vue
<template>
  <Suspense>
    <!-- 加载完成后显示 -->
    <template #default>
      <AsyncDashboard />
    </template>

    <!-- 加载中显示 -->
    <template #fallback>
      <div class="loading">Loading...</div>
    </template>
  </Suspense>
</template>

<script setup>
import { defineAsyncComponent } from 'vue'

const AsyncDashboard = defineAsyncComponent(() =>
  import('./Dashboard.vue')
)
</script>
```

### 10.3 KeepAlive —— 缓存组件状态

```vue
<template>
  <KeepAlive :include="['Home', 'About']" :max="10">
    <component :is="currentView" />
  </KeepAlive>
</template>

<!-- 被缓存的组件可以获得 onActivated / onDeactivated 钩子 -->
<script setup>
import { onActivated, onDeactivated } from 'vue'
onActivated(() => console.log('切回来了'))
onDeactivated(() => console.log('切走了'))
</script>
```

### 10.4 Transition / TransitionGroup —— 过渡动画

```vue
<template>
  <!-- 单元素/单组件过渡 -->
  <Transition name="fade">
    <p v-if="show">Hello</p>
  </Transition>

  <!-- 列表过渡 -->
  <TransitionGroup name="list" tag="ul">
    <li v-for="item in items" :key="item.id">{{ item.text }}</li>
  </TransitionGroup>
</template>

<style>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.list-enter-active, .list-leave-active {
  transition: all 0.5s;
}
.list-enter-from, .list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
.list-move {
  transition: transform 0.5s;   /* 其他元素平滑移动 */
}
</style>
```

---

## 11. 组合式函数（Composables）

Composable 是 Vue 3 的逻辑复用机制。以 `use` 开头命名，返回响应式数据和方法。

### 11.1 基础 composable

```ts
// composables/useMouse.ts
import { ref, onMounted, onUnmounted } from 'vue'

export function useMouse() {
  const x = ref(0)
  const y = ref(0)

  function update(event: MouseEvent) {
    x.value = event.pageX
    y.value = event.pageY
  }

  onMounted(() => window.addEventListener('mousemove', update))
  onUnmounted(() => window.removeEventListener('mousemove', update))

  return { x, y }
}
```

```vue
<script setup>
import { useMouse } from './composables/useMouse'
const { x, y } = useMouse()
</script>

<template>
  <p>Mouse: {{ x }}, {{ y }}</p>
</template>
```

### 11.2 带参数的 composable

```ts
// composables/useFetch.ts
import { ref, watchEffect, toValue, type MaybeRefOrGetter } from 'vue'

export function useFetch<T>(url: MaybeRefOrGetter<string>) {
  const data = ref<T | null>(null)
  const error = ref<Error | null>(null)
  const loading = ref(false)

  watchEffect((onCleanup) => {
    const controller = new AbortController()
    loading.value = true

    fetch(toValue(url), { signal: controller.signal })
      .then(r => r.json())
      .then(json => { data.value = json; error.value = null })
      .catch(e => { if (e.name !== 'AbortError') error.value = e })
      .finally(() => loading.value = false)

    onCleanup(() => controller.abort())
  })

  return { data, error, loading }
}
```

```vue
<script setup>
import { useFetch } from './composables/useFetch'
import { computed } from 'vue'

const userId = ref(1)
const url = computed(() => `/api/users/${userId.value}`)
const { data: user, loading } = useFetch<User>(url)
</script>
```

### 11.3 useLocalStorage 持久化

```ts
// composables/useLocalStorage.ts
import { ref, watch } from 'vue'

export function useLocalStorage<T>(key: string, defaultValue: T) {
  const stored = localStorage.getItem(key)
  const data = ref<T>(stored ? JSON.parse(stored) : defaultValue)

  watch(data, (val) => {
    if (val === null || val === undefined) {
      localStorage.removeItem(key)
    } else {
      localStorage.setItem(key, JSON.stringify(val))
    }
  }, { deep: true })

  return data
}
```

---

## 12. Vue Router 4

### 12.1 基本配置

```ts
// router/index.ts
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('@/views/AboutView.vue'),
    },
    {
      path: '/users/:id',
      name: 'user',
      component: () => import('@/views/UserView.vue'),
      props: true,  // 将 params 作为 props 传入
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFound.vue'),
    },
  ],
})

export default router
```

### 12.2 使用

```vue
<template>
  <nav>
    <RouterLink to="/">Home</RouterLink>
    <RouterLink :to="{ name: 'about' }">About</RouterLink>
    <RouterLink :to="{ name: 'user', params: { id: 1 } }">
      User 1
    </RouterLink>
  </nav>

  <!-- 路由组件渲染位置 -->
  <RouterView />

  <!-- 命名视图（多个 RouterView） -->
  <RouterView name="sidebar" />
  <RouterView default />
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

// 编程式导航
function goToUser(id: number) {
  router.push({ name: 'user', params: { id } })
  // router.replace(...)
  // router.go(-1)  后退
  // router.back()
}

// 读取当前路由信息
console.log(route.params.id)   // params 参数
console.log(route.query.q)     // query 参数
console.log(route.hash)        // #
</script>
```

### 12.3 路由守卫

```ts
// 全局守卫
router.beforeEach((to, from) => {
  if (to.meta.requiresAuth && !isAuthenticated()) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
})

router.afterEach((to) => {
  document.title = to.meta.title as string || 'My App'
})
```

```ts
// 路由配置中的守卫
{
  path: '/admin',
  component: Admin,
  beforeEnter: (to, from) => {
    // 只在此路由触发
  },
  meta: { requiresAuth: true },
}
```

```vue
<!-- 组件内守卫 -->
<script setup>
import { onBeforeRouteLeave, onBeforeRouteUpdate } from 'vue-router'

onBeforeRouteLeave((to, from) => {
  const answer = window.confirm('确定离开吗？')
  if (!answer) return false
})

onBeforeRouteUpdate((to, from) => {
  // 路由变化但复用同一组件时触发
})
</script>
```

### 12.4 嵌套路由

```ts
{
  path: '/user/:id',
  component: UserLayout,
  children: [
    { path: '', component: UserProfile },
    { path: 'posts', component: UserPosts },
    { path: 'settings', component: UserSettings },
  ],
}
```

```vue
<!-- UserLayout.vue -->
<template>
  <div class="user-layout">
    <nav>
      <RouterLink :to="{ name: 'user-profile' }">Profile</RouterLink>
      <RouterLink :to="{ name: 'user-posts' }">Posts</RouterLink>
    </nav>
    <RouterView />
  </div>
</template>
```

---

## 13. Pinia 状态管理

### 13.1 创建 Store（Options Store 风格）

```ts
// stores/counter.ts
import { defineStore } from 'pinia'

export const useCounterStore = defineStore('counter', {
  state: () => ({
    count: 0,
  }),
  getters: {
    double: (state) => state.count * 2,
    doublePlusOne(): number {
      return this.double + 1   // this 访问其他 getter
    },
  },
  actions: {
    increment() {
      this.count++
    },
    async fetchAndSet() {
      const data = await fetch('/api/count')
      this.count = await data.json()
    },
  },
})
```

### 13.2 创建 Store（Setup Store 风格，更灵活）

```ts
// stores/user.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
  // state
  const user = ref<User | null>(null)
  const token = ref('')

  // getters
  const isLoggedIn = computed(() => !!token.value)
  const userName = computed(() => user.value?.name ?? 'Guest')

  // actions
  async function login(username: string, password: string) {
    const res = await fetch('/api/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    })
    const data = await res.json()
    token.value = data.token
    user.value = data.user
  }

  function logout() {
    token.value = ''
    user.value = null
  }

  return { user, token, isLoggedIn, userName, login, logout }
})
```

### 13.3 在组件中使用

```vue
<script setup lang="ts">
import { useCounterStore } from '@/stores/counter'
import { useUserStore } from '@/stores/user'
import { storeToRefs } from 'pinia'

const counter = useCounterStore()
const userStore = useUserStore()

// 直接使用（响应式）
console.log(counter.count)
counter.increment()

// 解构保持响应式
const { count, double } = storeToRefs(counter)
// actions 可以直接解构
const { increment } = counter
</script>

<template>
  <p>Count: {{ counter.count }} (double: {{ counter.double }})</p>
  <button @click="counter.increment">+1</button>

  <p v-if="userStore.isLoggedIn">
    Welcome, {{ userStore.userName }}
    <button @click="userStore.logout">Logout</button>
  </p>
  <button v-else @click="userStore.login('admin', '123')">Login</button>
</template>
```

### 13.4 持久化插件

```bash
pnpm add pinia-plugin-persistedstate
```

```ts
// main.ts
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

// stores/counter.ts
export const useCounterStore = defineStore('counter', {
  state: () => ({ count: 0 }),
  persist: true,  // 默认 localStorage
  // persist: { storage: sessionStorage }
})
```

### 13.5 Pinia vs Vuex 速览

| | Vuex 4 | Pinia |
|------|---------|-------|
| Module | 嵌套、命名空间 | 扁平、独立 store |
| Mutation | 必须 | 不需要 |
| TypeScript | 需额外工作 | 原生支持 |
| DevTools | ✅ | ✅ 更好 |
| 体积 | ~9KB | ~1.5KB |
| 官方推荐 | 被取代 | ✅ |

---

## 14. TypeScript 集成

### 14.1 Props + Emits 类型

```vue
<script setup lang="ts">
interface Props {
  title: string
  count?: number
  items: Item[]
  callback?: (id: number) => void
}
const props = withDefaults(defineProps<Props>(), {
  count: 0,
})

const emit = defineEmits<{
  (e: 'update', id: number): void
  (e: 'delete', id: number): void
}>()
// 或
const emit = defineEmits<{
  update: [id: number]
  delete: [id: number]
}>()
</script>
```

### 14.2 模板 Refs 类型

```vue
<script setup lang="ts">
import { useTemplateRef, onMounted } from 'vue'

// useTemplateRef（3.5+，推荐）
// 类型自动推断：HTMLInputElement | null
const inputRef = useTemplateRef<HTMLInputElement>('myInput')

// 老方式
const inputRef2 = ref<HTMLInputElement | null>(null)

onMounted(() => {
  inputRef.value?.focus()
})
</script>

<template>
  <input ref="myInput" />
</template>
```

### 14.3 组件实例类型

```vue
<script setup lang="ts">
import { ref } from 'vue'
import MyModal from './MyModal.vue'

const modalRef = ref<InstanceType<typeof MyModal> | null>(null)

function open() {
  modalRef.value?.open()   // 需要子组件 defineExpose 暴露
}
</script>

<template>
  <MyModal ref="modalRef" />
</template>
```

### 14.4 泛型组件（3.3+）

```vue
<script setup lang="ts" generic="T extends { id: number | string }">
defineProps<{
  items: T[]
  selected: T | null
}>()

defineEmits<{
  select: [item: T]
}>()
</script>
```

---

## 15. 异步组件与 Suspense

### 15.1 defineAsyncComponent

```vue
<script setup>
import { defineAsyncComponent } from 'vue'

// 基础用法
const AsyncComp = defineAsyncComponent(() =>
  import('./HeavyComponent.vue')
)

// 完整配置
const RobustComp = defineAsyncComponent({
  loader: () => import('./HeavyComponent.vue'),
  loadingComponent: LoadingSkeleton,   // 加载中组件
  errorComponent: ErrorFallback,       // 错误组件
  delay: 200,                          // 延迟显示 loading（防闪烁）
  timeout: 10000,                      // 超时
  onError(error, retry, fail, attempts) {
    if (attempts <= 3) {
      retry()   // 最多重试 3 次
    } else {
      fail()
    }
  },
})
</script>
```

### 15.2 Suspense 控制加载

```vue
<template>
  <Suspense @resolve="onResolved">
    <template #default>
      <AsyncComponent />
    </template>

    <template #fallback>
      <div class="loading">
        <Spinner />
        <p>Loading...</p>
      </div>
    </template>
  </Suspense>
</template>
```

### 15.3 批量自动化导入

```ts
// components/global.ts
import type { App } from 'vue'

// Vite 的 import.meta.glob 批量导入
const modules = import.meta.glob('./**/*.vue', { eager: true })

export function registerGlobalComponents(app: App) {
  for (const [path, mod] of Object.entries(modules)) {
    const component = (mod as any).default
    const name = component.name || path.split('/').pop()?.replace('.vue', '')
    app.component(name, component)
  }
}
```

---

## 16. Vue 3.5 新特性

### 16.1 useTemplateRef —— 模板引用新方式

比老 `ref(null)` 方式更灵活，支持动态 ref 名。

```vue
<script setup>
import { useTemplateRef, onMounted } from 'vue'

const input = useTemplateRef('myInput')
// 类型自动推断，无需手动写 null

onMounted(() => {
  input.value?.focus()
})
</script>

<template>
  <input ref="myInput" />
</template>
```

### 16.2 响应式 Props 解构

3.5 的重大改进：`defineProps` 解构后**保持响应式**。

```vue
<script setup lang="ts">
// 3.4 及之前会丢失响应式，必须 toRefs
// 3.5 起直接解构即可
const { title, count = 0 } = defineProps<{
  title: string
  count?: number
}>()

// title 和 count 在模板和 computed/watch 中都保持响应式
watch(() => count, () => { /* ✅ 正常工作 */ })
</script>

<template>
  <h1>{{ title }}</h1>
</template>
```

### 16.3 useId —— 生成唯一 ID

服务端渲染友好的唯一 ID 生成。

```vue
<script setup>
import { useId } from 'vue'

const id = useId()  // 如 "v-0"
</script>

<template>
  <label :for="id">Name:</label>
  <input :id="id" type="text" />
</template>
```

### 16.4 Teleport defer

目标元素可以在 Teleport 之后才渲染。

```vue
<template>
  <!-- 3.5 前报错，3.5 加上 defer 即可 -->
  <Teleport defer to="#modal-container">
    <Modal />
  </Teleport>

  <!-- 目标可以在后面 -->
  <div id="modal-container" />
</template>
```

### 16.5 响应式系统重构

| 指标 | 3.4 | 3.5 |
|------|-----|-----|
| 响应式对象内存 | 48 bytes | 16 bytes（-66%） |
| 大型列表渲染 | 基准 | ~5 倍快 |
| 深层对象更新 | 基准 | ~11 倍快 |

---

## 17. API 速查表

### 响应式 API

| API | 说明 |
|-----|------|
| `ref(val)` | 创建响应式引用 |
| `reactive(obj)` | 创建响应式对象 |
| `computed(getter)` | 计算属性 |
| `readonly(obj)` | 只读代理 |
| `shallowRef(val)` | 浅层 ref |
| `triggerRef(ref)` | 手动触发 shallowRef 更新 |
| `customRef(fn)` | 自定义 ref |
| `toRef(obj, key)` | 为 reactive 对象的属性创建 ref |
| `toRefs(obj)` | 为 reactive 对象所有属性创建 refs |
| `isRef(val)` | 判断是否为 ref |
| `unref(val)` | 取出 ref 的值 |
| `markRaw(obj)` | 标记为非响应式 |
| `effectScope()` | 创建副作用作用域 |
| `isReactive(obj)` | 判断是否 reactive |
| `isReadonly(obj)` | 判断是否只读 |
| `isProxy(obj)` | 判断是否 reactive 或 readonly |

### 侦听器

| API | 说明 |
|-----|------|
| `watch(source, callback, options?)` | 侦听数据变化 |
| `watchEffect(fn, options?)` | 自动追踪依赖 |
| `watchPostEffect(fn)` | DOM 更新后执行 |
| `watchSyncEffect(fn)` | 同步执行 |

### 生命周期

| API | 对应 Options |
|-----|-------------|
| `onBeforeMount` | beforeMount |
| `onMounted` | mounted |
| `onBeforeUpdate` | beforeUpdate |
| `onUpdated` | updated |
| `onBeforeUnmount` | beforeUnmount |
| `onUnmounted` | unmounted |
| `onActivated` | activated (KeepAlive) |
| `onDeactivated` | deactivated (KeepAlive) |
| `onErrorCaptured` | errorCaptured |

### 组合式函数

| API | 说明 |
|-----|------|
| `provide(key, value)` | 提供依赖 |
| `inject(key, default?)` | 注入依赖 |
| `useSlots()` | 访问插槽 |
| `useAttrs()` | 访问透传属性 |
| `useTemplateRef(key)` | 模板 ref（3.5+） |
| `useId()` | 生成唯一 ID（3.5+） |

### `<script setup>` 宏

| 宏 | 说明 | 版本 |
|-----|------|------|
| `defineProps` | 声明 props | 3.0 |
| `defineEmits` | 声明 emits | 3.0 |
| `defineExpose` | 暴露组件 API | 3.0 |
| `defineOptions` | 声明组件选项 | 3.3 |
| `defineSlots` | 声明插槽类型 | 3.3 |
| `defineModel` | 简化 v-model | 3.4 |

---

## 18. 实战：从零写一个应用

### 18.1 项目初始化

```bash
pnpm create vue@latest my-blog
cd my-blog
pnpm install
pnpm add better-sqlite3    # 如果需要本地数据库
```

### 18.2 路由结构

```ts
// router/index.ts
const routes = [
  {
    path: '/',
    component: () => import('@/layouts/DefaultLayout.vue'),
    children: [
      { path: '', name: 'home', component: () => import('@/views/Home.vue') },
      { path: 'posts/:slug', name: 'post', component: () => import('@/views/Post.vue'), props: true },
      { path: 'about', name: 'about', component: () => import('@/views/About.vue') },
    ],
  },
  {
    path: '/admin',
    component: () => import('@/layouts/AdminLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', name: 'dashboard', component: () => import('@/views/admin/Dashboard.vue') },
      { path: 'posts/new', name: 'new-post', component: () => import('@/views/admin/PostEditor.vue') },
      { path: 'posts/:id/edit', name: 'edit-post', component: () => import('@/views/admin/PostEditor.vue'), props: true },
    ],
  },
]
```

### 18.3 请求封装 composable

```ts
// composables/useAPI.ts
import { ref, type Ref } from 'vue'

interface APIState<T> {
  data: Ref<T | null>
  error: Ref<Error | null>
  loading: Ref<boolean>
  execute: (...args: any[]) => Promise<void>
}

export function useAPI<T>(
  fn: (...args: any[]) => Promise<T>
): APIState<T> {
  const data = ref<T | null>(null) as Ref<T | null>
  const error = ref<Error | null>(null)
  const loading = ref(false)

  async function execute(...args: any[]) {
    loading.value = true
    error.value = null
    try {
      data.value = await fn(...args)
    } catch (e) {
      error.value = e as Error
    } finally {
      loading.value = false
    }
  }

  return { data, error, loading, execute }
}
```

```vue
<script setup lang="ts">
import { useAPI } from '@/composables/useAPI'
import { getPosts } from '@/api/posts'

const { data: posts, loading, execute } = useAPI(getPosts)
onMounted(() => execute())
</script>

<template>
  <div v-if="loading">Loading...</div>
  <div v-else>
    <article v-for="post in posts" :key="post.id">
      <h2>{{ post.title }}</h2>
    </article>
  </div>
</template>
```

### 18.4 一个完整的搜索组件

```vue
<script setup lang="ts">
import { ref, watch } from 'vue'

const keyword = ref('')
const results = ref<string[]>([])
const loading = ref(false)

// 防抖搜索
watch(keyword, async (val, _oldVal, onCleanup) => {
  if (!val.trim()) {
    results.value = []
    return
  }

  let aborted = false
  onCleanup(() => { aborted = true })

  loading.value = true
  // 模拟搜索 API
  await new Promise(r => setTimeout(r, 300))
  if (!aborted) {
    results.value = [`Result for "${val}": item 1`, `item 2`, `item 3`]
    loading.value = false
  }
})
</script>

<template>
  <div>
    <input
      v-model="keyword"
      placeholder="Search..."
      class="search-input"
    />
    <span v-if="loading">Searching...</span>
    <ul v-if="results.length">
      <li v-for="(item, i) in results" :key="i">{{ item }}</li>
    </ul>
    <p v-else-if="keyword && !loading">
      No results for "{{ keyword }}"
    </p>
  </div>
</template>

<style scoped>
.search-input {
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  width: 300px;
}
</style>
```

---

## 19. 注意事项与常见陷阱

1. **ref 在模板中自动解包，在 `<script>` 中不自动解包**：模板 `{{ count }}` 不需要 `.value`，但 JS 中永远是 `count.value`。
2. **reactive 不能整体替换**：`state = {}` 会断开响应式。需要替换用 ref 包装。
3. **reactive 解构丢失响应式**：用 `toRefs` 或在 Vue 3.5 中直接从 `defineProps` 解构。
4. **`<script setup>` 中不需要 return**：顶级绑定自动暴露给模板，但不能访问 `this`。
5. **`watch` 侦听 reactive 属性用 getter 函数**：`watch(() => state.count, cb)` 而不是 `watch(state.count, cb)`。
6. **`watchEffect` 在组件 setup 中会立即执行一次**：确保内部逻辑处理初始状态。
7. **异步组件必须包裹在 `<Suspense>` 中才能显示 fallback**：单独使用 `defineAsyncComponent` 不会显示 loading。
8. **KeepAlive 缓存组件要注意内存**：设置 `:max` 限制最大缓存数。
9. **v-for 必须绑定 key**：不绑定会导致更新 bug 和性能问题。key 应该是唯一标识，不能用 index。
10. **`v-if` 和 `v-for` 不要同时用在一个元素上**：`v-if` 优先级更高会导致 v-for 中的变量不可用。用 `<template>` 包 v-for，在上面判断 v-if。
11. **Pinia state 可以通过 `store.$patch` 批量修改**：`store.$patch({ a: 1, b: 2 })` 一次触发多个变更。
12. **路由懒加载组件会被单独打包成 chunk**：无需额外配置，`() => import()` 语法即可。
13. **scoped 样式中修改子组件**：用 `:deep(.child-class) { ... }` 穿透。
14. **props 是单向数据流**：子组件不应修改 props，应通过 emit 通知父组件，或使用 `defineModel`。
15. **避免在 `onUpdated` 中修改数据**：容易造成无限循环。优先用 `computed` 或 `watch`。
