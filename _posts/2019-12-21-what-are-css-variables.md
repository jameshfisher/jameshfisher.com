---
title: "What are CSS variables?"
tags: ["programming","web","css"]
---

Here's some CSS that was mysterious to me:

```css
html {
  --bg-color: yellow;
  --square-size: 200px;
}
#yellowsquare {
  background-color: var(--bg-color);
  width: var(--square-size);
  height: var(--square-size);
}
```

And here's what we get when we apply it to a `<div id="yellowsquare">`:

<div id="yellowsquare">I'm #yellowsquare</div>
<style type="text/css">
  html {
    --bg-color: yellow;
    --square-size: 200px;
  }
  #yellowsquare {
    background-color: var(--bg-color);
    width: var(--square-size);
    height: var(--square-size);
    font-family: var(--unfound);
  }
</style>

This uses [a CSS feature called "custom properties"](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties),
also known as "CSS variables".
You can probably figure out from the CSS _roughly_ how it works.
But variable semantics are usually subtle,
and actually they're not officially "variables",
so what's really going on?

There were two new features in this CSS.
The first new feature is the `--bg-color: yellow;` syntax.
This looks like a CSS property, and it is.
In particular, it's a ["custom" property](https://developer.mozilla.org/en-US/docs/Web/CSS/--*),
because it begins with `--`.

Custom properties like `--bg-color` are not so different from other CSS properties.
Like other properties,
custom properties ["cascade"](https://developer.mozilla.org/en-US/docs/Web/CSS/Cascade),
which means that a DOM element's `--bg-color` value is assigned by
the most "specific" selector that applies to that element.
In our example, 
only the root `html` element in the page 
got the `--bg-color: yellow` property via cascade.
For example, the `#yellowsquare` element does not.

But custom properties like `--bg-color` are also "inherited" properties,
like `font-family` or `color`
(but unlike `width` or `background-color`).
"Inherited" means,
if a DOM element's `--bg-color` value is not assigned by the cascade,
its value falls back to the `--bg-color` value assigned to the element's parent in the DOM.
And since the DOM is a tree,
this fallback can go all the way to the top,
i.e. to the `html` element.
In our example,
the `--bg-color: yellow` set on the `html` root element
will be inherited by every element in the DOM tree,
including the `#yellowsquare` element.

On their own, custom properties have no effect on rendering.
To use a custom property,
we need a second new feature:
[the `var` CSS function](https://developer.mozilla.org/en-US/docs/Web/CSS/var).
If a DOM element has `background-color` set to `var(--bg-color)`,
this will evaluate to the computed value of that element's `--bg-color` property.

The `var()` expression can take a fallback, e.g. `var(--bg-color, black)`.
If the DOM element does not have a `--bg-color` property,
then this expression will instead evaluate to `black`.

Knowing that CSS variables are actually CSS properties
should answer many of the common questions about variables.
For example, CSS "variables" are closer to "dynamic" scoping than to lexical scoping.
