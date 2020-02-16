---
title: "Why does this RNA virus look like DNA?"
tags: ["programming", "bioinformatics"]
---

The other day, [I was diffing coronaviruses]({% post_url 2020-02-09-diffing-coronaviruses %}):
taking long strings of `GCAT` characters that make up the COVID-19 genome,
and pairing them up with the `GCAT` characters of similar viruses.
I didn't realize it at the time,
but there's an oddity here.
Coronavirus is not made of DNA; it's made of RNA.
RNA looks like `GCAU`,
with `U`racil instead of `T`hymine.
But these files are full of `GCAT`, like DNA.
What was going on here?
Was the genome sequence lying to me, or does COVID-19 really contain DNA, rather than RNA?

The answer, it turned out, is that the sequence is a lie!
We must replace all `T`s with `U`s to get a faithful sequence of the coronavirus RNA.
So, why is it represented this way?

The reason is that 
this is a sequencing of DNA 
which was generated from the original RNA.
Apparently, nearly all RNA sequencing is done this away,
because tooling for DNA sequencing is cheaper and more mature,
and DNA is more stable than RNA.
This process uses a [reverse transcriptase](https://en.wikipedia.org/wiki/Reverse_transcriptase)
to convert the RNA to DNA.
More precisely,
this creates a [complementary DNA](https://en.wikipedia.org/wiki/Complementary_DNA),
or "cDNA".

_I was able to answer this [with the help of the Bioinformatics Stack Exchange](https://bioinformatics.stackexchange.com/questions/11353/why-does-the-fasta-sequence-for-coronavirus-look-like-dna-not-rna)._