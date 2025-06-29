---
title: 'Sticky snap: a better snapping algorithm'
tags:
  - ui
  - ux
  - design
  - graphics
  - interface-design
  - interaction-design
taggedAt: '2025-06-29'
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
Try to place the green rectangle at the target:

<canvas id="magnetic-snap-app" style="display: block; margin: 0 auto"></canvas>

The target is impossible to reach!
The magnetic snap lines exert _action at a distance_,
pulling the object out of place.
Sometimes useful, but often very frustrating!

Now, try out _sticky snap_ on the same task:

<canvas id="sticky-snap-app" style="display: block; margin: 0 auto"></canvas>

With this algorithm, you can drag to the target
by approaching it without touching the snap lines.
Here, the snap lines are not magnetic, they're _sticky_.
They don't exert any action at a distance;
they only exert force once you've stuck something to them.
You get the best of both worlds:
it's easy to stick something to a snap line by dragging across the line,
but it's also easy to get arbitrarily close to the snap line without it interfering.

The sticky-snap algorithm is only slightly more complex than magnetic snap.
The dragged object has two axes, X and Y.
Each axis is either free,
or one of its edges is stuck to a snap line.
When an edge touches/crosses a snap line, it becomes stuck.
When pulled far enough away, it becomes unstuck.

I discovered sticky snap in macOS window management!
It makes it easy to snap a window next to another one,
but also easy to put a window _near_ another one.
As such, macOS has no "snapping off" mode.

I haven't seen sticky snap anywhere else.
All drawing apps I've tried use naive magnetic snap:
Figma,
Google Docs,
tldraw,
Inkscape,
Keynote, etc.
As such, all these apps have to make it easy to disable snapping,
or even to start with snapping off.
They should all consider using sticky snap!

<script type="module" src="./magnetic.js"></script>
<script type="module" src="./sticky.js"></script>
