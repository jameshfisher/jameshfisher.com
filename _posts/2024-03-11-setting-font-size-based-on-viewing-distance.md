---
title: "Setting font-size based on viewing distance"
tags: ["programming", "web"]
---

I want to set the font-size at the most comfortable size for reading.
But this depends on the distance from the reader to the screen.

Can we estimate this distance from screen size?
I measured my viewing distance for four devices:

|              | Mobile (portrait) | Mobile (landscape) | Laptop | Desktop |
| -------------|-------------------|--------------------|--------|-------- |
| **Width**    | 7                 | 15                 | 29     | 62      |
| **Weight**   | 15                | 7                  | 18     | 34      |
| **Distance** | 25                | 30                 | 50     | 80      |

I found that `17cm + width` decently predicts the viewing distance.

Now given an estimated viewing distance,
we can translate desired an _angular_ size (like 1 degree) into an _absolute_ size with
`dist * tan(angle)`.

We can express that in CSS with: `calc((17cm + 100vw) * tan(1deg))`.
This red box is 1 degree of your field of view:

<div style="background: red; width: calc((17cm + 100vw) * tan(1deg)); aspect-ratio: 1 / 1">
</div>

And this text is `font-size: 0.5deg` (estimated):

<div style="background: #eee; font-size: calc((17cm + 100vw) * tan(0.5deg));">
  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
</div>

Result: I'm not convinced that the optimum font-size is purely an angular size.
There are other considerations, like:

* If the user is **on-the-go**, as they often are with a mobile, movement makes everything harder to read.
* If the user is **long-sighted**, their mobile screen may be further away than estimated.
* If the user is **short-sighted**, text on their desktop may need to be a larger angular size.
  (Myopia is not just a uniform blurring of the visual field!)
