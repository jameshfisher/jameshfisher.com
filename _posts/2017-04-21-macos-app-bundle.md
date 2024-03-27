---
title: What is a .app?
justification: Vidrio is a .app!
tags: []
---

In macOS, I browse to my `/Applications` directory to see lots of files. `Keynote.app`, `Spotify.app`, `Vidrio.app`, etc. What are these things? These "applications" can't be launched in the normal fashion:

```
$ /Applications/Spotify.app/
-bash: /Applications/Spotify.app/: is a directory
```

They're not files, they're directories!

```
$ cd /Applications/Spotify.app
$ tree -L 2
.
└── Contents
    ├── Frameworks
    ├── Info.plist
    ├── MacOS
    ├── Resources
    └── _CodeSignature
```

Despite being directories, we can `open` them to launch the application. What program is used to run this?

```
$ pstree -p 38699
-+= 00001 root /sbin/launchd
 \-+= 38699 jim /Applications/Spotify.app/Contents/MacOS/Spotify
   |--- 38705 jim /Applications/Spotify.app/Contents/Frameworks/Spotify Helper.app/Contents/MacOS/Spotify Helper --type=gpu-process --lang=en-US --log-file=/
   \--- 38710 jim /Applications/Spotify.app/Contents/Frameworks/Spotify Helper.app/Contents/MacOS/Spotify Helper --type=renderer --disable-pinch --primordial
```

The process `1`, `/sbin/launchd`, started `/Applications/Spotify.app/Contents/MacOS/Spotify`.

The real program binary is at `Contents/MacOS/Spotify` within the `.app` directory. We can run this program ourselves, but it doesn't run correctly for some reason:

```
$ /Applications/Spotify.app/Contents/MacOS/Spotify
2017-05-07 12:41:40.858 Spotify[39249:1666301] NSWindow warning: adding an unknown subview: <_NSThemeCloseWidget: 0x7f8ca4482130>. Break on NSLog to debug.
2017-05-07 12:41:40.859 Spotify[39249:1666301] Call stack:
(
	0   AppKit                              0x00007fffbfa56ebd -[NSThemeFrame addSubview:] + 109
	1   Spotify                             0x0000000108524c02 Spotify + 1461250
	2   Spotify                             0x0000000108524958 Spotify + 1460568
...
```

We can make an "application bundle" from scratch. Make any binary, like so:

```c
#include <unistd.h>
#include <stdio.h>
char log_line[] = "log line\n";
int main() {
	FILE * f = fopen("/tmp/log", "w");
	for (;;) {
		size_t num_written = fwrite(log_line, sizeof(log_line), 1, f);
		printf("num_written: %zu\n", num_written);
		int flush_result = fflush(f);
		sleep(1);
	}
	return 0;
}
```

Compile this and construct the application bundle directories:

```
$ mkdir -p Foo.app/Contents/MacOS
$ clang Foo.c -o Foo.app/Contents/MacOS/Foo
$ open Foo.app/ &
$ cat /tmp/log
log line
log line
log line
log line
```

It seems the expected path for the binary in `<Name>.app` is `/Contents/MacOS/<Name>`.
