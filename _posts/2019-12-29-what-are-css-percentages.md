---
title: What are CSS percentages?
tags:
  - programming
  - css
hnUrl: 'https://news.ycombinator.com/item?id=21915089'
hnUpvotes: 4
---

If you've used CSS, you've probably used percentage values.
They look like this:

```
body {
  width: 90%;
  margin-left: 10%;
  line-height: 160%;
}
```

But what are they percentages _of_?
It depends entirely on the property!
For the `width` and `margin-left` properties,
it's a percentage of
"the width of the containing block".
For the `line-height` property,
it's a percentage of
"the font size of the element itself".
And so on,
with rather idiosyncratic semantics for each CSS property.

At the bottom of this post is a full list of each CSS property that can take a percentage,
along with the semantics for that percentage.
But let's look at a few themes.

Many layout properties are defined in terms of
[the element's "containing block"](https://developer.mozilla.org/en-US/docs/Web/CSS/Containing_block)
(i.e. usually the element's nearest block-level ancestor).
For example,
the `width` and `height` properties are percentages of
the corresponding `width` and `height` of the containing block.
Generally, horizontal lengths are percentages of the width of the containing block,
and vertical lengths are percentages of the height of the containing block.

So what are `margin-top`, `margin-bottom`, `padding-top`, `padding-bottom`?
Surprise:
despite being vertical lengths,
they're percentages of the _width_ of the containing block!
Here's an example:

```html
<div id="square-wrapper">
  <div id="square"></div>
</div>
```

```css
<style>
  #square-wrapper {
    width: 100px;
  }
  #square {
    background-color: yellow;
    padding-bottom: 100%;
  }
</style>
```

Due to the odd meaning of `padding-bottom: 100%`,
this gives us a square:

<div id="square-wrapper">
  <div id="square"></div>
</div>

<style>
  #square-wrapper {
    width: 100px;
  }
  #square {
    background-color: yellow;
    padding-bottom: 100%;
  }
</style>

Some properties can't take percentages.
For example, `border-width` can't take a percentage.
I can imagine it being defined in terms of "the width of the containing block",
but it isn't.

Finally, here's a full list of how percentages are interpreted.
I scraped it from MDN.

