---
title: What is `mode_t` in C?
tags:
  - mode_t
  - file-io
  - file-descriptors
  - permissions
  - c
  - programming
  - posix
taggedAt: '2024-03-26'
summary: >-
  `mode_t` is a bitfield type in C that represents file permissions, including
  read, write, and execute permissions for the owner, group, and other classes.
  It provides symbolic constants to set and check these permissions.
---

Lots of man pages refer to `mode_t`, but frustratingly, the manual does not include a page on it. (This is a general flaw in the manual: there are no pages for types.) The documentation for `mode_t` is found buried in `CHMOD(2)`:

> A mode is created from or'd permission bit masks defined in `<sys/stat.h>`:
>
> ```c
> #define S_IRWXU 0000700    /* RWX mask for owner */
> #define S_IRUSR 0000400    /* R for owner */
> #define S_IWUSR 0000200    /* W for owner */
> #define S_IXUSR 0000100    /* X for owner */
>
> #define S_IRWXG 0000070    /* RWX mask for group */
> #define S_IRGRP 0000040    /* R for group */
> #define S_IWGRP 0000020    /* W for group */
> #define S_IXGRP 0000010    /* X for group */
>
> #define S_IRWXO 0000007    /* RWX mask for other */
> #define S_IROTH 0000004    /* R for other */
> #define S_IWOTH 0000002    /* W for other */
> #define S_IXOTH 0000001    /* X for other */
>
> #define S_ISUID 0004000    /* set user id on execution */
> #define S_ISGID 0002000    /* set group id on execution */
> #define S_ISVTX 0001000    /* save swapped text even after use */
> ```

In other words, a `mode_t` consists of a load of bit-packed booleans. Ignoring the last three, this gives their bit number:

|       | Read?              | Write?             | Execute?           |
| ----- | ------------------ | ------------------ | ------------------ |
| Owner | `S_IRUSR = 1 << 8` | `S_IWUSR = 1 << 7` | `S_IXUSR = 1 << 6` |
| Group | `S_IRGRP = 1 << 5` | `S_IWGRP = 1 << 4` | `S_IXGRP = 1 << 3` |
| Other | `S_IROTH = 1 << 2` | `S_IWOTH = 1 << 1` | `S_IXOTH = 1 << 0` |

Those defined constants are almost as hard to read as the numbers!

Here are some examples, with some functions to manipulate `mode_t` values.

```c
#include <sys/stat.h>
#include <stdbool.h>
#include <stdio.h>

enum class { CLASS_OWNER, CLASS_GROUP, CLASS_OTHER };
enum permission { PERMISSION_READ, PERMISSION_WRITE, PERMISSION_EXECUTE };
const mode_t EMPTY_MODE = 0;
mode_t perm(enum class c, enum permission p) { return 1 << ((3-p) + (2-c)*3); }
bool mode_contains(mode_t mode, enum class c, enum permission p) { return mode & perm(c, p); }
mode_t mode_add(mode_t mode, enum class c, enum permission p) { return mode | perm(c, p); }
mode_t mode_rm(mode_t mode, enum class c, enum permission p) { return mode & ~perm(c, p); }

// buf must have at least 10 bytes
void strmode(mode_t mode, char * buf) {
  const char chars[] = "rwxrwxrwx";
  for (size_t i = 0; i < 9; i++) {
    buf[i] = (mode & (1 << (8-i))) ? chars[i] : '-';
  }
  buf[9] = '\0';
}

int main(void) {
  char buf[10];
  mode_t examples[] = { 0, 0666, 0777, 0700, 0100, 01, 02, 03, 04, 05, 06, 07 };
  size_t num_examples = sizeof(examples) / sizeof(examples[0]);
  for (size_t i = 0; i < num_examples; i++) {
    strmode(examples[i], buf);
    printf("%04o is %s\n", examples[i], buf);
  }
  return 0;
}
```

This prints:

```
$ ./a.out
0000 is ---------
0666 is rw-rw-rw-
0777 is rwxrwxrwx
0700 is rwx------
0100 is --x------
0001 is --------x
0002 is -------w-
0003 is -------wx
0004 is ------r--
0005 is ------r-x
0006 is ------rw-
0007 is ------rwx
```

I've written the values in octal, because that's how they're traditionally written. It's quite confusing, because the numbers don't map obviously to the permission set. You have to think in binary. But in short, 1 is execute, 2 is write, 4 is read, and you add these together to get a permission set for a given class (e.g. group).

But now, what are those last three bits? I'll cover those some other time ...
