---
title: "How does command-line tab completion work?"
draft: true
---

I've written a `diary` CLI program which
lets me `write` a new entry
or `read` an old entry.
Here's a simplified implementation:

```bash
#!/bin/bash
function usage {
  echo "usage: $(basename ${0}) write"
  echo "       $(basename ${0}) read <timestamp>"
  exit 1
}
case "${1}" in
  write )
    mkdir -p ~/diary
    nano ~/diary/"$(date '+%Y-%m-%d')"
    ;;
  read )
    if [ "${2}" = "" ]; then
      usage
    fi
    cat ~/diary/"${2}"
    ;;
  * )
    usage
    ;;
esac
```

This program prints its "usage" if the user gets it wrong:

```
$ mydiary
usage: mydiary write
       mydiary read <timestamp>
$ mydiary write
[nano opens for editing]
$ mydiary read
usage: mydiary write
       mydiary read <timestamp>
$ mydiary read 2018-01-14
Today I ate a crisp sandwich
```

But we can do better!
With tab-completion,
the user can see the possible commands without running them,
and can complete the names of diary entries without typing them out fully.
