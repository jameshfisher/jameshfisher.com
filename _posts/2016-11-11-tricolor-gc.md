---
title: How does tricolor garbage collection work?
tags:
  - golang
  - garbage-collection
  - tricolor-algorithm
  - computer-science
  - concurrency
  - programming
taggedAt: '2024-03-26'
---

Golang's garbage collector uses a "tricolor" algorithm. This means it divides the heap objects into three sets: black, white, and grey. Initially, all objects are white, and as the algorithm proceeds, objects are moved into the grey and then black sets, in such a way that eventually the orphaned (collectible) objects are left in the white set, which is then cleared. An important property of this algorithm is that it can run concurrently with the "mutator" (program).

The meaning of the three sets is this:

* Black/grey sets: Definitely accessible from the roots (not candidates for collection).

  * Black set: Definitely no pointers to any objects in the white set.
  * Grey set: Might have pointers to the white set.

* White set: Possibly accessible from the roots. Candidates for collection.

The important invariant is the "tricolor" invariant: no pointers go directly from the black set to the white set. It is this invariant which lets us eventually clear the white set.
