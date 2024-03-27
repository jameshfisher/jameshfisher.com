---
title: Is there a route between these two nodes in this directed graph?
tags:
  - ctci
  - programming
  - haskell
---

Question 4.2 of _Cracking the Coding Interview_:

> Given a directed graph, 
> design an algorithm to find out whether 
> there is a route between two nodes.

Given any node in the graph,
we can generate a full list of nodes reachable from that node,
by exploring the graph from that node outwards.
We can then determine whether a route exists from node `n1` to node `n2`
by generating the full list of nodes reachable from `n1`,
and asking whether `n2` is in that list.

To generate the "reachable set" from a node,
we partition the graph into three sets:
`explored` nodes, `boundary` nodes, and the rest.
We repeatedly look for new nodes 
by looking at outgoing edges from nodes in the `boundary` set.
When we've looked at all the outgoing edges of a node,
we move that node to `explored` so we don't look at its edges again.
Eventually, our `boundary` set becomes empty,
there are no new nodes to explore,
and the `explored` set is all the reachable nodes.

Here's an implementation in Haskell:

```haskell
{% include "ctci/4_2.hs" %}
```

One optimization could be to stop as soon as we find `n2` while exploring.
Another optimization could be to expand from `n1` and `n2` concurrently
(exploring edges in the reverse direction from `n2`),
and stopping as soon as the explored sets overlap.
