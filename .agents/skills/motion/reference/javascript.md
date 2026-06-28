# Motion for JavaScript Reference

## Installation

```bash
npm install motion
```

## Core Functions

### animate()

Animate any element, selector, or value.

```javascript
import { animate } from "motion"

// Element/selector
animate("#box", { x: 100, opacity: 1 })

// With options
const controls = animate(
  ".items",
  { scale: [0, 1], opacity: 1 },
  {
    duration: 0.5,
    delay: 0.2,
    ease: "easeOut",
    repeat: 2,
    repeatType: "reverse"
  }
)

// Spring animation
animate(element, { x: 100 }, {
  type: "spring",
  stiffness: 300,
  damping: 30,
  mass: 1
})

// Value animation
animate(0, 100, {
  duration: 1,
  onUpdate: value => console.log(value)
})

// Motion value
const x = motionValue(0)
animate(x, 100)
```

#### Animation Controls

```javascript
const controls = animate(...)

controls.play()
controls.pause()
controls.stop()
controls.cancel()
controls.complete()
controls.time = 0.5       // Seek to time
controls.speed = 2        // Playback speed
await controls            // Wait for completion
```

### scroll()

Create scroll-linked animations.

```javascript
import { animate, scroll } from "motion"

// Page scroll progress
scroll(animate("#progress", { scaleX: [0, 1] }))

// Element scroll progress
scroll(
  animate("#box", { opacity: [0, 1, 1, 0] }),
  {
    target: document.querySelector("#container"),
    offset: ["start end", "end start"]
  }
)

// Custom scroll handler
scroll(({ y }) => {
  // y.current, y.progress, y.velocity
  element.style.transform = `translateY(${y.progress * 100}px)`
})

// With axis
scroll(info => {}, { axis: "x" })
```

### inView()

Detect element viewport intersection.

```javascript
import { inView, animate } from "motion"

// Basic usage
inView(".card", (info) => {
  // info.target is the element
  animate(info.target, { opacity: 1, y: 0 })
  
  // Return cleanup function for exit
  return () => animate(info.target, { opacity: 0, y: 50 })
})

// With options
inView(
  elements,
  callback,
  {
    root: scrollContainer,  // Viewport element
    margin: "-100px 0px",   // Intersection margin
    amount: "all"           // "some" | "all" | 0-1
  }
)

// Stop observing
const stop = inView(...)
stop()
```

### hover()

Detect hover gestures (filters touch emulation).

```javascript
import { hover, animate } from "motion"

hover(".button", (element) => {
  // Hover start
  animate(element, { scale: 1.1 })
  
  // Return hover end handler
  return () => animate(element, { scale: 1 })
})

// With event info
hover(element, (element, event) => {
  console.log(event.clientX, event.clientY)
})
```

### press()

Detect press/tap gestures (filters right-clicks, secondary touches).

```javascript
import { press, animate } from "motion"

press(".button", (element, event) => {
  // Press start
  animate(element, { scale: 0.95 })
  
  // Return press end handler
  return (element, event, info) => {
    // info.success - true if released on element
    animate(element, { scale: 1 })
  }
})
```

### stagger()

Create staggered delays.

```javascript
import { animate, stagger } from "motion"

// Basic stagger
animate("li", { opacity: 1 }, { delay: stagger(0.1) })

// With options
animate("li", { opacity: 1 }, {
  delay: stagger(0.1, {
    startDelay: 0.5,     // Initial delay
    from: "center",      // "first" | "center" | "last" | number
    ease: "easeOut"      // Easing for delay distribution
  })
})
```

## Motion Values

Reactive animation primitives.

```javascript
import { motionValue, animate } from "motion"

const x = motionValue(0)

// Get/set
x.get()
x.set(100)

// Subscribe
const unsubscribe = x.on("change", latest => {
  element.style.transform = `translateX(${latest}px)`
})

// Animate
animate(x, 100, { type: "spring" })

// Velocity
x.getVelocity()
```

