---
title: What is stdatomic in C?
tags: []
---

I was watching a talk yesterday about [Go's `sync/atomic` package](https://golang.org/pkg/sync/atomic/) which provides atomic operations like `AddInt32(*int32, int32)`. These are implemented using special atomic CPU instructions.

I wondered what the equivalent is in C. The equivalent is `stdatomic`, which provides operations like `atomic_fetch_add(atomic_int*, int)`. Here's an example:

```c
#include <stdio.h>
#include <stdatomic.h>
#include <pthread.h>

int cnt;
atomic_int acnt;

void* f(void* param) {
  for(int n = 0; n < 1000; ++n) {
    ++cnt;
    atomic_fetch_add(&acnt, 1);
  }
  return NULL;
}

int main(void) {
  pthread_t t[10];
  for (int i = 0; i < 10; i++) pthread_create(&t[i], NULL, f, NULL);
  for (int i = 0; i < 10; i++) pthread_join(t[i], NULL);
  printf("acnt = %u; cnt = %u;\n", acnt, cnt);
}
```

```
$ clang atomic_test.c
$ ./a.out
acnt = 10000; cnt = 7442;
```

Actually, I lied about the type signature of `atomic_fetch_add`. Its full signature is:

```c
C atomic_fetch_add(volatile A* obj, M arg);
C atomic_fetch_add_explicit(volatile A* obj, M arg, memory_order order);
```

There are multiple things in here I don't understand properly:

* C generic functions. The types `A`, `M` and `C` are actually generic type parameters.
* The `volatile` keyword. I need to understand this better.
* The `memory_order` argument.
