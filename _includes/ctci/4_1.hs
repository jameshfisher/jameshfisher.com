module BalancedTree where

import qualified Data.Maybe

data Tree = Leaf | Branch Tree Tree

isBalanced :: Tree -> Bool
isBalanced = Data.Maybe.isJust . isBalancedWithHeight

isBalancedWithHeight :: Tree -> Maybe Int
isBalancedWithHeight Leaf = Just 0
isBalancedWithHeight (Branch l r) = do
  lh <- isBalancedWithHeight l
  rh <- isBalancedWithHeight r
  if diff lh rh <= 1
    then Just $ max lh rh + 1
    else Nothing

diff n m = abs (n-m)

main :: IO ()
main = print $ all id [
    isBalanced Leaf,
    isBalanced (Branch Leaf Leaf),
    isBalanced (Branch (Branch Leaf Leaf) Leaf),
    not $ isBalanced (Branch Leaf (Branch Leaf (Branch Leaf Leaf)))
  ]
