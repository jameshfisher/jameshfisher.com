---
title: "What is `fdset` in C?"
---

`sys/socket.h` provides some macros for working with sets of file descriptors. How do they work?

First, `/usr/include/sys/select.h` has:

```c
#include <sys/_types/_fd_setsize.h>
#include <sys/_types/_fd_set.h>
#include <sys/_types/_fd_clr.h>
#include <sys/_types/_fd_isset.h>
#include <sys/_types/_fd_zero.h>
```

Then `/usr/include/sys/_types/_fd_isset.h` has:

```c
#define FD_ISSET(n, p)  __DARWIN_FD_ISSET(n, p)
```

etc. Now these are defined in `/usr/include/sys/_types/_fd_def.h` which reads

```c
/*
 * Select uses bit masks of file descriptors in longs.  These macros
 * manipulate such bit fields (the filesystem macros use chars).  The
 * extra protection here is to permit application redefinition above
 * the default size.
 */
#ifdef FD_SETSIZE
#define __DARWIN_FD_SETSIZE     FD_SETSIZE
#else /* !FD_SETSIZE */
#define __DARWIN_FD_SETSIZE     1024
#endif /* FD_SETSIZE */
#define __DARWIN_NBBY           8                               /* bits in a byte */
#define __DARWIN_NFDBITS        (sizeof(__int32_t) * __DARWIN_NBBY) /* bits per mask */
#define __DARWIN_howmany(x, y)  ((((x) % (y)) == 0) ? ((x) / (y)) : (((x) / (y)) + 1)) /* # y's == x bits? */

__BEGIN_DECLS
typedef struct fd_set {
        __int32_t       fds_bits[__DARWIN_howmany(__DARWIN_FD_SETSIZE, __DARWIN_NFDBITS)];
} fd_set;
__END_DECLS

/* This inline avoids argument side-effect issues with FD_ISSET() */
static __inline int
__darwin_fd_isset(int _n, const struct fd_set *_p)
{
        return (_p->fds_bits[(unsigned long)_n/__DARWIN_NFDBITS] & ((__int32_t)(((unsigned long)1)<<((unsigned long)_n % __DARWIN_NFDBITS))));
}

#define __DARWIN_FD_SET(n, p)   do { int __fd = (n); ((p)->fds_bits[(unsigned long)__fd/__DARWIN_NFDBITS] |= ((__int32_t)(((unsigned long)1)<<((unsigned long)__fd % __DARWIN_NFDBITS)))); } while(0)
#define __DARWIN_FD_CLR(n, p)   do { int __fd = (n); ((p)->fds_bits[(unsigned long)__fd/__DARWIN_NFDBITS] &= ~((__int32_t)(((unsigned long)1)<<((unsigned long)__fd % __DARWIN_NFDBITS)))); } while(0)
#define __DARWIN_FD_ISSET(n, p) __darwin_fd_isset((n), (p))
```

Let's redefine `FD_SET` as a readable function:

```c
typedef struct fd_set {
  uint32_t fds_bits[32];
} fd_set;

int FD_ISSET(unsigned long n, struct fd_set *p) {
  uint32_t mask = 1 << (n % 32);
  return p->fds_bits[n / 32] & mask;
}

void FD_SET(unsigned long n, struct fd_set *p) {
  uint32_t mask = 1 << (n % 32);
  p->fds_bits[n / 32] |= mask;
}
```