<style>
.x-table {
  border-collapse: collapse;
}
.x-table th, .x-table td {
  border: 2px solid #ccc;
  padding: 1em;
}
</style>
<table class="x-table">
  <thead>
    <th>For CSS properties ...</th>
    <th>... a percentage means</th>
  </thead>
  <tbody>
    <tr>
      <th><code>outline-radius-bottomleft</code>, <code>outline-radius-bottomright</code>, <code>outline-radius-topleft</code>, <code>outline-radius-topright</code>, <code>border-bottom-left-radius</code>, <code>border-bottom-right-radius</code>, <code>border-end-end-radius</code>, <code>border-end-start-radius</code>, <code>border-radius</code>, <code>border-start-end-radius</code>, <code>border-start-start-radius</code>, <code>border-top-left-radius</code>, <code>border-top-right-radius</code></th>
      <td>refer to the corresponding dimension of the border box</td>
    </tr>
    <tr>
      <th><code>content-zoom-limit-max</code></th>
      <td>The largest allowed zoom factor. A zoom factor of 100% corresponds to no zooming. Larger values zoom in. Smaller values zoom out.</td>
    </tr>
    <tr>
      <th><code>content-zoom-limit-min</code></th>
      <td>The smallest allowed zoom factor. A zoom factor of 100% corresponds to no zooming. Larger values zoom in. Smaller values zoom out.</td>
    </tr>
    <tr>
      <th><code>hyphenate-limit-zone</code></th>
      <td>calculated with respect to the width of the line box</td>
    </tr>
    <tr>
      <th><code>mask-position-x</code>, <code>mask-position-y</code></th>
      <td>refer to the size of the box itself</td>
    </tr>
    <tr>
      <th><code>background-position-x</code></th>
      <td>refer to width of background positioning area minus height of background image</td>
    </tr>
    <tr>
      <th><code>background-position-y</code></th>
      <td>refer to height of background positioning area minus height of background image</td>
    </tr>
    <tr>
      <th><code>background-position</code></th>
      <td>refer to the size of the background positioning area minus size of background image; size refers to the width for horizontal offsets and to the height for vertical offsets</td>
    </tr>
    <tr>
      <th><code>background-size</code></th>
      <td>relative to the background positioning area</td>
    </tr>
    <tr>
      <th><code>block-size</code>, <code>max-block-size</code>, <code>min-block-size</code></th>
      <td>block-size of containing block</td>
    </tr>
    <tr>
      <th><code>border-block-end-width</code>, <code>border-block-start-width</code>, <code>border-block-width</code>, <code>border-inline-end-width</code>, <code>border-inline-start-width</code>, <code>border-inline-width</code>, <code>inset-inline-end</code>, <code>inset-inline-start</code>, <code>inset-inline</code>, <code>padding-block-end</code>, <code>padding-block-start</code>, <code>padding-block</code>, <code>padding-inline-end</code>, <code>padding-inline-start</code>, <code>padding-inline</code></th>
      <td>logical-width of containing block</td>
    </tr>
    <tr>
      <th><code>border-image-slice</code></th>
      <td>refer to the size of the border image</td>
    </tr>
    <tr>
      <th><code>border-image-width</code></th>
      <td>refer to the width or height of the border image area</td>
    </tr>
    <tr>
      <th><code>bottom</code>, <code>top</code></th>
      <td>refer to the height of the containing block</td>
    </tr>
    <tr>
      <th><code>column-gap (grid-column-gap)</code>, <code>grid-auto-columns</code>, <code>grid-auto-rows</code>, <code>grid-template-columns</code>, <code>grid-template-rows</code>, <code>row-gap (grid-row-gap)</code></th>
      <td>refer to corresponding dimension of the content area</td>
    </tr>
    <tr>
      <th><code>flex-basis</code></th>
      <td>refer to the flex container's inner main size</td>
    </tr>
    <tr>
      <th><code>font-size</code></th>
      <td>refer to the parent element's font size</td>
    </tr>
    <tr>
      <th><code>height</code></th>
      <td>The percentage is calculated with respect to the height of the generated box's containing block. If the height of the containing block is not specified explicitly (i.e., it depends on content height), and this element is not absolutely positioned, the value computes to <code>auto</code>. A percentage height on the root element is relative to the initial containing block.</td>
    </tr>
    <tr>
      <th><code>inline-size</code>, <code>max-inline-size</code>, <code>min-inline-size</code></th>
      <td>inline-size of containing block</td>
    </tr>
    <tr>
      <th><code>inset-block-end</code>, <code>inset-block-start</code>, <code>inset-block</code>, <code>inset</code></th>
      <td>logical-height of containing block</td>
    </tr>
    <tr>
      <th><code>left</code>, <code>margin-bottom</code>, <code>margin-left</code>, <code>margin-right</code>, <code>margin-top</code>, <code>margin</code>, <code>max-width</code>, <code>min-width</code>, <code>padding-bottom</code>, <code>padding-left</code>, <code>padding-right</code>, <code>padding-top</code>, <code>padding</code>, <code>right</code>, <code>shape-margin</code>, <code>text-indent</code>, <code>width</code></th>
      <td>refer to the width of the containing block</td>
    </tr>
    <tr>
      <th><code>line-height</code></th>
      <td>refer to the font size of the element itself</td>
    </tr>
    <tr>
      <th><code>margin-block-end</code>, <code>margin-block-start</code>, <code>margin-block</code>, <code>margin-inline-end</code>, <code>margin-inline-start</code>, <code>margin-inline</code></th>
      <td>depends on layout model</td>
    </tr>
    <tr>
      <th><code>max-height</code></th>
      <td>The percentage is calculated with respect to the height of the generated box's containing block. If the height of the containing block is not specified explicitly (i.e., it depends on content height), and this element is not absolutely positioned, the percentage value is treated as <code>none</code>.</td>
    </tr>
    <tr>
      <th><code>min-height</code></th>
      <td>The percentage is calculated with respect to the height of the generated box's containing block. If the height of the containing block is not specified explicitly (i.e., it depends on content height), and this element is not absolutely positioned, the percentage value is treated as <code>0</code>.</td>
    </tr>
    <tr>
      <th><code>object-position</code></th>
      <td>refer to width and height of element itself</td>
    </tr>
    <tr>
      <th><code>offset-distance</code></th>
      <td>refer to the total path length</td>
    </tr>
    <tr>
      <th><code>perspective-origin</code>, <code>transform-origin</code>, <code>transform</code>, <code>translate</code></th>
      <td>refer to the size of bounding box</td>
    </tr>
    <tr>
      <th><code>scroll-padding-block-end</code>, <code>scroll-padding-block-start</code>, <code>scroll-padding-block</code>, <code>scroll-padding-bottom</code>, <code>scroll-padding-inline-end</code>, <code>scroll-padding-inline-start</code>, <code>scroll-padding-inline</code>, <code>scroll-padding-left</code>, <code>scroll-padding-right</code>, <code>scroll-padding-top</code>, <code>scroll-padding</code></th>
      <td>relative to the scroll container's scrollport</td>
    </tr>
    <tr>
      <th><code>scroll-snap-points-x</code>, <code>scroll-snap-points-y</code></th>
      <td>relative to same axis of the padding-box of the scroll container</td>
    </tr>
    <tr>
      <th><code>text-size-adjust</code></th>
      <td>yes, refer to the corresponding size of the text font</td>
    </tr>
    <tr>
      <th><code>vertical-align</code></th>
      <td>refer to the <code>line-height</code> of the element itself</td>
    </tr>
    <tr>
      <th><code>word-spacing</code></th>
      <td>refer to the width of the affected glyph</td>
    </tr>
  </tbody>
</table>
