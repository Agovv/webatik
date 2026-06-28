# Motion for Vue Reference

## Installation

```bash
npm install motion-v
```

### Nuxt

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['motion-v/nuxt']
})
```

### Vite Auto-Import

```typescript
import Components from 'unplugin-vue-components/vite'
import MotionResolver from 'motion-v/resolver'

export default defineConfig({
  plugins: [
    vue(),
    Components({
      resolvers: [MotionResolver()]
    })
  ]
})
```

## motion Component

```vue
<script setup>
import { motion } from "motion-v"
</script>

<template>
  <motion.div
    :initial="{ opacity: 0, y: 20 }"
    :animate="{ opacity: 1, y: 0 }"
    :exit="{ opacity: 0 }"
    :transition="{ type: 'spring', stiffness: 300 }"
    :whileHover="{ scale: 1.05 }"
    :whilePress="{ scale: 0.95 }"
    :whileFocus="{ borderColor: '#3b82f6' }"
    :whileInView="{ opacity: 1 }"
    :inViewOptions="{ once: true }"
    :whileDrag="{ scale: 1.1 }"
    drag="x"
    :dragConstraints="{ left: 0, right: 200 }"
    layout
    layoutId="shared-element"
    :style="{ x: motionValue }"
  />
</template>
```

### Props

**Animation**
- `:initial` - Initial state
- `:animate` - Target state
- `:exit` - Exit state (requires AnimatePresence)
- `:transition` - Animation configuration
- `:variants` - Named animation states

**Gestures**
- `:whileHover` - Hover state
- `:whilePress` - Press state
- `:whileFocus` - Focus state
- `:whileDrag` - Drag state
- `:whileInView` - In-viewport state
- `drag` - Enable drag (`true`, `"x"`, `"y"`)
- `:dragConstraints` - Drag boundaries
- `:dragElastic` - Elasticity (0-1)

**Layout**
- `layout` - Enable layout animations
- `layoutId` - Shared element ID
- `layoutScroll` - For scrollable containers
- `layoutRoot` - For fixed position elements

**Events**
- `@animationStart` / `@animationComplete`
- `@hoverStart` / `@hoverEnd`
- `@press` / `@pressStart` / `@pressCancel`
- `@drag` / `@dragStart` / `@dragEnd`
- `@viewportEnter` / `@viewportLeave`

### Motion Primitive

```vue
<script setup>
import { Motion } from "motion-v"
</script>

<template>
  <!-- Render as specific element -->
  <Motion as="button" :whileHover="{ scale: 1.1 }">
    Click me
  </Motion>

  <!-- Use child as element -->
  <Motion as-child :whileHover="{ scale: 1.1 }">
    <button>Click me</button>
  </Motion>
</template>
```

### Custom Components

```vue
<script setup>
import { motion } from "motion-v"
import MyButton from "./MyButton.vue"

const MotionButton = motion.create(MyButton)
</script>

<template>
  <MotionButton :whileHover="{ scale: 1.1 }" />
</template>
```

## AnimatePresence

```vue
<script setup>
import { AnimatePresence, motion } from "motion-v"
import { ref } from "vue"

const isVisible = ref(true)
</script>

<template>
  <AnimatePresence
    mode="sync"
    :initial="true"
    @exitComplete="() => {}"
  >
    <motion.div
      v-if="isVisible"
      key="modal"
      :initial="{ opacity: 0, scale: 0.9 }"
      :animate="{ opacity: 1, scale: 1 }"
      :exit="{ opacity: 0, scale: 0.9 }"
    />
  </AnimatePresence>
</template>
```

**Modes:**
- `sync` - Enter and exit simultaneously
- `wait` - Wait for exit before enter
- `popLayout` - Pop from layout flow

**Important:**
- Direct children need unique `key` prop
- AnimatePresence must stay mounted
- Use `v-if` or `v-show` on children, not AnimatePresence

## LayoutGroup

```vue
<script setup>
import { LayoutGroup } from "motion-v"
</script>

<template>
  <LayoutGroup>
    <Accordion />
    <Accordion />
  </LayoutGroup>
</template>
```

For namespacing layoutId:

```vue
<LayoutGroup :id="tabGroupId">
  <Tab v-for="tab in tabs" :key="tab.id" v-bind="tab" />
</LayoutGroup>
```

## LazyMotion

```vue
<script setup>
import { LazyMotion, domAnimation, m } from "motion-v"
</script>

<template>
  <LazyMotion :features="domAnimation">
    <m.div :animate="{ x: 100 }" />
  </LazyMotion>
