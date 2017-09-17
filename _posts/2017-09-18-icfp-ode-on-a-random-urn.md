---
title: "ICFP: Ode on a Random Urn"
---

I visited [ICFP](http://www.icfpconference.org/) this month.
Most of it went over my head,
but [a talk with the title "Ode on a Random Urn"](https://icfp17.sigplan.org/event/haskellsymp-2017-papers-ode-on-a-random-urn-functional-pearl-) caught my interest,
and its content was the only technical insight I left with.
It was a presentation of [this paper of the same name](https://www.cis.upenn.edu/~llamp/pdf/urns.pdf).

The problem is how to represent a _discrete probability distribution_.
An example of a discrete probability distribution is
an urn/bag/bucket containing two red balls, four green balls, and three blue balls.
One way to represent this is:

```hs
urn :: [Color]
urn = [Blue, Blue, Red, Green, Green, Green, Red, Green, Blue]
```

Given an urn, we want to sample from it,
which means picking a ball at random.
We also want to add and remove balls from the list,
e.g. "add a new green ball", or "remove one blue ball".
Using the list representation above,
we can sample the urn by indexing randomly into the list,
we can add a ball to the urn by prepending them to the list,
and we can remove a ball from the urn by searching the list until we find one of the specified color.

If there can be lots of balls of the same color,
the above representation can be inefficient.
Instead we can group the balls by color
and just note how many we have of each:

```hs
urn :: [(Int, Color)]
urn = [(2, Red), (4, Green), (3, Blue)]
```

Both representations really start to suffer when we consider _sampling without replacement_.
This is where we select a ball from the urn, but don't put it back;
the distribution will be missing the ball on the next sample,
and eventually will become empty.
These list representations suffer because of the quadratic time of repeated list traversals.

The _urn_ representation is a binary tree
where the leaves are those colored groups
and each inner node keeps track of how many balls it has at its leaves.
So one tree might have the leaves `(2, Red)`, `(4, Green)`, and `(3, Blue)`.
This tree would have two inner nodes.
One might hold `(2, Red)` and `(4, Green)`, and keep its size `6`.
The root would keep its total size `7`.
The order of the nodes in the tree does not matter!

The urn representation helps because the tree is _balanced_.
Like most trees, it is mutated by _insertions_ and _deletions_,
and both of those operations maintain balance.
How?

The node positions in an infinite tree can enumerated like this:

```
    0
  1   2
 3 4 5 6
.........
```

We can maintain the invariant that a tree with _n_ nodes has them at positions 1.._n-1_.
Insertion of a new node places the node at position _n_.
This tree is balanced: all layers are full except for the bottom one.
Such a tree remains balanced, because the positions fill up in layers.
Deletion of any node works by _replacing_ the deleted node with the node at position _n-1_.
This works because order of nodes does not matter.

Actually, the urn algorithms don't do this.
In the urn, values are only stored at the leaves.
Insertions happen by _expanding_ a leaf into a branch with two new leaves.
Instead of ensuring that nodes are inserted in the order above,
we can ensure that they're _expanded_ in that order.
If there are 6 leaves in the tree,
expand node 6 to make room.
To delete a leaf from a tree with 7 leaves,
contract node 6,
copying one child into node 6, and the other over the deleted leaf.

Actually, the urn algorithms don't do this either.
They expand the nodes in the following order:

```
        1
    2       3
  4   6   5   7
 8 c a e 9 d b f
.................
```

This ordering is less visually obvious,
but it still works because it enumerates the nodes in layers.
The ordering of the nodes within each layer does affect balance;
there is only ever one non-full layer.

Why does the urn algorithm choose this strange enumeration of nodes?
Take the number in binary, reverse it, ignore the last bit,
then interpret `0` as _left_ and `1` and _right_.
This is the path to the node to expand!
The path to the latest node is given by the number of leaves in the tree.
By tracking the number of leaves in the tree,
the algorithm knows the path to insert/delete at.

There's one significant problem with the urn in my mind:
there's no efficient way to find a color group, given the color.
The blues could be at any leaf location, because they're arbitrarily ordered.
So when inserting a new blue ball,
the algorithm inserts a new group of `(1, Blue)`
instead of finding the existing group and adding `1` to its size.
This can lead to a much bigger tree than necessary.
