---
title: "On that flickering blur in Chrome"
tags: ["backdrop-filter", "chrome", "css", "design"]
---

`backdrop-filter: blur` is a popular design for navbars.
But it's unusable in its current state, due to its flickery appearance in Chrome.
Here's an example:

<div style="width: 25em; height: 15em; background: #eef; font-size: 0.8em; backdrop-filter: blur(0px); position: relative;">
  <div style="position: absolute; inset: 0; padding: 1em; overflow: scroll;">
    <div style="font-size: 2em; font-weight: bold; margin-top: 2em;">A heading</div>
    <p>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
      Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
    </p>
  </div>
  <div style="position: absolute; top: 1em; left: 1em; right: 1em; padding: 0.5em; border-radius: 0.5em; font-weight: bold; backdrop-filter: blur(15px); -webkit-backdrop-filter: blur(15px); background: #aaa3;">
    Nav with a blurred background
  </div>
</div>

In Chrome, notice how even a 1px scroll
can cause the color to completely change.
Here's a recording:

<video controls autoplay loop muted playsinline style="max-width: 20em;">
  <source src="./recording.webm" type="video/webm">
  Your browser does not support the video tag.
</video>

Here's the general problem:
a blur operation,
at the edges of the image,
needs to know what the content is _outside_ the image.
The _correct_ approach would be to give the blur filter
enough of the background content to work with.
But in Chrome, the blur is only given the pixels immediately behind the element.
So, as a hack, the blur must guess what the content is outside the nav.
[Wikipedia calls this "edge handling".](<https://en.wikipedia.org/wiki/Kernel_(image_processing)#Edge_handling>)

Chrome seems to take the _extend_ strategy:
it guesses that the pixels at the edge of the background image
extend infinitely in all directions.
This is why the blur flickers so much:
a tiny scroll causes the edge pixels to change,
which causes the extended pixels to completely change.

One better edge-handing strategy is _mirroring_.
Mirroring is better because, even though it's inaccurate, it results in smoother transitions.

Neither Firefox nor Safari have this problem,
although I'm not sure which approach they take to edge handling.
