---
title: Diffing coronaviruses
tags:
  - programming
  - bioinformatics
hnUrl: 'https://news.ycombinator.com/item?id=22282458'
hnUpvotes: 119
---

We can use standard UNIX tools
to investigate the origins of the Wuhan coronavirus!
I read on Wikipedia that
"2019-nCoV has been reported to have a genome sequence 75% to 80% identical to the SARS-CoV
and to have more similarities to several bat coronaviruses."
We can use `diff` to see those similarities:

```
$ ./genome_diff MG772933.1 MN988713.1
MG772933.1: 29802 words  26618 89% common  856 3% deleted  2328 8% changed
MN988713.1: 29882 words  26618 89% common  897 3% inserted  2367 8% changed
```

This says that there's an 89% similarity 
between bat CoV (MG772933.1) 
and human nCoV (MN988713.1).
More precisely,
they share a subsequence of 26618 bases,
in a total genome of only ~29800 bases.

That `genome_diff` script looks like this:

```bash
{% include "ncov/genome_diff" %}
```

This script works by fetching the genome from [the NCBI database](https://www.ncbi.nlm.nih.gov/).
The strings "MG772933.1" and "MN988713.1" are [accession numbers](https://en.wikipedia.org/wiki/Accession_number_(bioinformatics)).
The API returns the RNA sequence in FASTA format, 
which looks like:

```
$ curl -s 'https://www.ncbi.nlm.nih.gov/sviewer/viewer.cgi?report=fasta&id=MN988713.1'
>MN988713.1 Wuhan seafood market pneumonia virus isolate 2019-nCoV/USA-IL1/2020, complete genome
ATTAAAGGTTTATACCTTCCCAGGTAACAAACCAACCAACTTTCGATCTCTTGTAGATCTGTTCTCTAAA
CGAACTTTAAAATCTGTGTGGCTGTCACTCGGCTGCATGCTTAGTGCACTCACGCAGTATAATTAATAAC
TAATTACTGTCGTTGACAGGACACGAGTAACTCGTCTATCTTCTGCAGGCTGCTTACGGTTTCGTCCGTG
TTGCAGCCGATCATCAGCACATCTAGGTTTCGTCCGGGTGTGACCGAAAGGTAAGATGGAGAGCCTTGTC
...
```

The FASTA format needs some "massaging" before we can `diff` it.
The first line, starting with `>`, describes the sequence that follows.
We don't need this metadata, so we strip it with `grep -v '^>'`.
Next, we don't need those newline characters,
so we strip them with `tr -d '\n'`.
Finally, 
because `diff` works on lines rather than characters,
we'll instead use `wdiff`,
after separating the characters into separate words using `sed 's/\(.\)/\1 /g'`.
This gives us genomes that look like `A T A T T A G G ...`.

Finally, we can call `wdiff -s -123` on these genomes,
which gives us some statistics about their similarity.
If we omit `-s -123`,
we get the actual base differences between the sequences.
For example, check out the end of the sequences:

```
$ ./genome_diff MG772933.1 MN988713.1 | fold | tail -2
[-A A C C A C-] T [-C G A C A-] {+T+} A G {+G+} A {+G+} A A {+T G+} A [-A A A A
A A A A A A-] {+C+} A A A A A A A A A A A A
```

We can see that the sequences both have a long sequence of `A`s at the end,
but the Bat CoV's tail is significantly longer.
This is known as a ["poly(A) tail"](https://en.wikipedia.org/wiki/Polyadenylation).

A different way to see similarities is to use [NCBI's BLAST tool](https://blast.ncbi.nlm.nih.gov/Blast.cgi).
Enter the accession number `MN988713.1`,
and you'll get a list of other sequences,
ranked by "percent identity".
The most similar are several recent sequences of 2019-nCoV,
followed by the "Bat SARS-like coronavirus",
followed by many SARS coronavirus sequences.

_Correction 2020-02-11:_
My script used  `tr -d -C 'ATGC'`
to strip newlines,
but it should use `tr -d '\n'`.
It's important, because 
the full set of FASTA characters in this file
also includes `S`, `W`, and `Y`!
For the meaning of these,
see [FASTA format](https://en.wikipedia.org/wiki/FASTA_format#Sequence_representation).
