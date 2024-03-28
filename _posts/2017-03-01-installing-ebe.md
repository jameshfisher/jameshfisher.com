---
title: Installing and running `ebe`
justification: >-
  I'm working through Ray Sefarth's assembly book. It heavily uses his program,
  `ebe`.
tags:
  - ebe
  - gcc
  - gdb
  - assembly
  - c
  - programming
taggedAt: '2024-03-26'
summary: >-
  Install `ebe` assembler with a one-liner, but be wary of the SourceForge
  installation script.
---

The `ebe` program is installable with:

```bash
bash <(curl -s https://netix.dl.sourceforge.net/project/qtebe/Installer/install_ebe.sh)
```

(Unfortunately, `ebe` is hosted on SourceForge. If you haven't been there recently: it's a cesspool of adverts. Would be cool if it moved to GitHub.)

During installation, the script prompts for a password:

```
Signing the certificate for gdb

---------
Password:
```

I'm not sure what this is about. I'll tackle it tomorrow.
