---
title: Varying navbar for mobile and desktop
justification: The vidr.io navbar on mobile looks stupid
tags: []
---

Look at [framer.com](https://framer.com/) in various widths. The navbar is finely tuned based on the device width. As you decrease the device width, the logo moves above the text, then some links disappear ("Pricing", "Trial"), then some links change their text ("Get Started" becomes "Start"), then the text gets smaller, then finally the links move to two rows.

How does the site achieve this? Using CSS classes like `hide-laptop` and `hide-tablet-s`:

```html
<span class="hide-laptop">Get </span>Start<span class="hide-laptop">ed</span>
<li class="hide-tablet-s">
  <a href="/pricing" class="">Pricing</a>
</li>
```

These classes then have rules like:

```css
@media screen and (max-width: 1024px) {
  .hide-laptop {
    display: none !important;
  }
}

@media screen and (max-width: 600px) {
  .hide-tablet-s {
    display: none !important;
  }
}
```

The CSS has many categories of device: `desktop`, `laptop`, `tablet`, `tablet-s`, `mobile-l`, `mobile-m`, `mobile-s`. This seems unnecessarily fine-grained. I think these are sufficient to begin with:

```css
@media screen and (max-width: 768px) { .hide-tablet { display: none !important; } }
@media screen and (max-width: 375px) { .hide-mobile { display: none !important; } }
```
