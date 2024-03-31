---
title: Push notification button
draft: true
tags: []
---

The button below lets you control whether you receive push notifications from this site.

<button id="receive_notifications"></button>

<script>
const button = document.getElementById("receive_notifications");
button.addEventListener("click", (ev) => {
  "You're not receiving notifications. Click to receive notifications."
});
</script>
