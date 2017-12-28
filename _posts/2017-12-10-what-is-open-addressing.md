---
title: "What is open addressing?"
---

Hash tables must deal with hash collisions.
If "foo" and "bar" both hash to bucket 4,
we must do something to store those distinct values in distinct locations.
Hash tables mainly differ in how they deal with collisions.
There are two main approaches: "closed addressing" and "open addressing".

Closed addressing is the traditional approach,
which solves collisions by allowing more than one element in each bucket.
One way to do closed addressing is "chaining",
where each bucket stores a linked list of elements in that bucket.

The other approach, "open addressing",
only allows one element in each bucket,
but allows an element to be stored in one of many possible buckets,
so a collision can be resolved by trying another bucket.

Closed addressing requires pointer chasing to find elements,
because the buckets are variably-sized.
In contrast, open addressing can maintain one big contiguous hash table.
This can improve cache performance and make the implementation simpler.

In this post, I implement a hash table using open addressing.
The hash table can store a set of integers.
Here's the structure:

```c
typedef int elem_t;

struct Set {
  elem_t * buckets;    // One big array
  size_t num_buckets;  // Size of the array
  size_t num_elems;    // How many buckets are filled?
};
```

Actually, this hash table can't quite store `int` values.
It needs a way to distinguish a full bucket from an empty bucket.
For this, we sacrifice one integer to represent an empty bucket:

```c
#define NO_ELEM INT_MIN
```

The hash table has a small API demonstrating its set-like behavior:

```c
struct Set * Set_new(size_t num_buckets);
bool Set_contains(struct Set *, elem_t elem);
void Set_add(     struct Set *, elem_t elem);
void Set_del(     struct Set *, elem_t elem);

int main(void) {
  struct Set * s = Set_new(4);
  Set_add(s, 3);
  Set_add(s, 42);
  Set_del(s, 3);
  Set_add(s, 0);
  return 0;
}
```

After the additions and deletions in main,
what are the values in the set `s`?
<span class="answer">42 and 0. The value 3 was added then deleted again.</span>

A hash table using closed addressing
can store an unlimited number of elements,
because each bucket can store an unlimited number of elements.
(It'll pay a performance price, though.)
In contrast, how many elements can the above hash table store?
<span class="answer">Up to `num_buckets`. Beyond that, it will need to resize!</span>

A hash table needs a hash function.
This is not important here,
but I'm told this hash function is reasonable:

```c
size_t hash(elem_t x) {
    x = ((x >> 16) ^ x) * 0x45d9f3b;
    x = ((x >> 16) ^ x) * 0x45d9f3b;
    x = (x >> 16) ^ x;
    return x;
}
```

To create a new hash table,
we allocate a new array
and initialize each bucket to `NO_ELEM`:

```c
struct Set * Set_new(size_t num_buckets) {
  struct Set * s = malloc(sizeof(struct Set));
  s->num_buckets = num_buckets;
  s->num_elems = 0;
  s->buckets = malloc(num_buckets * sizeof(s->buckets[0]));
  for (size_t i = 0; i < num_buckets; i++) s->buckets[i] = NO_ELEM;
  return s;
}
```

With open addressing, the hash function defines an element's "preferred bucket".
If the preferred bucket is full, we must try other ones.
There are many ways to define the next bucket to try,
but a simple one is "linear probing".
Linear probing scans every bucket starting at the preferred bucket.
To add a new element to the set,
we follow the "probe sequence"
until we find an empty bucket,
or we find the element we're searching for.

```c
void Set_add(struct Set * s, elem_t new_elem) {
  if (new_elem == NO_ELEM) return;
  size_t start_ix = hash(new_elem) % s->num_buckets;
  for (size_t probe = 0; probe < s->num_buckets; probe++) {
    size_t ix = (start_ix+probe) % s->num_buckets;
    elem_t elem = s->buckets[ix];
    if (elem == NO_ELEM) {
      s->buckets[ix] = new_elem;
      s->num_elems++;
      if (0.7 < ((double)s->num_elems / s->num_buckets)) Set_expand(s);
      return;
    } else if (elem == new_elem) {
      return;
    }
  }
}
```

To expand the table,
we make a new array double the size of the old one,
then rehash every element.
We can do this by creating a new set and adding all elements to it:

```c
void Set_expand(struct Set * s) {
  struct Set * ns = Set_new(s->num_buckets * 2);
  for (size_t i = 0; i < s->num_buckets; i++) Set_add(ns, s->buckets[i]);
  free(s->buckets);
  s->num_buckets = ns->num_buckets;
  s->num_elems = ns->num_elems;
  s->buckets = ns->buckets;
  free(ns);
}
```

The probe sequence affects every function: `contains`, `add` and `del`.
See how `Set_contains` follows the same probe sequence:

```c
bool Set_contains(struct Set * s, elem_t needle) {
  if (needle == NO_ELEM) return false;
  size_t start_ix = hash(needle) % s->num_buckets;
  for (size_t probe = 0; probe < s->num_buckets; probe++)
    if (s->buckets[(start_ix+probe) % s->num_buckets] == needle)
      return true;
  return false;
}
```

`Set_contains` could probe every bucket before it gives up.
To avoid this, we ensure that the table doesn't get too full.
A particularly important line in `Set_add` calls `Set_expand`
if more than 70% of buckets are full.

There's an optimization we _could_ have made in `Set_contains`:
if we find an empty bucket,
stop and `return false`,
because `Set_add` would have filled this bucket if the element existed.
However, `Set_del` breaks this assumption.

```c
void Set_del(struct Set * s, elem_t del_elem) {
  if (del_elem == NO_ELEM) return;
  size_t start_ix = hash(del_elem) % s->num_buckets;
  for (size_t probe = 0; probe < s->num_buckets; probe++) {
    size_t ix = (start_ix+probe) % s->num_buckets;
    elem_t elem = s->buckets[ix];
    if (elem == del_elem) {
      s->buckets[ix] = NO_ELEM;
      s->num_elems--;
      return;
    }
  }
}
```

This hash table implementation was somewhat simpler than traditional chaining,
at around 80 LOC.
