---
title: "Diffing coronaviruses"
tags: ["programming", "bioinformatics"]
---

We can use standard UNIX tools
to investigate the origins of the Wuhan coronavirus!
I read on Wikipedia that
"2019-nCoV has been reported to have a genome sequence 75% to 80% identical to the SARS-CoV
and to have more similarities to several bat coronaviruses."
We can use `diff` to see those similarities:

```
$ ./genome_diff MG772933.1 MN988713.1
MG772933.1: 29802 words  26618 89% common  861 3% deleted  2323 8% changed
MN988713.1: 29874 words  26618 89% common  896 3% inserted  2360 8% changed
```

This says that there's an 89% similarity 
between bat CoV (MG772933.1) 
and human nCoV (MN988713.1).
More precisely,
they share a subsequence of 26618 bases,
in a total genome of only ~29800 bases.

That `genome_diff` script looks like this:

```bash
{% include ncov/genome_diff %}
```

This script works by fetching the genome from [the NCBI database](https://www.ncbi.nlm.nih.gov/).
The strings "MG772933.1" and "MN988713.1" are [accession numbers](https://en.wikipedia.org/wiki/Accession_number_(bioinformatics)).
The text at `https://www.ncbi.nlm.nih.gov/sviewer/viewer.cgi?report=fasta&id=MN988713.1`
is 2019-nCoV's RNA sequence in FASTA format, which looks like:

```
$ curl -s 'https://www.ncbi.nlm.nih.gov/sviewer/viewer.cgi?report=fasta&id=MN988713.1'
>MN988713.1 Wuhan seafood market pneumonia virus isolate 2019-nCoV/USA-IL1/2020, complete genome
ATTAAAGGTTTATACCTTCCCAGGTAACAAACCAACCAACTTTCGATCTCTTGTAGATCTGTTCTCTAAA
CGAACTTTAAAATCTGTGTGGCTGTCACTCGGCTGCATGCTTAGTGCACTCACGCAGTATAATTAATAAC
TAATTACTGTCGTTGACAGGACACGAGTAACTCGTCTATCTTCTGCAGGCTGCTTACGGTTTCGTCCGTG
TTGCAGCCGATCATCAGCACATCTAGGTTTCGTCCGGGTGTGACCGAAAGGTAAGATGGAGAGCCTTGTC
...
```

The FASTA format needs a bit of "massaging" before we can `diff` it.
The first line, starting with `>`, describes the sequence that follows.
We don't need this metadata, so we strip it with `grep -v '^>'`.
Next, we don't need those newline characters,
so we strip them with `tr -d -C 'ATGC'`.
Finally, 
because `diff` doesn't work at the "character" level,
we'll instead use `wdiff`,
but first separating the characters into separate words using `sed 's/\(.\)/\1 /g'`.
This gives us genomes that look like `A T A T T A G G ...`.

Finally, we can call `wdiff -s -123` on these genomes,
which gives us some statistics about their similarity.
If we omit `-s -123`,
we get the actual base differences between the sequences:

```diff
A T [-A T-] T A {+A A+} G G T T T [-T-] {+A+} T A C C
...
```

A different way to see similarities is to use [NCBI's BLAST tool](https://blast.ncbi.nlm.nih.gov/Blast.cgi).
Enter the accession number `MN988713.1`,
and you'll get a list of other sequences,
ranked by "percent identity".
The most similar are several recent sequences of 2019-nCoV,
followed by the "Bat SARS-like coronavirus",
followed by many SARS coronavirus sequences.
