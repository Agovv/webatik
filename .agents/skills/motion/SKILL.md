---
name: motion
description: Animates React, Vue, and JavaScript UIs with gestures, scroll effects, spring physics, and layout transitions. Use when building drag-and-drop, hover effects, scroll animations, modals, carousels, or troubleshooting AnimatePresence exit issues.
---

# Motion Animation Library

Motion (package: `motion`, formerly `framer-motion`) is the industry-standard animation library for JavaScript, React, and Vue.

## Installation

```bash
npm install motion      # React/JS
npm install motion-v    # Vue
```

## Platform Quick Reference

### JavaScript

```javascript
import { animate, scroll, inView, stagger, hover, press } from "motion"

// Basic animation
animate("#box", { x: 100, opacity: 1 })

// With spring physics
animate(element, { scale: 1.2 }, { type: "spring", stiffness: 300, damping: 30 })

// Staggered list
animate("li", { opacity: 1 }, { delay: stagger(0.1) })

// Scroll-linked
scroll(animate("#progress", { scaleX: [0, 1] }))

// Viewport detection
inView(".card", ({ target }) => {
  animate(target, { opacity: 1, y: 0 })
})

// Gestures
hover(".btn", el => {
  animate(el, { scale: 1.1 })
  return () => animate(el, { scale: 1 })
})

press(".btn", el => {
  animate(el, { scale: 0.95 })
  return () => animate(el, { scale: 1 })
})
```

### React

```tsx
import { motion, AnimatePresence, useScroll, useTransform } from "motion/react"

// Basic motion component
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0 }}
  transition={{ type: "spring" }}
/>

// Gestures
<motion.button
  whileHover={{ scale: 1.1 }}
  whileTap={{ scale: 0.95 }}
  drag="x"
  dragConstraints={{ left: 0, right: 100 }}
/>

// Layout animations
<motion.div layout layoutId="shared-element" />

// Scroll animations
const { scrollYProgress } = useScroll()
const y = useTransform(scrollYProgress, [0, 1], [0, -300])
<motion.div style={{ y }} />
```

### Vue

```vue
<script setup>
import { motion, AnimatePresence } from "motion-v"
</script>

<template>
  <motion.div
    :initial="{ opacity: 0 }"
    :animate="{ opacity: 1 }"
    :exit="{ opacity: 0 }"
    :whileHover="{ scale: 1.1 }"
  />
</template>
```

## Core APIs

| API | Platform | Description |
|-----|----------|-------------|
| `animate()` | All | Animate elements with spring/tween |
| `scroll()` | JS | Scroll-linked animations |
| `inView()` | JS | Viewport detection |
| `hover()` | JS | Hover gesture |
| `press()` | JS | Press/tap gesture |
| `stagger()` | All | Stagger delays |

### React-Specific

| API | Description |
|-----|-------------|
| `motion.div` | Motion-enhanced elements |
| `AnimatePresence` | Exit animations |
| `LayoutGroup` | Coordinate layout animations |
| `LazyMotion` | Bundle optimization (~4.6kb) |
| `useMotionValue()` | Reactive animation values |
| `useTransform()` | Derived motion values |
| `useSpring()` | Spring-animated values |
| `useScroll()` | Scroll progress |
| `useAnimate()` | Imperative control |

## Transition Options

### Spring (Physics-based)

```javascript
{
  type: "spring",
  stiffness: 300,    // Higher = snappier
  damping: 30,       // Higher = less bounce
  mass: 1,           // Higher = more momentum
  bounce: 0.25,      // 0-1, alternative to stiffness/damping
  visualDuration: 0.5
}
```

### Tween (Duration-based)

```javascript
{
  duration: 0.5,
  ease: "easeInOut", // or cubic bezier [0.4, 0, 0.2, 1]
  delay: 0.2,
  repeat: Infinity,
  repeatType: "reverse" // "loop" | "mirror"
}
```

### Easing Functions

`"linear"`, `"easeIn"`, `"easeOut"`, `"easeInOut"`, `"circIn"`, `"circOut"`, `"backIn"`, `"backOut"`, `"anticipate"`

## Common Patterns

