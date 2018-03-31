---
title: "What are `/dev/stdout` and `/dev/stdin`? What are they useful for?"
---

In the `/dev` directory,
amongst the disks, TTYs, `urandom`s, and other pseudo-devices,
are the files `/dev/stdin`, `/dev/stdout` and `/dev/stderr`.
What are they, and what are they good for?

You may have heard of standard in, standard out and standard error,
the three "standard streams" which each UNIX process usually has attached to it on start.
For example, `cat` run with no arguments
reads from standard in and writes to standard out (achieving nothing):

```console
$ echo hello | cat | tr '[a-z]' '[A-Z]'
HELLO
```

The standard streams don't seem like "devices", but there they are in `/dev`;
files which any process can open, read from, and write to, just like other files.
When I write to `/dev/stdout` from my shell, it's printed to my terminal:

```console
$ echo hello > /dev/stdout
hello
```

Crucially, `/dev/stdout` means different things to different processes.
Above, `/dev/stdout` refers to the standard out of my shell process,
which is my terminal,
and that's why `hello` printed to my screen.
But if I tell `cp` to write to `/dev/stdout`,
it writes to its own standard out stream,
not to my shell's standard out:

```console
$ echo hello | cp /dev/stdin /dev/stdout | tr '[a-z]' '[A-Z]'
HELLO
```

Look at that:
we got `cp`,
normally used for copying files,
to behave just like `cat`, which copies streams!
We were able to do this by telling `cp` to use its standard streams instead of files.

When building shell pipelines,
this can be very useful.
The following pipeline grabs a JPEG from the web,
converts it to a monochrome PNG,
then posts the result to another web server,
without creating any temporary files:

```bash
curl https://upload.wikimedia.org/wikipedia/en/5/52/Testcard_F.jpg \
| convert -monochrome /dev/stdin png:/dev/stdout \
| curl -X POST --data @/dev/stdin -H 'Content-Type: image/png' http://requestbin.fullcontact.com/13rcezq1
```

Processes interact with files via file descriptors.
When a process opens a file,
the OS gives the process a file descriptor (a number)
which the process can use to read or write from the open file.
We can see this with `strace`:

```console
$ cat foo.txt
hello
$ strace cat foo.txt
...
open("foo.txt", O_RDONLY)               = 3
...
read(3, "hello\n", 65536)               = 6
...
```

Here, `cat foo.txt` called `open("foo.txt", O_RDONLY)`,
and the OS returned the file descriptor `3`.
`cat` then read from this with `read(3, ...)`.

The standard streams in, out and error are at file descriptors 0, 1 and 2 respectively.
The standard streams are pre-attached; the process does not have to open them.
For example, `cat` run with no arguments
reads from file descriptor `0` and writes to file descriptor `1`.
In a shell pipeline, these standard file descriptors are references to anonymous pipes.

When we run `cp /dev/stdin /dev/stdout`,
the process opens the files `/dev/stdin` and `/dev/stdout` as normal,
and gets back file descriptors for them.
Which numbers do you think it gets back?

```
open("/dev/stdin", O_RDONLY)            = 3
open("/dev/stdout", O_WRONLY|O_TRUNC)   = 4
```

No, it doesn't get back 0 and 1;
it gets two _new_ file descriptors 3 and 4.
But those new file descriptors both refer to the same underlying anonymous pipe.
