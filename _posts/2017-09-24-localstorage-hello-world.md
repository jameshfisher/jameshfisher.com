---
title: LocalStorage hello world
tags: []
---

[LocalStorage](https://developer.mozilla.org/en-US/docs/Web/API/Storage/LocalStorage)
lets web applications store things in the local browser,
independent of any running browsing contexts.
Its API is key-value:

```js
localStorage.setItem("hello", "world");
console.log(localStorage.getItem("hello")); // logs "world"
```

The storage is per-origin (for this site, `https://jameshfisher.com:443`).
All browsing contexts for this origin share the same key-value store.

The following form sets/gets values in the `localStorage` for this website (`jameshfisher.com`).

<input type="text" id="key" placeholder="Key"/>
<input type="text" id="value" placeholder="Value"/>
<input type="button" id="get" value="Get"/>
<input type="button" id="set" value="Set"/>

<script>
const keyEl = document.getElementById("key");
const valEl = document.getElementById("value");
document.getElementById("get").addEventListener("click", function (ev) {
  valEl.value = localStorage.getItem(keyEl.value);
});
document.getElementById("set").addEventListener("click", function (ev) {
  localStorage.setItem(keyEl.value, valEl.value);
});
</script>

In Chrome, you can see the values in `localStorage`
by opening developer tools and going to "Local Storage".
You can edit the values there, too.
