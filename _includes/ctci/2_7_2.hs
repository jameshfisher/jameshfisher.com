module Runner where

middle :: [a] -> Maybe a
middle xs = g xs xs where
  g (slow:slows) (fast1:fast2:fasts) = g slows fasts
  g slows [_] = Just $ head slows
  g _ _ = Nothing

main = print $
    middle ([] :: [Int]) == Nothing && 
    middle [1] == Just 1 &&
    middle [1,2] == Nothing &&
    middle [1,2,3] == Just 2 &&
    middle [1,2,3,4] == Nothing &&
    middle [1,2,3,4,5] == Just 3
