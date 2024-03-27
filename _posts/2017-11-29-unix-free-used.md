---
title: 'UNIX `free`: `used` does not mean what you think it means'
tags:
  - programming
  - unix
---

Today I wanted to see how close a Linux machine was to being out-of-memory.
So I ran `free -m`, like this

```
$ free -m
             total       used       free     shared    buffers     cached
Mem:          3764       3004        759          0        362       1546
-/+ buffers/cache:       1096       2668
Swap:            0          0          0
```

Then I did `3004/3764`, i.e. `used/total`, and got 80%.
Panic! 80% of the memory is used, and only 20% remains.
Right?

Wrong.
I've made this error before.
Thousands before me have made the same error.
This figure, `used/total`, is not representative of the machine's memory use.

The reason is that `used` does not mean what you think it means.
You think it means "all memory allocated by system processes".
`used` includes this,
but it also includes other categories of memory:
"buffers" and "cache".
What are these?

Unused memory is wasted memory,
so the Linux kernel attempts to use this memory to improve performance.
Specifically, Linux uses it to cache data on disk.
Disk data is cached in the "page cache".
`buffers+cache` is the size of the page cache.
The distinction between "buffers" and "cache" isn't very important.

If Linux runs out of "free" memory,
the page cache will be sacrificed
to make room for application memory.
Thus, `buffers+cache` really count as more memory available to your applications.
(But bear in mind that performance may degrade from the lack of page cache.)

For a more helpful assessment of your system's memory,
look at the line below:

```diff
  $ free -m
               total       used       free     shared    buffers     cached
  Mem:          3764       3004        759          0        362       1546
+ -/+ buffers/cache:       1096       2668
  Swap:            0          0          0
```

Accounting for buffers+cache,
your memory usage is `1096/3764` = 29%.
Quite a difference!
