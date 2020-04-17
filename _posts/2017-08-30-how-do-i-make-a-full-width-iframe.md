---
title: "How do I make a full-width `iframe` with fixed aspect ratio?"
---

I wanted to embed a YouTube `<iframe>` in a webpage.
I wanted it to be full-width (that is, `width: 100%`), but keep the normal YouTube aspect ratio.
I wanted it to behave like an `<img>`,
where the image file contains its fixed aspect ratio,
which the browser uses to lay out the image appropriately.

Unlike `<img>`s, `<iframe>`s don't have a fixed aspect ratio,
because `<iframe>`s embed web pages, which don't have fixed/known aspect ratios.
But for the particular case of YouTube videos,
there is a fixed aspect ratio we want:
the standard `<iframe>` has `width="560" height="315"`,
which simplifies to a 16:9 aspect ratio.
Can we tell the browser to display an `<iframe>` at `width: 100%; aspect-ratio: 16:9;`?

There is no `aspect-ratio` property, but we can do this with CSS.
The `16:9` aspect ratio corresponds to a height which is `56.25%` of the width.
To make a CSS box which is `56.25%` of its own width,
we can use the `padding-top` property with a percentage.
The percentage is proportional to the width of the _parent_ element,
so first, we create a parent element to define the width,
then insert a child element to define the height.
Like this:

```html
<div><div style="padding-top: 56.25%;background-color: yellow;"></div></div>
```

<div><div style="padding-top: 56.25%;background-color: yellow;"></div></div>

Next, we put the `<iframe>` inside this box, making it fill the whole box.
To size the `<iframe>`, we ignore the `width="560" height="315"` element properties,
and instead use the CSS properties `width:100%;height:100%;`.

```html
<div>
  <div style="padding-top:56.25%;background-color: yellow;">
    <iframe src="https://www.youtube.com/embed/nckseQJ1Nlg" frameborder="0" allowfullscreen
      style="width:100%;height:100%;"></iframe>
  </div>
</div>
```

<div>
  <div style="padding-top:56.25%;background-color: yellow;">
    <iframe src="https://www.youtube.com/embed/nckseQJ1Nlg" frameborder="0" allowfullscreen
      style="width:100%;height:100%;"></iframe>
  </div>
</div>

Oh no, that's not right at all!
The `<iframe>` is not the right height,
and it's not positioned correctly.
We can fix these with the `position` attribute:

```html
<div>
  <div style="position:relative;padding-top:56.25%;">
    <iframe src="https://www.youtube.com/embed/nckseQJ1Nlg" frameborder="0" allowfullscreen
      style="position:absolute;top:0;left:0;width:100%;height:100%;"></iframe>
  </div>
</div>
```

<div>
  <div style="position:relative;padding-top:56.25%;">
    <iframe src="https://www.youtube.com/embed/nckseQJ1Nlg" frameborder="0" allowfullscreen
      style="position:absolute;top:0;left:0;width:100%;height:100%;"></iframe>
  </div>
</div>

That's it: a full-width `<iframe>` with fixed aspect ratio. Enjoy.
