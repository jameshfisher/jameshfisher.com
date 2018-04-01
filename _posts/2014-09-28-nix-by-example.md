---
title: "Nix by example, Part 1: The Nix expression language"
external_url: "https://medium.com/@MrJamesFisher/nix-by-example-a0063a1a4c55"
---

Nix is a package manager.
‘Nix’ is also the name of the programming language that it uses.
The language can actually be used independently,
without any package management at all.
Here I show the Nix expression language by example.
My approach is to introduce expanding subsets of the language:
at any point you can stop reading
and have a full understanding of the subset introduced up to that point.
