---
title: How is the Redis sorted set implemented?
tags:
  - programming
summary: >-
  Redis sorted sets are implemented using a hash table for efficient key-value
  lookups and a skip list for efficient score-based ordering. I show a Haskell
  implementation that uses a forward map for keys and a reverse map for scores.
---

[Redis provides a data structure called "sorted sets"](https://redis.io/topics/data-types#sorted-sets)
which are,

> ... similarly to Redis Sets, non repeating collections of Strings.
> The difference is that every member of a Sorted Set is associated with a score,
> that is used in order to take the sorted set ordered,
> from the smallest to the greatest score.
> While members are unique, scores may be repeated.

I was curious what data structure Redis sorted sets used,
since they allow efficient ordering of the set members on two different orderings:
lexicographically, and by associated score.

[Looking at the source](https://github.com/antirez/redis/blob/unstable/src/t_zset.c),
we find that there is no fundamentally new data structure;
only two old ones: a hash table and a skip list.

> ZSETs are ordered sets using two data structures to hold the same elements
> in order to get O(log(N)) INSERT and REMOVE operations into a sorted
> data structure.
> The elements are added to a hash table mapping Redis objects to scores.
> At the same time the elements are added to a skip list mapping scores
> to Redis objects (so objects are sorted by scores in this "view").

In Redis, the keys are strings and the values are integers,
but this "sorted set" abstraction can be generalized
to any key and value types with orderings.
In Haskell, we can implement:

```haskell
-- Constructors
zempty :: ZSet k v
zadd   :: (Ord k, Ord v) => k -> v -> ZSet k v -> ZSet k v
zrem   :: (Ord k, Ord v) => k      -> ZSet k v -> ZSet k v

-- The two orderings
zrangebylex   :: ZSet k v -> [(k, v)]  -- retrieve ordered by k
zrangebyscore :: ZSet k v -> [(k, v)]  -- retrieve ordered by v
```

The implementation works by maintaining the ordinary forward map, `Map k v`,
plus a reverse map, `Map v (Set k)`.
In Redis, the forward map is a hash table,
and the reverse map is a skip list.
In Haskell, here's the implementation:

```
data ZSet k v = ZSet {
  scores  :: Map k v,
  byScore :: Map v (Set k)
} deriving (Show)

type MultiMap k v = Map.Map k (Set v)

zempty :: ZSet k v
zempty = ZSet Map.empty Map.empty

zadd :: (Ord k, Ord v) => k -> v -> ZSet k v -> ZSet k v
zadd x newScore z = ZSet (Map.insert x newScore (scores z)) newByScore where
  newByScore = Map.alter (Just . maybe (Set.singleton x) (Set.insert x)) newScore oldScoreRemoved
  oldScoreRemoved = maybe (byScore z) (\oldScore -> multiMapDelete oldScore x (byScore z)) (Map.lookup x (scores z))

zrem :: (Ord k, Ord v) => k -> ZSet k v -> ZSet k v
zrem x z = case Map.lookup x (scores z) of
  Nothing -> z
  Just oldScore -> ZSet (Map.delete x (scores z)) (multiMapDelete oldScore x (byScore z))

zrangebylex :: ZSet k v -> [(k, v)]
zrangebylex z = Map.toAscList $ scores z

zrangebyscore :: ZSet k v -> [(k, v)]
zrangebyscore = concatMap flattenScore . Map.toAscList . byScore where
  flattenScore (score, xs) = Prelude.map (\x -> (x, score)) $ Set.toAscList xs

multiMapDelete :: (Ord k, Ord v) => k -> v -> Map k (Set v) -> Map k (Set v)
multiMapDelete k v m = Map.alter f k m where
  f Nothing = Nothing
  f (Just vs) = let vs' = Set.delete v vs
                in if Set.null vs' then Nothing else Just vs'
```
