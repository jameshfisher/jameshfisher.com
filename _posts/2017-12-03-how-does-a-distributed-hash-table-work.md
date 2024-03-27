---
title: How does a distributed hash table work?
draft: true
tags: []
---

First, what is a hash table?
Usually, a hash table is an implementation of a _map_.
That is, a hash table maps _keys_ to _values_.
For example, a hash table _h_ might store the map
`{ "jim": "male", "alice": "female", "bob": "male" }`.
Maps provide an API, importantly including `update(k,v)` and `lookup(k)`.

However, unlike a normal hash table,
a distributed hash table does not really represent an arbitrary map.
Instead, it represents a _content-addressable set_,
meaning it provides this different API: `insert(v)`, and `lookup(h(v))`.
Notice that the API assumes a specific hash function `h`, such as SHA-256.

Unlike keys in a map, items in a content-addressable set are immutable;
the ordering of `insert` operations does not matter.
This greatly simplifies a distributed implementation,
where operations usually have a partial order.
Unlike mutable maps,
the results of `lookup` can be verified:
`h(lookup(h(k))) == h(k)`.
This too greatly simplifies a distributed implementation,
where the structure must be shared with untrusted parties.

The hash table implements these operations efficiently by
grouping keys into _buckets_ with an underlying _hash function_.
The hash table might have 8 buckets in memory, numbered 0 through 7,
and a hash function that says `hash("jim") = 3`, `hash("alice") = 3`, and `hash("bob") = 7`.
In other words, the hash function, applied to a key, tells us the key's approximate location in memory.
If the hash function gives a good estimate of the memory location,
and direct memory lookups are fast,
then lookups and insertions will be fast.

Notice I said "approximate" location, and "location estimate".
Hash functions have _collisions_, e.g. `"jim"` and `"alice"` both hash to bucket `3`.
There are many ways to deal with collisions.
For example, _open addressing_ says, 
"if bucket `3` is already full, try bucket `4`, then `5`, and so on".
Then when the table becomes "full", we do an expensive _hash table resize_,
moving every key to a new, bigger table.

Suppose our hash table must be accessible by many machines.
Our hash table is in the memory of one machine, which must serve all those requests.
At some point, we may not be able to buy a machine big enough to serve all requests,
or to store all that data.
And if this machine dies, the entire hash table dies with it.
We need more machines!
How do we put our hash table on those multiple machines?

One way is to clone our hash table, so that every machine has a copy.
When a node wishes to look up a value, it can look in its local copy.
When a machine wishes to insert a value at a key, it broadcasts this to all other nodes.
This scheme provides redundancy, 
and distributes lookups over all copies:
with _n_ nodes, each node processes 1/_n_ lookups.
But all nodes still store all data,
and all nodes still process all insert operations.

Worse, this scheme leads to inconsistencies,
because different nodes can process updates in different orders.
There are many ways to fix this, such as leader election and consensus algorithms.
But DHTs fix this.

To fix this, they can elect a "leader" machine.
To do an insert, it's sent to the leader,
and the leader then broadcasts the update to all other nodes.
This fixes inconsistency, but re-introduces centralization.
The leader node must be powerful enough to process all updates,
and if the leader node dies, who will continue the work?
A new leader must be "elected".
There are many ways to do this election,
but election is a topic for another day,
and it doesn't fix our two big problems:
reducing storage and operations per node.

To reduce storage per node, and number of operations per node,
each node must store a smaller _subset_ of the data.

For example, each key can be stored on _one_ node, instead of on all nodes.
This reduces each node's storage to 1/_n_, and its number of processed inserts to 1/_n_.
How do we determine a key's owner?
We use a hash function again,
but the hash function, instead of giving us the number of a bucket in memory,
gives us _machine addresses_.
For example, our hash could give us
`hash("jim") = "234.127.23.56"`, `hash("alice") = "244.32.167.165"`, and `hash("bob") = "23.45.231.12"`.
To look up the value for `"jim"`,
we don't do a memory lookup at bucket `3`;
we instead send the lookup request to the address `234.127.23.56`,
which then does the memory lookup and responds.
Under this scheme, with _n_ nodes,
each node stores 1/_n_ keys,
processes 1/_n_ lookups,
and processes 1/_n_ inserts.
Our hash table scales to the moon!
But this brings new problems.

Our hash can't really give us random IP addresses.
Most of those addresses won't be machines serving the hash table.
Instead, let's give each node the list of all nodes, e.g. `nodes = ["234.127.23.56", "244.32.167.165", "23.45.231.12"]`.
Then our hash can index into this list, modulo the number of nodes,
e.g. if `hash("jim") = 72452` then we go to node `nodes[72452 % 3] = "23.45.231.12"`.

By reducing storage per node, we have removed redundancy.
There is a fundamental tension between increased redundancy and reduced number of operations per node.
We must find a compromise.
Let's say instead of a key having a single owner,
each key is owned by two nodes.
For example,
we could store key _k_ on node `hash(k) % num_nodes` and on node `(hash(k)+1) % num_nodes`.
The work required by each node is now num_nodes/_n_,
but this is only a constant factor increase.

When an insert happens at key _k_,
this update must be sent to node `hash(k) % num_nodes` and to node `(hash(k)+1) % num_nodes`.
But now our inconsistency problem is back!
These owners of _k_ can receive updates in different orders.
To fix this, we can fall back to our leader/slave relationship.
Each key must have a defined leader to whom we send updates,
and two slaves which are issued updates from the leader.

But remember that a leader/slave relationship requires a re-election algorithm.
It's difficult to think about how re-election works per-key.

But this scheme does not help reduce memory consumption per machine.

* Which IP addresses are nodes in the DHT?
* Can we trust responses from other nodes?

Notice that if a node stores a key,
that node must process all updates for that key,
so each key demands both memory and CPU.