</template>
```

Features:
- `domAnimation` (~18kb) - animations, variants, gestures
- `domMax` (~28kb) - plus drag, layout

## MotionConfig

```vue
<script setup>
import { MotionConfig } from "motion-v"
</script>

<template>
  <MotionConfig
    :transition="{ type: 'spring', stiffness: 300 }"
    reducedMotion="user"
  >
    <App />
  </MotionConfig>
</template>
```

## Composables

### useMotionValue

```vue
<script setup>
import { useMotionValue, motion } from "motion-v"

const x = useMotionValue(0)

// Read/write
x.get()
x.set(100)
</script>

<template>
  <motion.div :style="{ x }" />
</template>
```

### useTransform

```vue
<script setup>
import { useMotionValue, useTransform } from "motion-v"

const x = useMotionValue(0)
const opacity = useTransform(x, [-100, 0, 100], [0, 1, 0])
const rotate = useTransform(x, value => value * 2)
</script>
```

### useSpring

```vue
<script setup>
import { useMotionValue, useSpring } from "motion-v"

const x = useMotionValue(0)
const springX = useSpring(x, {
  stiffness: 300,
  damping: 30
})
</script>
```

### useScroll

```vue
<script setup>
import { useScroll, useTransform, motion } from "motion-v"

// Page scroll
const { scrollYProgress } = useScroll()

// Element scroll
const containerRef = ref(null)
const { scrollYProgress } = useScroll({
  target: containerRef,
  offset: ["start end", "end start"]
})

const y = useTransform(scrollYProgress, [0, 1], [0, -200])
</script>

<template>
  <motion.div :style="{ y }" />
</template>
```

### useAnimate

```vue
<script setup>
import { useAnimate } from "motion-v"
import { watch } from "vue"

const [scope, animate] = useAnimate()

watch(scope, () => {
  const controls = animate([
    [scope.current, { x: "100%" }],
    ["li", { opacity: 1 }]
  ])
  
  controls.speed = 0.8
  
  return () => controls.stop()
})
</script>

<template>
  <ul ref="scope">
    <li />
    <li />
  </ul>
</template>
```

### useInView

```vue
<script setup>
import { useInView } from "motion-v"
import { ref } from "vue"

const elementRef = ref(null)
const isInView = useInView(elementRef, {
  once: true,
  margin: "-100px"
})
</script>
```

### useDomRef

For drag constraints with refs:

```vue
<script setup>
import { useDomRef, motion } from "motion-v"

const constraintsRef = useDomRef()
</script>

<template>
  <motion.div ref="constraintsRef">
    <motion.div drag :dragConstraints="constraintsRef" />
  </motion.div>
</template>
```

### useDragControls

```vue
<script setup>
import { useDragControls, motion } from "motion-v"

const dragControls = useDragControls()

function startDrag(event) {
  dragControls.start(event, { snapToCursor: true })
}
</script>

<template>
  <div @pointerDown="startDrag">Drag handle</div>
  <motion.div drag="x" :dragControls="dragControls" :dragListener="false" />
</template>
```

## Variants

```vue
<script setup>
const variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1 }
  })
}
</script>

<template>
  <motion.ul initial="hidden" animate="visible">
    <motion.li
      v-for="(item, i) in items"
      :key="item.id"
      :variants="variants"
      :custom="i"
    />
  </motion.ul>
</template>
```

### Orchestration

```javascript
const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.1,
      delayChildren: 0.3
    }
  }
}
```

## Animate Content (RowValue)

```vue
<script setup>
import { useMotionValue, animate, RowValue, motion } from "motion-v"
import { onMounted, onUnmounted } from "vue"

const count = useMotionValue(0)
let controls

onMounted(() => {
  controls = animate(count, 100, { duration: 5 })
})

onUnmounted(() => {
  controls?.stop()
})
</script>

<template>
  <motion.pre><RowValue :value="count" /></motion.pre>
</template>
```

## Transition Options

### Spring

```javascript
{
  type: "spring",
  stiffness: 300,
  damping: 30,
  mass: 1,
  bounce: 0.25,
  visualDuration: 0.5
}
```

### Tween

```javascript
{
  duration: 0.5,
  ease: "easeInOut",
  delay: 0.2,
  repeat: Infinity,
  repeatType: "reverse"
}
```

### Value-Specific

```javascript
{
  default: { type: "spring" },
  opacity: { duration: 0.2, ease: "linear" }
}
```

## Server-Side Rendering

Motion for Vue is SSR compatible:

```vue
<!-- Server outputs initial state -->
<motion.div :initial="false" :animate="{ x: 100 }" />
```
