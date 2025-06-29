---
title: "Sticky snap: a better snapping algorithm"
tags: []
---

In drawing apps,
the _snapping_ feature lets you align objects precisely.
But the snapping algorithm in most drawing apps has a problem:
you can't place the object near snap lines,
so for precise positioning, you have to disable snapping.
In this post, I show _sticky snap_, a better snapping algorithm that I discovered in macOS window management.
With sticky snap, you can place the object anywhere, so snapping can always be on by default.
Drawing apps should consider using sticky snap!

I call the most common snapping algorithm I call _magnetic snap_.
Try it out and experience its problems:

<canvas id="magnetic-snap-app"></canvas>

Notice how the target "Drag here" is impossible to reach!
The magnetic snap lines exert _action at a distance_,
pulling the object out of place.
Sometimes useful, but often frustrating!

Now, try out _sticky snap_:

<canvas id="sticky-snap-app"></canvas>

With this algorithm, you can drag to the target
by approaching it without touching the snap lines.
Here, the snap lines are not magnetic, they're _sticky_.
They don't exert any action at a distance;
they only exert force once you've stuck something to them.
You get the best of both worlds:
it's easy to stick something to a snap line by dragging across the line,
but it's also easy to get arbitrarily close to the snap line without it interfering.

I found the sticky snap algorithm in macOS window management.


What's the algorithm?
The object has two axes, X and Y.
Each axis is either free,
or one of its edges is stuck to a snap line.
When an edge touches/crosses a snap line, it becomes stuck.
When pulled far enough away, it becomes unstuck.



```ts
type Axis
  = { type: 'Free' }
  | { type: 'Stuck';
      edge: 'Start' | 'Middle' | 'End' };
type State = { x: Axis, y: Axis };
```

A list of apps that use naive magnetic snap:
- tldraw
- Figma
- Inkscape


<script type="module" src="./magnetic.js"></script>
<script type="module" src="./sticky.js"></script>