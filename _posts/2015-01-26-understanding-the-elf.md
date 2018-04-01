---
title: "Understanding the ELF"
external_url: "https://medium.com/@MrJamesFisher/understanding-the-elf-4bd60daac571"
---

I wrote an ELF binary which, when run, prints itself on standard output.
It doesn’t "cheat" by reading its own file.
Instead, it uses how ELF binary files are loaded into memory.
To explain how the program works, I’ll show you it byte-by-byte.
Along the way, we’ll learn about files, programs, the ELF format, and tools for working with these things.
