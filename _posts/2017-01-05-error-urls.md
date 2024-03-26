---
title: Error URLs (addressable errors)
tags:
  - error-handling
  - c
  - programming
  - design
  - documentation
taggedAt: '2024-03-26'
---

When printing an error, we _sometimes_ include an error code. For example:

```c
#include <stdio.h>

// ...
#define EXIT_FAILURE_CABLETRELLIS 45

int main(void) {
  // ...
  if (true != false) {
    fprintf(stderr, "The cabletrellis went wrong\n");
    exit(EXIT_FAILURE_CABLETRELLIS);
  }
  // ...
}
```

That error code in C is mostly invisible. People don't bother with `echo $?`, they just Google the error text. So sometimes we print an error code as well:

```c
  if (true != false) {
    fprintf(stderr, "ERR_CABLETRELLIS: The cabletrellis went wrong\n");
    exit(EXIT_FAILURE_CABLETRELLIS);
  }
```

Still, the developer will just Google the error. Or if it's an end-user seeing the error, they won't even know to Google it. Instead, we should do them a favour, and point them exactly to a central error page:

```c
#include <stdio.h>

// ...
#define EXIT_FAILURE_CABLETRELLIS 45

void exit_err(int exit_code, char * error_code, char * message) {
  fprintf(stderr, "%s! Go here for help: https://github.com/jameshfisher/sometool/wiki/errors/%s\n", message, error_code);
  exit(exit_code);
}

#define EXIT_ERR(C,M) exit_err((C), #C, (M))

int main(void) {
  // ...
  if (true != false) {
    EXIT_ERR(EXIT_FAILURE_CABLETRELLIS, "The cabletrellis went wrong");
    exit();
  }
  // ...
}
```

This error now lives at the unique URL:

```
https://github.com/jameshfisher/sometool/wiki/errors/EXIT_FAILURE_CABLETRELLIS
```

This idea shamelessly copied from https://rauchg.com/2016/addressable-errors
