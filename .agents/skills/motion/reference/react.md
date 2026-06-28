# Motion for React Reference

## Components

### motion.* (motion.div, motion.button, etc.)

Motion-enhanced HTML/SVG elements with animation superpowers.

```tsx
import { motion } from "motion/react"

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0 }}
  transition={{ type: "spring", stiffness: 300 }}
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  whileFocus={{ borderColor: "#3b82f6" }}
  whileInView={{ opacity: 1 }}
  whileDrag={{ scale: 1.1 }}
  drag="x"
  dragConstraints={{ left: 0, right: 200 }}
  layout
  layoutId="shared-element"
  style={{ x: motionValue }}
/>
```

#### Props

**Animation**
- `initial` - Initial state (object or variant name)
- `animate` - Target state (object or variant name)
- `exit` - Exit state (requires AnimatePresence)
- `transition` - Animation configuration
- `variants` - Named animation states

**Gestures**
- `whileHover` - State while hovering
- `whileTap` / `whilePress` - State while pressed
- `whileFocus` - State while focused
- `whileDrag` - State while dragging
- `whileInView` - State while in viewport
- `drag` - Enable dragging (`true`, `"x"`, `"y"`)
- `dragConstraints` - Drag boundaries
- `dragElastic` - Elasticity (0-1)
- `dragMomentum` - Enable inertia after drag

**Layout**
- `layout` - Enable layout animations (`true`, `"position"`, `"size"`)
- `layoutId` - Shared element ID for cross-component animations
- `layoutScroll` - Account for scroll in layout animations
- `layoutRoot` - Mark as position fixed root

**Events**
- `onAnimationStart` / `onAnimationComplete`
- `onHoverStart` / `onHoverEnd`
- `onTap` / `onTapStart` / `onTapCancel`
- `onDrag` / `onDragStart` / `onDragEnd`
- `onViewportEnter` / `onViewportLeave`

### AnimatePresence

Enables exit animations when components unmount.

```tsx
import { AnimatePresence, motion } from "motion/react"

<AnimatePresence
  mode="sync"        // "sync" | "wait" | "popLayout"
  initial={true}     // Enable initial animations
  onExitComplete={() => {}}
>
  {isVisible && (
    <motion.div
      key="modal"    // Required unique key
      exit={{ opacity: 0, scale: 0.9 }}
    />
  )}
</AnimatePresence>
```

**Modes:**
- `sync` (default) - Enter and exit simultaneously
- `wait` - Wait for exit before enter
- `popLayout` - Pop exiting element from layout flow

### LayoutGroup

Synchronizes layout animations across sibling components.

```tsx
import { LayoutGroup, motion } from "motion/react"

<LayoutGroup id="group-id">
  <Accordion />
  <Accordion />
</LayoutGroup>
```

### LazyMotion

Reduces bundle size by loading features on demand.

```tsx
import { LazyMotion, domAnimation, m } from "motion/react"

// domAnimation: ~18kb (no drag/layout)
// domMax: ~28kb (all features)

<LazyMotion features={domAnimation} strict>
  <m.div animate={{ x: 100 }} />
</LazyMotion>
```

### MotionConfig

Global animation configuration.

```tsx
import { MotionConfig } from "motion/react"

<MotionConfig
  transition={{ type: "spring", stiffness: 300 }}
  reducedMotion="user" // "user" | "always" | "never"
>
  <App />
</MotionConfig>
```

## Hooks

### useMotionValue

Create a mutable value that doesn't trigger re-renders.

```tsx
import { useMotionValue, motion } from "motion/react"

const x = useMotionValue(0)

// Read/write
x.get()
x.set(100)

// Subscribe to changes
x.on("change", latest => console.log(latest))

<motion.div style={{ x }} />
```

### useTransform

Derive values from other motion values.