### AnimatePresence (Exit Animations)

```tsx
// CRITICAL: AnimatePresence must stay mounted, children need unique keys
<AnimatePresence>
  {isVisible && (
    <motion.div
      key="modal"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    />
  )}
</AnimatePresence>
```

### Layout Animations

```tsx
<motion.div layout>
  {isExpanded ? <FullContent /> : <Summary />}
</motion.div>

// Shared element transitions
<motion.div layoutId="card-123" />
```

### Scroll Animations

```tsx
// Viewport-triggered
<motion.div
  initial={{ opacity: 0, y: 50 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, margin: "-100px" }}
/>

// Scroll-linked
const { scrollYProgress } = useScroll()
const y = useTransform(scrollYProgress, [0, 1], [0, -300])
<motion.div style={{ y }} />
```

### Drag Gestures

```tsx
<motion.div
  drag="x"
  dragConstraints={{ left: 0, right: 300 }}
  dragElastic={0.2}
  dragMomentum={true}
  dragSnapToOrigin
/>
```

### SVG Line Drawing

```tsx
<motion.path
  initial={{ pathLength: 0 }}
  animate={{ pathLength: 1 }}
  transition={{ duration: 2, ease: "easeInOut" }}
/>
```

### Variants (Orchestration)

```tsx
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

<motion.ul variants={container} initial="hidden" animate="show">
  <motion.li variants={item} />
  <motion.li variants={item} />
</motion.ul>
```

## Performance

### Bundle Size Optimization

```tsx
// Full bundle: ~34 KB
import { motion } from "motion/react"

// Optimized: ~4.6 KB
import { LazyMotion, domAnimation, m } from "motion/react"

<LazyMotion features={domAnimation}>
  <m.div animate={{ x: 100 }} />
</LazyMotion>

// Minimal: 2.3 KB
import { useAnimate } from "motion/react"
```

### Avoid Tailwind Conflicts

```tsx
// WRONG - causes stuttering
<motion.div className="transition-all" animate={{ x: 100 }} />

// CORRECT
<motion.div animate={{ x: 100 }} />
```

## Next.js Integration

### App Router (RSC)

```tsx
// components/motion-client.tsx
"use client"
import * as motion from "motion/react-client"
export { motion }

// app/page.tsx
import { motion } from "@/components/motion-client"
```

### Direct Client Component

```tsx
"use client"
import { motion } from "motion/react"
```

## Accessibility

```tsx
import { MotionConfig } from "motion/react"

<MotionConfig reducedMotion="user">
  <App />
</MotionConfig>
```

## Troubleshooting

### AnimatePresence Exit Not Working

**Problem**: Exit animations don't play
**Causes**:
1. AnimatePresence unmounts with child
2. Missing unique `key` prop
3. Child not direct descendant

**Solution**:
```tsx
// WRONG
{isVisible && <AnimatePresence><motion.div /></AnimatePresence>}

// CORRECT
<AnimatePresence>
  {isVisible && <motion.div key="unique" exit={{ opacity: 0 }} />}
</AnimatePresence>
```

### Scrollable Container Layout Issues

```tsx
<motion.div layoutScroll style={{ overflow: "auto" }}>
  <motion.div layout />
</motion.div>
```

### Fixed Position Layout Issues

```tsx
<motion.div layoutRoot style={{ position: "fixed" }}>
  <motion.div layout />
</motion.div>
```

### Layout Scale Distortion

```tsx
// Set borderRadius/boxShadow via style for scale correction
<motion.div layout style={{ borderRadius: 20, boxShadow: "..." }} />
```

### Large List Performance

Use virtualization libraries: `react-window`, `react-virtuoso`, `@tanstack/react-virtual`

## Reference Documentation

See `reference/` folder for detailed platform-specific docs:
- `reference/react.md` - React components and hooks
- `reference/javascript.md` - Vanilla JS APIs
- `reference/vue.md` - Vue directives and components
- `reference/examples.md` - Example index by category

## Resources

- [Official Docs](https://motion.dev/docs)
- [Examples Gallery](https://motion.dev/examples)
- [GitHub](https://github.com/motiondivision/motion)
