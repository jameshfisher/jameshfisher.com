---
title: "Example of stdatomic"
---

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
