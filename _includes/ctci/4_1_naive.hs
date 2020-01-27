module BalancedTree where
  
import qualified Data.Maybe

data Tree = Leaf | Branch Tree Tree

isBalanced :: Tree -> Bool
isBalanced Leaf = True
isBalanced (Branch l r) = 
  isBalanced l && isBalanced r && diff (height l) (height r) <= 1

height :: Tree -> Int
height Leaf = 0
height (Branch l r) = max (height l) (height r) + 1

diff n m = abs (n-m)
