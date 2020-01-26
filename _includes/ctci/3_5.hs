module TwoStackQueue where

import Test.QuickCheck

data Queue a = Queue {
  queueBack :: [a],  -- head is back of queue
  queueFront :: [a]  -- head is front of queue
}

emptyQueue :: Queue a
emptyQueue = Queue [] []

enqueue :: a -> Queue a -> Queue a
enqueue x q = q { queueBack = x:(queueBack q) }

dequeue :: Queue a -> Maybe (a, Queue a)
dequeue q = 
  case queueFront q of
    front:rest -> 
      Just (front, q { queueFront = rest })
    [] -> 
      case reverse (queueBack q) of
        front:rest -> 
          Just (front, Queue [] rest)
        [] -> Nothing


-----------------------------------------
----------------- TESTS -----------------

data Op = Enqueue Int | Dequeue deriving (Show)

instance Arbitrary Op where
  arbitrary = oneof [Enqueue <$> arbitrary, return Dequeue]

-- returns all elems dequeued when running all ops
runOps :: [Op] -> [Int]
runOps ops = snd $ foldl runOp (emptyQueue, []) ops where
  runOp :: (Queue Int, [Int]) -> Op -> (Queue Int, [Int])
  runOp (q,out) (Enqueue x) = (enqueue x q, out)
  runOp (q,out) Dequeue     = case dequeue q of
                                Just (x, q2) -> (q2, out++[x])
                                Nothing -> (q, out)

-- model is a plain list
runOpsModel :: [Op] -> [Int]
runOpsModel ops = snd $ foldl runOp ([],[]) ops where
  runOp :: ([Int], [Int]) -> Op -> ([Int], [Int])
  runOp (q,  out) (Enqueue x) = (x:q, out)
  runOp (q, out) Dequeue = case reverse q of
                            [] -> ([], out)
                            front:rest -> (reverse rest, out ++ [front])

prop_modelcheck :: [Op] -> Bool
prop_modelcheck ops = runOps ops == runOpsModel ops

main = quickCheck prop_modelcheck