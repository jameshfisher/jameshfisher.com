---
title: "What is consistent hashing?"
draft: true
---

Traditional algorithm:

- maintain N buckets numbered `0 .. N-1`.
- find the bucket for an item as `hash(item) % N`.
- when there are too many items for buckets, resize:
  `N := 2*N`
