module DirectedGraphRoute where

import qualified Data.Set as Set
import Data.Set (Set)

type Node = Int
type Edge = (Node,Node)
type Graph = Set Edge

isRoute :: Graph -> Node -> Node -> Bool
isRoute g n1 n2 = Set.member n2 $ reachableSet g n1

reachableSet :: Graph -> Node -> Set Node
reachableSet g n = go Set.empty (Set.singleton n) where
  go explored boundary
    | Set.null boundary = explored
    | otherwise = go newExplored $ Set.fromList [ t | 
                    (f,t) <- Set.toList g, 
                    Set.member f boundary, 
                    not (Set.member t newExplored)
                  ]
                  where newExplored = Set.union explored boundary
