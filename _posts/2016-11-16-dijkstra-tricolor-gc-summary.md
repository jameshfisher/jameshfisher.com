---
title: 'A summary of ''On-the-Fly Garbage Collection: An Exercise in Cooperation'''
tags:
  - garbage-collection
  - computer-science
taggedAt: '2024-03-26'
---

A summary of: http://research.microsoft.com/en-us/um/people/lamport/pubs/garbage.pdf

Describes how garbage detection and collection can be performed by a concurrent process.

Attempts to "keep exclusion and synchronization constraints between the process as weak as possible"

Illustrated for Lisp

Their graph has a fixed number of nodes, and each node has at post two outgoing edges ("left" and "right")

Reachable nodes are "the data structure", the rest are "garbage"

The operations on the graph (oddly) allow for garbage nodes to become reachable again. How is this possible? How does the program get the garbage node's address? Specifically we allow:

1. Changing pointer to another reachable object.
2. Changing pointer to a not-yet-reachable object.
3. Adding pointer towards a reachable object.
4. Adding pointer towards a not-yet-reachable object.
5. Removing an edge.

The GC maintains a "free list" - nodes that have been identified as garbage, i.e. free to be reused

The process takes objects from the free list when "allocating"

The traditional GC implementation is that, when the free list becomes empty, the program pauses and a GC cycle runs

This paper describes an implementation that lets the GC run concurrently to the computation proper

The implementation has a "marking phase" followed by an "appending phase"

The implementation ensures that garbage existing at the beginning of an appending phase will be appended in the next cycle

Atomic operations are denoted with angle brackets <something atomic>

"Program A is finer-grained than program B" means that A and B are semantically the same but splits some atomic operations in B into smaller parts

Finer-grained programs allow more concurrency but are harder to reason about

The aim here is for a fine-grained concurrent GC algo

NIL is represented as an object; its two outgoing edges point to itself. This lets us model removal of an edge as just a special case of changing the edge - there are now no nil pointers. So we now have

1. Changing pointer to another reachable object.

   3. "Adding pointer towards a reachable object" is just changing a pointer from NIL to the new object.
   5. "Removing an edge" is just changing the pointer to point to NIL.

2. Changing pointer to a not-yet-reachable object.

   4. "Adding pointer towards a not-yet-reachable object" is just changing the pointer from NIL.

i.e. there are now just

1. Changing pointer to another reachable object.
2. Changing pointer to a not-yet-reachable object.

We are also able to remove case 2 by considering the free list as part of the data structure. We introduce _special root nodes_ such that their reachable set is only NIL and the free list.

Thus the mutator can now only do one thing: change a pointer to another reachable object.

We now have a slight improvement on the classic GC implementation, in which there are three kinds of atomic action:

* Mutator changes a pointer (quick).
* Collector marks all reachable objects (slow).
* Collector appends all eachable objects, i.e. moves unmarked nodes to the free list and removes all markings (slow).

The mutator has to mark objects in some way when it changes pointers. Otherwise, the mutator can trick the collector into not finding an accessible object, causing the object to incorrectly be put on the free list.

We describe node markings in terms of colors. All nodes initially "white". All reachable nodes will eventually become black. Thus, nodes which are still white after marking will be garbage. For this process, we have an invariant and a variant.

For the variant, we say that "no node becomes lighter", i.e. goes from black to white or from grey to white.

For the invariant, we say that "no black node points to a white node".

When the mutator changes a black node to point to a white node, we must fix it up. We do this by coloring the pointed-at object grey. This satisfies the variant and the invariant.

When the mutator does `a.b = &c`, if `c` is white, it colors c grey. For simplicity, it does not look at the color of `a`. But note that it cannot simply color c grey unconditionally - c could be black. If c is grey or black, it leaves the color alone.

TBC on page 970
