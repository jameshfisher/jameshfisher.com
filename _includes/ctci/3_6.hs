module BubbleSortStacks where

import Test.QuickCheck
import qualified Data.List as List

bubbleSort :: Ord a => [a] -> [a]
bubbleSort xs = case bubble xs of
  (xs', True)  -> bubbleSort $ rev xs'
  (xs', False) -> rev xs'

bubble :: Ord a => [a] -> ([a], Bool)
bubble xs = go ([], xs, False) where
  go ([], back:backs, swapped) = go ([back], backs, swapped)
  go (fronts, [], swapped) = (fronts, swapped)
  go (front:fronts, back:backs, swapped)
    | front <= back = go (back:front:fronts, backs, swapped)
    | otherwise     = go (front:back:fronts, backs, True)

rev :: [a] -> [a]
rev xs = go xs [] where
  go (x:xs) ys = go xs (x:ys)
  go []     ys = ys

prop_modelcheck :: [Int] -> Bool
prop_modelcheck xs = bubbleSort xs == List.sort xs

main = quickCheck prop_modelcheck