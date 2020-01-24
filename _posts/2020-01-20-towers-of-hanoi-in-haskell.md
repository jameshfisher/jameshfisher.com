---
title: "Towers of Hanoi in Haskell"
tags: ["ctci", "programming", "c"]
---

Question 3.4 of _Cracking the Coding Interview_:

> In the classic problem of the Towers of Hanoi, 
> you have 3 towers and N disks of different sizes 
> which can slide onto any tower. 
> The puzzle starts with disks sorted 
> in ascending order of size from top to bottom 
> (i.e., each disk sits on top of an even larger one). 
> You have the following constraints:
> 
> 1. Only one disk can be moved at a time.
> 2. A disk is slid off the top of one tower onto  the next tower.
> 3. A disk can only be placed on top of a larger disk.
> 
> Write a program to move the disks from the first tower to the last using stacks.

There's a classic recursive solution:
move the top (N-1) disks to the spare tower,
then move the large bottom disk to the target tower,
then finally move those (N-1) disk from the spare tower to the target tower.

Here's a solution in Haskell:

```hs
{% include ctci/3_4.hs %}
```