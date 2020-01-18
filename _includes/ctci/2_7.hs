module Palindrome where

palindrome :: Eq a => [a] -> Bool
palindrome xs = go xs xs [] where
  go (slow:slows) (fast1:fast2:fasts) rev = go slows fasts (slow:rev)
  go (slow:slows)  [_]                rev = slows == rev
  go slows         fasts              rev = slows == rev

main = print $
    palindrome ([] :: [Int]) && 
    palindrome ([1] :: [Int]) && 
    palindrome ([1,1] :: [Int]) && 
    not (palindrome ([1,2] :: [Int])) && 
    palindrome ([1,2,1] :: [Int]) && 
    not (palindrome ([1,2,2] :: [Int])) && 
    palindrome ([1,2,2,1] :: [Int]) && 
    not (palindrome ([1,2,3,2] :: [Int])) && 
    palindrome ([1,2,3,2,1] :: [Int]) && 
    not (palindrome ([1,2,3,2,2] :: [Int]))