### transform()

Map values between ranges.

```javascript
import { transform } from "motion"

// Create mapper
const mapRange = transform([0, 100], [0, 1])
mapRange(50) // 0.5

// Clamp output
const clamped = transform([0, 100], [0, 1], { clamp: true })
clamped(150) // 1

// With easing
const eased = transform([0, 100], [0, 1], { ease: "easeOut" })

// Direct transform
transform(50, [0, 100], [0, 1]) // 0.5
```

### mix()

Interpolate between values.

```javascript
import { mix } from "motion"

mix(0, 100, 0.5)           // 50
mix("#ff0000", "#0000ff", 0.5) // Color blend
mix("0px", "100px", 0.5)   // "50px"
```

## Frame Scheduling

```javascript
import { frame, cancelFrame } from "motion"

// Schedule for next frame
const cancel = frame.render(() => {
  // Runs every frame
}, true) // true = repeat

// Read phase (before write)
frame.read(() => {
  const rect = element.getBoundingClientRect()
})

// Steps in order: read -> update -> render
frame.update(() => {
  // After read, before render
})
```

## Transition Options

### Spring

```javascript
{
  type: "spring",
  stiffness: 300,       // Default: 100
  damping: 30,          // Default: 10
  mass: 1,              // Default: 1
  velocity: 0,          // Initial velocity
  bounce: 0.25,         // 0-1 (alternative to stiffness/damping)
  visualDuration: 0.5,  // Target visual duration
  restSpeed: 0.1,       // Stop threshold (velocity)
  restDelta: 0.01       // Stop threshold (distance)
}
```

### Tween

```javascript
{
  type: "tween",        // or omit type
  duration: 0.5,        // seconds
  ease: "easeInOut",    // or [0.4, 0, 0.2, 1]
  times: [0, 0.5, 1],   // Keyframe positions
  delay: 0.2,
  repeat: Infinity,
  repeatType: "reverse", // "loop" | "reverse" | "mirror"
  repeatDelay: 0.5
}
```

### Easing

```javascript
// Named easings
"linear"
"easeIn", "easeOut", "easeInOut"
"circIn", "circOut", "circInOut"
"backIn", "backOut", "backInOut"
"anticipate"

// Cubic bezier
[0.4, 0, 0.2, 1]

// Custom function
(t) => t * t
```

### Per-Value Transitions

```javascript
animate(element, { x: 100, opacity: 1 }, {
  x: { type: "spring", stiffness: 300 },
  opacity: { duration: 0.2, ease: "linear" }
})
```

## Sequences

```javascript
import { animate, stagger } from "motion"

// Timeline with stagger
const sequence = [
  ["header", { opacity: 1 }, { duration: 0.5 }],
  ["nav li", { x: [50, 0] }, { delay: stagger(0.1) }],
  ["main", { opacity: 1 }, { at: "-0.3" }] // Overlap by 0.3s
]

await animate(sequence)
```

### Sequence Timing

- `{ at: "+0.5" }` - Start 0.5s after previous ends
- `{ at: "-0.3" }` - Start 0.3s before previous ends
- `{ at: 0.5 }` - Start at absolute time 0.5s
- `{ at: "<" }` - Start with previous

## SVG Animations

```javascript
// Path length
animate("path", { pathLength: [0, 1] }, { duration: 2 })

// Path offset for infinite drawing
animate("path", {
  pathLength: 0.5,
  pathOffset: [0, 1]
}, { duration: 2, repeat: Infinity })

// Morph between paths (with Flubber)
import { interpolate } from "flubber"

const morph = interpolate(pathA, pathB)
animate(0, 1, {
  onUpdate: t => path.setAttribute("d", morph(t))
})
```

## Browser Support

- Chrome 88+
- Firefox 78+
- Safari 14+
- Edge 88+

For older browsers, animations fall back gracefully.
