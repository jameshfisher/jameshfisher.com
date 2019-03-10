---
title: "Why can't I set the font size of a visited link?"
tags: ["programming", "web", "css", "security"]
---

Visited links show up purple; unvisited links show up blue.
This distinction goes back to the beginning of the web.
But CSS allows you to customize this visual difference using the `:visited` pseudo-selector!
Say you wanted to make visited links gray and smaller,
to indicate to the user that this link is "done":

```css
a:visited {
  color: gray;
  font-size: 6px;
}
```

<style>
  a:visited {
    color: gray;
    font-size: 6px;
  }
</style>

This style is applied on this page,
and here's a sample:

<div>
  <ul>
    <li><a id="visited-link" href="/2019/03/08/why-cant-i-set-the-font-size-of-a-visited-link">You've visited this page - it's the one you're viewing</a></li>
    <li><a id="unvisited-link" href="https://ec386324a2ba.com">You haven't visited this page</a></li>
  </ul>
</div>

Notice that the visited link appears gray, as expected,
but the font size hasn't changed!
This is because changing the font size would be a security vulnerability!
If CSS could set the font size differently,
I (Jim) could tell whether you've visited `pornhub.com`.
But how?

Web pages are able to inspect the rendered elements on the page.
The most obvious way is with `window.getComputedStyle()`.
Here are the reported properties of the above visited link,
as reported by your browser:
<code id="css-report"></code>.

<script>
  window.addEventListener("load",() => {
    const style = window.getComputedStyle(document.getElementById("visited-link"));
    document.getElementById("css-report").innerText = `font-size: ${style.getPropertyValue("font-size")}; color: ${style.getPropertyValue("color")}`;
  });
</script>

If `getComputedStyle` were to report `6px` instead of `18px` for visited links,
I could have this page generate a link to `pornhub.com`,
then test its font size,
in order to reveal your browsing history.
I could then serve you targeted ads,
sell your data,
blackmail you,
et cetera.
This security hole has been plugged
by not allowing `a:visited` to set the `font-size`.

But notice what `getComputedStyle` reported for the color of the visited link:
`rgb(0, 0, 238)`, i.e., blue.
This is a lie - the link is gray!
For the `color` property,
browsers have plugged the security hole in a different way:
instead of disallowing the property to be customized,
they have `getComputedStyle` lie about its value.

Why two approaches?
Why can't we have `getComputedStyle` lie for `font-size`, too?
The reason is that
web pages can inspect the rendered elements via more than `getComputedStyle`.
Web pages can check an element's position in the page,
via `.pageXOffset` or `.pageYOffset`.
Since `font-size` of the visited link would affect the offset of other elements,
the page could indirectly check whether the link is visited.
Disabling `font-size` for `a:visited` is a brutal, but safer, solution.

There's [a short whitelist of properties](https://developer.mozilla.org/en-US/docs/Web/CSS/:visited) that,
like `color`,
shouldn't affect page layout,
and so shouldn't be detectable.
They're all different forms of color.
All other CSS properties are banned.

In _theory_, there is no way that a web page can determine
whether a link has been colored differently.
One possibility is a timing attack:
say,
if it takes longer to color something pink compared to blue,
the page could measure how long it took to render the element,
and compared this to an expected duration.
