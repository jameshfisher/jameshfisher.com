---
title: "Web worker hello world"
draft: true
---

<script>
  var counterWorker = new Worker("/assets/2017-08-31/web-worker.js");
  counterWorker.postMessage({command: "get"});
  counterWorker.postMessage({command: "add", amount: 1});
</script>

