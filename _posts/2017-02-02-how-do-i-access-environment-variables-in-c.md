---
title: How do I access environment variables in C?
tags:
  - environment-variables
  - c
  - programming
  - posix
taggedAt: '2024-03-26'
---

Environment variables are in the global variable `environ`. This points to an array of pointers to strings. To access the variable, we declare it with `extern`. We can then iterate over it like a normal array.

```c
#include <stdio.h>
extern char** environ;
int main(void) {
  for (size_t i = 0; environ[i] != NULL; i++) {
    printf("%s\n", environ[i]);
  }
  return 0;
}
```

This prints some interesting entries:

```
% ./a.out
TERM_SESSION_ID=w2t0p0:383E38D0-AD02-44CC-8549-291D5A58E4B2
SSH_AUTH_SOCK=/private/tmp/com.apple.launchd.Wl0phK4Ypi/Listeners
Apple_PubSub_Socket_Render=/private/tmp/com.apple.launchd.MBf7K7qlp1/Render
COLORFGBG=0;15
ITERM_PROFILE=Default
XPC_FLAGS=0x0
LANG=en_GB.UTF-8
PWD=/Users/jhf/dev/tmp/environ
SHELL=/bin/zsh
SECURITYSESSIONID=186a7
TERM_PROGRAM_VERSION=3.0.13
TERM_PROGRAM=iTerm.app
PATH=/Users/jhf/.opam/system/bin:/Users/jhf/Library/Python/2.7/bin:/Users/jhf/Library/Android/sdk/platform-tools:/Users/jhf/Library/Android/sdk/tools:/Users/jhf/go/bin:/Users/jhf/bin/Nim/bin:/Users/jhf/bin/depot_tools:/Users/jhf/.local/bin:/Users/jhf/Library/Haskell/bin:/Users/jhf/bin:/Users/jhf/.rbenv/shims:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
DISPLAY=/private/tmp/com.apple.launchd.XUm95WeFlF/org.macosforge.xquartz:0
COMMAND_MODE=unix2003
TERM=xterm-256color
HOME=/Users/jhf
TMPDIR=/var/folders/cl/wwjnrg0x34n20fcz0wp4c1sh0000gn/T/
USER=jhf
XPC_SERVICE_NAME=0
LOGNAME=jhf
__CF_USER_TEXT_ENCODING=0x1F5:0x0:0x2
ITERM_SESSION_ID=w2t0p0:383E38D0-AD02-44CC-8549-291D5A58E4B2
SHLVL=1
OLDPWD=/Users/jhf/dev/tmp
ZSH=/Users/jhf/.oh-my-zsh
GOPATH=/Users/jhf/go
PAGER=less
LESS=-R
LC_CTYPE=en_GB.UTF-8
LSCOLORS=Gxfxcxdxbxegedabagacad
OCAML_TOPLEVEL_PATH=/Users/jhf/.opam/system/lib/toplevel
PERL5LIB=/Users/jhf/.opam/system/lib/perl5:
MANPATH=:/Users/jhf/.opam/system/man
OPAMUTF8MSGS=1
CAML_LD_LIBRARY_PATH=/Users/jhf/.opam/system/lib/stublibs:/usr/local/lib/ocaml/stublibs
_=/Users/jhf/dev/tmp/environ/./a.out
```