```tsx
import { useMotionValue, useTransform } from "motion/react"

const x = useMotionValue(0)

// Map range
const opacity = useTransform(x, [-100, 0, 100], [0, 1, 0])

// Custom function
const rotate = useTransform(x, value => value * 2)

// Combine multiple
const combined = useTransform([x, y], ([x, y]) => x + y)
```

### useSpring

Create spring-animated motion value.

```tsx
import { useSpring, useMotionValue } from "motion/react"

const x = useMotionValue(0)
const springX = useSpring(x, {
  stiffness: 300,
  damping: 30,
  mass: 1
})
```

### useScroll

Track scroll position and progress.

```tsx
import { useScroll, useTransform, motion } from "motion/react"

// Page scroll
const { scrollY, scrollYProgress } = useScroll()

// Element scroll
const { scrollYProgress } = useScroll({
  target: ref,
  offset: ["start end", "end start"]
})

const y = useTransform(scrollYProgress, [0, 1], [0, -200])
```

**Offset Values:**
- `"start"`, `"center"`, `"end"` - Element edges
- `0`, `0.5`, `1` - Proportions
- `"100px"` - Pixel values

### useAnimate

Imperative animation control.

```tsx
import { useAnimate } from "motion/react"

const [scope, animate] = useAnimate()

// Animate within scope
await animate("li", { opacity: 1 }, { delay: stagger(0.1) })

// Sequence
await animate([
  ["li", { opacity: 1 }],
  [".box", { x: 100 }]
])

<div ref={scope}>
  <li />
  <div className="box" />
</div>
```

### useInView

Detect element viewport intersection.

```tsx
import { useInView } from "motion/react"

const ref = useRef(null)
const isInView = useInView(ref, {
  once: true,
  margin: "-100px",
  amount: "some" // "some" | "all" | 0-1
})

<div ref={ref} />
```

### useVelocity

Track velocity of a motion value.

```tsx
import { useMotionValue, useVelocity } from "motion/react"

const x = useMotionValue(0)
const velocity = useVelocity(x)
```

### useDragControls

Programmatic drag control.

```tsx
import { useDragControls, motion } from "motion/react"

const controls = useDragControls()

<div onPointerDown={e => controls.start(e)}>Drag handle</div>
<motion.div drag dragControls={controls} dragListener={false} />
```

## Motion Values

Motion values are reactive animation primitives that update outside React's render cycle.

```tsx
import {
  useMotionValue,
  useTransform,
  useSpring,
  useVelocity,
  useMotionValueEvent
} from "motion/react"

const x = useMotionValue(0)

// Subscribe to changes (hook)
useMotionValueEvent(x, "change", latest => {
  console.log(latest)
})

// Subscribe to animation events
useMotionValueEvent(x, "animationStart", () => {})
useMotionValueEvent(x, "animationComplete", () => {})
```

## Scroll Animations

### Scroll-Triggered

```tsx
<motion.div
  initial={{ opacity: 0, y: 50 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{
    once: true,
    margin: "-100px 0px",
    amount: 0.5
  }}
/>
```

### Scroll-Linked

```tsx
const { scrollYProgress } = useScroll()

// Parallax
const y = useTransform(scrollYProgress, [0, 1], [0, -300])

// Color transition
const bg = useTransform(
  scrollYProgress,
  [0, 0.5, 1],
  ["#ff0000", "#00ff00", "#0000ff"]
)
```

### Element Progress

```tsx
const ref = useRef(null)
const { scrollYProgress } = useScroll({
  target: ref,
  offset: ["start end", "end start"]
})

<motion.div ref={ref} style={{ opacity: scrollYProgress }} />
```

## Custom Components

```tsx
// Wrap custom components
const MotionButton = motion(Button)

// Or with create
const MotionButton = motion.create(Button)

// Forward motion props
const MotionButton = motion.create(Button, { forwardMotionProps: true })
```

## Server Components (Next.js)

```tsx
// components/motion-client.tsx
"use client"
import * as motion from "motion/react-client"
export { motion }

// app/page.tsx (Server Component)
import { motion } from "@/components/motion-client"
```
