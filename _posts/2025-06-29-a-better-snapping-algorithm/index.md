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

The "snapping" feature in most drawing apps has a problem:
you can't place the object near snap lines,
so for precise positioning, you have to disable snapping.
In this post, I show _sticky snap_,
a better algorithm.
But first,
try out the standard snap algorithm:

<canvas id="magnetic-snap-app" style="display: block; margin: 0 auto"></canvas>

If you try to place the green rectangle at the target,
you'll soon find that it's impossible to reach!
The snap lines always pull the object out of place.
Sometimes useful, but often very frustrating.
To complete this task, you'll need to disable snapping!

I call that standard algorithm _magnetic snap_,
because the snap lines exert "action at a distance" on the thing you want to drag.
Now for contrast, try out _sticky snap_ on the same task:

<canvas id="sticky-snap-app" style="display: block; margin: 0 auto"></canvas>

With sticky snap, you can drag to the target
by approaching it without touching the snap lines.
Here, the snap lines are not magnetic, they're _sticky_.
The snap lines don't exert action at a distance;
they only exert force once you've stuck something to them.
You get the best of both worlds:
easy to snap,
but also easy to avoid the snap line.

I discovered sticky snap in macOS window management:
try dragging a window next to another one!
Notice, unlike every other app with snapping,
macOS has no "window snap off" mode.
This is no coincidence:
with sticky snap, you don't need to turn it off.

Yet I haven't seen sticky snap anywhere else.
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
